


import React, { useState, useEffect, useCallback, useContext } from 'react';
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
  useColorScheme,
  Dimensions, Modal, Button,
  StatusBar,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../api/Endpoints.js';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { DrawerContext } from '../../../Drawer/DrawerContext';
import * as Animatable from 'react-native-animatable';
// import { PieChart, BarChart } from 'react-native-chart-kit';
// import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');
const SalesDashboard = () => {
  const mkc = useSelector(state => state.auth.losuserDetails);
  const userDetails = mkc;
  const token = useSelector(state => state.auth.token);
  const userId = useSelector(state => state.auth.userId);
  const userName = useSelector(state => state.auth.userName);

  console.log(mkc, token, 'mkcmkc')
  const getInitials = () => {
    if (!mkc) return "U"; // fallback for safety

    const f = mkc?.firstName?.[0] || "";
    const l = mkc?.lastName?.[0] || "";
    return (f + l).toUpperCase();
  };

  const userInitials = getInitials();

  console.log(mkc, 'mkcmkc')
  const { isDrawerVisible, openDrawer, closeDrawer } = useContext(DrawerContext);

  const navigation = useNavigation();
  const [recentActivityfilter, setrecentActivityfilter] = useState([]);
  console.log(recentActivityfilter, 'recentActivityfilterrecentActivityfilter')
  const [overAllleads, setoverAllleads] = useState([])
  const [leads, setLeads] = useState([]);
  const [totalleads, settotalleads] = useState([]);
  const [applications, setApplications] = useState([]);
  const [DisbursedCase, setDisbursedCase] = useState([]);
  const [RejectedCase, setRejectedCase] = useState([]);
  const [logsData, setlogsData] = useState([])
  const [finalApplicationInp, setfinalApplicationInp] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // const token = useSelector((state) => state.auth.token);
  const [BusinessDate, setBusinessDate] = useState([])
  console.log(BusinessDate, 'BusinessDateBusinessDate')
  const [TT, setTT] = useState([]);
  const [TD, setTD] = useState([]);
  const [TR, setTR] = useState([]);
  const [TI, setTI] = useState([]);
  const Disbursed = Array.isArray(applications)
    ? applications.filter(application => application.stage === 'Disbursed')
    : [];
  const Rejected = Array.isArray(applications)
    ? applications.filter(application => application.stage === 'Rejected')
    : [];

  const [counts, setCounts] = useState({
    leadsCount: 0,
    applicationsCount: 0,
    disbursedCount: 0,
    rejectedCount: 0,
  });
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!logsData || !mkc?.userName) return;
    const filtered = logsData
      .filter(item => item.user === mkc.userName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))  // latest first
      .slice(0, 10); // limit to 10 activities (optional)

    setrecentActivityfilter(filtered);
  }, [logsData, mkc?.userName]);

  const getBusinessDate = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getBusinessDate`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      setBusinessDate(response.data.data);

    } catch (error) {
      console.error('Error fetching lead Designation:', error);
      Alert.alert('Error', 'Failed to fetch Designation');
    }
  }
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);
  const fetchData = async () => {
    setIsLoading(true); // Start loading indicator

    try {
      // Step 1: Fetch Leads
      const leadsResponse = await axios.get(`${BASE_URL}getLeads`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const leadsData = leadsResponse?.data?.data?.filter(
        (lead) => lead.applicantTypeCode === 'Applicant' && lead.createdBy === mkc.userName
      ) || [];


      if (!Array.isArray(leadsData) || leadsData.length === 0) {

        // Alert.alert('No Data', 'No leads found.');
        setIsLoading(false);
        return;
      }


      // Step 2: Fetch Applications
      const applicationsResponse = await axios.get(`${BASE_URL}getAllApplication`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let applicationsData = applicationsResponse?.data?.data;

      // Ensure applicationsData is always an array
      if (!Array.isArray(applicationsData)) {
        applicationsData = [];
      }

      if (applicationsData.length === 0) {
        // 
        // Alert.alert('No Data', 'No applications found.');
        setIsLoading(false);
        return;
      }

      const filteredLeadsData = leadsData.filter(({ leadStatus }) => {
        const statusName = leadStatus?.leadStatusName?.trim()?.toLowerCase();
        return statusName !== "sent to los" && statusName !== "rejected";
      });

      const filteredRejectedleads = leadsData.filter(({ leadStatus }) => {
        const statusName = leadStatus?.leadStatusName?.trim()?.toLowerCase();
        return statusName === "rejected";
      });
      setLeads(filteredLeadsData);
      setoverAllleads(filteredRejectedleads)
      setApplications(applicationsData);


      // Step 3: Fetch Logs Details (Only after leads & applications are fetched)
      await getLogsDetailsByApplicationNumber(applicationsData);
      // await getAllEnquiry();
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading indicator
      setIsRefreshing(false); // Stop refreshing
    }
  };

  useEffect(() => {
    getDashBoardCountAndList();
  }, [mkc])
  const getDashBoardCountAndList = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getDashBoardCountAndList?userName=${mkc.userName}&roleName=${mkc.role[0]?.roleName}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.msgKey === 'Success') {
        const countdata = response.data.data

        setfinalApplicationInp(countdata.applicationInprogressDtoList)
        settotalleads(countdata?.totalLeadList)
        setDisbursedCase(countdata?.applicationDisbursedDtoList)
      }

      // setDashboardData(response.data); // if you want to store it in state
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
    }
  };

  const getLogsDetailsByApplicationNumber = async (applications) => {
    try {
      if (!applications) {

        return;
      }

      const { data } = await axios.get(`${BASE_URL}getAllLogsDetails`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const logsData = data?.data || [];

      // Filter logs to only include those created by the logged-in user
      const userLogs = logsData.filter(log => log.user === mkc.userName);
      const userAppNumbers = new Set(userLogs.map(log => log.applicationNumber));

      // Filter logs where applicationNumber matches any from userLogs
      const forlead = logsData.filter(k => userAppNumbers.has(k.applicationNumber));

      const filteredLeadSales = forlead.filter(log =>
        log.description === "Fee Details"
      );
      const filteredLeadCredit = [];
      const seenApplicationNumbers = new Set();

      forlead.forEach(log => {
        if (log.description === "InitiateVerification" && !seenApplicationNumbers.has(log.applicationNumber)) {
          seenApplicationNumbers.add(log.applicationNumber);
          filteredLeadCredit.push(log);
        }
      });


      const filteredLeadCreditRejectCase = [];
      const seenApplicationNumbersRejecteCase = new Set();

      forlead.forEach(log => {
        // Step 1: Check if the log's status is 'Rejected' and description is 'Decision Level 3'
        if (log.status === "Rejected" && log.description === "Decision Level 3") {
          // Filter all logs with the same applicationNumber and 'Decision Level 3' description
          const decisionLevel3Logs = forlead.filter(
            l => l.applicationNumber === log.applicationNumber && l.description === "Decision Level 3"
          );

          // Step 2: If there are exactly 3 'Decision Level 3' logs for this application, push only one of them to the result array
          if (decisionLevel3Logs.length >= 3 && !seenApplicationNumbersRejecteCase.has(log.applicationNumber)) {
            // Push just one log, not all 3
            seenApplicationNumbersRejecteCase.add(log.applicationNumber);
            filteredLeadCreditRejectCase.push(decisionLevel3Logs[0]); // Only push one log
          }
        }
      });

      // Step 3: If there are no 'Rejected' and 'Decision Level 3' logs or not enough, find other 'Rejected' cases with description not 'Decision Level 3'
      // List of excluded users
      const excludedUsers = ["Comittee1", "Comittee2", "Comittee3", "Comittee4"];

      forlead.forEach(log => {
        // Ensure the log's status is 'Rejected', the user is not one of the excluded users, and the description is not 'Decision Level 3'
        if (log.status === "Rejected" && !excludedUsers.includes(log.user) && log.description !== "Decision Level 3") {
          // Avoid pushing duplicate applicationNumber
          if (!seenApplicationNumbersRejecteCase.has(log.applicationNumber)) {
            seenApplicationNumbersRejecteCase.add(log.applicationNumber);
            filteredLeadCreditRejectCase.push(log);
          }
        }
      });

      const filteredLeadCreditDisbursedCases = [];
      const seenApplicationNumbersDisbursedCase = new Set();

      forlead.forEach(log => {
        if (log.status === "Disbursed" && !seenApplicationNumbersDisbursedCase.has(log.applicationNumber)) {
          seenApplicationNumbersDisbursedCase.add(log.applicationNumber);
          filteredLeadCreditDisbursedCases.push(log);
        }
      });

      const matchedApplicationNumbers = new Set(filteredLeadCreditDisbursedCases.map(log => log.applicationNumber));

      filteredLeadCredit.forEach(log => {
        if (matchedApplicationNumbers.has(log.applicationNumber)) {
          // If match is found, empty the filteredLeadCredit array
          filteredLeadCredit.length = 0;  // This clears the array
        }
      })
      const matchingAppNumbers = new Set(userLogs.map(log => log.applicationNumber));

      const filteredApplicationsSales = applications.filter(item =>
        matchingAppNumbers.has(item.applicationNo) &&
        item.stage !== "Disbursed" &&
        item.stage !== "Rejected"
      );

      // Filter applications based on the user's logs
      const filteredApplications = applications.filter(item =>
        matchingAppNumbers.has(item.applicationNo)
      );

      // Further filter Disbursed and Rejected cases based on the same user
      const DisbursedCases = filteredApplications.filter(item => item.stage === "Disbursed")
      const RejectedCases = filteredApplications.filter(item => item.stage === "Rejected")



      setRejectedCase(RejectedCases);
      // setDisbursedCase(filteredLeadCreditDisbursedCases);
      setlogsData(logsData)

      // setfinalApplicationInp(filteredApplicationsSales)


    } catch (error) {
      console.error('Error fetching logs details:', error.message || error);
    }
  };


  useEffect(() => {
    if (token) {
      fetchData();
      getBusinessDate();
    }
  }, [token]);



  const handleCardPress = (item) => {
    // Navigate to 'Application Status' with the selected data
    navigation.navigate('Application Status', { selectedLeadfromtab: item });
  };

  const handleRejectedCardPress = () => {
    const hasRejected = RejectedCase?.length > 0;
    const hasLeads = overAllleads?.length > 0;

    if (hasLeads && !hasRejected) {
      navigation.navigate('Tab Details', { data: overAllleads, label: 'Leads' });
    } else if (!hasLeads && hasRejected) {
      handleCardPress(RejectedCase);
    } else if (hasLeads && hasRejected) {
      // setShowChoiceModal(true); // Show modal for user choice
    } else {
      // Optional: show toast or alert saying no data
      Alert.alert('No Data Available');
    }
  };

  const summaryData = [
    {
      icon: require('../asset/team-lead.png'),
      count: totalleads.length,
      label: 'Total Leads',
      onPress: () => navigation.navigate('Tab Details', { data: totalleads, label: 'Leads' }),
    },
    {
      icon: require('../asset/team-lead.png'),
      count: leads.length,
      label: 'In Progress',     // 🔥 shortened
      onPress: () => navigation.navigate('Tab Details', { data: leads, label: 'Leads' }),
    },
    {
      icon: require('../asset/in-progress.png'),
      count: finalApplicationInp.length,
      label: 'Applications',    // 🔥 shortened
      onPress: () => handleCardPress(finalApplicationInp),
    },
    {
      icon: require('../asset/disbursed.png'),
      count: DisbursedCase.length,
      label: 'Disbursed',
      onPress: () => handleCardPress(DisbursedCase),
    },
    {
      icon: require('../asset/rejected.png'),
      count: RejectedCase?.length + overAllleads?.length,
      label: 'Rejected',
      onPress: handleRejectedCardPress,
    },
  ];

  const chunkArray = (arr, size) => {
    return arr.reduce((acc, _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);
  };

  const chunkedSummaryData = chunkArray(summaryData, 2);
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


  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ---------------- PREMIUM HEADER ---------------- */}
      {/* <LinearGradient colors={["#2196F3", "#003A8C"]} style={styles.headerWrapper}> */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          {/* LEFT SIDE */}
          <TouchableOpacity style={styles.headerLeft} onPress={openDrawer} activeOpacity={0.85}>
            <Image
              source={require("../../asset/menus.png")}
              style={styles.drawerIcon}
            />

            <View>
              <Text style={styles.headerSubTitle}>Welcome back,</Text>
              <Text style={styles.headerTitle}>
                {mkc?.firstName} {mkc?.lastName}
              </Text>
            </View>


          </TouchableOpacity>

          {/* RIGHT AVATAR */}
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
        </View>

        {/* SMALL SUMMARY UNDER HEADER */}
        <View style={styles.headerSummaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Today's Overview</Text>
            <Text style={styles.summaryValue}>
              {leads.length + finalApplicationInp.length} Active Pipelines
            </Text>
          </View>

          <View style={styles.chip}>
            <Text style={styles.chipText}>Live</Text>
          </View>
        </View>
      </View>
      {/* </LinearGradient> */}

      {/* ------------------ MAIN CONTENT ------------------ */}
      <View style={styles.mainContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>

          {/* SECTION TITLE */}
          <Text style={styles.sectionTitle}>Summary</Text>

          {/* -------- KPI ROWS -------- */}
          {chunkedSummaryData.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[styles.row, row.length === 1 && { justifyContent: "center" }]}
            >
              {row.map((item, index) => (
                <View
                  key={index}
                  style={[styles.cardWrapper, row.length === 1 && { width: width * 0.6 }]}
                >
                  <Animatable.View
                    animation="fadeInUp"
                    delay={(rowIndex * 2 + index) * 120}
                    duration={500}
                    useNativeDriver
                  >
                    <TouchableOpacity
                      style={styles.summaryCard}
                      activeOpacity={0.85}
                      onPress={item.onPress}
                    >
                      <View style={styles.cardInner}>
                        <Image source={item.icon} style={styles.cardIcon} />
                        <Text style={styles.cardCount}>{item.count}</Text>
                        <Text style={styles.cardLabel}>{item.label}</Text>
                      </View>
                    </TouchableOpacity>
                  </Animatable.View>
                </View>
              ))}
            </View>
          ))}

          {/* ------------------ QUICK ACTIONS ------------------ */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickRow}>

            {/* NEW LEAD */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.quickCard}
              onPress={() => navigation.navigate("Lead", { lead: true })}
            >
              <LinearGradient colors={["#FF9A9E", "#FAD0C4"]} style={styles.quickGradient}>
                <Text style={styles.quickTitle}>New Lead</Text>
                <Text style={styles.quickSub}>Create fresh entry</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* VIEW PIPELINE */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.quickCard}
              onPress={() =>
                navigation.navigate("Application Status", {
                  pipeline: [...leads, ...finalApplicationInp],
                })
              }
            >
              <LinearGradient colors={["#A18CD1", "#FBC2EB"]} style={styles.quickGradient}>
                <Text style={styles.quickTitle}>View Pipeline</Text>
                <Text style={styles.quickSub}>Track current cases</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ------------------ RECENT ACTIVITY ------------------ */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {recentActivityfilter.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.activityCard}>

              <View style={styles.activityDot} />

              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{item.description}</Text>

                <Text style={styles.activityMeta}>
                  {formatTimeAgo(item.lastModifiedTime)}
                </Text>

                {/* STAGE BADGE */}
                <View style={[styles.stageBadge, stageBadge(item.stage)]}>
                  <Text style={styles.stageBadgeText}>{item.stage}</Text>
                </View>

                {/* LEAD / APP REF */}
                {item.applicationNumber && (
                  <Text style={styles.activityRef}>Application: {item.applicationNumber}</Text>
                )}
                {item.leadId && (
                  <Text style={styles.activityRef}>Lead: {item.leadId}</Text>
                )}
              </View>
            </View>
          ))}

          {/* ---------- View All ---------- */}
          <TouchableOpacity
            // onPress={() => navigation.navigate("Activity Log")}
            onPress={() => navigation.navigate('Tab Details', { data: totalleads, label: 'Leads' })}
            style={styles.viewAllWrapper}
          >
            <Text style={styles.viewAllText}>View all →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  // ----- Layout Containers -----
  safeContainer: {
    flex: 1,
    backgroundColor: '#2196F3', // behind gradient
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ----- Header -----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: '#2196F3',
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : verticalScale(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    marginTop: -20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 44,
    paddingBottom: 18,
    paddingHorizontal: 16,
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerShadowLine: {
    height: 20,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: -10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },

  drawerIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: scale(8),
  },

  // ----- Tabs -----
  tabHeader: {
    backgroundColor: '#2196F3',
    height: verticalScale(60),
    justifyContent: 'center',
    elevation: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabBar: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tab: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(26),
    borderRadius: moderateScale(20),
    marginHorizontal: scale(4),
    backgroundColor: '#FFFFFF33', // Semi-transparent white
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },

  // ----- Summary Section -----
  summaryContainer: {
    // paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',

    alignItems: 'center',
    // backgroundColor: 'red',

  },

  cardWrapper: {
    width: width * 0.46,
    // backgroundColor: 'pink',
    // alignItems:'center'
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    // backgroundColor:'transparent',
    borderRadius: 22,
    height: height * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    margin: 5,
    // gap: 10,
    // Soft shadow bottom
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,

    overflow: 'hidden',
  },
  cardIcon: {
    width: scale(40),
    height: scale(40),
    marginBottom: verticalScale(8),
    resizeMode: 'contain',
  },
  cardInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardIcon: {
    width: 38,
    height: 38,
    marginBottom: 6,
    opacity: 0.9,
    resizeMode: 'contain',
  },


  cardCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2196F3',
  },

  cardLabel: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  // ----- Modal -----
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: scale(25),
    borderRadius: moderateScale(16),
    width: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  modalSubtitle: {
    fontSize: moderateScale(15),
    color: '#555555',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  modalButton: {
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(10),
    backgroundColor: '#2196F3',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    textAlign: 'center',
  },

  // ----- Drawer Background -----
  drawerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },

  safeContainer: { flex: 1, backgroundColor: '#2196F3' },

  headerWrapper: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: { flexDirection: 'row', alignItems: 'center' },

  drawerIcon: { width: 26, height: 26, tintColor: '#fff', marginRight: 12 },

  headerSubTitle: { fontSize: 12, color: '#D0E2FF' },

  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },

  avatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  headerSummaryRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: { color: '#DCE7FF', fontSize: 13 },

  summaryValue: { color: '#fff', fontSize: 16, fontWeight: '600' },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  chipText: { color: '#fff', fontWeight: '600' },

  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },

  kpiGrid: { marginBottom: 20 },



  kpiCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    elevation: 4,
    marginBottom: 14,
    alignItems: 'center',
  },

  cardIcon: { width: 32, height: 32, marginBottom: 10 },

  kpiValue: { fontSize: 22, fontWeight: '700', color: '#2196F3' },

  kpiLabel: { fontSize: 14, color: '#444' },

  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },

  quickCard: { width: '48%' },

  quickGradient: {
    padding: 16,
    borderRadius: 18,
  },

  quickTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },

  quickSub: { color: '#fff', opacity: 0.9, fontSize: 12, marginTop: 4 },

  activityCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
  },

  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginRight: 12,
    marginTop: 6,
  },

  activityTitle: { fontSize: 14, fontWeight: '600', color: '#222' },

  activityMeta: { fontSize: 12, color: '#666', marginTop: 3 },



  ///////New UI/////

  safeContainer: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },

  headerWrapper: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 22,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  drawerIcon: {
    width: 26,
    height: 26,
    tintColor: "#fff",
    marginRight: 10,
  },

  headerSubTitle: {
    color: "#d9e6ff",
    fontSize: 12,
    fontWeight: "500",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  avatarWrapper: {
    backgroundColor: "#ffffff33",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff55",
  },

  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  headerSummaryRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    color: "#d8e8ff",
    fontSize: 13,
  },

  summaryValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  chip: {
    backgroundColor: "#ffffff33",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  chipText: {
    color: "#fff",
    fontWeight: "700",
  },

  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    marginTop: -20,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
    marginLeft: 16,
  },

  /* KPI Cards */
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  kpiCard: {
    width: "45%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  kpiIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginBottom: 6,
  },

  kpiValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#333",
  },

  kpiLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    flexWrap: "nowrap",      // <--- prevents ugly wrapping
  },
  /* Quick Actions */
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  quickCard: {
    width: "48%",
    borderRadius: 20,
    overflow: "hidden",
  },

  quickGradient: {
    paddingVertical: 20,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  quickSub: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },

  /* Recent Activity */
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 2,
  },

  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
    marginRight: 12,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  activityMeta: {
    fontSize: 12,
    color: "#666",
  },




  safeContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  headerWrapper: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: '#2196F3'
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  drawerIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
    tintColor: "#fff",
  },

  headerSubTitle: {
    color: "#cce4ff",
    fontSize: 13,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  avatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#2196F3",
    fontWeight: "700",
    fontSize: 16,
  },

  headerSummaryRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    color: "#e5e5e5",
    fontSize: 13,
  },

  summaryValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  chip: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  chipText: {
    fontWeight: "700",
    color: "#2196F3",
  },

  mainContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: "#F5F7FA",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },

  // ---------------- KPI Cards ----------------
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  cardWrapper: {
    width: width * 0.44,
  },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  cardInner: {
    alignItems: "center",
  },

  cardIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },

  cardCount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2196F3",
  },

  cardLabel: {
    fontSize: 13,
    marginTop: 4,
    color: "#444",
    fontWeight: "600",
  },

  // ---------------- QUICK ACTIONS ----------------
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  quickCard: {
    width: width * 0.44,
    borderRadius: 16,
    overflow: "hidden",
  },

  quickGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  quickSub: {
    marginTop: 6,
    fontSize: 12,
    color: "#fff",
    opacity: 0.85,
  },

  // ---------------- RECENT ACTIVITY ----------------
  activityCard: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 16,
    elevation: 3,
  },

  activityDot: {
    width: 10,
    height: 10,
    backgroundColor: "#2196F3",
    borderRadius: 5,
    marginRight: 12,
    marginTop: 6,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },

  activityMeta: {
    fontSize: 12,
    marginTop: 4,
    color: "#777",
  },

  activityRef: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#2196F3",
  },

  // Badges
  stageBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  stageBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  stageRejected: {
    backgroundColor: "#FF3B30",
  },

  stageApproved: {
    backgroundColor: "#34C759",
  },

  stageProgress: {
    backgroundColor: "#FF9500",
  },

  stageDefault: {
    backgroundColor: "#999",
  },

  viewAllWrapper: {
    alignItems: "center",
    marginTop: 6,
  },

  viewAllText: {
    color: "#2196F3",
    fontWeight: "700",
  },


});


export default SalesDashboard;
