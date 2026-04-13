import NetInfo from '@react-native-community/netinfo';
import { logger } from '../logging/logger';

const listeners = new Set();

let unsubscribe = null;

export const startNetworkMonitor = () => {
  if (unsubscribe) {
    return unsubscribe;
  }

  unsubscribe = NetInfo.addEventListener(state => {
    listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        logger.error('Network listener failure', { message: error?.message });
      }
    });
  });

  return unsubscribe;
};

export const subscribeToNetwork = listener => {
  listeners.add(listener);
  startNetworkMonitor();

  return () => {
    listeners.delete(listener);
  };
};
