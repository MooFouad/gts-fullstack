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
  console.log('🔔 [SW] Push event received!', new Date().toISOString());
  console.log('🔔 [SW] Event data:', event.data);
  console.log('🔔 [SW] Has data:', !!event.data);

  let notificationData = {
    title: 'GTS Dashboard',
    body: 'You have a new notification',
    icon: undefined, // Don't use icon if it doesn't exist
    badge: undefined,
    data: {}
  };

  if (event.data) {
    try {
      const rawText = event.data.text();
      console.log('🔔 [SW] Raw data text:', rawText);

      const payload = event.data.json();
      console.log('🔔 [SW] Parsed JSON payload:', payload);

      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        tag: payload.tag || 'gts-notification',
        requireInteraction: false, // Changed to false - some systems block requireInteraction
        renotify: true,
        data: payload.data || {}
      };

      console.log('🔔 [SW] Final notification data:', notificationData);
    } catch (error) {
      console.error('❌ [SW] Error parsing push notification:', error);
      console.error('❌ [SW] Error stack:', error.stack);
    }
  } else {
    console.warn('⚠️ [SW] No data in push event!');
  }

  console.log('🔔 [SW] About to show notification:', notificationData.title);

  const showPromise = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    renotify: notificationData.renotify,
    data: notificationData.data,
    // Removed actions for now - some browsers don't support them well
  }).then(() => {
    console.log('✅ [SW] Notification shown successfully!');
    console.log('✅ [SW] Check your Windows notification center!');
  }).catch((error) => {
    console.error('❌ [SW] Failed to show notification:', error);
    console.error('❌ [SW] Error name:', error.name);
    console.error('❌ [SW] Error message:', error.message);
  });

  event.waitUntil(showPromise);
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