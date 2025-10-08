const webpush = require('web-push');
const nodemailer = require('nodemailer');
const PushSubscription = require('../models/PushSubscription');
const Vehicle = require('../models/Vehicle');
const HomeRent = require('../models/HomeRent');
const Electricity = require('../models/Electricity');

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Configure Email (optional)
let transporter = null;
const isEmailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

if (isEmailConfigured) {
  try {
    transporter = nodemailer.createTransport({
      // Prefer well-known service if provided, else allow host/port configuration
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
      secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : undefined,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    transporter.verify((error) => {
      if (error) {
        console.error('❌ Email configuration error:', error);
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });
  } catch (err) {
    console.error('❌ Failed to initialize email transporter:', err);
  }
} else {
  console.log('ℹ️ Email not configured. Set EMAIL_USER and EMAIL_PASS to enable email notifications.');
}

class NotificationService {
  // Calculate days until expiration
  getDaysUntilExpiration(dateString) {
    if (!dateString) return null;
    const expiryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if item needs notification (10 days before expiration)
  shouldNotify(daysUntil) {
    const threshold = parseInt(process.env.NOTIFICATION_DAYS_BEFORE) || 10;
    return daysUntil !== null && daysUntil <= threshold && daysUntil >= 0;
  }

  // Get all items that need notifications
  async getItemsNeedingNotification() {
    const notifications = [];

    try {
      // Check Vehicles
      const vehicles = await Vehicle.find({});
      for (const vehicle of vehicles) {
        const licenseDays = this.getDaysUntilExpiration(vehicle.licenseExpiryDate);
        const inspectionDays = this.getDaysUntilExpiration(vehicle.inspectionExpiryDate);

        if (this.shouldNotify(licenseDays)) {
          notifications.push({
            type: 'vehicle',
            subType: 'license',
            item: vehicle,
            daysUntil: licenseDays,
            title: '🚗 Vehicle License Expiring Soon',
            message: `Vehicle ${vehicle.plateNumber} license expires in ${licenseDays} days (${vehicle.licenseExpiryDate})`
          });
        }

        if (this.shouldNotify(inspectionDays)) {
          notifications.push({
            type: 'vehicle',
            subType: 'inspection',
            item: vehicle,
            daysUntil: inspectionDays,
            title: '🔧 Vehicle Inspection Due',
            message: `Vehicle ${vehicle.plateNumber} inspection expires in ${inspectionDays} days (${vehicle.inspectionExpiryDate})`
          });
        }
      }

      // Check Home Rents
      const homeRents = await HomeRent.find({});
      for (const rent of homeRents) {
        const contractDays = this.getDaysUntilExpiration(rent.contractEndingDate);

        if (this.shouldNotify(contractDays)) {
          notifications.push({
            type: 'homeRent',
            subType: 'contract',
            item: rent,
            daysUntil: contractDays,
            title: '🏠 Rental Contract Expiring',
            message: `Contract ${rent.contractNumber} expires in ${contractDays} days (${rent.contractEndingDate})`
          });
        }

        // Check payment dates
        const payments = [
          { date: rent.firstPaymentDate, name: 'First' },
          { date: rent.secondPaymentDate, name: 'Second' },
          { date: rent.thirdPaymentDate, name: 'Third' },
          { date: rent.fourthPaymentDate, name: 'Fourth' }
        ];

        for (const payment of payments) {
          const paymentDays = this.getDaysUntilExpiration(payment.date);
          if (this.shouldNotify(paymentDays)) {
            notifications.push({
              type: 'homeRent',
              subType: 'payment',
              item: rent,
              daysUntil: paymentDays,
              title: '💰 Rent Payment Due',
              message: `${payment.name} payment for ${rent.contractNumber} due in ${paymentDays} days (${payment.date})`
            });
          }
        }
      }

      // Check Electricity Bills
      const bills = await Electricity.find({ paymentStatus: { $ne: 'Paid' } });
      for (const bill of bills) {
        const dueDays = this.getDaysUntilExpiration(bill.dueDate);

        if (this.shouldNotify(dueDays)) {
          notifications.push({
            type: 'electricity',
            subType: 'payment',
            item: bill,
            daysUntil: dueDays,
            title: '⚡ Electricity Bill Due',
            message: `Bill for ${bill.location} (${bill.meterNumber}) due in ${dueDays} days - SAR ${bill.billAmount}`
          });
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error getting items needing notification:', error);
      return [];
    }
  }

  // Send push notification to all subscribers
  async sendPushNotification(notification) {
    try {
      const subscriptions = await PushSubscription.find({});
      
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png',
        data: {
          type: notification.type,
          subType: notification.subType,
          daysUntil: notification.daysUntil,
          url: '/'
        }
      });

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: sub.keys
              },
              payload
            );
            
            // Update lastUsed
            sub.lastUsed = new Date();
            await sub.save();
            
            return { success: true, endpoint: sub.endpoint };
          } catch (error) {
            // If subscription is invalid, delete it
            if (error.statusCode === 410 || error.statusCode === 404) {
              await PushSubscription.deleteOne({ _id: sub._id });
              console.log('Removed invalid subscription:', sub.endpoint);
            }
            throw error;
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`✅ Push notifications sent: ${successful}/${subscriptions.length}`);
      
      return { success: true, sent: successful, total: subscriptions.length };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email notification
  async sendEmailNotification(notification, emails) {
    try {
      if (!transporter) {
        return { success: false, skipped: true, reason: 'Email not configured' };
      }
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>GTS Dashboard Alert</h1>
            </div>
            <div class="content">
              <h2>${notification.title}</h2>
              <div class="alert">
                <strong>⚠️ Expiration Alert</strong><br>
                ${notification.message}
              </div>
              <p><strong>Days Remaining:</strong> ${notification.daysUntil} days</p>
              <p><strong>Type:</strong> ${notification.type}</p>
              <p>Please take necessary action before the expiration date.</p>
              <a href="${process.env.APP_URL || 'http://localhost:5173'}" class="button">
                View Dashboard
              </a>
            </div>
            <div class="footer">
              <p>This is an automated notification from GTS Dashboard</p>
              <p>Do not reply to this email</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: emails.join(', '),
        subject: notification.title,
        html: htmlContent,
        text: notification.message
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send all notifications (push + email)
  async sendAllNotifications() {
    console.log('\n🔔 Checking for items needing notifications...');
    
    const notifications = await this.getItemsNeedingNotification();
    
    if (notifications.length === 0) {
      console.log('✅ No notifications needed at this time');
      return { total: 0, sent: 0 };
    }

    console.log(`📨 Found ${notifications.length} items needing notification`);

    let sentCount = 0;

    for (const notification of notifications) {
      // Send push notification
      await this.sendPushNotification(notification);

      // Get all subscribers' emails
      const subscriptions = await PushSubscription.find({});
      const emails = [...new Set(subscriptions.map(sub => sub.userEmail))];

      if (emails.length > 0) {
        await this.sendEmailNotification(notification, emails);
      }

      sentCount++;
    }

    console.log(`✅ Sent ${sentCount} notifications`);
    return { total: notifications.length, sent: sentCount };
  }

  // Manual trigger for testing
  async sendTestNotification(email) {
    const testNotification = {
      title: '🧪 Test Notification',
      message: 'This is a test notification from GTS Dashboard',
      type: 'test',
      subType: 'test',
      daysUntil: 10
    };

    await this.sendPushNotification(testNotification);
    await this.sendEmailNotification(testNotification, [email]);

    return { success: true, message: 'Test notification sent' };
  }
}

module.exports = new NotificationService();