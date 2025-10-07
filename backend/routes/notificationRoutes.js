const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const notificationService = require('../services/notificationService');

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, email } = req.body;

    if (!subscription || !email) {
      return res.status(400).json({ error: 'Subscription and email are required' });
    }

    // Check if subscription already exists
    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });

    if (existing) {
      existing.userEmail = email;
      existing.lastUsed = new Date();
      await existing.save();
      return res.json({ success: true, message: 'Subscription updated' });
    }

    // Create new subscription
    const newSubscription = new PushSubscription({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userEmail: email,
      userAgent: req.headers['user-agent']
    });

    await newSubscription.save();

    console.log('✅ New push subscription saved for:', email);
    res.json({ success: true, message: 'Subscribed to notifications' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    await PushSubscription.deleteOne({ endpoint });

    console.log('✅ Subscription removed:', endpoint);
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Manual trigger (for testing)
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await notificationService.sendTestNotification(email);
    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger notification check manually
router.post('/check-now', async (req, res) => {
  try {
    const result = await notificationService.sendAllNotifications();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error checking notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;