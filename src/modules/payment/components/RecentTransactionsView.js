import React, {memo, useCallback} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, EmptyState, Loader} from '../../../design-system/components';
import {designTheme} from '../../../design-system/theme';
import paymentTheme from '../theme';

const STATUS_TONES = {
  SUCCESS: designTheme.semanticColors.success,
  FAILURE: designTheme.semanticColors.danger,
  INITIATED: designTheme.semanticColors.warning,
};

const SummaryStat = memo(function SummaryStat({label, value}) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
});

const FilterChip = memo(function FilterChip({item, active, onPress}) {
  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.filterChip, active ? styles.filterChipActive : null]}>
      <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>
        {item.label}
      </Text>
    </Pressable>
  );
});

const TransactionCard = memo(function TransactionCard({item}) {
  return (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionTopRow}>
        <Text style={styles.transactionUpi}>{item.upiId}</Text>
        <Text style={styles.transactionAmount}>{`Rs ${item.amount}`}</Text>
      </View>
      <View style={styles.transactionBottomRow}>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleString()}
        </Text>
        <Text
          style={[
            styles.transactionStatus,
            {color: STATUS_TONES[item.status] || designTheme.semanticColors.info},
          ]}>
          {item.status}
        </Text>
      </View>
    </Card>
  );
});

export default function RecentTransactionsView({
  filters,
  activeFilter,
  transactions,
  summary,
  loading,
  refreshing,
  onFilterChange,
  onRefresh,
}) {
  const renderItem = useCallback(
    ({item}) => <TransactionCard item={item} />,
    [],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        <LinearGradient colors={paymentTheme.moduleGradient} style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Digital Payments</Text>
          <Text style={styles.heroTitle}>Recent Transactions</Text>
          <Text style={styles.heroSubtitle}>
            Review payment history, status trends, and total movement from the payment workspace.
          </Text>

          <View style={styles.summaryRow}>
            <SummaryStat label="Total" value={summary.total} />
            <SummaryStat label="Success" value={summary.success} />
            <SummaryStat label="Pending" value={summary.pending} />
          </View>
        </LinearGradient>

        <View style={styles.filterRow}>
          {filters.map(filter => (
            <FilterChip
              key={filter.id}
              item={filter}
              active={filter.id === activeFilter}
              onPress={onFilterChange}
            />
          ))}
        </View>
      </View>
    ),
    [activeFilter, filters, onFilterChange, summary.pending, summary.success, summary.total],
  );

  return (
    <LinearGradient colors={paymentTheme.moduleGradient} style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            loading ? (
              <Loader label="Loading transactions..." />
            ) : (
              <EmptyState
                title="No transactions yet"
                description="Payments you initiate will appear here once activity starts."
              />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={designTheme.colors.white}
            />
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: designTheme.spacing[4],
    paddingBottom: designTheme.spacing[6],
    flexGrow: 1,
  },
  heroCard: {
    borderRadius: designTheme.radii.xl,
    padding: designTheme.spacing[5],
    marginBottom: designTheme.spacing[4],
  },
  heroEyebrow: {
    ...designTheme.typography.label,
    color: '#D8ECFF',
  },
  heroTitle: {
    marginTop: designTheme.spacing[2],
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: designTheme.colors.white,
  },
  heroSubtitle: {
    ...designTheme.typography.body,
    marginTop: designTheme.spacing[2],
    color: 'rgba(255,255,255,0.8)',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: designTheme.spacing[3],
    marginTop: designTheme.spacing[5],
  },
  summaryStat: {
    flex: 1,
    padding: designTheme.spacing[4],
    borderRadius: designTheme.radii.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  summaryValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: designTheme.colors.white,
  },
  summaryLabel: {
    ...designTheme.typography.caption,
    marginTop: designTheme.spacing[1],
    color: 'rgba(255,255,255,0.72)',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTheme.spacing[2],
    marginBottom: designTheme.spacing[3],
  },
  filterChip: {
    paddingHorizontal: designTheme.spacing[4],
    paddingVertical: designTheme.spacing[2],
    borderRadius: designTheme.radii.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  filterChipActive: {
    backgroundColor: designTheme.colors.white,
  },
  filterText: {
    ...designTheme.typography.caption,
    color: designTheme.colors.white,
  },
  filterTextActive: {
    color: designTheme.semanticColors.primary,
  },
  transactionCard: {
    marginBottom: designTheme.spacing[3],
  },
  transactionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: designTheme.spacing[3],
  },
  transactionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: designTheme.spacing[3],
    marginTop: designTheme.spacing[2],
  },
  transactionUpi: {
    ...designTheme.typography.bodyStrong,
    flex: 1,
  },
  transactionAmount: {
    ...designTheme.typography.bodyStrong,
  },
  transactionDate: {
    ...designTheme.typography.caption,
    flex: 1,
  },
  transactionStatus: {
    ...designTheme.typography.caption,
    fontWeight: '700',
  },
});
