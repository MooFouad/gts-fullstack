import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, TestTube, AlertCircle } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      setDebugInfo('Checking subscription status...');
      
      // Check if browser supports notifications
      if (!pushNotificationService.isSupported()) {
        setDebugInfo('❌ Browser does not support push notifications');
        return;
      }

      setDebugInfo('✅ Browser supports push notifications');

      // Check current subscription
      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
      
      const savedEmail = localStorage.getItem('gts_notification_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }

      setDebugInfo(subscribed ? '✅ Already subscribed' : 'ℹ️ Not subscribed yet');
    } catch (error) {
      console.error('Error checking subscription:', error);
      setDebugInfo(`❌ Error: ${error.message}`);
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');
    setDebugInfo('Starting subscription process...');

    try {
      // Step 1: Check browser support
      if (!pushNotificationService.isSupported()) {
        throw new Error('Your browser does not support push notifications');
      }
      setDebugInfo('✅ Browser check passed');

      // Step 2: Check notification permission
      if (Notification.permission === 'denied') {
        throw new Error('Notification permission was denied. Please enable it in your browser settings.');
      }
      setDebugInfo('✅ Permission check passed');

      // Step 3: Subscribe
      setDebugInfo('Registering service worker...');
      await pushNotificationService.subscribe(email);
      
      setIsSubscribed(true);
      setMessage('✅ Successfully subscribed to notifications!');
      setDebugInfo('✅ Subscription complete!');
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage(`❌ Error: ${error.message}`);
      setDebugInfo(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage('');
    setDebugInfo('Unsubscribing...');

    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
      setEmail('');
      setMessage('✅ Successfully unsubscribed');
      setDebugInfo('✅ Unsubscribed successfully');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setDebugInfo(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');
    setDebugInfo('Sending test notification...');

    try {
      // First check if subscribed
      const subscribed = await pushNotificationService.isSubscribed();
      if (!subscribed) {
        setMessage('⚠️ Please subscribe first before sending test notifications');
        setDebugInfo('⚠️ Not subscribed');
        setLoading(false);
        return;
      }

      await pushNotificationService.sendTestNotification(email);
      setMessage('✅ Test notification sent! Check your browser and email.');
      setDebugInfo('✅ Test notification sent');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setDebugInfo(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manual service worker check
  const checkServiceWorker = async () => {
    setDebugInfo('Checking service worker status...');
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setDebugInfo(`✅ Service Worker registered at: ${registration.scope}`);
        } else {
          setDebugInfo('⚠️ No service worker registered');
        }
      } else {
        setDebugInfo('❌ Service workers not supported');
      }
    } catch (error) {
      setDebugInfo(`❌ Error: ${error.message}`);
    }
  };

  if (!pushNotificationService.isSupported()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-900">Push Notifications Not Supported</h3>
            <p className="text-yellow-800 mt-1">
              Your browser does not support push notifications. Please try using Chrome, Firefox, or Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell size={24} className="text-blue-600" />
        <h2 className="text-xl font-semibold">Notification Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-mono text-gray-700">{debugInfo}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubscribed}
          />
          <p className="text-xs text-gray-500 mt-1">
            You'll receive notifications 10 days before any expiration dates
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 
            message.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
            'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!isSubscribed ? (
            <button
              onClick={handleSubscribe}
              disabled={loading || !email}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell size={18} />
              {loading ? 'Subscribing...' : 'Enable Notifications'}
            </button>
          ) : (
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <BellOff size={18} />
              {loading ? 'Unsubscribing...' : 'Disable Notifications'}
            </button>
          )}

          <button
            onClick={handleTestNotification}
            disabled={loading || !email}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <TestTube size={18} />
            Send Test
          </button>

          <button
            onClick={checkServiceWorker}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Check SW Status
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Browser notifications (even when browser is closed)</li>
            <li>• Email notifications to your inbox</li>
            <li>• Automatic daily checks at 9:00 AM</li>
            <li>• Alerts 10 days before expiration</li>
            <li>• Covers vehicles, rentals, and electricity bills</li>
          </ul>
        </div>

        {isSubscribed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              ✅ Notifications are enabled for: {email}
            </p>
          </div>
        )}

        {/* Browser Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">🔍 Browser Information:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Notification Permission: <strong>{Notification.permission}</strong></li>
            <li>• Service Worker Support: <strong>{('serviceWorker' in navigator) ? 'Yes' : 'No'}</strong></li>
            <li>• Push Manager Support: <strong>{('PushManager' in window) ? 'Yes' : 'No'}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;