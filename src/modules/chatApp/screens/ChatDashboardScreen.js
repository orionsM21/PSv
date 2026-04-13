import React from 'react';
import ChatDashboardView from '../components/ChatDashboardView';
import useChatDashboard from '../hooks/useChatDashboard';

export default function ChatDashboardScreen() {
  const dashboard = useChatDashboard();

  return <ChatDashboardView {...dashboard} />;
}
