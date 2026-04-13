import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import VehicleModuleScreen from '../../components/VehicleModuleScreen';
import VehicleThemeSelector from '../../components/VehicleThemeSelector';
import {
  VehicleBadge,
  VehiclePanel,
  VehicleSectionHeader,
} from '../../components/VehicleUi';
import {
  vehicleApplications,
  vehicleDashboardStats,
  vehiclePipeline,
  vehicleQuickActions,
  vehicleTasks,
} from '../../data/mockData';
import VehicleTaskList from '../component/VehicleTaskList';
import {
  formatCompactCurrency,
  getVehicleTheme,
  withOpacity,
} from '../../theme/uiTheme';

export default function Dashboard() {
  const navigation = useNavigation();
  const uiTheme = useSelector(state => state.module.uiTheme);
  const theme = getVehicleTheme(uiTheme);

  return (
    <VehicleModuleScreen
      theme={theme}
      title="Vehicle Loan Desk"
      subtitle="A market-style command center for sourcing, credit review, sanction, and disbursal tracking."
      heroStats={vehicleDashboardStats}>
      <VehiclePanel theme={theme}>
        <VehicleThemeSelector theme={theme} />
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Quick Actions"
          subtitle="Use the same shortcuts your field, sales, and credit teams typically need first."
          theme={theme}
        />

        <View style={styles.actionGrid}>
          {vehicleQuickActions.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate(item.route)}
              style={[
                styles.actionCard,
                index % 2 === 0 && styles.actionCardSpaced,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.borderColor,
                },
              ]}>
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: withOpacity(
                      theme.accentStrong,
                      theme.isDark ? 0.2 : 0.1,
                    ),
                  },
                ]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={theme.accentStrong}
                />
              </View>
              <Text style={[styles.actionLabel, {color: theme.textPrimary}]}>
                {item.label}
              </Text>
              <Text
                style={[
                  styles.actionDescription,
                  {color: theme.textSecondary},
                ]}>
                {item.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Pipeline Snapshot"
          subtitle="A realistic branch-level funnel from lead capture to final payout."
          actionLabel="Open Pipeline"
          onActionPress={() => navigation.navigate('Applications')}
          theme={theme}
        />

        {vehiclePipeline.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.pipelineRow,
              index !== vehiclePipeline.length - 1 && styles.pipelineRowDivider,
              index !== vehiclePipeline.length - 1 && {
                borderBottomColor: theme.borderColor,
              },
            ]}>
            <View style={styles.pipelineCopy}>
              <Text style={[styles.pipelineTitle, {color: theme.textPrimary}]}>
                {item.label}
              </Text>
              <Text
                style={[styles.pipelineAmount, {color: theme.textSecondary}]}>
                {item.amount}
              </Text>
            </View>
            <View
              style={[
                styles.pipelineCount,
                {
                  backgroundColor: withOpacity(
                    theme.accentStrong,
                    theme.isDark ? 0.2 : 0.1,
                  ),
                },
              ]}>
              <Text
                style={[styles.pipelineCountText, {color: theme.accentStrong}]}>
                {item.count}
              </Text>
            </View>
          </View>
        ))}
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Hot Applications"
          subtitle="Live cases that need officer attention right now."
          actionLabel="View All"
          onActionPress={() => navigation.navigate('Applications')}
          theme={theme}
        />

        {vehicleApplications.slice(0, 3).map((application, index) => (
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
              index === 2 && styles.lastCard,
            ]}>
            <View style={styles.applicationHeader}>
              <View>
                <Text
                  style={[styles.applicationId, {color: theme.accentStrong}]}>
                  {application.id}
                </Text>
                <Text
                  style={[styles.applicationName, {color: theme.textPrimary}]}>
                  {application.applicantName}
                </Text>
              </View>
              <VehicleBadge
                label={application.stage}
                stage={application.stage}
                theme={theme}
              />
            </View>

            <Text
              style={[styles.applicationMeta, {color: theme.textSecondary}]}>
              {application.vehicle} | {application.city} |{' '}
              {application.productType}
            </Text>

            <View style={styles.valueRow}>
              <MetricBlock
                label="Loan"
                value={formatCompactCurrency(application.requestedAmount)}
                theme={theme}
              />
              <MetricBlock
                label="EMI"
                value={formatCompactCurrency(application.emi)}
                theme={theme}
              />
              <MetricBlock
                label="Bureau"
                value={`${application.bureau}`}
                theme={theme}
              />
            </View>

            <View style={styles.footerRow}>
              <Text style={[styles.nextAction, {color: theme.textMuted}]}>
                {application.nextAction}
              </Text>
              <Text style={[styles.updatedAt, {color: theme.textMuted}]}>
                {application.lastUpdated}
              </Text>
            </View>
          </Pressable>
        ))}
      </VehiclePanel>

      <VehicleTaskList
        tasks={vehicleTasks}
        theme={theme}
        onSelectTask={() => navigation.navigate('Applications')}
      />
    </VehicleModuleScreen>
  );
}

function MetricBlock({label, value, theme}) {
  return (
    <View
      style={[
        styles.metricBlock,
        {
          backgroundColor: withOpacity(
            theme.textPrimary,
            theme.isDark ? 0.12 : 0.05,
          ),
        },
      ]}>
      <Text style={[styles.metricBlockValue, {color: theme.textPrimary}]}>
        {value}
      </Text>
      <Text style={[styles.metricBlockLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  actionCardSpaced: {
    marginRight: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  pipelineRow: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pipelineRowDivider: {
    borderBottomWidth: 1,
  },
  pipelineCopy: {
    flex: 1,
    paddingRight: 12,
  },
  pipelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  pipelineAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  pipelineCount: {
    minWidth: 44,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pipelineCountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  applicationCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  lastCard: {
    marginBottom: 0,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  applicationId: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  applicationName: {
    fontSize: 17,
    fontWeight: '800',
  },
  applicationMeta: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricBlock: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginRight: 10,
  },
  metricBlockValue: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  metricBlockLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextAction: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    paddingRight: 12,
  },
  updatedAt: {
    fontSize: 12,
    fontWeight: '700',
  },
});
