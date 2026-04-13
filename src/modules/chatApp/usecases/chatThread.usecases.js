import {
  applyChatRootUpdates,
  ensureChatMetaRecord,
  ensureChatRecord,
  watchChatMessages,
} from '../repositories/chatRepository';
import {
  buildChatMetaSeed,
  buildChatSessionSeed,
  buildSendMessageUpdates,
  buildUnreadResetUpdates,
} from '../services/chatMeta.service';
import {
  buildDeliveredReceiptUpdates,
  buildSeenReceiptUpdates,
  buildTypingValue,
  createChatSessionId,
  createOutgoingDraft,
  createOutgoingMessage,
  normalizeMessages,
  validateOutgoingMessage,
} from '../services/chatThread.service';
import {updateTypingState} from '../repositories/presenceRepository';

export {createChatSessionId, createOutgoingDraft};

export async function ensureChatSession({chatId, currentUserId, memberIds}) {
  if (!chatId || !currentUserId || !memberIds?.length) {
    return;
  }

  const createdAt = Date.now();
  const normalizedMembers = [...new Set(memberIds.filter(Boolean))].sort();

  await Promise.all([
    ensureChatRecord(
      chatId,
      buildChatSessionSeed({
        createdAt,
        createdBy: currentUserId,
        memberIds: normalizedMembers,
      }),
    ),
    ensureChatMetaRecord(
      chatId,
      buildChatMetaSeed({
        createdAt,
        createdBy: currentUserId,
        memberIds: normalizedMembers,
      }),
    ),
  ]);
}

export async function markMessagesDelivered({chatId, currentUserId, messages}) {
  const updates = buildDeliveredReceiptUpdates({
    chatId,
    currentUserId,
    messages,
  });

  if (!Object.keys(updates).length) {
    return;
  }

  await applyChatRootUpdates(updates);
}

export async function markMessagesSeen({chatId, currentUserId, messages}) {
  const receiptUpdates = buildSeenReceiptUpdates({
    chatId,
    currentUserId,
    messages,
  });

  if (!Object.keys(receiptUpdates).length) {
    return;
  }

  const updates = {
    ...receiptUpdates,
    ...buildUnreadResetUpdates({
      chatId,
      userId: currentUserId,
    }),
  };

  await applyChatRootUpdates(updates);
}

export function watchChatThread({chatId, currentUserId, onMessages, onError}) {
  return watchChatMessages(
    chatId,
    async rawMessages => {
      const messages = normalizeMessages(rawMessages, currentUserId);

      onMessages(messages);

      try {
        await markMessagesDelivered({
          chatId,
          currentUserId,
          messages,
        });
      } catch (error) {
        console.warn('Failed to mark messages delivered', error);
      }

      try {
        await markMessagesSeen({
          chatId,
          currentUserId,
          messages,
        });
      } catch (error) {
        console.warn('Failed to mark messages seen', error);
      }
    },
    onError,
  );
}

export async function sendChatMessage({
  chatId,
  contactUserId,
  currentUserId,
  memberIds,
  value,
  messageId,
  clientMessageId,
  type = 'text',
}) {
  const validation = validateOutgoingMessage(value);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  await ensureChatSession({
    chatId,
    currentUserId,
    memberIds,
  });

  const message = createOutgoingMessage({
    clientMessageId,
    messageId,
    recipientUserId: contactUserId,
    senderUserId: currentUserId,
    text: validation.value,
    type,
  });

  await applyChatRootUpdates(
    buildSendMessageUpdates({
      chatId,
      memberIds,
      message,
    }),
  );

  await updateTypingState(chatId, currentUserId, false);

  return message;
}

export async function setTyping({chatId, currentUserId, value}) {
  await updateTypingState(chatId, currentUserId, buildTypingValue(value));
}
