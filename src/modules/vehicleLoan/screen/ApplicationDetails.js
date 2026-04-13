import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';

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

export default function ApplicationDetails() {
  const route = useRoute();
  const uiTheme = useSelector(state => state.module.uiTheme);
  const theme = getVehicleTheme(uiTheme);

  const application =
    route.params?.application ||
    vehicleApplications.find(item => item.id === route.params?.applicationId) ||
    vehicleApplications[0];

  const docs = application.docs || [];
  const verifiedCount = docs.filter(item => item.status === 'Verified').length;
  const receivedCount = docs.filter(
    item => item.status === 'Received' || item.status === 'Captured',
  ).length;
  const pendingCount = docs.length - verifiedCount - receivedCount;

  return (
    <VehicleModuleScreen
      theme={theme}
      title={application.id}
      subtitle={`${application.applicantName} | ${application.vehicle} | ${application.city}`}
      showBack
      compactHero
      heroStats={[
        {
          label: 'Loan',
          value: formatCompactCurrency(application.requestedAmount),
        },
        {label: 'EMI', value: formatCompactCurrency(application.emi)},
        {label: 'TAT', value: application.turnaroundTime || '--'},
      ]}>
      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Case Summary"
          subtitle="Compact borrower, asset, and credit snapshot for quick review."
          theme={theme}
        />

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.borderColor,
            },
          ]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={[styles.caseId, {color: theme.accentStrong}]}>
                {application.id}
              </Text>
              <Text style={[styles.applicantName, {color: theme.textPrimary}]}>
                {application.applicantName}
              </Text>
              <Text style={[styles.metaLine, {color: theme.textSecondary}]}>
                {application.vehicle} | {application.city} |{' '}
                {application.dealer}
              </Text>
            </View>

            <View style={styles.heroBadgeColumn}>
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

          <View style={styles.metricGrid}>
            <CompactMetric
              label="Requested"
              value={formatCompactCurrency(application.requestedAmount)}
              theme={theme}
            />
            <CompactMetric
              label="Approved"
              value={
                application.approvedAmount
                  ? formatCompactCurrency(application.approvedAmount)
                  : 'Pending'
              }
              theme={theme}
            />
            <CompactMetric label="LTV" value={application.ltv} theme={theme} />
            <CompactMetric
              label="Tenor"
              value={`${application.tenor}M`}
              theme={theme}
            />
          </View>

          <View style={styles.keyGrid}>
            <KeyTile
              label="Channel"
              value={application.sourcingChannel}
              theme={theme}
            />
            <KeyTile
              label="Product"
              value={application.productType}
              theme={theme}
            />
            <KeyTile
              label="Branch"
              value={application.branch || '--'}
              theme={theme}
            />
            <KeyTile
              label="Risk Band"
              value={application.riskBand || '--'}
              theme={theme}
            />
            <KeyTile
              label="Officer"
              value={application.assignedOfficer || '--'}
              theme={theme}
            />
            <KeyTile
              label="Last Updated"
              value={application.lastUpdated || '--'}
              theme={theme}
            />
          </View>
        </View>
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Credit & Capacity"
          subtitle="Underwriting signals and repayment strength in one denser view."
          theme={theme}
        />

        <View style={styles.metricGrid}>
          <CompactMetric
            label="Bureau"
            value={`${application.bureau}`}
            theme={theme}
          />
          <CompactMetric
            label="Income"
            value={formatCompactCurrency(application.income)}
            theme={theme}
          />
          <CompactMetric
            label="Obligations"
            value={formatCompactCurrency(application.obligations)}
            theme={theme}
          />
          <CompactMetric
            label="Down Payment"
            value={formatCompactCurrency(application.downPayment)}
            theme={theme}
          />
        </View>

        <View
          style={[
            styles.actionStrip,
            {
              backgroundColor: withOpacity(
                theme.accentStrong,
                theme.isDark ? 0.18 : 0.08,
              ),
              borderColor: withOpacity(
                theme.accentStrong,
                theme.isDark ? 0.28 : 0.16,
              ),
            },
          ]}>
          <View style={styles.actionCopy}>
            <Text style={[styles.actionLabel, {color: theme.accentStrong}]}>
              Next action
            </Text>
            <Text style={[styles.actionValue, {color: theme.accentStrong}]}>
              {application.nextAction}
            </Text>
          </View>
          <Text style={[styles.actionMeta, {color: theme.accentStrong}]}>
            {application.documentGap || '--'}
          </Text>
        </View>
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Document Checklist"
          subtitle="Quick document status before credit movement or payout release."
          theme={theme}
        />

        <View style={styles.metricGrid}>
          <CompactMetric
            label="Verified"
            value={`${verifiedCount}`}
            theme={theme}
          />
          <CompactMetric
            label="Received"
            value={`${receivedCount}`}
            theme={theme}
          />
          <CompactMetric
            label="Pending"
            value={`${pendingCount < 0 ? 0 : pendingCount}`}
            theme={theme}
          />
          <CompactMetric label="Docs" value={`${docs.length}`} theme={theme} />
        </View>

        {docs.map((item, index) => (
          <View
            key={item.name}
            style={[
              styles.docRow,
              index !== docs.length - 1 && styles.docDivider,
              index !== docs.length - 1 && {
                borderBottomColor: theme.borderColor,
              },
            ]}>
            <View style={styles.docCopy}>
              <Text style={[styles.docLabel, {color: theme.textPrimary}]}>
                {item.name}
              </Text>
            </View>
            <VehicleBadge
              label={item.status}
              theme={theme}
              tone={
                item.status === 'Verified'
                  ? 'success'
                  : item.status === 'Received' || item.status === 'Captured'
                  ? 'accent'
                  : 'warning'
              }
            />
          </View>
        ))}
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Journey Timeline"
          subtitle="A tighter operational timeline for the case journey."
          theme={theme}
        />

        {application.timeline?.map((item, index) => (
          <View key={`${item.label}-${index}`} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor:
                      item.status === 'done'
                        ? theme.success
                        : item.status === 'active'
                        ? theme.accentStrong
                        : withOpacity(theme.textMuted, 0.35),
                  },
                ]}
              />
              {index !== application.timeline.length - 1 ? (
                <View
                  style={[
                    styles.timelineLine,
                    {backgroundColor: withOpacity(theme.textMuted, 0.24)},
                  ]}
                />
              ) : null}
            </View>

            <View
              style={[
                styles.timelineCard,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.borderColor,
                },
              ]}>
              <Text style={[styles.timelineLabel, {color: theme.textPrimary}]}>
                {item.label}
              </Text>
              <Text style={[styles.timelineTime, {color: theme.textSecondary}]}>
                {item.time}
              </Text>
            </View>
          </View>
        ))}
      </VehiclePanel>
    </VehicleModuleScreen>
  );
}

function CompactMetric({label, value, theme}) {
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
      <Text
        numberOfLines={1}
        style={[styles.metricValue, {color: theme.textPrimary}]}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
    </View>
  );
}

function KeyTile({label, value, theme}) {
  return (
    <View
      style={[
        styles.keyTile,
        {backgroundColor: theme.surfaceAlt, borderColor: theme.borderColor},
      ]}>
      <Text style={[styles.keyLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.keyValue, {color: theme.textPrimary}]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 10,
  },
  caseId: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 12,
    lineHeight: 18,
  },
  heroBadgeColumn: {
    alignItems: 'flex-end',
    width: 112,
  },
  badgeSpacer: {
    width: 8,
    height: 6,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    width: '48.5%',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 11,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  keyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  keyTile: {
    width: '31.5%',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionStrip: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actionCopy: {
    flex: 1,
    paddingRight: 12,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  actionValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  actionMeta: {
    fontSize: 11,
    fontWeight: '800',
  },
  docRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docDivider: {
    borderBottomWidth: 1,
  },
  docCopy: {
    flex: 1,
    paddingRight: 12,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineRail: {
    width: 22,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 2,
  },
  timelineCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    marginLeft: 8,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '600',
  },
});
