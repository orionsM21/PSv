import React, { useEffect, useContext, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Provider } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { BASE_URL } from '../../api/Endpoints';
import { DrawerContext } from '../../../../Drawer/DrawerContext';

import Loader from '../Component/Loader';
import TableHeader from '../Component/TableHeader';
import TableRow from '../Component/TableRow';
import ApplicationDetails from '../Component/ApplicantDetailsComponent';
import ApplicationCardDetail from '../Component/ApplicationCardDetail';





const RenderCard = React.memo(({ item, index, isExpanded, onPress, toggleCard }) => {
  const applicant = item?.applicant?.find(a => a.applicantTypeCode === 'Applicant');
  const individual = applicant?.individualApplicant;
  const organization = applicant?.organizationApplicant;


  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.85}
      style={[styles.card, isExpanded && styles.expandedCard]}
    >
      {/* ───── Collapsed Header ───── */}
      <View style={styles.collapsedHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Application Number: <Text style={styles.cardText}>{item.applicationNo || 'N/A'}</Text>
          </Text>

          <Text style={styles.cardText}>
            {individual
              ? `Name: ${(`${individual.firstName || ""} ${individual.middleName || ""} ${individual.lastName || ""}`).trim()}`
              : `Organization Name: ${organization?.organizationName || "N/A"}`}
          </Text>

          {/* Stage Badge */}
          {item.stage && (
            <View
              style={[
                styles.statusBadge,
                item.stage === 'Rejected'
                  ? { backgroundColor: '#ef4444' }
                  : item.stage === 'Disbursed'
                    ? { backgroundColor: '#22c55e' }
                    : { backgroundColor: '#9ca3af' },
              ]}
            >
              <Text style={styles.statusBadgeText}>{item.stage}</Text>
            </View>
          )}
        </View>

        {/* Expand / Collapse Icon */}
        <TouchableOpacity onPress={() => toggleCard(index)}>
          <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>

      {/* ───── Expanded Section ───── */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {[
            ['Product', item.productName],
            ['Portfolio', item.portfolioDescription],
            ['Category', applicant?.applicantCategoryCode],
            ['Mobile No', individual?.mobileNumber],
            ['PAN', individual?.pan],
            ['Stage', item.stage],
            ['Assigned To', `${item.assignTo?.firstName || ''} ${item.assignTo?.lastName || 'N/A'}`],
          ].map(([label, value], idx) => (
            <View key={idx} style={styles.textRow}>
              <Text style={styles.cardLabel}>{label}:</Text>
              <Text style={styles.cardValue}>{value || 'N/A'}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
});


const PreHistory = ({ route }) => {
  // const { item } = route.params;
  // const route = useRoute();
  const { selectedLeadfromtab } = route.params || {};
  const { pipeline } = route.params || {};
  const searchData = route.params?.Searchbar || {};   // ← get the passed item
  const logsCacheRef = useRef({});
  console.log("Search Result Received:", searchData);
  console.log(pipeline, 'pipelinepipeline')
  // const selectedLeadfromtab = route?.params?.selectedLeadfromtab;
  const headers = ['Activity', 'Stage', 'Type', 'Status', 'User', 'Start Date', 'End Date',];
  const mkc = useSelector(state => state.auth.losuserDetails);
  const bkc = mkc.role[0];

  const token = useSelector((state) => state.auth.token);
  const navigation = useNavigation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [applicationData, setApplicationData] = useState([]);
  const [FilteredApplicationData, setFilteredApplicationData] = useState([]);
  const [finalApplication, setfinalApplication] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // State for the selected item

  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [latestApplications, setLatestApplications] = useState([]);
  const userDetails = useSelector((state) => state.auth.losuserDetails);

  const toggleCard = index => {
    setExpandedCardIndex(prevIndex => (prevIndex === index ? null : index));
  };
  const { openDrawer } = useContext(DrawerContext);
  const applicant = useMemo(() => {
    // Check if selectedItem and applicant array are defined
    if (selectedItem?.applicant) {
      // Find the object where applicantTypeCode is "Applicant"
      const applicant = selectedItem.applicant.find(
        app => app.applicantTypeCode === 'Applicant',
      );
      // Return the applicantCategoryCode or an empty string if not found
      return applicant;
    }
    return ''; // Default to an empty string if selectedItem or applicant is not defined
  }, [selectedItem]);


  const formattedApplicantCategory = useMemo(() => {
    // Check if selectedItem and applicant array are defined
    if (selectedItem?.applicant) {
      // Find the object where applicantTypeCode is "Applicant"
      const applicant = selectedItem.applicant.find(
        app => app.applicantTypeCode === 'Applicant',
      );
      // Return the applicantCategoryCode or an empty string if not found
      return applicant?.applicantCategoryCode || '';
    }
    return ''; // Default to an empty string if selectedItem or applicant is not defined
  }, [selectedItem]);

  const [logDetails, setLogDetails] = useState([]);
  // 
  const [loading, setLoading] = useState(false);

  const toggleDrawer = useCallback(() => setDrawerVisible(prev => !prev), []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () =>
      setDrawerVisible(false),
    );
    return unsubscribe;
  }, [navigation]);

  const getLatestApplications = (applications) => {
    const groupedApplications = applications.reduce((acc, application) => {
      // Group by applicationNo
      const { applicationNo, createdTime } = application;

      // If this applicationNo has not been seen before, add it to the accumulator
      if (!acc[applicationNo]) {
        acc[applicationNo] = application;
      } else {
        // Otherwise, compare createdTime and keep the one with the latest createdTime
        const existingApplication = acc[applicationNo];
        if (new Date(createdTime) > new Date(existingApplication.createdTime)) {
          acc[applicationNo] = application;
        }
      }
      return acc;
    }, {});

    // Return an array of the latest applications
    return Object.values(groupedApplications);
  };
  const renderLabelInput = (
    label,
    value,
    isMultiLine = false,
    disableStyle = false,
    editable = true
  ) => (
    <View style={styles.formColumncam}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          disableStyle && styles.disabledInput,
          {
            height: 'auto',        // ✅ allow dynamic height
            textAlignVertical: 'center',
            flexWrap: 'wrap',      // ✅ wrap long text
          },
        ]}
        value={value || 'N/A'}
        editable={editable}
        multiline={true}           // ✅ force multiline for better wrapping
        scrollEnabled={false}      // ✅ prevent inner scrolling
      />
    </View>
  );
  const formatNumberWithCommas = (value) => {
    if (!value || isNaN(value)) return value; // Return original value if not a valid number
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
  };
  const getAllApplication = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}getAllApplication`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      let applicationsData = response?.data?.data;
      await getLogsDetailsByApplicationNumberhistory(applicationsData);
      // const fetchedApplications = getLatestApplications(response.data.data || []);
      // setLatestApplications(fetchedApplications); // Set the latest applications in state
      setApplicationData(applicationsData); // Set applicationData with the latest applications
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch application data');
      console.error('API Call Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);


  const getLogsDetailsByApplicationNumber = useCallback(async applicationNo => {
    try {
      const response = await axios.get(
        `${BASE_URL}getLogsDetailsByApplicationNumber/${applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      const data = response.data.data || [];

      // 
      setLogDetails(data);
    } catch (error) {
      console.error('Error fetching logs details:', error);
    }
  }, []);

  const getLogsDetailsByApplicationNumberhistory = async (applications) => {
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
      const userLogs = logsData.filter(log => log.user === mkc.userName);
      // const userLogs = logsData.filter(log => log.user === mkc.userName && log.description === 'InitiateVerification');
      const matchingAppNumbers = new Set(userLogs.map(log => log.applicationNumber));
      const filteredApplications = applications.filter(item =>
        matchingAppNumbers.has(item.applicationNo)
      );






      setfinalApplication(filteredApplications);

    } catch (error) {
      console.error('Error fetching logs details:', error.message || error);
    }
  };




  // Handle card press
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const handleCardPress = useCallback(
    (item) => {
      // If no application number → redirect to Credit Lead
      if (!item?.applicationNo) {
        navigation.navigate("Credit Lead", {
          selectedLeadfromtab: item,
        });
        return;
      }

      // Otherwise → open logs modal
      setSelectedItem(item);
      setModalVisible(true);
      setIsLoadingLogs(true);

      getLogsDetailsByApplicationNumber(item.applicationNo)
        .finally(() => setIsLoadingLogs(false));
    },
    [navigation, getLogsDetailsByApplicationNumber]
  );


  useEffect(() => {
    if (selectedLeadfromtab?.applicationNo) {
      handleCardPress(selectedLeadfromtab); // Now contains full item
    }
  }, [selectedLeadfromtab]);


  useEffect(() => {
    getAllApplication();
  }, [getAllApplication]);

  useFocusEffect(
    useCallback(() => {
      // Clear the form fields when the page comes into focus
      getAllApplication();
    }, []),
  );


  useEffect(() => {
    if (applicationData?.length > 0 && finalApplication?.length > 0) {
      const filteredData = applicationData.filter(item =>
        finalApplication.some(finalItem => finalItem?.applicationNo === item?.applicationNo)
      );
      setFilteredApplicationData(filteredData);
    }
  }, [finalApplication, applicationData]);

  const renderCardCallback = useCallback(
    ({ item, index }) => (
      <RenderCard
        item={item}
        index={index}
        isExpanded={expandedCardIndex === index}
        onPress={handleCardPress}
        toggleCard={toggleCard}
      />
    ),
    [expandedCardIndex]
  );

  const [expandedAppNo, setExpandedAppNo] = useState(null);

  const handleToggleExpand = useCallback((applicationNo) => {
    setExpandedAppNo(prev =>
      prev === applicationNo ? null : applicationNo
    );
  }, []);


  const listData = useMemo(() => {

    if (pipeline && Array.isArray(pipeline)) {
      return pipeline;  // ← pipeline sent from Dashboard
    }

    if (['CEO', 'Sales Head'].includes(userDetails?.designation)) {
      return applicationData || [];
    }

    return FilteredApplicationData || [];

  }, [pipeline, userDetails?.designation, applicationData, FilteredApplicationData]);


  return (
    <Provider>
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />


        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={openDrawer} activeOpacity={0.85}>
              <Image
                source={require("../../asset/menus.png")}
                style={styles.drawerIcon}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Application History</Text>
            {/* <Text style={styles.headerSubTitle}>Your recent loan activities</Text> */}
            <View style={styles.headerAvatar}>
              <Text style={styles.avatarText}>
                {mkc.firstName[0]}
                {mkc.lastName[0]}
              </Text>
            </View>
          </View>
        </View>
        {/* </LinearGradient> */}

        {/* ▬▬▬ MAIN CONTENT ▬▬▬ */}
        <View style={styles.mainWrapper}>
          {loading ? (
            <Loader />
          ) : (
            <FlatList
              data={listData}
              keyExtractor={item => item.applicationNo}
              renderItem={({ item }) => (
                <ApplicationCardDetail
                  item={item}
                  isExpanded={expandedAppNo === item.applicationNo}
                  onToggleExpand={handleToggleExpand}
                  handleCardPress={handleCardPress}
                />
              )}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={7}
              removeClippedSubviews
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Image
                    source={require("../../asset/empty.png")}
                    style={styles.emptyImage}
                  />
                  <Text style={styles.emptyTitle}>No Applications Found</Text>
                  <Text style={styles.emptyDesc}>
                    New applications will appear here
                  </Text>
                </View>
              }
            />


          )}
        </View>

        {/* ▬▬▬ MODAL (GLASS STYLE) ▬▬▬ */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalGlassCard}>
              {isLoadingLogs ? (
                <ActivityIndicator size="large" color="#005BEA" />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>

                  <ApplicationDetails
                    title="Application Detail"
                    isEditable={false}
                    fields={[
                      { label: "Application No", value: selectedItem?.applicationNo },
                      {
                        label: "Name",
                        value:
                          applicant?.individualApplicant
                            ? [
                              applicant.individualApplicant.firstName,
                              applicant.individualApplicant.middleName,
                              applicant.individualApplicant.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ")
                            : applicant?.organizationApplicant?.organizationName || "N/A",
                      },

                      { label: "Loan Amount", value: `₹ ${formatNumberWithCommas(selectedItem?.loanAmount)}` },
                      { label: "Source Branch", value: selectedItem?.branchName },
                      { label: "Category", value: formattedApplicantCategory },
                      { label: "Source Type", value: selectedItem?.sourceType },
                      {
                        label: "Created On",
                        value: selectedItem?.createdTime
                          ? new Date(selectedItem.createdTime)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "-")
                          : "",
                      },
                      { label: "Stage", value: selectedItem?.stage },
                      { label: "Status", value: selectedItem?.status },
                    ]}
                  />


                  {logDetails?.length > 0 ? (
                    <View style={styles.tableWrapper}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                          <TableHeader headers={headers} />
                          {logDetails.map((log, index) => (
                            <TableRow key={index} data={log} index={index} />
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  ) : (
                    <Text style={styles.noLogs}>No logs available</Text>
                  )}

                  {/* {logDetails?.length > 0 ? (
                    <View style={styles.tableWrapper}>
                      <TableHeader />
                      {logDetails.map((log, index) => (
                        <TableRow key={index} data={log} index={index} />
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noLogs}>No logs available</Text>
                  )} */}


                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Provider >
  );

};

const styles = StyleSheet.create({



  ////////New Syule ////


  safeContainer: {
    flex: 1,
    // backgroundColor: "#2196F3",
  },

  /* ▬▬▬ HEADER ▬▬▬ */
  headerWrapper: {
    backgroundColor: "#1E40AF",
    paddingTop: StatusBar.currentHeight + 12,
    paddingBottom: 26,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerIcon: { width: 26, height: 26, tintColor: "#fff" },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubTitle: {
    color: "#E0E7FF",
    fontSize: 13,
    marginTop: 2,
  },
  headerAvatar: {
    height: 38,
    width: 38,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  /* ▬▬▬ MAIN CONTENT ▬▬▬ */
  mainWrapper: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    // marginTop: -20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 25,
  },
  emptyText: {
    textAlign: "center",
    paddingTop: 40,
    color: "#777",
    fontSize: 16,
  },

  /* ▬▬▬ MODAL GLASS CARD ▬▬▬ */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: 'flex-end',
    // padding: 10,
  },
  modalGlassCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 10,
    maxHeight: "98%",
  },
  modalCloseBtn: {
    // margin: 20,
    paddingVertical: 12,
    backgroundColor: "#005BEA",
    borderRadius: 25,
    marginTop: 5,
    marginBottom: 10
  },
  modalCloseText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  },
  noLogs: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyImage: {
    width: 120,
    height: 120,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 14,
  },
  emptyDesc: {
    color: "#6B7280",
    marginTop: 6,
  }

});

export default PreHistory;
