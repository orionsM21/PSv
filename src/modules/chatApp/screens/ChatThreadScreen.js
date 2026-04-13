import React from 'react';
import ChatThreadView from '../components/ChatThreadView';
import useChatThread from '../hooks/useChatThread';

export default function ChatThreadScreen() {
  const thread = useChatThread();

  return <ChatThreadView {...thread} />;
}
