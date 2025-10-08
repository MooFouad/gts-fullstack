// Service Worker for GTS Dashboard Push Notifications
// Place this file at: frontend/public/sw.js

console.log('Service Worker: Loading...');

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Claim all clients immediately
  event.waitUntil(clients.claim());
  console.log('Service Worker: Activated and claimed clients');
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  console.log('Push event data:', event.data);

  let notificationData = {
    title: 'GTS Dashboard',
    body: 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    data: {}
  };

  // Parse notification data from the push event
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

  // Show the notification
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

self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(
    self.registration.showNotification('GTS Dashboard', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url === self.location.origin + '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
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