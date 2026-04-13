import {getApp} from '@react-native-firebase/app';
import {
  getDatabase,
  setPersistenceEnabled,
} from '@react-native-firebase/database';

let didInitializeRealtimeDatabase = false;

export function initializeRealtimeDatabase() {
  if (didInitializeRealtimeDatabase) {
    return;
  }

  didInitializeRealtimeDatabase = true;

  try {
    const database = getDatabase(getApp());
    setPersistenceEnabled(database, true);
  } catch (error) {
    if (__DEV__) {
      console.log(
        'Realtime Database persistence init skipped:',
        error?.message,
      );
    }
  }
}
