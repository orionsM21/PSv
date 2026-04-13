export function buildChatId(uid1, uid2) {
  return [uid1, uid2].filter(Boolean).sort().join('_');
}

export function validateOutgoingMessage(value = '') {
  const text = String(value).trim();

  if (!text) {
    return {
      error: 'Type a message before sending.',
      valid: false,
    };
  }

  return {
    valid: true,
    value: text,
  };
}

export function formatChatTimestamp(timestamp) {
  if (!timestamp) {
    return '';
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPresenceLabel({typing, presence}) {
  if (typing) {
    return 'typing...';
  }

  if (presence?.online) {
    return 'online';
  }

  if (presence?.lastSeen) {
    return `last seen ${new Date(presence.lastSeen).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  return 'offline';
}
