const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const notificationService = require('../services/notificationService');

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, email } = req.body;

    console.log('📬 Subscription request received from:', email);

    if (!subscription || !email) {
      return res.status(400).json({ error: 'Subscription and email are required' });
    }

    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription format' });
    }

    // Check if subscription already exists
    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });

    if (existing) {
      console.log('Updating existing subscription for:', email);
      existing.userEmail = email;
      existing.lastUsed = new Date();
      existing.keys = subscription.keys;
      await existing.save();
      return res.json({ success: true, message: 'Subscription updated', id: existing._id });
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
    console.log('Subscription ID:', newSubscription._id);
    
    res.json({ 
      success: true, 
      message: 'Subscribed to notifications',
      id: newSubscription._id
    });
  } catch (error) {
    console.error('❌ Error saving subscription:', error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    const result = await PushSubscription.deleteOne({ endpoint });

    console.log('✅ Subscription removed:', endpoint);
    res.json({ 
      success: true, 
      message: 'Unsubscribed successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!publicKey) {
    console.error('❌ VAPID_PUBLIC_KEY not configured in .env');
    return res.status(500).json({ error: 'VAPID key not configured' });
  }
  
  console.log('✅ Sending VAPID public key');
  res.json({ publicKey });
});

// Manual trigger for testing EMAIL notifications
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('🧪 Sending test EMAIL to:', email);
    await notificationService.sendTestNotification(email);

    res.json({ success: true, message: 'Test email sent' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual trigger for testing PUSH notifications (browser only, no email)
router.post('/test-push', async (req, res) => {
  try {
    console.log('🧪 Sending test PUSH notification');
    await notificationService.sendTestPushNotification();

    res.json({ success: true, message: 'Test push notification sent to all subscribed browsers' });
  } catch (error) {
    console.error('Error sending test push:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger notification check manually
router.post('/check-now', async (req, res) => {
  try {
    console.log('🔍 Manual notification check triggered');
    const result = await notificationService.sendAllNotifications();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error checking notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all subscriptions (for debugging)
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await PushSubscription.find({}).select('-keys');
    res.json({
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;