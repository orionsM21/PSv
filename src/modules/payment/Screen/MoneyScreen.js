import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Card, SectionTitle, HOmeScreenButton } from '../ReuableComponent/Component';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import SpendingChart from '../components/SpendingChart';
import { DarkTheme, LightTheme } from '../components/theme';
import ChartSkeleton from '../components/ChartSkeleton';
import { getChartDataFromTransactions } from '../components/utills/spendingUtils';

const { width } = Dimensions.get('window');

const MoneyScreen = () => {
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : LightTheme;
  const [refreshing, setRefreshing] = useState(false);
  const [filterDays, setFilterDays] = useState(7);
  const [loadingChart, setLoadingChart] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // const transactions = [
  //   { title: 'Starbucks', amount: -240, time: 'Today • 10:45 AM' },
  //   { title: 'Uber', amount: -310, time: 'Yesterday • 8:10 PM' },
  //   { title: 'Salary Credit', amount: 25000, time: '1 Sep • 9:00 AM' },
  // ];
  const transactions = [
    {
      title: 'Starbucks',
      amount: -240,
      category: 'Food',
      timestamp: Date.now() - 2 * 86400000,
    },
    {
      title: 'Uber',
      amount: -310,
      category: 'Travel',
      timestamp: Date.now() - 5 * 86400000,
    },
    {
      title: 'Electricity Bill',
      amount: -1800,
      category: 'Bills',
      timestamp: Date.now() - 12 * 86400000,
    },
  ];

  const chartData = useMemo(
    () => getChartDataFromTransactions(transactions, filterDays),
    [transactions, filterDays]
  );

  const onFilterChange = days => {
    setLoadingChart(true);
    setFilterDays(days);
    setTimeout(() => setLoadingChart(false), 400); // UX delay
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* ===== BALANCE ===== */}
      <LinearGradient
        colors={['#2563EB', '#1E40AF']}
        style={styles.balanceCard}
      >
        <Text style={[styles.balanceTitle, { color: '#E5E7EB' }]}>
          Total Balance
        </Text>
        <Text style={styles.balanceAmount}>₹54,320.50</Text>

        <View style={styles.actionRow}>
          <HOmeScreenButton
            title="Add Money"
            onPress={() => navigation.navigate('FundTransfer')}
          />
          <HOmeScreenButton
            title="Send"
            onPress={() => navigation.navigate('FundTransfer')}
          />
        </View>
      </LinearGradient>

      {/* ===== LINKED ACCOUNTS ===== */}
      <SectionTitle title="Linked Accounts" style={styles.sectionSpacing} />
      <Card style={[styles.listCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>Axis Bank</Text>
        <Text style={[styles.listSub, { color: theme.subText }]}>
          Savings • ₹24,100
        </Text>
      </Card>

      <Card style={[styles.listCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>
          Wallet Balance
        </Text>
        <Text style={[styles.listSub, { color: theme.subText }]}>₹3,200</Text>
      </Card>

      {/* ===== TRANSACTIONS ===== */}
      <SectionTitle title="Recent Transactions" style={styles.sectionSpacing} />

      {transactions.map((txn, index) => (
        <Card
          key={index}
          style={[styles.transactionCard, { backgroundColor: theme.card }]}
        >
          <View>
            <Text style={[styles.txnTitle, { color: theme.text }]}>
              {txn.title}
            </Text>
            <Text style={[styles.txnTime, { color: theme.subText }]}>
              {txn.time}
            </Text>
          </View>

          <Text
            style={[
              styles.txnAmount,
              { color: txn.amount < 0 ? theme.danger : theme.success },
            ]}
          >
            {txn.amount < 0 ? '-' : '+'}₹{Math.abs(txn.amount)}
          </Text>
        </Card>
      ))}

      {/* ===== SPENDING CHART (HERE IT IS) ===== */}
      <SectionTitle title="Spending Analytics" style={styles.sectionSpacing} />
      {/* <Card style={{ backgroundColor: theme.card, padding: 12 }}>
        {/* <SpendingChart isDark={scheme === 'dark'} /> */}
      {/* </Card> */}



      {/* FILTER */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        {[7, 30].map(d => (
          <TouchableOpacity
            key={d}
            onPress={() => onFilterChange(d)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor:
                filterDays === d ? theme.primary : theme.card,
            }}
          >
            <Text
              style={{
                color: filterDays === d ? '#FFF' : theme.text,
                fontWeight: '600',
              }}
            >
              Last {d} days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CHART */}
      <Card style={{ backgroundColor: theme.card, padding: 12 }}>
        {loadingChart ? (
          <ChartSkeleton />
        ) : (
          <SpendingChart
            chartData={chartData}
            isDark={scheme === 'dark'}
          />
        )}
      </Card>

      {/* ===== INSIGHTS ===== */}
      <SectionTitle title="Spending Insights" style={styles.sectionSpacing} />
      <Card style={[styles.infoCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.infoText, { color: theme.text }]}>
          You spent ₹8,420 this month. Most expenses were on food and travel.
        </Text>
      </Card>
      <View style={{ height: 32 }} />


    </ScrollView>
  );
};

export default MoneyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  balanceCard: {
    borderRadius: 18,
    padding: 22,
    marginTop: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceTitle: {
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sectionSpacing: {
    marginTop: 28,
  },

  listCard: {
    padding: 16,
    marginTop: 10,
    borderRadius: 14,
    elevation: 3,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  listSub: {
    fontSize: 13,
    marginTop: 2,
  },

  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 10,
    borderRadius: 14,
    elevation: 3,
  },
  txnTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  txnTime: {
    fontSize: 12,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '700',
  },

  infoCard: {
    padding: 16,
    marginTop: 10,
    borderRadius: 14,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
