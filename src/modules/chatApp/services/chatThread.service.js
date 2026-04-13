import {
  buildChatId,
  formatChatTimestamp,
  formatPresenceLabel,
  validateOutgoingMessage,
} from '../business/chatThread.rules';

function createRandomKey(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function hasDeliveredReceipt(message, currentUserId) {
  return Boolean(
    message?.receipts?.[currentUserId]?.deliveredAt ||
      message?.status === 'delivered' ||
      message?.status === 'seen',
  );
}

function hasSeenReceipt(message, currentUserId) {
  return Boolean(
    message?.receipts?.[currentUserId]?.seenAt || message?.status === 'seen',
  );
}

export {formatChatTimestamp, formatPresenceLabel, validateOutgoingMessage};

export function createChatSessionId(uid1, uid2) {
  return buildChatId(uid1, uid2);
}

export function createOutgoingDraft(value = '') {
  return {
    clientMessageId: createRandomKey('client'),
    messageId: createRandomKey('msg'),
    text: String(value).trim(),
  };
}

export function createOutgoingMessage({
  clientMessageId,
  createdAt = Date.now(),
  messageId,
  recipientUserId,
  senderUserId,
  text,
  type = 'text',
}) {
  return {
    clientMessageId,
    createdAt,
    from: senderUserId,
    messageId,
    receipts: {},
    status: 'sent',
    text,
    ...(recipientUserId ? {to: recipientUserId} : {}),
    type,
  };
}

export function getMessageCreatedAt(message) {
  return Number(message?.createdAt || message?.timestamp || 0);
}

export function deriveMessageStatus(message = {}) {
  const receipts = Object.values(message?.receipts || {});

  if (receipts.some(receipt => receipt?.seenAt)) {
    return 'seen';
  }

  if (receipts.some(receipt => receipt?.deliveredAt)) {
    return 'delivered';
  }

  if (message?.status === 'seen' || message?.status === 'delivered') {
    return message.status;
  }

  return 'sent';
}

function normalizeMessage(messageId, message, currentUserId) {
  const createdAt = getMessageCreatedAt(message);

  return {
    clientMessageId: message?.clientMessageId || messageId,
    createdAt,
    formattedTimestamp: formatChatTimestamp(createdAt),
    from: message?.from || '',
    fromMe: message?.from === currentUserId,
    id: messageId,
    messageId: message?.messageId || messageId,
    receipts: message?.receipts || {},
    status: deriveMessageStatus(message),
    text: message?.text || '',
    to: message?.to || '',
    type: message?.type || 'text',
  };
}

export function normalizeMessages(rawMessages = {}, currentUserId) {
  const dedupedMessages = Object.entries(rawMessages)
    .map(([messageId, message]) =>
      normalizeMessage(messageId, message, currentUserId),
    )
    .reduce((accumulator, message) => {
      const dedupeKey =
        message.clientMessageId || message.messageId || message.id;
      const existingMessage = accumulator.get(dedupeKey);

      if (
        !existingMessage ||
        getMessageCreatedAt(message) >= getMessageCreatedAt(existingMessage)
      ) {
        accumulator.set(dedupeKey, message);
      }

      return accumulator;
    }, new Map());

  return [...dedupedMessages.values()].sort(
    (left, right) => left.createdAt - right.createdAt,
  );
}

export function buildTypingValue(value) {
  return Boolean(String(value || '').trim());
}

export function buildDeliveredReceiptUpdates({
  chatId,
  currentUserId,
  messages,
}) {
  const timestamp = Date.now();

  return messages.reduce((updates, message) => {
    if (
      !message?.id ||
      !message?.from ||
      message.from === currentUserId ||
      hasDeliveredReceipt(message, currentUserId)
    ) {
      return updates;
    }

    updates[
      `chats/${chatId}/messages/${message.id}/receipts/${currentUserId}/deliveredAt`
    ] = timestamp;
    updates[`chats/${chatId}/messages/${message.id}/status`] = 'delivered';

    return updates;
  }, {});
}

export function buildSeenReceiptUpdates({chatId, currentUserId, messages}) {
  const timestamp = Date.now();

  return messages.reduce((updates, message) => {
    if (
      !message?.id ||
      !message?.from ||
      message.from === currentUserId ||
      !hasDeliveredReceipt(message, currentUserId) ||
      hasSeenReceipt(message, currentUserId)
    ) {
      return updates;
    }

    if (!message?.receipts?.[currentUserId]?.deliveredAt) {
      updates[
        `chats/${chatId}/messages/${message.id}/receipts/${currentUserId}/deliveredAt`
      ] = timestamp;
    }

    updates[
      `chats/${chatId}/messages/${message.id}/receipts/${currentUserId}/seenAt`
    ] = timestamp;
    updates[`chats/${chatId}/messages/${message.id}/status`] = 'seen';

    return updates;
  }, {});
}
