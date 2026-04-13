import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';

import useAuthSession from '../../../core/auth/useAuthSession';
import {getAvatarLabel} from '../business/chatDirectory.rules';
import {formatPresenceLabel} from '../business/chatThread.rules';
import {loadChatIdentityTargets} from '../services/chatIdentity.service';
import {
  createChatSessionId,
  createOutgoingDraft,
  ensureChatSession,
  sendChatMessage,
  setTyping,
  watchChatThread,
} from '../usecases/chatThread.usecases';
import {
  setTypingState,
  watchChatPresence,
  watchTypingStatus,
} from '../usecases/presence.usecases';

const GENERIC_CONTACT_LABELS = new Set([
  'message received',
  'new message',
  'new notification',
  'unknown contact',
]);

function pickContactLabel(contact) {
  const candidates = [
    contact?.displayName,
    contact?.name,
    contact?.phone,
    contact?.uid,
    contact?.userId,
    contact?.id,
    contact?.contactUid,
  ];

  const preferred = candidates.find(value => {
    const nextValue = String(value || '').trim();

    return nextValue && !GENERIC_CONTACT_LABELS.has(nextValue.toLowerCase());
  });

  return preferred || 'Unknown contact';
}

export default function useChatThread() {
  const navigation = useNavigation();
  const route = useRoute();
  const {uid: currentUserId, initializing} = useAuthSession();

  const listRef = useRef(null);
  const retryDraftRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const contact = route?.params?.contact || null;
  const contactUid =
    contact?.uid || contact?.userId || contact?.id || contact?.contactUid;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTypingIndicator] = useState(false);
  const [presence, setPresenceSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState('');
  const memberIds = useMemo(
    () => [currentUserId, contactUid].filter(Boolean),
    [contactUid, currentUserId],
  );

  const chatId = useMemo(() => {
    if (!currentUserId || !contactUid) {
      return null;
    }

    return createChatSessionId(currentUserId, contactUid);
  }, [contactUid, currentUserId]);

  useEffect(() => {
    if (initializing) {
      return undefined;
    }

    if (!chatId || !currentUserId || !contactUid) {
      setSessionReady(false);
      return undefined;
    }

    let active = true;

    setSessionReady(false);
    setLoading(true);
    setError('');

    ensureChatSession({
      chatId,
      currentUserId,
      memberIds,
    })
      .then(() => {
        if (!active) {
          return;
        }

        setSessionReady(true);
      })
      .catch(nextError => {
        if (!active) {
          return;
        }

        setError(nextError?.message || 'Unable to prepare chat session');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [chatId, contactUid, currentUserId, initializing, memberIds]);

  useEffect(() => {
    if (initializing) {
      return undefined;
    }

    if (!sessionReady || !chatId || !currentUserId || !contactUid) {
      setMessages([]);

      if (!chatId || !currentUserId || !contactUid) {
        setLoading(false);
        setError('Invalid chat session');
      }

      return undefined;
    }

    setLoading(true);
    setError('');

    const unsubscribe = watchChatThread({
      chatId,
      currentUserId,
      onError: nextError => {
        setError(nextError?.message || 'Unable to sync chat thread');
        setLoading(false);
      },
      onMessages: nextMessages => {
        setMessages(nextMessages);
        setLoading(false);
      },
    });

    return () => unsubscribe?.();
  }, [chatId, contactUid, currentUserId, initializing, sessionReady]);

  useEffect(() => {
    if (!contactUid) {
      setPresenceSnapshot(null);
      return undefined;
    }

    let active = true;
    let unsubscribe = () => {};

    loadChatIdentityTargets(contactUid)
      .then(targetUids => {
        if (!active) {
          return;
        }

        unsubscribe = watchChatPresence(
          targetUids.length ? targetUids : contactUid,
          setPresenceSnapshot,
        );
      })
      .catch(() => {
        if (!active) {
          return;
        }

        unsubscribe = watchChatPresence(contactUid, setPresenceSnapshot);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [contactUid]);

  useEffect(() => {
    if (!sessionReady || !chatId || !contactUid) {
      return undefined;
    }

    const unsubscribe = watchTypingStatus(
      chatId,
      contactUid,
      setTypingIndicator,
    );

    return () => unsubscribe?.();
  }, [chatId, contactUid, sessionReady]);

  const handleInputChange = useCallback(
    value => {
      setInput(value);

      if (!sessionReady || !chatId || !currentUserId) {
        return;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setTyping({
        chatId,
        currentUserId,
        value,
      }).catch(() => null);

      typingTimeoutRef.current = setTimeout(() => {
        setTypingState({
          chatId,
          currentUserId,
          value: '',
        }).catch(() => null);
      }, 800);
    },
    [chatId, currentUserId, sessionReady],
  );

  useEffect(() => {
    return () => {
      if (!sessionReady || !chatId || !currentUserId) {
        return;
      }

      setTypingState({
        chatId,
        currentUserId,
        value: '',
      }).catch(() => null);
    };
  }, [chatId, currentUserId, sessionReady]);

  const handleSend = useCallback(async () => {
    const trimmedValue = input.trim();

    if (!trimmedValue) {
      return;
    }

    if (!sessionReady || !chatId || !currentUserId || !contactUid) {
      setError('Invalid chat session');
      return;
    }

    const draft =
      retryDraftRef.current?.text === trimmedValue
        ? retryDraftRef.current
        : createOutgoingDraft(trimmedValue);

    retryDraftRef.current = draft;

    setSending(true);
    setError('');
    setInput('');

    try {
      await sendChatMessage({
        chatId,
        contactUserId: contactUid,
        clientMessageId: draft.clientMessageId,
        currentUserId,
        memberIds,
        messageId: draft.messageId,
        value: trimmedValue,
      });

      retryDraftRef.current = null;
    } catch (nextError) {
      retryDraftRef.current = draft;
      setInput(trimmedValue);
      setError(nextError?.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  }, [chatId, contactUid, currentUserId, input, memberIds, sessionReady]);

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    listRef.current?.scrollToEnd({animated: true});
  }, [messages]);

  const presenceLabel = useMemo(
    () => formatPresenceLabel({typing, presence}),
    [typing, presence],
  );

  const contactLabel = pickContactLabel(contact);

  return {
    contactAvatar: contact?.avatar || '',
    contactAvatarLabel: getAvatarLabel(contactLabel),
    contactLabel,
    error,
    input,
    listRef,
    loading,
    messages,
    onBack: () => navigation.goBack(),
    onInputChange: handleInputChange,
    onSend: handleSend,
    presenceLabel,
    sending,
  };
}
