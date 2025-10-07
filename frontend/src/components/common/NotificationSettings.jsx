import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, TestTube } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
      
      const savedEmail = localStorage.getItem('gts_notification_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await pushNotificationService.subscribe(email);
      setIsSubscribed(true);
      setMessage('✅ Successfully subscribed to notifications!');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage('');

    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
      setEmail('');
      setMessage('✅ Successfully unsubscribed');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
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

    try {
      await pushNotificationService.sendTestNotification(email);
      setMessage('✅ Test notification sent! Check your browser and email.');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!pushNotificationService.isSupported()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          ⚠️ Push notifications are not supported in your browser
        </p>
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
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
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
      </div>
    </div>
  );
};

export default NotificationSettings;