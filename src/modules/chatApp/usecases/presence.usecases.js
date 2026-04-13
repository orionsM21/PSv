import {
  patchPresence,
  updateTypingState,
  watchPresence,
  watchTypingState,
} from '../repositories/presenceRepository';
import {buildTypingValue} from '../services/chatThread.service';

export async function setPresence(userId, presencePatch) {
  await patchPresence(userId, presencePatch);
}

export function watchChatPresence(userIds, onPresence) {
  return watchPresence(userIds, onPresence);
}

export function watchTypingStatus(chatId, userId, onTyping) {
  return watchTypingState(chatId, userId, onTyping);
}

export async function setTypingState({chatId, currentUserId, value}) {
  await updateTypingState(chatId, currentUserId, buildTypingValue(value));
}
