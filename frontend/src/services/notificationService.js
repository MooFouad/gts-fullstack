const convertedVapidKey = 'BKFXWx6-RpYoR2bZujEL2qt9q-JO0WY3ip9bvwu4SW7FYxGY8pISSF84uIQEj3G-VFgJTsB7XrjZBFNSyafWJ2E';

export async function initializeNotifications() {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    return registration;
  } catch (error) {
    console.error('Notification initialization failed:', error);
    throw error;
  }
}
