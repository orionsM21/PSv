import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logging/logger';

const STORAGE_KEY = '@app/offline-queue';

let queue = [];
let hydrator = null;

const readQueue = async () => {
  if (hydrator) {
    return hydrator;
  }

  hydrator = AsyncStorage.getItem(STORAGE_KEY)
    .then(raw => {
      queue = raw ? JSON.parse(raw) : [];
      return queue;
    })
    .catch(error => {
      logger.error('Failed to hydrate offline queue', { message: error?.message });
      queue = [];
      return queue;
    })
    .finally(() => {
      hydrator = null;
    });

  return hydrator;
};

const persistQueue = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    logger.error('Failed to persist offline queue', { message: error?.message });
  }
};

export const enqueueOfflineAction = async item => {
  await readQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    retryCount: 0,
    ...item,
  });
  await persistQueue();
};

export const getOfflineQueue = async () => {
  await readQueue();
  return [...queue];
};

export const flushOfflineQueue = async executor => {
  await readQueue();

  if (!queue.length) {
    return [];
  }

  const failures = [];
  const nextQueue = [];

  for (const item of queue) {
    try {
      await executor(item);
    } catch (error) {
      const retryCount = (item.retryCount || 0) + 1;
      const nextItem = { ...item, retryCount };
      nextQueue.push(nextItem);
      failures.push({
        ...nextItem,
        error: error?.message || 'Unknown offline sync error',
      });
    }
  }

  queue = nextQueue;
  await persistQueue();
  return failures;
};
