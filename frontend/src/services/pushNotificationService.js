// frontend/src/services/pushNotificationService.js
import api from './api';

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  }

  // Convert VAPID key to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if notifications are supported
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Register service worker
  async registerServiceWorker() {
    try {
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported in this browser');
      }

      // Check if service worker is already registered
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (existingRegistration) {
        console.log('✅ Service Worker already registered');
        this.registration = existingRegistration;
        return existingRegistration;
      }

      // Register new service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered successfully');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return this.registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw new Error(`Failed to register service worker: ${error.message}`);
    }
  }

  // Request notification permission
  async requestPermission() {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      return permission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribe(email) {
    try {
      // Register service worker first
      if (!this.registration) {
        await this.registerServiceWorker();
      }

      // Request notification permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      // Get VAPID public key
      let publicKey = this.vapidPublicKey;
      if (!publicKey) {
        console.log('Fetching VAPID key from server...');
        const response = await api.get('/notifications/vapid-public-key');
        publicKey = response.publicKey;
      }

      if (!publicKey) {
        throw new Error('VAPID public key not found');
      }

      console.log('Using VAPID public key:', publicKey.substring(0, 20) + '...');

      const convertedVapidKey = this.urlBase64ToUint8Array(publicKey);

      // Wait for service worker to be ready
      const swRegistration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      this.subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      console.log('✅ Push subscription created');

      // Send subscription to server
      await api.post('/notifications/subscribe', {
        subscription: this.subscription.toJSON(),
        email
      });

      console.log('✅ Subscription saved to server');

      // Save email to localStorage
      localStorage.setItem('gts_notification_email', email);

      return { success: true, subscription: this.subscription };
    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      throw new Error(`Subscription failed: ${error.message}`);
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        
        await api.post('/notifications/unsubscribe', {
          endpoint: this.subscription.endpoint
        });

        this.subscription = null;
        localStorage.removeItem('gts_notification_email');
        
        console.log('✅ Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }
  }

  // Check if already subscribed
  async isSubscribed() {
    try {
      if (!this.isSupported()) {
        console.log('Push notifications not supported');
        return false;
      }

      // Get service worker registration
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.getRegistration();
      }

      // If no registration found, not subscribed
      if (!this.registration) {
        console.log('No service worker registration found');
        return false;
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      const isSubscribed = !!this.subscription;
      console.log('Subscription status:', isSubscribed);
      
      return isSubscribed;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Return false instead of throwing to prevent blocking the app
      return false;
    }
  }

  // Send test notification
  async sendTestNotification(email) {
    try {
      await api.post('/notifications/test', { email });
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
}

export default new PushNotificationService();