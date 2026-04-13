import {getApp} from '@react-native-firebase/app';
import {
  get,
  getDatabase,
  keepSynced,
  limitToLast,
  onValue,
  query,
  ref,
  update,
} from '@react-native-firebase/database';

const MESSAGE_PAGE_SIZE = 100;

function database() {
  return getDatabase(getApp());
}

function chatRef(chatId) {
  return ref(database(), `chats/${chatId}`);
}

function chatsMetaRef(chatId) {
  return ref(database(), `chatsMeta/${chatId}`);
}

function messagesRef(chatId) {
  return ref(database(), `chats/${chatId}/messages`);
}

function buildMissingFieldUpdates(basePath, snapshot, fields = {}) {
  return Object.entries(fields).reduce((updates, [field, value]) => {
    if (!snapshot.child(field).exists()) {
      updates[field] = value;
    }

    return updates;
  }, {});
}

export async function ensureChatRecord(chatId, chatSeed) {
  const snapshot = await get(chatRef(chatId));
  const updates = {
    ...buildMissingFieldUpdates(chatId, snapshot, {
      createdAt: chatSeed?.createdAt,
      createdBy: chatSeed?.createdBy,
      type: chatSeed?.type,
    }),
  };

  Object.keys(chatSeed?.members || {}).forEach(memberId => {
    if (!snapshot.child('members').child(memberId).exists()) {
      updates[`members/${memberId}`] = true;
    }
  });

  if (Object.keys(updates).length) {
    await update(chatRef(chatId), updates);
  }

  return snapshot;
}

export async function ensureChatMetaRecord(chatId, metaSeed) {
  const snapshot = await get(chatsMetaRef(chatId));
  const updates = {
    ...buildMissingFieldUpdates(chatId, snapshot, {
      createdAt: metaSeed?.createdAt,
      createdBy: metaSeed?.createdBy,
      lastMessage: metaSeed?.lastMessage ?? '',
      lastTimestamp: metaSeed?.lastTimestamp ?? 0,
      type: metaSeed?.type,
    }),
  };

  Object.keys(metaSeed?.members || {}).forEach(memberId => {
    if (!snapshot.child('members').child(memberId).exists()) {
      updates[`members/${memberId}`] = true;
    }
  });

  Object.keys(metaSeed?.unread || {}).forEach(memberId => {
    if (!snapshot.child('unread').child(memberId).exists()) {
      updates[`unread/${memberId}`] = 0;
    }
  });

  if (Object.keys(updates).length) {
    await update(chatsMetaRef(chatId), updates);
  }

  return snapshot;
}

export async function applyChatRootUpdates(updates) {
  if (!updates || !Object.keys(updates).length) {
    return;
  }

  const groupedUpdates = Object.entries(updates).reduce(
    (accumulator, [path, value]) => {
      const segments = path.split('/');

      if (segments.length < 3) {
        return accumulator;
      }

      const basePath = `${segments[0]}/${segments[1]}`;
      const relativePath = segments.slice(2).join('/');

      if (!accumulator[basePath]) {
        accumulator[basePath] = {};
      }

      accumulator[basePath][relativePath] = value;

      return accumulator;
    },
    {},
  );

  await Promise.all(
    Object.entries(groupedUpdates).map(([basePath, nextUpdates]) =>
      update(ref(database(), basePath), nextUpdates),
    ),
  );
}

export async function getChatMembers(chatId) {
  const snapshot = await get(ref(database(), `chats/${chatId}/members`));
  return snapshot.val() || {};
}

export function watchChatMessages(chatId, onMessages, onError) {
  if (!chatId) {
    return () => {};
  }

  const threadMessagesRef = messagesRef(chatId);
  const threadMetaRef = chatsMetaRef(chatId);
  const threadQuery = query(threadMessagesRef, limitToLast(MESSAGE_PAGE_SIZE));

  keepSynced(threadMessagesRef, true).catch(() => null);
  keepSynced(threadMetaRef, true).catch(() => null);

  const unsubscribe = onValue(
    threadQuery,
    snapshot => {
      onMessages(snapshot.val() || {});
    },
    onError,
  );

  return () => {
    keepSynced(threadMessagesRef, false).catch(() => null);
    keepSynced(threadMetaRef, false).catch(() => null);
    unsubscribe();
  };
}
