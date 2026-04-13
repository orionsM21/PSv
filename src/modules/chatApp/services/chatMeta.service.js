import {increment} from '@react-native-firebase/database';

export function createMemberMap(memberIds = []) {
  return memberIds.reduce((accumulator, memberId) => {
    if (memberId) {
      accumulator[memberId] = true;
    }

    return accumulator;
  }, {});
}

export function createUnreadMap(memberIds = []) {
  return memberIds.reduce((accumulator, memberId) => {
    if (memberId) {
      accumulator[memberId] = 0;
    }

    return accumulator;
  }, {});
}

export function buildChatSessionSeed({createdBy, createdAt, memberIds}) {
  return {
    createdAt,
    createdBy,
    members: createMemberMap(memberIds),
    type: memberIds.length > 2 ? 'group' : 'direct',
  };
}

export function buildChatMetaSeed({createdBy, createdAt, memberIds}) {
  return {
    createdAt,
    createdBy,
    lastMessage: '',
    lastTimestamp: 0,
    members: createMemberMap(memberIds),
    type: memberIds.length > 2 ? 'group' : 'direct',
    unread: createUnreadMap(memberIds),
  };
}

export function buildChatMembershipUpdates({chatId, memberIds}) {
  return memberIds.reduce((updates, memberId) => {
    if (!memberId) {
      return updates;
    }

    updates[`chats/${chatId}/members/${memberId}`] = true;
    updates[`chatsMeta/${chatId}/members/${memberId}`] = true;

    return updates;
  }, {});
}

export function buildSendMessageUpdates({chatId, memberIds, message}) {
  const updates = {
    [`chats/${chatId}/messages/${message.messageId}`]: message,
    [`chatsMeta/${chatId}/lastMessage`]: message.text,
    [`chatsMeta/${chatId}/lastTimestamp`]: message.createdAt,
    [`chatsMeta/${chatId}/unread/${message.from}`]: 0,
  };

  memberIds
    .filter(memberId => memberId && memberId !== message.from)
    .forEach(memberId => {
      updates[`chatsMeta/${chatId}/unread/${memberId}`] = increment(1);
    });

  return updates;
}

export function buildUnreadResetUpdates({chatId, userId}) {
  return {
    [`chatsMeta/${chatId}/unread/${userId}`]: 0,
  };
}
