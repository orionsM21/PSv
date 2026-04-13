import {getApp} from '@react-native-firebase/app';
import {
  getDatabase,
  onValue,
  ref,
  set,
  update,
} from '@react-native-firebase/database';

function database() {
  return getDatabase(getApp());
}

function normalizePresenceTargets(userIds) {
  const targets = Array.isArray(userIds) ? userIds : [userIds];

  return [...new Set(targets.filter(Boolean))];
}

function mergePresenceSnapshots(presenceValues) {
  const values = presenceValues.filter(Boolean);

  if (!values.length) {
    return null;
  }

  const online = values.some(value => value?.online);
  const lastSeenCandidates = values
    .map(value => Number(value?.lastSeen))
    .filter(value => Number.isFinite(value) && value > 0);
  const updatedAtCandidates = values
    .map(value => Number(value?.updatedAt))
    .filter(value => Number.isFinite(value) && value > 0);

  return {
    activeModule:
      values.find(value => value?.online && value?.activeModule)
        ?.activeModule ||
      values.find(value => value?.activeModule)?.activeModule ||
      null,
    lastSeen: lastSeenCandidates.length
      ? Math.max(...lastSeenCandidates)
      : null,
    online,
    updatedAt: updatedAtCandidates.length
      ? Math.max(...updatedAtCandidates)
      : null,
  };
}

export async function patchPresence(userId, presencePatch) {
  if (!userId) {
    return;
  }

  await update(ref(database(), `presence/${userId}`), presencePatch);
}

export function watchPresence(userId, onPresence) {
  const targets = normalizePresenceTargets(userId);

  if (!targets.length) {
    return () => {};
  }

  const snapshotsByUid = {};
  const unsubscribes = targets.map(uid =>
    onValue(ref(database(), `presence/${uid}`), snapshot => {
      snapshotsByUid[uid] = snapshot.val() || null;
      onPresence(mergePresenceSnapshots(Object.values(snapshotsByUid)));
    }),
  );

  return () => {
    unsubscribes.forEach(unsubscribe => unsubscribe?.());
  };
}

export async function updateTypingState(chatId, userId, nextValue) {
  if (!chatId || !userId) {
    return;
  }

  await set(ref(database(), `chats/${chatId}/typing/${userId}`), nextValue);
}

export function watchTypingState(chatId, userId, onTyping) {
  if (!chatId || !userId) {
    return () => {};
  }

  return onValue(
    ref(database(), `chats/${chatId}/typing/${userId}`),
    snapshot => {
      onTyping(snapshot.val() === true);
    },
  );
}
