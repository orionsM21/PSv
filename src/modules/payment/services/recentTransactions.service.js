import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '../../../core/logging/logger';
import {mapRecentTransactions} from '../business/recentTransactions.rules';

const TXN_STORAGE_KEY = 'TXN_HISTORY';

const FALLBACK_TRANSACTIONS = [
  {
    id: 'txn-1',
    upiId: 'merchant@oksbi',
    amount: 850,
    status: 'SUCCESS',
    date: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'txn-2',
    upiId: 'travel@okhdfcbank',
    amount: 420,
    status: 'INITIATED',
    date: new Date(Date.now() - 7200 * 1000).toISOString(),
  },
  {
    id: 'txn-3',
    upiId: 'utility@okaxis',
    amount: 1250,
    status: 'FAILURE',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export async function loadRecentTransactions() {
  try {
    const rawTransactions = await AsyncStorage.getItem(TXN_STORAGE_KEY);
    const parsedTransactions = rawTransactions
      ? JSON.parse(rawTransactions)
      : FALLBACK_TRANSACTIONS;

    return mapRecentTransactions(parsedTransactions);
  } catch (error) {
    logger.warn('Failed to load payment transactions', {
      message: error?.message,
    });
    return mapRecentTransactions(FALLBACK_TRANSACTIONS);
  }
}
