import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApp} from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {get, getDatabase, ref} from '@react-native-firebase/database';

import {navigationRef} from '../../../navigationRef';
import {setModule} from '../../../redux/moduleSlice';
import {store} from '../../../redux/store';
import {
  loadChatProfile,
  resolveCanonicalProfileId,
} from './chatIdentity.service';

const CHAT_FLOW_ROUTE = 'ChatFlow';
const CHAT_MODULE_ID = 'chat';
const CHAT_THREAD_ROUTE = 'chat';
const SELECTED_MODULE_STORAGE_KEY = '@selectedModule';
const GENERIC_NOTIFICATION_LABELS = new Set([
  'message received',
  'new message',
  'new notification',
  'unknown contact',
]);

let pendingChatNotification = null;
let flushTimer = null;

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isGenericLabel(value) {
  const normalized = asString(value).toLowerCase();

  return GENERIC_NOTIFICATION_LABELS.has(normalized);
}

function pickMeaningfulLabel(...values) {
  return (
    values.find(value => {
      const nextValue = asString(value);

      return nextValue && !isGenericLabel(nextValue);
    }) || ''
  );
}

function buildFallbackLabel({senderName, senderPhone, senderUid}) {
  return (
    pickMeaningfulLabel(senderName, senderPhone, senderUid) || 'Unknown contact'
  );
}

function scheduleFlush() {
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    const {
      module: {isLoggedIn, selectedModule},
    } = store.getState();
    const currentUserId = auth().currentUser?.uid || null;

    flushPendingChatNotification({
      currentUserId,
      isLoggedIn,
      selectedModule,
    }).catch(() => null);
  }, 300);
}

async function persistChatModuleSelection() {
  try {
    await AsyncStorage.setItem(SELECTED_MODULE_STORAGE_KEY, CHAT_MODULE_ID);
  } catch {
    // Ignore persistence failures; in-memory routing is enough for current run.
  }
}

async function resolveNotificationContact({
  senderName,
  senderPhone,
  senderUid,
}) {
  if (!senderUid) {
    return null;
  }

  try {
    const canonicalUid = await resolveCanonicalProfileId(senderUid);
    const profile = canonicalUid ? await loadChatProfile(canonicalUid) : null;
    const fallbackSnapshot = await get(
      ref(getDatabase(getApp()), `publicUsers/${senderUid}`),
    );
    const publicUser = fallbackSnapshot.val() || {};
    const resolvedUid = canonicalUid || senderUid;
    const displayName = asString(profile?.name) || asString(publicUser?.name);
    const phone =
      asString(profile?.phone) ||
      asString(publicUser?.phone) ||
      asString(senderPhone);
    const avatar = asString(profile?.avatar) || asString(publicUser?.avatar);
    const resolvedLabel =
      pickMeaningfulLabel(displayName, phone, senderName, resolvedUid) ||
      'Unknown contact';

    return {
      avatar,
      contactUid: resolvedUid,
      displayName: resolvedLabel,
      id: resolvedUid,
      name: resolvedLabel,
      phone,
      uid: resolvedUid,
      userId: resolvedUid,
    };
  } catch {
    const fallbackLabel = buildFallbackLabel({
      senderName,
      senderPhone,
      senderUid,
    });

    return {
      avatar: '',
      contactUid: senderUid,
      displayName: fallbackLabel,
      id: senderUid,
      name: fallbackLabel,
      phone: asString(senderPhone),
      uid: senderUid,
      userId: senderUid,
    };
  }
}

function navigateToChat(contact) {
  if (!navigationRef.isReady() || !contact?.uid) {
    return false;
  }

  navigationRef.navigate(CHAT_FLOW_ROUTE, {
    params: {
      contact,
    },
    screen: CHAT_THREAD_ROUTE,
  });

  return true;
}

export function buildChatNotificationPayload(notificationLike = {}) {
  const data =
    notificationLike?.data ||
    notificationLike?.userInfo ||
    notificationLike?.userData ||
    {};
  const explicitSenderName = asString(
    data?.senderName || notificationLike?.senderName,
  );
  const senderPhone = asString(
    data?.senderPhone || notificationLike?.senderPhone,
  );
  const titleCandidate = asString(
    data?.senderLabel ||
      data?.title ||
      notificationLike?.title ||
      notificationLike?.message,
  );

  const senderUid = asString(
    data?.senderUid || notificationLike?.senderUid || data?.from,
  );
  const chatId = asString(data?.chatId || notificationLike?.chatId);
  const senderName = pickMeaningfulLabel(explicitSenderName, titleCandidate);

  if (!senderUid && !chatId) {
    return null;
  }

  return {
    chatId,
    senderName,
    senderPhone,
    senderUid,
  };
}

export async function flushPendingChatNotification({
  currentUserId,
  isLoggedIn,
  selectedModule,
}) {
  if (!pendingChatNotification || !currentUserId || !isLoggedIn) {
    return false;
  }

  if (selectedModule !== CHAT_MODULE_ID) {
    store.dispatch(setModule(CHAT_MODULE_ID));
    await persistChatModuleSelection();
    scheduleFlush();
    return false;
  }

  const contact = await resolveNotificationContact(pendingChatNotification);

  if (!contact) {
    pendingChatNotification = null;
    return false;
  }

  const navigated = navigateToChat(contact);

  if (navigated) {
    pendingChatNotification = null;
    clearTimeout(flushTimer);
  } else {
    scheduleFlush();
  }

  return navigated;
}

export async function queueChatNotificationOpen(notificationLike) {
  const payload = buildChatNotificationPayload(notificationLike);

  if (!payload) {
    return false;
  }

  pendingChatNotification = payload;

  const {
    module: {selectedModule},
  } = store.getState();

  if (selectedModule !== CHAT_MODULE_ID) {
    store.dispatch(setModule(CHAT_MODULE_ID));
    await persistChatModuleSelection();
  }

  scheduleFlush();

  return true;
}
