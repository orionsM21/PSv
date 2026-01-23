import React, { useEffect, useState, useContext, useCallback, useRef, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  PermissionsAndroid,
  RefreshControl,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Switch, Button, Keyboard,
  SafeAreaView,
  StatusBar
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../api/Endpoints';

import { Dropdown } from 'react-native-element-dropdown';
import DocumentPicker from 'react-native-document-picker';
import { useNavigation } from '@react-navigation/native';
import DateOfBirthInput from '../Component/DOB.js';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import CustomToast from '../Component/Toast.js';
import RNFS from 'react-native-fs';
// import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { DrawerContext } from '../../../../Drawer/DrawerContext.js';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import Card from '../Component/Card'
import LinearGradient from 'react-native-linear-gradient';
const { width, height } = Dimensions.get('window');
// const screenWidth = Dimensions.get("window").width;

// width of one column (minus paddings)
// const COLUMN_WIDTH = screenWidth * 0.42;
// Auto-multiline rules
const ALWAYS_MULTILINE = [
  "Address",
  "Organization Name",
  "Contact Person",
  "Designation",
  "Description",
  "Remarks",
  "Email"
];

const decideMultiline = (label, value) => {
  const str = value ? String(value) : "";
  return ALWAYS_MULTILINE.includes(label) || str.length > 25;
};

const WorkList = ({ route }) => {
  const fromDashboard = route?.params?.fromDashboard;


  const navigation = useNavigation();
  const token = useSelector((state) => state.auth.token);
  const mkc = useSelector(state => state.auth.losuserDetails);
  // 
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setrefreshing] = useState(false);
  // const [setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null); // Track the selected card
  const [backupselectedCard, setbackupselectedCard] = useState(null); // Track the selected card
  const [loadinglinkFromAPI, setLoadinglinkFromAPI] = useState(false);
  // 
  const [expandedItem, setExpandedItem] = useState(null);
  const [expandedItemCo, setExpandedItemCo] = useState(null);

  const [loanAmount, setLoanAmount] = useState('');
  const [loanAmountCo, setLoanAmountCo] = useState('');
  const [CibilScore, setCibilScore] = useState('');
  const [CibilScoreCo, setCibilScoreCo] = useState('');

  const [CrifScore, setCrifScore] = useState('');
  const [CriflScoreCo, setCrifScoreCo] = useState('');
  const [remark, setremark] = useState('');
  const [remarkCo, setremarkCo] = useState('');
  const [primaryoccupation, setprimaryOcupation] = useState('');
  const [inputHeight, setInputHeight] = useState(40); // Default height for input

  const handleCrifScoreChange = (text, setState) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');

    // Allow empty value for backspace
    if (numericValue === '') {
      setState('');
      return;
    }

    const score = parseInt(numericValue, 10);

    // ✅ Allow values between 650 and 900
    if (score >= 650 && score <= 900) {
      setState(numericValue);
    }
    // ✅ Allow  values less than 650 (user might still be )
    else if (score < 650) {
      setState(numericValue);
    }
    // ❌ Prevent values greater than 900
    else if (score > 900) {
      // Do not update state (keeps last valid value)
      return;
    }
  };


  const handleContentSizeChange = (contentWidth, contentHeight) => {
    // Update height dynamically based on content size
    setInputHeight(contentHeight);
  };
  const { openDrawer } = useContext(DrawerContext);
  const [fullNamecorrection, setFullNamecorrection] = useState('');
  const [middleNamecorrection, setMiddleNamecorrection] = useState('');
  const [lastNamecorrection, setlastNamecorrection] = useState('');
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);

  const toggleCard = (index) => {
    setExpandedCardIndex(prev => (prev === index ? null : index));
  };

  const isExpanded = (index) => expandedCardIndex === index;


  const [fullNamecorrectionCo, setFullNamecorrectionCo] = useState('');
  const [middleNamecorrectionCo, setMiddleNamecorrectionCo] = useState('');
  const [lastNamecorrectionCo, setlastNamecorrectionCo] = useState('');


  const [dobcorrection, setDobcorrection] = useState('');
  const [dobcorrectionCo, setDobcorrectionCo] = useState('');

  const [dob, setDob] = useState('');
  const [codob, setcoDob] = useState('');
  const [dobError, setDobError] = useState(null);
  const [codobError, setcoDobError] = useState(null);

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

  const convertToAPIDateFormat = (dob) => {
    return moment(dob, 'DD-MM-YYYY').format('YYYY-MM-DD');
  };

  const handleAgeValidation = (dobValue,) => {
    const currentDate = moment();
    const dob = moment(dobValue);
    const age = currentDate.diff(dob, 'years'); // Calculate age in years
    // Check if age is less than 18 or greater than 60
    if (age < 21) {
      setDobError('You must be at least 21 years old.');
    } else if (age > 60) {
      setDobError('Age cannot be greater than 60.');
    }
    else {
      setDobError(''); // Clear the error if the age is valid
    }
  };

  const handleAgeValidationCo = (dobValue) => {
    const currentDate = moment();
    const codob = moment(dobValue);
    const ageco = currentDate.diff(codob, 'years'); // Calculate age

    // Adjusted Validation Logic
    if (ageco < 21) {
      setcoDobError('Co-Applicant Age must be at least 21 years old.');
    } else if (ageco > 60) {
      setcoDobError('Co-Applicant Age cannot be greater than 60.');
    } else {
      setcoDobError(''); // Clear the error if the age is valid
    }
  };

  const [panNumbercorrection, setPanNumbercorrection] = useState('');
  const [panNumbercorrectionCo, setPanNumbercorrectionCo] = useState('');

  const [LeadDropdown, setLeadDropdown] = useState([]);
  const [LeadDropdownCo, setLeadDropdownCo] = useState([]);
  const [LeadStausss, setLeadStatus] = useState([]);
  const [LeadStausssCo, setLeadStatusCo] = useState([]);
  const [SelectdLeadStatus, setSelectedLeadStatus] = useState('');
  const [SelectdLeadStatusCo, setSelectedLeadStatusCo] = useState('');
  const [backupportfolio, setbackupportfolio] = useState('');
  const [backuproduct, setbackuproduct] = useState('');
  const [backuOccupation, setbackuOccupation] = useState('');
  const [backucibilscore, setbackucibilscore] = useState('');
  const [backuloanAMount, setbackuloanAMount] = useState('');

  const [backucrifscore, setbackucrifscore] = useState('');
  const [backuremark, setbackuremark] = useState('');
  const [selectedLoanType, setSelectedLoanType] = useState(null); // Selected loan type
  const [selectedLoanTypeCo, setSelectedLoanTypeCo] = useState(null); // Selected loan type
  const [isProductDropdownDisabled, setIsProductDropdownDisabled] = useState(true);

  const [LeadSource, setLeadSource] = useState([])
  const [SelectdLeadSourceDropdown, setSelectedLeadSourceDropdown] = useState('')

  // const [productDropdown, setProductDropdown] = useState([]); // Product options
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product
  const [selectedProductCo, setSelectedProductCo] = useState(null); // Selected product

  const [selectedgenders, setSelectedgenders] = useState('');

  const [IsPanValid, setIsPanValid] = useState(false);
  const [IsPanNameValid, setIsPanNameValid] = useState(false);

  const [documentName, setDocumentName] = useState('');
  const [documentNameCo, setDocumentNameCo] = useState('');
  const [FileUri, setFileUri] = useState(null);
  const [FileType, setFileType] = useState('');
  const [ErrorMessage, setErrorMessage] = useState('');
  // 
  const [UploadSuccess, setUploadSuccess] = useState(false);
  const [errors, setErrors] = useState({}); // To track field errors
  const [productdata, setProductdata] = useState([]);
  const [productdataCo, setProductdataCo] = useState([]);
  const [leadByLeadiD, setleadByLeadiD] = useState([]);
  const [backleadByLeadiD, setbackleadByLeadiD] = useState([])

  const [selectedCoApplicant, setSelectedCoApplicant] = useState([]);
  const [SelectedLeadApplicant, setSelectedLeadApplicant] = useState([])
  console.log(SelectedLeadApplicant, 'SelectedLeadApplicantSelectedLeadApplicant')
  const [activeTabView, setActiveTabView] = useState('Applicant');
  const [CoApllicant, setCoApplicant] = useState(false);
  const [isPanVerificationFailed, setIsPanVerificationFailed] = useState(false);
  const [isPanVerificationFailedCo, setIsPanVerificationFailedCo] = useState(false);
  const [BusinessDate, setBusinessDate] = useState([]);
  const [dynamicHeight, setDynamicHeight] = useState(verticalScale(34));




  const [deviationApplicant, setdeviationApplicant] = useState([])
  const [deviationCoApplicant, setdeviationCoApplicant] = useState([])

  const [downloadCibilReportCoApplicant, setDownloadCibilReportCoApplicant] = useState(null);
  const [downloadCibilReportApplicant, setDownloadCibilReportApplicant] = useState(null);

  const handleLeadStatusChange = (item) => {
    setSelectedLeadSourceDropdown(item.value); // Set the selected gender value
    // setLeadSourceId(item.value); // Set the
    // setLeadSource(item.label)
  };
  const [branchName, setBranchName] = useState('');
  const [BranchName, setBranchname] = useState([]);
  const [SelectdbranchName, setSelectedbranchName] = useState('')


  const handleBranchNameChange = (item) => {
    setSelectedbranchName(item.value); // Set the selected gender value
    // setLeadSourceId(item.value); // Set the
    setBranchName(item.label);
  };


  useEffect(() => {
    if (selectedCoApplicant?.id) {
      fetchDeviationData(selectedCoApplicant.id, setdeviationCoApplicant);
      fetchCibilReport(selectedCoApplicant.id, setDownloadCibilReportCoApplicant);
    }

    if (SelectedLeadApplicant?.id) {
      fetchDeviationData(SelectedLeadApplicant.id, setdeviationApplicant);
      fetchCibilReport(SelectedLeadApplicant.id, setDownloadCibilReportApplicant);
    }
  }, [selectedCoApplicant?.id, SelectedLeadApplicant?.id, fetchDeviationData, fetchCibilReport]);




  useEffect(() => {
    if (selectedCoApplicant) {
      setCibilScoreCo(selectedCoApplicant?.cibilScore)
      setremarkCo(selectedCoApplicant?.loanRemark)
    }
  }, [selectedCoApplicant])

  const fetchDeviationData = useCallback(async (leadId, setDeviationState) => {
    try {
      const { data } = await axios.get(`${BASE_URL}getDeviationByLeadId/${leadId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      const formattedData = Array.isArray(data?.data)
        ? await Promise.all(
          data.data.map(async (item) => {
            let approvedByName = '';
            let rejctedByName = '';

            // Fetch approvedBy user details
            if (item.approvedBy) {
              try {
                const userResponse = await axios.get(`${BASE_URL}getUserById/${item.approvedBy}`,
                  {
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                  }
                );
                const approvedByDetails = userResponse.data?.data;
                if (approvedByDetails) {
                  approvedByName = `${approvedByDetails.firstName || ''} ${approvedByDetails.lastName || ''}`.trim();
                }
              } catch (userError) {
                console.error(`Error fetching user details for approvedBy: ${item.approvedBy}`, userError.message);
              }
            }

            if (item.rejectedBy) {
              try {
                const userResponse = await axios.get(`${BASE_URL}getUserById/${item.rejectedBy}`,
                  {
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                  }
                );
                const rejectedByDetails = userResponse.data?.data;
                if (rejectedByDetails) {
                  rejctedByName = `${rejectedByDetails.firstName || ''} ${rejectedByDetails.lastName || ''}`.trim();
                }
              } catch (userError) {
                console.error(`Error fetching user details for approvedBy: ${item.rejectedBy}`, userError.message);
              }
            }

            // Determine the value of isApproved
            let isApproved = '';
            if (item.rejectReason) {
              isApproved = 'Rejected';
            } else if (item.isApproved) {
              isApproved = 'Approved';
            }

            return {
              description: item.description || '',
              lastModifiedTime: item.lastModifiedTime || '',
              approvedBy: approvedByName || '',
              rejectedBy: rejctedByName || '',
              deviationLog: item.deviationLog || '',
              rejectReason: item.rejectReason || '',
              isApproved, // Dynamically set
            };
          })
        )
        : [];

      setDeviationState(formattedData);
    } catch (error) {
      console.error('Error fetching deviations:', error?.response?.data || error.message);
      Alert.alert('Error', error?.response?.data || error.message);
    }
  }, []);

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
      Alert.alert('Error', error?.response?.data || error.message);
    }
  }, []);


  const [file, setFile] = useState([]);

  const [fileName, setFileName] = useState('');

  const [fileco, setFileco] = useState([]);
  const [fileNameco, setFileNameco] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission
  const [isPanSubmitting, setIsPanSubmitting] = useState(false);
  const [isSubmittingCoApplicant, setIsSubmittingCoApplicant] = useState(false); // State for Submit button
  const [isVerifyingPanCoApplicant, setIsVerifyingPanCoApplicant] = useState(false);
  const [isVerifyingOtpCoApplicant, setIsVerifyingOtpCoApplicant] = useState(false);
  const [isVerifyingOtpApplicant, setIsVerifyingOtpApplicant] = useState(false);



  const [otpApplicant, setOtpApplicant] = useState(['', '', '', '']);  // 4 empty strings for Applicant OTP
  const [otpCoApplicant, setOtpCoApplicant] = useState(['', '', '', '']);  // 4 empty strings for Co-Applicant OTP


  // 
  const [visible, setVisible] = useState(false);
  const [visibleCo, setVisibleCo] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isOtpVerifiedCo, setIsOtpVerifiedCo] = useState(false);
  const [loading, setLoading] = useState(false);

  const [backupisSettlement, setbackupIsSettlement] = useState(true);
  const [isSettlement, setIsSettlement] = useState(false);
  const [isSettlementCo, setIsSettlementCo] = useState(false);

  const [backupismedicaldone, setbackupismedicaldone] = useState(true);
  const [ismedicaldone, setIsmedicaldone] = useState(false);
  const [ismedicaldoneCo, setIsmedicaldoneCo] = useState(false);
  useEffect(() => {
    // Ensure that the description check works correctly

    if (deviationApplicant && deviationApplicant.description === "Written-Off") {
      setIsSettlement(true);
      setIsmedicaldone(true);
    } else {
      setIsSettlement(false);
      setIsmedicaldone(false);

    }
  }, [deviationApplicant]); // Depend on deviationApplicant

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
      const response = await axios.get(
        `${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincodeId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Ensure token is included correctly
          },
        }
      );
      setState({ data: response.data.data }); // Set state with the fetched data
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error?.response?.data || error?.message);
    }
  }, []);


  // Consolidating the `useEffect` logic to handle both applicants in a single place
  useEffect(() => {
    // Check for pincodeId for both applicants and fetch the data
    if (selectedCoApplicant?.pincodeId) {
      fetchApplicantDataByPincode(selectedCoApplicant.pincodeId, setcoFindApplicantByCategoryCodView);
    }
    if (SelectedLeadApplicant?.pincodeId) {
      fetchApplicantDataByPincode(SelectedLeadApplicant.pincodeId, setFindApplicantByCategoryCodView);
    }
  }, [SelectedLeadApplicant?.pincodeId, selectedCoApplicant?.pincodeId, fetchApplicantDataByPincode]);


  const backuptoggleSwitch = () => {
    setbackupIsSettlement(prevState => !prevState);
  };

  const toggleSwitch = () => {
    setIsSettlement(prevState => !prevState);
  };

  const toggleSwitchCo = () => {
    setIsSettlementCo((previousState) => !previousState); // Toggle the switch
  };


  const backuptoggleSwitchmeddone = () => {
    setbackupismedicaldone(prevState => !prevState);
  };

  const toggleSwitchmeddone = () => {
    setIsmedicaldone(prevState => !prevState);
  };

  const toggleSwitchComeddone = () => {
    setIsmedicaldoneCo((previousState) => !previousState); // Toggle the switch
  };


  const [isApplicantTabDisabled, setIsApplicantTabDisabled] = useState(false);
  const [isApplicantFormDisabled, setIsApplicantFormDisabled] = useState(false);
  const [isApplicantTabLocked, setIsApplicantTabLocked] = useState(false);
  const [coApplicantFields, setCoApplicantFields] = useState({
    loanAmount: '',
    primaryOccupation: '',
    product: '',
    portfolio: '',
  });

  // const [expandedItem, setExpandedItem] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedItem(expandedItem === sectionId ? null : sectionId);
  };

  const toggleSectionCo = (sectionId) => {
    setExpandedItemCo(expandedItemCo === sectionId ? null : sectionId);
  };



  const handlesendOTP = () => {
    // Ensure both OTP APIs are called only if mobileNo is available for both Applicant and Co-Applicant
    if (!SelectedLeadApplicant?.mobileNo || !selectedCoApplicant?.mobileNo) {
      // 
      Alert.alert('Error', 'Both Applicant and Co-Applicant must have a mobile number to send OTP.');
      return; // Prevent further execution if mobile numbers are missing
    }

    setIsLoading(true);  // Show loading before making API calls

    // Call the OTP sending functions
    // SendOtp();
    // SendOtpCo();
    // setVisible(true);
  };





  // 
  const onRefresh = useCallback(async () => {
    setrefreshing(true);
    try {
      await getWorklist(); // Wait for the worklist to be fetched
    } catch (error) {
      console.error('Failed to refresh worklist:', error);
    } finally {
      setrefreshing(false); // Ensure refreshing is turned off
    }
  }, [getWorklist]);

  // Toggle drawer visibility
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const toggleExpand = itemId => {
    setExpandedItem(prevState => (prevState === itemId ? null : itemId));
  };

  const toggleExpandCo = itemId => {
    setExpandedItemCo(prevState => (prevState === itemId ? null : itemId));
  };
  useEffect(() => {
    if (fromDashboard && !modalVisible) {
      setSelectedCard(fromDashboard);
      setModalVisible(true);
    }
  }, [fromDashboard]);
  const handleCardPress = useCallback((item) => {

    setSelectedCard(item); // Set the selected card
    setModalVisible(true); // Show the modal
    // setVisible(true); // Hide the modal

  }, []);

  const handleProductChange = item => {
    setSelectedProduct(item); // Set the selected product value
  };

  const handleProductChangeCo = item => {
    setSelectedProductCo(item.value); // Set the selected product value
  };

  const handleLeadStatus = item => {
    setSelectedLeadStatus(item); // Set the selected product value
  };

  const handleLeadStatusCo = item => {
    setSelectedLeadStatusCo(item.value); // Set the selected product value
  };

  const resetFields = () => {
    setLoanAmount('');
    setSelectedgenders('');
    setSelectedProduct('');
    setSelectedLoanType('');
    setSelectedLoanTypeCo('');
    setCibilScore('');
    setSelectedLeadStatus('');
    setremark('');
    setDocumentName('');
    setDocumentNameCo('');
    setFileType('');
    setFileUri('');

    setFullNamecorrection('');
    setlastNamecorrection(''); // Clear
    setMiddleNamecorrection(''); // Clear last
    setPanNumbercorrection('');
    setFile([]); // Clear
    setFileName(''); // Clear
    setFileco([]);
    setFileNameco(''); // Clear

    // setUploadSuccess(false);
  };

  const validateFields = () => {
    const missingFields = [];

    if (isApplicantTabDisabled) {

    } else {
      // Validate fields when applicant tab is enabled
      if (!loanAmount) {
        missingFields.push('Loan Amount is required.');
      } else if (loanAmount < 100000) {
        missingFields.push('The Loan Amount should be >= ₹1,00,000');
      }
      if (!CrifScore) {
        missingFields.push('Crif Score Mandatory ')
      }
    }

    return missingFields.length ? missingFields : true;
  };


  const validateFieldsCoAPplicant = () => {
    const missingFields = [];

    if (!CriflScoreCo) {
      missingFields.push('Crif Score Mandatory ')
    }

    return missingFields.length ? missingFields : true;
  };

  const validateFieldsPanCorrection = () => {
    const missingFields = [];

    const isEmpty = (v) => !v || String(v).trim() === "";
    const isOrganization =
      SelectedLeadApplicant?.applicantCategoryCode === "Organization";
    if (isEmpty(panNumbercorrection)) missingFields.push("PAN Number is required.");
    if (isEmpty(fullNamecorrection)) missingFields.push("Full Name is required.");
    // if (isEmpty(lastNamecorrection)) missingFields.push("Last Name is required.");
    if (!isOrganization && isEmpty(lastNamecorrection))
      missingFields.push("Last Name is required.");

    if (isEmpty(dob)) missingFields.push("Date of Birth is required.");


    return missingFields.length ? missingFields : true;
  };

  const validateFieldsPanCorrectionCo = () => {
    const missingFields = [];

    const isEmpty = (v) => !v || String(v).trim() === "";
    const isOrganization =
      selectedCoApplicant?.applicantCategoryCode === "Organization";
    if (isEmpty(panNumbercorrectionCo)) missingFields.push("PAN Number is required.");
    if (isEmpty(fullNamecorrectionCo)) missingFields.push("Full Name is required.");
    // if (isEmpty(lastNamecorrectionCo)) missingFields.push("Last Name is required.");
    if (!isOrganization && isEmpty(lastNamecorrection))
      missingFields.push("Last Name is required.");

    if (isEmpty(codob)) missingFields.push("Date of Birth is required.");


    return missingFields.length ? missingFields : true;
  };

  const handleClose = () => {
    setActiveTabView('Applicant');
    setSelectedCard(null);
    setleadByLeadiD([]);
    setProductdata([])
    setModalVisible(false); // Hide the modal
    // 🧹 Reset param so it doesn't trigger again
    navigation.setParams({ fromDashboard: null });
    resetFields();
    setSelectedCoApplicant([]);
    setSelectedLeadApplicant([])
    setErrors([]);
    getWorklist();
    getAllLeads();
    setIsSettlement(false);
    setIsSettlementCo(false);
    setIsmedicaldone(false);
    setIsmedicaldoneCo(false);
    setCrifScore(false);
    setCrifScoreCo(false);
    setIsApplicantTabDisabled(false);
    setIsApplicantFormDisabled(false);
    setIsApplicantTabLocked(false);
    setbackupselectedCard(null);
    setCoApplicant(false);
    setCoApplicantFields({
      loanAmount: '',
      primaryOccupation: '',
      product: '',
      portfolio: '',
    });
    setbackuloanAMount('')
    setLoadinglinkFromAPI(false);
  };
  const handlePanFailedSubmit = async () => {

    const residenceValidationResult = validateFieldsPanCorrection();
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

      setIsPanSubmitting(true); // Set loading state for PAN verification
      setIsLoadingsentotp(true); // Set loading state for
      try {
        await UpdatePanverification(); // Call the API for PAN verification
        // Alert.alert('Success', 'PAN verification completed successfully.');
      } catch (error) {
        console.error('Error verifying PAN:', error);
        Alert.alert('Error', 'Failed to verify PAN. Please try again.');
      }
    }
  };

  const handlePanFailedSubmitCoApplicant = async () => {
    const residenceValidationResult = validateFieldsPanCorrectionCo();
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
      setIsVerifyingPanCoApplicant(true); // Set loading state for  button
      setIsLoadingsentotp(true); // Set loading state for
      try {
        await UpdatePanverificationCoApplicant(); //  API call
        // Alert.alert('Success', 'PAN verification completed successfully.');
      } catch (error) {
        console.error('Error verifying PAN:', error);
        Alert.alert('Error', 'Failed to verify PAN. Please try again.');
      } finally {
        setIsVerifyingPanCoApplicant(false); // Reset loading state
      }
    }
  };

  const handleSubmit = async () => {
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

      setIsSubmitting(true); // Set loading state to true
      setIsLoadingsentotp(true);
      try {
        // Step 1: Send OTP
        await SendOtp();
        // Show OTP Modal
      } catch (error) {
        console.error('Error sending OTP:', error);
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      } finally {
        setIsSubmitting(false); // Reset loading state
      }
    }
  };


  const [isSubmittingCoApplicantsendotp, setIsSubmittingCoApplicantsendotp] = useState(false);
  const [isLoadingsendotp, setIsLoadingsentotp] = useState(false); // Loader state for screen-level loader

  const handleSubmitCoApplicant = async () => {
    const residenceValidationResult = validateFieldsCoAPplicant();
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
      setIsSubmittingCoApplicant(true); // Set loading state for Submit button
      setIsSubmittingCoApplicantsendotp(true); // Set loading state for Submit button
      setIsLoadingsentotp(true); // Show loader on screen
      try {
        await SendOtpCo(); // Send OTP API call
        // setVisibleCo(true); // Show OTP Modal
        // Alert.alert('Success', 'OTP sent successfully.');
      } catch (error) {
        console.error('Error sending OTP:', error);
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      } finally {
        setIsSubmittingCoApplicant(false); // Reset loading state
      }

    }
  };
  const isOtpComplete = otpApplicant.every(val => val !== '');
  const isOtpCompleteCo = otpCoApplicant.every(val => val !== '');

  const handleverifyotp = async () => {
    setIsVerifyingOtpApplicant(true); // Set loading state for Verify button
    setIsLoadingsentotp(true); // Show loader on screen
    try {
      // Step 2: Verify OTP
      await verifyOtp();

      // setCoApplicantFields({
      //   loanAmount: loanAmount,
      //   primaryOccupation: SelectdLeadStatus.label,
      //   product: selectedProduct.label,
      //   portfolio: selectedLoanType.label,
      // });

    } catch (error) {
      console.error('Error in API chain:', error);
      Alert.alert('Error', 'An error occurred during the process. Please try again.');
    } finally {
      setIsVerifyingOtpApplicant(false); // Reset loading state
    }
  };


  const handleverifyotpCoApplicant = async () => {
    setIsVerifyingOtpCoApplicant(true); // Set loading state for Verify button
    try {
      // Step 2: Verify OTP
      await verifyOtpCo();

      Alert.alert('Success', 'OTP verified and process completed successfully.');
    } catch (error) {
      console.error('Error in API chain:', error);
      Alert.alert('Error', 'An error occurred during the process. Please try again.');
    } finally {
      setIsVerifyingOtpCoApplicant(false); // Reset loading state
    }
  };




  useEffect(() => {
    // Create an async function to handle all the API calls
    const fetchData = async () => {
      try {
        // Run all API calls in parallel
        await Promise.all([
          getAllLoanType(),
          // getAllLeadStatus(),
          getWorklist(),
          getAllLeads(),
          getBranchName(),
          getAllLeadSource()
        ]);
      } catch (error) {
        console.error('Error during API calls:', error);
        Alert.alert('Error', 'Failed to fetch data');
      }
    };

    fetchData();
  }, [getWorklist]); // Ensure dependencies are handled correctly


  const getBranchName = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getAllBranch`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      // setAllLoadSource(response.data.data.content);

      const fetchedLeads = response.data.data.content;
      const options = fetchedLeads.map(lead => ({
        label: lead.branchName, // For display
        value: lead.branchId,        // For identification
      }));
      // 
      setBranchname(options); // Set dropdown options
      // setAllLeadStatus(fetchedLeads);
    } catch (error) {
      console.error('Error fetching getAllBranch:', error);
      Alert.alert('Error', 'Failed to fetch getAllBranch');
    }
  }

  const getAllLeadSource = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getAllLeadSources`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      // setAllLoadSource(response.data.data.content);
      // 
      const fetchedLeads = response.data.data.content;
      const options = fetchedLeads.map(lead => ({
        label: lead.leadSourceName, // For display
        value: lead.leadSourceId,        // For identification
      }));
      // 
      setLeadSource(options); // Set dropdown options
      // setAllLeadStatus(fetchedLeads);
    } catch (error) {
      console.error('Error fetching lead source:', error);
      Alert.alert('Error', 'Failed to fetch lead source');
    }
  }

  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to upload documents.',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // 
      } else {

      }
    } catch (err) {
      console.warn(err);
    }
  };


  const onClose = () => {
    setVisible(false); // Hide the modal
    setOtpApplicant(['', '', '', '']); // Reset Applicant OTP
  };

  const onCloseCoApplicant = () => {
    setVisibleCo(false); // Hide the modal
    setOtpCoApplicant(['', '', '', '']); // Reset Co-Applicant OTP
  };

  const retryRequest = async (fn, retries = 3, delay = 1000) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();  // Try executing the API function
      } catch (error) {
        attempt += 1;
        if (attempt >= retries) {
          throw error; // If all retries fail, throw the error
        }
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
      }
    }
  };
  // const [isResendingOtp, setIsResendingOtp] = useState(false);
  // const handleRetryOtp = async () => {
  //   try {
  //     setIsResendingOtp(true);
  //     // 🔹 Call your resend OTP API
  //     await SendOtp(); // e.g., await resendOtp(applicantId)
  //     // Alert.alert("Success", "A new OTP has been sent!");
  //   } catch (err) {
  //     Alert.alert("Error", "Failed to resend OTP. Try again.");
  //   } finally {
  //     setIsResendingOtp(false);
  //   }
  // };
  // const [isResendingOtpCo, setIsResendingOtpCo] = useState(false);
  // const handleRetryOtpCo = async () => {
  //   try {
  //     setIsResendingOtpCo(true);
  //     // 🔹 Call your resend OTP API
  //     await SendOtpCo(); // e.g., await resendOtp(applicantId)
  //     // Alert.alert("Success", "A new OTP has been sent!");
  //   } catch (err) {
  //     Alert.alert("Error", "Failed to resend OTP. Try again.");
  //   } finally {
  //     setIsResendingOtpCo(false);
  //   }
  // };

  // 🔹 States
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [timer, setTimer] = useState(0);

  const [isResendingOtpCo, setIsResendingOtpCo] = useState(false);
  const [timerCo, setTimerCo] = useState(0);

  // 🔹 Handle Applicant Retry
  const handleRetryOtp = async () => {
    if (timer > 0) return; // prevent double-tap during countdown
    try {
      setIsResendingOtp(true);
      await SendOtp(); // ✅ Call your existing API
      setTimer(90); // ⏳ Start 30s countdown
    } catch (err) {
      Alert.alert("Error", "Failed to resend OTP. Try again.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  // 🔹 Handle Co-Applicant Retry
  const handleRetryOtpCo = async () => {
    if (timerCo > 0) return;
    try {
      setIsResendingOtpCo(true);
      await SendOtpCo(); // ✅ Your existing Co-Applicant API
      setTimerCo(90);
    } catch (err) {
      Alert.alert("Error", "Failed to resend OTP. Try again.");
    } finally {
      setIsResendingOtpCo(false);
    }
  };

  // 🔹 Countdown Effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    let interval;
    if (timerCo > 0) {
      interval = setInterval(() => setTimerCo((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerCo]);


  // OTP for Applicant
  const SendOtp = async () => {
    if (!SelectedLeadApplicant) {
      // 
      return;
    }

    const otpPayload = {
      mobileNo: SelectedLeadApplicant.mobileNo,  // Using mobile number from Applicant
    };

    try {
      // Retry logic for SendOtp API
      const otpResponse = await retryRequest(() => axios.post(
        `${BASE_URL}sendOtpToMobile`,
        otpPayload, // The request body
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      ));

      if (otpResponse.data.msgKey === 'Success') {
        // 
        // SendOtpCo();
        // setVisible(true);
        setVisible(true);
        setIsLoadingsentotp(false);
      } else {
        Alert.alert('Error', 'OTP verification failed for Applicant.');
      }
    } catch (error) {
      console.error('Error in API sequence for Applicant:', error);
      Alert.alert('Error', 'An error occurred while processing your request for Applicant.');
    } finally {
      setIsLoading(false);  // Hide loader when all processes are done (success or failure)
    }
  };
  // OTP for Co-Applicant
  const SendOtpCo = async () => {
    if (!selectedCoApplicant) {
      // 
      return;
    }

    const otpPayload = {
      mobileNo: selectedCoApplicant.mobileNo,  // Using mobile number from Co-Applicant
    };

    try {
      // Retry logic for SendOtpCo API
      const otpResponse = await retryRequest(() => axios.post(`${BASE_URL}sendOtpToMobile`, otpPayload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      ));
      if (otpResponse.data.msgKey === 'Success') {
        // 
        setVisibleCo(true);
        setIsLoadingsentotp(false);
      } else {
        Alert.alert('Error', 'OTP verification failed for Co-Applicant.');
      }
    } catch (error) {
      console.error('Error in API sequence for Co-Applicant:', error);
      Alert.alert('Error', 'An error occurred while processing your request for Co-Applicant.');
    } finally {
      setIsLoading(false);  // Hide loader when all processes are done (success or failure)
      setIsLoadingsentotp(false); // Hide loader when
    }
  };

  const verifyOtp = async () => {
    setLoadinglinkFromAPI(true);
    const otpPayload = {
      mobileNumber: SelectedLeadApplicant.mobileNo,
      otp: otpApplicant.join(''),
      leadId: SelectedLeadApplicant?.id
    };
    try {
      const otpResponse = await axios.post(
        `${BASE_URL}verifyOtpToMobile`,
        otpPayload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      if (otpResponse.data.msgKey === "Success") {

        setVisible(false);
        setIsOtpVerified(true); // Set OTP verified to true
        getpanDetails();
        // Set OTP loaded toOTP
        // UpdateWorkList();
      } else {
        Alert.alert('Error', 'OTP verification failed.');
        setLoadinglinkFromAPI(false);
      }
    } catch (error) {
      console.error('Error in API sequence:', error);
      Alert.alert('Error', 'An error occurred while processing your request.');
      setLoadinglinkFromAPI(false);
    }
  };

  const verifyOtpCo = async () => {
    setLoadinglinkFromAPI(true);
    const otpPayload = {
      mobileNumber: selectedCoApplicant.mobileNo,
      otp: otpCoApplicant.join(''),  // Join array elements into a single string without commas
      leadId: selectedCoApplicant?.id
    };
    try {
      const otpResponse = await axios.post(
        `${BASE_URL}verifyOtpToMobile`,
        otpPayload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      if (otpResponse.data.msgKey === "Success") {

        setIsOtpVerifiedCo(true); // Set OTP verified to true
        getpanDetailsCoApplicant();
        setVisibleCo(false); // Set OTP visible to false
        // setIsLoadingsentotp(false); // Set OTP
      } else {
        Alert.alert('Error', 'OTP verification failed.');
        setIsLoadingsentotp(false);
        setLoadinglinkFromAPI(false);
      }
    } catch (error) {
      console.error('Error in API sequence:', error);
      Alert.alert('Error', 'An error occurred while processing your request.');
      setLoadinglinkFromAPI(false);
    }
  };

  const UpdateWorkList = async () => {
    try {
      const payload = {
        id: selectedCard.id,
        loanAmount: loanAmount,
        product: selectedProduct?.value || SelectedLeadApplicant?.productId,
        remarkLeadLoan: remark,
        primaryOccupation: SelectdLeadStatus.label,
        portfolio: selectedLoanType?.value || SelectedLeadApplicant?.portfolioId,
        isMobileVerified: selectedCard.isMobileVerified,
        cibilScore: CibilScore || 0,
        leadStatusId: selectedCard.leadStatus.leadStatusId,
        settledOrWrittenOff: isSettlement ? true : false,
        crifScore: CrifScore ? CrifScore : '',
        medicalCheck: shouldShowLeadSwitch ? ismedicaldone ? true : false : null,
        leadSourceId: SelectdLeadSourceDropdown,
        branchId: SelectdbranchName,
        updatedBy: mkc.userName,
      };

      // Use POST or PUT instead of GET to send payload
      const response = await axios.put(
        `${BASE_URL}updateWorklist/${selectedCard.id}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      if (response.data.msgKey === 'Success') {
        // setModalVisible(false);
        // CIBILFILEUpload();
        BRE();

      } else {
        setIsLoadingsentotp(false);
        setIsPanSubmitting(false);
        setLoadinglinkFromAPI(false);
      }


    } catch (error) {
      console.error('Error updating worklist:', error);
      Alert.alert('Error', 'Failed to update worklist');
      setLoadinglinkFromAPI(false);
    }
  };

  const UpdateWorkListCoAPplicant = async () => {
    try {
      // Ensure selectedProduct and selectedLoanType are not null or undefined
      const productValue = selectedProduct && selectedProduct.value
        ? selectedProduct.value
        : (coApplicantFields.product === 'Home Loan' ? 2 :
          (coApplicantFields.product === 'Loan Against Property' ? 5 : coApplicantFields.product));

      const portfolioValue = selectedLoanType && selectedLoanType.value ? selectedLoanType.value : 1;

      const payload = {
        id: selectedCoApplicant.id,
        loanAmount: coApplicantFields.loanAmount,

        // Use the validated values for product and portfolio
        product: productValue,
        remarkLeadLoan: remarkCo,
        primaryOccupation: SelectdLeadStatusCo.label,

        // Use the validated portfolio value
        portfolio: portfolioValue,

        isMobileVerified: selectedCard && selectedCard.isMobileVerified,  // Ensure selectedCard exists
        cibilScore: CibilScoreCo ? CibilScoreCo : 0,

        leadStatusId: selectedCard && selectedCard.leadStatus ? selectedCard.leadStatus.leadStatusId : null, // Ensure leadStatus exists
        settledOrWrittenOff: isSettlementCo ? true : false,
        crifScore: CriflScoreCo ? CriflScoreCo : '',
        medicalCheck: shouldShowSwitch ? ismedicaldoneCo ? true : false : null,
      };



      // Use POST or PUT instead of GET to send payload
      const response = await axios.put(
        `${BASE_URL}updateWorklist/${selectedCoApplicant.id}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );

      if (response.data.msgKey === "Success") {
        // setModalVisible(false);
        // CIBILFILEUploadCo();
        BRECoApplicant();

      } else {
        setIsLoadingsentotp(false);
        setLoadinglinkFromAPI(false);
      }


    } catch (error) {
      console.error('Error updating worklist:', error);
      Alert.alert('Error', 'Failed to update worklist');
      setLoadinglinkFromAPI(false);
    }
  };


  const BRE = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}bussinessRuleEngine/${SelectedLeadApplicant.id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Use template literals for consistency
          },
        }
      );

      // Check for the exact message in the response
      if (response.data.msgKey === 'Success') {
        setCoApplicant(true);
        // setModalVisible(false);
        CIBILFILEUpload();
        setIsLoadingsentotp(false);
        setLoadinglinkFromAPI(false);
        const toastMessage = `${response.data.message} of Applicant!!`;
        showToast(toastMessage); // Show the concatenated message in the toast

        // Wait for the toast to be visible before switching tab or navigating
        setTimeout(() => {
          if (selectedCoApplicant && Object.keys(selectedCoApplicant).length > 0) {
            setIsLoadingsentotp(false);
            setActiveTabView('Co-Applicant'); // Switch to Co-Applicant tab
          } else {
            resetFields();
            getWorklist(); // Refresh the worklist
            navigation.replace('Success'); // Navigate to Success screen
          }
        }, 100); // Delay by 3 seconds (adjust as needed)
        // navigation.replace('Success');  // This will replace the current screen with the Success screen
        // resetFields();
        getWorklist(); // Refresh the worklist
        setIsPanSubmitting(false);
        setIsApplicantTabDisabled(true); // Disable the Applicant tab
        getWorklist(); // Refresh the worklist
      } else {
        // Handle unexpected messages
        setIsPanSubmitting(false);
        setIsLoadingsentotp(false);
        setLoadinglinkFromAPI(false);
        console.warn('Unexpected response message:', response.data.message);
        Alert.alert('Error', 'Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error fetching lead status:', error);
      Alert.alert('Error', 'Failed to run the business rule engine.');
      setLoadinglinkFromAPI(false);
    }
  };


  const BRECoApplicant = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}bussinessRuleEngine/${selectedCoApplicant.id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          },
        }
      );

      if (response.data.msgKey === "Success") {

        CIBILFILEUploadCo();
        setIsLoadingsentotp(false);
        setLoadinglinkFromAPI(false);
        navigation.replace('Success');  // This will replace the current screen with the Success screen
        resetFields();
        getWorklist(); // Refresh the worklist
      } else {
        console.warn('Unexpected response message:', response.data.message);
        Alert.alert('Error', 'Unexpected response from the server.');
        setLoadinglinkFromAPI(false);
      }
    } catch (error) {
      console.error('Error fetching lead status:', error);
      Alert.alert('Error', 'Failed to run the business rule engine.');
      setLoadinglinkFromAPI(false);
    }
  };

  const getWorklist = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}getWorklist/${mkc.userId}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching worklist:', error);
    } finally {
      setLoading(false);
    }
  }, [mkc.userId]);






  useFocusEffect(
    useCallback(() => {
      getWorklist();
      getAllLoanType();

      getAllLeads();
    }, [])
  );

  useEffect(() => {
    getProduct();
  }, [SelectedLeadApplicant])
  const getProduct = useCallback(async () => {

    try {
      // Fetching products from the API
      const response = await axios.get(`${BASE_URL}getAllProducts`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );


      // Check if the response was successful
      const responseData = response.data;
      const product = responseData.data?.content || [];
      if (Array.isArray(product) && product.length > 0) {
        const filteredproducts = product.filter(item => item.active === "true" && item.productCode !== "JLG");
        const transformedProducts = filteredproducts.map(product => ({
          label: product.productName, // For display
          value: product.productId,    // For selection
        }));
        setProductdata(transformedProducts);

        setProductdataCo(transformedProducts)
      } else {
        console.error('No product found or content is not an array');
        Alert.alert('Error', 'No portfolio data found');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch products');
    } finally {
      // setLoading(false); // Set loading to false when request finishes
    }
  }, []);

  useEffect(() => {
    if (SelectedLeadApplicant?.productName && productdata.length > 0) {
      const matchedProduct = productdata.find(
        item => item.label === SelectedLeadApplicant.productName
      );

      if (matchedProduct) {
        setSelectedProduct(matchedProduct); // set dropdown value
      }
    }
  }, [SelectedLeadApplicant, productdata]);

  useEffect(() => {
    if (selectedCoApplicant?.productName && productdata.length > 0) {
      const matchedProduct = productdata.find(
        item => item.label === selectedCoApplicant.productName
      );

      if (matchedProduct) {
        setSelectedProductCo(matchedProduct); // set dropdown value
      }
    }
  }, [selectedCoApplicant, productdata]);

  useEffect(() => {
    getAllLeadStatus();
  }, [SelectedLeadApplicant])

  useEffect(() => {
    getAllLeadStatusCo();
  }, [selectedCoApplicant])

  const getAllLeadStatus = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getByType`,
        {
          params: { lookupType: String(SelectedLeadApplicant?.applicantCategoryCode) }, // ✅ query parameter
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      const fetchedLeads = response.data.data;

      const options = fetchedLeads.map(lead => ({
        label: lead.lookupName, // For display
        value: lead.lookupId, // For identification
      }));

      if (SelectedLeadApplicant?.primaryOccupation) {
        const matchedOption = options.find(
          opt => opt.label === SelectedLeadApplicant.primaryOccupation
        );
        if (matchedOption) {
          setSelectedLeadStatus(matchedOption); // <-- preselect
        }
      }
      // 
      setLeadStatus(options); // Set loan type dropdown options
      // setLeadStatusCo(options); // Set loan type dropdown options)

    } catch (error) {
      console.error('Error fetching lead status:', error);
      Alert.alert('Error', 'Failed to fetch lead status');
    }
  };

  const getAllLeadStatusCo = async () => {
    try {
      // const response = await axios.get(
      //   `getByType?lookupType=PrimaryOccupation`,
      //   {
      //     headers: {
      //       Accept: 'application/json',
      //       'Content-Type': 'application/json',
      //       Authorization: 'Bearer ' + token, // Add the token to the Authorization header
      //     }
      //   }
      // );

      const response = await axios.get(
        `${BASE_URL}getByType`,
        {
          params: { lookupType: String(selectedCoApplicant?.applicantCategoryCode) }, // ✅ query parameter
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      const fetchedLeads = response.data.data;

      const options = fetchedLeads.map(lead => ({
        label: lead.lookupName, // For display
        value: lead.lookupId, // For identification
      }));

      if (selectedCoApplicant?.primaryOccupation) {
        const matchedOption = options.find(
          opt => opt.label === selectedCoApplicant.primaryOccupation
        );
        if (matchedOption) {
          setSelectedLeadStatusCo(matchedOption); // <-- preselect
        }
      }
      // 
      // setLeadStatus(options); // Set loan type dropdown options
      setLeadStatusCo(options); // Set loan type dropdown options)
      // 
    } catch (error) {
      console.error('Error fetching lead status:', error);
      Alert.alert('Error', 'Failed to fetch lead status');
    }
  };

  const getAllLoanType = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getAllPortfolios`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      const fetchedLeads = response.data.data.content;

      const options = fetchedLeads.map(lead => ({
        label: lead.portfolioDescription, // For display
        value: lead.portfolioId, // For identification
        // products: lead.product, // Store associated products
      }));
      setLeadDropdown(options); // Set loan type dropdown options
      setLeadDropdownCo(options); // Set loan type dropdown
    } catch (error) {
      console.error('Error fetching LoanType:', error);
      Alert.alert('Error', 'Failed to fetch LoanType');
    }
  };

  const UpdatePanverification = async () => {
    setLoadinglinkFromAPI(true);
    // Validate the PAN format before making the API call
    if (!validatePAN(panNumbercorrection)) {
      Alert.alert('Invalid PAN', 'Please enter a valid PAN number.');
      setLoadinglinkFromAPI(false);
      return; // Exit early if PAN is invalid
    }

    try {
      // Ensure the date of birth is correctly formatted, e.g., YYYY-MM-DD
      const formattedDob = dob.split('T')[0];
      const isOrganization =
        SelectedLeadApplicant?.applicantCategoryCode === "Organization";

      // Create the payload for the request
      const payload = {
        // firstName: fullNamecorrection,
        ...(isOrganization
          ? { organizationName: fullNamecorrection }
          : { firstName: fullNamecorrection }),
        middleName: middleNamecorrection,
        lastName: lastNamecorrection,
        dateOfBirth: convertToAPIDateFormat(dob), // Use formatted date of birth
        pan: panNumbercorrection,
      };




      // Send the PUT request to update the PAN verification
      const response = await axios.put(
        `${BASE_URL}updateLeadPandata/${SelectedLeadApplicant.id}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        } // Sending the payload as the request body
      );

      // Check the response and show appropriate feedback
      if (response.data.msgKey === 'Success') {
        Alert.alert(response.data.msgKey, response.data.message);
        await getpanDetails(); // Refresh the PAN details
      } else {
        Alert.alert(response.data.msgKey, response.data.message);
        setIsLoadingsentotp(true);
        setIsPanSubmitting(false);
        setLoadinglinkFromAPI(false);
      }
    } catch (error) {
      console.error('Error updating PAN verification:', error);
      Alert.alert('Error', 'Failed to update PAN verification.');
      setLoadinglinkFromAPI(false);
    }
  };

  const UpdatePanverificationCoApplicant = async () => {
    // Validate the PAN format before making the API call
    setLoadinglinkFromAPI(true);
    if (!validatePAN(panNumbercorrectionCo)) {
      Alert.alert('Invalid PAN', 'Please enter a valid PAN number.');
      setLoadinglinkFromAPI(false);
      return; // Exit early if PAN is invalid
    }

    try {
      // Ensure the date of birth is correctly formatted, e.g., YYYY-MM-DD
      const formattedDob = codob.split('T')[0];

      // // Create the payload for the request
      // const payload = {
      //   firstName: fullNamecorrectionCo,
      const isOrganization =
        selectedCoApplicant?.applicantCategoryCode === "Organization";

      const payload = {
        ...(isOrganization
          ? { organizationName: fullNamecorrectionCo }
          : { firstName: fullNamecorrectionCo }),
        middleName: middleNamecorrectionCo,
        lastName: lastNamecorrectionCo,
        dateOfBirth: convertToAPIDateFormat(codob), // Use formatted date of birth
        pan: panNumbercorrectionCo,
      };

      // Send the PUT request to update the PAN verification
      const response = await axios.put(
        `${BASE_URL}updateLeadPandata/${selectedCoApplicant.id}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        } // Sending the payload as the request body
      );

      // Check the response and show appropriate feedback
      if (response.data.msgKey === 'Success') {
        Alert.alert(response.data.msgKey, response.data.message);
        await getpanDetailsCoApplicant(); // Refresh the PAN details
      } else {
        Alert.alert(response.data.msgKey, response.data.message);
        setIsLoadingsentotp(false);
        setLoadinglinkFromAPI(false);
      }
    } catch (error) {
      console.error('Error updating PAN verification:', error);
      Alert.alert('Error', 'Failed to update PAN verification.');
      setLoadinglinkFromAPI(false)
    }
  };

  const getpanDetails = async () => {
    try {
      // Pass leadId as a query parameter or use it as needed in the API call
      const response = await axios.get(
        `${BASE_URL}panDetailsNew/${SelectedLeadApplicant.id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }

      );
      if (response.data.msgKey === "Success") {
        // Alert.alert('Success', 'PAN verification  successfully!');
        getWorklist(); // Refresh the worklist
        UpdateWorkList();
      } else {
        Alert.alert(response.data.msgKey, response.data.message);
        // setModalVisible(false);
        // resetFields();
        setIsPanVerificationFailed(true); // Mark failure
        setIsLoadingsentotp(false); //
        setIsPanSubmitting(false);
        setLoadinglinkFromAPI(false);
      }
      // Assuming the response has a 'data' field containing the lead status
      // 
    } catch (error) {
      console.error('Error', 'Failed to PAN verification.', error);
      Alert.alert('Error', 'Failed to PAN verification.');
      setLoadinglinkFromAPI(false);
    }
  };

  const getpanDetailsCoApplicant = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}panDetailsNew/${selectedCoApplicant.id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );

      if (response.data.msgKey === "Success") {
        // Alert.alert('Success', 'Co-Applicant PAN verification successfully!');
        Alert.alert(response.data.msgKey, response.data.message);
        UpdateWorkListCoAPplicant();

        // getWorklist(); // Refresh the worklist
      } else {
        Alert.alert(response.data.msgKey, response.data.message);
        setIsPanVerificationFailedCo(true); // Mark failure
        setIsLoadingsentotp(false);
        setLoadinglinkFromAPI(false);
      }

      // 
    } catch (error) {
      // setIsPanVerificationFailedCo(true); // Mark failure
      console.error('Error:', error);
      Alert.alert('Error', 'Failed Co-Applicant PAN verification.');
      setLoadinglinkFromAPI(false);

      // Trigger fetchLeadDetails on failure

    }
  };

  // useEffect(() => {
  //   if (selectedCard) {
  //     const fetchLeadDetails = async (leadId) => {
  //       try {
  //         const response = await axios.get(`${BASE_URL}getLeadByLeadId/${leadId}`);

  //         // Check the success key directly from the response data
  //         if (response.data.msgKey === 'Success') {
  //           const lead = response.data.data; // The lead details array
  //           

  //           // Assuming you want to set the lead details as `leadByLeadiD`
  //           setleadByLeadiD(lead);

  //           // Call the OTP sending function after fetching lead details
  //           // handlesendOTP();
  //         } else {
  //           // Handle unexpected messages (optional)
  //           console.warn('Unexpected response message:', response.data.message);
  //           Alert.alert('Error', 'Unexpected response from the server.');
  //         }
  //       } catch (error) {
  //         console.error('Error fetching lead details:', error);
  //         Alert.alert('Error', 'An error occurred while fetching lead details.');
  //       }
  //     };

  //     // Trigger the API call with leadId
  //     fetchLeadDetails(selectedCard.leadId);
  //   }
  // }, [selectedCard]); // This will trigger whenever selectedCard changes



  const fetchLeadDetails = useCallback(async (leadId) => {
    try {
      const response = await axios.get(`${BASE_URL}getLeadByLeadId/${leadId}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token, // Add the token to the Authorization header
        },
      });

      if (response.data.msgKey === 'Success') {
        const lead = response.data.data;
        // 
        setleadByLeadiD(lead);  // Set lead details once
      } else {
        console.warn('Unexpected response message:', response.data.message);
        Alert.alert('Error', 'Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
      Alert.alert('Error', 'An error occurred while fetching lead details.');
    }
  }, []);  // Memoize the function to avoid recreating on every render

  const fetchLeadDetailsbackup = useCallback(async (leadId) => {
    try {
      const response = await axios.get(`${BASE_URL}getLeadByLeadId/${leadId}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token, // Add the token to the Authorization header
        },
      });

      if (response.data.msgKey === 'Success') {
        const lead = response.data.data;
        // 
        // setleadByLeadiD(lead);  // Set lead details once
        setbackleadByLeadiD(lead);
      } else {
        console.warn('Unexpected response message:', response.data.message);
        Alert.alert('Error', 'Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
      Alert.alert('Error', 'An error occurred while fetching lead details.');
    }
  }, []);  // Memoize the function to avoid recreating on every render



  // Fetch lead details when selectedCard changes
  useEffect(() => {
    if (selectedCard) {
      fetchLeadDetails(selectedCard.leadId);
      getBusinessDate();
    }
  }, [selectedCard, fetchLeadDetails]);  // Ensure fetchLeadDetails is stable

  useEffect(() => {
    if (backupselectedCard) {
      fetchLeadDetailsbackup(backupselectedCard.leadId);
    }
  }, [backupselectedCard, fetchLeadDetailsbackup]);  // Ensure fetchLeadDetails is stable

  useEffect(() => {
    if (leadByLeadiD.length > 0) {
      let applicant = null;
      let coApplicant = null;

      // Process lead details once
      leadByLeadiD.forEach((person) => {
        if (person.applicantTypeCode === 'Applicant') {
          applicant = person;
        } else if (person.applicantTypeCode === 'Co-Applicant') {
          coApplicant = person;
        }
      });



      // Update selected applicants efficiently
      if (applicant) {
        setSelectedLeadApplicant(applicant); // Set Applicant if available
      }

      if (coApplicant) {
        setSelectedCoApplicant(coApplicant); // Set Co-Applicant if available
      }

      // If the applicant has a loanAmount, set active tab to 'Co-Applicant'
      if (applicant && applicant.loanAmount) {
        if (coApplicant) {
          setActiveTabView('Co-Applicant');
        } else {
          setActiveTabView('Applicant');
        }
        setIsApplicantTabDisabled(true);
        setCoApplicant(true); // Set active tab to '
        setbackucibilscore(applicant.cibilScore)
        setbackucrifscore(applicant.crifScore)
        setCrifScore(applicant.crifScore)
        setbackuremark(applicant.loanRemark); // Set
        setbackupportfolio(applicant.portfolioName)
        setbackuOccupation(applicant.primaryOccupation)
        setbackuproduct(applicant.productName)

        setbackuloanAMount(applicant.loanAmount)
        setCoApplicantFields({
          loanAmount: applicant.loanAmount, // Set loanAmount from applicant
          product: applicant.productName,  // Set productName from applicant
          portfolio: applicant.portfolioName, // Set portfolioName from applicant
        });

        setLoanAmount(applicant.loanAmount);
      }



      if (
        (applicant.appId || coApplicant?.appId)
        // || (applicant.cibilScore && coApplicant?.cibilScore)
      ) {
        // Show alert to the user
        Alert.alert(
          "Full Application Details",
          "You can view the full details of this Application on Lead page. Please press OK to proceed.",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.replace('Credit Lead', { applicant });
              }
            }
          ],
          { cancelable: false } // Prevent canceling the alert
        );
      }

    }
  }, [leadByLeadiD]);  // Only run when leadByLeadiD changes

  useEffect(() => {
    if (backleadByLeadiD.length > 0) {
      let applicant = null;
      let coApplicant = null;

      // Process lead details once
      backleadByLeadiD.forEach((person) => {
        if (person.applicantTypeCode === 'Applicant') {
          applicant = person;
        } else if (person.applicantTypeCode === 'Co-Applicant') {
          coApplicant = person;
        }
      });



      // Update selected applicants efficiently
      if (applicant) {
        setSelectedLeadApplicant(applicant); // Set Applicant if available
      }

      if (applicant && applicant.loanAmount) {
        setIsApplicantTabDisabled(true);
        setbackuloanAMount(applicant?.loanAMount)
        // setIsApplicantFormDisabled(true); // ✅ disable fields only
        // setIsApplicantTabLocked(false);   // ✅ allow tab navigation
        // setActiveTabView('Co-Applicant');
        // setCoApplicant(true);
      }
    }
  }, [backleadByLeadiD, activeTabView]);  // Only run when leadByLeadiD changes

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

  const handleLoanTypeChange = item => {
    const selectedLoanTypeValue = item;
    setSelectedLoanType(selectedLoanTypeValue); // Set the selected loan type value

    if (selectedLoanTypeValue) {
      getProduct(); // Fetch products when a loan type is selected
    } else {
      setProductdata([]); // Clear product dropdown if no loan type is selected
      setSelectedProduct(null); // Reset selected product
    }
  };

  const renderCard = useCallback(({ index, item }) => {

    const data = Array.isArray(item) ? item[0] : item;
    if (!data) return null;
    const expanded = isExpanded(index);
    return (
      <TouchableOpacity
        onPress={() => handleCardPress(item)}
        style={styles.card}>
        <View style={styles.collapsedHeader}>
          <View>
            <Text style={styles.cardTitle}>
              Lead ID: <Text style={styles.cardText}>{item.leadId}</Text>
            </Text>
            {item?.organizationName ? (
              <Text style={styles.cardTitle}>
                Organization Name:{' '}
                <Text style={styles.cardText}>{item.organizationName}</Text>
              </Text>
            ) : (
              <Text style={styles.cardTitle}>
                Lead Name:{' '}
                <Text style={styles.cardText}>
                  {item.firstName} {item.lastName}
                </Text>
              </Text>
            )}

            {item?.applicantCategoryCode && (
              <Text style={styles.cardTitle}>
                Applicant Category: <Text style={styles.cardText}>{item.applicantCategoryCode}</Text>
              </Text>
            )}

            {item?.appId && (
              <Text style={styles.cardTitle}>
                Application Number: <Text style={styles.cardText}>{item.appId}</Text>
              </Text>
            )}
          </View>

          {/* Expand/Collapse icon */}
          <TouchableOpacity onPress={() => toggleCard(index)}>
            <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Purpose:</Text>
              <Text style={styles.cardValue}>{item?.loanPurpose || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>DOB:</Text>
              <Text style={styles.cardValue}>
                {item?.dateOfBirth ? moment(item.dateOfBirth).format('DD-MM-YYYY') : 'N/A'}
              </Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Mobile No:</Text>
              <Text style={styles.cardValue}>{item?.mobileNo || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Stage:</Text>
              <Text style={styles.cardValue}>
                {item?.leadStage?.stageName || item?.leadStage || 'N/A'}
              </Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>PAN:</Text>
              <Text style={styles.cardValue}>{item?.pan || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Portfolio:</Text>
              <Text style={styles.cardValue}>
                {item?.product?.portfolio?.portfolioDescription || item?.portfolio || 'N/A'}
              </Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Product:</Text>
              <Text style={styles.cardValue}>
                {item?.product?.productName || item?.product?.productCode || 'N/A'}
              </Text>
            </View>
          </View>

        )}
      </TouchableOpacity>
    );
  }, [expandedCardIndex]);


  const renderDropdown = (
    label,
    data,
    selectedValue,
    onChange,
    placeholder,
  ) => (
    <View style={styles.inputField}>
      <Text style={styles.label}>{label}<Text style={styles.required}>*</Text></Text>
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

  const validatePAN = pan => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const getKeyboardTypeForPan = (panValue) => {
    if (panValue.length < 5) {
      return 'default'; // Alphabet for the first 5 characters
    }
    if (panValue.length >= 5 && panValue.length < 9) {
      return 'numeric'; // Numeric for the next 4 characters
    }
    if (panValue.length === 10) {
      Keyboard.dismiss(); // Close keyboard when length reaches 10
      return 'default'; // Last character is an alphabet
    }
    return 'default';
  };

  const renderInputt = (
    label,
    value,
    onChangeText = () => { },
    editable = true,
    placeholder = '',
    isMobile = false,
    isPan = false,
    isAadhaar = false,
    isEmail = false,
    fieldName,
    errorMessage,
    isCibilScore = false,
    isNumeric = false
  ) => {
    // PAN validation function
    const validatePAN = (text) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(text);

    // Cibil Score validation function
    const validateCibilScore = (text) => {
      const score = parseInt(text, 10);
      return !isNaN(score) && score >= 650 && score <= 900 && text.length === 3;
    };

    // Function to handle input change and validation
    const handleInputChange = (text) => {
      if (label === 'Remark' && text.trim() === '') {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: 'Remark is mandatory.',
        }));
      } else if (isPan) {
        const upperCaseText = text.toUpperCase();
        if (!validatePAN(upperCaseText) && upperCaseText.length === 10) {
          onChangeText(upperCaseText);
          return setErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: 'Invalid PAN format. Example: ABCDE1234F',
          }));
        }
        setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: '' }));
        onChangeText(upperCaseText);
      } else if (isCibilScore) {
        if (text.length > 3) {
          return; // Prevent entering more than 3 digits
        }

        const score = parseInt(text, 10);
        if (!isNaN(score) && score > 900) {
          return; // Prevent entering values greater than 900
        }

        if (!validateCibilScore(text)) {
          onChangeText(text);
          return setErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: 'CIBIL Score must be a 3-digit number between 650 and 900.',
          }));
        }
        setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: '' }));
        onChangeText(text);
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: '' }));
        onChangeText(text);
      }
    };

    return (
      <View style={styles.inputview}>
        <Text style={styles.labelformodal}>{label}<Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[
            styles.inputformodaltt,
            errorMessage ? { borderColor: 'red' } : null, // Highlight border if there's an error
          ]}
          value={value || ''}
          editable={editable}
          placeholder={placeholder}
          onChangeText={handleInputChange}
          keyboardType={isCibilScore || isNumeric ? 'numeric' : isPan ? getKeyboardTypeForPan(value) : isMobile || isAadhaar ? 'numeric' : 'default'}
          // keyboardType={isPan ? getKeyboardTypeForPan(value) : isMobile || isAadhaar ? 'numeric' : 'default'}
          maxLength={isCibilScore ? 3 : 10} // Limit PAN to 10 characters and CIBIL to 3 digits
        />
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>
    );
  };






  // const renderInput = (label, value, isValid = null, editable = false) => (
  //   <View style={styles.renderview}>
  //     <Text style={styles.labelformodal}>
  //       {label}{' '}
  //       {isValid && (
  //         <Image
  //           source={require('../asset/greencheck.png')} // Replace with your tick icon path
  //           style={styles.greencheckpng}
  //         />
  //       )}
  //     </Text>

  //     <TextInput
  //       style={styles.inputformodal}
  //       value={value || ''}
  //       editable={editable}
  //     />
  //   </View>
  // );


  // const renderInput = (label, value, isValid = null, editable = false, multiline = false) => (
  //   <View style={styles.renderview}>
  //     <Text style={styles.labelformodal}>
  //       {label}
  //       {isValid && (
  //         <Image
  //           source={require('../asset/greencheck.png')} // Replace with your tick icon path
  //           style={{ width: 10, height: 10, marginLeft: 5 }}
  //         />
  //       )}
  //     </Text>

  //     {/* Displaying the value in a TextInput */}
  //     <TextInput
  //       style={[
  //         styles.inputformodal,
  //         multiline && styles.inputMultiline,
  //         { flexWrap: 'wrap', width: '100%' }
  //       ]}
  //       value={value !== null && value !== undefined ? String(value) : ''}
  //       editable={editable}
  //       multiline={multiline}
  //       textAlignVertical={multiline ? 'top' : 'center'} // Align text to the top for multiline inputs
  //     />
  //   </View>
  // );
  const SmartInput = ({
    value = "",
    editable = false,
    multiline = true,
    baseFontSize = moderateScale(12),
    maxFontSize = moderateScale(14),
    minFontSize = moderateScale(10),
    maxHeight = verticalScale(220),
    style,
    ...props
  }) => {
    const [height, setHeight] = useState(verticalScale(34));
    const [fontSize, setFontSize] = useState(baseFontSize);

    const handleContentSize = (e) => {
      const h = e.nativeEvent.contentSize.height;

      // Auto grow height
      const clampedHeight = Math.min(
        Math.max(verticalScale(34), h),
        maxHeight
      );
      setHeight(clampedHeight);

      // Auto shrink font when text exceeds height
      if (h > clampedHeight - 12 && fontSize > minFontSize) {
        setFontSize((prev) => prev - 1);
      }
    };

    return (
      <TextInput
        value={value}
        editable={editable}
        multiline
        scrollEnabled={false}
        onContentSizeChange={handleContentSize}
        style={[
          style,
          {
            height,
            fontSize,
            textAlignVertical: "top",
          },
        ]}
        {...props}
      />
    );
  };



  const renderInput = (label, value, isValid = null, editable = false) => {
    const stringValue = value ? String(value) : "";
    const multiline = decideMultiline(label, stringValue);

    return (
      <View style={styles.renderview}>
        <Text style={styles.labelformodal}>
          {label}
          {isValid && (
            <Image
              source={require("../../asset/greencheck.png")}
              style={{ width: scale(12), height: scale(12), marginLeft: 5 }}
            />
          )}
        </Text>

        <SmartInput
          value={stringValue}
          editable={editable}
          multiline={multiline}
          style={[
            styles.inputformodal,
            !editable && { backgroundColor: "#EDEDED" },
          ]}
        />
      </View>
    );
  };



  const formatDate = (dateArray) => {
    if (Array.isArray(dateArray) && dateArray.length === 3) {
      const [year, month, day] = dateArray;

      // Create date without timezone conversion
      const date = new Date(year, month, day);

      // Format as DD-MM-YYYY
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth())
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;

      return formattedDate;
    }

    return 'N/A'; // Default value if invalid input
  };


  const otpInputs = useRef([]);

  const handleOtpChange = (text, type, index) => {
    // Update OTP array based on type (applicant or coApplicant)
    if (type === 'applicant') {
      let newOtp = [...otpApplicant];
      newOtp[index] = text;
      setOtpApplicant(newOtp);
    } else if (type === 'coApplicant') {
      let newOtp = [...otpCoApplicant];
      newOtp[index] = text;
      setOtpCoApplicant(newOtp);
    }

    // Move focus to the next field if the current field is filled and it's not the last one
    if (text && index < 3) {
      otpInputs.current[index + 1].focus(); // Focus the next input field
    }
  };

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

      if (!res || res.length === 0) {
        console.warn('No document selected');
        return;
      }



      const resolvedFiles = [];

      for (const file of res) {
        if (!file || !file.uri) continue; // Skip invalid entries

        const fileObj = {
          uri: file.uri,
          name: file.name || 'unknown',
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
        try {
          const fileStats = await RNFS.stat(filePath);
          const fileSizeInBytes = fileStats.size;
          const fileSizeInMB = fileSizeInBytes / (1024 * 1024);



          // if (fileSizeInMB > 1) {
          //   Alert.alert(
          //     'File Size Exceeded',
          //     `The file "${fileObj.name}" exceeds the 1 MB limit and was skipped.`
          //   );
          //   continue;
          // }

          // Add the resolved file object to the array
          resolvedFiles.push({
            uri: `file://${filePath}`,
            name: fileObj.name,
            type: fileObj.type,
          });

        } catch (sizeError) {
          console.warn(`Could not retrieve file size for: ${fileObj.name}`, sizeError);
          continue;
        }
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
    if (!file || !Array.isArray(file) || file.length === 0 || !file[0].uri || !file[0].name) {
      // Alert.alert('Error', 'Please attach a file before submitting.');
      return;
    }

    const filesToUpload = file; // already an array


    try {
      const uploadPromises = filesToUpload.map(async (selectedFile) => {
        try {
          // Ensure the file URI is correctly formatted
          const fileUri =
            Platform.OS === 'android' && selectedFile?.uri
              ? selectedFile.uri.replace('file://', '')
              : selectedFile?.uri;



          // Wrap the file in binary format using RNFetchBlob
          const wrappedFileData = RNFetchBlob.wrap(fileUri);

          if (!wrappedFileData) {
            Alert.alert('Error', 'Failed to wrap the file in binary format. Please check the file.');
            return;
          }

          // Call API
          const response = await RNFetchBlob.fetch(
            'POST',
            `uploadLeadCibilReport/${SelectedLeadApplicant.id}`,
            {
              'Content-Type': 'multipart/form-data',
              Authorization: 'Bearer ' + token,
            },
            [
              {
                name: 'file',
                filename: selectedFile.name,
                type: selectedFile.type || 'application/octet-stream', // safer fallback
                data: wrappedFileData,
              },
              // If API requires extra fields, add here
              // { name: 'dto', data: JSON.stringify(dto) },
            ]
          );

          let responseData;
          try {
            responseData = JSON.parse(response.data); // ✅ correct way
          } catch (e) {
            console.error('Failed to parse response:', response.data);
            Alert.alert('Error', 'Invalid response from server.');
            return;
          }



          if (responseData?.msgKey === 'Success') {
            Alert.alert('Success', responseData?.message || 'File uploaded successfully.');
          } else {
            Alert.alert('Error', responseData?.message || 'Failed to upload the file.');
          }

          return responseData;
        } catch (innerErr) {
          console.error('File upload failed:', innerErr);
          Alert.alert('Error', innerErr.message || 'Something went wrong while uploading.');
        }
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in CIBILFILEUpload:', error);
      Alert.alert('Error', error.message || 'Unexpected error occurred.');
    }
  };



  const CIBILFILEUploadCo = async () => {
    // Check if the file is present
    if (!fileco || (Array.isArray(fileco) && fileco.length === 0) || !fileco[0].uri || !fileco[0].name) {
      // Alert.alert('Error', 'Please attach a file before submitting.');
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
        } else {
          Alert.alert('Error', responseData.message || 'Failed to upload the file.');
        }

        return response.data;
      });

      // Wait for all files to upload (if multiple files)
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in addRiskContainmentUnit:', error.message || error);
      Alert.alert('Error', error.message);
    }
  };


  const [searchQuery, setSearchQuery] = useState('');
  const [AllLoads, setAllLoeds] = useState([]);
  const [leadsWithLoanAmount, setLeadsWithLoanAmount] = useState([]);
  const [GroupedLeadsById, setGroupedLeadsById] = useState([]);
  const [showAllLeads, setShowAllLeads] = useState(false);




  const handleSearch = (text) => {
    setSearchQuery(text);
  };
  const getAllLeads = async () => {
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
      const rr = response.data.data;
      const allLeadswithloanAmount = rr
      const allLeads = response?.data?.data
      const applicantLeads = allLeads.filter(
        lead =>
          lead.loanAmount !== null &&
          lead.loanAmount !== undefined &&
          !isNaN(Number(lead.loanAmount)) &&
          lead.loanAmount > 0 &&
          lead?.primaryAssigned === mkc.userId
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


      const leadsWithoutAmount = allLeads.filter(
        lead =>
          lead.appId === null &&
          lead.leadStatus &&
          // lead.applicantTypeCode === 'Co-Applicant' &&
          lead.loanAmount !== null &&
          lead.loanAmount !== undefined &&
          !isNaN(Number(lead.loanAmount)) &&
          lead?.assignTo?.userId === mkc.userId &&
          lead.leadStatus.leadStatusName !== 'Rejected' &&
          lead.leadStatus.leadStatusName !== 'Under Credit Review'
      );



      // Group leadsWithoutAmount by leadId
      const filteredLeads = leadsWithoutAmount.reduce((acc, current) => {
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
      setLeadsWithLoanAmount(leadsWithoutAmount);
      setGroupedLeadsById(filteredLeads); // Assuming `setGroupedLeadsById` is the state setter



    } catch (error) {
      console.error('Error fetching leads:', error);
      Alert.alert('Error', 'Failed to fetch leads');
    }
  };

  const sourceData = Array.isArray(showAllLeads ? AllLoads : GroupedLeadsById)
    ? (showAllLeads ? AllLoads : GroupedLeadsById)
    : [];
  // const sourceData = GroupedLeadsById

  const normalizedData = Array.isArray(sourceData[0])
    ? sourceData.flat() // If it's grouped arrays, flatten them
    : sourceData;       // Otherwise use directly

  const filteredData = normalizedData.filter((item) => {
    const calculateAge = (dob) => {
      if (!Array.isArray(dob)) return null;
      const [year, month, day] = dob;
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    };

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

    const matchApplicant =
      item?.applicantTypeCode === 'Applicant' &&
      (
        (item?.firstName ?? '').toLowerCase().includes(query) ||
        (item?.lastName ?? '').toLowerCase().includes(query) ||
        (item?.leadStatus?.leadStatusName ?? '').toLowerCase().includes(query) ||
        (item?.pan ?? '').toLowerCase().includes(query) ||
        (item?.mobileNo ?? '').toLowerCase().includes(query) ||
        (item?.gender ?? '').toLowerCase().includes(query) ||
        (item?.leadId ?? '').toLowerCase().includes(query)
      );

    return query ? matchGeneral || matchApplicant : true;
  });

  const formatNumberWithCommas = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return value;
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value));
  };



  const calculateAge = (dob) => {
    if (!BusinessDate?.businnessDate) return null; // Ensure business date exists

    // Convert BusinessDate array [YYYY, MM, DD] into a Date object
    const businessDate = new Date(BusinessDate.businnessDate[0], BusinessDate.businnessDate[1] - 1, BusinessDate.businnessDate[2]);
    const birthDate = new Date(dob);

    let age = businessDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = businessDate.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && businessDate.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };


  const age = selectedCoApplicant.dateOfBirth ? calculateAge(selectedCoApplicant.dateOfBirth) : 0;
  const loanAmountCoApp = coApplicantFields.loanAmount || 0;

  // Check conditions to show switch
  const shouldShowSwitch = age >= 40 || loanAmountCoApp >= 2500000;

  const leadApplicantAge = SelectedLeadApplicant.dateOfBirth ? calculateAge(SelectedLeadApplicant.dateOfBirth) : 0;
  const leadApplicantLoanAmount = loanAmount || 0;

  // Check conditions to show the switch
  const shouldShowLeadSwitch = leadApplicantAge >= 40 || leadApplicantLoanAmount >= 2500000;



  const handleloanAmountChange = (value) => {
    // Remove commas and non-numeric characters
    const rawValue = value.replace(/[^0-9.]/g, '');

    // Ensure the value is a valid number
    const numericValue = parseFloat(rawValue) || 0;

    // Update the state with the numeric value (without commas)
    setLoanAmount(isNaN(numericValue) ? '' : numericValue);
    // setEligibilityAmount(isNaN(numericValue) ? '' : numericValue);

    setCoApplicantFields({
      loanAmount: numericValue,
    })
    setbackuloanAMount(numericValue)
  };

  const isApplicant = activeTabView === 'Applicant';




  // const filteredLeadStatus = isApplicant
  //   ? LeadStausss.filter(item => item.label?.toLowerCase().trim() !== 'housewife')
  //   : LeadStausss;

  // 

  useEffect(() => {

    if (SelectedLeadApplicant?.loanAmount) {
      setLoanAmount(SelectedLeadApplicant.loanAmount);
    }
  }, [SelectedLeadApplicant?.loanAmount])

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

  // put this near the top of the component where you build fields


  // Smart auto multiline engine

  const correctionlabelApplicant = SelectedLeadApplicant?.applicantCategoryCode != "Organization"
    ? "first Name"
    : "Organization Name"

  const correctionlabelCoApplicant = selectedCoApplicant?.applicantCategoryCode != "Organization"
    ? "first Name"
    : "Organization Name"
  const incorcorrectionlabelApplicant = SelectedLeadApplicant?.applicantCategoryCode != "Organization"
    ? "DOB (Date of Birth)"
    : "Incorporation Date"

  const incorcorrectionlabelCoApplicant = selectedCoApplicant?.applicantCategoryCode != "Organization"
    ? "DOB (Date of Birth)"
    : "Incorporation Date"

  return (
    <SafeAreaView style={styles.safeContainer}>

      {/* <SafeAreaView style={{ backgroundColor: "#2196F3" }}> */}
      <StatusBar
        translucent
        backgroundColor="#2196F3"
        barStyle="light-content"
      />
      {/* </SafeAreaView> */}

      {/* <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../asset/icons/menus.png')}
              style={styles.drawerIcon}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>WorkList</Text>
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

          <Text style={styles.headerTitle}>WorkList</Text>

          <View style={styles.headerAvatar}>
            <Text style={styles.avatarText}>
              {mkc.firstName[0]}
              {mkc.lastName[0]}
            </Text>
          </View>


        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          // paddingHorizontal: 10,
          paddingVertical: 5,
        }}>

          <TextInput
            style={styles.searchBar}
            placeholder="Search..."
            placeholderTextColor={'#fff'}
            value={searchQuery}
            onChangeText={handleSearch}
          />


          <View style={styles.switchContainer}>

            <Switch
              value={showAllLeads}
              onValueChange={(value) => setShowAllLeads(value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isSettlement ? "#f5dd4b" : "#f4f3f4"}
              style={styles.switch}
            />
          </View>
        </View>

      </LinearGradient>

      <View style={styles.container}>


        <>
          {loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
          <FlatList
            data={filteredData}
            renderItem={({ item, index }) => {
              const isRejected =
                item?.leadStage?.stageName?.toLowerCase() === "rejected" ||
                item?.leadStage?.toLowerCase() === "rejected" ||
                item?.leadStatus?.leadStatusName?.toLowerCase() === "rejected";

              const hasAppId = !!item?.appId;

              return (
                <Card
                  item={item}
                  index={index}
                  expandedItem={expandedItem}
                  isExpanded={expandedItem === index}
                  toggleExpand={toggleExpand}
                  handleCardPress={handleCardPress}
                  isRejected={isRejected}
                  hasAppId={hasAppId}
                />
              );
            }}
            keyExtractor={(item) => String(item?.id || item?.leadId)}
            contentContainerStyle={styles.scrollContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No applications found</Text>}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />


        </>


        <Modal transparent visible={loadinglinkFromAPI}>
          <View style={styles.loaderFullScreen}>
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#040675FF" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          </View>
        </Modal>

        <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.label}>OTP Verification Applicant</Text>
              <View style={styles.content}>
                <View style={styles.inputContainergg}>
                  <View style={styles.otpBoxContainer}>
                    {[...Array(4)].map((_, index) => (
                      <TextInput
                        key={index}
                        style={styles.otpInput}
                        placeholder="0"
                        placeholderTextColor='#A9A9A9'
                        value={otpApplicant[index]}
                        onChangeText={(text) => handleOtpChange(text, 'applicant', index)}
                        keyboardType="numeric"
                        maxLength={1}  // Only allow one character per input box
                        // onFocus={() => setOtpFocus(index)}  // Focus the current input box
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === 'Backspace' && otpApplicant[index] === '') {
                            // Move focus to the previous field if the current field is empty and Backspace is pressed
                            if (index > 0) {
                              otpInputs.current[index - 1].focus();
                            }
                          }
                        }}
                        ref={(ref) => otpInputs.current[index] = ref}  // Store reference to input fields
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  {isLoading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        (isVerifyingOtpApplicant || !isOtpComplete) && styles.disabledButton,
                      ]}
                      onPress={handleverifyotp}
                      disabled={isVerifyingOtpApplicant || !isOtpComplete}
                      activeOpacity={0.8}
                    >
                      {isVerifyingOtpApplicant ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitText}>Verify</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* 🌀 Retry OTP Button */}
                  {isResendingOtp ? (
                    <ActivityIndicator size="small" color="#53E619FF" />
                  ) : (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handleRetryOtp}
                      disabled={isResendingOtp}
                      activeOpacity={0.8}
                    >

                      {isResendingOtp ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : (
                        <Text style={styles.retryText}>
                          {timer > 0 ? `Retry in ${timer}s` : "↻ Retry OTP"}
                        </Text>
                      )}


                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                </View>


              </View>
            </View>
          </View>
        </Modal>

        <Modal transparent={true} visible={visibleCo} animationType="slide" onRequestClose={onCloseCoApplicant}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.label}>OTP Verification Co-Applicant</Text>

              <View style={styles.content}>
                {/* <Text style={styles.label}> OTP</Text> */}
                <View style={styles.inputContainergg}>
                  <View style={styles.otpBoxContainer}>
                    {[...Array(4)].map((_, index) => (
                      <TextInput
                        key={index}
                        style={styles.otpInput}
                        placeholder="0"
                        placeholderTextColor='#A9A9A9'
                        value={otpCoApplicant[index]}
                        onChangeText={(text) => handleOtpChange(text, 'coApplicant', index)}
                        keyboardType="numeric"
                        maxLength={1}  // Only allow one character per input box
                        // onFocus={() => setOtpFocus(index)}  // Focus the current input box
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === 'Backspace' && otpApplicant[index] === '') {
                            // Move focus to the previous field if the current field is empty and Backspace is pressed
                            if (index > 0) {
                              otpInputs.current[index - 1].focus();
                            }
                          }
                        }}
                        ref={(ref) => otpInputs.current[index] = ref}  // Store reference to input fields
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  {isLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                  ) : (
                    <TouchableOpacity

                      style={[
                        styles.submitButton,
                        (isVerifyingOtpCoApplicant || !isOtpCompleteCo) && styles.disabledButton
                      ]}
                      onPress={handleverifyotpCoApplicant}
                      disabled={isVerifyingOtpCoApplicant || !isOtpCompleteCo} // Disable button while verifying OTP
                    >
                      {isVerifyingOtpCoApplicant ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitText}>Verify</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {isResendingOtpCo ? (
                    <ActivityIndicator size="small" color="#53E619FF" />
                  ) : (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handleRetryOtpCo}
                      disabled={isResendingOtpCo}
                      activeOpacity={0.8}
                    >

                      {isResendingOtpCo ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : (
                        <Text style={styles.retryText}>
                          {timerCo > 0 ? `Retry in ${timerCo}s` : "↻ Retry OTP"}
                        </Text>
                      )}

                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.closeButton} onPress={onCloseCoApplicant}>
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        </Modal>

        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <CustomToast message={toastMessage} isVisible={isToastVisible} />
          <View style={styles.modalContainerdetail}>
            <View style={styles.modalContentdetail}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTabView === 'Applicant' && styles.activeTab,]}
                  onPress={() => {
                    setActiveTabView('Applicant'); // Set the active tab to 'Applicant'
                    // if (SelectedLeadApplicant) {
                    //   setbackupselectedCard(SelectedLeadApplicant);
                    // }
                  }}
                >
                  <Text style={[styles.tabText,]}>
                    Applicant
                  </Text>
                </TouchableOpacity>

                {selectedCoApplicant && Object.keys(selectedCoApplicant).length > 0 && (
                  <TouchableOpacity
                    style={[styles.tab, activeTabView === 'Co-Applicant' && styles.activeTab]}
                    onPress={() => {
                      const validationResult = validateFields(); // Validate fields before switching
                      const missingFields = Array.isArray(validationResult) ? validationResult : [];



                      if (missingFields.length > 0) {
                        // Display missing field alert
                        Alert.alert(
                          'Alert ⚠️',
                          missingFields.map((field) => `\u2022 ${field}`).join('\n'),
                          [{ text: 'OK', style: 'cancel' }]
                        );
                      } else {
                        // If validation passes, check CoApllicant status
                        if (!CoApllicant) {
                          Alert.alert('Alert ⚠️', 'Please Save the Applicant first!');
                        } else {
                          setActiveTabView('Co-Applicant'); // Allow tab switch
                        }
                      }
                    }}>
                    <Text style={styles.tabText}>Co-Applicant</Text>
                  </TouchableOpacity>

                )}

              </View>


              <ScrollView >
                {activeTabView === 'Applicant' && SelectedLeadApplicant && (
                  <ScrollView contentContainerStyle={styles.scrollContent}>
                    <>

                      <View style={styles.collapsibleContainer}>

                        <TouchableOpacity onPress={() => toggleSection('basicInfo')} style={styles.headerCollap}>
                          <Text style={styles.headerText}>
                            {SelectedLeadApplicant?.applicantCategoryCode === "Organization"
                              ? "Organization Detail"
                              : "Individual Detail"}
                          </Text>
                          <View style={styles.headerTouchable}>
                            <Text style={styles.arrowIcon}>
                              {expandedItem === 'basicInfo' ? '▲' : '▼'}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {expandedItem === 'basicInfo' && (
                          <View style={styles.contenttt}>
                            {(() => {
                              const fields = [
                                {
                                  label:
                                    SelectedLeadApplicant?.firstName || SelectedLeadApplicant?.lastName
                                      ? "Name"
                                      : "Organization Name",
                                  value:
                                    SelectedLeadApplicant?.firstName || SelectedLeadApplicant?.lastName
                                      ? `${SelectedLeadApplicant?.firstName || ""} ${SelectedLeadApplicant?.middleName || ""} ${SelectedLeadApplicant?.lastName || ""}`.trim()
                                      : SelectedLeadApplicant?.organizationName,
                                  isValid:
                                    SelectedLeadApplicant?.firstName || SelectedLeadApplicant?.lastName
                                      ? SelectedLeadApplicant?.panValid
                                      : false,
                                },
                                {
                                  label: SelectedLeadApplicant?.organizationName
                                    ? "Incorporation Date"
                                    : "Date of Birth",
                                  value: formatDate(SelectedLeadApplicant?.dateOfBirth),
                                  isValid: SelectedLeadApplicant?.panVerified,
                                },
                                { label: "CIN Number", value: SelectedLeadApplicant?.cin },
                                { label: "Registration Number", value: SelectedLeadApplicant?.registrationNumber },
                                { label: "Industry Type", value: SelectedLeadApplicant?.industryType },
                                { label: "Segment Type", value: SelectedLeadApplicant?.segmentType },
                                { label: "Contact Person", value: SelectedLeadApplicant?.contactPersonName },
                                { label: "Designation", value: SelectedLeadApplicant?.contactPersonDesignation },
                                { label: "Organization Type", value: SelectedLeadApplicant?.organizationType },
                                { label: "Gender", value: SelectedLeadApplicant?.gender },
                                { label: "Email", value: SelectedLeadApplicant?.email, isValid: SelectedLeadApplicant?.isEmailVerified },
                                { label: "Mobile No", value: SelectedLeadApplicant?.mobileNo, isValid: SelectedLeadApplicant?.isMobileVerified },
                              ];

                              // keep only truthy values and annotate multiline
                              const validFields = fields
                                .filter(f => f.value !== null && f.value !== undefined && f.value !== "")
                                .map(f => ({
                                  ...f,
                                  multiline: decideMultiline(f.label, f.value),
                                }));

                              const renderedFields = validFields.map(f =>
                                renderInput(f.label, f.value, f.isValid || false, false, f.multiline)
                              );

                              return renderRows(renderedFields, 2);
                            })()}
                          </View>
                        )}

                        <View style={styles.headerCollap}>
                          <Text style={styles.headerText}>
                            KYC Detail
                          </Text>
                          <TouchableOpacity onPress={() => toggleSection('kycDetail')} style={styles.headerTouchable}>
                            <Text style={styles.arrowIcon}>
                              {expandedItem === 'kycDetail' ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {expandedItem === 'kycDetail' && (
                          <View style={styles.contenttt}>
                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput("PAN", SelectedLeadApplicant.pan || 'N/A', SelectedLeadApplicant?.isPanVerified)}
                              </View>
                              <View style={styles.col}>
                                {renderInput("Aadhar", SelectedLeadApplicant.aadhar || 'N/A', false)}
                              </View>
                            </View>
                          </View>
                        )}

                        <View style={styles.headerCollap}>
                          <Text style={styles.headerText}>Location Detail</Text>

                          <TouchableOpacity
                            onPress={() => toggleSection('locationDetail')}
                            style={styles.headerTouchable}
                          >
                            <Text style={styles.arrowIcon}>
                              {expandedItem === 'locationDetail' ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {expandedItem === "locationDetail" && (
                          <View style={styles.contenttt}>

                            {/* Row 1 */}
                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput(
                                  "Pincode",
                                  String(SelectedLeadApplicant.pincodeId) || "N/A",
                                  false,
                                  false
                                )}
                              </View>

                              <View style={styles.col}>
                                {renderInput(
                                  "Country",
                                  findApplicantByCategoryCodView.data?.countryName || "",
                                  false,
                                  false
                                )}
                              </View>
                            </View>

                            {/* Row 2 */}
                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput(
                                  "City",
                                  findApplicantByCategoryCodView.data?.cityName || "",
                                  false,
                                  false
                                )}
                              </View>

                              <View style={styles.col}>
                                {renderInput(
                                  "State",
                                  findApplicantByCategoryCodView.data?.stateName || "",
                                  false,
                                  false,
                                  true // multiline
                                )}
                              </View>
                            </View>

                            {/* Row 3 (only one item → add empty col) */}
                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput(
                                  "Area",
                                  findApplicantByCategoryCodView.data?.areaName || "",
                                  false,
                                  false
                                )}
                              </View>

                              {/* empty col to maintain 2-column grid */}
                              <View style={styles.col} />
                            </View>

                          </View>
                        )}


                        <View style={styles.headerCollap}>
                          <Text style={styles.headerText}>
                            Lead Detail
                          </Text>
                          <TouchableOpacity onPress={() => toggleSection('leadDetail')} style={styles.headerTouchable}>
                            <Text style={styles.arrowIcon}>
                              {expandedItem === 'leadDetail' ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {expandedItem === 'leadDetail' && (
                          <View style={styles.contenttt}>
                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput("Lead Source", SelectedLeadApplicant?.leadSourceName || 'N/A')}
                              </View>

                              <View style={styles.col}>
                                {renderInput("Lead Status", SelectedLeadApplicant?.leadStatusName || 'N/A')}
                              </View>
                            </View>

                            {SelectedLeadApplicant?.assignTo && (
                              <View style={styles.row}>
                                {renderInput("Assign To", SelectedLeadApplicant?.assignTo || 'N/A', false)}
                              </View>

                            )}
                          </View>

                        )}
                      </View>

                      <>

                        <View style={styles.row}>

                          {SelectedLeadApplicant?.portfolioName && (
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.labelformodal}>{'Portfolio'}<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                  style={[styles.inputformodal]}
                                  value={SelectedLeadApplicant?.portfolioName}
                                  onChangeText={(text) => setbackupportfolio(text)}
                                  editable={false}
                                />
                              </View>
                            </View>
                          )}


                          {SelectedLeadApplicant?.productName && isApplicantTabDisabled && (
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.labelformodal}>{'Product'}<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                  style={[styles.inputformodal]}
                                  value={String(SelectedLeadApplicant?.productName)}
                                  onChangeText={(text) => setbackuproduct(text)}
                                  editable={false}
                                />
                              </View>
                            </View>
                          )}
                          {!isApplicantTabDisabled &&
                            renderDropdown('Product', productdata, selectedProduct, handleProductChange, 'Product', isProductDropdownDisabled)
                          }




                        </View>


                        <View style={styles.row}>
                          {!isApplicantTabDisabled &&
                            <View style={{
                              flexDirection: 'column', justifyContent: 'center', alignContent: 'center', flex: 1, paddingHorizontal: 5,
                            }}>
                              <Text style={styles.labelformodal}>Loan Amount <Text style={styles.required}>*</Text> </Text>
                              <TextInput
                                // style={styles.inputtt}
                                style={[styles.inputformodaltt, , { fontSize: loanAmount ? 14 : 10 }]}
                                value={
                                  loanAmount !== undefined && loanAmount !== null
                                    ? formatNumberWithCommas(loanAmount) // Format with commas
                                    : ''
                                }
                                onChangeText={handleloanAmountChange}
                                keyboardType="numeric"
                                // placeholder="Enter Sanction Amount"
                                placeholderTextColor={'#888'}

                              />
                            </View>
                          }

                          {isApplicantTabDisabled && (
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.labelformodal}>
                                  {'Loan Amount'}
                                  <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                  style={styles.inputformodal}
                                  value={formatNumberWithCommas(backuloanAMount || SelectedLeadApplicant?.loanAmount)} // already string-safe
                                  onChangeText={(text) => setbackuloanAMount(text)} // won't run because editable=false
                                  editable={false}
                                />
                              </View>
                            </View>
                          )}



                          {!isApplicantTabDisabled &&
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.labelformodal}>{'CRIF Score'} <Text style={styles.required}>*</Text> </Text>
                                <TextInput
                                  style={[styles.inputformodaltt]}
                                  value={CrifScore || ''}   // ✅ ensures string
                                  onChangeText={(text) => handleCrifScoreChange(text, setCrifScore)}
                                  keyboardType="numeric"
                                  maxLength={3}
                                />

                              </View>
                            </View>
                          }

                          {isApplicantTabDisabled && (
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.labelformodal}>{'CRIF Score'} <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                  style={[
                                    styles.inputformodal,
                                  ]}
                                  value={SelectedLeadApplicant?.crifScore > 0
                                    ? SelectedLeadApplicant.crifScore.toString()
                                    : 0}
                                  onChangeText={setbackucrifscore}
                                  multiline={true}
                                  editable={false}
                                />
                              </View>
                            </View>
                          )}
                        </View>





                        {SelectedLeadApplicant?.convertedFromEnquiry === true
                          && (
                            <View style={styles.row}>
                              {renderDropdown("Lead Source", LeadSource, SelectdLeadSourceDropdown, handleLeadStatusChange, "Lead Source")}
                              {renderDropdown("Branch Name", BranchName, SelectdbranchName, handleBranchNameChange, "Branch Name")}
                            </View>
                          )}

                        <View style={styles.row}>
                          <View style={{ width: width * 0.52, flexDirection: 'column', }}>
                            {!isApplicantTabDisabled && (
                              <>
                                <Text style={styles.labelformodal}>Document Upload</Text>

                                <TouchableOpacity
                                  style={[
                                    styles.documentButton,

                                  ]}
                                  onPress={isApplicantTabDisabled ? null : handleDocumentSelection} // Prevent onPress when disabled
                                  disabled={isApplicantTabDisabled} // Disable button when false
                                >
                                  <Image
                                    source={require('../../asset/upload.png')} // Replace with your icon path
                                    style={styles.iconStyle}
                                  />
                                  <Text style={styles.buttonText}>Select Document</Text>
                                </TouchableOpacity>

                                <View style={{ marginTop: 10, width: width * 0.52 }}>
                                  {file && Array.isArray(file) && file.length > 0 ? (
                                    file.map((fileItem, index) => (
                                      <Text key={index} style={styles.fileNameText}>
                                        {`\u2022 ${fileItem.name}`}
                                      </Text>
                                    ))
                                  ) : (
                                    <Text style={{ color: 'black' }}>No file selected</Text>
                                  )}
                                </View>
                              </>
                            )}

                            {isApplicantTabDisabled && (
                              <View style={{ width: width * 0.52, flexDirection: 'column', alignItems: 'center' }}>
                                {!isApplicantTabDisabled && (
                                  <Text style={styles.labelformodal}>Uploaded File</Text>
                                )}

                                <View style={{ marginTop: 10, width: width * 0.52 }}>
                                  {downloadCibilReportApplicant && downloadCibilReportApplicant.length > 0 ? (
                                    downloadCibilReportApplicant.map((fileItem, index) => (
                                      <Text key={index} style={styles.fileNameText}>
                                        {`\u2022 ${fileItem.description}`}
                                      </Text>
                                    ))
                                  ) : (
                                    <Text style={{ color: 'black' }}>No file selected</Text>
                                  )}
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      </>

                      <>
                        {isPanVerificationFailed && (
                          <>
                            {/* Show fields when isPanVerificationFailed is true */}
                            <Text style={{ fontWeight: '500', color: '#007bff', paddingLeft: 5 }}>PAN Correction</Text>
                            <View style={styles.row}>
                              {renderInputt(correctionlabelApplicant, fullNamecorrection, setFullNamecorrection, true, 'Enter Your Name', false, false, false, false, 'fullNamecorrection', errors.fullNamecorrection)}
                              {/* {renderInputt("Middle Name", middleNamecorrection, setMiddleNamecorrection, true, '', false, false, false, false, 'middleNamecorrection', errors.middleNamecorrection)} */}
                              {SelectedLeadApplicant?.applicantCategoryCode != "Organization" && (
                                <View style={styles.inputview}>
                                  <View style={{ flexDirection: 'column' }}>
                                    <Text style={styles.labelformodal}>{'Middle Name'}</Text>
                                    <TextInput
                                      style={[
                                        styles.inputformodaltt,
                                      ]}
                                      value={middleNamecorrection}
                                      onChangeText={setMiddleNamecorrection}
                                      placeholder='Enter Your Middle Name'
                                      placeholderTextColor={'#888'}
                                    />
                                  </View>
                                </View>
                              )}
                            </View>

                            <View style={styles.row}>
                              {SelectedLeadApplicant?.applicantCategoryCode != "Organization" && (
                                <>
                                  {renderInputt("Last Name", lastNamecorrection, setlastNamecorrection, true, 'Enter Your Last Name', false, false, false, false, 'lastNamecorrection', errors.lastNamecorrection)}
                                </>
                              )}
                              {renderInputt(
                                "PAN Number",
                                panNumbercorrection,
                                setPanNumbercorrection,
                                true,                 // Editable
                                "Enter PAN",          // Placeholder
                                false,                // Not a mobile field
                                true,                 // Enable PAN validation
                                false,                // Not Aadhaar
                                false,                // Not Email
                                "panNumbercorrection", // Field name
                                errors.panNumbercorrection // Error message
                              )}
                            </View>

                            <View style={styles.row}>

                              <DateOfBirthInput
                                label={incorcorrectionlabelApplicant}
                                value={dob} // Pass the selected DOB
                                onChange={(selectedDob) => {
                                  setDob(selectedDob); // Update DOB state
                                  handleAgeValidation(selectedDob); // Call age validation whenever DOB changes
                                }}
                                setError={setDobError} // Pass setError function to handle errors
                              />

                            </View>
                          </>
                        )}
                      </>


                      <View style={styles.butcontai}>
                        {!isPanVerificationFailed && (
                          <TouchableOpacity
                            style={[
                              styles.SubmitButton,
                              (isApplicantTabDisabled) && styles.disabledButton, // Disable styling if submitting or applicant tab is disabled
                              isApplicantTabDisabled && styles.disabledTab, // Ensure proper disabled styling
                            ]}
                            onPress={handleSubmit}
                            disabled={isApplicantTabDisabled} // Disable button when submitting or applicant tab is disabled
                          >
                            {isSubmitting ? (
                              <ActivityIndicator color="#0000ff" /> // Show a spinner while submitting
                            ) : (
                              <Text style={[styles.SubmiText, isApplicantTabDisabled && styles.disabledTabText]}>
                                Submit
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}

                        {isPanVerificationFailed && (
                          <TouchableOpacity
                            style={[
                              styles.SubmitButton,
                              (isPanSubmitting || isApplicantTabDisabled) && styles.disabledButton, // Disable styling if submitting or applicant tab is disabled
                              isApplicantTabDisabled && styles.disabledTab, // Ensure proper disabled styling
                            ]}
                            onPress={handlePanFailedSubmit}
                            disabled={isPanSubmitting || isApplicantTabDisabled} // Disable button when submitting or applicant tab is disabled
                          >
                            {isPanSubmitting ? (
                              <ActivityIndicator color="#0000ff" /> // Show a spinner while submitting
                            ) : (
                              <Text style={[styles.SubmiText, isApplicantTabDisabled && styles.disabledTabText]}>
                                Verify PAN
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}



                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={handleClose}>
                          <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    </>

                  </ScrollView>
                )}

                {activeTabView === 'Co-Applicant' && selectedCoApplicant && (
                  <ScrollView contentContainerStyle={styles.scrollContent}>
                    <>
                      <View style={styles.collapsibleContainer}>
                        <View style={styles.headerCollap}>
                          <Text style={styles.headerText}>
                            {selectedCoApplicant?.applicantCategoryCode === "Organization"
                              ? "Organization Detail"
                              : "Individual Detail"}
                          </Text>

                          <TouchableOpacity onPress={() => toggleSectionCo('basicInfo')} style={styles.headerTouchable}>
                            <Text style={styles.arrowIcon}>
                              {expandedItemCo === 'basicInfo' ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {expandedItemCo === 'basicInfo' && (
                          <View style={styles.contenttt}>
                            {(() => {
                              // Collect all fields in one place
                              const fields = [
                                {
                                  label: selectedCoApplicant?.firstName || selectedCoApplicant?.lastName
                                    ? "Name"
                                    : "Organization Name",
                                  value: selectedCoApplicant?.firstName || selectedCoApplicant?.lastName
                                    ? `${selectedCoApplicant?.firstName || ""} ${selectedCoApplicant?.middleName || ""} ${selectedCoApplicant?.lastName || ""}`.trim()
                                    : selectedCoApplicant?.organizationName,
                                  isValid: selectedCoApplicant?.firstName || selectedCoApplicant?.lastName
                                    ? selectedCoApplicant?.panValid
                                    : false,
                                },
                                {
                                  label: selectedCoApplicant?.organizationName
                                    ? "Incorporation Date"
                                    : "Date of Birth",
                                  value: formatDate(selectedCoApplicant?.dateOfBirth),
                                  isValid: selectedCoApplicant?.panVerified,
                                },
                                { label: "CIN Number", value: selectedCoApplicant?.cin },
                                { label: "Registration Number", value: selectedCoApplicant?.registrationNumber },
                                { label: "Industry Type", value: selectedCoApplicant?.industryType },
                                { label: "Segment Type", value: selectedCoApplicant?.segmentType },
                                { label: "Contact Person", value: selectedCoApplicant?.contactPersonName },
                                { label: "Designation", value: selectedCoApplicant?.contactPersonDesignation },
                                { label: "Organization Type", value: selectedCoApplicant?.organizationType },


                                {
                                  label: "Gender",
                                  value: selectedCoApplicant?.gender,
                                },
                                {
                                  label: "Email",
                                  value: selectedCoApplicant?.email,
                                  isValid: selectedCoApplicant?.isEmailVerified,
                                },
                                {
                                  label: "Mobile No",
                                  value: selectedCoApplicant?.mobileNo,
                                  isValid: selectedCoApplicant?.isMobileVerified,
                                },
                              ];

                              // Filter out empty/null/undefined
                              const validFields = fields.filter(f => f.value && f.value !== "N/A");

                              // Chunk fields into rows of 2
                              const rows = [];
                              for (let i = 0; i < validFields.length; i += 2) {
                                rows.push(validFields.slice(i, i + 2));
                              }

                              return rows.map((row, idx) =>
                                renderRows(row.map(f => renderInput(f.label, f.value, f.isValid || false, false)))
                              );
                            })()}
                          </View>

                        )}

                        <View style={styles.headerCollap}>
                          <Text style={styles.headerText}>
                            KYC Detail
                          </Text>
                          <TouchableOpacity onPress={() => toggleSectionCo('kycDetail')} style={styles.headerTouchable}>
                            <Text style={styles.arrowIcon}>
                              {expandedItemCo === 'kycDetail' ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {expandedItemCo === 'kycDetail' && (
                          <View style={styles.contenttt}>
                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput("PAN", selectedCoApplicant.pan || 'N/A', selectedCoApplicant?.isPanVerified)}
                              </View>
                              <View style={styles.col}>
                                {renderInput("Aadhar", selectedCoApplicant.aadhar || 'N/A', false)}
                              </View>
                            </View>
                          </View>
                        )}

                        <View style={styles.headerCollap}>
                          <Text style={styles.headerText}>
                            Location Detail
                          </Text>
                          <TouchableOpacity onPress={() => toggleSectionCo('locationDetail')} style={styles.headerTouchable}>
                            <Text style={styles.arrowIcon}>
                              {expandedItemCo === 'locationDetail' ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {expandedItemCo === 'locationDetail' && (
                          <View style={styles.contenttt}>

                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput("Pincode", String(selectedCoApplicant.pincodeId) || 'N/A', false)}
                              </View>
                              <View style={styles.col}>
                                {renderInput(
                                  "Country",
                                  cofindApplicantByCategoryCodView.data?.countryName || '',
                                  false, // Explicitly set isValid to false
                                  false // Field is not editable
                                )}
                              </View>
                            </View>

                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput(
                                  "City",
                                  cofindApplicantByCategoryCodView.data?.cityName || '',
                                  false, // Explicitly set isValid to false
                                  false // Field is not editable
                                )}
                              </View>
                              <View style={styles.col}>
                                {renderInput(
                                  "State",
                                  cofindApplicantByCategoryCodView.data?.stateName || '',
                                  false, // Explicitly set isValid to false
                                  false // Field is not editable
                                )}
                              </View>
                            </View>

                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput(
                                  "Area",
                                  cofindApplicantByCategoryCodView.data?.areaName || '',
                                  false, // Explicitly set isValid to false
                                  false // Field is not editable
                                )}
                              </View>
                              <View style={styles.col} />
                            </View>
                          </View>
                        )}

                        <View style={styles.headerCollap}>
                          <Text style={styles.headerText}>Lead Detail</Text>

                          <TouchableOpacity
                            onPress={() => toggleSectionCo('leadDetail')}
                            style={styles.headerTouchable}
                          >
                            <Text style={styles.arrowIcon}>
                              {expandedItemCo === 'leadDetail' ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {expandedItemCo === 'leadDetail' && (
                          <View style={styles.contenttt}>

                            {/* Row 1 */}
                            <View style={styles.row}>
                              <View style={styles.col}>
                                {renderInput(
                                  "Lead Source",
                                  SelectedLeadApplicant?.leadSourceName || "N/A"
                                )}
                              </View>

                              <View style={styles.col}>
                                {renderInput(
                                  "Lead Status",
                                  SelectedLeadApplicant?.leadStatusName || "N/A"
                                )}
                              </View>
                            </View>

                            {/* Row 2 - Ensure 2 cols always */}
                            {selectedCoApplicant?.assignTo && (
                              <View style={styles.row}>
                                <View style={styles.col}>
                                  {renderInput(
                                    "Assign To",
                                    selectedCoApplicant?.assignTo || "N/A"
                                  )}
                                </View>

                                {/* Empty column to maintain layout */}
                                <View style={styles.col} />
                              </View>
                            )}

                          </View>
                        )}

                      </View>

                      <>
                        <View style={styles.row}>

                          {selectedCoApplicant?.portfolioName && (
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.labelformodal}>{'Portfolio'}<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                  style={[styles.inputformodal]}
                                  value={selectedCoApplicant?.portfolioName}
                                  onChangeText={(text) => setbackupportfolio(text)}
                                  editable={false}
                                />
                              </View>
                            </View>
                          )}


                          {selectedCoApplicant?.productName && (
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.labelformodal}>{'Product'}<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                  style={[styles.inputformodal]}
                                  value={String(selectedCoApplicant?.productName)}
                                  onChangeText={(text) => setbackuproduct(text)}
                                  editable={false}
                                />
                              </View>
                            </View>
                            // renderDropdown('Product', productdataCo, selectedProductCo, handleProductChangeCo, 'Product', isProductDropdownDisabled)
                          )}
                        </View>


                        <View style={styles.row}>
                          <View style={{ flex: 1, paddingHorizontal: 5 }}>
                            <View style={{ flexDirection: 'column' }}>
                              <Text style={styles.labelformodal}>{'Loan Amount'}<Text style={styles.required}>*</Text></Text>
                              <TextInput
                                style={[styles.inputformodal]}
                                value={
                                  coApplicantFields.loanAmount !== undefined && coApplicantFields.loanAmount !== null
                                    ? formatNumberWithCommas(coApplicantFields.loanAmount) // Format with commas
                                    : ''
                                }
                                onChangeText={(text) => setbackupportfolio(text)}
                                editable={false}
                              />
                            </View>
                          </View>

                          <View style={{ flex: 1, paddingHorizontal: 5 }}>
                            <View style={{ flexDirection: 'column' }}>
                              <Text style={styles.labelformodal}>
                                {'CRIF Score'} <Text style={styles.required}>*</Text>

                              </Text>
                              <TextInput
                                style={[
                                  selectedCoApplicant?.crifScore > 0
                                    ? styles.inputformodal
                                    : styles.inputformodaltt
                                ]}
                                value={
                                  selectedCoApplicant?.crifScore > 0
                                    ? selectedCoApplicant.crifScore.toString()
                                    : (CriflScoreCo ?? 0)
                                }
                                onChangeText={(text) => handleCrifScoreChange(text, setCrifScoreCo)}
                                keyboardType="numeric"
                                maxLength={3}
                                placeholder="Enter CRIF Score"
                                editable={!(selectedCoApplicant?.crifScore > 0)} // lock only if API gave a number > 0
                              />

                            </View>
                          </View>

                        </View>

                        <View style={styles.row}>

                          {selectedCoApplicant?.loanRemark && (
                            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.labelformodal}>{'Remark'}<Text style={styles.required}>*</Text></Text>
                                <TextInput
                                  style={[
                                    styles.inputformodal,
                                  ]}
                                  value={selectedCoApplicant?.loanRemark}
                                  multiline={true}
                                  editable={false}
                                />
                              </View>
                            </View>
                          )}
                          {!isApplicantTabDisabled && (
                            <View style={{ width: width * 0.52, flexDirection: 'column', }} >
                              <Text style={styles.labelformodal}>Document Upload</Text>

                              <TouchableOpacity style={styles.documentButton} onPress={handleDocumentSelectionCo} disabled={isApplicantTabDisabled}>
                                <Image
                                  source={require('../../asset/upload.png')} // Replace with your icon path
                                  style={styles.iconStyle}
                                />
                                <Text style={styles.buttonText}>Select Document</Text>
                              </TouchableOpacity>
                              <View style={{ marginTop: 10, width: width * 0.52 }}>
                                {fileco && Array.isArray(fileco) && fileco.length > 0 ? (
                                  fileco.map((fileItem, index) => (
                                    <Text key={index} style={styles.fileNameText}>
                                      {`\u2022 ${fileItem.name}`}
                                    </Text>
                                  ))
                                ) : (
                                  <Text style={{ color: 'black' }}>No file selected</Text>
                                )}
                              </View>
                            </View>

                          )}
                        </View>
                      </>


                      <>
                        {isPanVerificationFailedCo && (

                          <>
                            {/* Show fields when isPanValid is false */}
                            <Text style={{ fontWeight: '500', color: '#007bff', paddingLeft: 5 }}>PAN Correction</Text>
                            <View style={styles.row}>
                              {renderInputt(correctionlabelCoApplicant, fullNamecorrectionCo, setFullNamecorrectionCo, true, '', false, false, false, false, 'fullNamecorrection', errors.fullNamecorrection)}
                              {/* {renderInputt("Middle Name", middleNamecorrectionCo, setMiddleNamecorrectionCo, true, '', false, false, false, false, 'middleNamecorrection', errors.middleNamecorrection)} */}
                              {selectedCoApplicant?.applicantCategoryCode != "Organization" && (
                                <View style={styles.inputview}>
                                  <View style={{ flexDirection: 'column' }}>
                                    <Text style={styles.labelformodal}>{'Middle Name'}</Text>
                                    <TextInput
                                      style={[
                                        styles.inputformodaltt,
                                      ]}
                                      value={middleNamecorrectionCo}
                                      onChangeText={setMiddleNamecorrectionCo}
                                      placeholder='Enter Your Middle Name'
                                      placeholderTextColor={'#888'}
                                    />
                                  </View>
                                </View>
                              )}
                            </View>
                            <View style={styles.row}>
                              {selectedCoApplicant?.applicantCategoryCode != "Organization" && (
                                <>
                                  {renderInputt("Last Name", lastNamecorrectionCo, setlastNamecorrectionCo, true, '', false, false, false, false, 'lastNamecorrection', errors.lastNamecorrection)}
                                </>
                              )}
                              {renderInputt(
                                "PAN Number",
                                panNumbercorrectionCo,
                                (text) => setPanNumbercorrectionCo(text), // Ensure state updates properly
                                true, // Editable
                                "Enter PAN", // Placeholder
                                false, // Not a mobile field
                                true, // Enable PAN validation
                                false, // Not Aadhaar
                                false, // Not Email
                                "panNumbercorrection", // Field name
                                errors.panNumbercorrection // Error message
                              )}


                            </View>

                            <View style={styles.row}>
                              {/* <DateOfBirthInput
                            label="DOB (Date of Birth)"
                            value={dobcorrectionCo}  // The value will be displayed in "YYYY-MM-DD" format
                            onChange={(newDate) => setDobcorrectionCo(newDate)}  // Updates the state with the selected date
                          /> */}

                              <View style={{ width: width * 0.5 }}>
                                <DateOfBirthInput
                                  label={incorcorrectionlabelCoApplicant}
                                  value={codob}
                                  onChange={(selectedDob) => {
                                    setcoDob(selectedDob); // Update DOB state
                                    handleAgeValidationCo(selectedDob); // Call age validation whenever DOB changes
                                  }}
                                  setError={setcoDobError} // Pass setError function to handle errors
                                />

                                {/* Conditional Error Message */}
                                {/* {codobError ? <Text style={{ color: 'red', fontSize: 12 }}>{codobError}</Text> : null} */}
                              </View>

                            </View>
                          </>
                        )}
                      </>



                      <View style={styles.butcontai}>
                        {!selectedCoApplicant?.appId && (
                          <>
                            {!isPanVerificationFailedCo && (
                              <TouchableOpacity
                                style={[
                                  styles.SubmitButton,
                                  (isSubmittingCoApplicant || selectedCoApplicant?.cibilScore) && styles.disabledButton,
                                  selectedCoApplicant?.leadStatusName !== "Open" && styles.disabledTab,
                                ]}
                                onPress={handleSubmitCoApplicant}
                                disabled={isSubmittingCoApplicant || !!selectedCoApplicant?.cibilScore || selectedCoApplicant?.leadStatusName !== "Open"} // Disable if submitting or cibilScore exists
                              >
                                {isSubmittingCoApplicant ? (
                                  <ActivityIndicator color="#0000ff" />
                                ) : (
                                  <Text style={[styles.SubmiText, selectedCoApplicant?.leadStatusName !== "Open" && styles.disabledTabText]}>Submit</Text>
                                )}
                              </TouchableOpacity>

                            )}

                            {/* Full-Screen Loader */}
                            {isLoadingsendotp && (
                              <Modal transparent={true} animationType="fade">
                                <View style={styles.loaderContainer}>
                                  <ActivityIndicator size="large" color="#0000ff" />
                                </View>
                              </Modal>
                            )}

                            {isPanVerificationFailedCo && (
                              <TouchableOpacity
                                style={[styles.SubmitButton, isVerifyingPanCoApplicant && styles.disabledButton]}
                                onPress={handlePanFailedSubmitCoApplicant}
                                disabled={isVerifyingPanCoApplicant} // Disable  button when verifying
                              >
                                {isVerifyingPanCoApplicant ? (
                                  <ActivityIndicator color="#0000ff" />
                                ) : (
                                  <Text style={styles.SubmiText}>Verify PAN</Text>
                                )}
                              </TouchableOpacity>
                            )}
                          </>
                        )}

                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={handleClose}
                        >
                          <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                      </View>



                    </>
                  </ScrollView>
                )}

              </ScrollView>
            </View>
          </View>
        </Modal >

      </View >
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    // backgroundColor: '#2196F3', // backgroundColor same as header for seamless look
  },
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    marginTop: -8,
    paddingTop: 20,
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
  drawerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropColor: "rgba(0,0,0,0.5)", // Dimmed background
    zIndex: 1, // Ensure the drawer appears above other content
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
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


  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  list: {
    padding: 10,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0C0C0CFF',
  },
  cardText: {
    fontSize: 13,
    color: '#353333FF',
    marginTop: 4,
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
  // row: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   marginVertical: 0,
  // },
  // label: {
  //   fontSize: 12,
  //   marginBottom: 4,
  //   color: 'black',
  //   fontWeight: 'bold',
  // },
  value: {
    color: 'black',
    flex: 3, // Allows value to take more space
    textAlign: 'left',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },

  modalBackground: {
    flex: 1,
    backdropColor: "rgba(0,0,0,0.5)",
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  panCorrectinView: {
    fontWeight: '500',
    color: '#007bff',
    paddingLeft: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    // marginVertical: 5,
    margin: 6
  },

  col: {
    flex: 1,
  },


  inputview: {
    flex: 1,
    paddingHorizontal: 5,
  },
  renderview: {
    flex: 1,
    paddingHorizontal: scale(6),
    marginVertical: verticalScale(8)
  },

  labelformodal: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#000",
    marginBottom: verticalScale(4),
  },

  inputformodal: {
    width: "100%",
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(8),
    fontSize: moderateScale(12),
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: scale(6),
    color: "#333",
    fontWeight: "600",
  },
  inputformodaltt: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 12,
    backgroundColor: '#f9f9f9',
    color: 'black',
    fontWeight: 'bold',
    borderColor: '#007bff',
    borderWidth: 2,
    width: width * 0.39,
    height: height * 0.04,
  },


  inputField: {
    flex: 1,
    paddingHorizontal: 5,
    width: width * 0.25,
  },

  placeholderStyle: {
    color: '#2196F3',
    fontSize: 10,
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
    width: width * 0.39,
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
    fontSize: 10,
    overflow: 'hidden'
  },
  butcontai: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Add space between the buttons (alternatively, use 'space-evenly')
    alignItems: 'center', // Center the buttons vertically within the row
    marginTop: 20, // Adjust top margin if needed
  },
  SubmitButton: {
    backgroundColor: '#4CAF50', // Button color (green)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10, // Add spacing between Submit and  buttons
  },
  SubmiText: {
    color: '#fff', // Text color for the button
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f44336', // Close button color (red)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeText: {
    color: '#fff', // Text color for the close button
    fontSize: 16,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#007bff',
    fontWeight: 'bold',
  },
  input: {
    // marginVertical:5,
    borderRadius: 5,
    padding: 8,
    fontSize: 12,

    color: 'black',
  },
  inputcontaineRRr: {
    borderWidth: 1,
    borderColor: 'black',
    width: width * 0.35,
    height: height * 0.035,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  iconButton: {
    padding: 10,
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: '#007bff',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  selectedText: {
    fontSize: 10,
    color: 'black',
    fontWeight: 'bold',
    flexShrink: 1,
  },
  renderview: {
    width: "100%",
    marginBottom: verticalScale(12)
  },
  greencheckpng: { width: 10, height: 10, marginLeft: 5 },

  modalContainerdetail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backdropColor: "rgba(0,0,0,0.5)",
  },
  modalContentdetail: {
    backgroundColor: '#EBE9E9FF',
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

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginBottom: 20,
    marginTop: 20
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0', // Default background color for inactive tabs
    elevation: 5, // Give a slight shadow to make the tab look elevated
    transition: 'all 0.3s', // Smooth transition for background changes
  },
  activeTab: {
    backgroundColor: '#007bff', // Green background for the active tab
    shadowColor: 'rgba(0, 0, 0, 0.3)', // Shadow effect for active tab
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  tabText: {
    fontSize: 16,
    color: 'black', // Default text color
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white', // Text color for the active tab
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
    color: 'black'
  },

  inputContainergg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 8,
    paddingHorizontal: 10,
    width: width * 0.85
  },
  content: {
    // width: width * 0.75,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // width: '100%',
    // marginVertical:45
  },
  retryButton: {
    // borderWidth: 1,
    // borderColor: '#007AFF',
    // // backgroundColor: 'transparent',
    // backgroundColor: 'rgba(0, 122, 255, 0.1)',
    // borderRadius: 8,
    // paddingVertical: 8,
    // paddingHorizontal: 16
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // width: '50%',
  },

  retryText: {
    color: '#007AFF',
    fontSize: moderateScale(13),
    fontWeight: "600",
  },

  retryIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: "#007AFF",
    marginLeft: scale(4),
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

  scrollContent: {
    marginBottom: 20
  },

  collapsibleContainer: {
    flex: 1,
  },

  headerCollap: {
    padding: 5,
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 8,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFFFF',
    marginVertical: 10,
    paddingBottom: 10,
  },
  contenttt: {
    borderWidth: 3,
    borderColor: '#007bff',
    borderRadius: 8,
    backgroundColor: '#FFFFFFFF',
    paddingVertical: 10,
  },
  arrowIcon: {
    color: '#007bff',
    fontSize: 18,
    paddingRight: 15,
  },
  // row: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   marginVertical: 5,
  // },

  Approvebutton: {
    backgroundColor: '#2196F3', // Button background color
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    // marginLeft: 10,
    width: width * 0.4,
    height: height * 0.04,// Adds space between buttons
    marginHorizontal: 10
  },

  ApprovebuttonText: {
    color: 'white', // Text color of the button
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
  },

  switchLabel: {
    fontSize: 12,
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 10
  },



  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    // marginTop: 8,
    width: width * 0.35,
    height: height * 0.045,
  },
  diabledocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cccccc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    // marginTop: 8,
    width: width * 0.35,
    height: height * 0.045,
  },
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  fileNameText: {
    flexWrap: 'wrap', // Allow text wrapping
    // marginLeft: 30,
    fontSize: 14,
    color: '#000', // Set text color (or use your theme)
  },

  emptyText: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff'
  },
  required: {
    color: 'red', // Asterisk color to indicate mandatory
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
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.15, // keeps consistent switch width across devices
  },
  switch: {
    transform: [{ scale: 0.9 }], // keeps size consistent across devices
  },

  disabledButton: {
    backgroundColor: '#cccccc', // Button color (green)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10, // Add spacing between Submit and  buttons
  },
  disabledTab: {
    backgroundColor: '#cccccc', // Button color (green)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10, // Add spacing between Submit and   buttons
  },
  disabledTabText: {
    color: 'black', // Text color of the disabled tab
    fontSize: 14,
    fontWeight: '500',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropColor: "rgba(0,0,0,0.5)", // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderFullScreen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  loaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: 'black',
    fontSize: 16,
  },


});

export default WorkList;
