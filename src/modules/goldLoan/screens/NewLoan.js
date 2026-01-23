import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { View, ScrollView, Text, SafeAreaView, ActivityIndicator, FlatList, Alert, Keyboard, RefreshControl, Dimensions, Modal, TouchableOpacity, Image, TextInput, useColorScheme, StyleSheet, Animated } from "react-native";
import { useSelector } from "react-redux";
import { Provider } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from "@react-native-community/datetimepicker";
import DocumentPicker from 'react-native-document-picker';
import CheckBox from '@react-native-community/checkbox';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import axios from "axios";
import { moderateVerticalScale } from "react-native-size-matters";

const { width, height } = Dimensions.get('window')
const isSmallScreen = width < 768;

const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const renderDropdown = (
  label,
  data,
  selectedValue,
  onChange,
  placeholder,
  isRequired = true,
) => {
  const safeData = (data || []).map((item) => ({
    ...item,
    label: String(item.label ?? ""),
  }));

  return (
    <View>
      <Text style={styles.label}>
        {label}
        {isRequired && <Text style={styles.required}>*</Text>}
      </Text>

      <Dropdown
        data={safeData}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        placeholderStyle={styles.placeholderStyle}
        value={selectedValue}
        search
        onChange={onChange}
        style={[
          styles.dropdown,
          {
            minHeight: isSmallScreen ? 36 : 44,
            paddingHorizontal: isSmallScreen ? 8 : 10,
            paddingVertical: isSmallScreen ? 6 : 8,
          },
        ]}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        renderItem={(item) => (
          <View style={styles.dropdownItem}>
            <Text style={styles.dropdownItemText}>{item.label}</Text>
          </View>
        )}
      />
    </View>
  );
};


const DatePickerInput = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      onChange(formatted);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Label */}
      <Text style={styles.label}>
        {label}
        <Text style={styles.required}>*</Text>
      </Text>

      {/* Input box */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 6,
          backgroundColor: "#fff",
          paddingHorizontal: isSmallScreen ? 8 : 10,
          height: isSmallScreen ? 36 : 45,
        }}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text
          style={{
            flex: 1,
            color: value ? "#000" : "#999",
            fontSize: isSmallScreen ? 12 : 14
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value || `Select ${label}`}
        </Text>

        <Image
          source={require("../asset/calendar.png")}
          style={{ width: 20, height: 20, marginLeft: 8 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Date Picker */}
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};




const NewLoan = () => {
  const userDetails = useSelector((state) => state.auth.userDetails);
  // const [AccesTabs, setAccesTabs] = useState([]);
  console.log(userDetails, 'userDetails')
  const mkc = useSelector((state) => state.auth.userDetails);
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.roleCode);
  console.log(AccesTabs, 'AccesTabsAccesTabs')

  const [activeMain, setActiveMain] = useState("cust");
  const [activeSub, setActiveSub] = useState(null);
  const [formData, setFormData] = useState({});
  console.log(formData, 'formData')

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewData, setPreviewData] = useState({
    docType: null,
    file: null,
  });

  const [activeCust1Tab, setActiveCust1Tab] = useState("Applicant");
  const [isSameAsCurrent, setIsSameAsCurrent] = useState(false);


  // 
  const [Pincode, setPincode] = useState([]);
  const [selectedPincode, setselectedPincode] = useState('');
  const [pincodelabel, setpincodelabel] = useState('');


  const [Pincodeco, setPincodeco] = useState([]);
  const [selectedPincodeco, setselectedPincodeco] = useState('');
  const [pincodelabelco, setpincodelabelco] = useState('');


  const [Pincodeguar, setPincodeguar] = useState([]);
  const [selectedPincodeguar, setselectedPincodeguar] = useState('');
  const [pincodelabelguar, setpincodelabelguar] = useState('');
  const [CoApllicant, setCoApplicant] = useState(false);

  const [categoryData, setCategoryData] = useState({
    applicant: { cityName: '', stateName: '', countryName: '', areaName: '' },
    coApplicant: { cityName: '', stateName: '', countryName: '', areaName: '' },
    guarantor: { cityName: '', stateName: '', countryName: '', areaName: '' },

    applicantpermanent: { cityName: '', stateName: '', countryName: '', areaName: '' },
    coApplicantpermanent: { cityName: '', stateName: '', countryName: '', areaName: '' },
    guarantorpermanent: { cityName: '', stateName: '', countryName: '', areaName: '' },
  });



  const [PincodepermaAddressApplicant, setPincodepermaAddressApplicant] = useState([]);
  const [PincodepermaAddressCoApplicant, setPincodepermaAddressCoApplicant] = useState([]);
  const [PincodepermaAddressGurantor, setPincodepermaAddressGurantor] = useState([]);

  const [pincodelabelPermanentguar, setpincodelabelPermanentguar] = useState('');
  const [pincodelabelPermanentApplicant, setpincodelabelPermanentApplicant] = useState('');
  const [pincodelabelPermanentCoAPplicant, setpincodelabelPermanentCoAPplicant] = useState('');

  const [selectedpincodePermanentguar, setselectedpincodePermanentguar] = useState('');
  const [selectedpincodePermanentApplicant, setselectedpincodePermanentApplicant] = useState('');
  const [selectedpincodePermanentCoAPplicant, setselectedpincodePermanentCoAPplicant] = useState('');

  const [loanPurpose, setloanPurpose] = useState([]);
  const [selectedloanPurpose, setselectedloanPurpose] = useState('');
  const [loanpurposelabel, setloanpurposelabel] = useState('')

  const [loanPurposeCoapplicant, setloanPurposeCoapplicant] = useState([]);
  const [selectedCoApplicantloanPurpose, setselectedCoApplicantloanPurpose] = useState('');
  const [CoApplicantloanpurposelabel, setCoApplicantloanpurposelabel] = useState('')

  const [loanPurposegurantor, setloanPurposegurantor] = useState([]);
  const [selectedGurantorloanPurpose, setselectedGurantorloanPurpose] = useState('')
  const [Gurantorloanpurposelabel, setGurantorloanpurposelabel] = useState('')
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadByLeadiD, setleadByLeadiD] = useState([])
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leadsWithLoanAmount, setLeadsWithLoanAmount] = useState([]);

  const [refreshing, setrefreshing] = useState(false);
  const [isLoadingsendotp, setIsLoadingsentotp] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);


  const [SelectedLeadApplicant, setSelectedLeadApplicant] = useState({});
  const [selectedCoApplicant, setSelectedCoApplicant] = useState({});
  const [selectedGurantor, setselectedGurantor] = useState({});


  const [activeTabView, setActiveTabView] = useState('Applicant')
  const TAB_APPLICANT = 'Applicant';
  const TAB_COAPPLICANT = 'Co-Applicant';




  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission
  const [isPanSubmitting, setIsPanSubmitting] = useState(false);
  const [isSubmittingCoApplicant, setIsSubmittingCoApplicant] = useState(false); // State for Submit button
  const [isVerifyingPanCoApplicant, setIsVerifyingPanCoApplicant] = useState(false);

  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isOtpVerifiedCo, setIsOtpVerifiedCo] = useState(false);
  const [isOtpVerifiedGurantor, setIsOtpVerifiedGurantor] = useState(false);
  const [visibleCo, setVisibleCo] = useState(false);
  const [visibleGurantor, setVisibleGurantor] = useState(false);
  const [loadinglinkFromAPI, setLoadinglinkFromAPI] = useState(false);
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [otpApplicant, setOtpApplicant] = useState(['', '', '', '']);  // 4 empty strings for Applicant OTP
  const [otpCoApplicant, setOtpCoApplicant] = useState(['', '', '', '']);  // 4 empty strings for Co-Applicant OTP
  const [otpGurantor, setotpGurantor] = useState(['', '', '', '']);
  const [isVerifyingOtpApplicant, setIsVerifyingOtpApplicant] = useState(false);
  const [isVerifyingOtpCoApplicant, setIsVerifyingOtpCoApplicant] = useState(false);
  const [isVerifyingOtpGurantor, setisVerifyingOtpGurantor] = useState(false);
  const openModal = (type) => {
    setModalType(type);
    setVisible(true);
  };

  const isOtpFilled = modalType === 'applicant'
    ? otpApplicant.every((digit) => digit !== '')
    : modalType === 'coApplicant'
      ? otpCoApplicant.every((digit) => digit !== '')
      : otpGurantor.every((digit) => digit !== '');

  const otpInputs = useRef([]);
  // const aadharotpInputs = useRef([]);

  const handleOtpChange = (text, type, index) => {
    let otpArray, setOtpFunction;

    if (type === 'applicant') {
      otpArray = otpApplicant;
      setOtpFunction = setOtpApplicant;
    } else if (type === 'coApplicant') {
      otpArray = otpCoApplicant;
      setOtpFunction = setOtpCoApplicant;
    } else if (type === 'gurantor') {
      otpArray = otpGurantor;
      setOtpFunction = setOtpGurantor;
    } else {
      return; // Invalid type: do nothing
    }

    const newOtp = [...otpArray];
    newOtp[index] = text;
    setOtpFunction(newOtp);

    // Move focus to next input if not the last one
    if (text && index < otpInputs.current.length - 1) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleVerifyOtp = (type) => verifyOtpGeneric(type);

  const verifyOtpGeneric = async (type) => {
    let otpPayload = {};
    let setOtpVerified, getPanDetailsFn, setVisibleFn, otpArray, selectedPerson;

    if (type === 'applicant') {
      otpPayload = {
        mobileNumber: SelectedLeadApplicant.mobileNo,
        otp: otpApplicant.join(''),
        id: SelectedLeadApplicant?.id,
      };
      setOtpVerified = setIsOtpVerified;
      getPanDetailsFn = getpanDetails;
      setVisibleFn = setVisible;
      otpArray = otpApplicant;
      selectedPerson = SelectedLeadApplicant;
    } else if (type === 'coApplicant') {
      otpPayload = {
        mobileNumber: selectedCoApplicant.mobileNo,
        otp: otpCoApplicant.join(''),
        id: selectedCoApplicant?.id,
      };
      setOtpVerified = setIsOtpVerifiedCo;
      getPanDetailsFn = getpanDetailsCoApplicant;
      setVisibleFn = setVisibleCo;
      otpArray = otpCoApplicant;
      selectedPerson = selectedCoApplicant;
    } else if (type === 'gurantor') {
      otpPayload = {
        mobileNumber: selectedGurantor.mobileNo,
        otp: otpGurantor.join(''),
        id: selectedGurantor?.id,
      };
      setOtpVerified = setIsOtpVerifiedGurantor;
      getPanDetailsFn = getpanDetailsGurantor;
      setVisibleFn = setVisibleGurantor;
      otpArray = otpGurantor;
      selectedPerson = selectedGurantor;
    } else {
      console.error('Invalid OTP type');
      return;
    }

    setIsLoading(true);
    setLoadinglinkFromAPI(true);

    try {
      const otpResponse = await axios.post(
        `verifyOtpToMobile`,
        otpPayload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );

      console.log('OTP Response:', otpResponse.data);

      if (otpResponse.data.msgKey === "Success") {
        setOtpVerified(true);
        getPanDetailsFn();
        setVisibleFn(false);
        setVisible(false);
        onClose();
      } else {
        Alert.alert(otpResponse.data.msgKey, otpResponse.data.message);
        setTimeout(() => openModal(type), 10);
      }
    } catch (error) {
      console.error('OTP verification API error:', error);
      Alert.alert('Error', 'An error occurred while processing your request.');
      setTimeout(() => openModal(type), 10);
    } finally {
      setIsLoading(false);
      setLoadinglinkFromAPI(false);
      setIsLoadingsentotp(false);
    }
  };

  const getpanDetails = async () => {
    const id = SelectedLeadApplicant.id;
    await fetchPanDetails(id);
  };

  const getpanDetailsCoApplicant = async () => {
    const id = selectedCoApplicant.id;
    await fetchPanDetails(id);
  };

  const getpanDetailsGurantor = async () => {
    const id = selectedGurantor.id;
    await fetchPanDetails(id);
  };

  const fetchPanDetails = async (id) => {
    try {
      const response = await axios.get(`panDetailsNew/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.msgKey === "Success") {
        Alert.alert('Success', 'PAN verification successful!');
        getWorklist();
        UpdateWorkList();
      } else {
        Alert.alert('Error', 'PAN verification failed.');
      }
    } catch (error) {
      console.error('PAN verification API error:', error);
      Alert.alert('Error', 'Failed to verify PAN.');
    }
  };

  // After LeadCreate API succeeds
  const handleLeadCreateSuccess = (leadData) => {
    setSelectedLeadApplicant(leadData.applicant);
    sendOtpGeneric('applicant'); // Send OTP for applicant
  };

  // After verifyMobileAPI succeeds
  const handleVerifyMobileSuccess = (coApplicantData) => {
    setSelectedCoApplicant(coApplicantData);
    sendOtpGeneric('coApplicant'); // Send OTP for co-applicant
  };

  // After Guarantor verification succeeds
  const handleGurantorVerificationSuccess = (gurantorData) => {
    setselectedGurantor(gurantorData);
    sendOtpGeneric('gurantor'); // Send OTP for guarantor
  };

  // OTP for Applicant
  const sendOtpGeneric = async (type) => {
    let mobileNo;
    if (type === 'applicant') {
      if (!SelectedLeadApplicant) return;
      mobileNo = SelectedLeadApplicant.mobileNo;
    } else if (type === 'coApplicant') {
      if (!selectedCoApplicant) return;
      mobileNo = selectedCoApplicant.mobileNo;
    } else if (type === 'gurantor') {
      if (!selectedGurantor) return;
      mobileNo = selectedGurantor.mobileNo;
    } else {
      console.error('Invalid OTP type');
      return;
    }

    const otpPayload = { mobileNo };
    setIsSubmitting(true);
    setIsLoadingsentotp(true);

    try {
      const otpResponse = await retryRequest(() =>
        axios.post(`sendOtpToMobile`, otpPayload, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      );

      if (otpResponse.data.msgKey === 'Success') {
        openModal(type); // Open the correct OTP modal
      } else {
        Alert.alert(otpResponse.data.msgKey, otpResponse.data.message);
      }
    } catch (error) {
      console.error(`Error sending OTP for ${type}:`, error);
      Alert.alert('Error', `An error occurred while sending OTP for ${type}.`);
    } finally {
      setIsSubmitting(false);
      setIsLoadingsentotp(false);
    }
  };


  const [findApplicantByCategoryCodeview, setFindApplicantByCategoryCodView] = useState({
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

  const [deviationApplicant, setdeviationApplicant] = useState([])
  const [deviationCoApplicant, setdeviationCoApplicant] = useState([])

  const [downloadCibilReportCoApplicant, setDownloadCibilReportCoApplicant] = useState("");
  const [downloadCibilReportApplicant, setDownloadCibilReportApplicant] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (SelectedLeadApplicant && selectedCoApplicant && findApplicantByCategoryCodeview && cofindApplicantByCategoryCodView) {

      setIsLoading(false);
    }
  }, [SelectedLeadApplicant, selectedCoApplicant, cofindApplicantByCategoryCodView, findApplicantByCategoryCodeview,]);
  const onRefresh = useCallback(async () => {
    setrefreshing(true);
    try {
      await getAllLeads(); // Wait for the worklist to be fetched
    } catch (error) {
      console.error("Failed to refresh worklist:", error);
    } finally {
      setrefreshing(false); // Ensure refreshing is turned off
    }
  }, []);
  const onClose = () => {
    // setVisible(false); // Hide the modal
  };
  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleClose = () => {
    setisModalVisible(false);  // Close the modal
    setSelectedCoApplicant({});
    setSelectedLeadApplicant({});
    setselectedGurantor({})
    getAllLeads();
    setCoApplicant(false); //
    setFindApplicantByCategoryCodView({
      data: {
        cityName: '',
        stateName: '',
        countryName: '',
        areaName: '',
      },
    });

    setcoFindApplicantByCategoryCodView({
      data: {
        cityName: '',
        stateName: '',
        countryName: '',
        areaName: '',
      },
    });

    setIsLoading(true);
  }
  const handleCreatePress = () => {
    setModalVisible(true);
    // setActiveTab('Applicant');
    // setAllLoeds([]);
    setLeadsWithLoanAmount([]);
  };

  useEffect(() => {
    if (leadByLeadiD && leadByLeadiD.length > 0) {
      const applicant = leadByLeadiD.find(person => person.applicantTypeCode === 'Applicant') || null;
      const coApplicant = leadByLeadiD.find(person => person.applicantTypeCode === 'Co-Applicant') || null;
      const gurantor = leadByLeadiD.find(person => person.applicantTypeCode === 'Gurantor') || null;

      if (applicant) setSelectedLeadApplicant(applicant);
      if (coApplicant) setSelectedCoApplicant(coApplicant);
      if (gurantor) setselectedGurantor(gurantor);
    }
  }, [leadByLeadiD]);


  useEffect(() => {
    // getAllLeads();
  }, [])
  const getAllLeads = async () => {
    try {
      const response = await axios.get(`getLeads`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token, // Add the token to the Authorization header
        }
      });

      const allLeads = response.data.data;


      // Filter leads into two groups: with and without loan amount
      const leadsWithAmount = allLeads.filter(lead => lead.loanAmount > 0 && lead.createdBy === mkc.userName);

      const leadsWithoutAmount = allLeads.filter(lead => {
        const hasCoApplicant = allLeads.some(
          coApp => coApp.leadId === lead.leadId && coApp.applicantTypeCode === 'Co-Applicant'
        );

        return (
          (lead.loanAmount <= 0 || lead.loanAmount === null || lead.loanAmount === undefined) &&
          lead.createdBy === mkc.userName &&
          hasCoApplicant
        );
      });


      // Group leadsWithoutAmount by leadId
      const groupedByLeadId = leadsWithoutAmount.reduce((acc, lead) => {
        if (!acc[lead.leadId]) {
          acc[lead.leadId] = [];
        }
        acc[lead.leadId].push(lead);
        return acc;
      }, {});

      // Convert grouped leads into an array if needed
      const groupedLeadsArray = Object.values(groupedByLeadId);

      // Update states
      // setAllLoeds(leadsWithAmount); // Correct naming if needed
      setLeadsWithLoanAmount(leadsWithAmount); // Correct naming if needed
      // setGroupedLeadsById(groupedLeadsArray);




    } catch (error) {
      console.error('Error fetching leads:', error);
      Alert.alert('Error', 'Failed to fetch leads');
    }
  };

  const filteredData = (leadsWithLoanAmount)
    .filter((item) => {
      // Function to calculate age from date of birth
      const calculateAge = (dob) => {
        const [year, month, day] = dob;
        const birthDate = new Date(year, month - 1, day); // Months are 0-indexed
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--; // Adjust age if the birthday hasn't occurred yet this year
        }
        return age;
      };

      // Check if the search query matches any of the fields: firstName, lastName, leadStatusName, Pan, MobileNumber, Gender, or Age
      if (searchQuery && (
        item?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.leadStatus?.leadStatusName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.pan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.mobileNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.gender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.leadId?.toLowerCase().includes(searchQuery.toLowerCase())
        // (item?.dateOfBirth && calculateAge(item.dateOfBirth) === parseInt(searchQuery))
      )) {
        return true; // If any of these fields match the search, keep the item
      }

      // Otherwise, check if the item is of type 'Applicant' and matches the search query on firstName, lastName, leadStatusName, Pan, MobileNumber, Gender, or Age
      return item?.applicantTypeCode === "Applicant" && (
        item?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.leadStatus?.leadStatusName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.pan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.mobileNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.gender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.leadId?.toLowerCase().includes(searchQuery.toLowerCase())
        // (item?.dateOfBirth && calculateAge(item.dateOfBirth) === parseInt(searchQuery))
      );
    });

  console.log(filteredData, 'filteredDatafilteredData')
  const setFieldValue = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePincodeChange = (item) => {
    setselectedPincode(item.value);
    setpincodelabel(item.label);

    // ✅ Also update formData so the form knows the selected pincode
    setFieldValue("pincode", item.value);
  };

  const handlePincodeChangeco = (item) => {
    setselectedPincodeco(item.value);
    setpincodelabelco(item.label);

    // ✅ Also update formData so the form knows the selected pincode
    setFieldValue("pincodeco", item.value);
  };

  const handlePincodeChangeguar = (item) => {
    setselectedPincodeguar(item.value);
    setpincodelabelguar(item.label);

    // ✅ Also update formData so the form knows the selected pincode
    setFieldValue("pincodeguar", item.value);
  };



  const handlePincodepermanentApplicantChange = (item) => {
    setselectedpincodePermanentApplicant(item.value);
    setpincodelabelPermanentApplicant(item.label);
    setFieldValue("per_pincode", String(item.value)); // Ensure value is always a string
  };

  const handlePincodepermanentCoApplicantChange = (item) => {
    setselectedpincodePermanentCoAPplicant(item.value);
    setpincodelabelPermanentCoAPplicant(item.label);
    setFieldValue("co_per_pincode", String(item.value)); // String type
  };

  const handlePincodepermanentGurantorChange = (item) => {
    setselectedpincodePermanentguar(item.value);
    setpincodelabelPermanentguar(item.label);
    setFieldValue("guar_per_pincode", String(item.value)); // String type
  };




  const colorScheme = useColorScheme();
  const placeholderColor = colorScheme === "dark" ? "#d3d3d3" : "#808080";
  const errorsRef = useRef({});
  const renderInputt = (
    label,
    value,
    setValue,
    editable = true,
    placeholder = "",
    isMobile = false,
    isPan = false,
    isAadhaar = false,
    isEmail = false,
    fieldName,
    isVerified = "",
    required = true,
    multiline = false,
    finaloccupation = "",
    finaloccupationCo = "",
    isgw = false,
    isgp = false,
    isav = false,
    isNumber = false
  ) => {
    const handleAadhaarValidation = (aadhaarValue) => {
      if (aadhaarValue.length > 0 && aadhaarValue.length !== 12) {
        errorsRef.current[fieldName] = "Invalid Aadhaar Number. Must be 12 digits.";
      } else {
        delete errorsRef.current[fieldName];
      }
    };

    const getKeyboardTypeForPan = (panValue) => {
      if (panValue.length < 5) return "default";
      if (panValue.length >= 5 && panValue.length < 9) return "numeric";
      return "default";
    };

    const handleKeyboardDismiss = (newValue, isFieldPan) => {
      if (
        (isFieldPan && newValue.length === 10) ||
        (isMobile && newValue.length === 10) ||
        (isAadhaar && newValue.length === 12)
      ) {
        Keyboard.dismiss();
      }
    };

    let keyboardType = "default";
    if (isgw || isgp || isNumber || isav) keyboardType = "decimal-pad";
    else if (isMobile || isAadhaar) keyboardType = "numeric";
    else if (isPan) keyboardType = getKeyboardTypeForPan(value);

    let maxLength;
    if (isPan) maxLength = 10;
    else if (isMobile) maxLength = 10;
    else if (isAadhaar) maxLength = 12;
    else if (isgp) maxLength = 3;

    return (
      <View >
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>

        <TextInput
          style={[
            styles.inputformodal,
            {
              borderColor: errorsRef.current?.[fieldName] ? "#FF4D4F" : "#ccc",
              backgroundColor: editable ? "#fff" : "#f5f5f5",
              color: editable ? "#000" : "#666",
              minHeight: multiline ? (isSmallScreen ? 50 : 60) : (isSmallScreen ? 36 : 44),
              fontSize: isSmallScreen ? 12 : 14,
              paddingHorizontal: isSmallScreen ? 8 : 10,
            },
          ]}
          value={value || ""}
          onChangeText={(text) => {
            let newValue = text;

            if (isPan)
              newValue = newValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            else if (isMobile || isAadhaar)
              newValue = newValue.replace(/[^0-9]/g, "");
            else if (isgw || isgp || isNumber || isav)
              newValue = newValue.replace(/[^0-9.]/g, "");

            setValue(newValue);
            if (isAadhaar) handleAadhaarValidation(newValue);
            handleKeyboardDismiss(newValue, isPan);
          }}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? "top" : "center"}
          onSubmitEditing={() => {
            if (isPan && value.length === 10) Keyboard.dismiss();
          }}
        />

        {errorsRef.current?.[fieldName] && (
          <Text style={styles.errorText}>
            {errorsRef.current[fieldName]}
          </Text>
        )}
      </View>
    );
  };

  const [documents, setDocuments] = useState({
    "Pan Card": [],
    "Address Proof": [],
    "Selfie": [],
    "Income Proof": [],
  });
  const [confirmRemoveModalVisible, setConfirmRemoveModalVisible] = useState(false);
  const [fileToRemove, setFileToRemove] = useState(null);
  const [fileToRemoveIndex, setFileToRemoveIndex] = useState(null);


  const [activeDocTab, setActiveDocTab] = useState("Pan Card");

  const documentTabs = ["Pan Card", "Address Proof", "Selfie", "Income Proof"];

  const handleDocumentSelection = async (docType) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        allowMultiSelection: true,
      });

      const validFiles = [];
      for (const file of res) {
        let filePath = file.uri;
        if (file.uri.startsWith("content://") && Platform.OS === "android") {
          const localPath = `${RNFS.DocumentDirectoryPath}/${file.Name}`;
          await RNFS.copyFile(file.uri, localPath);
          filePath = localPath;
        }
        validFiles.push({
          uri: `file://${filePath}`,
          Name: file.Name,
          type: file.type || "application/octet-stream",
        });
      }

      setDocuments((prev) => ({
        ...prev,
        [docType]: [...prev[docType], ...validFiles],
      }));
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("Error selecting document:", err);
      }
    }
  };

  const handlePreview = (docType, file) => {
    setPreviewData({ docType, file });
    setPreviewVisible(true);
  };


  const handleRemovePress = (file, index) => {
    setFileToRemove(file);
    setFileToRemoveIndex(index);
    setConfirmRemoveModalVisible(true);
  };

  const confirmRemoveFile = () => {
    setDocuments((prev) => {
      const updatedFiles = [...prev[activeDocTab]];
      updatedFiles.splice(fileToRemoveIndex, 1);
      return {
        ...prev,
        [activeDocTab]: updatedFiles,
      };
    });
    setConfirmRemoveModalVisible(false);
    setFileToRemove(null);
    setFileToRemoveIndex(null);
  };

  const cancelRemoveFile = () => {
    setConfirmRemoveModalVisible(false);
    setFileToRemove(null);
    setFileToRemoveIndex(null);
  };



  const renderDocContent = () => (
    <View style={styles.uploadSection}>
      <Text style={styles.contentText}>Upload {activeDocTab}</Text>

      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={() => handleDocumentSelection(activeDocTab)}
      >
        <Text style={styles.uploadBtnText}>+ Upload {activeDocTab}</Text>
      </TouchableOpacity>

      {documents[activeDocTab]?.length > 0 ? (
        documents[activeDocTab].map((file, index) => (
          <View key={index} style={styles.fileRow}>
            <Text numberOfLines={1} style={styles.fileName}>
              {file.Name}
            </Text>

            <TouchableOpacity onPress={() => handlePreview(activeDocTab, file)}>
              <Text style={styles.previewText}>👁 Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleRemovePress(file, index)}>
              <Text style={[styles.removeText, { color: 'black' }]}>🗑 Remove</Text>
            </TouchableOpacity>

          </View>
        ))
      ) : (
        <Text style={styles.noFileText}>No {activeDocTab} uploaded yet</Text>
      )}
    </View>
  );


  const getAllPincodes = useCallback(async () => {
    try {
      const response = await axios.get(`getAllPincodes`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      const Pincodes = response.data?.data?.content || [];

      const transformedPincodes = Pincodes.map(p => ({ value: p.pincodeId, label: p.pincode }));

      // Batch update all relevant states
      setPincode(transformedPincodes);
      setPincodeco(transformedPincodes);
      setPincodeguar(transformedPincodes);
      setPincodepermaAddressApplicant(transformedPincodes);
      setPincodepermaAddressCoApplicant(transformedPincodes);
      setPincodepermaAddressGurantor(transformedPincodes);

    } catch (error) {
      console.error('Failed to fetch pincodes:', error);
      Alert.alert('Error', 'Failed to fetch Pincodes data');
    }
  }, [token]);

  useEffect(() => {
    // getAllPincodes();
    // getLookupMatserByLookupType();
  }, []);

  useEffect(() => {
    if (activeCust1Tab === 'Applicant') {
      // getAllPincodes();
    }
  }, [activeCust1Tab])

  const getLookupMatserByLookupType = useCallback(async () => {
    try {
      const response = await axios.get(`getLookupMatserByLookupType?lookupType=LoanPurpose`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      const responseData = response.data;
      const LoanPurpose = responseData.data || [];

      const transformedloanPurpose = LoanPurpose.map(loanpurpose => ({
        value: loanpurpose.lookupName, // Extracting pincodeId
        label: loanpurpose.lookupCode        // Extracting pincode
      }));

      setloanPurpose(transformedloanPurpose); // Store both pincode and pincodeId
      setloanPurposeCoapplicant(transformedloanPurpose);
      setloanPurposegurantor(transformedloanPurpose);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch Pincodes data');
    }
  }, []);

  const fetchDataByPincode = async (pincode, type) => {
    if (!pincode) return;

    try {
      const response = await axios.get(
        `findAreaNameCityStateRegionZoneCountryByPincode/${pincode}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );

      const data = response.data.data || { cityName: '', stateName: '', countryName: '', areaName: '' };

      setCategoryData((prev) => ({
        ...prev,
        [type]: data,
      }));

    } catch (error) {
      console.error(error);
      Alert.alert('Error', `Failed to fetch ${type} data by pincode`);
    }
  };


  useEffect(() => {
    fetchDataByPincode(pincodelabel, 'applicant');
  }, [pincodelabel]);


  useEffect(() => {
    fetchDataByPincode(pincodelabelco, 'coApplicant');
  }, [pincodelabelco]);

  useEffect(() => {
    fetchDataByPincode(pincodelabelguar, 'guarantor');
  }, [pincodelabelguar]);



  useEffect(() => {
    fetchDataByPincode(pincodelabelPermanentApplicant, 'applicantpermanent');
  }, [pincodelabelPermanentApplicant]);

  useEffect(() => {
    fetchDataByPincode(pincodelabelPermanentCoAPplicant, 'coApplicantpermanent');
  }, [pincodelabelPermanentCoAPplicant]);

  useEffect(() => {
    fetchDataByPincode(pincodelabelPermanentguar, 'guarantorpermanent');
  }, [pincodelabelPermanentguar]);

  useEffect(() => {
    const { applicant, coApplicant, guarantor, applicantpermanent, coApplicantpermanent, guarantorpermanent } = categoryData;


    setFormData((prev) => ({
      ...prev,

      // Current Address
      Country: applicant?.countryName || '',
      State: applicant?.stateName || '',
      City: applicant?.cityName || '',
      Area: applicant?.areaName || '',

      coCountry: coApplicant?.countryName || '',
      coState: coApplicant?.stateName || '',
      coCity: coApplicant?.cityName || '',
      coArea: coApplicant?.areaName || '',

      guarCountry: guarantor?.countryName || '',
      guarState: guarantor?.stateName || '',
      guarCity: guarantor?.cityName || '',
      guarArea: guarantor?.areaName || '',

      // Permanent Address
      per_pincode: applicantpermanent?.pincode || '',
      per_Area: applicantpermanent?.areaName || '',
      per_City: applicantpermanent?.cityName || '',
      per_State: applicantpermanent?.stateName || '',
      per_Country: applicantpermanent?.countryName || '',

      co_per_pincode: coApplicantpermanent?.pincode || '',
      co_per_Area: coApplicantpermanent?.areaName || '',
      co_per_City: coApplicantpermanent?.cityName || '',
      co_per_State: coApplicantpermanent?.stateName || '',
      co_per_Country: coApplicantpermanent?.countryName || '',

      guar_per_pincode: guarantorpermanent?.pincode || '',
      guar_per_Area: guarantorpermanent?.areaName || '',
      guar_per_City: guarantorpermanent?.cityName || '',
      guar_per_State: guarantorpermanent?.stateName || '',
      guar_per_Country: guarantorpermanent?.countryName || '',
    }));
  }, [categoryData]);


  const mainTabs = useMemo(
    () => [
      {
        id: "cust",
        title: "Customer Acquisition",
        children: [
          { id: "cust-1", title: "Customer Details", },
          { id: "cust-2", title: "Gold Details", },
          { id: "cust-3", title: "Document Upload", },
          { id: "cust-4", title: "KYC & Bureau", },
        ],
      },
      {
        id: "orig",
        title: "Origination",
        children: [
          { id: "orig-1", title: "Gold Valuation", },
          { id: "orig-2", title: "LTV", },
          { id: "orig-3", title: "Loan Details", },
          { id: "orig-4", title: "Packaging", },
        ],
      },
      {
        id: "decision",
        title: "Decision",
        children: [
          { id: "decision-1", title: "Approval", },
          { id: "decision-2", title: "Letter Generation", },
        ],
      },
      {
        id: "disbursal",
        title: "Disbursal",
        children: [{ id: "disb-1", title: "Disbursal", }],
      },
    ],
    []
  );

  const closeModal = () => setModalVisible(false);


  const handleDropdownChange = (field, item, isLoanPurpose = false) => {
    setFieldValue(field, isLoanPurpose ? item.label : item.value);
  };

  const renderStaticInput = (label, value) =>
    renderInputt(label, value, () => { }, false);

  const getAddressKey = (prefix, line) =>
    !prefix ? `addressline${line}` : `${prefix}_addressline${line}`;

  const getTabPrefixMap = {
    Applicant: "",
    "Co-Applicant": "co",
    Guarantor: "guar",
  };

  const getTabMap = {
    Applicant: { key: "pincode", data: Pincode, label: pincodelabel },
    "Co-Applicant": { key: "pincodeco", data: Pincodeco, label: pincodelabelco },
    Guarantor: { key: "pincodeguar", data: Pincodeguar, label: pincodelabelguar },
  };
  const HARD_CODED_ACCESS = {
    cust: "F",
    orig: "F",
    decision: "N",
    disbursal: "N",
  };


  useEffect(() => {
    const objerole = userDetails?.role[0]
    // const access = JSON.parse(objerole.access);
    // const keysWithF = Object.keys(access).filter((key) => access[key] === "F");
    // setAccesTabs(keysWithF)
    const keysWithF = Object.keys(HARD_CODED_ACCESS).filter(
      key => HARD_CODED_ACCESS[key] === "F"
    );

    // setAccesTabs(keysWithF);
    console.log(keysWithF, 'Keys with F');

  }, [userDetails])


  const accessKeyMap = {
    "cust-1": "customeracquisition_customerdetails",
    "cust-2": "customeracquisition_golddetails",
    "cust-3": "customeracquisition_documentupload",
    "cust-4": "customeracquisition_kycbureue",

    "orig-1": "origination_goldvaluation",
    "orig-2": "origination_ltv",
    "orig-3": "origination_loandetails",
    "orig-4": "origination_packaging",

    "decision-1": "decision_approval",
    "decision-2": "decision_lettergeneration",

    "disb-1": "disbursal_disbursal",
  };

  const AccesTabs = [
    "customeracquisition_customerdetails",
    "customeracquisition_golddetails",
    "customeracquisition_documentupload",
    "customeracquisition_kycbureue",

    "origination_goldvaluation",
    "origination_ltv",
    "origination_loandetails",
    "origination_packaging",

    "decision_approval",
    "decision_lettergeneration",

    "disbursal_disbursal"
  ];


  const getAllowedTabs = (tabs, accessTabList) =>
    tabs.filter(tab => {
      const accessKey = accessKeyMap[tab.id];
      return accessTabList.includes(accessKey) || accessTabList.includes(`${tab.id}_all`);
    });

  // Filter mainTabs based on AccesTabs
  const filteredMainTabs = useMemo(() =>
    mainTabs
      .map(main => ({
        ...main,
        children: getAllowedTabs(main.children, AccesTabs),
      }))
      .filter(main => main.children.length > 0),
    [mainTabs, AccesTabs]
  );

  console.log(filteredMainTabs, mainTabs, 'filteredMainTabsfilteredMainTabs')
  const subTabs = useMemo(() => {
    const main = filteredMainTabs.find((m) => m.id === activeMain);
    return main ? main.children : [];
  }, [activeMain, filteredMainTabs]);


  const getFirstAllowedSubForMain = (mainId) => {
    const main = filteredMainTabs.find((m) => m.id === mainId);
    return main?.children[0]?.id || null;
  };

  const onMainTabPress = useCallback((tab) => {
    setActiveMain(tab.id);
    const firstAllowedSub = getFirstAllowedSubForMain(tab.id);
    setActiveSub(firstAllowedSub);
  }, [filteredMainTabs]);

  const onSubTabPress = useCallback((tabId) => setActiveSub(tabId), []);
  const onModalClose = useCallback(() => setPreviewVisible(false), []);
  const onSubTabLayout = useCallback((tabId, e) => {
    const { x, width } = e.nativeEvent.layout;
    subTabMeasurements.current[tabId] = { x, width };

    if (activeSub === tabId) animateIndicatorToSub(tabId);
  }, [activeSub]);


  useEffect(() => {
    if (filteredMainTabs.length === 0) {
      setActiveMain(null);
      setActiveSub(null);
      return;
    }

    const validMain = filteredMainTabs.some((m) => m.id === activeMain);

    if (!validMain) {
      const firstMain = filteredMainTabs[0];
      setActiveMain(firstMain.id);
      setActiveSub(getFirstAllowedSubForMain(firstMain.id));
    } else {
      const validSubs = filteredMainTabs
        .find((m) => m.id === activeMain)
        ?.children.map((c) => c.id);

      if (validSubs && !validSubs.includes(activeSub)) {
        setActiveSub(getFirstAllowedSubForMain(activeMain));
      }
    }
  }, [filteredMainTabs, activeMain, activeSub]);



  useEffect(() => {
    const firstAllowed = getFirstAllowedSubForMain(
      activeMain,
      role
    );
    setActiveSub(firstAllowed);
  }, [activeMain, role, mainTabs]);

  // When user presses a main tab
  const handleMainPress = (tab) => {
    setActiveMain(tab.id);
    const firstAllowed = getFirstAllowedSubForMain(
      tab.id,
      role
    );
    setActiveSub(firstAllowed);
  };

  const renderCheckboxField = (f, idx, onValueChange) => {

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          // borderWidth: 1,
          // borderColor: colorScheme === 'dark' ? '#fff' : '#ccc',
          borderRadius: 6,
          padding: 10,
          marginVertical: 5,
          backgroundColor: colorScheme === 'dark' ? '#222' : '#fff',
        }}
      >
        <CheckBox
          value={formData[f.field] || false}
          onValueChange={onValueChange}
          tintColors={{ true: '#007bff', false: colorScheme === 'dark' ? '#fff' : '#ccc' }}
        />
        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#333', marginLeft: 8 }}>
          {f.label}
        </Text>
      </View>
    );
  };




  const handleSameAsCurrentToggle = (checkboxField, prefix = "") => (isChecked) => {
    if (!checkboxField) return;

    setFieldValue(checkboxField.field, isChecked);

    const mapping = {
      addressline1: "addressline1",
      addressline2: "addressline2",
      addressline3: "addressline3",
      pincode: "pincode",
      Country: "Country",
      City: "City",
      State: "State",
      Area: "Area",
    };

    Object.keys(mapping).forEach((key) => {
      let currentKey = "";
      let permanentKey = "";

      if (prefix === "co") {
        if (key.toLowerCase() === "pincode") currentKey = "pincodeco";
        else if (["addressline1", "addressline2", "addressline3"].includes(key))
          currentKey = `co_${key}`;   // underscore for address lines
        else
          currentKey = `co${key}`;     // no underscore for Area, City, State, Country

        permanentKey = `coper_${mapping[key]}`;
      }
      else if (prefix === "guar") {
        if (key.toLowerCase() === "pincode") currentKey = "pincodeguar";
        else if (["addressline1", "addressline2", "addressline3"].includes(key))
          currentKey = `guar_${key}`;   // underscore for address lines
        else
          currentKey = `guar${key}`;    // no underscore for Area, City, State, Country

        permanentKey = `guarper_${mapping[key]}`;
      }
      else {
        // Applicant
        currentKey = key.toLowerCase() === "pincode" ? "pincode" : key;
        permanentKey = `per_${mapping[key]}`;
      }

      setFieldValue(permanentKey, formData[currentKey] ?? "");

    });

    if (!isChecked) {
      Object.keys(mapping).forEach((key) => {
        let permanentKey = "";
        if (prefix === "co") permanentKey = `coper_${mapping[key]}`;
        else if (prefix === "guar") permanentKey = `guarper_${mapping[key]}`;
        else permanentKey = `per_${mapping[key]}`;

        setFieldValue(permanentKey, "");

      });

      // ✅ Clear selected pincode state
      if (prefix === "co") setselectedpincodePermanentCoAPplicant('');
      else if (prefix === "guar") setselectedpincodePermanentguar('');
      else setselectedpincodePermanentApplicant('');

      // ✅ Clear pincode labels
      if (prefix === "co") setpincodelabelPermanentCoAPplicant('');
      else if (prefix === "guar") setpincodelabelPermanentguar('');
      else setpincodelabelPermanentApplicant('');

      if (prefix === "co") {
        setCategoryData(prev => ({
          ...prev,
          coApplicantpermanent: { cityName: '', stateName: '', countryName: '', areaName: '' }
        }));
      } else if (prefix === "guar") {
        setCategoryData(prev => ({
          ...prev,
          guarantorpermanent: { cityName: '', stateName: '', countryName: '', areaName: '' }
        }));
      } else {
        setCategoryData(prev => ({
          ...prev,
          applicantpermanent: { cityName: '', stateName: '', countryName: '', areaName: '' }
        }));
      }
    }
  };


  // Refs for measurements
  const subTabMeasurements = useRef({});
  const subScrollX = useRef(new Animated.Value(0)).current;
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorY = useRef(new Animated.Value(0)).current;

  const animateIndicatorToSub = (subTabId) => {
    const m = subTabMeasurements.current[subTabId];
    if (!m) return;
    const centerX = m.x + m.width / 2;

    Animated.spring(indicatorX, {
      toValue: centerX,
      useNativeDriver: true,
      stiffness: 220,
      damping: 20,
      mass: 0.7,
    }).start();

    indicatorY.setValue(-8);
    Animated.spring(indicatorY, {
      toValue: 0,
      useNativeDriver: true,
      stiffness: 260,
      damping: 16,
    }).start();
  };

  // Animate when sub changes
  useEffect(() => {
    if (subTabMeasurements.current[activeSub]) {
      animateIndicatorToSub(activeSub);
    }
  }, [activeSub]);





  // Auto-correct activeMain + activeSub if current ones are invalid
  useEffect(() => {
    if (filteredMainTabs.length === 0) {
      setActiveMain(null);
      setActiveSub(null);
      return;
    }

    // check if current activeMain is still valid
    const stillValid = filteredMainTabs.some((m) => m.id === activeMain);

    if (!stillValid) {
      const firstMain = filteredMainTabs[0];
      setActiveMain(firstMain.id);

      const firstAllowed = getFirstAllowedSubForMain(
        firstMain.id,
        role
      );
      setActiveSub(firstAllowed);
    } else {
      // also make sure activeSub is valid under that main
      const validSubs = filteredMainTabs
        .find((m) => m.id === activeMain)
        ?.children.map((c) => c.id);

      if (validSubs && !validSubs.includes(activeSub)) {
        const firstAllowed = getFirstAllowedSubForMain(
          activeMain,
          role
        );
        setActiveSub(firstAllowed);
      }
    }
  }, [filteredMainTabs, activeMain, activeSub, role]);
  const selectedLeadId = useMemo(() => selectedLead?.leadId, [selectedLead]);
  useEffect(() => {
    if (selectedLead) {
      fetchLeadDetails(selectedLeadId);
    }

  }, [selectedLead, selectedLeadId, fetchLeadDetails]);

  const fetchLeadDetails = useCallback(async (leadId) => {
    try {
      const response = await axios.get(`getLeadByLeadId/${leadId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      const lead = response.data.data;
      setleadByLeadiD(lead);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    }
  }, []);

  useEffect(() => {
    // GoldRateAPi();
  }, [])

  const GoldRateAPi = useCallback(async () => {
    try {
      const response = await axios.get(`https://indiagoldratesapi.com/api/latest`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      console.log(response, 'responseresponse')
      const lead = response.data.data;
      setleadByLeadiD(lead);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    }
  }, []);


  const pageFields = {
    "cust-1": {
      Applicant: [
        {
          title: "Personal Details",
          fields: [
            { type: "input", label: "First Name", field: "firstName", placeholder: "Enter First Name", editable: true },
            { type: "input", label: "Middle Name", field: "middleName", placeholder: "Enter Middle Name", editable: true },
            { type: "input", label: "Last Name", field: "lastName", placeholder: "Enter Last Name", editable: true },
            { type: "input", label: "Mobile Number", field: "mobile", isMobile: true, placeholder: "Enter 10-digit Number", editable: true },
            { type: "input", label: "Email", field: "email", placeholder: "Enter Email", editable: true },
            {
              type: "dropdown",
              label: "Gender",
              field: "gender",
              data: [
                { label: "Male", value: "M" },
                { label: "Female", value: "F" },
                { label: "Other", value: "O" },
              ],
              placeholder: "Select Gender",
            },
            { type: "date", label: "Date of Birth", field: "dob" },
            { type: "input", label: "PAN Number", field: "pan", isPan: true, placeholder: "Enter PAN", editable: true },
            { type: "input", label: "Aadhaar Number", field: "aadhaar", isAadhaar: true, placeholder: "Enter Aadhaar Number", editable: true },
            { type: "dropdown", label: "Loan Purpose", field: "loanpurpose", placeholder: "Select Loan Purpose" },
          ],
        },
        {
          title: "Current Address",
          fields: [
            { type: "input", label: "Address Line 1", field: "addressline1", placeholder: "Enter Address Line 1", editable: true },
            { type: "input", label: "Address Line 2", field: "addressline2", placeholder: "Enter Address Line 2", editable: true },
            { type: "input", label: "Address Line 3", field: "addressline3", placeholder: "Enter Address Line 3", editable: true },
            { type: "dropdown", label: "Pincode", field: "pincode", placeholder: "Select Pincode" },
            { type: "input", label: "Country", field: "Country", placeholder: "Enter Country", editable: false },
            { type: "input", label: "City", field: "City", placeholder: "Enter City", editable: false },
            { type: "input", label: "State", field: "State", placeholder: "Enter State", editable: false },
            { type: "input", label: "Area", field: "Area", placeholder: "Enter Area", editable: false },
          ],
        },
        {
          title: "Permanent Address",
          fields: [
            { type: "checkbox", label: "Same as current address", field: "sameAsCurrent" },
            { type: "input", label: "Address Line 1", field: "per_addressline1", placeholder: "Enter Address Line 1", editable: true },
            { type: "input", label: "Address Line 2", field: "per_addressline2", placeholder: "Enter Address Line 2", editable: true },
            { type: "input", label: "Address Line 3", field: "per_addressline3", placeholder: "Enter Address Line 3", editable: true },
            { type: "dropdown", label: "PincodeApplicant", field: "per_pincode", placeholder: "Select Pincode" },
          ],
        },
      ],

      "Co-Applicant": [
        {
          title: "Personal Details",
          fields: [
            { type: "input", label: "First Name", field: "coFirstName", placeholder: "Enter First Name", editable: true },
            { type: "input", label: "Middle Name", field: "coMiddleName", placeholder: "Enter Middle Name", editable: true },
            { type: "input", label: "Last Name", field: "coLastName", placeholder: "Enter Last Name", editable: true },
            { type: "input", label: "Mobile Number", field: "coMobile", isMobile: true, placeholder: "Enter 10-digit Number", editable: true },
            { type: "input", label: "Email", field: "coemail", placeholder: "Enter Email", editable: true },

            {
              type: "dropdown",
              label: "Gender",
              field: "coGender",
              data: [
                { label: "Male", value: "M" },
                { label: "Female", value: "F" },
                { label: "Other", value: "O" },
              ],
              placeholder: "Select Gender",
            },
            { type: "date", label: "Date of Birth", field: "coDob" },
            { type: "input", label: "PAN Number", field: "coPan", isPan: true, placeholder: "Enter PAN", editable: true },
            { type: "input", label: "Aadhaar Number", field: "coAadhaar", isAadhaar: true, placeholder: "Enter Aadhaar Number", editable: true },
            { type: "dropdown", label: "Loan Purpose", field: "coloanpurpose", placeholder: "Select Loan Purpose" },
          ],
        },
        {
          title: "Current Address",
          fields: [
            { type: "input", label: "Address Line 1", field: "co_addressline1", placeholder: "Enter Address Line 1", editable: true },
            { type: "input", label: "Address Line 2", field: "co_addressline2", placeholder: "Enter Address Line 2", editable: true },
            { type: "input", label: "Address Line 3", field: "co_addressline3", placeholder: "Enter Address Line 3", editable: true },
            { type: "dropdown", label: "Pincode", field: "coPincode", placeholder: "Select Pincode" },
            { type: "input", label: "Country", field: "coCountry", placeholder: "Enter Country", editable: false },
            { type: "input", label: "City", field: "coCity", placeholder: "Enter City", editable: false },
            { type: "input", label: "State", field: "coState", placeholder: "Enter State", editable: false },
            { type: "input", label: "Area", field: "coArea", placeholder: "Enter Area", editable: false },
          ],
        },
        {
          title: "Permanent Address",
          fields: [
            { type: "checkbox", label: "Same as current address", field: "co_sameAsCurrent" },
            { type: "input", label: "Address Line 1", field: "co_per_addressline1", placeholder: "Enter Address Line 1", editable: true },
            { type: "input", label: "Address Line 2", field: "co_per_addressline2", placeholder: "Enter Address Line 2", editable: true },
            { type: "input", label: "Address Line 3", field: "co_per_addressline3", placeholder: "Enter Address Line 3", editable: true },
            { type: "dropdown", label: "PincodeCoApplicant", field: "co_per_pincode", placeholder: "Select Pincode" },
          ],
        },
      ],

      Guarantor: [
        {
          title: "Personal Details",
          fields: [
            { type: "input", label: "First Name", field: "guarFirstName", placeholder: "Enter First Name", editable: true },
            { type: "input", label: "Middle Name", field: "guarMiddleName", placeholder: "Enter Middle Name", editable: true },
            { type: "input", label: "Last Name", field: "guarLastName", placeholder: "Enter Last Name", editable: true },
            { type: "input", label: "Mobile Number", field: "guarMobile", isMobile: true, placeholder: "Enter 10-digit Number", editable: true },
            { type: "input", label: "Email", field: "guaremail", placeholder: "Enter Email", editable: true },

            {
              type: "dropdown",
              label: "Gender",
              field: "guarGender",
              data: [
                { label: "Male", value: "M" },
                { label: "Female", value: "F" },
                { label: "Other", value: "O" },
              ],
              placeholder: "Select Gender",
            },
            { type: "date", label: "Date of Birth", field: "guarDob" },
            { type: "input", label: "PAN Number", field: "guarPan", isPan: true, placeholder: "Enter PAN", editable: true },
            { type: "input", label: "Aadhaar Number", field: "guarAadhaar", isAadhaar: true, placeholder: "Enter Aadhaar Number", editable: true },
            { type: "dropdown", label: "Loan Purpose", field: "guarloanpurpose", placeholder: "Select Loan Purpose" },
          ],
        },
        {
          title: "Current Address",
          fields: [
            { type: "input", label: "Address Line 1", field: "guar_addressline1", placeholder: "Enter Address Line 1", editable: true },
            { type: "input", label: "Address Line 2", field: "guar_addressline2", placeholder: "Enter Address Line 2", editable: true },
            { type: "input", label: "Address Line 3", field: "guar_addressline3", placeholder: "Enter Address Line 3", editable: true },
            { type: "dropdown", label: "Pincode", field: "guarPincode", placeholder: "Select Pincode" },
            { type: "input", label: "Country", field: "guarCountry", placeholder: "Enter Country", editable: false },
            { type: "input", label: "City", field: "guarCity", placeholder: "Enter City", editable: false },
            { type: "input", label: "State", field: "guarState", placeholder: "Enter State", editable: false },
            { type: "input", label: "Area", field: "guarArea", placeholder: "Enter Area", editable: false },
          ],
        },
        {
          title: "Permanent Address",
          fields: [
            { type: "checkbox", label: "Same as current address", field: "guar_sameAsCurrent" },
            { type: "input", label: "Address Line 1", field: "guar_per_addressline1", placeholder: "Enter Address Line 1", editable: true },
            { type: "input", label: "Address Line 2", field: "guar_per_addressline2", placeholder: "Enter Address Line 2", editable: true },
            { type: "input", label: "Address Line 3", field: "guar_per_addressline3", placeholder: "Enter Address Line 3", editable: true },
            { type: "dropdown", label: "PincodeGurantor", field: "guar_per_pincode", placeholder: "Select Pincode" },
          ],
        },
      ],
    },


    "cust-2": [
      {
        title: "Gold Details",
        fields: [
          { type: "input", label: "Gold Weight (grams)", field: "goldWeight", isgw: true, placeholder: "Enter weight in grams", editable: true },
          { type: "input", label: "Gold Purity (%)", field: "goldPurity", isgp: true, placeholder: "Enter purity (e.g., 22, 24)", editable: true },
          { type: "input", label: "Gold Type", field: "goldType", placeholder: "e.g., Necklace, Ring, Coin", editable: true },
          { type: "input", label: "Gold Certification Number", field: "goldCertNumber", placeholder: "Enter certification Number", editable: true },
          { type: "input", label: "Gold Brand Name", field: "goldBrandName", placeholder: "Enter brand Name (e.g., Tanishq)", editable: true },
          { type: "input", label: "Gold Market Rate (₹ per gram)", field: "goldMarketRate", placeholder: "Enter market rate", editable: true },
          { type: "input", label: "Gold Serial/Tag Number", field: "goldSerialNumber", placeholder: "Enter serial Number", editable: true },
          {
            type: "dropdown", label: "Gold Category", field: "goldCategory", data: [
              { label: "Jewelry", value: "jewelry" },
              { label: "Coins", value: "coins" },
              { label: "Bars", value: "bars" },
              { label: "Others", value: "others" },
            ],
            placeholder: "Select Category",
          },
          { type: "input", label: "Approximate Value (₹)", field: "goldValue", isav: true, placeholder: "Enter approximate value in INR", editable: true },
          { type: "date", label: "Purchase Date", field: "goldPurchaseDate" },
          {
            type: "dropdown", label: "Storage Location", field: "goldStorage", data: [
              { label: "Home", value: "home" },
              { label: "Bank Locker", value: "bank" },
              { label: "Others", value: "others" },
            ],
            placeholder: "Select storage location",
          },
          { type: "input", label: "Remarks", field: "goldRemarks", placeholder: "Any additional notes", editable: true },
        ],
      },
    ],

    "cust-3": [
      {
        title: "Document Upload",
        fields: [
          { type: "document", label: "Upload Documents" },
          // { type: "input", label: "Document ID", field: "docId", placeholder: "Enter document Number", editable: true },
        ],
      },
    ],

    "cust-4": [
      {
        title: "Empty Section",
        fields: [],
      },
    ],

    "orig-1": [
      {
        title: "Valuation Details",
        fields: [
          { type: "input", label: "Gold Valuer Name", field: "valuerName", placeholder: "Enter valuer Name", editable: true },
          { type: "date", label: "Valuation Date", field: "valuationDate" },
          { type: "input", label: "Valuer Contact Number", field: "valuerContact", placeholder: "Enter contact Number", editable: true },
          { type: "input", label: "Valuation Certificate Number", field: "valuationCertNumber", placeholder: "Enter certificate Number", editable: true },
          { type: "input", label: "Gold Weight Verified (grams)", field: "verifiedWeight", isgw: true, placeholder: "Enter verified weight" },
          { type: "input", label: "Gold Purity Verified (%)", field: "verifiedPurity", isgp: true, placeholder: "Enter verified purity" },
          {
            type: "dropdown", label: "Gold Type Verified", field: "verifiedType", data: [
              { label: "Necklace", value: "necklace" },
              { label: "Ring", value: "ring" },
              { label: "Coin", value: "coin" },
            ],
            placeholder: "Select type",
          },
          { type: "input", label: "Remarks on Valuation", field: "valuationRemarks", placeholder: "Additional remarks", editable: true },
        ],
      },
    ],

    "orig-2": [
      {
        title: "Loan Eligibility",
        fields: [
          { type: "input", label: "Eligible LTV (%)", field: "ltv", placeholder: "Enter LTV", editable: true },
          { type: "input", label: "Eligible Loan Amount", field: "eligibleLoan", placeholder: "Auto-calculated", editable: false },
          { type: "input", label: "Interest Rate (%)", field: "interestRate", placeholder: "Enter interest rate", editable: true },
          { type: "input", label: "Tenure (months)", field: "tenure", placeholder: "Enter tenure", editable: true },
          { type: "input", label: "EMI Amount (₹)", field: "emiAmount", placeholder: "Auto-calculated", editable: false },
          { type: "input", label: "Maximum Loan Amount Allowed", field: "maxLoanAmount", placeholder: "Auto-calculated", editable: false },
          {
            type: "dropdown", label: "Eligible Loan Type", field: "loanType", data: [
              { label: "Personal", value: "personal" },
              { label: "Business", value: "business" },
              { label: "Emergency", value: "emergency" },
            ],
            placeholder: "Select loan type",
          },
          { type: "input", label: "Penalty Rate (%)", field: "penaltyRate", placeholder: "Enter penalty rate", editable: true },
        ],
      },
    ],

    "orig-3": [
      {
        title: "Loan Details",
        fields: [
          { type: "input", label: "Loan Amount", field: "loanAmount", placeholder: "Enter loan amount", editable: true },
          { type: "date", label: "Loan Disbursement Date", field: "loanDisbursementDate" },
          { type: "input", label: "Loan Account Number", field: "loanAccountNumber", placeholder: "Enter account Number", editable: true },
          {
            type: "dropdown", label: "Repayment Frequency", field: "repaymentFrequency", data: [
              { label: "Monthly", value: "monthly" },
              { label: "Quarterly", value: "quarterly" },
              { label: "Half-Yearly", value: "halfyearly" },
              { label: "Annually", value: "annually" },
            ],
            placeholder: "Select repayment frequency",
          },
          { type: "input", label: "Processing Fee (₹)", field: "processingFee", placeholder: "Enter fee", editable: true },
          {
            type: "dropdown", label: "Collateral Verification Status", field: "collateralStatus", data: [
              { label: "Pending", value: "pending" },
              { label: "Verified", value: "verified" },
              { label: "Rejected", value: "rejected" },
            ],
            placeholder: "Select status",
          },
        ],
      },
    ],

    "orig-4": [
      {
        title: "Package Details",
        fields: [
          { type: "input", label: "Package Number", field: "packageNo", placeholder: "Enter package Number", editable: true },
        ],
      },
    ],

    "decision-1": [
      {
        title: "Approval",
        fields: [
          {
            type: "dropdown",
            label: "Approval Status",
            field: "approval",
            data: [
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ],
            placeholder: "Select Status",
          },
        ],
      },
    ],

    "decision-2": [
      {
        title: "Letter Details",
        fields: [
          { type: "input", label: "Letter Reference", field: "letterRef", placeholder: "Enter letter ref no", editable: false },
        ],
      },
    ],

    "disb-1": [
      {
        title: "Disbursal Details",
        fields: [
          { type: "input", label: "Disbursal Amount", field: "disbAmt", placeholder: "Enter amount", editable: false },
        ],
      },
    ],
  };

  const renderFieldSafe = (f, idx) => {
    if (!f) return null;

    let element = null;
    const fieldValue = formData[f.field] ?? "";
    switch (f.type) {
      case "input": {
        const value = formData[f.field] ?? "";

        const editable = f.editable !== false;

        element = renderInputt(
          f.label,
          value,
          (val) => setFieldValue(f.field, val),
          editable,
          f.placeholder,
          f.isMobile,
          f.isPan,
          f.isAadhaar,
          f.isEmail,
          f.field,
          "",
          true,
          false,
          "",
          "",
          f.isgw ?? false,
          f.isgp ?? false,
          f.isav ?? false,
          f.isNumber ?? false
        );
        break;
      }

      // case "dropdown": {
      //   const tabMap = {
      //     Applicant: { key: "pincode", data: Pincode, label: pincodelabel },
      //     "Co-Applicant": { key: "pincodeco", data: Pincodeco, label: pincodelabelco },
      //     Guarantor: { key: "pincodeguar", data: Pincodeguar, label: pincodelabelguar },
      //   };

      //   let dropdownData = f.data || [];
      //   let fieldValue = formData[f.field] ?? "";

      //   if (f.field.toLowerCase().includes("pincode")) {
      //     const tabData = tabMap[activeCust1Tab] || tabMap.Applicant;
      //     dropdownData = tabData.data;
      //     fieldValue = formData[tabData.key] ?? "";
      //   } else if (f.field.toLowerCase().includes("loanpurpose")) {
      //     dropdownData = loanPurpose;
      //   }

      //   let onChange;

      //   if (f.field.toLowerCase().includes("pincode")) {
      //     if (activeCust1Tab === "Co-Applicant") onChange = handlePincodeChangeco;
      //     else if (activeCust1Tab === "Guarantor") onChange = handlePincodeChangeguar;
      //     else onChange = handlePincodeChange;
      //   } else if (f.field.toLowerCase().includes("loanpurpose")) {
      //     // Update formData using the exact field from pageFields
      //     onChange = (item) => setFieldValue(f.field, item.label);
      //   } else {
      //     onChange = (item) => setFieldValue(f.field, item.value);
      //   }

      //   element = renderDropdown(f.label, dropdownData, fieldValue, onChange, f.placeholder);
      //   break;
      // }


      case "dropdown": {
        let dropdownData = f.data || [];
        let currentFieldValue = fieldValue;
        let onChangeFn;

        if (f.field.toLowerCase().includes("pincode")) {
          const tabData = getTabMap[activeCust1Tab] || getTabMap.Applicant;
          dropdownData = tabData.data;
          currentFieldValue = formData[tabData.key] ?? "";

          const pincodeHandlers = {
            "Co-Applicant": handlePincodeChangeco,
            Guarantor: handlePincodeChangeguar,
            Applicant: handlePincodeChange,
          };

          onChangeFn = pincodeHandlers[activeCust1Tab] || handlePincodeChange;
        } else if (f.field.toLowerCase().includes("loanpurpose")) {
          dropdownData = loanPurpose;
          onChangeFn = (item) => handleDropdownChange(f.field, item, true);
        } else {
          onChangeFn = (item) => handleDropdownChange(f.field, item);
        }

        element = renderDropdown(
          f.label,
          dropdownData,
          currentFieldValue,
          onChangeFn,
          f.placeholder
        );
        break;
      }

      case "date":
        element = (
          <DatePickerInput
            label={f.label}
            value={formData[f.field] ?? ""}
            onChange={(val) => setFieldValue(f.field, val)}
          />
        );
        break;

      case "checkbox":
        element = renderCheckboxField(
          f.label,
          fieldValue,
          (val) => setFieldValue(f.field, val)
        );
        break;

      case "document": {
        const documentTabsList = Array.isArray(documentTabs) ? documentTabs : [];
        element = (
          <View style={styles.documentContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.documentTabBar}
            >
              {documentTabsList.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.documentTabItem,
                    activeDocTab === tab && styles.documentTabItemActive,
                  ]}
                  onPress={() => setActiveDocTab(tab)}
                >
                  <Text
                    style={[
                      styles.documentTabText,
                      activeDocTab === tab && styles.documentTabTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.documentContent}>{renderDocContent()}</View>
          </View>
        );
        break;
      }

      default:
        element = null;
    }

    return (
      <View key={f.field || idx}>
        {typeof element === "string" || typeof element === "number" ? (
          <Text>{element}</Text>
        ) : (
          element
        )}
      </View>
    );
  };

  const getStaticFieldValue = (fieldLabel, prefix) => {
    const fieldKeyMap = { country: "Country", state: "State", city: "City", area: "Area" };
    const key = fieldKeyMap[fieldLabel.toLowerCase()] ?? fieldLabel;

    // Try both underscored and non-underscored keys
    return (
      formData[`${prefix}${key}`] ??
      formData[`${prefix}_${key}`] ?? // fallback if your keys have underscores
      ""
    );
  };
  const isSmallScreen = width < 768;
  const renderFieldRow = (fieldsArray) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 5 }}>
      {fieldsArray.map((field, idx) => (
        <View key={field?.field || idx} style={{ flex: 1, paddingHorizontal: 5 }}>
          {/* {field ? renderFieldSafe(field, idx) : null} */}
          {field && renderFieldSafe(field, idx)}
        </View>
      ))}
    </View>
  );


  const renderGenericSection = (section, secIdx) => {
    const fields = section.fields || [];
    const rows = [];

    for (let i = 0; i < fields.length; i += 2) {
      rows.push(
        <View key={`row-${secIdx}-${i}`}>
          {renderFieldRow([fields[i], fields[i + 1]])}
        </View>
      );
    }

    return (
      <View key={`section-${secIdx}`} style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {rows}
      </View>
    );
  };


  const renderPermanentAddressSection = (section, secIdx, prefix, pincodeData) => {
    const fieldsMap = (section.fields || []).reduce((acc, f) => {
      acc[f.field] = f;
      return acc;
    }, {});

    const getPincodeDropdown = () => {
      switch (activeCust1Tab) {
        case "Co-Applicant":
          return renderDropdown(
            "Pincode",
            PincodepermaAddressCoApplicant,
            selectedpincodePermanentCoAPplicant,
            handlePincodepermanentCoApplicantChange,
            "Select Pincode"
          );
        case "Guarantor":
          return renderDropdown(
            "Pincode",
            PincodepermaAddressGurantor,
            selectedpincodePermanentguar,
            handlePincodepermanentGurantorChange,
            "Select Pincode"
          );
        default:
          return renderDropdown(
            "Pincode",
            PincodepermaAddressApplicant,
            selectedpincodePermanentApplicant,
            handlePincodepermanentApplicantChange,
            "Select Pincode"
          );
      }
    };

    const getPincodeLabel = () => {
      switch (activeCust1Tab) {
        case "Co-Applicant":
          return pincodelabelco;
        case "Guarantor":
          return pincodelabelguar;
        default:
          return pincodelabel;
      }
    };


    const renderDynamicStaticFields = () => {
      if (activeCust1Tab === "Applicant") {
        return (
          <>
            <View style={styles.rowContainer}>
              <View style={styles.fieldContainer}>
                {renderInputt("Country", formData?.per_Country, () => { }, false)}
              </View>
              <View style={styles.fieldContainer}>
                {renderInputt("City", formData?.per_City, () => { }, false)}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.fieldContainer}>
                {renderInputt("State", formData?.per_State, () => { }, false)}
              </View>
              <View style={styles.fieldContainer}>
                {renderInputt("Area", formData?.per_Area, () => { }, false)}
              </View>
            </View>
          </>
        );
      } else if (activeCust1Tab === "Co-Applicant") {
        return (
          <>
            <View style={styles.rowContainer}>
              <View style={styles.fieldContainer}>
                {renderInputt("Country", formData?.co_per_Country, () => { }, false)}
              </View>
              <View style={styles.fieldContainer}>
                {renderInputt("City", formData?.co_per_City, () => { }, false)}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.fieldContainer}>
                {renderInputt("State", formData?.co_per_State, () => { }, false)}
              </View>
              <View style={styles.fieldContainer}>
                {renderInputt("Area", formData?.co_per_Area, () => { }, false)}
              </View>
            </View>
          </>
        );
      } else {
        return (
          <>
            <View style={styles.rowContainer}>
              <View style={styles.fieldContainer}>
                {renderInputt("Country", formData?.guar_per_Country, () => { }, false)}
              </View>
              <View style={styles.fieldContainer}>
                {renderInputt("City", formData?.guar_per_City, () => { }, false)}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.fieldContainer}>
                {renderInputt("State", formData?.guar_per_State, () => { }, false)}
              </View>
              <View style={styles.fieldContainer}>
                {renderInputt("Area", formData?.guar_per_Area, () => { }, false)}
              </View>
            </View>
          </>
        );
      }
    };

    const checkboxField = fieldsMap[`${prefix}sameAsCurrent`] || fieldsMap[`${prefix}_sameAsCurrent`];

    const currentAddressFilled = [
      `${prefix}addressline1`,
      `${prefix}_addressline1`,
      `${prefix}addressline2`,
      `${prefix}_addressline2`,
      `${prefix}addressline3`,
      `${prefix}_addressline3`,
      pincodeData.key,
    ].some((key) => (formData[key] ?? "").toString().trim() !== "");

    const sameAsCurrent = formData[checkboxField?.field] ?? false;

    const renderStaticInput = (label, key) =>
      renderInputt(label, formData[key] ?? "", () => { }, false);

    const getAddressKey = (prefix, line) => {
      if (!prefix) return `addressline${line}`; // Applicant
      return `${prefix}_addressline${line}`;    // Co-Applicant / Guarantor
    };
    return (
      <View key={`section-${secIdx}`} style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>

        {currentAddressFilled && checkboxField && (
          <View style={styles.fullWidthFieldContainer}>
            {renderCheckboxField(
              checkboxField,
              0,
              handleSameAsCurrentToggle(checkboxField, prefix)
            )}
          </View>
        )}


        {/* Address Lines */}
        <View style={styles.rowContainer}>
          <View style={styles.fieldContainer}>
            {sameAsCurrent
              ? renderStaticInput("Address Line 1", getAddressKey(prefix, 1))
              : renderFieldSafe(
                fieldsMap[`${prefix}addressline1`] ??
                fieldsMap[`${prefix}_addressline1`] ??
                fieldsMap[`${prefix}per_addressline1`] ??
                fieldsMap[`${prefix}_per_addressline1`],
                1
              )}
          </View>
          <View style={styles.fieldContainer}>
            {sameAsCurrent
              ? renderStaticInput("Address Line 2", getAddressKey(prefix, 2))
              : renderFieldSafe(
                fieldsMap[`${prefix}addressline2`] ??
                fieldsMap[`${prefix}_addressline2`] ??
                fieldsMap[`${prefix}per_addressline2`] ??
                fieldsMap[`${prefix}_per_addressline2`],
                2
              )}
          </View>
        </View>

        <View style={styles.rowContainer}>

          <View style={styles.fieldContainer}>
            {sameAsCurrent
              ? renderStaticInput("Address Line 3", getAddressKey(prefix, 3))
              : renderFieldSafe(
                fieldsMap[`${prefix}addressline3`] ??
                fieldsMap[`${prefix}_addressline3`] ??
                fieldsMap[`${prefix}per_addressline3`] ??
                fieldsMap[`${prefix}_per_addressline3`],
                3
              )}
          </View>
          <View style={styles.fieldContainer}>
            {sameAsCurrent
              ? renderInputt("Pincode", getPincodeLabel(), () => { }, false)
              : getPincodeDropdown()}
          </View>


        </View>

        {/* Static Fields: Only show if per_Area, per_City, per_Country, or per_State have values */}


        {sameAsCurrent ? (
          <>
            <View style={styles.rowContainer}>
              <View style={styles.fieldContainer}>
                {renderInputt("Country", getStaticFieldValue("Country", prefix), () => { }, false)}
              </View>
              <View style={styles.fieldContainer}>
                {renderInputt("City", getStaticFieldValue("City", prefix), () => { }, false)}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.fieldContainer}>
                {renderInputt("State", getStaticFieldValue("State", prefix), () => { }, false)}
              </View>
              <View style={styles.fieldContainer}>
                {renderInputt("Area", getStaticFieldValue("Area", prefix), () => { }, false)}
              </View>
            </View>
          </>
        ) : (
          renderDynamicStaticFields()
        )}

      </View>
    );
  };






  const renderContent = useMemo(() => {
    if (!activeSub) return <Text>No accessible sub-tab for this section</Text>;

    if (activeSub === "cust-1") {
      const subTabs = Object.keys(pageFields["cust-1"]);
      const sections = pageFields["cust-1"]?.[activeCust1Tab] || [];
      const prefix = getTabPrefixMap[activeCust1Tab] || "";
      const pincodeData = getTabMap[activeCust1Tab] || getTabMap.Applicant;

      return (
        <View style={{ flex: 1 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 10 }}>
            {subTabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.custTabItem, activeCust1Tab === tab && styles.activeCustTab]}
                onPress={() => setActiveCust1Tab(tab)}
              >
                <Text style={[styles.custTabText, activeCust1Tab === tab && styles.activeCustTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {sections.map((section, secIdx) =>
              section.title.toLowerCase().includes("permanent address")
                ? renderPermanentAddressSection(section, secIdx, prefix, pincodeData)
                : renderGenericSection(section, secIdx)
            )}
          </ScrollView>
        </View>
      );
    }

    const sections = Array.isArray(pageFields[activeSub]) ? pageFields[activeSub] : [];
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {sections.map((section, secIdx) => renderGenericSection(section, secIdx))}
      </ScrollView>
    );
  }, [activeSub, formData, activeDocTab, documents, Pincode, Pincodeco, Pincodeguar, loanPurpose, activeCust1Tab]);


  const subScrollRef = useRef(null);
  const [isSubScrollable, setIsSubScrollable] = useState(true);
  const subTabsWidthRef = useRef(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // 1️⃣ Whenever main tab changes, reset scroll & active sub-tab
  useEffect(() => {
    if (subScrollRef.current) {
      if (subTabs.length > 0) {
        const firstTabId = subTabs[0].id;
        setActiveSub(firstTabId);
        animateIndicatorToSub(firstTabId);

        // Scroll to start
        subScrollRef.current.scrollTo({ x: 0, animated: true });
      }
    }
  }, [activeMain]);

  // 2️⃣ Calculate if scrolling is needed
  useEffect(() => {
    setIsSubScrollable(subTabsWidthRef.current > containerWidth);
  }, [subTabsWidthRef.current, containerWidth, subTabs]);

  const submitLead = async () => {
    try {
      // 1. Collect main form data
      const payload = {
        applicant: {
          firstName: formData.firstName ?? "",
          middleName: formData.middleName ?? "",
          lastName: formData.lastName ?? "",
          mobile: formData.mobile ?? "",
          email: formData.email ?? "",
          gender: formData.gender ?? "",
          dob: formData.dob ?? "",
          aadhaar: formData.aadhaar ?? "",
          pan: formData.pan ?? "",
          loanPurpose: formData.loanpurpose ?? "",

          // Current Address
          pincode: pincodelabel ?? "",
          pincodeId: formData.pincode ?? "",
          country: formData.Country ?? "",
          state: formData.State ?? "",
          city: formData.City ?? "",
          area: formData.Area ?? "",
          addressline1: formData?.addressline1 ?? "",
          addressline2: formData?.addressline2 ?? "",
          addressline3: formData?.addressline3 ?? "",

          // Permanent Address
          sameAsCurrent: formData.sameAsCurrent ?? false,
          per_addressLine1: formData.per_addressline1 ?? "",
          per_addressLine2: formData.per_addressline2 ?? "",
          per_addressLine3: formData.per_addressline3 ?? "",
          per_pincode: pincodelabelPermanentApplicant ?? "",
          per_pincodeid: formData.per_pincode ?? formData.pincode ?? "",
          per_country: formData.per_Country ?? formData.Country ?? "",
          per_state: formData.per_State ?? formData.State ?? "",
          per_city: formData.per_City ?? formData.City ?? "",
          per_area: formData.per_Area ?? formData.Area ?? "",
        },

        coApplicant: {
          firstName: formData.coFirstName ?? "",
          middleName: formData.coMiddleName ?? "",
          lastName: formData.coLastName ?? "",
          mobile: formData.coMobile ?? "",
          email: formData.coemail ?? "",
          gender: formData.coGender ?? "",
          dob: formData.coDob ?? "",
          aadhaar: formData.coAadhaar ?? "",
          pan: formData.coPan ?? "",
          loanPurpose: formData.coloanpurpose ?? "",

          // Current Address
          pincode: pincodelabelco ?? "",
          pincodeid: formData.pincodeco ?? "",
          country: formData.coCountry ?? "",
          state: formData.coState ?? "",
          city: formData.coCity ?? "",
          area: formData.coArea ?? "",
          addressline1: formData?.co_addressline1 ?? "",
          addressline2: formData?.co_addressline2 ?? "",
          addressline3: formData?.co_addressline3 ?? "",

          // Permanent Address
          sameAsCurrent: formData.co_sameAsCurrent ?? false,
          per_addressLine1: formData.co_per_addressline1 ?? "",
          per_addressLine2: formData.co_per_addressline2 ?? "",
          per_addressLine3: formData.co_per_addressline3 ?? "",
          per_pincode: pincodelabelPermanentCoAPplicant ?? "",
          per_pincodeid: formData.co_per_pincode ?? formData.pincodeco ?? "",
          per_country: formData.co_per_Country ?? formData.coCountry ?? "",
          per_state: formData.co_per_State ?? formData.coState ?? "",
          per_city: formData.co_per_City ?? formData.coCity ?? "",
          per_area: formData.co_per_Area ?? formData.coArea ?? "",
        },

        guarantor: {
          firstName: formData.guarFirstName ?? "",
          middleName: formData.guarMiddleName ?? "",
          lastName: formData.guarLastName ?? "",
          mobile: formData.guarMobile ?? "",
          email: formData.guaremail ?? "",
          gender: formData.guarGender ?? "",
          dob: formData.guarDob ?? "",
          aadhaar: formData.guarAadhaar ?? "",
          pan: formData.guarPan ?? "",
          loanPurpose: formData.guarloanpurpose ?? "",

          // Current Address
          pincode: pincodelabelguar ?? "",
          pincodeid: formData.pincodeguar ?? "",
          country: formData.guarCountry ?? "",
          state: formData.guarState ?? "",
          city: formData.guarCity ?? "",
          area: formData.guarArea ?? "",
          addressline1: formData?.guar_addressline1 ?? "",
          addressline2: formData?.guar_addressline2 ?? "",
          addressline3: formData?.guar_addressline3 ?? "",

          // Permanent Address
          sameAsCurrent: formData.guar_sameAsCurrent ?? false,
          per_addressLine1: formData.guar_per_addressline1 ?? "",
          per_addressLine2: formData.guar_per_addressline2 ?? "",
          per_addressLine3: formData.guar_per_addressline3 ?? "",
          per_pincode: pincodelabelPermanentguar ?? "",
          per_pincodeid: formData.guar_per_pincode ?? "",
          per_country: formData.guar_per_Country ?? formData.guarCountry ?? "",
          per_state: formData.guar_per_State ?? formData.guarState ?? "",
          per_city: formData.guar_per_City ?? formData.guarCity ?? "",
          per_area: formData.guar_per_Area ?? formData.guarArea ?? "",
        },
        origination: {
          goldValuerName: formData.valuerName ?? "",
          valuationDate: formData.valuationDate ?? "",
          verifiedWeight: formData.verifiedWeight ?? "",
          verifiedPurity: formData.verifiedPurity ?? "",
          verifiedType: formData.verifiedType ?? "",
          ltv: formData.ltv ?? "",
          eligibleLoan: formData.eligibleLoan ?? "",
          interestRate: formData.interestRate ?? "",
          tenure: formData.tenure ?? "",
          emiAmount: formData.emiAmount ?? "",
          loanAmount: formData.loanAmount ?? "",
          packageNo: formData.packageNo ?? "",
        },
        goldDetails: {
          goldWeight: formData.goldWeight,
          goldPurity: formData.goldPurity,
          goldType: formData.goldType,
          goldCategory: formData.goldCategory,
          goldValue: formData.goldValue,
          goldPurchaseDate: formData.goldPurchaseDate,
          goldStorage: formData.goldStorage,
          goldRemarks: formData.goldRemarks,
        },
        // documents: {
        //   docId: formData.docId,
        //   // For actual file uploads, handle FormData separately
        // },
        decision: {
          approval: formData.approval,
          letterRef: formData.letterRef,
        },
        disbursal: {
          disbAmt: formData.disbAmt,
        },
      };



      // 2. Send POST request
      const response = await axios.post(
        "http://180.179.23.105:5050/ahfplLosSecureBE/api/v1/lead",
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );


      alert("Lead submitted successfully!");
    } catch (error) {
      console.error("Error submitting lead:", error.response || error);
      alert("Failed to submit lead");
    }
  };

  const fetchApplicantDataByPincode = useCallback(async (pincodeId, setState) => {
    if (!pincodeId) {
      console.warn("Pincode ID is not available.");
      return;
    }
    try {
      const response = await axios.get(`findAreaNameCityStateRegionZoneCountryByPincode/${pincodeId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token, // Add the token to the Authorization header
          }
        }
      );
      setState({ data: response.data.data });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch application data for pincode');
    }
  }, []);

  useEffect(() => {
    if (SelectedLeadApplicant?.pincodeId) {
      fetchApplicantDataByPincode(SelectedLeadApplicant.pincodeId, setFindApplicantByCategoryCodView);
    }
  }, [SelectedLeadApplicant?.pincodeId, fetchApplicantDataByPincode]);

  useEffect(() => {
    if (selectedCoApplicant?.pincodeId) {
      fetchApplicantDataByPincode(selectedCoApplicant.pincodeId, setcoFindApplicantByCategoryCodView);
    }
  }, [selectedCoApplicant?.pincodeId, fetchApplicantDataByPincode]);


  // Memoized Handlers
  const handleMainPressMemo = useCallback((tab) => handleMainPress(tab), [handleMainPress]);
  const handleSubPressMemo = useCallback((tabId) => setActiveSub(tabId), []);
  const handleModalClose = useCallback(() => setPreviewVisible(false), []);
  const handleSubmitLead = () => submitLead();
  const handleSearchChange = (query) => handleSearch(query);
  const sharedModalStyle = {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  };
  // Connector Styles
  const connectorTransformStyle = {
    transform: [
      {
        translateX: Animated.add(indicatorX, Animated.multiply(subScrollX, -1)),
      },
    ],
  };
  const triangleTransformStyle = { transform: [{ translateY: indicatorY }] };

  // Memoized Main Tabs
  const renderedMainTabs = useMemo(() =>
    filteredMainTabs.map((tab) => {
      const isActive = activeMain === tab.id;

      return (
        <TouchableOpacity
          key={tab.id}
          style={[styles.mainTab, isActive && styles.activeMainTab]}
          onPress={() => onMainTabPress(tab)}
          activeOpacity={0.8}
        >
          <Text style={[styles.mainTabText, isActive && styles.activeMainTabText]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      );
    }),
    [filteredMainTabs, activeMain, onMainTabPress]
  );

  console.log(renderedMainTabs, filteredMainTabs, activeMain, 'renderedMainTabsrenderedMainTabs')

  // Memoized Sub Tabs
  const renderedSubTabs = useMemo(() =>
    subTabs.map((tab) => {
      const isActive = activeSub === tab.id;

      return (
        <TouchableOpacity
          key={tab.id}
          style={[styles.subTab, isActive && styles.activeSubTabdoc]}
          onPress={() => onSubTabPress(tab.id)}
          activeOpacity={0.8}
          onLayout={(e) => onSubTabLayout(tab.id, e)}
        >
          <Text style={[styles.subTabText, isActive && styles.activeSubTabTextdoc]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      );
    }),
    [subTabs, activeSub, onSubTabPress, onSubTabLayout]
  );


  const formatDate = (dateArray) => {
    if (Array.isArray(dateArray) && dateArray.length === 3) {
      const [year, month, day] = dateArray;

      // Create the date without time zone conversion
      const date = new Date(year, month - 1, day);

      // Extract the date parts (year, month, day) and format as YYYY-MM-DD
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

      return formattedDate;
    }
    return 'N/A'; // Default value if dateArray is invalid
  };

  const renderInput = (label, value, isValid = false, editable = false, multiline = false) => (
    <View style={styles.inputField}>
      <Text style={styles.labelformodal}>
        {label}
        {isValid && (
          <Image
            source={require('../asset/greencheck.png')}
            style={styles.checkIcon}
          />
        )}
      </Text>

      <TextInput
        style={[
          styles.inputformodaliui,
          multiline && styles.inputMultiline,
          !editable && { backgroundColor: "#f0f0f0" }, // grey-out if not editable
        ]}
        value={value ? String(value) : ""}
        editable={editable}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor="#888"
      />
    </View>
  );

  const handleCardPress = (item) => {
    // Log before setting state
    setSelectedLead(item);  // Set selected lead
    setisModalVisible(true);  // Show modal
  };
  const LeadCard = ({ item }) => {

    const [expandedItem, setExpandedItem] = useState("");
    const toggleExpand = (itemId) => {
      setExpandedItem(prevState => prevState === itemId ? "" : itemId);
    };
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
        {/* Collapsed View */}

        <View style={styles.collapsedHeader}>
          <View>
            {item?.organizationName ? (
              <Text style={styles.cardTitle}>
                Organization Name:{""}
                <Text style={styles.cardText}>{item.organizationName}</Text>
              </Text>
            ) : (
              <Text style={styles.cardTitle}>
                Lead Name:{""}
                <Text style={styles.cardText}>
                  {item?.firstName} {item?.lastName}
                </Text>
              </Text>
            )}

            <Text style={styles.cardTitle}>
              ID: <Text style={styles.cardText}>{item.leadId}</Text>
            </Text>

            {item?.enquiryId && (
              <Text style={styles.cardTitle}>
                Enquiry Id: <Text style={styles.cardText}>{item.enquiryId}</Text>
              </Text>
            )}

            {item?.applicantCategoryCode && (
              <Text style={styles.cardTitle}>
                Applicant Category:{""}
                <Text style={styles.cardText}>{item.applicantCategoryCode}</Text>
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <Text style={styles.expandIcon}>
              {expandedItem === item.id ? '▲' : '▼'} {/* Toggle icon */}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expanded View */}
        {expandedItem === item.id && (

          <View style={styles.expandedContent}>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Gender:</Text>
              <Text style={styles.cardValue}>{item?.gender || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>MobileNumber:</Text>
              <Text style={styles.cardValue}>{item?.mobileNo || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Email:</Text>
              <Text style={styles.cardValue}>{item?.email || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Lead Stage:</Text>
              <Text style={styles.cardValue}>{item?.leadStage || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Lead Status:</Text>
              <Text style={styles.cardValue}>{item?.leadStatus?.leadStatusName || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>PAN:</Text>
              <Text style={styles.cardValue}>{item.pan || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.cardLabel}>Assigned To:</Text>
              <Text style={styles.cardValue}>
                {item.assignTo?.firstName || ''} {item.assignTo?.lastName || ''}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Section wrapp with bordered design
  const Section = ({ title, children }) => (
    <View style={{
      borderWidth: 2,
      borderColor: '#007bff',
      borderRadius: 10,
      marginVertical: 8,
      backgroundColor: '#f9fbff', // soft background for contrast
      paddingVertical: 10,
      paddingHorizontal: 10
    }}>
      <Text style={{
        color: '#007bff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        paddingLeft: 5
      }}>
        {title}
      </Text>
      {children}
    </View>
  );

  // Dynamic field rendering
  const renderRows = (fields, columns = 2, spacing = 10) => {
    if (!fields || fields.length === 0) return null;

    const rows = [];
    for (let i = 0; i < fields.length; i += columns) {
      rows.push(
        <View key={i} style={{ flexDirection: 'row', marginBottom: spacing }}>
          {fields.slice(i, i + columns).map((field, idx) => (
            <View key={idx} style={{ flex: 1, paddingHorizontal: spacing / 2 }}>
              {field}
            </View>
          ))}
          {/* Fill empty columns if needed */}
          {fields.slice(i, i + columns).length < columns &&
            Array(columns - fields.slice(i, i + columns).length)
              .fill(null)
              .map((_, idx) => (
                <View key={`empty-${idx}`} style={{ flex: 1, paddingHorizontal: spacing / 2 }} />
              ))}
        </View>
      );
    }

    return rows;
  };

  const DynamicFields = ({ fields, columns = 2 }) => {
    const renderedFields = fields
      .map(f => {
        if (!f.value) return null;

        if (f.extra) {
          return (
            <View key={f.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {renderInput(f.label, f.value, f.verified || false, false)}
              {f.extra(handleDownloadCibilFile)}
            </View>
          );
        }

        return renderInput(f.label, f.value, f.verified || false, false);
      })
      .filter(Boolean);

    return <>{renderRows(renderedFields, columns)}</>;
  };

  // Basic Info Section
  const BasicInfoSection = ({ applicant }) => {
    const isDataReady =
      applicant &&
      (applicant.firstName || applicant.lastName) &&
      applicant.dateOfBirth
    // applicant.mobileNo &&
    // applicant.email;

    if (!isDataReady) {
      return (
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, color: '#888' }}>Loading Basic Information...</Text>
        </View>
      );
    }

    const fieldsData = [
      { label: "Name", value: `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() },
      { label: "Organization Name", value: applicant.organizationName },
      { label: applicant.organizationName ? "Incorporation Date" : "Date of Birth", value: formatDate(applicant.dateOfBirth) },
      ...(applicant.applicantCategoryCode === "Organization" ? [
        { label: "Organization Type", value: applicant.organizationType },
        { label: "Registration Number", value: applicant.registrationNumber },
        { label: "CIN Number", value: applicant.cin },
        { label: "Industry Type", value: applicant.industryType },
        { label: "Contact Person", value: applicant.contactPersonName },
        { label: "Designation", value: applicant.contactPersonDesignation },
      ] : []),
      { label: "Primary Occupation", value: applicant.primaryOccupation },
      { label: "Mobile No", value: applicant.mobileNo, verified: applicant.isMobileVerified },
      { label: "Gender", value: applicant.gender },
      { label: "Email", value: applicant.email, verified: applicant.emailVerified },
    ];

    return <DynamicFields fields={fieldsData} />;
  };

  // KYC Section
  const KYCSection = ({ applicant }) => {
    const isDataReady =
      applicant &&
      (applicant.pan) &&
      applicant.aadhar

    if (!isDataReady) {
      return (
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, color: '#888' }}>Loading KYC Information...</Text>
        </View>
      );
    }

    const fieldsData = [
      { label: "PAN", value: applicant.pan, verified: applicant.isPanVerified },
      { label: "Aadhar", value: applicant.aadhar },
    ];
    return <DynamicFields fields={fieldsData} columns={2} />;
  };

  // Location Section
  const LocationSection = ({ applicant, locationData }) => {

    const isDataReady =
      locationData &&
      (locationData.pincode) &&
      (locationData.countryName) &&
      (locationData.cityName) &&
      (locationData.stateName) &&
      (locationData.areaName) &&
      (locationData.regionName)

    if (!isDataReady) {
      return (
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, color: '#888' }}>Loading Location Information...</Text>
        </View>
      );
    }
    const fieldsData = [
      { label: "Pincode", value: locationData?.pincode },
      { label: "Country", value: locationData?.countryName },
      { label: "City", value: locationData?.cityName },
      { label: "State", value: locationData?.stateName },
      { label: "Area", value: locationData?.areaName },
      { label: "Region", value: locationData?.regionName },
      { label: "Zone", value: locationData?.zoneName },
    ].filter(field => field.value); // removes empty/null values

    return <DynamicFields fields={fieldsData} columns={2} />;
  };

  // Lead Info Section
  // const LeadInfoSection = ({ fields }) => <DynamicFields fields={fields} columns={2} />;
  const LeadInfoSection = ({ fields }) => {
    const isDataReady = fields && fields.length > 0;

    if (!isDataReady) {
      return (
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, color: '#888' }}>Loading lead information</Text>
        </View>
      );
    }

    return <DynamicFields fields={fields} columns={2} />;
  };


  // Function to generate Lead Information fields dynamically
  const leadFields = (applicant, cibilFiles) => [
    { label: "Category Type", value: applicant?.applicantCategoryCode },
    { label: "Lead Source", value: applicant?.leadSourceName },
    { label: "Lead Status", value: applicant?.leadStatusName },
    { label: "Lead Stage", value: applicant?.leadStage },
    { label: "Lead ID", value: applicant?.leadId },
    { label: "Assigned To", value: applicant?.assignTo },
    { label: "Created By", value: applicant?.createdBy },
    { label: "CIBIL Score", value: applicant?.cibilScore },
    { label: "CRIF Score", value: applicant?.crifScore },
    { label: "Portfolio", value: applicant?.portfolioName },
    { label: "Product", value: applicant?.productName },
    { label: "Loan Amount", value: applicant?.loanAmount },
    { label: "Application Number", value: applicant?.appId },
    applicant?.convertedFromEnquiry !== undefined
      ? { label: "Converted From Enquiry", value: applicant?.convertedFromEnquiry ? "YES" : "NO" }
      : null,
    applicant?.enquiryId ? { label: "Enquiry ID", value: applicant?.enquiryId } : null,
    applicant?.rejectReason ? { label: "Reject Reason", value: applicant?.rejectReason } : null,

    ...(cibilFiles?.length > 0 ? [{
      label: "CIBIL File",
      value: cibilFiles.map(item => `\u2022 ${item.description}`).join("\n"),
      extra: (handleDownloadCibilFile) => (
        <TouchableOpacity
          style={styles.downloadbutton}
          onPress={() => handleDownloadCibilFile(cibilFiles)}
        >
          <Image
            source={require("../asset/download.png")}
            style={{ width: 24, height: 24, tintColor: "#FFFFFF" }}
          />
        </TouchableOpacity>
      )
    }] : [])
  ].filter(Boolean);



  const renderTabContent = (tab) => {
    const data = tab === 'Applicant' ? SelectedLeadApplicant : selectedCoApplicant;
    const location = tab === 'Applicant' ? findApplicantByCategoryCodeview : cofindApplicantByCategoryCodView;
    const downloadCibil = tab === 'Applicant' ? downloadCibilReportApplicant : downloadCibilReportCoApplicant;

    if (isLoading) {
      return (
        <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, color: '#888' }}>Loading data, please wait...</Text>
        </View>
      );
    }

    return (
      <>
        <Section title="Basic Information">
          <BasicInfoSection applicant={data} />
        </Section>

        <Section title="KYC Detail">
          <KYCSection applicant={data} />
        </Section>

        <Section title="Location Detail">
          <LocationSection applicant={data} locationData={location?.data} />
        </Section>

        <Section title="Lead Information">
          <LeadInfoSection
            fields={leadFields(tab === 'Applicant' ? SelectedLeadApplicant : selectedCoApplicant, downloadCibil)}
          />

          {downloadCibil?.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12, marginTop: 10 }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: 'black', fontWeight: '500', fontSize: 12, marginBottom: 4 }}>
                  CIBIL File
                </Text>
                <TextInput
                  style={{
                    borderRadius: 5,
                    fontSize: 12,
                    backgroundColor: '#f9f9f9',
                    color: 'black',
                    padding: 6,
                    fontWeight: 'bold',
                    textAlignVertical: 'top',
                    minHeight: 40,
                  }}
                  value={downloadCibil.map(item => `\u2022 ${item.description}`).join('\n')}
                  editable={false}
                  multiline
                  placeholder="CIBIL File"
                  placeholderTextColor="#aaa"
                />
              </View>

              <TouchableOpacity
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#007bff',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleDownloadCibilFile(downloadCibil)}
              >
                <Image
                  source={require('../asset/download.png')}
                  style={{ width: 20, height: 20, tintColor: '#fff' }}
                />
              </TouchableOpacity>
            </View>
          )}
        </Section>

      </>
    );
  };


  const onCloseotp = () => {
    setVisible(false);
    setModalType(null);
    setOtpApplicant(['', '', '', '']);
    setOtpCoApplicant(['', '', '', '']);
    setotpGurantor(['', '', '', ''])
  }

  useEffect(() => {
    setPreviewVisible(false);
    setPreviewData({ docType: null, file: null });
  }, [activeDocTab]);


  return (


    <View style={styles.container}>

      <View style={styles.firstrow}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Lead List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <LeadCard item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No data available</Text>
        }
      />

      {/* Loading Modal */}
      <Modal transparent visible={isLoadingsendotp}>
        <View style={styles.loaderFullScreen}>
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#040675FF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      </Modal>

      {/* Detail Modal (Applicant / Co-Applicant) */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.modalContainerdetail}>
          <View style={styles.modalContentdetail}>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTabView === 'Applicant' && styles.activeTab]}
                onPress={() => setActiveTabView('Applicant')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTabView === 'Applicant' && styles.activeTabText,
                  ]}
                >
                  Applicant
                </Text>
              </TouchableOpacity>

              {selectedCoApplicant && Object.keys(selectedCoApplicant).length > 0 && (
                <TouchableOpacity
                  style={[styles.tab, activeTabView === 'Co-Applicant' && styles.activeTab]}
                  onPress={() => setActiveTabView('Co-Applicant')}
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

            {/* Tab Content */}
            <ScrollView>
              {renderTabContent(activeTabView)}

              <View
                style={{
                  marginVertical: 5,
                  marginBottom: 35,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Confirm Remove File Modal */}
      <Modal
        visible={confirmRemoveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelRemoveFile}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {fileToRemove?.type.startsWith('image/') && (
              <Image
                source={{ uri: fileToRemove.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.modalText}>
              Are you sure you want to remove this file?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelRemoveFile}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} onPress={confirmRemoveFile}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview File Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {previewData?.uri && (
              <Image
                source={{ uri: previewData.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={handleModalClose}>
              <Text style={styles.closeBtnText}>❌ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Full screen overlay */}
        <View style={{ flex: 1, backgroundColor: '#eee' }}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 10,
              backgroundColor: '#eee',
              width: 30,
              height: 30,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 5,
            }}
            onPress={closeModal}
          >
            <Text style={{ fontSize: 16 }}>❌</Text>
          </TouchableOpacity>

          {/* Modal content wrapper */}
          <SafeAreaView style={{ flex: 1 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#EEEEEEFF',
                margin: 5,
                borderRadius: 10,
                padding: 5,
                overflow: 'hidden',
              }}
            >
              {/* Main Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mainTabsRow}
              >
                {renderedMainTabs}
              </ScrollView>

              {/* Sub Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mainTabsRow}
              >
                {renderedSubTabs}
              </ScrollView>

              {/* Content */}
              <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 10 }}>
                {renderContent}
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitBtn} onPress={submitLead}>
                <Text style={{ color: 'black' }}>Submit Lead</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={visible}
        animationType="slide"
        onRequestClose={onCloseotp}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>

            {/* Modal Title */}
            <Text style={styles.label}>
              {modalType === 'applicant'
                ? 'OTP Verification Applicant'
                : modalType === 'coApplicant'
                  ? 'OTP Verification Co-Applicant'
                  : 'OTP Verification Guarantor'}
            </Text>

            <View style={styles.content}>
              <View style={styles.inputContainergg}>
                <View style={styles.otpBoxContainer}>
                  {[...Array(4)].map((_, index) => (
                    <TextInput
                      key={index}
                      style={styles.otpInput}
                      placeholder="0"
                      placeholderTextColor="#A9A9A9"
                      value={
                        modalType === 'applicant'
                          ? otpApplicant[index]
                          : modalType === 'coApplicant'
                            ? otpCoApplicant[index]
                            : otpGurantor[index]
                      }
                      onChangeText={(text) => handleOtpChange(text, modalType, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      onKeyPress={({ nativeEvent }) => {
                        const currentOtp =
                          modalType === 'applicant'
                            ? otpApplicant[index]
                            : modalType === 'coApplicant'
                              ? otpCoApplicant[index]
                              : otpGurantor[index];

                        if (nativeEvent.key === 'Backspace' && currentOtp === '') {
                          if (index > 0) {
                            otpInputs.current[index - 1].focus();
                          }
                        }
                      }}
                      ref={(ref) => (otpInputs.current[index] = ref)}
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
                      (!isOtpFilled ||
                        (modalType === 'applicant'
                          ? isVerifyingOtpApplicant
                          : modalType === 'coApplicant'
                            ? isVerifyingOtpCoApplicant
                            : isVerifyingOtpGurantor)) &&
                      styles.disabledButton
                    ]}
                    onPress={() => handleVerifyOtp(modalType)}
                    disabled={!isOtpFilled}
                  >
                    {(modalType === 'applicant'
                      ? isVerifyingOtpApplicant
                      : modalType === 'coApplicant'
                        ? isVerifyingOtpCoApplicant
                        : isVerifyingOtpGurantor) ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Verify</Text>
                    )}
                  </TouchableOpacity>


                )}

                <TouchableOpacity style={styles.closeButton} onPress={onCloseotp}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>


    </View>


  );
};

const styles = StyleSheet.create({
  mainTabsRow: { flexGrow: 0, backgroundColor: "#E7E6E6FF", paddingVertical: isSmallScreen ? 6 : 10 },
  mainTab: { marginHorizontal: 8, paddingVertical: isSmallScreen ? 6 : 8, paddingHorizontal: isSmallScreen ? 10 : 15, borderRadius: 6, backgroundColor: "#eee" },
  activeMainTab: { backgroundColor: "#007bff" },
  mainTabText: { fontSize: isSmallScreen ? 14 : 16, color: "#333" },
  activeMainTabText: { color: "#fff", fontWeight: "bold" },

  connectorWrapper: { position: 'absolute', top: isSmallScreen ? 40 : 46, alignItems: 'center', zIndex: 10 },
  connectorLine: { width: 2, height: isSmallScreen ? 8 : 10, backgroundColor: '#007AFF' },
  triangleIndicator: { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#007AFF', marginTop: -1 },

  subTabsRow: { flexGrow: 0, marginVertical: 6, backgroundColor: "#DFDFDFFF", paddingVertical: isSmallScreen ? 6 : 8 },
  subTab: { marginHorizontal: 8, paddingVertical: isSmallScreen ? 4 : 6, paddingHorizontal: isSmallScreen ? 8 : 12, borderRadius: 6, backgroundColor: "#eee" },
  subTabText: { fontSize: isSmallScreen ? 12 : 14, color: "#333" },

  label: { fontSize: isSmallScreen ? 10 : 12, fontWeight: "600", marginBottom: 4, color: "#333" },

  uploadSection: { marginTop: isSmallScreen ? 12 : 20, padding: isSmallScreen ? 10 : 15, backgroundColor: "#f9f9f9", borderRadius: 8 },
  contentText: { fontSize: isSmallScreen ? 16 : 18, fontWeight: "600", marginBottom: isSmallScreen ? 8 : 10, color: '#ccc' },
  uploadBtn: { backgroundColor: "#007bff", padding: isSmallScreen ? 10 : 12, borderRadius: 8, alignItems: "center", marginBottom: isSmallScreen ? 10 : 15 },
  uploadBtnText: { color: "#fff", fontSize: isSmallScreen ? 14 : 16, fontWeight: "500" },

  fileRow: { flexDirection: "row", justifyContent: "space-between" },
  fileName: { flex: 1, fontSize: isSmallScreen ? 13 : 15, color: "#333" },
  noFileText: { fontSize: isSmallScreen ? 12 : 14, color: "#999", fontStyle: "italic" },

  activeSubTabdoc: { borderBottomWidth: 2, borderBottomColor: "green" },
  activeSubTabTextdoc: { color: "green", fontWeight: "bold" },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, maxHeight: height * 0.7, backgroundColor: '#fff', borderRadius: 12, padding: isSmallScreen ? 15 : 20, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  previewImage: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: isSmallScreen ? 10 : 15, backgroundColor: '#f0f0f0' },
  modalText: { fontSize: isSmallScreen ? 14 : 16, textAlign: 'center', marginBottom: isSmallScreen ? 15 : 20, color: '#333' },

  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  closeBtn: { backgroundColor: "#007bff", padding: isSmallScreen ? 8 : 10, alignItems: "center" },
  closeBtnText: { color: "#fff", fontWeight: "bold", fontSize: isSmallScreen ? 14 : 16 },

  custTabItem: { paddingVertical: isSmallScreen ? 6 : 8, paddingHorizontal: isSmallScreen ? 12 : 18, marginRight: 10, borderRadius: 25, backgroundColor: "#F0F0F0", borderWidth: 1, borderColor: "#D0D0D0" },
  activeCustTab: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  custTabText: { fontSize: isSmallScreen ? 12 : 14, color: "#555", fontWeight: "500" },
  activeCustTabText: { color: "#FFFFFF", fontWeight: "700" },

  sectionContainer: { padding: isSmallScreen ? 12 : 16, backgroundColor: "#fff", borderRadius: 8, marginBottom: isSmallScreen ? 12 : 16, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  sectionTitle: { fontSize: isSmallScreen ? 14 : 16, fontWeight: "bold", color: "#333", marginBottom: isSmallScreen ? 8 : 12 },

  fieldContainer: { flex: 1, marginRight: 12 },

  uploadCard: { backgroundColor: "#fff", borderRadius: 8, padding: isSmallScreen ? 15 : 20, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginVertical: isSmallScreen ? 10 : 15 },
  uploadCardTitle: { fontSize: isSmallScreen ? 14 : 16, fontWeight: "bold", marginBottom: isSmallScreen ? 15 : 20, alignSelf: "flex-start", color: "#333" },
  uploadCardButton: { backgroundColor: "#007BFF", paddingVertical: isSmallScreen ? 12 : 14, paddingHorizontal: isSmallScreen ? 20 : 25, borderRadius: 8, marginBottom: isSmallScreen ? 15 : 20 },
  uploadCardButtonText: { color: "#fff", fontSize: isSmallScreen ? 14 : 16, fontWeight: "600" },

  uploadedFileRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", paddingVertical: isSmallScreen ? 8 : 10, borderTopWidth: 1, borderTopColor: "#eee" },
  uploadedFileName: { flex: 1, fontSize: isSmallScreen ? 12 : 14, color: "#555" },
  uploadedPreviewText: { color: "#007BFF", fontSize: isSmallScreen ? 12 : 14, fontWeight: "500", marginLeft: 10 },
  noUploadedFileText: { fontSize: isSmallScreen ? 12 : 14, fontStyle: "italic", color: "#999", textAlign: "center", marginTop: isSmallScreen ? 8 : 10 },

  dropdown: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: isSmallScreen ? 8 : 10, paddingVertical: isSmallScreen ? 6 : 8, backgroundColor: "#fff", minHeight: isSmallScreen ? 36 : 44, justifyContent: "center" },
  selectedTextStyle: { fontSize: isSmallScreen ? 12 : 13, color: "#000" },
  inputSearchStyle: { fontSize: isSmallScreen ? 12 : 13, color: "#000" },
  dropdownItem: { paddingVertical: isSmallScreen ? 6 : 8, paddingHorizontal: isSmallScreen ? 8 : 10, backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  dropdownItemText: { fontSize: isSmallScreen ? 12 : 13, color: "#333" },

  required: { color: "#FF4D4F" },

  inputformodal: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: isSmallScreen ? 8 : 10, height: isSmallScreen ? 36 : 45, fontSize: isSmallScreen ? 12 : 14, color: "#000" },
  errorText: { color: "#FF4D4F", fontSize: isSmallScreen ? 10 : 12, marginTop: 3 },
  placeholderStyle: { color: "#999", fontSize: isSmallScreen ? 12 : 14 },

  dateInput: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 6, backgroundColor: "#fff", paddingHorizontal: isSmallScreen ? 8 : 10, height: isSmallScreen ? 36 : 45 },

  rowContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: isSmallScreen ? 8 : 12 },
  fullWidthFieldContainer: { flex: 1, },

  documentContainer: { marginVertical: isSmallScreen ? 8 : 10, borderRadius: 10, borderWidth: 1, borderColor: "#ddd", padding: isSmallScreen ? 8 : 10, backgroundColor: "#fff", width: width * 0.865 },
  documentTabBar: { paddingHorizontal: 5 },
  documentTabItem: { paddingVertical: isSmallScreen ? 6 : 8, paddingHorizontal: isSmallScreen ? 10 : 15, borderRadius: 20, backgroundColor: "#f0f0f0", marginRight: 8 },
  documentTabItemActive: { backgroundColor: "#007bff" },
  documentTabText: { fontSize: isSmallScreen ? 12 : 14, color: "#555", fontWeight: "500" },
  documentTabTextActive: { color: "#fff", fontWeight: "600" },
  documentContent: { marginTop: isSmallScreen ? 10 : 15 },

  previewText: { fontSize: isSmallScreen ? 12 : 14, color: "#007bff", fontWeight: "500" },
  removeText: { color: '#FFFDFDFF', fontSize: isSmallScreen ? 14 : 16, fontWeight: 'bold' },
  cancelText: { color: '#333333', fontSize: isSmallScreen ? 14 : 16, fontWeight: '500' },

  disabledInput: { borderColor: "#ccc", borderWidth: 1, padding: isSmallScreen ? 8 : 10, backgroundColor: "#f0f0f0", color: "#555" },

  cancelBtn: { flex: 1, paddingVertical: isSmallScreen ? 10 : 12, marginRight: 10, backgroundColor: '#cccccc', borderRadius: 8, alignItems: 'center' },
  removeBtn: { flex: 1, paddingVertical: isSmallScreen ? 10 : 12, backgroundColor: '#ff5555', borderRadius: 8, alignItems: 'center' },

  container: {
    flex: 1,
    backgroundColor: '#F0F0F0FF',
    // backgroundColor: '#fff',
    borderRadius: 12, padding: isSmallScreen ? 15 : 20, alignItems: 'center', elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4
  },
  firstrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // width: width * 0.9,
    marginHorizontal: 15,
    // marginVertical: 15, // Use percentage to ensure responsive layout
  },
  searchBar: {
    width: width * 0.75,
    height: height * 0.05,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
    color: 'black',
    backgroundColor: 'white'
  },

  sectionTitle: {
    fontSize: isSmallScreen ? 14 : 16,
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
    flex: 1, paddingHorizontal: 5, marginVertical: 6,
  },
  labelformodal: {
    fontSize: isSmallScreen ? 11 : 12,
    marginBottom: 4,
    color: 'black',
    fontWeight: 'bold',
  },
  checkIcon: {
    width: 12,
    height: 12,
    marginLeft: 5,
  },
  inputformodaliui: {
    borderWidth: 1,
    borderColor: 'black',       // unified with inputformodal
    borderRadius: 5,
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 6,
    textAlign: 'left',
    backgroundColor: '#f9f9f9',
    color: 'black',
    flex: 1,                    // responsive width instead of fixed width
    minHeight: 40,              // keeps touch-friendly height
  },
  inputMultiline: {
    height: height * 0.08, // Adjust height for multiline
    textAlignVertical: 'top', // Align text to the top
  },

  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#888',
  },
  createButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    width: width * 0.18,
    height: height * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  createButtonText: {
    color: 'black',
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '500',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
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
    fontSize: isSmallScreen ? 14 : 16,
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
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
    color: '#0C0C0CFF',
  },
  cardText: {
    fontSize: isSmallScreen ? 11 : 13,
    color: '#353333FF',
    marginTop: 4,
  },
  expandIcon: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
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
  modalContainerdetail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentdetail: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: width * 1,
    // height: height * 0.9, // Prevent modal from overflowing
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 30
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
    fontSize: isSmallScreen ? 14 : 16,
    color: 'black', // Default text color
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white', // Text color for the active tab
  },
  disabledTab: {
    backgroundColor: '#ccc', // Gray out the tab when disabled
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  disabledTabText: {
    color: '#888', // Lighter text color for disabled state
  },
  closeButton: {
    backgroundColor: '#dc3545',
    width: width * 0.25,
    height: height * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },



  mainTabsRow: {
    flexGrow: 0,
    backgroundColor: "#F8F5F5FF",
    // backgroundColor:'red',
    paddingVertical: isSmallScreen ? 8 : 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    opacity: 0.8,
    borderRadius: 10
  },

  mainTab: {
    marginHorizontal: 6,
    paddingVertical: isSmallScreen ? 8 : 10,
    paddingHorizontal: isSmallScreen ? 12 : 20,
    borderRadius: 20,
    backgroundColor: "#ddd",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,

  },

  activeMainTab: {
    backgroundColor: "#007bff",
    shadowOpacity: 0.25,
    elevation: 4,

  },

  mainTabText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: "#333",
  },

  activeMainTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  subTabsRow: {
    flexGrow: 0,
    backgroundColor: "#F8F5F5FF",
    paddingVertical: isSmallScreen ? 8 : 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    opacity: 0.8,
    borderRadius: 10,
    marginVertical: 6,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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

  otpBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // width: '100%',
    // marginVertical:45
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
  submitBtn: {
    // width: "90%",
    backgroundColor: "#007AFF",
    paddingVertical: moderateVerticalScale(10),
    borderRadius: moderateVerticalScale(10),
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  }
});


export default NewLoan;