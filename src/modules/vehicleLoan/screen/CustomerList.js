import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import VehicleModuleScreen from '../components/VehicleModuleScreen';
import {
  VehicleBadge,
  VehiclePanel,
  VehicleSectionHeader,
} from '../components/VehicleUi';
import {vehicleCustomers} from '../data/mockData';
import {
  formatCompactCurrency,
  getVehicleTheme,
  withOpacity,
} from '../theme/uiTheme';

const CUSTOMER_FILTERS = ['All', 'Active', 'Pending', 'Sanctioned', 'Repeat'];

export default function CustomerList() {
  const navigation = useNavigation();
  const uiTheme = useSelector(state => state.module.uiTheme);
  const theme = getVehicleTheme(uiTheme);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const customers = vehicleCustomers.filter(customer => {
    const matchesQuery =
      `${customer.name} ${customer.loanId} ${customer.city} ${customer.vehicle}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' || customer.status === activeFilter;

    return matchesQuery && matchesFilter;
  });

  return (
    <VehicleModuleScreen
      theme={theme}
      title="Customer Book"
      subtitle="Manage the borrower base, renewals, repeat prospects, and relationship touchpoints across your vehicle portfolio."
      heroStats={[
        {label: 'Customers', value: `${vehicleCustomers.length}`},
        {label: 'Repeat Base', value: '1'},
        {label: 'Zero DPD', value: '4'},
      ]}>
      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Portfolio Search"
          subtitle="A market-style customer ledger with quick search and service categories."
          theme={theme}
        />

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.borderColor,
            },
          ]}>
          <Ionicons name="search-outline" size={18} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by customer, loan ID, city, or vehicle"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, {color: theme.textPrimary}]}
          />
        </View>

        <View style={styles.filterRow}>
          {CUSTOMER_FILTERS.map(filter => {
            const active = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? withOpacity(
                          theme.accentStrong,
                          theme.isDark ? 0.22 : 0.12,
                        )
                      : theme.surfaceAlt,
                    borderColor: active
                      ? withOpacity(theme.accentStrong, 0.36)
                      : theme.borderColor,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    {color: active ? theme.accentStrong : theme.textSecondary},
                  ]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Customer Listing"
          subtitle={`${customers.length} borrower profile(s) in your current filter.`}
          theme={theme}
        />

        {customers.map((customer, index) => (
          <Pressable
            key={customer.id}
            onPress={() => {
              if (customer.applicationId) {
                navigation.navigate('Application Details', {
                  applicationId: customer.applicationId,
                });
                return;
              }

              navigation.navigate('Applications');
            }}
            style={[
              styles.customerCard,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: theme.borderColor,
              },
              index === customers.length - 1 && styles.noMarginBottom,
            ]}>
            <View style={styles.customerHeader}>
              <View style={styles.customerHeaderCopy}>
                <Text style={[styles.loanId, {color: theme.accentStrong}]}>
                  {customer.loanId}
                </Text>
                <Text style={[styles.customerName, {color: theme.textPrimary}]}>
                  {customer.name}
                </Text>
                <Text
                  style={[styles.customerMeta, {color: theme.textSecondary}]}>
                  {customer.vehicle} | {customer.city} | {customer.segment}
                </Text>
              </View>
              <VehicleBadge label={customer.status} theme={theme} />
            </View>

            <View style={styles.metricsRow}>
              <SmallMetric
                label="EMI"
                value={formatCompactCurrency(customer.emi)}
                theme={theme}
              />
              <SmallMetric
                label="DPD"
                value={`${customer.dpd}`}
                theme={theme}
              />
            </View>

            <View
              style={[
                styles.touchpointCard,
                {
                  backgroundColor: withOpacity(
                    theme.accent,
                    theme.isDark ? 0.18 : 0.08,
                  ),
                },
              ]}>
              <Ionicons
                name="call-outline"
                size={15}
                color={theme.accentStrong}
                style={styles.touchpointIcon}
              />
              <Text
                style={[styles.touchpointText, {color: theme.accentStrong}]}>
                Next touchpoint: {customer.nextTouchpoint}
              </Text>
            </View>
          </Pressable>
        ))}
      </VehiclePanel>
    </VehicleModuleScreen>
  );
}

function SmallMetric({label, value, theme}) {
  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: withOpacity(
            theme.textPrimary,
            theme.isDark ? 0.12 : 0.05,
          ),
        },
      ]}>
      <Text style={[styles.metricValue, {color: theme.textPrimary}]}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customerCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  noMarginBottom: {
    marginBottom: 0,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerHeaderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  loanId: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  customerMeta: {
    fontSize: 13,
    lineHeight: 19,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  touchpointCard: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchpointIcon: {
    marginRight: 8,
  },
  touchpointText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
});
