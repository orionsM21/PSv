import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Dimensions,
  Modal,
  Button,
  FlatList,
  DeviceEventEmitter,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  useFocusEffect,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import DropdownComponentNotificationPanel from '../Component/DropdownComponentNotificationPanel.js';
import { DrawerContext } from '../../../../Drawer/DrawerContext.js';
import { BASE_URL } from '../../api/Endpoints';
import GlobalSearchBar from '../Component/GlobalSearchBar.js';



// =========================
// 🔧 LAYOUT HELPERS & CONSTANTS
// =========================
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const COLORS = {
  primary: '#1A73E8',
  primaryLight: '#E8F1FF',
  primaryDark: '#0A5AD0',
  bg: '#F5F7FA',
  card: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  border: '#E2E8F0',
  danger: '#D9534F',
};

const IDLE_THRESHOLD_HOURS = 24;

// Normalize strings for matching stages → screens
const normalize = str =>
  str
    ?.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/process/g, '')
    .replace(/verfication/g, 'verification')
    .trim();

// Utility to chunk an array
const chunkArray = (arr, size) =>
  arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);

// =========================
// 🎛 MAIN COMPONENT
// =========================

const TASK_LABELS = {
  panVerification: "PAN Verification",
  documentPending: "Documents Pending",
  fiPending: "FI Pending",
  approvalPending: "Approval Pending",
  clarificationPending: "Clarification Pending",
};

const MyTasksSection = React.memo(({ tasks = {}, onTaskPress }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);


  const totalCount = useMemo(
    () =>
      Object.values(tasks).reduce(
        (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
        0
      ),
    [tasks]
  );

  const flatTaskList = useMemo(() => {
    if (!tasks || typeof tasks !== "object") return [];

    return Object.entries(tasks).flatMap(([type, list]) =>
      Array.isArray(list)
        ? list.map(item => ({ ...item, __taskType: type }))
        : []
    );
  }, [tasks]);
  const filteredList = useMemo(() => {
    if (!Array.isArray(flatTaskList)) return [];
    return activeFilter === "all"
      ? flatTaskList
      : flatTaskList.filter(i => i.__taskType === activeFilter);
  }, [activeFilter, flatTaskList]);

  const visibleTasks = useMemo(() => {
    return showAll ? filteredList : filteredList.slice(0, 3);
  }, [showAll, filteredList]);
  // const topTasks = useMemo(() => filteredList.slice(0, 3), [filteredList]);
  const safeList = Array.isArray(filteredList) ? filteredList : [];
  const handleFilterPress = useCallback((key) => {
    setActiveFilter(key);
  }, []);

  const getDisplayId = useCallback((item) => {
    return (
      item?.applicationNo ||
      item?.appId ||
      item?.leadId ||
      item?.id ||
      "N/A"
    );
  }, []);

  const getTimeLabel = useCallback((item) => {
    const raw = item?.lastModifiedTime || item?.createdTime;
    if (!raw) return "";

    const diff = Date.now() - new Date(raw).getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return "Updated just now";
    if (hours < 24) return `Updated ${hours}h ago`;
    return `Updated ${Math.floor(hours / 24)}d ago`;
  }, []);

  if (!totalCount) return null;

  return (
    <View style={styles.myTasksContainer}>
      {/* Header */}
      <View style={styles.myTasksHeaderRow}>
        <Text style={styles.myTasksTitle}>My Tasks</Text>
        <Text style={styles.myTasksSubtitle}>
          {totalCount} item{totalCount > 1 ? "s" : ""} need your attention
        </Text>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.taskChip,
            activeFilter === "all" && styles.taskChipActive,
          ]}
          onPress={() => handleFilterPress("all")}
        >
          <Text style={[
            styles.taskChipText,
            activeFilter === "all" && styles.taskChipTextActive,
          ]}>
            All ({totalCount})
          </Text>
        </TouchableOpacity>

        {Object.entries(tasks).map(([key, list]) => {
          const count = list?.length || 0;
          if (!count) return null;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.taskChip,
                activeFilter === key && styles.taskChipActive,
              ]}
              onPress={() => handleFilterPress(key)}
            >
              <Text
                style={[
                  styles.taskChipText,
                  activeFilter === key && styles.taskChipTextActive,
                ]}
              >
                {TASK_LABELS[key] || key} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Task Cards */}
      {/* {topTasks.map(item => ( */}
      {visibleTasks.map((item, index) => (
        <React.Fragment key={item.id || item.applicationNo || index}>

          {/* Task Card */}
          <TouchableOpacity
            style={styles.taskRow}
            onPress={() => onTaskPress(item)}
            activeOpacity={0.85}
          >
            <View style={styles.taskLeftAccent} />

            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>
                {TASK_LABELS[item.__taskType] || "Task"}
              </Text>

              <Text style={styles.taskMeta}>
                ID: {getDisplayId(item)} · {item.stage || item.leadStage || "N/A"}
              </Text>

              <Text style={styles.taskTime}>
                {getTimeLabel(item)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 🔽 TOGGLE ARROW (SHOW / HIDE) */}
          {((!showAll && index === 2) || (showAll && index === safeList.length - 1)) && (
            <TouchableOpacity
              style={styles.expandContainer}
              onPress={() => setShowAll(prev => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.expandText}>
                {showAll ? "Show Less" : "Show More"}
              </Text>
              <Text style={styles.expandArrow}>
                {showAll ? "⌃" : "⌄"}
              </Text>
            </TouchableOpacity>
          )}
        </React.Fragment>
      ))}



      {/* {filteredList.length > 3 && (
        <Text style={styles.taskFooterHint}>
          Showing top 3 items · refine using filters
        </Text>
      )} */}
    </View>
  );
});


const PreUnderWriterDashboard = () => {
  const token = useSelector(state => state.auth.token);
  const mkc = useSelector(state => state.auth.losuserDetails);
  const userDetails = mkc;

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { openDrawer } = useContext(DrawerContext);

  // -------- Core State --------
  const [selectedTab, setSelectedTab] = useState('Overall');
  const [logsData, setlogsData] = useState([]);
  console.log(logsData, 'logsDatalogsDatalogsData')
  const [overAllleads, setoverAllleads] = useState([]);
  const [leads, setLeads] = useState([]);
  const [applications, setApplications] = useState([]);

  const [TT, setTT] = useState([]);
  const [TD, setTD] = useState([]);
  const [TR, setTR] = useState([]);
  const [TI, setTI] = useState([]);
  console.log(TI, 'TITITITI')
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [finalApplication, setfinalApplication] = useState([]);
  const [finalApplicationCredit, setfinalApplicationCredit] = useState([]);

  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [DisbursedCase, setDisbursedCase] = useState([]);
  const [RejectedCase, setRejectedCase] = useState([]);
  const [forSales, setForSales] = useState([]);
  const [matchedLeads, setmatchedLeads] = useState([]);
  const [rejectedLeads, setrejectedLeads] = useState([]);

  const [forCredits, setForCredit] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [LeadsLastMonthYear, setLeadsLastMonthYear] = useState([]);
  const [ApplicationsLastMonthYear, setApplicationsLastMonthYear] = useState([]);
  const [recentActivityfilter, setrecentActivityfilter] = useState([]);
  console.log(recentActivityfilter, 'recentActivityfilterrecentActivityfilter')
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [BusinessDate, setBusinessDate] = useState([]);
  const [Dashboardcount, setDashboardcount] = useState([]);

  const [idleApplicationList, setIdleApplicationList] = useState([]);
  const [idleReminderModalVisible, setIdleReminderModalVisible] =
    useState(false);

  const [AllDataofApplication, setAllDataofApplication] = useState([]);

  const [stageApplications, setStageApplications] = useState([]);
  const [groupedInProgress, setGroupedInProgress] = useState({});
  const [stageCounts, setStageCounts] = useState({});

  const [data, setData] = useState([]); // deviation worklist

  const [isFabVisible, setIsFabVisible] = useState(false);

  const toggleFabVisibility = () => {
    setIsFabVisible(prev => !prev);
  };

  const commonHeaders = useMemo(
    () => ({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  // =========================
  // 📌 SCREEN / ROUTING CONFIG
  // =========================

  const preUnderwritingScreens = useMemo(
    () => [
      { label: 'Initiate Verfication ', value: 'Initiate Verfication' },
      { label: 'Residence Verification', value: 'Residence Verification' },
      { label: 'Verification Waiver', value: 'VerificationWaiver' },
      { label: 'Office Verification', value: 'Office Verifcation' },
      { label: 'Risk Containment Unit', value: 'RCU' },
      { label: 'Initiate RCU', value: 'Initiate RCU' },
      { label: 'Personal Discussion', value: 'Personal Discussion' },
      { label: 'Office Verification', value: 'OfficeVerifcationProcess' },
    ],
    [],
  );

  const UnderwritingScreens = useMemo(
    () => [
      { label: 'Decision', value: 'Decision' },
      { label: 'Decision Approve', value: 'Decision' },
    ],
    [],
  );

  // =========================
  // 🧠 API CALLS & DATA LOGIC
  // =========================

  const getAllLeads = useCallback(async () => {
    if (!mkc?.userId) return;

    try {
      const response = await axios.get(
        `${BASE_URL}getWorklist/${mkc.userId}`,
        { headers: commonHeaders },
      );

      const fetchedData = response.data.data || [];

      const filteredData = fetchedData.filter(
        item =>
          item?.assignTo?.userName === mkc.userName &&
          item?.leadStatus?.leadStatusName === 'Under Credit Review',
      );

      const uniqueLeadsMap = new Map();
      for (const item of filteredData) {
        const existing = uniqueLeadsMap.get(item.leadId);
        if (!existing) {
          uniqueLeadsMap.set(item.leadId, item);
        } else if (!existing?.applicantTypeCode && item?.applicantTypeCode) {
          uniqueLeadsMap.set(item.leadId, item);
        }
      }

      const uniqueFilteredData = Array.from(uniqueLeadsMap.values());
      setData(uniqueFilteredData);
    } catch (error) {
      console.error('Error fetching lead status:', error);
    }
  }, [commonHeaders, mkc]);

  const getBusinessDate = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}getBusinessDate`, {
        headers: commonHeaders,
      });
      setBusinessDate(response.data.data);
    } catch (error) {
      console.error('Error fetching lead Designation:', error);
      Alert.alert('Error', 'Failed to fetch Designation');
    }
  }, [commonHeaders]);

  const getDashBoardCountAndList = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getDashBoardCountAndList?userName=${mkc.userName}&roleName=${mkc.role[0]?.roleName}`,
        { headers: commonHeaders },
      );

      if (response.data.msgKey === 'Success') {
        setDashboardcount(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
    }
  }, [commonHeaders, mkc]);
  useEffect(() => {
    if (!logsData || !userDetails?.userName) return;

    const filtered = logsData
      .filter(item => item.user === userDetails.userName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))  // latest first
      .slice(0, 10); // limit to 10 activities (optional)

    setrecentActivityfilter(filtered);
  }, [logsData, mkc?.userName]);
  const getLogsDetailsByApplicationNumber = useCallback(
    async applicationsData => {
      try {
        if (!applicationsData || !applicationsData.length) return;

        const { data } = await axios.get(`${BASE_URL}getAllLogsDetails`, {
          headers: commonHeaders,
        });

        const logsData = data?.data || [];

        const userLogs = logsData.filter(log => log.user === mkc.userName);
        const userAppNumbers = new Set(
          userLogs.map(log => log.applicationNumber),
        );

        const forlead = logsData.filter(k =>
          userAppNumbers.has(k.applicationNumber),
        );

        const filteredLeadSales = forlead.filter(
          log => log.description === 'Application Generated',
        );

        const filteredLeadCredit = [];
        const seenApplicationNumbers = new Set();

        const disbursedApplicationNumbers = new Set();
        forlead.forEach(log => {
          if (log.status === 'Disbursed') {
            disbursedApplicationNumbers.add(log.applicationNumber);
          }
        });

        forlead.forEach(log => {
          if (
            log.user === mkc.userName &&
            !disbursedApplicationNumbers.has(log.applicationNumber) &&
            !seenApplicationNumbers.has(log.applicationNumber)
          ) {
            seenApplicationNumbers.add(log.applicationNumber);
            filteredLeadCredit.push(log);
          }
        });

        const filteredLeadCreditDisbursedCases = [];
        const seenApplicationNumbersDisbursedCase = new Set();

        forlead.forEach(log => {
          if (
            log.status === 'Disbursed' &&
            !seenApplicationNumbersDisbursedCase.has(log.applicationNumber)
          ) {
            seenApplicationNumbersDisbursedCase.add(log.applicationNumber);
            filteredLeadCreditDisbursedCases.push(log);
          }
        });

        const filteredLeadCreditRejectedCases = [];
        const seenApplicationNumbersRejectedCase = new Set();

        forlead.forEach(log => {
          if (
            log.status === 'Rejected' &&
            !seenApplicationNumbersRejectedCase.has(log.applicationNumber)
          ) {
            seenApplicationNumbersRejectedCase.add(log.applicationNumber);
            filteredLeadCreditRejectedCases.push(log);
          }
        });

        const matchedLeadSales = filteredLeadSales.filter(salesLog =>
          (filteredLeadCreditDisbursedCases.length > 0
            ? filteredLeadCreditDisbursedCases
            : filteredLeadCredit
          ).some(
            creditLog =>
              creditLog.applicationNumber === salesLog.applicationNumber,
          ),
        );

        const filteredApplicationNumbers = [
          ...new Set(
            logsData
              ?.filter(
                item =>
                  item.stage !== 'Disbursed' && item.stage !== 'Rejected',
              )
              ?.map(item => item.applicationNumber)
              .filter(Boolean),
          ),
        ];

        const matchingAppNumbers = new Set(
          userLogs.map(log => log.applicationNumber),
        );

        const filteredApplications = applicationsData.filter(item =>
          matchingAppNumbers.has(item.applicationNo),
        );

        const disbursedcasedata = applicationsData.filter(
          item =>
            matchingAppNumbers.has(item.applicationNo) &&
            item.stage === 'Disbursed',
        );

        const filteredApplicationsCredit = applicationsData.filter(
          item =>
            matchingAppNumbers.has(item.applicationNo) &&
            item.stage !== 'Disbursed' &&
            item.stage !== 'Rejected',
        );

        const DisbursedCases = filteredApplications.filter(
          item => item.stage === 'Disbursed',
        );
        const RejectedCases = filteredApplications.filter(
          item => item.stage === 'Rejected',
        );
        setlogsData(logsData)
        setForSales(matchedLeadSales);
        setForCredit(filteredApplicationNumbers);
        setRejectedCase(RejectedCases);
        setDisbursedCase(disbursedcasedata);
        setfinalApplication(filteredApplications);
        setfinalApplicationCredit(filteredApplicationsCredit);
      } catch (error) {
        console.error('Error fetching logs details:', error.message || error);
      }
    },
    [commonHeaders, mkc],
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [leadsResponse, applicationsResponse] = await Promise.all([
        axios.get(`${BASE_URL}getLeads`, { headers: commonHeaders }),
        axios.get(`${BASE_URL}getAllApplication`, { headers: commonHeaders }),
      ]);

      const Allleads = leadsResponse?.data?.data || [];

      const rejectedLeadsLocal = [
        ...new Map(
          Allleads?.filter(
            item =>
              item.leadStage === 'Rejected' &&
              item.secondaryAssigned === mkc.userId,
          )?.map(item => [item.leadId, item]),
        ).values(),
      ];
      setrejectedLeads(rejectedLeadsLocal);

      const leadsData =
        Allleads?.filter(lead => lead.applicantTypeCode === 'Applicant') || [];

      const applicationsData = Array.isArray(applicationsResponse?.data?.data)
        ? applicationsResponse.data.data
        : [];

      const filteredRejectedleads = leadsData.filter(({ leadStatus }) => {
        const statusName = leadStatus?.leadStatusName
          ?.trim()
          ?.toLowerCase();
        return statusName === 'rejected';
      });
      setoverAllleads(filteredRejectedleads);

      setLeads(leadsData);
      setApplications(applicationsData);
      setTT(leadsData);

      const TIData = applicationsData.filter(
        app => app.stage !== 'Disbursed' && app.stage !== 'Rejected',
      );
      setTI(TIData);

      const TDData = applicationsData.filter(app => app.stage === 'Disbursed');
      setTD(TDData);

      const TRData = applicationsData.filter(app => app.stage === 'Rejected');
      setTR(TRData);

      setAllDataofApplication(applicationsData);

      await getLogsDetailsByApplicationNumber(applicationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [commonHeaders, mkc, getLogsDetailsByApplicationNumber]);

  // =========================
  // ⏰ IDLE APPLICATIONS
  // =========================
  useEffect(() => {
    if (applications.length > 0 && BusinessDate?.businnessDate?.length > 0) {
      getIdleApplications();
    }
  }, [applications, BusinessDate]);
  const getIdleApplications = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}getAllLogsDetails`, {
        headers: commonHeaders,
      });

      const logs = data?.data || [];
      const [year, month, day] = BusinessDate?.businnessDate || [];
      if (!year || !month || !day) return;

      const now = new Date(year, month - 1, day).getTime();
      const idleList = [];

      applications.forEach(app => {
        const appLogs = logs.filter(
          log => log.applicationNumber === app.applicationNo,
        );
        if (appLogs.length === 0) return;

        const pendingLogs = appLogs.filter(log => log.status === 'Pending');

        pendingLogs.forEach(log => {
          const logCreatedTime = new Date(log.createdTime).getTime();
          const idleMs = now - logCreatedTime;
          const idleHours = idleMs / (1000 * 60 * 60);

          const isUserMatch = userDetails.designation === 'CEO';
          const isStageValid = !['Disbursed', 'Rejected', 'Completed'].includes(
            log.status,
          );

          if (idleHours > 2 && isUserMatch && isStageValid) {
            const totalHours = Math.floor(idleHours);
            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;
            const idleFormatted = `${days} day${days !== 1 ? 's' : ''
              } ${hours} hour${hours !== 1 ? 's' : ''}`;

            const pendingDescriptions = appLogs
              .filter(
                l =>
                  l.stage === log.stage &&
                  l.status === 'Pending' &&
                  l.applicationNumber === app.applicationNo,
              )
              .map(l => l.description)
              .filter((desc, idx, self) => desc && self.indexOf(desc) === idx);

            idleList.push({
              applicationNo: app.applicationNo,
              stage: log.stage,
              user: log.user,
              idleHours: idleHours.toFixed(2),
              idleTime: idleFormatted,
              lastUpdate: new Date(log.createdTime).toLocaleString(),
              descriptions: pendingDescriptions,
            });
          }
        });
      });
      console.log(idleList, 'idleListidleList')
      setIdleApplicationList(idleList);
    } catch (error) {
      console.error('Error fetching idle applications:', error);
    }
  }, [applications, BusinessDate, commonHeaders, userDetails]);

  // =========================
  // 🧭 STAGE NAVIGATION
  // =========================

  const getLogsDetailsByApplicationNumberInprogress = useCallback(
    async applicationNo => {
      try {
        const response = await axios.get(
          `${BASE_URL}getLogsDetailsByApplicationNumber/${applicationNo}`,
          { headers: commonHeaders },
        );

        const data = response?.data?.data;

        if (!Array.isArray(data) || data.length === 0) {
          Alert.alert('No Logs', 'No logs available for this application.');
          return;
        }

        const pendingEntry =
          data.find(entry => entry.status !== 'Completed') ||
          data[data.length - 1];

        const pendingStage =
          pendingEntry?.description ||
          data[data.length - 1]?.description ||
          'Unknown stage';

        const allScreens = [...preUnderwritingScreens, ...UnderwritingScreens];

        if (
          pendingStage?.toLowerCase() === 'decision level 2' ||
          pendingStage?.toLowerCase() === 'decision level 3'
        ) {
          if (userDetails?.designation === 'CEO') {
            const matchedItem = applications.find(
              app => app.applicationNo === applicationNo,
            );
            if (matchedItem) {
              navigation.navigate('Decision', { item: matchedItem });
              setModalVisible(false);
              setApplicationModalVisible(false);
            } else {
              Alert.alert('Not Found', 'Application data not found locally.');
            }
          } else {
            Alert.alert(
              'Access Denied',
              'You are not allowed to perform this stage. Please ask the CEO to take action.',
            );
          }
          return;
        }

        const matchedScreen = allScreens.find(
          screen => normalize(screen.label) === normalize(pendingStage),
        );

        const item = applications.find(
          app => app.applicationNo === applicationNo,
        );
        const isUserMatched = userDetails?.userName === pendingEntry?.user;
        const alertMessage = `This case is pending at: ${pendingStage} By ${pendingEntry.user}`;

        const alertButtons = matchedScreen
          ? isUserMatched
            ? [
              {
                text: 'Go to Screen',
                onPress: () => {
                  if (item) {
                    navigation.navigate(matchedScreen.value, { item });
                    setModalVisible(false);
                    setApplicationModalVisible(false);
                  } else {
                    Alert.alert(
                      'Not Found',
                      'Application data not found locally.',
                    );
                  }
                },
              },
              { text: 'Cancel', style: 'cancel' },
            ]
            : [{ text: 'Cancel', style: 'cancel' }]
          : [{ text: 'OK', style: 'cancel' }];

        Alert.alert(
          'Pending Screen',
          matchedScreen
            ? alertMessage
            : `${alertMessage} (No screen mapped)`,
          alertButtons,
        );
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch application details.');
      }
    },
    [
      applications,
      commonHeaders,
      navigation,
      preUnderwritingScreens,
      UnderwritingScreens,
      userDetails,
    ],
  );

  // =========================
  // 📊 LAST MONTH / YEAR METRICS
  // =========================

  useEffect(() => {
    if (Array.isArray(leads) && Array.isArray(applications)) {
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

      const lastMonthLeads = leads.filter(lead => {
        const created = new Date(lead.createdTime);
        return created >= lastMonthStart && created <= lastMonthEnd;
      });

      const lastMonthApplications = applications.filter(application => {
        const created = new Date(application.createdTime);
        return created >= lastMonthStart && created <= lastMonthEnd;
      });

      const lastYearLeads = leads.filter(lead => {
        const created = new Date(lead.createdTime);
        return created >= lastYearStart && created <= lastYearEnd;
      });

      const lastYearApplications = applications.filter(application => {
        const created = new Date(application.createdTime);
        return created >= lastYearStart && created <= lastYearEnd;
      });

      setLeadsLastMonthYear({
        lastMonth: lastMonthLeads,
        lastYear: lastYearLeads,
      });
      setApplicationsLastMonthYear({
        lastMonth: lastMonthApplications,
        lastYear: lastYearApplications,
      });
    }
  }, [leads, applications]);

  const getCounts = useCallback(() => {
    const lastMonthLeads = LeadsLastMonthYear?.lastMonth || [];
    const lastYearLeads = LeadsLastMonthYear?.lastYear || [];
    const lastMonthApplications = ApplicationsLastMonthYear?.lastMonth || [];
    const lastYearApplications = ApplicationsLastMonthYear?.lastYear || [];

    let leadsCount = 0;
    let applicationsCount = 0;
    let disbursedCount = 0;
    let rejectedCount = 0;

    if (selectedTab === 'Last Month') {
      leadsCount = lastMonthLeads.length;
      applicationsCount = lastMonthApplications.length;
      disbursedCount = lastMonthApplications.filter(
        app => app.stage === 'Disbursed',
      ).length;
      rejectedCount = lastMonthApplications.filter(
        app => app.stage === 'Rejected',
      ).length;
    } else if (selectedTab === 'Last Year') {
      leadsCount = lastYearLeads.length;
      applicationsCount = lastYearApplications.length;
      disbursedCount = lastYearApplications.filter(
        app => app.stage === 'Disbursed',
      ).length;
      rejectedCount = lastYearApplications.filter(
        app => app.stage === 'Rejected',
      ).length;
    } else {
      leadsCount = finalApplication.length;
      applicationsCount = finalApplicationCredit.length;
      disbursedCount = DisbursedCase.length;
      rejectedCount = RejectedCase.length;
    }

    return { leadsCount, applicationsCount, disbursedCount, rejectedCount };
  }, [
    LeadsLastMonthYear,
    ApplicationsLastMonthYear,
    selectedTab,
    finalApplication,
    finalApplicationCredit,
    DisbursedCase,
    RejectedCase,
  ]);

  const counts = getCounts();

  // =========================
  // 🔁 MATCH LEADS ↔ APPLICATIONS
  // =========================

  useEffect(() => {
    if (finalApplication.length > 0 && leads.length > 0) {
      const appNos = new Set(finalApplication.map(sale => sale.applicationNo));
      const matched = leads.filter(lead => appNos.has(lead.appId));
      setmatchedLeads(matched);
    }
  }, [finalApplication, leads]);

  // =========================
  // 👥 USERS (for Idle Filter)
  // =========================

  useEffect(() => {
    axios
      .get(`${BASE_URL}getAllUsers`, { headers: commonHeaders })
      .then(response => {
        const formatted = response.data.data.content
          .filter(user => user.role?.[0]?.roleCode !== 'Admin')
          .map(user => ({
            label: `${user.firstName} ${user.lastName}`.trim() || user.userName,
            value: user.userName,
            role: user.role?.[0]?.roleCode,
          }));

        setUsers(formatted);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
      });
  }, [commonHeaders]);

  // =========================
  // 🎚 FILTERED IDLE LIST
  // =========================

  const selectedUserIds = useMemo(
    () => new Set(selectedUsers.map(u => u.value)),
    [selectedUsers],
  );

  const filteredIdleList = useMemo(() => {
    if (selectedUserIds.size === 0) return idleApplicationList;
    return idleApplicationList.filter(app => selectedUserIds.has(app.user));
  }, [idleApplicationList, selectedUserIds]);

  // =========================
  // 📲 IN-PROGRESS GROUPING
  // =========================

  const handleInProgressPress = useCallback(() => {
    const source =
      userDetails?.designation === 'CEO'
        ? TI
        : [
          ...(Dashboardcount?.applicationInprogressDtoList || []),
          ...(Dashboardcount?.leadInprogressList || []),
        ];

    const grouped = source.reduce((acc, app) => {
      const stage = app?.appId === null ? 'Lead' : app?.stage || 'Unknown';
      (acc[stage] ||= []).push(app);
      return acc;
    }, {});

    setGroupedInProgress(grouped);
    setStageCounts(grouped);
    setModalVisible(true);
  }, [Dashboardcount, TI, userDetails]);

  const handleStageClick = useCallback(
    apps => {
      const hasLead = apps.some(a => a?.appId === null);

      if (hasLead) {
        setStageApplications(apps);
      } else {
        const filtered = applications.filter(app =>
          apps.some(
            a => a.stage === app.stage && a.applicationNo === app.applicationNo,
          ),
        );
        setStageApplications(filtered);
      }

      setApplicationModalVisible(true);
    },
    [applications],
  );

  // =========================
  // 🔁 REFRESH / LIFECYCLE
  // =========================

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchData(),
      getAllLeads(),
      getDashBoardCountAndList(),
      getBusinessDate(),
    ]);
    await getIdleApplications();
    setIsRefreshing(false);
  }, [
    fetchData,
    getAllLeads,
    getDashBoardCountAndList,
    getBusinessDate,
    getIdleApplications,
  ]);

  const handleRefresh = async () => {
    await fetchData();        // only fetches main datasets
    await getIdleApplications();
  };



  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setLeads([]);
      setApplications([]);
      setForSales([]);
      setForCredit([]);
      setRejectedCase([]);
      setDisbursedCase([]);
      setfinalApplication([]);
      setfinalApplicationCredit([]);
      setModalVisible(false);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const clearDashboardData = DeviceEventEmitter.addListener(
      'USER_LOGGED_OUT',
      () => {
        setData([]);
        setApplications([]);
        setTT([]);
        setTD([]);
        setTI([]);
        setTR([]);
        setLeads([]);
        setForSales([]);
        setForCredit([]);
        setRejectedCase([]);
        setDisbursedCase([]);
        setfinalApplication([]);
        setfinalApplicationCredit([]);
        setmatchedLeads([]);
        setDashboardcount([]);
      },
    );

    return () => clearDashboardData.remove();
  }, []);

  useEffect(() => {
    return () => {
      setModalVisible(false);
      setApplicationModalVisible(false);
      setStageApplications([]);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);
      setApplicationModalVisible(false);
      setStageApplications([]);
      getDashBoardCountAndList();
      refreshAll();
    }, [getDashBoardCountAndList]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setDrawerVisible(false);
    });
    return unsubscribe;
  }, [navigation]);

  // =========================
  // 📊 SUMMARY CARDS
  // =========================

  const summaryData = useMemo(() => {
    return [
      {
        icon: require('../../asset/team-lead.png'),
        count:
          userDetails?.designation === 'CEO'
            ? applications?.length
            : (matchedLeads?.length || 0) +
            (Dashboardcount?.leadInprogressList?.length || 0),
        label: 'Total Case',
        onPress: () => {
          const combinedLeads = [
            ...(matchedLeads || []),
            ...(Dashboardcount?.leadInprogressList || []),
          ];

          navigation.navigate('Tab Details Credit', {
            selectedLeadfromtab:
              userDetails.designation === 'CEO' ? TT : combinedLeads,
            label: 'Leads',
          });
        },
      },
      {
        icon: require('../../asset/in-progress.png'),
        count:
          userDetails?.designation === 'CEO'
            ? TI.length
            : (Dashboardcount?.applicationInprogressDtoList?.length || 0) +
            (Dashboardcount?.leadInprogressList?.length || 0),
        label: 'In Progress',
        onPress: handleInProgressPress,
      },
      {
        icon: require('../../asset/disbursed.png'),
        count:
          userDetails?.designation === 'CEO'
            ? TD.length
            : DisbursedCase.length,
        label: 'Disbursed',
        onPress: () =>
          navigation.navigate('Credit History', {
            data: userDetails.designation === 'CEO' ? TD : DisbursedCase,
            label: 'Leads',
          }),
      },
      {
        icon: require('../../asset/rejected.png'),
        count:
          userDetails?.designation === 'CEO'
            ? (TR?.length || 0) + (overAllleads?.length || 0)
            : (rejectedLeads.length || 0) + (RejectedCase?.length || 0),
        label: 'Rejected',
        onPress: () => {
          if (userDetails?.designation === 'CEO') {
            Alert.alert(
              'Select Option',
              'Which rejected cases would you like to view?',
              [
                {
                  text: 'Credit User',
                  onPress: () => {
                    navigation.navigate('Credit History', {
                      data: TR,
                      label: 'Credit Rejected Leads',
                    });
                  },
                },
                {
                  text: 'Sales User',
                  onPress: () => {
                    navigation.navigate('Tab Details Credit', {
                      selectedLeadfromtab: overAllleads,
                      label: 'Sales Rejected Leads',
                    });
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ],
              { cancelable: true },
            );
          } else {
            Alert.alert(
              'Select Option',
              'Which rejected cases would you like to view?',
              [
                {
                  text: 'Credit User',
                  onPress: () => {
                    navigation.navigate('Credit History', {
                      data: RejectedCase,
                      label: 'Credit Rejected Leads',
                    });
                  },
                },
                {
                  text: 'Sales User',
                  onPress: () => {
                    navigation.navigate('Tab Details Credit', {
                      selectedLeadfromtab: rejectedLeads,
                      label: 'Sales Rejected Leads',
                    });
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ],
              { cancelable: true },
            );
          }
        },
      },
      {
        icon: require('../../asset/deviation.png'),
        count: data.length,
        label: 'Deviation',
        onPress: () => navigation.navigate('Credit WorkList'),
      },
    ];
  }, [
    applications?.length,
    Dashboardcount,
    TT,
    TI,
    TD,
    TR,
    DisbursedCase.length,
    RejectedCase,
    overAllleads,
    rejectedLeads,
    matchedLeads,
    data,
    navigation,
    userDetails?.designation,
    handleInProgressPress,
  ]);

  const chunkedSummaryData = useMemo(
    () => chunkArray(summaryData, 2),
    [summaryData],
  );

  const handleTabChange = tab => setSelectedTab(tab);
  const userInitials =
    (mkc?.firstName?.[0] || "") + (mkc?.lastName?.[0] || "");
  // =========================
  // 🧩 RENDER
  // =========================
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";

    // Convert [YYYY, MM, DD] → actual JS date
    const bd = BusinessDate?.businnessDate;
    const businessDateObj = bd
      ? new Date(bd[0], bd[1] - 1, bd[2])
      : new Date();

    const now = businessDateObj.getTime();
    const diff = now - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "Just now";
    if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
    if (diff < day) return `${Math.floor(diff / hour)} hr ago`;

    return `${Math.floor(diff / day)} days ago`;
  };

  const stageBadge = (stage) => {
    if (!stage) return styles.stageDefault;

    if (stage.toLowerCase().includes("reject")) return styles.stageRejected;
    if (stage.toLowerCase().includes("disburs")) return styles.stageApproved;
    if (stage.toLowerCase().includes("progress")) return styles.stageProgress;

    return styles.stageDefault;
  };


  // 🔹 Collect all records relevant for tasks (CEO vs Credit)
  const allPipelines = useMemo(() => {
    if (userDetails?.designation === "CEO") {
      return TI || [];
    }

    return [
      ...(Dashboardcount?.applicationInprogressDtoList || []),
      ...(Dashboardcount?.leadInprogressList || []),
    ];
  }, [userDetails?.designation, TI, Dashboardcount?.applicationInprogressDtoList, Dashboardcount?.leadInprogressList]);
  console.log(allPipelines, 'allPipelinesallPipelines')
  // 🔹 Normalization helper
  const normalize = (value) => (value || "").toString().toLowerCase();

  // 🔹 Derive task buckets
  const myTasks = useMemo(() => {
    const buckets = {
      documentPending: [],
      fiPending: [],
      approvalPending: [],
      clarificationPending: [],
      worklistPending: [],
    };

    allPipelines.forEach((item) => {
      const stage = normalize(item.stage || "");
      const leadStage = item.leadStage || "";

      // 1️⃣ Worklist (New leads)
      if (leadStage === "New") {
        buckets.worklistPending.push(item);
        return;
      }

      // 2️⃣ Document Pending
      if (
        stage.includes("ddc") ||
        stage.includes("doc") ||
        stage.includes("dde")
      ) {
        buckets.documentPending.push(item);
        return;
      }

      // 3️⃣ FI / Underwriting Pending
      if (
        stage.includes("pre-underwriting") ||
        stage.includes("underwriting")
      ) {
        buckets.fiPending.push(item);
        return;
      }

      // 4️⃣ Approval Pending
      if (stage.includes("disbursement")) {
        buckets.approvalPending.push(item);
        return;
      }

      // 5️⃣ Clarification Pending
      if (stage.includes("clarification")) {
        buckets.clarificationPending.push(item);
        return;
      }
    });

    return buckets;
  }, [allPipelines]);


  console.log(myTasks, 'myTasksmyTasksmyTasks')
  // 🔹 How to open a specific task (Lead or Application)
  const handleTaskPress = useCallback(
    (item) => {
      // If it has an application number → open logs
      if (item?.applicationNo) {
        getLogsDetailsByApplicationNumberInprogress?.(item.applicationNo);
        return;
      }

      // If it has appId but not applicationNo, still treat as application
      if (item?.appId) {
        getLogsDetailsByApplicationNumberInprogress?.(item.appId);
        return;
      }

      // Otherwise treat as lead → send to Worklist (or Credit Lead)
      navigation.navigate("Worklist", { fromDashboard: item });
    },
    [navigation, getLogsDetailsByApplicationNumberInprogress]
  );

  const searchSource = {
    local: async (q) => {
      const query = q.toLowerCase();

      return logsData
        .filter(item => {
          const text = [
            item.description,
            item.applicationNumber,
            item.leadId,          // safe even if undefined
            item.stage,
            item.status,
            item.user
          ]
            .filter(Boolean)       // remove null/undefined
            .join(' ')             // combine all searchable strings
            .toLowerCase();

          return text.includes(query);
        })
        .slice(0, 40);
    },

    remoteSearch: async (q) => {
      const res = await axios.get(`${BASE_URL}search?q=${encodeURIComponent(q)}`);
      return res.data?.results || [];
    },

    getAll: async () => logsData,
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.container}>

        {/* 🔷 REFINED PREMIUM HYBRID HEADER */}
        <LinearGradient
          colors={["#2196F3", "#2196F3"]}
          style={styles.headerGradient}
        >
          {/* LEFT: MENU + ROLE + NAME */}
          <TouchableOpacity style={styles.headerLeft} onPress={openDrawer} activeOpacity={0.85}>
            <Image source={require("../../asset/menus.png")} style={styles.drawerIcon} />

            <View>
              <Text style={styles.headerSubTitle}>
                Welcome back {userDetails?.designation || "User"},
              </Text>
              <Text style={styles.headerTitle}>
                {userDetails?.firstName} {userDetails?.lastName}
              </Text>
            </View>

            {userDetails.designation === "CEO" && (
              <TouchableOpacity
                style={styles.reminderIconWrapper}
                onPress={() => setIdleReminderModalVisible(true)}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../../asset/bell.png")}
                  style={styles.reminderIcon}
                />
                {idleApplicationList.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{idleApplicationList.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* RIGHT: REMINDER ICON FOR CEO ONLY */}
          <View style={styles.headerSummaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Today’s Overview</Text>
              <Text style={styles.summaryValue}>
                {userDetails?.designation === 'CEO'
                  ? TI.length
                  : (Dashboardcount?.applicationInprogressDtoList?.length || 0) +
                  (Dashboardcount?.leadInprogressList?.length || 0)} Active Pipelines
              </Text>
            </View>

            <View style={styles.chip}>
              <Text style={styles.chipText}>Live</Text>
            </View>
          </View>

          {/* 🔍 Global Search */}
          {/* <GlobalSearchBar
            dataSource={searchSource}
            onSelect={(item) => {
              // Navigate to details
              navigation.navigate("Applicationhistory", { Searchbar: item });
            }}
          /> */}

        </LinearGradient>

        {/* 🔹 UNDER-HEADER SUMMARY */}


        {/* CONTENT */}
        <View style={styles.contentContainer}>
          {/* Idle Reminder Modal */}
          <Modal
            visible={idleReminderModalVisible}
            animationType="slide"
            transparent
          >
            <View style={styles.modalContainer}>
              <DropdownComponentNotificationPanel
                users={users}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />

              <ScrollView>
                {filteredIdleList.length ? (
                  filteredIdleList.map(app => (
                    <View
                      key={app.applicationNo}
                      style={styles.idleAppItem}
                    >
                      <Text style={styles.idleAppText}>
                        📝 App No: {app.applicationNo}
                      </Text>
                      <Text style={styles.idleAppText}>
                        📍 Stage: {app.stage} (
                        {app.descriptions
                          ?.map(d => `"${d}"`)
                          .join(', ')}
                        )
                      </Text>
                      <Text style={styles.idleAppText}>
                        👤 User: {app.user}
                      </Text>
                      <Text style={styles.idleAppText}>
                        ⏳ Idle for: {app.idleHours} hours
                      </Text>
                      <Text style={styles.idleAppText}>
                        🕒 Last Updated: {app.lastUpdate}
                      </Text>
                      <Text
                        style={[
                          styles.reminderFlag,
                          parseFloat(app.idleHours) >
                          IDLE_THRESHOLD_HOURS &&
                          styles.reminderWarning,
                        ]}
                      >
                        ⚠️ Reminder Needed
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.noDataWrapper}>
                    <Text style={styles.noDataText}>
                      ✅ No idle applications found
                    </Text>
                  </View>
                )}
              </ScrollView>

              <Button
                title="Close"
                onPress={() => {
                  setIdleReminderModalVisible(false);
                  setSelectedUsers([]);
                }}
              />
            </View>
          </Modal>

          {/* Stage Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Applications by Stage
                </Text>

                <FlatList
                  data={Object.entries(stageCounts)}
                  keyExtractor={([stage]) => stage}
                  renderItem={({ item: [stage, apps] }) => (
                    <TouchableOpacity
                      onPress={() => handleStageClick(apps)}
                    >
                      <Text style={styles.stageText}>
                        {stage}: {apps.length} Applications
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Application list modal */}
          <Modal
            visible={applicationModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setApplicationModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {stageApplications?.some(a => a?.appId === null)
                    ? 'Select a Lead'
                    : 'Select an Application'}
                </Text>

                <FlatList
                  data={stageApplications}
                  keyExtractor={(item, index) =>
                    item?.applicationNo || `lead-${index}`
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setApplicationModalVisible(false);
                        if (item?.appId === null) {
                          navigation.navigate('Worklist', {
                            fromDashboard: item,
                          });
                        } else {
                          getLogsDetailsByApplicationNumberInprogress(
                            item.applicationNo,
                          );
                        }
                      }}
                      style={styles.itemRow}
                    >
                      <Text style={styles.stageText}>
                        {item?.appId === null
                          ? `Lead Name: ${item?.leadId || 'N/A'}`
                          : `App No: ${item?.applicationNo}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  onPress={() => setApplicationModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* KPI Cards */}
          {isLoading ? (
            <View style={styles.shimmerWrapper}>
              {[...Array(4)].map((_, i) => (
                <ShimmerPlaceHolder
                  key={i}
                  LinearGradient={LinearGradient}
                  style={styles.shimmerCard}
                  shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
                />
              ))}
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.summaryContainer}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
              showsVerticalScrollIndicator={false}
            >
              {chunkedSummaryData.map((row, rowIndex) => {
                const isSingle = row.length === 1;

                return (
                  <View
                    style={[styles.row, isSingle && { justifyContent: "center" }]}
                    key={rowIndex}
                  >
                    {row.map((item, index) => (
                      <View
                        style={[
                          styles.cardWrapper,
                          row.length === 1 && { width: width * 0.6 },
                        ]}
                        key={`${rowIndex}-${index}`}
                      >
                        <Animatable.View
                          animation="fadeInUp"
                          delay={(rowIndex * 2 + index) * 120}
                          duration={500}
                          useNativeDriver
                        >
                          <TouchableOpacity
                            onPress={item.onPress}
                            activeOpacity={0.85}
                            style={styles.summaryCard}
                          >
                            <View style={styles.cardInner}>
                              <Image source={item.icon} style={styles.cardIcon} />
                              <Text style={styles.cardCount}>{item.count ?? 0}</Text>
                              <Text style={styles.cardLabel}>{item.label}</Text>
                            </View>
                          </TouchableOpacity>
                        </Animatable.View>
                      </View>
                    ))}
                  </View>
                );
              })}


              <MyTasksSection tasks={myTasks} onTaskPress={handleTaskPress} />
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              <View style={styles.quickRow}>

                {/* View Pipeline */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.quickCard}
                  onPress={() => {

                    const pipelineData =
                      userDetails?.designation === 'CEO'
                        ? TI                   // CEO gets *full TI objects*
                        : [
                          ...(Dashboardcount?.applicationInprogressDtoList || []),
                          ...(Dashboardcount?.leadInprogressList || []),
                        ];                   // Sales gets merged arrays

                    navigation.navigate("Applicationhistory", { pipeline: pipelineData });

                  }}
                >
                  <LinearGradient colors={["#A18CD1", "#FBC2EB"]} style={styles.quickGradient}>
                    <Text style={styles.quickTitle}>View Pipeline</Text>
                    <Text style={styles.quickSub}>Track current cases</Text>
                  </LinearGradient>
                </TouchableOpacity>

              </View>

              <Text style={styles.sectionTitle}>Recent Activity</Text>

              {recentActivityfilter.map((item, index) => (
                <View key={index} style={styles.activityCard}>
                  <View style={styles.activityDot} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle}>{item.description}</Text>

                    <Text style={styles.activityMeta}>
                      {formatTimeAgo(item.lastModifiedTime)}
                    </Text>

                    {item.applicationNumber ? (
                      <Text style={styles.activityRef}>Application: {item.applicationNumber}</Text>
                    ) : item.leadId ? (
                      <Text style={styles.activityRef}>Lead: {item.leadId}</Text>
                    ) : null}
                  </View>
                </View>
              ))}



            </ScrollView>
          )}

          {/* FAB */}
          {userDetails.designation === "CEO" && (
            <View style={styles.fabWrapper}>
              {isFabVisible && (
                <View style={styles.glassFabContainer}>
                  <View style={styles.fabGlow} />
                  <View style={styles.glassFab}>
                    <LinearGradient
                      colors={["rgba(255,255,255,0.45)", "rgba(255,255,255,0.15)"]}
                      style={styles.glassBgGradient}
                    />
                    <TouchableOpacity
                      onPress={() => navigation.navigate("AIassistant")}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={require("../../asset/mic.png")}
                        style={styles.micIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.glassFabContainer}>
                <View style={styles.glassToggleButton}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.45)", "rgba(255,255,255,0.15)"]}
                    style={styles.glassToggleBg}
                  />
                  <TouchableOpacity onPress={toggleFabVisibility} activeOpacity={0.8}>
                    <Image
                      source={
                        isFabVisible
                          ? require("../../asset/down.png")
                          : require("../../asset/up.png")
                      }
                      style={styles.arrowIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// =========================
// 🎨 STYLES (Responsive Cards)
// =========================

const styles = StyleSheet.create({
  shimmerWrapper: {
    padding: 16,
  },
  shimmerCard: {
    height: height * 0.16,
    borderRadius: 16,
    marginBottom: 12,
    width: width * 0.9,
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: height * 0.18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1D1F',
    marginBottom: 10,
  },
  stageText: {
    fontSize: 15,
    color: '#222',
    marginVertical: 4,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    fontWeight: '600',
  },
  idleAppItem: {
    backgroundColor: '#F0F6FF',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
  },
  idleAppText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 3,
  },
  reminderFlag: {
    fontSize: 12,
    marginTop: 4,
    color: '#888',
  },
  reminderWarning: {
    color: '#E53935',
    fontWeight: '600',
  },
  noDataWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
  itemRow: {
    paddingVertical: 8,
  },
  ////////New Style ///////////
  safeContainer: {
    flex: 1,
    // backgroundColor: "#2196F3",
  },

  container: {
    flex: 1,
  },

  /* ---------------------------------------------------------------------- */
  /* 🔷 PREMIUM HYBRID HEADER */
  /* ---------------------------------------------------------------------- */
  headerGradient: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 48,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  drawerIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFF",
    marginRight: 12,
  },

  headerSubTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },

  /* CEO Bell Notification */
  reminderIconWrapper: {
    position: "relative",
    padding: 5,
  },

  reminderIcon: {
    width: 28,
    height: 28,
    tintColor: "#FFF",
  },

  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FFD600",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "700",
  },

  /* ---------------------------------------------------------------------- */
  /* 🔹 UNDER HEADER SUMMARY */
  /* ---------------------------------------------------------------------- */
  headerSummaryRow: {
    // marginTop: -12,
    backgroundColor: "#FFF",
    marginHorizontal: 18,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  summaryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2196F3",
    marginTop: 2,
  },

  chip: {
    backgroundColor: "#E8F1FF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2196F3",
  },

  /* ---------------------------------------------------------------------- */
  /* MAIN CONTENT AREA */
  /* ---------------------------------------------------------------------- */
  contentContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    marginTop: 12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1D1F",
    marginVertical: 12,
  },

  /* ---------------------------------------------------------------------- */
  /* KPI GRID */
  /* ---------------------------------------------------------------------- */
  summaryContainer: {
    width: "100%",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  cardWrapper: {
    width: "48%", // Responsive 2-column
  },

  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cardInner: {
    alignItems: "center",
  },

  cardIcon: {
    width: 38,
    height: 38,
    marginBottom: 6,
    resizeMode: "contain",
  },

  cardCount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2196F3",
  },

  cardLabel: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
    textAlign: "center",
  },

  /* ---------------------------------------------------------------------- */
  /* QUICK ACTIONS */
  /* ---------------------------------------------------------------------- */
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  quickCard: {
    width: "48%",
    borderRadius: 18,
    overflow: "hidden",
  },

  quickGradient: {
    paddingVertical: 20,
    paddingHorizontal: 14,
    borderRadius: 18,
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },

  quickSub: {
    fontSize: 13,
    opacity: 0.9,
    color: "#FFF",
    marginTop: 4,
  },

  /* ---------------------------------------------------------------------- */
  /* RECENT ACTIVITY */
  /* ---------------------------------------------------------------------- */
  activityCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
    marginRight: 12,
    marginTop: 6,
  },

  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  activityMeta: {
    marginTop: 2,
    fontSize: 13,
    color: "#777",
  },

  activityRef: {
    marginTop: 4,
    fontSize: 13,
    color: "#2196F3",
    fontWeight: "600",
  },

  /* ---------------------------------------------------------------------- */
  /* FAB BUTTONS (CEO ONLY) */
  /* ---------------------------------------------------------------------- */
  fabWrapper: {
    position: "absolute",
    right: 20,
    bottom: 30,
    alignItems: "center",
  },

  glassFabContainer: {
    padding: 4,
    borderRadius: 40,
  },

  fabGlow: {
    position: "absolute",
    height: 90,
    width: 90,
    borderRadius: 45,
    backgroundColor: "rgba(0,122,255,0.15)",
    bottom: -12,
    alignSelf: "center",
  },

  glassFab: {
    height: 65,
    width: 65,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  glassBgGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  micIcon: {
    width: 36,
    height: 36,
    tintColor: "#2196F3",
  },

  glassToggleButton: {
    marginTop: 12,
    height: 55,
    width: 55,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },

  glassToggleBg: {
    ...StyleSheet.absoluteFillObject,
  },

  arrowIcon: {
    width: 28,
    height: 28,
    tintColor: "#2196F3",
  },


  myTasksContainer: {
    marginTop: verticalScale(12),
    // marginHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  myTasksHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },
  myTasksTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#111827",
  },
  myTasksSubtitle: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: 2,
  },
  myTasksChipRow: {
    paddingVertical: verticalScale(4),
    paddingRight: scale(4),
  },
  taskChip: {
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginRight: scale(6),
  },
  taskChipActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  taskChipText: {
    fontSize: moderateScale(11),
    color: "#374151",
    fontWeight: "500",
  },
  taskChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: verticalScale(8),
    marginTop: verticalScale(6),
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },
  taskLeftAccent: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 10,
    marginRight: scale(8),
    backgroundColor: "#3B82F6",
  },
  taskTitle: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#111827",
  },
  taskMeta: {
    fontSize: moderateScale(11.5),
    color: "#4B5563",
    marginTop: 2,
  },
  taskTime: {
    fontSize: moderateScale(11),
    color: "#9CA3AF",
    marginTop: 2,
  },
  taskFooterHint: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(11),
    color: "#9CA3AF",
  },
  expandContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },

  expandText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },

  expandArrow: {
    fontSize: 18,
    color: "#2563EB",
    marginTop: 2,
  },

});

export default PreUnderWriterDashboard;
