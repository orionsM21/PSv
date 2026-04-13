import {PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';

import {upsertPushInstallation} from '../repositories/notificationTokenRepository';
import {
  buildInstallationPayload,
  getOrCreateInstallationId,
} from '../services/notificationToken.service';

async function ensureNotificationPermission() {
  if (Platform.OS === 'ios') {
    await messaging().registerDeviceForRemoteMessages();
    await messaging().requestPermission();
    return;
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
}

export async function registerPushInstallation(uid) {
  if (!uid) {
    return () => {};
  }

  await ensureNotificationPermission();

  const installationId = await getOrCreateInstallationId();

  const persistToken = async token => {
    if (!token) {
      return;
    }

    await upsertPushInstallation({
      installationId,
      payload: buildInstallationPayload(token),
      uid,
    });
  };

  await persistToken(await messaging().getToken());

  return messaging().onTokenRefresh(nextToken => {
    persistToken(nextToken).catch(() => null);
  });
}
