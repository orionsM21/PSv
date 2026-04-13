import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { DrawerContext } from '../../../../Drawer/DrawerContext.js';
import { BASE_URL } from '../../api/Endpoints';
import {
  filterUserActivity,
  formatBusinessRelativeTime,
  getRate,
} from '../../business/dashboardRules.js';
import { losColors, losThemes } from '../../theme/losTheme.js';
import DashboardCommandCenter from '../Component/DashboardCommandCenter.js';

const PERIOD_TABS = ['Overall', 'Last Month', 'Last Year'];

const SalesDashboard = () => {
  const navigation = useNavigation();
  const { openDrawer } = useContext(DrawerContext);
  const token = useSelector(state => state.auth.token);
  const mkc = useSelector(state => state.auth.losuserDetails);

  const [selectedTab, setSelectedTab] = useState('Overall');
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [inProgressApplications, setInProgressApplications] = useState([]);
  const [disbursedCase, setDisbursedCase] = useState([]);
  const [rejectedCase, setRejectedCase] = useState([]);
  const [rejectedLeadPool, setRejectedLeadPool] = useState([]);
  const [logsData, setLogsData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [businessDate, setBusinessDate] = useState(null);
  const [leadsLastMonthYear, setLeadsLastMonthYear] = useState({
    lastMonth: [],
    lastYear: [],
  });
  const [applicationsLastMonthYear, setApplicationsLastMonthYear] = useState({
    lastMonth: [],
    lastYear: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userInitials = `${mkc?.firstName?.[0] || ''}${mkc?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  const commonHeaders = useMemo(
    () => ({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  const getBusinessDate = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}getBusinessDate`, {
        headers: commonHeaders,
      });
      setBusinessDate(response?.data?.data || null);
    } catch (error) {
      console.error('Error fetching business date:', error);
    }
  }, [commonHeaders]);

  const getDashBoardCountAndList = useCallback(async () => {
    if (!mkc?.userName || !mkc?.role?.[0]?.roleName) {
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}getDashBoardCountAndList?userName=${mkc.userName}&roleName=${mkc.role[0].roleName}`,
        { headers: commonHeaders },
      );

      if (response?.data?.msgKey === 'Success') {
        const data = response?.data?.data || {};
        setTotalLeads(data?.totalLeadList || []);
        setInProgressApplications(data?.applicationInprogressDtoList || []);
        setDisbursedCase(data?.applicationDisbursedDtoList || []);
      }
    } catch (error) {
      console.error('Error fetching sales dashboard summary:', error.message || error);
    }
  }, [commonHeaders, mkc]);

  const getLogsDetailsByApplicationNumber = useCallback(async applicationsData => {
    if (!mkc?.userName) {
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}getAllLogsDetails`, {
        headers: commonHeaders,
      });
      const allLogs = response?.data?.data || [];
      const userLogs = allLogs.filter(log => log.user === mkc.userName);
      const matchingAppNumbers = new Set(
        userLogs.map(log => log.applicationNumber).filter(Boolean),
      );
      const matchedApplications = applicationsData.filter(item =>
        matchingAppNumbers.has(item.applicationNo),
      );

      setLogsData(allLogs);
      setUserApplications(matchedApplications);
      setRejectedCase(
        matchedApplications.filter(item => item.stage === 'Rejected'),
      );
    } catch (error) {
      console.error('Error fetching sales activity logs:', error.message || error);
    }
  }, [commonHeaders, mkc?.userName]);

  const fetchData = useCallback(async () => {
    if (!token || !mkc?.userName) {
      return;
    }

    setIsLoading(true);

    try {
      const [leadsResponse, applicationsResponse] = await Promise.all([
        axios.get(`${BASE_URL}getLeads`, { headers: commonHeaders }),
        axios.get(`${BASE_URL}getAllApplication`, { headers: commonHeaders }),
      ]);

      const sourcedLeads =
        leadsResponse?.data?.data?.filter(
          lead =>
            lead.applicantTypeCode === 'Applicant' &&
            lead.createdBy === mkc.userName,
        ) || [];

      const liveLeads = sourcedLeads.filter(({ leadStatus }) => {
        const statusName = leadStatus?.leadStatusName?.trim()?.toLowerCase();
        return statusName !== 'sent to los' && statusName !== 'rejected';
      });

      const rejectedLeads = sourcedLeads.filter(({ leadStatus }) => {
        const statusName = leadStatus?.leadStatusName?.trim()?.toLowerCase();
        return statusName === 'rejected';
      });

      const applicationList = Array.isArray(applicationsResponse?.data?.data)
        ? applicationsResponse.data.data
        : [];

      setLeads(liveLeads);
      setRejectedLeadPool(rejectedLeads);
      await getLogsDetailsByApplicationNumber(applicationList);
    } catch (error) {
      console.error('Error fetching sales dashboard data:', error);
      Alert.alert('Error', 'Failed to load the sales dashboard.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [commonHeaders, getLogsDetailsByApplicationNumber, mkc?.userName, token]);

  useEffect(() => {
    if (!token || !mkc?.userName) {
      return;
    }

    fetchData();
    getDashBoardCountAndList();
    getBusinessDate();
  }, [fetchData, getBusinessDate, getDashBoardCountAndList, mkc?.userName, token]);

  useEffect(() => {
    if (!logsData?.length || !mkc?.userName) {
      return;
    }

    setRecentActivity(filterUserActivity(logsData, mkc.userName));
  }, [logsData, mkc?.userName]);

  useEffect(() => {
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1, 1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    const lastYearStart = new Date();
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1, 0, 1);
    lastYearStart.setHours(0, 0, 0, 0);

    const lastYearEnd = new Date();
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1, 11, 31);
    lastYearEnd.setHours(23, 59, 59, 999);

    const filterByDate = (list, start, end) =>
      list.filter(item => {
        const created = new Date(item.createdTime);
        return created >= start && created <= end;
      });

    setLeadsLastMonthYear({
      lastMonth: filterByDate(leads, lastMonthStart, lastMonthEnd),
      lastYear: filterByDate(leads, lastYearStart, lastYearEnd),
    });

    setApplicationsLastMonthYear({
      lastMonth: filterByDate(userApplications, lastMonthStart, lastMonthEnd),
      lastYear: filterByDate(userApplications, lastYearStart, lastYearEnd),
    });
  }, [leads, userApplications]);

  const formatTimeAgo = useCallback(
    timestamp => formatBusinessRelativeTime(timestamp, businessDate),
    [businessDate],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchData(), getDashBoardCountAndList(), getBusinessDate()]);
  }, [fetchData, getBusinessDate, getDashBoardCountAndList]);

  const handleTabChange = useCallback(tab => {
    setSelectedTab(tab);
  }, []);

  const handleCardPress = useCallback(
    items => {
      navigation.navigate('Application Status', { selectedLeadfromtab: items });
    },
    [navigation],
  );

  const handleRejectedCardPress = useCallback(() => {
    const hasRejectedApplications = rejectedCase.length > 0;
    const hasRejectedLeads = rejectedLeadPool.length > 0;

    if (hasRejectedLeads && !hasRejectedApplications) {
      navigation.navigate('Tab Details', {
        data: rejectedLeadPool,
        label: 'Leads',
      });
      return;
    }

    if (!hasRejectedLeads && hasRejectedApplications) {
      handleCardPress(rejectedCase);
      return;
    }

    if (hasRejectedLeads && hasRejectedApplications) {
      setShowChoiceModal(true);
      return;
    }

    Alert.alert('No Data Available');
  }, [handleCardPress, navigation, rejectedCase, rejectedLeadPool]);

  const rejectedTotal = rejectedCase.length + rejectedLeadPool.length;
  const activePipelines = leads.length + inProgressApplications.length;
  const conversionRate = getRate(disbursedCase.length, totalLeads.length);
  const applicationCoverage = getRate(
    inProgressApplications.length,
    totalLeads.length,
  );
  const rejectionRate = getRate(rejectedTotal, totalLeads.length);

  const periodCounts = useMemo(() => {
    if (selectedTab === 'Last Month') {
      const monthApps = applicationsLastMonthYear.lastMonth || [];
      return {
        leads: leadsLastMonthYear.lastMonth.length,
        applications: monthApps.length,
        disbursed: monthApps.filter(app => app.stage === 'Disbursed').length,
        rejected: monthApps.filter(app => app.stage === 'Rejected').length,
      };
    }

    if (selectedTab === 'Last Year') {
      const yearApps = applicationsLastMonthYear.lastYear || [];
      return {
        leads: leadsLastMonthYear.lastYear.length,
        applications: yearApps.length,
        disbursed: yearApps.filter(app => app.stage === 'Disbursed').length,
        rejected: yearApps.filter(app => app.stage === 'Rejected').length,
      };
    }

    return {
      leads: leads.length,
      applications: inProgressApplications.length,
      disbursed: disbursedCase.length,
      rejected: rejectedTotal,
    };
  }, [
    applicationsLastMonthYear,
    disbursedCase.length,
    inProgressApplications.length,
    leads.length,
    leadsLastMonthYear,
    rejectedTotal,
    selectedTab,
  ]);

  const summaryCards = useMemo(
    () => [
      {
        key: 'total-leads',
        label: 'Total Leads',
        count: totalLeads.length,
        caption: 'All sourced opportunities in your LOS book.',
        iconSource: require('../../asset/team-lead.png'),
        accent: '#2563EB',
        iconBackground: 'rgba(37,99,235,0.12)',
        accentSoft: 'rgba(37,99,235,0.12)',
        onPress: () => navigation.navigate('Tab Details', { data: totalLeads, label: 'Leads' }),
      },
      {
        key: 'live-leads',
        label: 'In Progress',
        count: leads.length,
        caption: 'Fresh leads still advancing toward LOS conversion.',
        iconSource: require('../../asset/team-lead.png'),
        accent: '#0EA5E9',
        iconBackground: 'rgba(14,165,233,0.12)',
        accentSoft: 'rgba(14,165,233,0.12)',
        onPress: () => navigation.navigate('Tab Details', { data: leads, label: 'Leads' }),
      },
      {
        key: 'applications',
        label: 'Applications',
        count: inProgressApplications.length,
        caption: 'Active LOS files currently under movement.',
        iconSource: require('../../asset/in-progress.png'),
        accent: '#8B5CF6',
        iconBackground: 'rgba(139,92,246,0.12)',
        accentSoft: 'rgba(139,92,246,0.12)',
        onPress: () => handleCardPress(inProgressApplications),
      },
      {
        key: 'disbursed',
        label: 'Disbursed',
        count: disbursedCase.length,
        caption: 'Cases already closed and ready to celebrate.',
        iconSource: require('../../asset/disbursed.png'),
        accent: '#10B981',
        iconBackground: 'rgba(16,185,129,0.14)',
        accentSoft: 'rgba(16,185,129,0.14)',
        onPress: () => handleCardPress(disbursedCase),
      },
      {
        key: 'rejected',
        label: 'Rejected',
        count: rejectedTotal,
        caption: 'Leads and LOS applications that need rescue review.',
        iconSource: require('../../asset/rejected.png'),
        accent: '#F97316',
        iconBackground: 'rgba(249,115,22,0.12)',
        accentSoft: 'rgba(249,115,22,0.12)',
        onPress: handleRejectedCardPress,
      },
    ],
    [
      disbursedCase,
      handleCardPress,
      handleRejectedCardPress,
      inProgressApplications,
      leads,
      navigation,
      rejectedTotal,
      totalLeads,
    ],
  );

  const quickActions = useMemo(
    () => [
      {
        key: 'new-lead',
        eyebrow: 'Launch',
        title: 'Create Lead',
        subtitle: 'Open a fresh LOS opportunity directly from the sales desk.',
        gradient: ['#FF7A59', '#FFB26B'],
        onPress: () => navigation.navigate('Lead', { lead: true }),
      },
      {
        key: 'pipeline',
        eyebrow: 'Track',
        title: 'Pipeline View',
        subtitle: 'Watch all active leads and LOS files in one live stack.',
        gradient: ['#0EA5E9', '#2563EB'],
        onPress: () =>
          navigation.navigate('Application Status', {
            pipeline: [...leads, ...inProgressApplications],
          }),
      },
      {
        key: 'recover',
        eyebrow: 'Recover',
        title: 'Rejected Queue',
        subtitle: 'Inspect opportunities that need intervention or revival.',
        gradient: ['#F97316', '#EF4444'],
        onPress: handleRejectedCardPress,
      },
    ],
    [handleRejectedCardPress, inProgressApplications, leads, navigation],
  );

  const activityItems = useMemo(
    () =>
      recentActivity.slice(0, 5).map((item, index) => {
        const stageText = item.stage || item.status || 'Live';
        const isRejected = stageText.toLowerCase().includes('reject');
        const isDisbursed = stageText.toLowerCase().includes('disburs');

        return {
          id: `${item.applicationNumber || item.leadId || 'activity'}-${index}`,
          title: item.description || 'Activity update',
          subtitle: `${formatTimeAgo(item.lastModifiedTime || item.createdTime)} · ${stageText}`,
          badge: stageText,
          badgeColor: isRejected
            ? 'rgba(249,115,22,0.12)'
            : isDisbursed
              ? 'rgba(16,185,129,0.14)'
              : 'rgba(37,99,235,0.12)',
          badgeTextColor: isRejected
            ? '#F97316'
            : isDisbursed
              ? '#10B981'
              : '#2563EB',
          reference: item.applicationNumber
            ? `Application ${item.applicationNumber}`
            : item.leadId
              ? `Lead ${item.leadId}`
              : null,
          color: isRejected ? '#F97316' : isDisbursed ? '#10B981' : '#2563EB',
        };
      }),
    [formatTimeAgo, recentActivity],
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <DashboardCommandCenter
        theme={losThemes.salesCommand}
        greeting="Sales command center"
        title={`${mkc?.firstName || ''} ${mkc?.lastName || ''}`.trim() || 'LOS User'}
        heroValue={activePipelines}
        heroLabel={`${selectedTab} active pipelines`}
        heroMeta={`Application coverage ${applicationCoverage}% · Conversion ${conversionRate}% · Rejection ${rejectionRate}%`}
        microStats={[
          { label: 'Lead desk', value: periodCounts.leads },
          { label: 'Application desk', value: periodCounts.applications },
          { label: 'Disbursals', value: periodCounts.disbursed },
        ]}
        statusLabel="Sales Live"
        statusTone="rgba(16,185,129,0.24)"
        userInitials={userInitials}
        tabs={PERIOD_TABS}
        selectedTab={selectedTab}
        onSelectTab={handleTabChange}
        onMenuPress={openDrawer}
        spotlight={{
          eyebrow: 'Pipeline Pulse',
          title: `${selectedTab} reliability snapshot`,
          value: `${conversionRate}%`,
          description:
            'A live read of how sourced leads are converting into applications, disbursals, and exception queues.',
          distribution: [
            { label: 'Lead desk', value: periodCounts.leads, color: '#2563EB' },
            { label: 'Application desk', value: periodCounts.applications, color: '#8B5CF6' },
            { label: 'Disbursed', value: periodCounts.disbursed, color: '#10B981' },
            { label: 'Rejected', value: periodCounts.rejected, color: '#F97316' },
          ],
          metaLine: `${recentActivity.length} activity events mapped to your desk.`,
        }}
        summaryTitle="Revenue Deck"
        summaryCards={summaryCards}
        quickActionsTitle="Action Lane"
        quickActions={quickActions}
        activityTitle="Recent Activity"
        activityItems={activityItems}
        activityAction={{
          label: 'View lead desk',
          onPress: () => navigation.navigate('Tab Details', { data: totalLeads, label: 'Leads' }),
        }}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        loading={isLoading}
        contentBottomSpacing={40}
      >
        <View style={styles.commandSpotlightCard}>
          <View style={styles.commandSpotlightHeader}>
            <View style={styles.commandSpotlightTitleBlock}>
              <Text style={styles.commandSpotlightEyebrow}>Recovery Lens</Text>
              <Text style={styles.commandSpotlightTitle}>
                Where the desk needs action next
              </Text>
            </View>

            <View style={styles.commandSpotlightBadge}>
              <Text style={styles.commandSpotlightBadgeText}>{rejectedTotal}</Text>
            </View>
          </View>

          <Text style={styles.commandSpotlightCopy}>
            Balance fresh sourcing, live applications, and exception handling without losing LOS reliability in the process.
          </Text>

          <View style={styles.commandSignalRow}>
            <View style={styles.commandSignalChip}>
              <Text style={styles.commandSignalLabel}>Total Leads</Text>
              <Text style={styles.commandSignalValue}>{totalLeads.length}</Text>
            </View>
            <View style={styles.commandSignalChip}>
              <Text style={styles.commandSignalLabel}>Applications</Text>
              <Text style={styles.commandSignalValue}>{inProgressApplications.length}</Text>
            </View>
            <View style={styles.commandSignalChip}>
              <Text style={styles.commandSignalLabel}>Rejected</Text>
              <Text style={styles.commandSignalValue}>{rejectedTotal}</Text>
            </View>
          </View>
        </View>
      </DashboardCommandCenter>

      <Modal
        visible={showChoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commandModalCard}>
            <Text style={styles.commandModalTitle}>Rejected queue split detected</Text>
            <Text style={styles.commandModalCopy}>
              Both rejected leads and rejected LOS applications are available. Choose the desk you want to inspect.
            </Text>

            <TouchableOpacity
              style={[styles.commandModalButton, styles.commandModalButtonPrimary]}
              onPress={() => {
                setShowChoiceModal(false);
                handleCardPress(rejectedCase);
              }}
            >
              <Text style={styles.commandModalButtonText}>Open rejected applications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.commandModalButton, styles.commandModalButtonSecondary]}
              onPress={() => {
                setShowChoiceModal(false);
                navigation.navigate('Tab Details', { data: rejectedLeadPool, label: 'Leads' });
              }}
            >
              <Text style={styles.commandModalButtonText}>Open rejected leads</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.commandModalButton, styles.commandModalButtonGhost]}
              onPress={() => setShowChoiceModal(false)}
            >
              <Text style={[styles.commandModalButtonText, styles.commandModalButtonTextDark]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SalesDashboard;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: losThemes.salesCommand.pageBackground,
  },
  commandSpotlightCard: {
    marginBottom: 18,
    borderRadius: 26,
    padding: 18,
    backgroundColor: losColors.surface.darkCard,
  },
  commandSpotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commandSpotlightTitleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  commandSpotlightEyebrow: {
    color: losColors.brand[400],
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  commandSpotlightTitle: {
    marginTop: 6,
    color: losColors.text.inverse,
    fontSize: 20,
    fontWeight: '800',
  },
  commandSpotlightBadge: {
    minWidth: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(249,115,22,0.18)',
    alignItems: 'center',
  },
  commandSpotlightBadgeText: {
    color: '#FDBA74',
    fontSize: 16,
    fontWeight: '800',
  },
  commandSpotlightCopy: {
    marginTop: 12,
    color: losColors.text.inverseMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  commandSignalRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  commandSignalChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 10,
  },
  commandSignalLabel: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  commandSignalValue: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 18, 33, 0.52)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  commandModalCard: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 22,
  },
  commandModalTitle: {
    color: '#0E2239',
    fontSize: 21,
    fontWeight: '800',
  },
  commandModalCopy: {
    marginTop: 10,
    color: '#5C7089',
    fontSize: 14,
    lineHeight: 20,
  },
  commandModalButton: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  commandModalButtonPrimary: {
    backgroundColor: '#1D4ED8',
  },
  commandModalButtonSecondary: {
    backgroundColor: '#F97316',
  },
  commandModalButtonGhost: {
    backgroundColor: '#E7EEF8',
  },
  commandModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  commandModalButtonTextDark: {
    color: '#0E2239',
  },
});
