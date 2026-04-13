export const TRANSACTION_FILTERS = [
  {id: 'all', label: 'All'},
  {id: 'SUCCESS', label: 'Successful'},
  {id: 'FAILURE', label: 'Failed'},
  {id: 'INITIATED', label: 'Pending'},
];

export function mapRecentTransactions(rawTransactions = []) {
  return rawTransactions
    .map(transaction => ({
      id: transaction?.id || `${transaction?.date || Date.now()}`,
      upiId: transaction?.upiId || 'Unknown receiver',
      amount: Number(transaction?.amount || 0),
      status: transaction?.status || 'INITIATED',
      date: transaction?.date || new Date().toISOString(),
    }))
    .sort(
      (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
    );
}

export function filterRecentTransactions(transactions, activeFilter) {
  if (!activeFilter || activeFilter === 'all') {
    return transactions;
  }

  return transactions.filter(transaction => transaction.status === activeFilter);
}

export function buildRecentTransactionSummary(transactions = []) {
  return transactions.reduce(
    (summary, transaction) => {
      summary.total += 1;
      summary.amount += transaction.amount;

      if (transaction.status === 'SUCCESS') {
        summary.success += 1;
      }

      if (transaction.status === 'FAILURE') {
        summary.failure += 1;
      }

      if (transaction.status === 'INITIATED') {
        summary.pending += 1;
      }

      return summary;
    },
    {
      total: 0,
      amount: 0,
      success: 0,
      failure: 0,
      pending: 0,
    },
  );
}
