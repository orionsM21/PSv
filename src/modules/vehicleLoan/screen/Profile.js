import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import VehicleModuleScreen from '../components/VehicleModuleScreen';
import VehicleThemeSelector from '../components/VehicleThemeSelector';
import {
  VehicleBadge,
  VehicleInfoRow,
  VehiclePanel,
  VehicleSectionHeader,
} from '../components/VehicleUi';
import {vehicleProfile} from '../data/mockData';
import {getVehicleTheme, withOpacity} from '../theme/uiTheme';

export default function Profile() {
  const uiTheme = useSelector(state => state.module.uiTheme);
  const theme = getVehicleTheme(uiTheme);

  return (
    <VehicleModuleScreen
      theme={theme}
      title="Officer Profile"
      subtitle="Branch performance, compliance readiness, and personal settings for the vehicle finance desk."
      heroStats={[
        {label: 'Approval Rate', value: '86%'},
        {label: 'Live Dealers', value: '34'},
        {label: 'Avg TAT', value: '4.3h'},
      ]}>
      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Relationship Manager Snapshot"
          subtitle="A clean market-style profile card for demos, handoffs, and daily branch operations."
          theme={theme}
        />

        <View style={styles.profileHero}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: withOpacity(
                  theme.accentStrong,
                  theme.isDark ? 0.26 : 0.12,
                ),
              },
            ]}>
            <Text style={[styles.avatarText, {color: theme.accentStrong}]}>
              SM
            </Text>
          </View>

          <View style={styles.profileCopy}>
            <Text style={[styles.name, {color: theme.textPrimary}]}>
              {vehicleProfile.officerName}
            </Text>
            <Text style={[styles.role, {color: theme.textSecondary}]}>
              {vehicleProfile.role}
            </Text>
            <View style={styles.badgeRow}>
              <VehicleBadge
                label={vehicleProfile.branch}
                theme={theme}
                tone="accent"
              />
              <View style={styles.inlineSpacer} />
              <VehicleBadge
                label={vehicleProfile.region}
                theme={theme}
                tone="info"
              />
            </View>
          </View>
        </View>

        <VehicleInfoRow
          icon="id-card-outline"
          label="Employee ID"
          value={vehicleProfile.employeeId}
          theme={theme}
        />
        <VehicleInfoRow
          icon="call-outline"
          label="Phone"
          value={vehicleProfile.phone}
          theme={theme}
        />
        <VehicleInfoRow
          icon="mail-outline"
          label="Email"
          value={vehicleProfile.email}
          theme={theme}
          isLast
        />
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Performance Board"
          subtitle="Metrics that sales and branch heads usually check first."
          theme={theme}
        />

        <View style={styles.performanceGrid}>
          {vehicleProfile.performance.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.performanceCard,
                index % 2 === 0 && styles.performanceCardSpaced,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.borderColor,
                },
              ]}>
              <Text
                style={[styles.performanceValue, {color: theme.textPrimary}]}>
                {item.value}
              </Text>
              <Text
                style={[styles.performanceLabel, {color: theme.textSecondary}]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Compliance Checklist"
          subtitle="Daily control points that make the module feel operationally real."
          theme={theme}
        />

        {vehicleProfile.checklist.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.checklistRow,
              index !== vehicleProfile.checklist.length - 1 &&
                styles.checklistDivider,
              index !== vehicleProfile.checklist.length - 1 && {
                borderBottomColor: theme.borderColor,
              },
            ]}>
            <Text style={[styles.checklistLabel, {color: theme.textPrimary}]}>
              {item.label}
            </Text>
            <VehicleBadge
              label={item.status}
              theme={theme}
              tone={
                item.status === 'Done'
                  ? 'success'
                  : item.status === 'In Progress'
                  ? 'warning'
                  : 'danger'
              }
            />
          </View>
        ))}
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Theme Control"
          subtitle="Apply one consistent style across dashboard, applications, customer book, and forms."
          theme={theme}
        />
        <VehicleThemeSelector theme={theme} />
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Current Focus"
          subtitle="Short operating goals for this branch cycle."
          theme={theme}
        />

        {vehicleProfile.focusAreas.map((item, index) => (
          <View
            key={item}
            style={[
              styles.focusCard,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: theme.borderColor,
              },
              index === vehicleProfile.focusAreas.length - 1 &&
                styles.noMarginBottom,
            ]}>
            <Text style={[styles.focusText, {color: theme.textSecondary}]}>
              {item}
            </Text>
          </View>
        ))}
      </VehiclePanel>
    </VehicleModuleScreen>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  inlineSpacer: {
    width: 8,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  performanceCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  performanceCardSpaced: {
    marginRight: 12,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  performanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checklistRow: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checklistDivider: {
    borderBottomWidth: 1,
  },
  checklistLabel: {
    flex: 1,
    paddingRight: 12,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  focusCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  focusText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  noMarginBottom: {
    marginBottom: 0,
  },
});
