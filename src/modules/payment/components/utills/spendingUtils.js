// src/utils/spendingUtils.js
export const getChartDataFromTransactions = (transactions, days) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const categoryMap = {
    Food: 0,
    Travel: 0,
    Bills: 0,
    Shopping: 0,
  };

  transactions.forEach(txn => {
    const txnTime = new Date(txn.timestamp).getTime();
    if (txnTime >= cutoff && txn.amount < 0) {
      categoryMap[txn.category] =
        (categoryMap[txn.category] || 0) + Math.abs(txn.amount);
    }
  });

  return {
    labels: Object.keys(categoryMap),
    data: Object.values(categoryMap),
  };
};
