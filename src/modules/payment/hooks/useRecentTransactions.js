import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  buildRecentTransactionSummary,
  filterRecentTransactions,
  TRANSACTION_FILTERS,
} from '../business/recentTransactions.rules';
import {loadRecentTransactions} from '../services/recentTransactions.service';

export default function useRecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hydrateTransactions = useCallback(async () => {
    const nextTransactions = await loadRecentTransactions();
    setTransactions(nextTransactions);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        setLoading(true);
        const nextTransactions = await loadRecentTransactions();

        if (isMounted) {
          setTransactions(nextTransactions);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTransactions = useMemo(
    () => filterRecentTransactions(transactions, activeFilter),
    [activeFilter, transactions],
  );

  const summary = useMemo(
    () => buildRecentTransactionSummary(transactions),
    [transactions],
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await hydrateTransactions();
    } finally {
      setRefreshing(false);
    }
  }, [hydrateTransactions]);

  return {
    filters: TRANSACTION_FILTERS,
    activeFilter,
    transactions: filteredTransactions,
    summary,
    loading,
    refreshing,
    onFilterChange: setActiveFilter,
    onRefresh: handleRefresh,
  };
}
