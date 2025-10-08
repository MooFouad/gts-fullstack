import { openDB } from 'idb';

const DB_NAME = 'gts-dashboard';
const STORE_NAME = 'subscriptions';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

export async function saveSubscription(subscription) {
  try {
    const db = await dbPromise;
    await db.put(STORE_NAME, subscription, 'userSubscription');
    return true;
  } catch (err) {
    console.error('Error saving subscription:', err);
    return false;
  }
}

export async function getSubscription() {
  try {
    const db = await dbPromise;
    return await db.get(STORE_NAME, 'userSubscription');
  } catch (err) {
    console.error('Error retrieving subscription:', err);
    return null;
  }
}
