import React from 'react';
import RecentTransactionsView from '../components/RecentTransactionsView';
import useRecentTransactions from '../hooks/useRecentTransactions';

export default function RecentTransactionsScreen() {
  const transactions = useRecentTransactions();

  return <RecentTransactionsView {...transactions} />;
}
