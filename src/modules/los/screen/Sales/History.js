import React, { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Divider, Provider } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { DrawerContext } from '../../../../Drawer/DrawerContext.js';

import Loader from '../Component/Loader.js';

import TableHeader from '../Component/TableHeader.js';
import TableRow from '../Component/TableRow.js';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
// import RenderInput from '../Component/DetailsSection';
import DetailsSection from '../Component/DetailsSection.js';
import ApplicationDetails from '../Component/ApplicantDetailsComponent.js';
import ApplicationCardDetail from '../Component/ApplicationCardDetail.js';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
const { width, height } = Dimensions.get('window');

const renderRows = (fields, columns = 2, spacing = 10) => {
  if (!fields || fields.length === 0) return null;

  const rows = [];
  for (let i = 0; i < fields.length; i += columns) {
    rows.push(
      <View key={i} style={styles.row}>
        {fields.slice(i, i + columns).map((field, idx) => (
          <View key={idx} style={{ flex: 1, paddingHorizontal: spacing / 2, marginVertical: 0 }}>
            {field}
          </View>
        ))}
        {/* Fill empty columns if needed */}
        {fields.slice(i, i + columns).length < columns &&
          Array(columns - fields.slice(i, i + columns).length)
            .fill(null)
            .map((_, idx) => <View key={`empty-${idx}`} style={{ flex: 1, paddingHorizontal: spacing / 2 }} />)}
      </View>
    );
  }
  return rows;
};




const PreHistory = ({ route }) => {
  // const { item } = route.params;
  // const route = useRoute();
  const { selectedLeadfromtab } = route.params || {};

  // const selectedLeadfromtab = route?.params?.selectedLeadfromtab;
  const { openDrawer } = useContext(DrawerContext);
  const headers = ['Activity', 'Stage', 'Type', 'Status', 'User', 'Start Date', 'End Date',];
  const mkc = useSelector(state => state.auth.losuserDetails);
  const bkc = mkc.role[0];
  const { pipeline } = route.params || {};
  console.log(pipeline, 'pipelinepipeline')
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
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const handleCardPress = useCallback(item => {
    setSelectedItem(item); // Set the selected item
    setModalVisible(true); // Open the modal
    setIsLoadingLogs(true);

    getLogsDetailsByApplicationNumber(item.applicationNo)
      .finally(() => setIsLoadingLogs(false));
  },
    [getLogsDetailsByApplicationNumber],
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








  useEffect(() => {
    if (applicationData?.length > 0 && finalApplication?.length > 0) {
      const filteredData = applicationData?.filter(item =>
        finalApplication.some(finalItem => finalItem?.applicationNo === item?.applicationNo)
      );
      setFilteredApplicationData(filteredData);
    }
  }, [finalApplication, applicationData]);

  // const listData = useMemo(() => {
  //   if (['CEO', 'Sales Head'].includes(userDetails?.designation)) {
  //     return applicationData || [];
  //   }
  //   return selectedLeadfromtab?.length
  //     ? selectedLeadfromtab
  //     : FilteredApplicationData?.length
  //       ? FilteredApplicationData
  //       : [];
  // }, [userDetails?.designation, applicationData, selectedLeadfromtab, FilteredApplicationData]);

  const listData = useMemo(() => {

    // If user is CEO or Sales Head → show all applications
    if (['CEO', 'Sales Head'].includes(userDetails?.designation)) {
      return applicationData ?? [];
    }

    // If specific lead group was selected from Tab Details
    if (selectedLeadfromtab?.length > 0) {
      return selectedLeadfromtab;
    }

    // If dashboard pipeline was opened
    if (pipeline?.length > 0) {
      return pipeline;
    }

    // If filtered data exists
    if (FilteredApplicationData?.length > 0) {
      return FilteredApplicationData;
    }

    return [];

  }, [
    userDetails?.designation,
    applicationData,
    selectedLeadfromtab,
    pipeline,
    FilteredApplicationData,
  ]);


  const memoizedLogRows = useMemo(() => {
    return logDetails.map((item, index) => <TableRow key={index} data={item} index={index} />);
  }, [logDetails]);



  const [expandedAppNo, setExpandedAppNo] = useState(null);

  const handleToggleExpand = (applicationNo) => {
    setExpandedAppNo(prev => (prev === applicationNo ? null : applicationNo));
  };
  const gradientColors = ["#508FF5FF", "#F1F1F1FF",]
  return (
    <Provider>

      <SafeAreaView style={styles.safeContainer}>
        <StatusBar
          translucent
          backgroundColor="#2196F3"
          barStyle="light-content"
        />


        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={openDrawer}>
              <Image
                source={require('../../asset/menus.png')}
                style={styles.drawerIcon}
              />
            </TouchableOpacity>
            {/* <Text style={styles.headerTitle}>Dashboard</Text> */}
          </View>
          {loading ? (
            <Loader />
          ) : (
            <FlatList
              data={listData}
              // renderItem={renderCardCallback}
              renderItem={({ item }) => (
                <ApplicationCardDetail
                  item={item}
                  // idleApplicationList={idleApplicationList}
                  userDetails={userDetails}
                  isExpanded={expandedAppNo === item.applicationNo}
                  handleCardPress={handleCardPress} // ✅ Pass from page
                  // currentPage="Sales History"
                  onToggleExpand={handleToggleExpand}
                />
              )}
              keyExtractor={item => item.id?.toString() || item?.leadId || item.applicationNo}
              contentContainerStyle={styles.scrollContainer}
              ListEmptyComponent={<Text style={styles.emptyText}>No applications found</Text>}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={false}
              updateCellsBatchingPeriod={50}
              getItemLayout={(data, index) => ({ length: 120, offset: 120 * index, index })}
              showsVerticalScrollIndicator={false}
              extraData={expandedCardIndex}
            />


          )}

          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainerdetail}>
              {isLoadingLogs ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
              ) : logDetails && logDetails.length > 0 ? (
                <ScrollView>
                  <View style={styles.modalContentdetail}>
                    {/* <Text style={styles.modalTitledetail}>Application Details</Text> */}
                    {selectedItem && (
                      <>
                        <ApplicationDetails
                          title="Application Detail"
                          isEditable={false} // 🔒 read-only or true for editable
                          fields={[
                            { label: 'Application Number', value: selectedItem?.applicationNo },
                            {
                              label: 'Name',
                              value: applicant?.individualApplicant
                                ? `${applicant?.individualApplicant?.firstName || ''} ${applicant?.individualApplicant?.middleName || ''} ${applicant?.individualApplicant?.lastName || ''}`.trim()
                                : applicant?.organizationApplicant?.organizationName || 'N/A',
                            },
                            {
                              label: 'Loan Amount',
                              value: selectedItem?.loanAmount
                                ? `₹ ${formatNumberWithCommas(selectedItem.loanAmount.toString())}`
                                : '₹ 0',
                            },
                            { label: 'Source Branch', value: selectedItem?.branchName },
                            { label: 'Category', value: formattedApplicantCategory },
                            { label: 'Source Type', value: selectedItem?.sourceType },
                            {
                              label: 'Date Created', value: selectedItem?.createdTime
                                ? new Date(selectedItem.createdTime)
                                  .toLocaleDateString('en-GB') // gives DD/MM/YYYY
                                  .replace(/\//g, '-')          // converts to DD-MM-YYYY
                                : '',
                            },
                            { label: 'Status', value: selectedItem?.status },
                            { label: 'Stage', value: selectedItem?.stage },
                          ]}
                        />
                        {logDetails?.length > 0 ? (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {/* <LinearGradient
                              colors={gradientColors}
                              start={{ x: 0.4, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.card}
                            > */}
                            <View style={{ borderWidth: 1, marginVertical: 8, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' }}>
                              <TableHeader headers={headers} />
                              {memoizedLogRows}
                              {/* </LinearGradient> */}
                            </View>
                          </ScrollView>
                        ) : (
                          <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 20 }}>No log details available</Text>
                        )}


                      </>
                    )}

                  </View>
                </ScrollView>
              ) : (
                <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 20 }}>
                  No log details available
                </Text>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },

  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  formColumncam: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#333',
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
    textAlignVertical: 'center',
    flexWrap: 'wrap',     // ✅ ensures wrapping
  },
  disabledInput: {
    backgroundColor: "#DDDBDBFF", // gray background when disabled
    color: "black",
    fontWeight: '500'
  },

  modalContainerdetail: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    // backgroundColor: 'red'
  },

  // 🔹 Inner content box of the modal
  modalContentdetail: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },

  // 🔹 Title text inside modal
  modalTitledetail: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B', // dark slate tone
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },

  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },

  closeButton: {
    marginTop: 5,
    alignSelf: 'center',
    backgroundColor: '#F00028FF',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 4,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
  },




  safeContainer: {
    flex: 1,
    backgroundColor: '#2196F3', // backgroundColor same as header for seamless look
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
  drawerIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginHorizontal: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0.6,
    borderColor: '#E2E8F0',
    // padding: 16,
    // borderRadius: 14,
  },
  expandedCard: {
    // borderColor: '#0EA5E9',
    borderWidth: 1.4,
    // shadowColor: '#38BDF8',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  collapsedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 4,
  },

  expandedContent: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#999999FF',
  },
  textRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  cardValue: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1.3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 5,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default PreHistory;
