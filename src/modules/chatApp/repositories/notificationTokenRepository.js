import {getApp} from '@react-native-firebase/app';
import {getDatabase, ref, update} from '@react-native-firebase/database';

function database() {
  return getDatabase(getApp());
}

export async function upsertPushInstallation({uid, installationId, payload}) {
  if (!uid || !installationId || !payload) {
    return;
  }

  const updates = {
    [`fcmTokens/${installationId}`]: payload,
    updatedAt: payload.updatedAt,
  };

  if (payload?.token) {
    updates.fcmToken = payload.token;
  }

  await update(ref(database(), `users/${uid}`), updates);
}
