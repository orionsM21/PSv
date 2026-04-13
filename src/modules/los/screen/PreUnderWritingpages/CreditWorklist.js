import React, { useState, useCallback, useContext, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Image, Dimensions, RefreshControl,
  Platform, ToastAndroid, TouchableOpacity, Alert, FlatList, Switch, Modal, ActivityIndicator,
  SafeAreaView, StatusBar
} from 'react-native';
import { Button, Divider, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';


import { useSelector } from 'react-redux';



import { useFocusEffect } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs'
import CustomToast from '../Component/Toast.js';
import RNFetchBlob from 'rn-fetch-blob';
import CustomInput from '../Component/CustomInput.js';
// import { useSelector } from 'react-redux';
import Card from '../Component/Card.js'
// import { DrawerContext } from '../../../../Drawer/DrawerContext.js';
import LinearGradient from 'react-native-linear-gradient';
import { BASE_URL } from '../../api/Endpoints.js';
import { DrawerContext } from '../../../../Drawer/DrawerContext.js';
// import { moderateScale } from 'react-native-size-matters';
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;  // iPhone 11 width
const guidelineBaseHeight = 812; // iPhone 11 height

// ✅ Define safe scaling functions
export const scale = (size) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const CreditWorkList = ({ uid }) => {

  // 
  const [loading, setLoading] = useState()
  const [error, setError] = useState('')
  const mkc = useSelector((state) => state.auth.losuserDetails);
  const [data, setData] = useState([]);
  const [StoreAlldeviation, setStoreAlldeviation] = useState([]);
  const [isCoApplicant, setIsCoApplicant] = useState(false);
  const [Pincode, setPincode] = useState([]);
  const [coPincode, setcoPincode] = useState([]);
  const [CoApllicant, setCoApplicant] = useState(false);
  const [selectedCoApplicant, setSelectedCoApplicant] = useState([]);
  const [SelectedLeadApplicant, setSelectedLeadApplicant] = useState([])
  console.log(SelectedLeadApplicant, selectedCoApplicant, 'selectedCoApplicantselectedCoApplicant')
  const token = useSelector((state) => state.auth.token);

  const { openDrawer } = useContext(DrawerContext);
  const [selectedCoApplicantlead, setSelectedCoApplicantlead] = useState({});
  const [SelectedLeadApplicantlead, setSelectedLeadApplicantlead] = useState({})

  const [drawerVisible, setDrawerVisible] = useState(false);
  const { navigate, addListener } = useNavigation();
  const [CibilScore, setCibilScore] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isDropdownVisibleCo, setIsDropdownVisibleCo] = useState(false);
  // const [activeTabView, setActiveTabView] = useState('Applicant');
  // Toggle drawer visibility
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  // Close the drawer when navigating away from the current screen
  useEffect(() => {
    const unsubscribe = addListener('blur', () => {
      setDrawerVisible(false); // Close the drawer on screen blur
    });

    // Clean up the listener on component unmount
    return unsubscribe;
  }, [addListener]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [leadsWithLoanAmount, setLeadsWithLoanAmount] = useState([]);
  const [GroupedLeadsById, setGroupedLeadsById] = useState([]);
  const [AllLoads, setAllLoeds] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const [SaveClicked, setSaveClicked] = useState(false);
  const [activeTabView, setActiveTabView] = useState('Applicant');
  const [isApplicantTabDisabled, setIsApplicantTabDisabled] = useState(false);
  const [leadByLeadiD, setleadByLeadiD] = useState([]);
  const [backleadByLeadiD, setbackleadByLeadiD] = useState([])
  const [backupselectedCard, setbackupselectedCard] = useState(null);

  const [lead, setlead] = useState([])
  const [rejectReason, setrejectReason] = useState([])
  const [rejectReasonCo, setrejectReasonCo] = useState([])
  const [Deviation, setDeviation] = useState([]);
  const [coDeviation, setcoDeviation] = useState([]);
  const [inputHeight, setInputHeight] = useState(verticalScale(45));
  const codeviaa = coDeviation[0]
  const deviaaa = Deviation[0]

  const [showAllLeads, setShowAllLeads] = useState(false);
  const [leadID, setleadID] = useState([])
  const [refreshing, setrefreshing] = useState(false);
  const [SelectedrejectReason, setSelectedrejectReason] = useState(null);
  const [SelectedrejectReasonCo, setSelectedrejectReasonCo] = useState(null);
  const [RejectReasonApplicant, setRejectReasonApplicant] = useState('')
  const [RejectReasonCoApplicant, setRejectReasonCoApplicant] = useState('')
  const [remark, setremark] = useState('');
  const [remarkCo, setremarkCo] = useState('');


  const [expandedItem, setExpandedItem] = useState(null);
  const [expandedItemCo, setExpandedItemCo] = useState(null);
  const toggleSection = (sectionId) => {
    setExpandedItem(expandedItem === sectionId ? null : sectionId);
  };
  const toggleSectionCo = (sectionId) => {
    setExpandedItemCo(expandedItemCo === sectionId ? null : sectionId);
  };
  const [approvalStatus, setApprovalStatus] = useState(null); // New state to track button press
  const [approvalStatusCo, setApprovalStatusCo] = useState(null); // New state to track button press
  console.log(approvalStatus, approvalStatusCo, 'approvalStatusapprovalStatus')

  const [approveClicked, setApproveClicked] = useState(false);
  const [rejectClicked, setRejectClicked] = useState(false);

  const [approveClickedCo, setApproveClickedCo] = useState(false);
  const [rejectClickedCo, setRejectClickedCo] = useState(false);

  const [downloadCibilReportCoApplicant, setDownloadCibilReportCoApplicant] = useState(null);
  const [downloadCibilReportApplicant, setDownloadCibilReportApplicant] = useState(null);








  useEffect(() => {
    if (selectedCoApplicant?.id) {
      // fetchDeviationData(selectedCoApplicant.id, setdeviationCoApplicant);
      fetchCibilReport(selectedCoApplicant.id, setDownloadCibilReportCoApplicant);
    }

    if (SelectedLeadApplicant?.id) {
      // fetchDeviationData(SelectedLeadApplicant.id, setdeviationApplicant);
      fetchCibilReport(SelectedLeadApplicant.id, setDownloadCibilReportApplicant);
    }
  }, [selectedCoApplicant?.id, SelectedLeadApplicant?.id, fetchCibilReport]);

  const fetchCibilReport = useCallback(async (leadId, setDownloadCibilReport) => {
    try {
      const { data } = await axios.get(`${BASE_URL}downloadLeadCibilReport/${leadId}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      setDownloadCibilReport(data.data);
    } catch (error) {
      console.error('Error downloading CIBIL report:', error?.response?.data || error.message);
      Alert.alert('Error', 'Something went wrong while downloading the CIBIL report.');
    }
  }, []);

  const [findApplicantByCategoryCodView, setFindApplicantByCategoryCodView] = useState({
    data: {
      cityName: '',
      stateName: '',
      countryName: '',
      areaName: ''
    }
  });

  const [cofindApplicantByCategoryCodView, setcoFindApplicantByCategoryCodView] = useState({
    data: {
      cityName: '',
      stateName: '',
      countryName: '',
      areaName: ''
    }
  });

  const fetchApplicantDataByPincode = useCallback(async (pincodeId, setState) => {
    if (!pincodeId) {
      console.warn("Pincode ID is not available.");
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincodeId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      setState({ data: response.data.data });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch application data for pincode');
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  // Consolidating the `useEffect` logic to handle both applicants in a single place
  useEffect(() => {
    // Check for pincodeId for both applicants and fetch the data
    if (selectedCoApplicant?.pincodeId) {
      fetchApplicantDataByPincode(selectedCoApplicant.pincodeId, setcoFindApplicantByCategoryCodView);
    }
    if (SelectedLeadApplicant?.pincodeId) {
      fetchApplicantDataByPincode(SelectedLeadApplicant.pincodeId, setFindApplicantByCategoryCodView);
    }
    if (selectedCoApplicant?.id) {
      getDeviationByLeadIdCoApplicant();

      if (SelectedLeadApplicant?.leadStage === "Approved") {
        setApprovalStatus("approved")
      }

      if (selectedCoApplicant?.leadStage === "Approved") {
        setApprovalStatusCo("approved")
      }

      if (SelectedLeadApplicant?.leadStage === "Rejected") {
        setApprovalStatus("rejected")
      }

      if (selectedCoApplicant?.leadStage === "Rejected") {
        setApprovalStatusCo("rejected")
      }




    }
  }, [SelectedLeadApplicant?.pincodeId, selectedCoApplicant?.pincodeId, selectedCoApplicant?.id, getDeviationByLeadIdCoApplicant, fetchApplicantDataByPincode]);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const onRefresh = useCallback(async () => {
    setrefreshing(true);
    try {
      await getAllLeads(); // Wait for the worklist to be fetched
      await getAllLeadsStore();
    } catch (error) {
      console.error("Failed to refresh worklist:", error);
    } finally {
      setrefreshing(false); // Ensure refreshing is turned off
    }
  }, []);

  const getAllLeads = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getWorklist/${mkc.userId}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      const fetchedData = response?.data?.data || [];

      if (!Array.isArray(fetchedData)) {
        console.warn('⚠️ Unexpected API response format:', response?.data);
        setData([]);
        return;
      }

      const deviationdata = fetchedData.filter(
        t =>
          t?.leadStatus?.leadStatusName === 'Under Credit Review' &&
          t?.assignTo?.userId === mkc?.userId
      );

      setData(deviationdata);

      const filteredLeads = deviationdata.reduce((acc, current) => {
        const existingIndex = acc.findIndex(item => item.leadId === current.leadId);

        if (existingIndex === -1) {
          // No object with this leadId yet → add it
          acc.push(current);
        } else {
          // Object with same leadId exists
          if (current.applicantTypeCode === "Applicant") {
            // Replace with Applicant if it's Co-Applicant currently
            acc[existingIndex] = current;
          }
          // else do nothing (keep existing Applicant or Co-Applicant if no Applicant)
        }

        return acc;
      }, []);
      setStoreAlldeviation(filteredLeads)



    } catch (error) {
      console.error('❌ Error fetching lead status:', error);
    }
  };


  const getDeviationByLeadIdCoApplicant = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getDeviationByLeadId/${selectedCoApplicant.id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const fetchedData = response.data.data;
      setcoDeviation(fetchedData);
    } catch (error) {
      console.error('Error fetching lead status:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getAllLeads();
      getAllLeadsStore();
    }, [])
  );

  const getAllLeadsStore = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getLeads`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      const allLeads = response?.data?.data
      const applicantLeads = allLeads.filter(
        lead =>
          lead.loanAmount !== null &&
          lead.loanAmount !== undefined &&
          !isNaN(Number(lead.loanAmount)) &&
          lead.loanAmount > 0 &&
          lead?.secondaryAssigned === mkc.userId
        // lead?.applicantTypeCode === "Co-Applicant"
      );

      const filteredLeadsAll = applicantLeads.reduce((acc, current) => {
        const existingIndex = acc.findIndex(item => item.leadId === current.leadId);

        if (existingIndex === -1) {
          // No object with this leadId yet → add it
          acc.push(current);
        } else {
          // Object with same leadId exists
          if (current.applicantTypeCode === "Applicant") {
            // Replace with Applicant if it's Co-Applicant currently
            acc[existingIndex] = current;
          }
          // else do nothing (keep existing Applicant or Co-Applicant if no Applicant)
        }

        return acc;
      }, []);

      setAllLoeds(filteredLeadsAll);



    } catch (error) {
      console.error('Error fetching leads:', error);
      Alert.alert('Error', 'Failed to fetch leads');
    }
  };

  // const filterData = data.filter((item) => {
  //   if (item?.applicantTypeCode === "Co-Applicant" && item?.leadStatus?.leadStatusName === "Under Credit Review") {
  //     // Show Co-Applicant only when switch is on and condition is met
  //     return isCoApplicant;
  //   }

  //   if (item?.applicantTypeCode === "Applicant" && item?.leadStatus?.leadStatusName === "Under Credit Review") {
  //     // Show Applicant only when switch is off and condition is met
  //     return !isCoApplicant;
  //   }


  //   return true;
  // });

  // // Function to handle case when only one item (Applicant or Co-Applicant) is present
  // const handleSingleData = (item) => {
  //   // Case where both Applicant and Co-Applicant exist for the same leadId
  //   const leadIds = new Set(data.map(i => i.leadId)); // Get unique leadIds from the data
  //   const leadId = item.leadId;

  //   // Check if both Applicant and Co-Applicant exist for the same leadId
  //   const applicantsForLead = data.filter(i => i.leadId === leadId);

  //   if (applicantsForLead.length === 2) {
  //     // If both Applicant and Co-Applicant exist for the same leadId and both have 
  //     const applicant = applicantsForLead.find(i => i.applicantTypeCode === "Applicant");
  //     const coApplicant = applicantsForLead.find(i => i.applicantTypeCode === "Co-Applicant");

  //     if (applicant?.leadStatus?.leadStatusName === "Under Credit Review") {
  //       // Only show Applicant card if both have 
  //       return item.applicantTypeCode === "Applicant";
  //     }

  //     if (coApplicant?.leadStatus?.leadStatusName === "Under Credit Review") {
  //       // Only show Applicant card if both have 
  //       return item.applicantTypeCode === "Co-Applicant";
  //     }
  //   }

  //   // Handle case for single Applicant or Co-Applicant
  //   if (data.length === 1) {
  //     if (item?.applicantTypeCode === "Co-Applicant" && item?.leadStatus?.leadStatusName === "Under Credit Review") {
  //       return isCoApplicant; // Show Co-Applicant only when switch is on
  //     }
  //     if (item?.applicantTypeCode === "Applicant" && item?.leadStatus?.leadStatusName === "Under Credit Review") {
  //       return !isCoApplicant; // Show Applicant only when switch is off
  //     }
  //     return true; // Show if no condition on 
  //   }

  //   return true; // Default case if more than one item or no specific conditions are met
  // };

  const handleSingleData = (item) => {
    const leadIds = new Set(data.map(i => i.leadId)); // Get unique leadIds from the data
    const leadId = item.leadId;

    const applicantsForLead = data.filter(i => i.leadId === leadId);

    if (applicantsForLead.length === 2) {
      const applicant = applicantsForLead.find(i => i.applicantTypeCode === "Applicant");
      const coApplicant = applicantsForLead.find(i => i.applicantTypeCode === "Co-Applicant");

      if (applicant?.leadStatus?.leadStatusName === "Under Credit Review") {
        return item.applicantTypeCode === "Applicant";
      }

      if (coApplicant?.leadStatus?.leadStatusName === "Under Credit Review") {
        return item.applicantTypeCode === "Co-Applicant";
      }
    }

    if (data.length === 1) {
      if (item?.applicantTypeCode === "Co-Applicant" && item?.leadStatus?.leadStatusName === "Under Credit Review") {
        return isCoApplicant;
      }
      if (item?.applicantTypeCode === "Applicant" && item?.leadStatus?.leadStatusName === "Under Credit Review") {
        return !isCoApplicant;
      }
      return true;
    }

    return true;
  };

  // const filterData = React.useMemo(() => {
  //   // Step 1: Base filter for data
  //   const filtered = data.filter((item) => {
  //     // if (item?.applicantTypeCode === "Co-Applicant" && item?.leadStatus?.leadStatusName === "Under Credit Review") {
  //     //   // ✅ Show Co-Applicants only when switch ON
  //     //   return isCoApplicant;
  //     // }

  //     // if (item?.applicantTypeCode === "Applicant" && item?.leadStatus?.leadStatusName === "Under Credit Review") {
  //     //   // ✅ Show Applicants only when switch OFF
  //     //   return !isCoApplicant;
  //     // }

  //     if (item?.leadStatus?.leadStatusName === "Under Credit Review") {
  //       // ✅ Show Applicants only when switch OFF
  //       return !isCoApplicant;
  //     }
  //     // ✅ Keep other items (if any)
  //     return true;
  //   });

  //   // Step 2: Only merge AllLoads when switch is ON
  //   const combined = isCoApplicant ? [...filtered, ...AllLoads] : filtered;

  //   // Step 3: Remove duplicates (based on leadId)
  //   const unique = Array.from(new Map(combined.map(item => [item.leadId, item])).values());

  //   // Step 4: Apply your single-data handling logic
  //   return unique.filter(handleSingleData);
  // }, [data, AllLoads, isCoApplicant]);


  const filterData = React.useMemo(() => {
    // Step 1: Base filter for 'Under Credit Review'
    const filtered = data.filter((item) => {
      if (item?.leadStatus?.leadStatusName === "Under Credit Review") {
        return !isCoApplicant;
      }
      return true;
    });

    // Step 2: Exclude any AllLoads already present in filtered
    const filteredLeadIds = new Set(filtered.map(i => i.leadId));
    const uniqueAllLoads = AllLoads.filter(i => !filteredLeadIds.has(i.leadId));


    // Step 3: Combine data based on toggle
    let combined = isCoApplicant ? [...filtered, ...uniqueAllLoads] : filtered;

    // Step 4: ❌ Exclude any items that exist in StoreAlldeviation (only when isCoApplicant = true)
    if (isCoApplicant && Array.isArray(StoreAlldeviation)) {
      const deviationIds = new Set(StoreAlldeviation.map(i => i.leadId));
      combined = combined.filter(item => !deviationIds.has(item.leadId));
    }

    // Step 5: Remove duplicates by leadId
    const unique = Array.from(new Map(combined.map(item => [item.leadId, item])).values());

    // Step 6: Apply your single-item filter logic
    const result = unique;

    // Step 7: Sort — appId first (green), rejected last (red)
    result.sort((a, b) => {
      const aHasAppId = !!a?.appId;
      const bHasAppId = !!b?.appId;

      const aRejected =
        a?.leadStage?.stageName?.toLowerCase() === "rejected" ||
        a?.leadStage?.toLowerCase() === "rejected";

      const bRejected =
        b?.leadStage?.stageName?.toLowerCase() === "rejected" ||
        b?.leadStage?.toLowerCase() === "rejected";

      if (aHasAppId && !bHasAppId) return -1;
      if (!aHasAppId && bHasAppId) return 1;
      if (aRejected && !bRejected) return 1;
      if (!aRejected && bRejected) return -1;

      return 0;
    });

    return result;
  }, [data, AllLoads, isCoApplicant, StoreAlldeviation]);

  const filteredData = filterData.filter((item) => {
    const query = (searchQuery ?? '').toLowerCase();

    const matchGeneral =
      (item?.firstName ?? '').toLowerCase().includes(query) ||
      (item?.organizationName ?? '').toLowerCase().includes(query) ||
      (item?.lastName ?? '').toLowerCase().includes(query) ||
      (item?.leadStatus?.leadStatusName ?? '').toLowerCase().includes(query) ||
      (item?.pan ?? '').toLowerCase().includes(query) ||
      (item?.mobileNo ?? '').toLowerCase().includes(query) ||
      (item?.gender ?? '').toLowerCase().includes(query) ||
      (item?.leadId ?? '').toLowerCase().includes(query);
    return query ? matchGeneral : true
  })

  // Function to handle case when only one item (Applicant or Co-Applicant) is present




  // Function to toggle the switch
  // const toggleSwitch = () => setIsCoApplicant((previousState) => !previousState);
  const toggleSwitch = () => {
    setIsCoApplicant((prev) => {
      const newState = !prev;

      if (newState) {
        // When turned ON → fetch Co-Applicant data
        if (AllLoads.length === 0) {
          getAllLeadsStore();
        }
      } else {
        // When turned OFF → clear Co-Applicant data completely
        setAllLoeds([]);
      }

      return newState;
    });
  };


  const toggleExpand = (leadId) => {
    setExpandedItem(prevState => prevState === leadId ? null : leadId);
  };

  const handleCardPress = (item) => {
    setSelectedLead(item);
    if (isCoApplicant) {
      setbackupselectedCard(item)
    }
    setModalVisible(true);
  };


  const LeadCard = ({ item }) => {
    const [expandedItem, setExpandedItem] = useState(null);



    // ✅ Determine states
    const isRejected =
      item?.leadStage?.stageName?.toLowerCase() === "rejected" ||
      item?.leadStage?.toLowerCase() === "rejected";

    const hasAppId = !!item?.appId; // ✅ Check if application exists

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isRejected && { backgroundColor: '#F85050' }, // 🔴 red for rejected
          hasAppId && !isRejected && { backgroundColor: '#4CAF50' }, // 🟢 green for appId (only if not rejected)
        ]}
        onPress={() => handleCardPress(item)}
      >
        {/* Collapsed View */}
        <View style={styles.collapsedHeader}>
          <View>
            <Text style={styles.cardTitle}>
              Lead ID: <Text style={styles.cardText}>{item.leadId}</Text>
            </Text>
            {item?.organizationName ? (
              <Text style={styles.cardTitle}>
                Organization Name:{" "}
                <Text style={styles.cardText}>{item.organizationName}</Text>
              </Text>
            ) : (
              <Text style={styles.cardTitle}>
                Lead Name:{" "}
                <Text style={styles.cardText}>
                  {item.firstName} {item?.middleName} {item.lastName}
                </Text>
              </Text>
            )}

            {item?.enquiryId && (
              <Text style={styles.cardTitle}>
                Enquiry Id:<Text style={styles.cardText}> {item.enquiryId}</Text>
              </Text>
            )}

            {item?.appId && (
              <Text style={styles.cardTitle}>
                Application Number:<Text style={styles.cardText}> {item.appId}</Text>
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={() => toggleExpand(item.leadId)}>
            <Text style={styles.expandIcon}>
              {expandedItem === item.leadId ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        </View>

        {expandedItem === item.leadId && (
          <View style={styles.expandedContent}>
            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Gender:</Text>
              <Text style={styles.cardValue}>{item.gender || 'N/A'}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>MobileNumber:</Text>
              <Text style={styles.cardValue}>{item.mobileNo || 'N/A'}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Email:</Text>
              <Text style={styles.cardValue}>{item.email || 'N/A'}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Lead Stage:</Text>
              <Text style={styles.cardValue}>{item.leadStage || 'N/A'}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>PAN:</Text>
              <Text style={styles.cardValue}>{item.pan || 'N/A'}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Assigned To:</Text>
              <Text style={styles.cardValue}>
                {item.assignTo?.firstName || ''} {item.assignTo?.lastName || 'N/A'}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };





  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setToastVisible] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);

    // Hide the toast after 2 seconds
    setTimeout(() => {
      setToastVisible(false);
    }, 4000); // Adjust this duration as needed
  };


  const renderInputt = (
    label,
    value = '',
    onChangeText = () => { },
    editable = true,
    placeholder = '',
    isMobile = false,
    isPan = false,
    isAadhaar = false,
    isEmail = false,
    fieldName,
    errorMessage = '',
    multiline = false
  ) => {
    const [inputHeight, setInputHeight] = useState(verticalScale(45));
    const [isFocused, setIsFocused] = useState(false);

    const handlePanChange = (text) => {
      if (isPan) {
        if (!validatePAN(text)) setErrorMessage('Invalid PAN format');
        else setErrorMessage('');
      }
      onChangeText(text);
    };

    const isEmpty = !value?.trim();

    return (
      <View style={{ marginLeft: 10, marginBottom: 8 }}>
        <Text style={styles.labelformodal}>{label}</Text>
        <TextInput
          style={[
            styles.inputformodaltt,
            multiline && {
              height: inputHeight,
              textAlignVertical:
                multiline && isEmpty && !isFocused ? 'center' : 'top', // ✅ Center placeholder only when empty
            },
            !editable && {
              backgroundColor: '#B4B4B4FF',
              color: 'black',
              fontWeight: '600',
            },
          ]}
          value={typeof value === 'string' ? value : ''}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor="#777"
          onChangeText={handlePanChange}
          keyboardType={
            isMobile || isAadhaar ? 'numeric' : isEmail ? 'email-address' : 'default'
          }
          maxLength={isMobile ? 10 : isAadhaar ? 12 : undefined}
          multiline={multiline}
          scrollEnabled={true}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onContentSizeChange={(e) => {
            const newHeight = Math.min(
              verticalScale(120),
              Math.max(verticalScale(45), e.nativeEvent.contentSize.height)
            );
            setInputHeight(newHeight);
          }}
        />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    );
  };




  useEffect(() => {
    if (!selectedLead) return;

    const fetchData = async () => {


      setLoading(true);
      setError(null);

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const endpoints = [
          `${BASE_URL}getLeadByLeadId/${selectedLead.leadId}`,
          `${BASE_URL}lead/${selectedLead.id}`,
          `${BASE_URL}getDeviationByLeadId/${selectedLead.id}`,
          `${BASE_URL}getAllRejectReason`,
        ];

        const requests = endpoints.map((url) => axios.get(url, { headers }));

        const [leadByIdRes, leadRes, deviationRes, rejectRes] = await Promise.all(requests);
        // 
        setleadByLeadiD(leadByIdRes.data.data);
        setlead(leadRes.data.data);
        setDeviation(deviationRes.data.data);

        const fetchedRejectReasons = rejectRes.data.data.content.map((reason) => ({
          label: reason.rejectReasonName,
          value: reason.rejectReasonId,
        }));

        setrejectReason(fetchedRejectReasons);
        setrejectReasonCo(fetchedRejectReasons);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLead,]);

  useEffect(() => {
    if (!backupselectedCard) return;

    const fetchData = async () => {


      setLoading(true);
      setError(null);

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const endpoints = [
          `${BASE_URL}getLeadByLeadId/${backupselectedCard.leadId}`,
          `${BASE_URL}lead/${backupselectedCard.id}`,
          `${BASE_URL}getDeviationByLeadId/${backupselectedCard.id}`,
          `${BASE_URL}getAllRejectReason`,
        ];

        const requests = endpoints.map((url) => axios.get(url, { headers }));

        const [leadByIdRes, leadRes, deviationRes, rejectRes] = await Promise.all(requests);


        setbackleadByLeadiD(leadByIdRes.data.data);
        setlead(leadRes.data.data);
        setDeviation(deviationRes.data.data);

        const fetchedRejectReasons = rejectRes.data.data.content.map((reason) => ({
          label: reason.rejectReasonName,
          value: reason.rejectReasonId,
        }));

        setrejectReason(fetchedRejectReasons);
        setrejectReasonCo(fetchedRejectReasons);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backupselectedCard,]);

  const handleClose = () => {
    setActiveTabView('Applicant');
    setModalVisible(false); // Hide the modal

    setIsDropdownVisible(false); // Hide the dropdown
    setIsDropdownVisibleCo(false); // Hide the dropdown

    setSelectedrejectReason('');
    setSelectedrejectReasonCo('');

    setApprovalStatus(null);
    setApprovalStatusCo(null);

    setremark('');
    setremarkCo('');

    setApproveClicked(false);
    setRejectClicked(false);

    setSaveClicked(false);

    setSelectedLeadApplicant([]);
    setSelectedCoApplicant([]);
    getAllLeads();

    setFile('');
    setFileco('');
    setFileName('');
    setFileNameco('');
    setCoApplicant(false);
    setIsCoApplicant(false);
    setleadByLeadiD([]);
    setbackleadByLeadiD([]);
    setSelectedLead('');
    setbackupselectedCard('');
  };


  const updateDeviations = async () => {
    const formattedDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const payload = [
      {
        id: deviaaa.id,
        description: deviaaa.description || '',
        leadId: SelectedLeadApplicant?.id,
        approvedBy: approveClicked ? mkc.userId : '',
        rejectedBy: rejectClicked ? mkc.userId : 0,
        isApproved: approveClicked,
        deviationLog: deviaaa.deviationLog || '',
        rejectReason: RejectReasonApplicant || '',
        clickRejectBtn: rejectClicked,
        clickApprovedBtn: approveClicked,
        clickRejectReasonFeild: false,
        deviationBy: mkc.userName,
      },
    ];

    try {
      // Make the API call
      const { data } = await axios.put(
        `${BASE_URL}updateDeviations`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Template literal for cleaner token handling
          },
        }
      );



      // Handle success response
      if (data?.msgKey === 'Success') {
        Alert.alert('Success', data?.message || 'Operation successful');
        setActiveTabView('Co-Applicant'); // Switch  to Co-Applicant
        setCoApplicant(true);
      } else {
        // Handle error response
        Alert.alert('Error', data?.data?.message || 'An error occurred');
      }
    } catch (error) {
      // Log error details and alert the user
      console.error('Error updating deviations:', error);
      Alert.alert('Error', 'An error occurred while updating deviations');
    }
  };






  const updateDeviationsOnlyApplicant = async () => {
    const formattedDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const payload = [{
      id: deviaaa.id,
      description: deviaaa.description || '',
      leadId: SelectedLeadApplicant?.id,
      approvedBy: approveClicked ? mkc.userId : '',
      rejectedBy: rejectClicked ? mkc.userId : 0,
      isApproved: approveClicked,
      deviationLog: deviaaa.deviationLog || '',
      rejectReason: RejectReasonApplicant || '',
      clickRejectBtn: rejectClicked,
      clickApprovedBtn: approveClicked,
      clickRejectReasonFeild: false,
      deviationBy: mkc.userName,
    }];

    try {
      const { data } = await axios.put(`${BASE_URL}updateDeviations`, payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      // setActiveTabView('Co-Applicant'); // Switch  to Co-Applicant
      // Handle success response
      if (data?.msgKey === 'Success') {
        // Alert.alert('Success', data?.message || 'Operation successful');
      } else {
        // Handle error response
        Alert.alert('Error', data?.data?.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error updating deviations:', error?.response?.data || error.message);
    }
  };


  const updateDeviationsCo = async () => {
    // Format the current date as YYYY-MM-DD
    const formattedDate = new Date().toISOString().split('T')[0];

    // Construct the payload
    const payload = [
      {
        id: codeviaa?.id || '',
        description: deviaaa?.description || '',
        leadId: selectedCoApplicant?.id || '',
        approvedBy: approveClickedCo ? mkc?.userId || '' : '',
        rejectedBy: rejectClickedCo ? mkc?.userId || '' : 0,
        isApproved: approveClickedCo,
        deviationLog: deviaaa?.deviationLog || '',
        rejectReason: RejectReasonCoApplicant || '',
        clickRejectBtn: rejectClickedCo,
        clickApprovedBtn: approveClickedCo,
        clickRejectReasonFeild: false,
        deviationBy: mkc.userName,
      },
    ];

    try {
      // Send API request
      const { data } = await axios.put(`${BASE_URL}updateDeviations`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token, // Use template literals for token
        },
      });



      // Handle success response
      if (data?.msgKey === 'Success') {
        // Alert.alert('Success', data?.message || 'Operation successful');
        setSaveClicked(true); // Update state after success
      } else {
        Alert.alert('Error', data?.message || 'Failed to update deviations.');
      }
    } catch (error) {
      // Log error details for debugging
      console.error('Error updating deviations:', error?.response?.data || error.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'An error occurred while updating deviations.'
      );
    }
  };


  const updateDeviationsOnlyCoApplicant = async () => {
    // Construct the payload
    const payload = [
      {
        id: codeviaa?.id,
        description: deviaaa?.description || '',
        leadId: selectedCoApplicant?.id,
        approvedBy: approveClickedCo ? mkc?.userId : '',
        rejectedBy: rejectClickedCo ? mkc?.userId : 0,
        isApproved: approveClickedCo,
        deviationLog: deviaaa?.deviationLog || '',
        rejectReason: RejectReasonCoApplicant || '',
        clickRejectBtn: rejectClickedCo,
        clickApprovedBtn: approveClickedCo,
        clickRejectReasonFeild: false,
        deviationBy: mkc.userName,
      },
    ];

    try {
      // Make the API request
      const { data } = await axios.put(
        `${BASE_URL}updateDeviations`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );



      // Handle success response
      if (data?.msgKey === "Success") {
        // Alert.alert('Success', data?.msessage || 'Deviations updated successfully!');
        // Uncomment if you need to trigger additional actions on success
        // setSaveClicked(true);
      } else {
        console.warn('API response did not indicate success:', data);
        Alert.alert('Error', data?.message || 'Failed to update deviations. Please try again.');
      }
    } catch (error) {
      // Handle errors gracefully
      console.error('Error updating deviations:', error?.response?.data || error.message);

      Alert.alert(
        'Error',
        error?.response?.data?.message || 'An error occurred while updating deviations. Please try again.'
      );
    }
  };


  const leadApproval = async () => {
    // Construct the payload
    const payload = {
      id: SelectedLeadApplicant?.id,
      leadStage: approveClicked ? 'Approved' : 'Rejected',
      approvedRemark: remark || '', // Fallback to an empty string if `remark` is undefined
    };

    try {
      // Make the API request
      const { data } = await axios.put(
        `${BASE_URL}leadApproval/${SelectedLeadApplicant?.id}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );

      // Log the response


      // Handle success response
      if (data?.msgKey === 'Success') {
        // Construct and display the success message
        Alert.alert( data?.msessage || 'lead Approval updated successfully!');
        const toastMessage = `${data?.message || 'Operation successful'} of Applicant!!`;
        showToast(toastMessage); // Display the message using the toast function
      } else {
        // Handle non-success cases
        Alert.alert('Error', data?.message || 'Failed to update lead. Please try again.');
      }
    } catch (error) {
      // Handle errors gracefully
      console.error('Error during lead approval:', error?.response?.data || error.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'An error occurred while processing the request. Please try again.'
      );
    }
  };

  const formatNumberWithCommas = (value) => {
    if (!value || isNaN(value)) return value; // Return original value if not a valid number
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
  };


  const leadApprovalOnlyApplicant = async () => {
    // Construct the payload
    const payload = {
      id: SelectedLeadApplicant?.id,
      leadStage: approveClicked ? 'Approved' : 'Rejected',
      approvedRemark: remark || '', // Ensure fallback to an empty string
    };

    try {
      // Make the API request
      const { data } = await axios.put(
        `${BASE_URL}leadApproval/${SelectedLeadApplicant?.id}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );



      // Handle success response
      if (data?.msgKey === "Success") {
        // Construct success message
        const toastMessage = `${data?.message || 'Operation successful'} of Applicant!!`;
        showToast(toastMessage); // Show success message using toast

        // Show an alert with success information
        Alert.alert(
          'Success',
          data?.message || 'Applicant added successfully!',
          [{ text: 'OK', onPress: () => handleClose() }]
        );

        // Uncomment and adjust the delay for a  switch if needed
        // setTimeout(() => {
        //   setActiveTabView('Co-Applicant');
        // }, 3000);
      } else {
        // Handle non-success cases
        console.warn('API did not return success:', data);
        Alert.alert('Error', data?.message || 'Failed to add lead. Please try again.');
      }
    } catch (error) {
      // Handle errors gracefully
      console.error('Error during lead approval:', error?.response?.data || error.message);

      Alert.alert(
        'Error',
        error?.response?.data?.message || 'An error occurred while processing the request. Please try again.'
      );
    }
  };


  const leadApprovalCo = async () => {
    // Construct the payload
    const payload = {
      id: selectedCoApplicant?.id,
      leadStage: approveClickedCo ? 'Approved' : 'Rejected',
      approvedRemark: remarkCo || '', // Fallback to an empty string if `remarkCo` is undefined
    };

    try {
      // Make the API request
      const { data } = await axios.put(
        `${BASE_URL}leadApproval/${selectedCoApplicant?.id}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );

      // Log the response


      // Handle success response
      if (data?.msgKey === 'Success') {
        const toastMessage = `${data?.message || 'Operation successful'} of Applicant!!`;
        showToast(toastMessage); // Display the message using the toast function

      } else {
        // Handle non-success cases
        console.warn('API did not return success:', data);
        Alert.alert('Error', data?.message || 'Failed to update Co-Applicant. Please try again.');
      }
    } catch (error) {
      // Handle errors gracefully
      console.error('Error during Co-Applicant approval:', error?.response?.data || error.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'An error occurred while processing the request. Please try again.'
      );
    }
  };


  const formatDate = (dateArray) => {
    if (Array.isArray(dateArray) && dateArray.length === 3) {
      const [year, month, day] = dateArray;

      // Create the date without time zone conversion
      const date = new Date(year, month, day);

      // Extract the date parts (year, month, day) and format as YYYY-MM-DD
      const formattedDate = `${date.getFullYear()}-${(date.getMonth()).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

      return formattedDate;
    }
    return 'N/A'; // Default value if dateArray is invalid
  };

  useEffect(() => {
    if (leadByLeadiD && leadByLeadiD.length > 0) {


      // Initialize variables to hold Applicant and Co-Applicant data
      let applicant = null;
      let coApplicant = null;

      // Loop through the array and separate Applicant and Co-Applicant
      leadByLeadiD.forEach((person) => {
        if (
          person.applicantTypeCode === "Applicant" &&
          // person.leadStatusName === "Under Credit Review" &&
          person.leadStatusName === "Under Credit Review"
        ) {
          applicant = person;
        } else if (
          person.applicantTypeCode === "Co-Applicant" &&
          // person.leadStatusName === "Under Credit Review" &&
          person.leadStatusName === "Under Credit Review"
        ) {
          coApplicant = person;
        }
      });




      // Set the appropriate state based on applicant type
      if (applicant) {
        setremark(applicant?.approvedRemark)
        setSelectedLeadApplicant(applicant);  // Set Applicant if available
      }

      if (coApplicant) {
        setremarkCo(coApplicant?.approvedRemark)
        setSelectedCoApplicant(coApplicant); // Set Co-Applicant if available
      }

      if (applicant && coApplicant) {
        setActiveTabView('Applicant'); // Default to Applicant if both exist
      } else if (coApplicant) {
        setActiveTabView('Co-Applicant');
        setCoApplicant(true); // Set active  to '
      } else if (applicant) {
        setActiveTabView('Applicant');
      }
    }
  }, [leadByLeadiD]);

  // useEffect(() => {
  //   if (backleadByLeadiD.length > 0) {
  //     let applicant = null;
  //     let coApplicant = null;

  //     // Process lead details once
  //     backleadByLeadiD.forEach((person) => {
  //       if (person.applicantTypeCode === 'Applicant') {
  //         applicant = person;
  //       } else if (person.applicantTypeCode === 'Co-Applicant') {
  //         coApplicant = person;
  //       }
  //     });

  //     

  //     // Update selected applicants efficiently
  //     if (applicant) {
  //       setSelectedLeadApplicant(applicant); // Set Applicant if available
  //     }

  //     if (coApplicant) {
  //       setSelectedCoApplicant(coApplicant); // Set Co-Applicant if available
  //     }

  //     // If the applicant has a loanAmount, set active  to 'Co-Applicant'
  //     if (applicant && coApplicant) {
  //       if (applicant && coApplicant) {
  //         setActiveTabView('Applicant'); // Default to Applicant if both exist
  //       } else if (coApplicant) {
  //         setActiveTabView('Co-Applicant');
  //         setCoApplicant(true); // Set active  to '
  //       } else if (applicant) {
  //         setActiveTabView('Applicant');
  //       }
  //     }
  //   }
  // }, [backleadByLeadiD,]);  // Only run when leadByLeadiD changes


  useEffect(() => {
    if (backleadByLeadiD.length > 0) {
      let applicant = null;
      let coApplicant = null;

      // 🧩 Identify Applicant and Co-Applicant
      backleadByLeadiD.forEach((person) => {
        if (person.applicantTypeCode === 'Applicant') {
          applicant = person;
        } else if (person.applicantTypeCode === 'Co-Applicant') {
          coApplicant = person;
        }
      });




      // ✅ Always set both first (if available)
      if (applicant?.secondaryAssigned) {
        setremark(applicant?.approvedRemark)
        setSelectedLeadApplicant(applicant);
      }
      if (coApplicant?.secondaryAssigned) {
        setremarkCo(coApplicant?.approvedRemark)
        setSelectedCoApplicant(coApplicant);
      }

      // ✅ Then decide which  to prioritize
      if (applicant?.secondaryAssigned && coApplicant?.secondaryAssigned) {
        // both have secondaryAssigned → prefer Applicant  by default
        setActiveTabView('Applicant');
      }
      else if (coApplicant?.secondaryAssigned) {
        setActiveTabView('Co-Applicant');
      }
      else if (applicant?.secondaryAssigned) {
        setActiveTabView('Applicant');
      }
      else {
        // Default fallback logic
        if (coApplicant && applicant) {
          setActiveTabView('Applicant'); // both exist → start with Applicant
        } else if (coApplicant) {
          setActiveTabView('Co-Applicant');
        } else if (applicant) {
          setActiveTabView('Applicant');
        }
      }
    }
  }, [backleadByLeadiD]);



  useEffect(() => {
    if (lead && lead.length > 0) {


      // Initialize variables to hold Applicant and Co-Applicant data
      let applicant = null;
      let coApplicant = null;

      // Loop through the array and separate Applicant and Co-Applicant
      lead.forEach((person) => {
        if (person.applicantTypeCode === 'Applicant') {
          applicant = person;
        } else if (person.applicantTypeCode === 'Co-Applicant') {
          coApplicant = person;
        }
      });




      // Set the appropriate state based on applicant type
      if (applicant) {
        setremark(applicant?.approvedRemark)
        setSelectedLeadApplicantlead(applicant);  // Set Applicant if available
      }

      if (coApplicant) {
        setremarkCo(coApplicant?.approvedRemark)
        setSelectedCoApplicantlead(coApplicant); // Set Co-Applicant if available
      }
    }
  }, [lead]);

  const renderDropdown = (
    label,
    data,
    selectedValue,
    onChange,
    placeholder,
  ) => (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}</Text>
      <Dropdown
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        placeholderStyle={styles.placeholderStyle}
        value={selectedValue}
        onChange={onChange}
        style={styles.dropdown1}
        renderItem={item => (
          <View style={styles.dropdownItem}>
            <Text style={styles.dropdownItemText}>{item.label}</Text>
          </View>
        )}
        selectedTextStyle={styles.selectedText}
      />
    </View>
  );



  const filterdata = data.filter((item) => item?.applicantTypeCode === "Applicant") // Filter by applicantTypeCode

  const validateFields = () => {
    const missingFields = [];

    // Determine which side we're validating
    const isApplicant = activeTabView === "Applicant";

    const remarkValue = isApplicant ? remark : remarkCo;
    const dropdownVisible = isApplicant ? isDropdownVisible : isDropdownVisibleCo;
    const selectedRejectReason = isApplicant ? SelectedrejectReason : SelectedrejectReasonCo;
    const approveState = isApplicant ? approveClicked : approveClickedCo;
    const rejectState = isApplicant ? rejectClicked : rejectClickedCo;

    // Safe trim helper
    const safeTrim = (val) =>
      typeof val === "string" ? val.trim() : "";

    // 1️⃣ Validate Comment
    if (!safeTrim(remarkValue)) {
      missingFields.push("Comment cannot be empty.");
    }

    // 2️⃣ Validate Reject Reason Dropdown (only when visible)
    if (dropdownVisible && !selectedRejectReason) {
      missingFields.push("Please select a Reject Reason.");
    }

    // 3️⃣ Validate Approve or Reject clicked
    if (!approveState && !rejectState) {
      missingFields.push("Please click on either Approve or Reject.");
    }

    return missingFields.length > 0 ? missingFields : true;
  };

  const handlesave = async () => {
    const residenceValidationResult = validateFields();
    const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

    if (missingFields.length) {
      // Format Alert ⚠️ into a styled list
      const formattedMissingFields = missingFields
        .map((field, index) => `\u2022 ${field}`) // Add bullet points
        .join('\n'); // Join with new lines

      Alert.alert(
        'Alert ⚠️',
        `${formattedMissingFields}`,
        [{ text: 'OK', style: 'cancel' }] // Optionally, add a cancel button
      );
    } else {
      await updateDeviations()
      await leadApproval();
      await CIBILFILEUpload();
      await getAllLeads();
    }
  };

  const handlesaveOnlyApplicant = async () => {
    const residenceValidationResult = validateFields();
    const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

    if (missingFields.length) {
      // Format Alert ⚠️ into a styled list
      const formattedMissingFields = missingFields
        .map((field, index) => `\u2022 ${field}`) // Add bullet points
        .join('\n'); // Join with new lines

      Alert.alert(
        'Alert ⚠️',
        ` \n\n${formattedMissingFields}`,
        [{ text: 'OK', style: 'cancel' }] // Optionally, add a cancel button
      );
    } else {
      try {
        // First call: updateDeviations
        await updateDeviationsOnlyApplicant();
        // Second call: leadApproval
        await leadApprovalOnlyApplicant();
        await CIBILFILEUpload();
        // Third call: getAllLeads
        await getAllLeads();
        // Alert.alert('Success', 'All operations completed successfully.');
      } catch (error) {
        console.error("Error in handlesaveOnlyApplicant:", error);
        Alert.alert('Error', 'An error occurred while saving.');
      }
    }
  };


  const validateFieldsCoApplicant = () => {
    const missingFields = [];

    // Validate Comment (remark)
    if (!remarkCo.trim()) {
      missingFields.push('Comment cannot be empty.');
    }


    // Validate Reject Reason Dropdown (only if visible)
    if (isDropdownVisibleCo && !SelectedrejectReasonCo) {
      missingFields.push('Please select a Reject Reason.');
    }

    // Validate Approval or Rejection button
    if (!approveClickedCo && !rejectClickedCo) {
      missingFields.push('Please click on either Approve or Reject.');
    }

    return missingFields.length ? missingFields : true;
  };


  const handlesaveCo = async () => {
    const residenceValidationResult = validateFieldsCoApplicant();
    const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

    if (missingFields.length) {
      // Format Alert ⚠️ into a styled list
      const formattedMissingFields = missingFields
        .map((field, index) => `\u2022 ${field}`) // Add bullet points
        .join('\n'); // Join with new lines

      Alert.alert(
        'Alert ⚠️',
        ` \n\n${formattedMissingFields}`,
        [{ text: 'OK', style: 'cancel' }] // Optionally, add a cancel button
      );
    } else {
      await updateDeviationsCo()
      await leadApprovalCo();
      await CIBILFILEUploadCo();
      await getAllLeads();
    }
    // setSaveClicked(true);
  };

  const handlesaveOnlyCoApplicant = async () => {
    const residenceValidationResult = validateFieldsCoApplicant();
    const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

    if (missingFields.length) {
      // Format Alert ⚠️ into a styled list
      const formattedMissingFields = missingFields
        .map((field, index) => `\u2022 ${field}`) // Add bullet points
        .join('\n'); // Join with new lines

      Alert.alert(
        'Alert ⚠️',
        ` \n\n${formattedMissingFields}`,
        [{ text: 'OK', style: 'cancel' }] // Optionally, add a cancel button
      );
    } else {
      await updateDeviationsOnlyCoApplicant()
      await leadApprovalCo();
      await CIBILFILEUploadCo();
      await getAllLeads();

    }
  };

  const handleSubmitCo = async () => {
    const residenceValidationResult = validateFieldsCoApplicant();
    const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

    if (missingFields.length) {
      // Format Alert ⚠️ into a styled list
      const formattedMissingFields = missingFields
        .map((field, index) => `\u2022 ${field}`) // Add bullet points
        .join('\n'); // Join with new lines

      Alert.alert(
        'Alert ⚠️',
        ` \n\n${formattedMissingFields}`,
        [{ text: 'OK', style: 'cancel' }] // Optionally, add a cancel button
      );
    } else {
      await leadApproval();
      await leadApprovalCo();
      await getAllLeads();
      await CIBILFILEUpload();
      await CIBILFILEUploadCo();
      await getAllLeads();

    }

  };

  const handleProductChange = (item) => {
    setSelectedrejectReason(item.value); // Update selected value
    setRejectReasonApplicant(item.label);
  };

  const handleProductChangeCo = (item) => {
    setSelectedrejectReasonCo(item.value); // Update selected value
    setRejectReasonCoApplicant(item.label);
  };

  const handleRejectButtonPress = () => {
    setIsDropdownVisible(true); // Toggle the dropdown visibility
    setRejectClicked(true);  // Set rejectClicked to true when Reject is clicked
    setApproveClicked(false);  // Reset approveClicked to false
    setApprovalStatus('rejected'); // Set approval status to 'rejected'
  };


  const handleApproveButtonPress = () => {
    setIsDropdownVisible(false);
    setApproveClicked(true);  // Set approveClicked to true when Approve is clicked
    setRejectClicked(false);  // Reset rejectClicked to false
    setSelectedrejectReason('')
    setRejectReasonApplicant('');
    setApprovalStatus('approved'); // Set approval status to 'approved'
  };





  const handleRejectButtonPressCo = () => {
    setIsDropdownVisibleCo(true); // Toggle the dropdown visibility
    setRejectClickedCo(true);  // Set rejectClicked to true when Reject is clicked
    setApproveClickedCo(false);  // Reset approveClicked to false
    setApprovalStatusCo('rejected'); // Set approval status to 'rejected'
  };


  const handleApproveButtonPressCo = () => {
    setIsDropdownVisibleCo(false);
    setApproveClickedCo(true);  // Set approveClicked to true when Approve is clicked
    setRejectClickedCo(false);  // Reset rejectClicked to false
    setApprovalStatusCo('approved'); // Set approval status to 'approved'
    setSelectedrejectReasonCo('')
    setRejectReasonCoApplicant('');
  };
  // Check if Applicant Tab should be enabled ( = true)
  const isApplicantTabEnabled = SelectedLeadApplicant?.leadStatus?.leadStatusName === "Under Credit Review";

  // Check if Co-Applicant Tab should be enabled ( = true)
  const isCoApplicantTabEnabled = selectedCoApplicant?.leadStatus?.leadStatusName === "Under Credit Review";

  const renderSection = (title, key, expandedKey, toggle, content) => (
    <>
      <View style={styles.headerCollap}>
        <Text style={styles.headerText}>{title}</Text>
        <TouchableOpacity onPress={() => toggle(key)} style={styles.headerTouchable}>
          <Text style={styles.arrowIcon}>
            {expandedKey === key ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </View>
      {expandedKey === key && <View style={styles.contenttt}>{content}</View>}
    </>
  );

  useEffect(() => {
    if (SelectedLeadApplicant?.leadStatusName === "Under Credit Review" === false) {
      setActiveTabView('Co-Applicant');
    } else if (SelectedLeadApplicant?.leadStatus?.leadStatusName === "Under Credit Review") {
      setActiveTabView('Applicant');
    }
  }, [SelectedLeadApplicant?.leadStatusName === "Under Credit Review"]); // Add dependency on SelectedLeadApplicant


  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 30) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getMimeType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      png: 'image/png',
      txt: 'text/plain',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      zip: 'application/zip',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  const sanitizeFileName = (fileName) => {
    return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_'); // Replace invalid characters with '_'
  };

  // Function to download the file
  const handleDownloadCibilFile = async (filesData) => {
    try {
      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download files.');
        return;
      }

      // Iterate over each file object
      for (const { file, description } of filesData) {
        const fileName = description || `file_${filesData.indexOf(file) + 1}`;
        const sanitizedFileName = sanitizeFileName(fileName);
        const dirs = RNFetchBlob.fs.dirs;
        const filePath = `${dirs.DownloadDir}/${sanitizedFileName}`;
        const mimeType = getMimeType(fileName);

        try {
          if (typeof file === 'string' && file.startsWith('http')) {
            // Download URL using Download Manager
            await RNFetchBlob.config({
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: fileName,
                description: 'Downloading file...',
                path: filePath,
                mime: mimeType,
                mediaScannable: true,
              },
            }).fetch('GET', file);

            ToastAndroid.show('Download Complete!', ToastAndroid.SHORT);
            Alert.alert('Success', `File ${fileName} downloaded successfully!`);
          } else {
            // Save base64 data to file
            await RNFetchBlob.fs.writeFile(filePath, file, 'base64');
            ToastAndroid.show('Download Complete!', ToastAndroid.SHORT);
            Alert.alert('Success', `File ${fileName} downloaded to ${filePath}`);
          }
        } catch (err) {
          Alert.alert('Error', `Failed to download file: ${fileName}. ${err.message}`);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong: ' + error.message);
    }
  };

  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const hasValidValue = (value) =>
    value !== null && value !== undefined && `${value}`.trim() !== '';







  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const [fileco, setFileco] = useState(null);
  const [fileNameco, setFileNameco] = useState('');

  const handleDocumentSelection = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true, // Enable multiple file selection
      });




      const resolvedFiles = [];

      for (const file of res) {
        const fileObj = {
          uri: file.uri,
          name: file.name,
          type: file.type || 'application/octet-stream',
        };

        let filePath = fileObj.uri;

        // Handle content:// URIs for Android
        if (fileObj.uri.startsWith('content://')) {
          if (Platform.OS === 'android') {
            const localPath = `${RNFS.DocumentDirectoryPath}/${fileObj.name}`;
            await RNFS.copyFile(fileObj.uri, localPath);
            filePath = localPath;

          }
        }

        // Check the file size using react-native-fs (RNFS)
        const fileStats = await RNFS.stat(filePath);
        const fileSizeInBytes = fileStats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);


        // Skip files exceeding the size limit
        if (fileSizeInMB > 1) {
          Alert.alert(
            'File Size Exceeded',
            `The file "${fileObj.name}" exceeds the maximum upload size of 1 MB. It has been skipped.`
          );
          continue; // Skip this file
        }

        // Add the resolved file object to the array
        resolvedFiles.push({
          uri: `file://${filePath}`,
          name: fileObj.name,
          type: fileObj.type,
        });
      }



      // Update state with the selected files
      setFile(resolvedFiles);
      setFileName(resolvedFiles.map((file) => file.name).join(', '));

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {

      } else {
        console.error('Error selecting documents:', err);
      }
    }
  };

  const handleDocumentSelectionCo = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true, // Enable multiple file selection
      });




      const resolvedFiles = [];

      for (const file of res) {
        const fileObj = {
          uri: file.uri,
          name: file.name,
          type: file.type || 'application/octet-stream',
        };

        let filePath = fileObj.uri;

        // Handle content:// URIs for Android
        if (fileObj.uri.startsWith('content://')) {
          if (Platform.OS === 'android') {
            const localPath = `${RNFS.DocumentDirectoryPath}/${fileObj.name}`;
            await RNFS.copyFile(fileObj.uri, localPath);
            filePath = localPath;

          }
        }

        // Check the file size using react-native-fs (RNFS)
        const fileStats = await RNFS.stat(filePath);
        const fileSizeInBytes = fileStats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);



        // Skip files exceeding the size limit
        // if (fileSizeInMB > 1) {
        //   Alert.alert(
        //     'File Size Exceeded',
        //     `The file "${fileObj.name}" exceeds the maximum upload size of 1 MB. It has been skipped.`
        //   );
        //   continue; // Skip this file
        // }

        // Add the resolved file object to the array
        resolvedFiles.push({
          uri: `file://${filePath}`,
          name: fileObj.name,
          type: fileObj.type,
        });
      }



      // Update state with the selected files
      setFileco(resolvedFiles);
      setFileNameco(resolvedFiles.map((file) => file.name).join(', '));

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {

      } else {
        console.error('Error selecting documents:', err);
      }
    }
  };


  const CIBILFILEUpload = async () => {
    // Check if the file is present
    if (!file || (Array.isArray(file) && file.length === 0) || !file[0].uri || !file[0].name) {
      // Alert.alert('Error', 'Please attach a file before submitting.');

      return;

    }

    // Check if a single file is selected or multiple files are selected
    const filesToUpload = Array.isArray(file) ? file : [file]; // Ensure file is always an array

    // Iterate over the files if multiple files are selected
    try {
      const uploadPromises = filesToUpload.map(async (selectedFile) => {
        // Ensure the file URI is correctly formatted
        const fileUri = Platform.OS === 'android' && selectedFile?.uri ? selectedFile.uri.replace('file://', '') : selectedFile?.uri;

        // Wrap the file in binary format using RNFetchBlob
        const wrappedFileData = RNFetchBlob.wrap(fileUri);

        // Check if the binary data is valid
        if (!wrappedFileData) {
          Alert.alert('Error', 'Failed to wrap the file in binary format. Please check the file.');
          return;
        }

        const response = await RNFetchBlob.fetch(
          'POST',
          `uploadLeadCibilReport/${SelectedLeadApplicant.id}`,
          {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + token,
          },
          [
            { name: 'file', filename: selectedFile.name, data: wrappedFileData },
            // { name: 'dto', data: JSON.stringify(dto) },
          ]
        );

        const responseData = await response.json();


        if (responseData?.msgKey === 'Success') {
          Alert.alert(responseData?.msgKey, responseData?.message);
        } else {
          Alert.alert('Error', responseData.message || 'Failed to upload the file.');
        }

        return response.data;
      });

      // Wait for all files to upload (if multiple files)
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in addRiskContainmentUnit:', error.message || error);
      Alert.alert('Error', 'Failed to add residence verification.');
    }
  };


  const CIBILFILEUploadCo = async () => {
    // Check if the file is present
    if (!fileco || (Array.isArray(fileco) && fileco.length === 0) || !fileco[0].uri || !fileco[0].name) {
      // Alert.alert('Error', 'Please attach a file before submitting.');
      handleClose()
      return;
    }

    // Check if a single file is selected or multiple files are selected
    const filesToUpload = Array.isArray(fileco) ? fileco : [fileco]; // Ensure file is always an array

    // Iterate over the files if multiple files are selected
    try {
      const uploadPromises = filesToUpload.map(async (selectedFile) => {
        // Ensure the file URI is correctly formatted
        const fileUri = Platform.OS === 'android' && selectedFile?.uri ? selectedFile.uri.replace('file://', '') : selectedFile?.uri;

        // Wrap the file in binary format using RNFetchBlob
        const wrappedFileData = RNFetchBlob.wrap(fileUri);

        // Check if the binary data is valid
        if (!wrappedFileData) {
          Alert.alert('Error', 'Failed to wrap the file in binary format. Please check the file.');
          return;
        }

        const response = await RNFetchBlob.fetch(
          'POST',
          `uploadLeadCibilReport/${selectedCoApplicant.id}`,
          {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + token,
          },
          [
            { name: 'file', filename: selectedFile.name, data: wrappedFileData },
            // { name: 'dto', data: JSON.stringify(dto) },
          ]
        );

        const responseData = await response.json();


        if (responseData?.msgKey === 'Success') {
          Alert.alert(responseData?.msgKey, responseData?.message);

          Alert.alert(
            responseData?.msgKey,
            responseData?.message || 'Applicant added successfully!',
            [{ text: 'OK', onPress: () => handleClose() }]
          );
        } else {
          Alert.alert('Error', responseData.message || 'Failed to upload the file.');
        }

        return response.data;
      });

      // Wait for all files to upload (if multiple files)
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in addRiskContainmentUnit:', error.message || error);
      Alert.alert('Error', 'Failed to add residence verification.');
      handleClose();
    }
  };


  const renderRows = (fields, columns = 2, spacing = 10) => {
    if (!fields || fields.length === 0) return null;

    const rows = [];
    for (let i = 0; i < fields.length; i += columns) {
      rows.push(
        <View key={i} style={styles.row}>
          {fields.slice(i, i + columns).map((field, idx) => (
            <View key={idx} style={{ flex: 1, paddingHorizontal: spacing / 2 }}>
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


  // ✅ Unified reusable builder
  const buildFields = (applicant, downloadList, handleSelectDoc, fileList) => {
    const fields = [];

    // --- Bureau Scores ---
    const scores = [
      { key: 'cibilScore', label: 'Bureau Score', value: applicant?.cibilScore },
      { key: 'crifScore', label: 'Bureau Score', value: applicant?.crifScore },
    ];

    scores.forEach(({ key, label, value }) => {
      if (value != null && value > 0) {
        fields.push(
          <CustomInput
            key={key}
            label={label}
            value={String(value)}
            editable={false}
          />
        );
      }
    });

    // --- Bureau File ---
    const bureauFileValue =
      downloadList?.length > 0
        ? downloadList.map((item) => `• ${item.description}`).join('\n')
        : 'N/A';

    fields.push(
      <CustomInput
        key="bureauFile"
        label="Bureau File"
        value={bureauFileValue}
        editable={false}
      // multiline={true}
      // style={styles.bureauFileInput}
      />
    );

    if (applicant?.leadStatusName === "Under Credit Review") {
      fields.push(
        <View
          key="documentUpload"
          style={{ flexDirection: 'column', marginLeft: scale(2) }}
        >
          <Text style={styles.labelformodal}>Document Upload</Text>

          <TouchableOpacity style={styles.documentButton} onPress={handleSelectDoc}>
            <Image source={require('../../asset/upload.png')} style={styles.iconStyle} />
            <Text style={styles.buttonText}>Select Document</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 10 }}>
            {fileList && fileList.length > 0 ? (
              fileList.map((fileItem, index) => (
                <Text key={index} style={styles.fileNameText}>
                  {`• ${fileItem.name}`}
                </Text>
              ))
            ) : (
              <Text style={{ marginLeft: 10, color: 'black' }}>No file selected</Text>
            )}
          </View>
        </View>

      );
    }

    return fields;
  };

  // ✅ Build applicant and co-applicant field arrays
  const fields = buildFields(
    SelectedLeadApplicant,
    downloadCibilReportApplicant,
    handleDocumentSelection,
    file
  );

  const fieldsco = buildFields(
    selectedCoApplicant,
    downloadCibilReportCoApplicant,
    handleDocumentSelectionCo,
    file
  );

  const DynamicFields = ({ fields, columns = 2 }) => {
    const renderedFields = fields
      .map(f => {
        if (!f.value) return null;

        // if field has extra UI (like download button)
        if (f.extra) {
          return (
            <View key={f.label} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
              {/* {renderInput(f.label, f.value, f.verified || false, false)} */}
              <CustomInput
                label={f.label}
                value={f.value != null ? String(f.value) : ""}
                setValue={() => { }}
                editable={false}
                isVerified={f.verified || false}
              />

              {f.extra(handleDownloadCibilFile)}
            </View>
          );
        }
        return (
          <CustomInput
            label={f.label}
            value={f.value != null ? String(f.value) : ""}
            setValue={() => { }}
            editable={false}            // read-only
            isVerified={f.verified || false} // show green check if verified
          />
        );

        // return renderInput(f.label, f.value, f.verified || false, false);
      })
      .filter(Boolean);

    return renderRows(renderedFields, columns);
  };


  const LocationSection = ({ applicant, locationData }) => {

    const fieldsData = [
      { label: "Pincode", value: locationData?.pincode },
      { label: "Country", value: locationData?.countryName },
      { label: "City", value: locationData?.cityName },
      { label: "State", value: locationData?.stateName },
      { label: "Area", value: locationData?.areaName },
      // { label: "Region", value: locationData?.regionName },
      // { label: "Zone", value: locationData?.zoneName },
    ].filter(field => field.value); // removes empty/null values

    return <DynamicFields fields={fieldsData} columns={2} />;
  };


  const fieldsCo = [
    { label: "Portfolio", value: selectedCoApplicant?.portfolioName },
    { label: "Product", value: selectedCoApplicant?.productName },
    { label: "Category Type", value: selectedCoApplicant?.applicantCategoryCode },
    { label: "Lead Source", value: selectedCoApplicant?.leadSourceName },
    { label: "Lead Status", value: selectedCoApplicant?.leadStatusName, },
    { label: "Lead Stage", value: selectedCoApplicant?.leadStage },
    { label: "Lead ID", value: selectedCoApplicant?.leadId },
    { label: "Assign To", value: selectedCoApplicant?.assignTo },
    { label: "Created By", value: selectedCoApplicant?.createdBy },
    { label: "Bureau Score", value: selectedCoApplicant?.crifScore != null ? String(selectedCoApplicant.crifScore) : null },

    {
      label: "Loan Amount",
      value: selectedCoApplicant?.loanAmount
        ? `₹ ${formatNumberWithCommas(selectedCoApplicant.loanAmount.toString())}`
        : "₹ 0",
    },

    { label: "Application Number", value: selectedCoApplicant?.appId },
    { label: "Converted From Enquiry", value: selectedCoApplicant?.convertedFromEnquiry !== undefined ? (selectedCoApplicant.convertedFromEnquiry ? "YES" : "NO") : null },
    { label: "Enquiry ID", value: selectedCoApplicant?.enquiryId },
    { label: "Reject Reason", value: selectedCoApplicant?.rejectReason },
  ];

  // Filter out fields that are null, undefined, or empty
  const validFields = fieldsCo.filter(f => f.value !== null && f.value !== undefined && f.value !== "");

  const loanFields = [
    { label: "Loan Amount", value: selectedCoApplicant?.loanAmount != null ? String(selectedCoApplicant.loanAmount) : null },
    { label: "Product", value: selectedCoApplicant?.productName },
    { label: "Comment", value: selectedCoApplicant?.loanRemark },
    { label: "Lead Status", value: selectedCoApplicant?.leadStatusName },
  ];


  const showApplicantTab = useMemo(
    () =>
      SelectedLeadApplicant?.leadStatusName === 'Under Credit Review' ||
      (SelectedLeadApplicant && Object.keys(SelectedLeadApplicant).length > 0),
    [SelectedLeadApplicant]
  );

  const showCoApplicantTab = useMemo(
    () =>
      selectedCoApplicant?.leadStatusName === 'Under Credit Review' ||
      (selectedCoApplicant && Object.keys(selectedCoApplicant).length > 0),
    [selectedCoApplicant]
  );

  // 🚀 Optimized handler with no re-declaration per render
  const handleCoApplicantPress = () => {
    if (isCoApplicant) {
      setActiveTabView('Co-Applicant');
      return;
    }

    const validationResult = validateFields();
    const missingFields = Array.isArray(validationResult) ? validationResult : [];

    if (missingFields.length > 0) {
      Alert.alert(
        'Alert ⚠️',
        missingFields.map((field) => `\u2022 ${field}`).join('\n'),
        [{ text: 'OK', style: 'cancel' }]
      );
    } else if (!CoApllicant) {
      Alert.alert('Alert ⚠️', 'Please save the Applicant first!');
    } else {
      setActiveTabView('Co-Applicant');
    }
  };


  const renderApplicantAndCoApplicantSection = () => {
    const isApplicant = activeTabView === 'Applicant';
    const A = isApplicant ? SelectedLeadApplicant : selectedCoApplicant;
    const locationData = isApplicant
      ? findApplicantByCategoryCodView?.data
      : cofindApplicantByCategoryCodView?.data;
    const deviation = isApplicant ? deviaaa : codeviaa;
    const approval = isApplicant ? approvalStatus : approvalStatusCo;
    const downloadList = isApplicant
      ? downloadCibilReportApplicant
      : downloadCibilReportCoApplicant;
    const dropdownVisible = isApplicant
      ? isDropdownVisible
      : isDropdownVisibleCo;
    const remarkValue = isApplicant ? remark : remarkCo;
    const setRemarkValue = isApplicant ? setremark : setremarkCo;
    const rejectReasonList = isApplicant ? rejectReason : rejectReasonCo;
    const selectedRejectReason = isApplicant
      ? SelectedrejectReason
      : SelectedrejectReasonCo;
    const handleRejectChange = isApplicant
      ? handleProductChange
      : handleProductChangeCo;
    const handleApprove = isApplicant
      ? handleApproveButtonPress
      : handleApproveButtonPressCo;
    const handleReject = isApplicant
      ? handleRejectButtonPress
      : handleRejectButtonPressCo;
    const handleSaveFunc = isApplicant ? handlesave : handlesaveCo;
    const handleSubmitFunc = isApplicant
      ? handlesaveOnlyApplicant
      : handlesaveOnlyCoApplicant;

    const expanded = isApplicant ? expandedItem : expandedItemCo;
    const toggleExpand = isApplicant ? toggleSection : toggleSectionCo;
    const fieldsList = isApplicant ? fields : fieldsco;
    console.log(A, 'AA')
    if (!A) return null;

    const hasVal = (v) => v != null && v !== '' && v !== 'N/A' && v !== 'null';
    const isOrg = !!A?.organizationName;

    // --- compute simplified booleans for button logic
    const isCurrentUnderReview = A?.leadStatusName === 'Under Credit Review';

    // "other" refers to the opposite record (co-applicant when on Applicant tab, applicant when on Co-Applicant tab)
    const otherUnderReview = isApplicant
      ? selectedCoApplicant?.leadStatusName === 'Under Credit Review'
      : SelectedLeadApplicant?.leadStatusName === 'Under Credit Review';

    // --- All Section Data ---
    const sections = [
      {
        id: 'basicInfo',
        title: isOrg ? 'Organization Detail' : 'Individual Detail',
        render: () => {
          const fieldData = [
            {
              label: A?.firstName || A?.lastName ? 'Name' : 'Organization Name',
              value:
                A?.firstName || A?.lastName
                  ? `${A?.firstName || ''} ${A?.middleName || ''} ${A?.lastName || ''}`.trim()
                  : A?.organizationName,
              isVerified: isOrg ? A?.panVerified : !!(A?.firstName || A?.lastName),
            },
            {
              label: isOrg ? 'Incorporation Date' : 'Date of Birth',
              value: formatDate(A?.dateOfBirth),
              isVerified: A?.panVerified,
            },
            {
              label: isOrg ? 'Registration Type' : 'Primary Occupation',
              value: A?.primaryOccupation,
            },
            ['CIN Number', A?.cin],
            ['Registration Number', A?.registrationNumber],
            ['Organization Type', A?.organizationType],
            ['Industry Type', A?.industryType],
            ['Segment Type', A?.segmentType],
            ['Contact Person', A?.contactPersonName],
            ['Designation', A?.contactPersonDesignation],
            ['Gender', A?.gender],
            ['Email', A?.email, A?.isEmailVerified],
            ['Mobile No', A?.mobileNo, A?.isMobileVerified],
          ];

          const fields = fieldData
            .map((f) =>
              Array.isArray(f)
                ? { label: f[0], value: f[1], isVerified: f[2] ?? false }
                : f
            )
            .filter((f) => hasVal(f.value))
            .map((f) => (
              <CustomInput
                key={f.label}
                label={f.label}
                value={f.value}
                editable={false}
                isVerified={!!f.isVerified}
              />
            ));

          return renderRows(fields, 2, 10);
        },
      },
      {
        id: 'kycDetail',
        title: 'KYC Detail',
        render: () => {
          const fieldData = [
            ['PAN', A?.pan, A?.panValid],
            ['Aadhar', A?.aadhar],
          ];
          const fields = fieldData
            .filter(([_, v]) => hasVal(v))
            .map(([label, value, isVerified]) => (
              <CustomInput
                key={label}
                label={label}
                value={value}
                editable={false}
                {...(isVerified !== undefined && { isVerified })}
              />
            ));
          return renderRows(fields, 2, 10);
        },
      },
      {
        id: 'locationDetail',
        title: 'Location Detail',
        render: () => (
          <LocationSection applicant={A} locationData={locationData} />
        ),
      },
      {
        id: 'leadDetail',
        title: 'Lead Detail',
        render: () => {
          const fieldData = [
            ['Portfolio', A?.portfolioName],
            ['Product', A?.productName],
            ['Category Type', A?.applicantCategoryCode],
            ['Lead Source', A?.leadSourceName],
            ['Lead Status', A?.leadStatusName],
            ['Lead Stage', A?.leadStage],
            ['Lead ID', A?.leadId],
            ['Assign To', A?.assignTo],
            ['Created By', A?.createdBy],
            ['Bureau Score', A?.cibilScore > 0 ? String(A.cibilScore) : A?.crifScore],
            ['Loan Amount', hasVal(A?.loanAmount) ? `₹ ${formatNumberWithCommas(A.loanAmount.toString())}` : '₹ 0'],
            ['Application Number', A?.appId],
            ['Converted From Enquiry', A?.convertedFromEnquiry ? 'YES' : 'NO'],
            ['Enquiry ID', A?.enquiryId],
            ['Reject Reason', A?.rejectReason],
          ];

          const fields = fieldData
            .filter(([_, v]) => hasVal(v))
            .map(([label, value]) => (
              <CustomInput key={label} label={label} value={value} editable={false} />
            ));

          return renderRows(fields, 2, 10);
        },
      },
    ];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- Collapsible Sections --- */}
        {sections.map((section) => (
          <View key={section.id} style={styles.collapsibleContainer}>
            <View style={styles.headerCollap}>
              <Text style={styles.headerText}>{section.title}</Text>
              <TouchableOpacity
                onPress={() => toggleExpand(section.id)}
                style={styles.headerTouchable}
              >
                <Text style={styles.arrowIcon}>
                  {expanded === section.id ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            </View>

            {expanded === section.id && (
              <View style={styles.contenttt}>{section.render()}</View>
            )}
          </View>
        ))}

        {/* --- Bureau / File Upload --- */}
        <View style={{ width: '95%', alignSelf: 'center' }}>
          {renderRows(fieldsList.filter(Boolean), 2, 10)}
        </View>


        <View style={styles.bureauTriggerRow}>
          {A?.leadStatusName === 'Under Credit Review' && (
            <TouchableOpacity style={styles.triggerButton}>
              <Text style={styles.triggerText}>Bureau Trigger</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.downloadIconButton}
            onPress={() => handleDownloadCibilFile(downloadList)}
          >
            <Image
              source={require('../../asset/download.png')}
              style={styles.downloadIcon}
            />
          </TouchableOpacity>
        </View>

        {/* --- Deviation --- */}
        <View style={{ width: '100%', paddingHorizontal: 10 }}>
          <Text style={styles.deviationTitle}>Deviation:</Text>

          <View style={{ width: '90%', marginHorizontal: 10 }}>
            <Text style={styles.deviationText}>
              {deviation?.description || 'No description available'}
            </Text>

            <View style={styles.row}>
              {approval === 'approved' ? (
                <Image
                  source={require('../../asset/greencheck.png')}
                  style={styles.deviationIcon}
                />
              ) : approval === 'rejected' ? (
                <Image
                  source={require('../../asset/reject.png')}
                  style={styles.deviationIcon}
                />
              ) : null}
            </View>
          </View>

          {/* {(A?.leadStatusName === 'Under Credit Review' ||
            A?.leadStatusName === 'Rejected') && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={handleApprove}
                  disabled
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={handleReject}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )} */}

          {/* --- Approve / Reject Buttons --- */}

          {isApplicant ? (
            /* -------------------- */
            /* Applicant Buttons    */
            /* -------------------- */
            SelectedLeadApplicant?.leadStatusName === 'Under Credit Review' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={handleApproveButtonPress}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={handleRejectButtonPress}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            /* ------------------------ */
            /* Co-Applicant Buttons     */
            /* ------------------------ */
            selectedCoApplicant?.leadStatusName === 'Under Credit Review' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={handleApproveButtonPressCo}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={handleRejectButtonPressCo}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )
          )}



          {deviation?.rejectReason && (
            <>
              <Text style={styles.deviationTitle}>Reject Reason:</Text>
              <Text style={styles.deviationText}>{deviation?.rejectReason}</Text>
            </>
          )}

          {dropdownVisible && (
            <View style={{ marginLeft: 6 }}>
              {renderDropdown(
                'Reject',
                rejectReasonList,
                selectedRejectReason,
                handleRejectChange
              )}
            </View>
          )}

          <View style={styles.row}>
            {renderInputt(
              'Comment',
              remarkValue,
              setRemarkValue,
              !A?.approvedRemark,
              'Enter your comment...',
              false,
              false,
              false,
              false,
              isApplicant ? 'remark' : 'remarkCo',
              '',
              true
            )}
          </View>
        </View>

        {/* --- Buttons --- */}
        {/* --- Buttons --- */}
        <View style={styles.butcontai}>

          {/* -------------------- */}
          {/* Applicant Buttons    */}
          {/* -------------------- */}
          {isApplicant ? (
            <>
              {(SelectedLeadApplicant?.leadStatusName === "Under Credit Review" &&
                selectedCoApplicant?.leadStatusName === "Under Credit Review") ? (
                <TouchableOpacity
                  style={[styles.saveButton, CoApllicant && styles.disabledButton]}
                  onPress={handlesave}
                  disabled={CoApllicant}
                >
                  <Text style={styles.closeText}>Save</Text>
                </TouchableOpacity>
              ) : (
                SelectedLeadApplicant?.leadStatusName === "Under Credit Review" && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handlesaveOnlyApplicant}
                  >
                    <Text style={styles.closeText}>Submit</Text>
                  </TouchableOpacity>
                )
              )}

              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </>
          ) : (

            /* --------------------- */
            /* Co-Applicant Buttons  */
            /* --------------------- */

            // <>
            //   {SelectedLeadApplicant?.leadStatusName === "Under Credit Review" &&
            //     selectedCoApplicant?.leadStatusName === "Under Credit Review" ? (
            //     <TouchableOpacity
            //       style={styles.saveButton}
            //       onPress={handlesaveCo}
            //     >
            //       <Text style={styles.closeText}>Save</Text>
            //     </TouchableOpacity>
            //   ) : selectedCoApplicant?.leadStatusName === "Under Credit Review" ? (
            //     <TouchableOpacity
            //       style={styles.saveButton}
            //       onPress={handlesaveOnlyCoApplicant}
            //     >
            //       <Text style={styles.closeText}>Submit</Text>
            //     </TouchableOpacity>
            //   ) : null}

            //   {/* {SaveClicked === true && (
            //     <TouchableOpacity
            //       style={styles.SubmitButton}
            //       onPress={handleSubmitCo}
            //     >
            //       <Text style={styles.closeText}>Submit</Text>
            //     </TouchableOpacity>
            //   )} */}

            //   <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            //     <Text style={styles.closeText}>Close</Text>
            //   </TouchableOpacity>
            // </>

            <>
              {/* --- Save when BOTH Applicant & CoApplicant are Under Review OR Rejected --- */}
              {((SelectedLeadApplicant?.leadStatusName === "Under Credit Review" ||
                SelectedLeadApplicant?.leadStatusName === "Rejected") &&

                (selectedCoApplicant?.leadStatusName === "Under Credit Review" ||
                  selectedCoApplicant?.leadStatusName === "Rejected")
              ) ? (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handlesaveCo}
                >
                  <Text style={styles.closeText}>Save</Text>
                </TouchableOpacity>
              ) : (
                /* --- Submit when ONLY CoApplicant is Under Review OR Rejected --- */
                (selectedCoApplicant?.leadStatusName === "Under Credit Review" ||
                  selectedCoApplicant?.leadStatusName === "Rejected") && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handlesaveOnlyCoApplicant}
                  >
                    <Text style={styles.closeText}>Submit</Text>
                  </TouchableOpacity>
                )
              )}

              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </>

          )}

        </View>

      </ScrollView>
    );
  };


  return (
    <Provider>
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar
          translucent
          backgroundColor="#2196F3"
          barStyle="light-content"
        />

        {/* <View style={styles.header}>
            <TouchableOpacity onPress={openDrawer}>
        
              <Image source={require('../asset/icons/menus.png')} style={styles.drawerIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}></Text>
          </View> */}



        <LinearGradient
          colors={["#2196F3", "#2196F3"]}
          style={styles.headerWrapper}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={openDrawer} activeOpacity={0.85}>
              <Image
                source={require("../../asset/menus.png")}
                style={styles.drawerIcon}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Deviation WorkList</Text>

            <View style={styles.headerAvatar}>
              <Text style={styles.avatarText}>
                {mkc.firstName[0]}
                {mkc.lastName[0]}
              </Text>
            </View>


          </View>

          <View style={styles.topRow}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search..."
              placeholderTextColor="#fff"
              value={searchQuery}
              onChangeText={handleSearch}
            />

            <View style={styles.switchWrapper}>
              <Switch
                value={isCoApplicant}
                onValueChange={toggleSwitch}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isCoApplicant ? '#f5dd4b' : '#f4f3f4'}
                style={styles.switch}
              />
            </View>
          </View>


        </LinearGradient>
        <View style={styles.container}>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => {
              const isRejected =
                item?.leadStage?.stageName?.toLowerCase() === "rejected" ||
                item?.leadStage?.toLowerCase() === "rejected" ||
                item?.leadStatus?.leadStatusName?.toLowerCase() === "rejected";

              const hasAppId = !!item?.appId; // ✅ appId exists

              // ✅ Conditional card background color logic
              const cardStyle = [
                styles.cardBase, // your default card style (optional)
                isRejected && { backgroundColor: '#F85050' }, // 🔴 red for rejected
                hasAppId && !isRejected && { backgroundColor: '#4CAF50' }, // 🟢 green for appId (only if not rejected)
              ];

              return (
                <Card
                  item={item}
                  index={index}
                  handleCardPress={handleCardPress}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isExpanded={expandedItem === index}
                  style={cardStyle} // 👈 pass here
                  isRejected={isRejected}
                  hasAppId={hasAppId}
                />
              );
            }}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={<Text style={styles.emptyListText}>No data available</Text>}
          />



          <Modal
            animationType="slide"
            transparent
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            {/* ✅ Toast kept outside content for performance */}
            <CustomToast message={toastMessage} isVisible={isToastVisible} />

            <View style={styles.overlay}>
              <View style={styles.modalContent}>
                {/* --- TABS --- */}
                <View style={styles.tabContainer}>
                  {showApplicantTab && (
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTabView === 'Applicant' && styles.activeTab,
                        isApplicantTabDisabled && styles.disabledTab,
                      ]}
                      onPress={() => {
                        setActiveTabView('Applicant');
                        if (SelectedLeadApplicant) setbackupselectedCard(SelectedLeadApplicant);
                      }}
                      disabled={isApplicantTabDisabled}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTabView === 'Applicant' && styles.activeTabText,
                          isApplicantTabDisabled && styles.disabledTabText,
                        ]}
                      >
                        Applicant
                      </Text>
                    </TouchableOpacity>
                  )}

                  {showCoApplicantTab && (
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTabView === 'Co-Applicant' && styles.activeTab,
                      ]}
                      onPress={handleCoApplicantPress}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTabView === 'Co-Applicant' && styles.activeTabText,
                        ]}
                      >
                        Co-Applicant
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {renderApplicantAndCoApplicantSection()}
              </View>
            </View>
          </Modal >

        </View >
      </SafeAreaView>
    </Provider >
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    // backgroundColor: '#2196F3', // backgroundColor same as header for seamless look
  },


  containermodal: {
    backgroundColor: '#FFFFFFFF',
    marginVertical: 0,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    width: width * 1, // You can set a fixed width or percentage as per requirement // You can limit the height to prevent overflow
    height: height * 1,
  },
  dropdown1: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    fontSize: 12,
    padding: 6,
    backgroundColor: '#f9f9f9',
    color: 'black',
    width: width * 0.4,
    height: height * 0.042,
  },

  modalContainercreate: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    width: width * 0.9,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backdropColor: "rgba(0,0,0,0.5)", // Dark background with some transparency
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // translucent background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  modalContent: {
    width: width * 0.92,
    maxHeight: height * 0.85,
    backgroundColor: '#FFF',
    borderRadius: moderateScale(12),
    padding: scale(12),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  field: {
    margin: 5,
  },
  formContainer: {
    marginTop: 20
  },
  formFieldContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: '#2196F3',
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + verticalScale(5) : verticalScale(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  drawerIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
    marginRight: scale(10),
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  drawerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropColor: "rgba(0,0,0,0.5)", // Dimmed background
    zIndex: 1,  // Ensure the drawer appears above other content
  },
  scrollContainer: {
    marginTop: 100,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  firstrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginHorizontal: 15,
    marginVertical: 15, // Use percentage to ensure responsive layout
  },


  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'black'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    top: 15,
  },
  inputField: {
    flex: 1, paddingHorizontal: 5, width: width * 0.25,
  },
  labelmodal: {
    fontSize: 12,
    marginBottom: 4,
    color: 'black',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
    color: 'gray',
  },

  inputmodal: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    fontSize: 12,
    backgroundColor: '#f9f9f9',
    color: 'black',
    width: width * 0.4,
    height: height * 0.042,

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 15,
    backgroundColor: 'red'
  },

  required: {
    color: 'red',
  },
  divider: {
    marginVertical: 5,
    top: 20
  },
  placeholderStyle: {
    color: 'black',
    fontSize: 12,
  },
  dropdown: {
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    padding: 0,
    width: width * 0.5,
    marginLeft: 20,
  },
  dropdownportfolio: {
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    padding: 0,
    width: width * 0.4,
    // marginLeft: 20,
  },
  dropdownItem: {
    padding: 6,
    color: 'black',
    fontSize: 10,
    backgroundColor: '#fff',
  },
  dropdownItemText: {
    color: 'black',
    fontSize: 12,
  },
  list: {
    padding: 0,
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: width * 0.95,

  },
  collapsedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  cardText: {
    fontSize: 14,
    color: 'black',
    marginTop: 4,
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#999999FF',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontWeight: '500',
    color: 'black',
    flex: 1, // Ensures labels are consistent width
  },
  cardValue: {
    color: 'black',
    flex: 2, // Allows value to take more space
    textAlign: 'left',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  createButton: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '500',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backdropColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    width: '100%',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: 'black',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  SubmitButton: {
    backgroundColor: '#17AE44E7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc', // Greyed-out button
    opacity: 0.6, // Slightly transparent
  },
  modalContainerdetail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backdropColor: "rgba(0,0,0,0.5)",
  },
  modalContentdetail: {
    backgroundColor: '#D8D8D8FF',
    borderRadius: 10,
    padding: 20,
    width: width * 1,
    // height: height * 0.9, // Prevent modal from overflowing
  },
  modalTitledetail: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollContent: {
    flexGrow: 1, // Ensure scrolling works properly
    // paddingBottom: 20,
  },
  modalTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15, // Added margin between rows
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  fieldContainer: {
    flex: 1,
    marginHorizontal: 5, // Space between columns
    padding: 10,
    backgroundColor: '#ffffff', // White background for fields
    borderRadius: 8, // Rounded corners for a smooth look
    borderWidth: 1,
    borderColor: '#ddd', // Subtle border color
  },
  labelformodal: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#444',
  },
  bureauFileInput: {
    minHeight: 60,
    maxHeight: 160,
    // backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: '#333',
    textAlignVertical: 'center',
    fontSize: 14,
  },

  inputformodal: {
    borderRadius: 5,
    padding: 8,
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: '#f9f9f9',
    color: 'black',
    width: width * 0.4,
    height: height * 0.04,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f2f2f2',
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
    padding: scale(4),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(6),
  },
  activeTab: {
    backgroundColor: '#2D6CDF',
  },
  disabledTab: {
    opacity: 0.6,
  },
  tabText: {
    fontSize: moderateScale(13),
    color: '#333',
    fontWeight: '500',
  },


  otpBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 20,
    margin: 5,
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },

  activeTabText: {
    color: '#FFF',
    fontWeight: '600',
  },
  disabledTabText: {
    color: '#888',
  },


  collapsibleContainer: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(8),
    marginVertical: verticalScale(8),
    width: '100%',
    alignSelf: 'center',
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  headerCollap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),

  },
  contenttt: {
    backgroundColor: '#fff',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  arrowIcon: {
    fontSize: moderateScale(14),
    color: '#555',
  },

  headerText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2b2b2b',
  },

  bureaucontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(5),
    gap: scale(10),
  },


  iconButton: {
    backgroundColor: '#e0e0e0',
    padding: scale(8),
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: moderateScale(24),
    height: moderateScale(24),
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  Approvebutton: {
    flex: 1,
    backgroundColor: '#2196F3',
    height: verticalScale(44),
    marginHorizontal: scale(6),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },

  Rejectbutton: {
    flex: 1,
    backgroundColor: '#dc3545',
    height: verticalScale(44),
    marginHorizontal: scale(6),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },


  ApprovebuttonText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  RejectbuttonText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  butcontai: {
    width: width * 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 50,
    marginLeft: 10
  },




  placeholderStyle: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
  },

  dropdown1: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 5,
    fontSize: 12,
    padding: 6,
    backgroundColor: '#f9f9f9',
    color: '#2196F3',
    width: width * 0.55,
    height: height * 0.04,
  },

  dropdownItem: {
    padding: 6,
    color: 'black',
    fontSize: 10,
    backgroundColor: '#fff',
  },
  dropdownItemText: {
    color: 'black',
    fontSize: 12,
  },
  selectedText: {
    fontSize: 12,
    color: 'black',
    fontWeight: 'bold',
  },



  coApplicantCard: {
    backgroundColor: "#f0f8ff", // Light blue background for Co-Applicants
  },

  inputMultiline: {
    height: height * 0.08, // Adjust height for multiline
    textAlignVertical: 'center', // Align text to the top
  },





  emptyText: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
    paddingHorizontal: scale(12),
    gap: scale(12), // modern spacing fix
  },
  actionButton: {
    flexGrow: 1,
    height: verticalScale(45),
    minWidth: '42%', // 👈 ensures consistent width on all screens
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(3),
  },

  approveButton: {
    backgroundColor: '#2196F3',
  },

  // 🔹 Reject Button
  rejectButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14.5),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    letterSpacing: 0.3,
  },







  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    // paddingHorizontal: 10,
    paddingVertical: 5,
  },



  switchWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.15, // keeps consistent switch width across devices
  },

  switch: {
    transform: [{ scale: 0.9 }], // keeps size consistent across devices
  },

  safeContainer: {
    flex: 1,
    backgroundColor: '#2196F3',
  },



  containermodal: {
    backgroundColor: '#FFF',
    marginVertical: 0,
    padding: moderateScale(10),
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(3),
    elevation: 2,
    width: '100%',
    height: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: '#2196F3',
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + verticalScale(5)
        : verticalScale(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  drawerIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
    marginRight: scale(10),
  },

  backArrow: {
    fontSize: moderateScale(24),
    color: '#FFF',
  },

  headerTitle: {
    color: '#FFF',
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginLeft: scale(10),
  },

  scrollContainer: {
    marginTop: verticalScale(100),
  },

  firstrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginHorizontal: scale(15),
    marginVertical: verticalScale(15),
  },

  searchBar: {
    // flex: 1,
    height: verticalScale(40),
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    width: width * 0.81,
    color: '#fff',
    // backgroundColor: '#FFF',
  },

  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    marginVertical: verticalScale(10),
    color: '#000',
  },

  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
    marginVertical: verticalScale(5),
    marginHorizontal: scale(8),
    padding: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(4),
    elevation: 3,
    width: width * 0.95,
  },

  cardTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#000',
  },

  cardText: {
    fontSize: moderateScale(13),
    color: '#333',
    marginTop: verticalScale(4),
  },

  button: {
    backgroundColor: '#0056b3',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    borderRadius: moderateScale(6),
  },

  buttonText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },

  icon: {
    width: scale(18),
    height: scale(18),
    tintColor: '#333',
  },

  Approvebutton: {
    flex: 1,
    backgroundColor: '#2196F3',
    height: verticalScale(44),
    marginHorizontal: scale(6),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(3),
    elevation: 4,
  },

  Rejectbutton: {
    flex: 1,
    backgroundColor: '#DC3545',
    height: verticalScale(44),
    marginHorizontal: scale(6),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(3),
    elevation: 4,
  },

  ApprovebuttonText: {
    color: '#FFF',
    fontSize: moderateScale(14),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  RejectbuttonText: {
    color: '#FFF',
    fontSize: moderateScale(14),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  butcontai: {
    width: width * 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(50),
    marginLeft: scale(10),
  },

  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0078d4',
    borderRadius: moderateScale(6),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    marginTop: verticalScale(8),
  },

  iconStyle: {
    width: scale(16),
    height: scale(16),
    marginRight: scale(8),
    tintColor: '#fff',
  },

  fileNameText: {
    color: '#333',
    fontSize: moderateScale(12),
    marginLeft: scale(8),
    marginTop: verticalScale(2),
  },

  inputformodaltt: {
    borderRadius: moderateScale(5),
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(10),
    fontSize: moderateScale(12),
    backgroundColor: '#F9F9F9',
    color: '#000',
    fontWeight: 'bold',
    borderColor: '#2196F3',
    borderWidth: 2,
    width: width * 0.56,
    height: height * 0.04,
    textAlign: 'center'
  },
  multilineInput: {
    height: verticalScale(80),
    textAlignVertical: 'top',
    paddingVertical: verticalScale(8),
  },




  /** 🔹 Layout Containers */
  safeContainer: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    marginTop: -8,    // keep slight overlap
    paddingTop: 20,   // keep spacing
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: verticalScale(100),
  },

  /** 🔹 Header Bar */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: '#2196F3',
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + verticalScale(5)
        : verticalScale(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginLeft: scale(10),
  },
  headerWrapper: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 18,
    paddingHorizontal: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

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
  drawerIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },

  /** 🔹 Tabs */
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f2f2f2',
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
    padding: scale(4),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(6),
  },
  activeTab: {
    backgroundColor: '#2D6CDF',
  },
  tabText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#333',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '600',
  },

  /** 🔹 Collapsible Section */
  collapsibleContainer: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(8),
    marginVertical: verticalScale(8),
    width: '95%',
    alignSelf: 'center',
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerCollap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),
  },
  headerText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2b2b2b',
  },
  arrowIcon: {
    fontSize: moderateScale(16),
    color: '#555',
  },
  contenttt: {
    backgroundColor: '#fff',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  /** 🔹 Grid Layouts */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },

  /** 🔹 Buttons */
  button: {
    backgroundColor: '#0056b3',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    borderRadius: moderateScale(6),
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  iconButton: {
    backgroundColor: '#E0E0E0',
    padding: scale(8),
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: scale(20),
    height: scale(20),
    tintColor: '#333',
    resizeMode: 'contain',
  },
  bureaucontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(5),
    gap: scale(10),
  },

  /** 🔹 Approve / Reject Section */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
    paddingHorizontal: scale(12),
    gap: scale(12),
  },
  actionButton: {
    flex: 1,
    height: verticalScale(45),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(3),
  },
  approveButton: {
    backgroundColor: '#2196F3',
  },
  rejectButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: moderateScale(14),
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /** 🔹 Save / Close Buttons */
  butcontai: {
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginVertical: verticalScale(30),
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(6),
  },
  closeButton: {
    backgroundColor: '#DC3545',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(6),
  },
  closeText: {
    color: '#FFF',
    fontWeight: '600',
  },

  /** 🔹 Input & Dropdown */
  inputformodaltt: {
    borderRadius: moderateScale(5),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    fontSize: moderateScale(12),
    fontWeight: '500',
    backgroundColor: '#F9F9F9',
    color: '#000',
    borderColor: '#2196F3',
    borderWidth: 1.5,
    width: width * 0.56,
    height: height * 0.045,
    textAlign: 'center',
  },
  multilineInput: {
    height: verticalScale(80),
    textAlignVertical: 'top',
  },
  dropdown1: {
    borderWidth: 1.5,
    borderColor: '#2196F3',
    borderRadius: moderateScale(6),
    fontSize: moderateScale(12),
    padding: scale(6),
    backgroundColor: '#F9F9F9',
    color: '#2196F3',
    width: width * 0.55,
    height: height * 0.045,
  },
  selectedText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#000',
  },

  /** 🔹 Modal Document Upload */
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: moderateScale(6),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    marginTop: verticalScale(8),
  },
  iconStyle: {
    width: scale(16),
    height: scale(16),
    marginRight: scale(8),
    tintColor: '#FFF',
  },
  fileNameText: {
    color: '#333',
    fontSize: moderateScale(12),
    marginLeft: scale(8),
  },

  /** 🔹 Empty / Placeholder Text */
  emptyText: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    color: '#2196F3',
    marginVertical: verticalScale(10),
    fontWeight: '600',
  },





  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },

  /** 🔹 Modal Container */
  modalContainer: {
    width: width * 0.93,
    maxHeight: height * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(14),
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },

  /** 🔹 Tabs (Applicant / Co-Applicant) */
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f3f4f6',
    borderRadius: moderateScale(10),
    padding: scale(5),
    marginBottom: verticalScale(10),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  activeTab: {
    backgroundColor: '#2196F3',
    elevation: 3,
  },
  disabledTab: {
    opacity: 0.6,
  },
  tabText: {
    fontSize: moderateScale(13),
    color: '#333',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledTabText: {
    color: '#aaa',
  },

  /** 🔹 Collapsible Container */
  collapsibleContainer: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(6),
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f1f1',
    ...Platform.select({
      android: { elevation: 1.5 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
    }),
  },

  /** 🔹 Collapsible Header */
  headerCollap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
  },
  headerText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#212121',
  },
  headerTouchable: {
    paddingHorizontal: scale(8),
  },
  arrowIcon: {
    fontSize: moderateScale(14),
    color: '#555',
  },

  /** 🔹 Content Body */
  contenttt: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    backgroundColor: '#fff',
  },

  /** 🔹 Bureau Section */
  bureaucontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: verticalScale(8),
    marginHorizontal: scale(10),
    gap: scale(8),
  },
  button: {
    backgroundColor: '#0078d4',
    borderRadius: moderateScale(6),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  iconButton: {
    backgroundColor: '#e9ecef',
    borderRadius: moderateScale(6),
    padding: scale(10),
  },
  icon: {
    width: scale(18),
    height: scale(18),
    tintColor: '#2196F3',
  },

  /** 🔹 Deviation Section */
  deviationTitle: {
    color: '#111',
    fontSize: moderateScale(15),
    fontWeight: '700',
    marginBottom: verticalScale(4),
    marginLeft: scale(8),
  },
  deviationText: {
    color: '#333',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  deviationIcon: {
    width: scale(20),
    height: scale(20),
    marginTop: verticalScale(5),
  },

  /** 🔹 Action Buttons (Approve / Reject) */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: verticalScale(12),
  },
  actionButton: {
    flex: 1,
    marginHorizontal: scale(8),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(10),
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '700',
  },

  /** 🔹 Buttons Container (Bottom) */
  butcontai: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(10),
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },

  /** 🔹 Row Wrapper for Inputs */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginVertical: verticalScale(6),
  },

  bureauTriggerRow: {
    flexDirection: 'row',
    // justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: verticalScale(8),
    gap: scale(10),
    marginLeft: scale(15),
    // backgroundColor: 'red'
  },

  triggerButton: {
    backgroundColor: '#2196F3',
    borderRadius: moderateScale(6),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  triggerText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },

  downloadIconButton: {
    backgroundColor: '#e9ecef',
    padding: scale(10),
    borderRadius: moderateScale(6),
  },

  downloadIcon: {
    width: scale(18),
    height: scale(18),
    tintColor: '#2196F3',
    resizeMode: 'contain',
  },

});

export default CreditWorkList;