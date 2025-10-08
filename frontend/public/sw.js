// Service Worker for GTS Dashboard Push Notifications
// Save this file as: frontend/public/sw.js

console.log('Service Worker: Loading...');

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(clients.claim());
  console.log('Service Worker: Activated and claimed clients');
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  let notificationData = {
    title: 'GTS Dashboard',
    body: 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Parsed payload:', payload);
      
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || 'gts-notification',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: payload.data || {}
      };
    } catch (error) {
      console.error('Error parsing push notification:', error);
    }
  }

  console.log('Showing notification:', notificationData.title);

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'View Dashboard'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ]
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let client of clientList) {
          if (client.url === self.location.origin + '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Loaded successfully');