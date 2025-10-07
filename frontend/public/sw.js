// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'GTS Dashboard',
        body: event.data.text(),
        icon: '/logo.png'
      };
    }
  }

  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/logo.png',
    badge: data.badge || '/badge.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    tag: data.tag || 'gts-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'GTS Dashboard', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'open' || event.action === '') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});