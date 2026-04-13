import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import VehicleModuleScreen from '../components/VehicleModuleScreen';
import {
  VehicleBadge,
  VehiclePanel,
  VehicleSectionHeader,
} from '../components/VehicleUi';
import {vehicleApplications} from '../data/mockData';
import {
  formatCompactCurrency,
  getVehicleTheme,
  withOpacity,
} from '../theme/uiTheme';

const STAGE_FILTERS = [
  'All',
  'Lead Intake',
  'KYC & Docs',
  'Credit Review',
  'Sanction',
  'Disbursal',
];

export default function Applications() {
  const navigation = useNavigation();
  const uiTheme = useSelector(state => state.module.uiTheme);
  const theme = getVehicleTheme(uiTheme);
  const [query, setQuery] = useState('');
  const [activeStage, setActiveStage] = useState('All');

  const filteredApplications = useMemo(
    () =>
      vehicleApplications.filter(application => {
        const matchesSearch =
          `${application.id} ${application.applicantName} ${application.vehicle} ${application.city}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesStage =
          activeStage === 'All' || application.stage === activeStage;

        return matchesSearch && matchesStage;
      }),
    [activeStage, query],
  );

  return (
    <VehicleModuleScreen
      theme={theme}
      title="Applications Pipeline"
      subtitle="Track open cases with a tighter branch-style queue and faster scanability."
      compactHero
      heroStats={[
        {label: 'Open', value: `${vehicleApplications.length}`},
        {label: 'Docs', value: '2'},
        {label: 'Payout', value: '1'},
      ]}>
      <VehiclePanel theme={theme} style={styles.panelCompact}>
        <VehicleSectionHeader
          title="Worklist"
          subtitle={`${filteredApplications.length} application(s) in your current queue.`}
          actionLabel="New Case"
          onActionPress={() => navigation.navigate('New Application')}
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
          <Ionicons name="search-outline" size={16} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search loan ID, customer, city, or vehicle"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, {color: theme.textPrimary}]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {STAGE_FILTERS.map(stage => {
            const active = activeStage === stage;

            return (
              <Pressable
                key={stage}
                onPress={() => setActiveStage(stage)}
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
                  {stage}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredApplications.map((application, index) => (
          <Pressable
            key={application.id}
            onPress={() =>
              navigation.navigate('Application Details', {
                applicationId: application.id,
              })
            }
            style={[
              styles.applicationCard,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: theme.borderColor,
              },
              index === filteredApplications.length - 1 &&
                styles.noMarginBottom,
            ]}>
            <View style={styles.applicationTopRow}>
              <View style={styles.applicationHeaderCopy}>
                <Text
                  style={[styles.applicationId, {color: theme.accentStrong}]}>
                  {application.id}
                </Text>
                <Text
                  style={[styles.applicantName, {color: theme.textPrimary}]}>
                  {application.applicantName}
                </Text>
                <Text
                  style={[
                    styles.applicationMeta,
                    {color: theme.textSecondary},
                  ]}>
                  {application.vehicle} | {application.city} |{' '}
                  {application.dealer}
                </Text>
              </View>

              <View style={styles.badgeColumn}>
                <VehicleBadge
                  label={application.stage}
                  stage={application.stage}
                  theme={theme}
                />
                <View style={styles.badgeSpacer} />
                <VehicleBadge
                  label={application.status}
                  theme={theme}
                  tone="warning"
                />
              </View>
            </View>

            <View style={styles.metricRow}>
              <SummaryMetric
                label="Requested"
                value={formatCompactCurrency(application.requestedAmount)}
                theme={theme}
              />
              <SummaryMetric
                label="EMI"
                value={formatCompactCurrency(application.emi)}
                theme={theme}
              />
              <SummaryMetric
                label="Bureau"
                value={`${application.bureau}`}
                theme={theme}
              />
              <SummaryMetric
                label="TAT"
                value={application.turnaroundTime}
                theme={theme}
              />
            </View>

            <View style={styles.applicationFooter}>
              <Text
                numberOfLines={2}
                style={[styles.nextStep, {color: theme.textMuted}]}>
                Next: {application.nextAction}
              </Text>
              <Text style={[styles.lastUpdated, {color: theme.textMuted}]}>
                {application.lastUpdated}
              </Text>
            </View>
          </Pressable>
        ))}
      </VehiclePanel>
    </VehicleModuleScreen>
  );
}

function SummaryMetric({label, value, theme}) {
  return (
    <View
      style={[
        styles.summaryMetric,
        {
          backgroundColor: withOpacity(
            theme.textPrimary,
            theme.isDark ? 0.12 : 0.05,
          ),
        },
      ]}>
      <Text
        numberOfLines={1}
        style={[styles.summaryMetricValue, {color: theme.textPrimary}]}>
        {value}
      </Text>
      <Text style={[styles.summaryMetricLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panelCompact: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    paddingVertical: 10,
  },
  filtersContent: {
    paddingBottom: 12,
    paddingRight: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  applicationCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
  },
  noMarginBottom: {
    marginBottom: 0,
  },
  applicationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationHeaderCopy: {
    flex: 1,
    paddingRight: 10,
  },
  applicationId: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  applicationMeta: {
    fontSize: 12,
    lineHeight: 18,
  },
  badgeColumn: {
    alignItems: 'flex-end',
    width: 112,
  },
  badgeSpacer: {
    height: 6,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryMetric: {
    width: '23%',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  summaryMetricValue: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryMetricLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  nextStep: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    paddingRight: 10,
  },
  lastUpdated: {
    fontSize: 11,
    fontWeight: '700',
  },
});
