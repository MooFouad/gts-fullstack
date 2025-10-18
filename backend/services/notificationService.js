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

  // Check if item needs notification
  shouldNotify(daysUntil) {
    if (daysUntil === null) return false;

    const threshold = parseInt(process.env.NOTIFICATION_DAYS_BEFORE) || 10;

    // Send notifications from threshold days before and continue indefinitely (even if expired)
    return daysUntil <= threshold;
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
        const insuranceDays = this.getDaysUntilExpiration(vehicle.insuranceExpiryDate);

        // License notification
        if (this.shouldNotify(licenseDays) && vehicle.licenseExpiryDate) {
          const status = licenseDays < 0
            ? `Expired ${Math.abs(licenseDays)} days ago`
            : licenseDays === 0
              ? 'Expires Today'
              : `${licenseDays} days remaining`;

          notifications.push({
            type: 'vehicle',
            subType: 'license',
            item: vehicle,
            itemId: vehicle._id,
            fieldName: 'licenseExpiryDate',
            expiryDate: vehicle.licenseExpiryDate,
            daysUntil: licenseDays,
            title: licenseDays < 0 ? '❌ Vehicle License EXPIRED' : '🚗 Vehicle License Expiring Soon',
            message: `Vehicle ${vehicle.plateNumber} license - ${status} (${new Date(vehicle.licenseExpiryDate).toLocaleDateString()})`
          });
        }

        // Inspection notification
        if (this.shouldNotify(inspectionDays) && vehicle.inspectionExpiryDate) {
          const status = inspectionDays < 0
            ? `Expired ${Math.abs(inspectionDays)} days ago`
            : inspectionDays === 0
              ? 'Expires Today'
              : `${inspectionDays} days remaining`;

          notifications.push({
            type: 'vehicle',
            subType: 'inspection',
            item: vehicle,
            itemId: vehicle._id,
            fieldName: 'inspectionExpiryDate',
            expiryDate: vehicle.inspectionExpiryDate,
            daysUntil: inspectionDays,
            title: inspectionDays < 0 ? '❌ Vehicle Inspection EXPIRED' : '🔧 Vehicle Inspection Due',
            message: `Vehicle ${vehicle.plateNumber} inspection - ${status} (${new Date(vehicle.inspectionExpiryDate).toLocaleDateString()})`
          });
        }

        // Insurance notification
        if (this.shouldNotify(insuranceDays) && vehicle.insuranceExpiryDate) {
          const status = insuranceDays < 0
            ? `Expired ${Math.abs(insuranceDays)} days ago`
            : insuranceDays === 0
              ? 'Expires Today'
              : `${insuranceDays} days remaining`;

          notifications.push({
            type: 'vehicle',
            subType: 'insurance',
            item: vehicle,
            itemId: vehicle._id,
            fieldName: 'insuranceExpiryDate',
            expiryDate: vehicle.insuranceExpiryDate,
            daysUntil: insuranceDays,
            title: insuranceDays < 0 ? '❌ Vehicle Insurance EXPIRED' : '🛡️ Vehicle Insurance Expiring Soon',
            message: `Vehicle ${vehicle.plateNumber} insurance - ${status} (${new Date(vehicle.insuranceExpiryDate).toLocaleDateString()})${vehicle.insuranceCompany ? ' - ' + vehicle.insuranceCompany : ''}`
          });
        }
      }

      // Check Home Rents - Only check contract ending date
      const homeRents = await HomeRent.find({});
      for (const rent of homeRents) {
        const contractDays = this.getDaysUntilExpiration(rent.contractEndingDate);

        // Contract expiry notification (only based on contract ending date)
        if (this.shouldNotify(contractDays) && rent.contractEndingDate) {
          const status = contractDays < 0
            ? `Expired ${Math.abs(contractDays)} days ago`
            : contractDays === 0
              ? 'Expires Today'
              : `${contractDays} days remaining`;

          notifications.push({
            type: 'homeRent',
            subType: 'contract',
            item: rent,
            itemId: rent._id,
            fieldName: 'contractEndingDate',
            expiryDate: rent.contractEndingDate,
            daysUntil: contractDays,
            title: contractDays < 0 ? '❌ Rental Contract EXPIRED' : '🏠 Rental Contract Expiring',
            message: `Contract ${rent.contractNumber} - ${status} (${new Date(rent.contractEndingDate).toLocaleDateString()})`
          });
        }
      }

      // Check Electricity Bills (only unpaid bills)
      const bills = await Electricity.find({ paymentStatus: { $ne: 'Paid' } });
      for (const bill of bills) {
        const dueDays = this.getDaysUntilExpiration(bill.dueDate);

        if (this.shouldNotify(dueDays) && bill.dueDate) {
          const status = dueDays < 0
            ? `Overdue ${Math.abs(dueDays)} days`
            : dueDays === 0
              ? 'Due Today'
              : `${dueDays} days remaining`;

          notifications.push({
            type: 'electricity',
            subType: 'payment',
            item: bill,
            itemId: bill._id,
            fieldName: 'dueDate',
            expiryDate: bill.dueDate,
            daysUntil: dueDays,
            title: dueDays < 0 ? '❌ Electricity Bill OVERDUE' : '⚡ Electricity Bill Due',
            message: `Bill for ${bill.location} (meter ${bill.meterNumber}) - ${status} - SAR ${bill.billAmount} (${new Date(bill.dueDate).toLocaleDateString()})`
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
      console.log(`📤 Found ${subscriptions.length} push subscription(s)`);

      if (subscriptions.length === 0) {
        console.log('⚠️ No push subscriptions found - nobody subscribed yet');
        return { success: true, sent: 0, total: 0 };
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        tag: `gts-${notification.type}-${Date.now()}`,
        data: {
          type: notification.type,
          subType: notification.subType,
          daysUntil: notification.daysUntil,
          url: '/'
        }
      });

      console.log(`📨 Sending notification: ${notification.title}`);

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            console.log(`  → Sending to: ${sub.userEmail} (${sub.endpoint.substring(0, 50)}...)`);

            const response = await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: sub.keys
              },
              payload
            );

            console.log(`  ✅ Sent successfully to ${sub.userEmail}`);

            // Update lastUsed
            sub.lastUsed = new Date();
            await sub.save();

            return { success: true, endpoint: sub.endpoint, response };
          } catch (error) {
            console.error(`  ❌ Failed to send to ${sub.userEmail}:`, error.message);
            console.error(`     Status: ${error.statusCode}, Body: ${error.body}`);

            // If subscription is invalid, delete it
            if (error.statusCode === 410 || error.statusCode === 404) {
              await PushSubscription.deleteOne({ _id: sub._id });
              console.log(`  🗑️ Removed invalid subscription for ${sub.userEmail}`);
            }
            throw error;
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Push notifications: ${successful} sent, ${failed} failed (total: ${subscriptions.length})`);

      return { success: true, sent: successful, failed, total: subscriptions.length };
    } catch (error) {
      console.error('❌ Error in sendPushNotification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email notification
  async sendEmailNotification(notification, emails) {
    try {
      if (!transporter) {
        return { success: false, skipped: true, reason: 'Email not configured' };
      }

      // Generate proper status message
      const statusMessage = notification.daysUntil < 0
        ? `<strong style="color: #dc2626;">Status:</strong> Expired ${Math.abs(notification.daysUntil)} days ago`
        : notification.daysUntil === 0
          ? `<strong style="color: #ea580c;">Status:</strong> Expires Today`
          : `<strong style="color: #f59e0b;">Days Remaining:</strong> ${notification.daysUntil} days`;

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
            .alert-expired { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
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
              <div class="${notification.daysUntil < 0 ? 'alert-expired' : 'alert'}">
                <strong>${notification.daysUntil < 0 ? '❌' : '⚠️'} Expiration Alert</strong><br>
                ${notification.message}
              </div>
              <p>${statusMessage}</p>
              <p><strong>Type:</strong> ${notification.type}</p>
              <p>${notification.daysUntil < 0 ? 'This item is overdue! Please take immediate action.' : 'Please take necessary action before the expiration date.'}</p>
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

  // Send grouped email notifications (all items of same type in one email)
  async sendGroupedEmailNotification(notifications, type, emails) {
    try {
      if (!transporter) {
        return { success: false, skipped: true, reason: 'Email not configured' };
      }

      const typeTitles = {
        vehicle: '🚗 Vehicle Alerts',
        homeRent: '🏠 Home Rent Alerts',
        electricity: '⚡ Electricity Bill Alerts'
      };
      const typeTitle = typeTitles[type] || 'Alerts';

      // Generate alert items HTML
      const alertItems = notifications.map(notif => {
        const statusText = notif.daysUntil < 0
          ? `Expired ${Math.abs(notif.daysUntil)} days ago`
          : notif.daysUntil === 0
            ? 'Expires Today'
            : `${notif.daysUntil} days remaining`;

        const alertClass = notif.daysUntil < 0 ? 'alert-expired' : 'alert';

        return `
        <div class="${alertClass}">
          <strong>${notif.title}</strong><br>
          ${notif.message}<br>
          <small><strong>Status:</strong> ${statusText}</small>
        </div>
      `;
      }).join('');

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
            .alert-expired { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
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
              <h2>${typeTitle}</h2>
              <p>You have ${notifications.length} alert(s) requiring attention:</p>
              ${alertItems}
              <p>Please take necessary action before the expiration dates.</p>
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
        subject: typeTitle,
        html: htmlContent,
        text: notifications.map(n => n.message).join('\n\n')
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Grouped ${type} email sent:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Error sending grouped ${type} email:`, error);
      return { success: false, error: error.message };
    }
  }

  // Send all notifications (push + email) - SEPARATED
  async sendAllNotifications() {
    console.log('\n🔔 Checking for items needing notifications...');
    console.log(`📅 Current date: ${new Date().toLocaleDateString()}`);
    console.log(`⏰ Notification threshold: ${process.env.NOTIFICATION_DAYS_BEFORE || 10} days before expiration`);

    const notifications = await this.getItemsNeedingNotification();

    if (notifications.length === 0) {
      console.log('✅ No notifications needed at this time');
      return { total: 0, sent: 0, push: 0, email: 0 };
    }

    console.log(`📨 Found ${notifications.length} items needing notification:`);

    // Log each notification item
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} - ${notif.daysUntil} days remaining`);
    });

    // Group notifications by type (for emails)
    const groupedNotifications = {
      vehicle: notifications.filter(n => n.type === 'vehicle'),
      homeRent: notifications.filter(n => n.type === 'homeRent'),
      electricity: notifications.filter(n => n.type === 'electricity')
    };

    let pushSent = 0;
    let emailSent = 0;

    // ========== PUSH NOTIFICATIONS (Browser notifications ONLY) ==========
    console.log('\n📱 Sending Windows Push Notifications...');
    for (const notification of notifications) {
      console.log(`\n📤 Processing push: ${notification.title} (${notification.daysUntil} days until expiration)`);
      console.log(`   📝 Message: ${notification.message}`);
      const pushResult = await this.sendPushNotification(notification);
      if (pushResult.success) {
        pushSent++;
      }
    }

    // ========== EMAIL NOTIFICATIONS (Uses same PushSubscription data) ==========
    // Get unique emails from PushSubscription collection
    const pushSubscriptions = await PushSubscription.find({});
    const uniqueEmails = [...new Set(pushSubscriptions.map(sub => sub.userEmail))];

    if (uniqueEmails.length > 0) {
      console.log(`\n📧 Sending Email Notifications to ${uniqueEmails.length} email address(es)...`);

      // Send grouped emails by type
      if (groupedNotifications.vehicle.length > 0) {
        console.log(`\n📧 Sending grouped vehicle email (${groupedNotifications.vehicle.length} items)`);
        const result = await this.sendGroupedEmailNotification(groupedNotifications.vehicle, 'vehicle', uniqueEmails);
        if (result.success) emailSent++;
      }

      if (groupedNotifications.homeRent.length > 0) {
        console.log(`\n📧 Sending grouped home rent email (${groupedNotifications.homeRent.length} items)`);
        const result = await this.sendGroupedEmailNotification(groupedNotifications.homeRent, 'homeRent', uniqueEmails);
        if (result.success) emailSent++;
      }

      if (groupedNotifications.electricity.length > 0) {
        console.log(`\n📧 Sending grouped electricity email (${groupedNotifications.electricity.length} items)`);
        const result = await this.sendGroupedEmailNotification(groupedNotifications.electricity, 'electricity', uniqueEmails);
        if (result.success) emailSent++;
      }
    } else {
      console.log('\nℹ️ No email subscribers found (no push subscriptions with emails)');
    }

    console.log(`\n✅ Daily notification check complete:`);
    console.log(`   📱 Push notifications: ${pushSent} sent`);
    console.log(`   📧 Email notifications: ${emailSent} sent`);
    console.log(`📆 Next check: Tomorrow at 9:00 AM\n`);
    return { total: notifications.length, sent: pushSent + emailSent, push: pushSent, email: emailSent };
  }

  // Manual trigger for testing (email only)
  async sendTestNotification(email) {
    const testNotification = {
      title: '🧪 Test Email Notification',
      message: 'This is a test email notification from GTS Dashboard',
      type: 'test',
      subType: 'test',
      daysUntil: 10
    };

    await this.sendEmailNotification(testNotification, [email]);

    return { success: true, message: 'Test email sent' };
  }

  // Manual trigger for testing push notifications (no email)
  async sendTestPushNotification() {
    const testNotification = {
      title: '🧪 Test Push Notification',
      message: 'This is a test Windows push notification from GTS Dashboard',
      type: 'test',
      subType: 'test',
      daysUntil: 10
    };

    await this.sendPushNotification(testNotification);

    return { success: true, message: 'Test push notification sent' };
  }
}

module.exports = new NotificationService();