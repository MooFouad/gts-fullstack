export class NotificationService {
  static async initialize() {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      const registration = await this.registerServiceWorker();
      const permission = await this.requestPermission();
      const vapidKey = await this.getVapidKey();

      if (!registration || !permission || !vapidKey) {
        throw new Error('Failed to initialize notifications');
      }

      return await this.setupSubscription(registration, vapidKey);
    } catch (error) {
      console.error('Notification initialization failed:', error);
      return false;
    }
  }

  static async registerServiceWorker() {
    try {
      return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  static async requestPermission() {
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  static async getVapidKey() {
    try {
      const response = await fetch('/api/notifications/vapid-key');
      if (!response.ok) throw new Error('Failed to get VAPID key');
      const { key } = await response.json();
      return key;
    } catch (error) {
      console.error('Failed to get VAPID key:', error);
      return null;
    }
  }

  static async setupSubscription(registration, vapidKey) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      await this.sendSubscriptionToServer(subscription);
      return true;
    } catch (error) {
      console.error('Subscription setup failed:', error);
      return false;
    }
  }

  static async sendSubscriptionToServer(subscription) {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
  }

  static urlBase64ToUint8Array(base64String) {
    try {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      console.error('Failed to convert base64 to Uint8Array:', error);
      throw error;
    }
  }
}

export default NotificationService;
