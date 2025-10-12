const cron = require('node-cron');
const notificationService = require('./notificationService');

class NotificationScheduler {
  start() {
    // Run daily at 9 AM (adjust NOTIFICATION_CHECK_HOUR in .env)
    const hour = process.env.NOTIFICATION_CHECK_HOUR || 9;
    const cronExpression = `0 ${hour} * * *`;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📅 NOTIFICATION SCHEDULER ACTIVATED`);
    console.log(`${'='.repeat(60)}`);
    console.log(`⏰ Schedule: Daily at ${hour}:00 AM`);
    console.log(`📧 Notifications: Email + Windows Push`);
    console.log(`📆 Frequency: Every day from 10 days before until expiration`);
    console.log(`${'='.repeat(60)}\n`);

    // Schedule daily check
    cron.schedule(cronExpression, async () => {
      console.log('\n⏰ ========== SCHEDULED NOTIFICATION CHECK ==========');
      console.log(`Time: ${new Date().toLocaleString()}`);
      try {
        await notificationService.sendAllNotifications();
      } catch (error) {
        console.error('❌ Error in scheduled notification check:', error);
      }
      console.log('========== NOTIFICATION CHECK COMPLETE ==========\n');
    });

    // Optional: Run immediately on startup (for testing)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 DEV MODE: Running initial notification check in 5 seconds...\n');
      setTimeout(() => {
        notificationService.sendAllNotifications();
      }, 5000);
    }
  }
}

module.exports = new NotificationScheduler();