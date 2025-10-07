const cron = require('node-cron');
const notificationService = require('./notificationService');

class NotificationScheduler {
  start() {
    // Run daily at 9 AM (adjust NOTIFICATION_CHECK_HOUR in .env)
    const hour = process.env.NOTIFICATION_CHECK_HOUR || 9;
    const cronExpression = `0 ${hour} * * *`;

    console.log(`📅 Notification scheduler started (runs daily at ${hour}:00 AM)`);

    // Schedule daily check
    cron.schedule(cronExpression, async () => {
      console.log('\n⏰ Running scheduled notification check...');
      try {
        await notificationService.sendAllNotifications();
      } catch (error) {
        console.error('❌ Error in scheduled notification check:', error);
      }
    });

    // Optional: Run immediately on startup (for testing)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Running initial notification check (dev mode)...');
      setTimeout(() => {
        notificationService.sendAllNotifications();
      }, 5000);
    }
  }
}

module.exports = new NotificationScheduler();