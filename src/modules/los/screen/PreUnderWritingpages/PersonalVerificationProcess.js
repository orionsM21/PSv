import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity, ActivityIndicator, Alert, Image, Platform, ToastAndroid, Button, PermissionsAndroid, Modal,
  SafeAreaView, StatusBar
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { useSelector } from 'react-redux';

import DocumentPicker from 'react-native-document-picker';
import FormData from 'form-data';
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
// import { launchCamera } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer';
import ApplicationDetails from '../Component/ApplicantDetailsComponent';
import { RenderDropdownField, RenderTextField } from '../Component/ResponsiveFormFields';
const { width, height } = Dimensions.get('window');
import LinearGradient from 'react-native-linear-gradient';
import DetailHeader from '../Component/DetailHeader';
export const renderTextField = (
  label,
  value,
  onChange,
  editable = true,
  placeholder = '',
  keyboardType = 'default',
  isEditable = true,
  styles,
  required = true // <-- new param
) => {
  const fieldEditable = editable && isEditable; // disable if not pending

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          !fieldEditable && styles.disabledInput,
          {
            height: 'auto',        // ✅ allow dynamic height
            textAlignVertical: 'center',
            flexWrap: 'wrap',      // ✅ wrap long text
          },
        ]}
        value={value || ''}
        onChangeText={onChange}
        editable={fieldEditable}
        placeholder={placeholder}
        placeholderTextColor="#888"
        keyboardType={keyboardType}
      />
    </View>
  );
};
export const ActionButton = ({ onPress, disabled, style, children }) => (
  <TouchableOpacity style={[style, disabled && { backgroundColor: '#ccc' }]} onPress={onPress} disabled={disabled}>
    {children}
  </TouchableOpacity>
);



export const VerificationSection = ({ title, children, style }) => (
  <View style={[styles.sectionWrapper, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);
const PersonalVerificationProcess = ({ route }) => {
  const { item } = route.params;
  // 
  const [loading, setLoading] = useState(false);
  const [DecisionUsers, setDecisionUsers] = useState('')

  const navigation = useNavigation();
  const applicant = item.applicant[0]?.individualApplicant;
  const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
  const [applicationByid, setApplicationByid] = useState(null);

  const [selectedApplicantType, setSelectedApplicantType] = useState('');
  const [typeOfConstruction, setTypeOfConstruction] = useState('');
  const [FIeldAgent, setFIeldAgent] = useState([]);
  const [selectedFiA, setselectedFiA] = useState('');
  const hanldeFieldAgent = item => {
    setselectedFiA(item.value)
  }


  const [ApplicantArray, setApplicantArray] = useState([]); // To store
  const salariedApplicants = ApplicantArray.filter(
    applicant => applicant.individualApplicant,
  );
  const token = useSelector((state) => state.auth.token);

  const userDetails = useSelector((state) => state.auth.losuserDetails);
  const [salariedApplicantIds, setSalariedApplicantIds] = useState([]);
  // 
  const [applicantidApplicant, setApplicantidApplicant] = useState(null);
  const [applicantidindividualApplicant, setApplicantidIndividualApplicant] =
    useState([]);
  const [applicantCategoryCode, setApplicantCategoryCode] = useState('');
  const [Cibilid, setCibilid] = useState('');
  const [fullName, setFullName] = useState('');
  const [applicantTypes, setApplicantTypes] = useState([]);
  const [
    getInitiateVerificationByApplicantidd,
    setgetInitiateVerificationByApplicantidd,
  ] = useState([]);
  const [getresidePincode, setresidePincode] = useState([]);
  // 

  const [Pincodes, setPincodes] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [selectedPincodeId, setSelectedPincodeId] = useState(null); // Track pincodeId

  const [relationwithothers, setrelationwithother] = useState([]);
  const [selctedrelationwithothers, setselctedrelationWithOtherStates] =
    useState(null);

  const [selectedverifiercomment, setselectedverifiercomment] = useState(null);

  const [ownership, setownership] = useState([]);
  const [selectedownership, setselectedownership] = useState(null);

  const [accomodationm, setaccomodation] = useState([]);
  const [selectedaccomodation, setselectedaccomodation] = useState(null);

  const [verificationagency, setverificationagency] = useState([]);
  const [selectedverificationagency, setselectedverificationagency] =
    useState(null);

  const [verificationAgenct, setverificationAgenct] = useState([]);
  const [selectedverificationAgenct, setselectedverificationAgenct] =
    useState(null);


  // const dropdownData = verificationAgenct.map(agent => {
  //   // Case 1: Already normalized data
  //   if (typeof agent.label === 'string' && agent.label.trim() && agent.value !== undefined) {
  //     return {
  //       label: agent.label.trim(), // Clean up label if needed
  //       value: agent.value,
  //     };
  //   }

  //   // Case 2: Data with firstName and lastName
  //   if (typeof agent.firstName === 'string' && typeof agent.lastName === 'string') {
  //     const fullName = `${agent.firstName.trim()} ${agent.lastName.trim()}`;
  //     return {
  //       label: fullName || 'Unknown Agent', // Handle empty fullName gracefully
  //       value: agent.agencyMasterId || fullName, // Use ID if available, fallback to fullName
  //     };
  //   }

  //   // Case 3: Unexpected data format
  //   console.warn('Unexpected agent data format', agent);
  //   return {
  //     label: 'Unknown Agent',
  //     value: 'unknown',
  //   };
  // });

  const [dateOfVisit, setdateOfVisit] = useState(''); // Correct state for date
  const [rawDateOfVisit, setRawDateOfVisit] = useState(null); // Raw date for payload
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);




  // Show the Date Picker
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  // Hide the Date Picker
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  // Handle date selection
  const handleConfirm = (date) => {
    const selectedDate = moment(date);

    if (!BusinessDate?.businnessDate) {
      Alert.alert('Error', 'Business Date is not available.');
      return;
    }

    // Convert BusinessDate array [YYYY, MM, DD] into a moment date
    const businessDate = moment(BusinessDate.businnessDate.join('-'), 'YYYY-MM-DD');

    // Check if the selected date is greater than the business date
    if (selectedDate.isAfter(businessDate, 'day')) {
      Alert.alert(
        'Invalid Date',
        `Selected date cannot be greater than ${businessDate.format('DD-MM-YYYY')}`,
        [{ text: 'OK', onPress: () => setDatePickerVisible(false) }]
      );
    } else {
      const formattedDate = selectedDate.format('DD-MM-YYYY');  // Format the selected date

      setdateOfVisit(formattedDate);  // Update the state with formatted date
      hideDatePicker();  // Hide the DatePicker after selection
    }
  };



  const [payloadd, setpayload] = useState([]);


  const coApplicantCountMap = {};
  const guarantorCountMap = {};

  // const applicantTypess = applicantTypes.map(({ type, id }) => {
  //   if (type === "Co-Applicant") {
  //     coApplicantCountMap[type] = (coApplicantCountMap[type] || 0) + 1;
  //     return { label: `Co-Applicant ${coApplicantCountMap[type]}`, value: id };
  //   } else if (type === "Guarantor") {
  //     guarantorCountMap[type] = (guarantorCountMap[type] || 0) + 1;
  //     return { label: `Guarantor ${guarantorCountMap[type]}`, value: id };
  //   } else {
  //     return { label: type, value: id }; // Ensure id is used as value
  //   }
  // });

  // let coApplicantCountMap = {};

  const applicantTypess = applicantTypes.reduce((acc, { type, id }) => {
    if (type === "Co-Applicant") {
      coApplicantCountMap[type] = (coApplicantCountMap[type] || 0) + 1;
      acc.push({ label: `Co-Applicant ${coApplicantCountMap[type]}`, value: id });
    }
    else if (type !== "Guarantor") {
      // ✅ Add everything except "Guarantor"
      acc.push({ label: type, value: id });
    }
    // ❌ Skip "Guarantor" entirely
    return acc;
  }, []);


  const [personaldetails, setpersonaldetails] = useState('');
  const [Professiondetails, setProfessiondetails] = useState('');
  const [Bankrelationdetails, setBankrelationdetails] = useState('');
  const [medicalhistory, setmedicalhistory] = useState('');
  const [conscernissue, setConscernissue] = useState('');
  const [Strength, setStrength] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [BusinessDate, setBusinessDate] = useState([]);
  const convertTimestampToDate = timestamp => {
    const date = new Date(parseInt(timestamp)); // Create a Date object from the timestamp
    return date.toLocaleString(); // Convert to a readable date string
  };
  const readableDate = convertTimestampToDate(dateOfVisit);
  const [remarks, setRemarks] = useState('');
  const [additionalinfor, setAdditionalinfor] = useState('');
  const [loanrequirementdetails, setloanrequirementdetails] = useState('');

  const [pincodeforAPi, setpincodeforAPi] = useState([]);
  const [residid, setresidid] = useState([]);
  const [logDetails, setLogDetails] = useState([]);

  const [savedStatus, setSavedStatus] = useState({
    applicant: false,
    coApplicant: false,
    guarantor: false,
  });

  const [
    indAreaNameCityStateRegionZoneCountryByPincode,
    setindAreaNameCityStateRegionZoneCountryByPincode,
  ] = useState([]);


  const getLogsDetailsByApplicationNumber = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getLogsDetailsByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      setLogDetails(data);

      const residenceVerifications = data.filter(
        (log) => log?.description === "Personal Discussion"
      );

      if (residenceVerifications.length === 1) {
        // Only one object, handle as before
        setresidid(residenceVerifications[0]);
      } else if (residenceVerifications.length > 1) {
        // Multiple objects, check their status
        const pendingVerification = residenceVerifications.find(
          (log) => log?.status === "Pending"
        );

        if (pendingVerification) {
          setresidid(pendingVerification);
        } else {
          // If no pending status found, pick the first one
          setresidid(residenceVerifications[0]);
        }
      } else {
        console.warn("Residence Verification object not found");
      }
    } catch (error) {
      console.error(
        'Error fetching logs details by application number:',
        error,
      );
    }
  };


  // 
  useEffect(() => {
    getApplicationByid();
    getAllPincode();
    getAllAgency();
    getByTypelookupTypeReleationWithApplicant();
    getByTypelookupTypeOwnership();
    getByTypelookupTypeTypeofAccommodation();
    getLogsDetailsByApplicationNumber();
    getFlagDataOfPersonalDiscussionByApplicationNumber();
    getAllPersonalDiscussionUpdateByApplicationNumber();
    getBusinessDate();
    getDecisionAssignUser();
    FieldAgent();
  }, []);

  const FieldAgent = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}getByType?lookupType=FieldAgentName`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const list = Array.isArray(data?.data)
        ? data.data.map(item => ({
          value: item.lookupCode,
          label: item.lookupName,
        }))
        : [];

      setFIeldAgent(list);

      console.log("FieldAgent List:", list);

    } catch (err) {
      console.log("FieldAgent Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (applicantidApplicant) {
      getBusinessDate();
      // getResidenceVerificationByApplicantid();
      getResidenceVerificationByApplicantidd();
      getPersonalDiscussionByid();
      getApplicationById();
      // Reset the state variables to empty or null values
      setselectedverificationagency(null); // Clear agency selection
      setselectedverificationAgenct(''); // Clear verification agent name
      setselctedrelationWithOtherStates(''); // Clear relation with applicant
      setselectedverifiercomment(''); // Clear verifier comment
      setverificationAgenct([]); // Clear verification agent array
      setpersonaldetails(''); // Clear personal details
      setProfessiondetails(''); // Clear profession details
      setloanrequirementdetails(''); // Clear loan requirement details
      setBankrelationdetails(''); // Clear bank relationship details
      setAdditionalinfor(''); // Clear additional information
      setmedicalhistory(''); // Clear medical history
      setRecommendation(''); // Clear recommendation
      setConscernissue(''); // Clear concern issue
      setStrength(''); // Clear strength
      setRemarks(''); // Clear remarks
      setdateOfVisit(''); // Clear date of visit
      setRawDateOfVisit(''); // Clear raw date of visit
      setDocumentUpload(''); // Clear document upload
      setDocumentUploadName('');
      setFileName(''); // Clear file name
      setFile(''); // Clear file size
      setPhotoFile('');
      setPhotoFileName('');
      setTypeOfConstruction('');
      setselectedFiA('')
    }
  }, [applicantidApplicant]);

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
    if (pincodeforAPi && pincodeforAPi.length > 0) {
      findAreaNameCityStateRegionZoneCountryByPincode();
    }
  }, [pincodeforAPi]);


  const getFlagDataOfPersonalDiscussionByApplicationNumber = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getFlagDataOfPersonalDiscussionByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
    } catch (error) {
      console.error(
        'Error fetching logs details by application number:',
        error,
      );
    }
  };

  const getAllPersonalDiscussionUpdateByApplicationNumber = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getAllPersonalDiscussionUpdateByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
    } catch (error) {
      console.error(
        'Error fetching logs details by application number:',
        error,
      );
    }
  };

  const getApplicationByid = useCallback(async () => {
    if (!item || !item.id) {
      console.error('Item ID is missing');
      return; // Exit early if item or item.id is undefined
    }

    try {
      const response = await axios.get(
        `${BASE_URL}getApplicationById/${item.id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      setApplicationByid(data);
      // 

      // Ensure that data is valid before proceeding
      if (!data) {
        throw new Error('Application data not found');
      }

      const applicants = data?.applicant || [];
      const salariedApplicants = applicants.filter(
        applicant =>
          applicant.individualApplicant?.primaryOccupation === ' Salaried',
      );
      const salariedApplicantIds = salariedApplicants.map(app => app.id); // Extracting ids
      setSalariedApplicantIds(salariedApplicantIds);
      // 
      // 
      setApplicantArray(applicants);

      const applicantCodes = applicants.map(app => ({
        type: app.applicantTypeCode,
        id: app.id
      }));

      // Check if mapping works
      setApplicantTypes(applicantCodes);
    } catch (error) {
      console.error('Error fetching application data:', error);
      Alert.alert('Error', 'Failed to fetch application data');
    }
  }, []);

  const getResidenceVerificationByApplicantid = async (userid) => {
    // if (!applicantidApplicant) {
    //   console.error('Applicant ID is missing');
    //   return; // Exit early if applicantidIndividualApplicant is undefined
    // }
    try {
      const response = await axios.get(
        `${BASE_URL}getPersonalDiscussionOnApplicantId/${userid}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response?.data?.data;
      setgetInitiateVerificationByApplicantidd(data);
    } catch (error) {
      console.error(
        'Error fetching getPersonalDiscussionOnApplicantId:',
        error,
      );
    }
  };

  const getResidenceVerificationByApplicantidd = async () => {
    // if (!applicantidApplicant) {
    //   console.error('Applicant ID is missing');
    //   return; // Exit early if applicantidIndividualApplicant is undefined
    // }
    try {
      const response = await axios.get(
        `${BASE_URL}getPersonalDiscussionOnApplicantId/${applicantidApplicant}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response?.data?.data;
      setgetInitiateVerificationByApplicantidd(data);
    } catch (error) {
      console.error(
        'Error fetching getPersonalDiscussionOnApplicantId:',
        error,
      );
    }
  };

  const getPersonalDiscussionByid = async () => {
    if (!applicantidApplicant) {
      console.error('Applicant ID is missing');
      return; // Exit early if applicantidIndividualApplicant is undefined
    }
    try {
      const response = await axios.get(
        `${BASE_URL}getPersonalDiscussionById/${applicantidApplicant}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      // 
    } catch (error) {
      console.error('Error fetching getPersonalDiscussionById:', error);
    }
  };

  const getApplicationById = async () => {
    if (!applicantidApplicant) {
      console.error('Applicant ID is missing');
      return; // Exit early if applicantidIndividualApplicant is undefined
    }
    try {
      const response = await axios.get(
        `${BASE_URL}getApplicationById/${applicantidApplicant}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      // 
    } catch (error) {
      console.error('Error fetching getApplicationById:', error);
    }
  };

  const handleDropdownChange = async (item) => {
    if (!item?.value) return;

    setSelectedApplicantType(item.value);
    setpayload(''); // Reset payload
    const userid = item.value;

    // Find the selected applicant (individual or organization)
    const selectedApplicant = ApplicantArray.find(app =>
      (app.individualApplicant || app.organizationApplicant) && app.id === userid
    );

    if (!selectedApplicant) {
      console.error('No applicant found with the given ID');
      setApplicantCategoryCode('');
      setFullName('');
      setCibilid('');
      setApplicantidApplicant('');
      return;
    }

    // Fetch residence verification
    await getResidenceVerificationByApplicantid(userid);

    // Set applicant ID
    setApplicantidApplicant(selectedApplicant.id);

    // Set common details
    setCibilid(selectedApplicant.id);
    setApplicantCategoryCode(selectedApplicant.applicantCategoryCode || '');

    // Set full name based on type
    if (selectedApplicant.individualApplicant) {
      const { firstName, middleName, lastName } = selectedApplicant.individualApplicant;
      setFullName(`${firstName || ''} ${middleName || ''} ${lastName || ''}`);
    } else if (selectedApplicant.organizationApplicant) {
      const { organizationName } = selectedApplicant.organizationApplicant;
      setFullName(organizationName || '');
    } else {
      setFullName('');
    }
  };


  const handlePincodee = item => {
    setSelectedPincode(item.value);
    setSelectedPincodeId(item.pincodeId);
  };

  const handlerelationwithother = item => {
    setselctedrelationWithOtherStates(item.value);
  };

  const handleverifiercommented = item => {
    setselectedverifiercomment(item.value);
  };

  const handleOwnership = item => {
    setselectedownership(item.value);
  };

  const handleAccomodation = item => {
    setselectedaccomodation(item.value);
  };

  const handleVerificatinAgency = async item => {
    setselectedverificationagency(item.value);

    if (item.label) {
      await getAgencyByAgencyName(item.label);
    }
  };

  const handleverificationAgent = item => {
    setselectedverificationAgenct(item.value);
  };

  const getAgencyByAgencyName = async agencyCode => {
    try {
      const response = await axios.get(
        `${BASE_URL}getAgencyByAgencyName/${agencyCode}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (response.data.msgKey === 'Failure') {
        // Handle failure response
        console.error(`Error: ${response.data.message}`);
        setverificationAgenct([]); // Clear previous agency data
        Alert.alert(`Error: ${response.data.message}`); // Show error to the user
      } else {
        // Success: Process and set the data
        const formattedData = response.data.data.map(item => ({
          label: `${item.firstName} ${item.lastName}`, // Combine firstName and lastName
          value: item.userId, // Use userId as the value
        }));

        setverificationAgenct(formattedData); // Update state with formatted data

      }
    } catch (error) {
      // Handle request errors
      console.error(
        'Error fetching getAgencyByAgencyName data:',
        error.message || error,
      );
      setverificationAgenct([]); // Clear agency data on error
      alert('An error occurred while fetching agency data.'); // Show a generic error message
    }
  };

  const getAllPincode = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getAllPincodes`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data.content;
      // 
      setPincodes(data);
    } catch (error) {
      console.error(
        'Error fetching getAllPincodes data:',
        error.message || error,
      );
    }
  };

  const getByTypelookupTypeReleationWithApplicant = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getByType?lookupType=OfficeRelationship`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      // 
      setrelationwithother(data);
    } catch (error) {
      console.error(
        'Error fetching getByType?lookupType=OfficeRelationship data:',
        error.message || error,
      );
    }
  };

  const getByTypelookupTypeOwnership = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getByType?lookupType=Ownership`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      // 
      setownership(data);
    } catch (error) {
      console.error(
        'Error fetching getByType?lookupType=Ownership data:',
        error.message || error,
      );
    }
  };

  const getByTypelookupTypeTypeofAccommodation = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getByType?lookupType=TypeofAccommodation`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      // 
      setaccomodation(data);
    } catch (error) {
      console.error(
        'Error fetching getByType?lookupType=TypeofAccommodation data:',
        error.message || error,
      );
    }
  };

  const getAllAgency = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getAllAgency`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data.content;

      setverificationagency(data);
      // setverificationAgenct(data);
    } catch (error) {
      console.error(
        'Error fetching getAllAgency data:',
        error.message || error,
      );
    }
  };

  const findAreaNameCityStateRegionZoneCountryByPincode = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincodeforAPi}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data.content;
      // 
      setindAreaNameCityStateRegionZoneCountryByPincode(data);
    } catch (error) {
      console.error(
        'Error fetching indAreaNameCityStateRegionZoneCountryByPincode data:',
        error.message || error,
      );
    }
  };

  const createResidenceverification = async () => {
    try {
      // Format the date
      const formattedDate = rawDateOfVisit
        ? moment(rawDateOfVisit).format('YYYY-MM-DD') // If rawDateOfVisit exists, format as date
        : moment(dateOfVisit, 'DD-MM-YYYY').format('YYYY-MM-DD'); // Otherwise, use dateOfVisit and format it

      const dto = {
        applicant: applicantidApplicant ? { id: applicantidApplicant } : null,
        fieldAgentName: selectedFiA,
        applicationNo: item.applicationNo,
        bankRelationshipDetails: Bankrelationdetails,
        concern: conscernissue,
        loanRequirementDetails: loanrequirementdetails,
        medicalHistory: medicalhistory,
        personalDetail: personaldetails,
        professionDetail: Professiondetails,
        recommendation: recommendation,
        remark: remarks,
        strength: Strength,
        // verificationAgency: selectedverificationagency,
        // verificationAgent: selectedverificationAgenct,
        verificationDate: formattedDate,
        personalDiscussionId: payloadd?.personalDiscussionId ? payloadd?.personalDiscussionId : '',
        additionalInformation: additionalinfor
      };


      let filesArray = [];

      // ✅ Handling multiple selected files
      if (Array.isArray(file) && file.length > 0) {
        file.forEach((f, index) => {
          const fileUri = Platform.OS === 'android' ? f.uri.replace('file://', '') : f.uri;
          filesArray.push({
            name: `file`,
            filename: f.name,
            type: f.type || 'application/octet-stream',
            data: RNFetchBlob.wrap(fileUri)
          });
        });
      }

      // ✅ Handling Camera Photo File (Single File)
      // ✅ Ensure "photoFile" is sent correctly
      if (Array.isArray(photoFile) && photoFile.length > 0) {
        photoFile.forEach((photo, index) => {
          if (photo.uri && photo.name) {
            const photoUri = Platform.OS === 'android' ? photo.uri.replace('file://', '') : photo.uri;


            filesArray.push({
              name: `file`,  // ✅ Ensures correct field name
              filename: photo.name,
              type: photo.type,
              data: RNFetchBlob.wrap(photoUri),
            });
          }
        });
      }

      // ✅ Ensure at least one file is sent under "documentUpload"
      if (Array.isArray(documentUpload) && documentUpload.length > 0) {
        documentUpload.forEach((base64Data, index) => {
          // Ensure documentUploadName is correctly mapped to each file
          const documentUploadFileName = Array.isArray(documentUploadName) && documentUploadName.length > index
            ? documentUploadName[index]
            : `document_${index + 1}.pdf`;

          if (base64Data) {
            filesArray.push({
              name: documentUpload.length === 1 ? 'file' : `file`, // ✅ Correct naming
              filename: documentUploadFileName,
              type: 'application/pdf',
              data: base64Data
            });
          }
        });
      }

      // If no files are available, show an alert and return
      // if (filesArray.length === 0) {
      //   Alert.alert('Error', 'No file, photo, or document provided. Please select a file.');
      //   setLoading(false);
      //   return;
      // }
      try {
        const response = await RNFetchBlob.fetch(
          'PUT',
          `${BASE_URL}addPersonalDiscussion`,
          {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          [
            ...filesArray,
            { name: 'dto', data: JSON.stringify(dto) },
          ]
        );

        const responseData = response.json();


        if (responseData?.msgKey === 'success') {
          setLoading(false); // Show loader
          // Optionally handle success (e.g., show an alert or navigate)
          // Alert.alert('Success', 'Personal verification created successfully.');
        } else {
          Alert.alert('Error', responseData.message || 'Failed to upload the file.');
          setLoading(false); // Show loader
        }

        return response.data;
      } catch (error) {
        console.error('Error in addPersonalDiscussion:', error.message || error);
        Alert.alert('Error', 'Failed to add residence verification.');
      }
    } catch (error) {
      console.error('Error creating residence verification:', error.message || error);
      Alert.alert('Error', 'Failed to create residence verification.');
    }
  };


  const verificationagencys = verificationagency.map(pincodeObj => ({
    label: `${pincodeObj.agencyName.trim()} `, // Add ID for uniqueness
    value: pincodeObj.agencyMasterId,
  }));


  useEffect(() => {
    // if (getInitiateVerificationByApplicantidd ) {
    const verificationData = getInitiateVerificationByApplicantidd; // Accessing the first object, adjust if necessary



    // If verificationData is undefined or null, skip setting state
    if (!verificationData) {
      console.error('No valid verification data found');
      return;
    }

    setpayload(verificationData);
    const matchingAgency = verificationagency.find(
      agency =>
        agency.agencyName.trim() ===
        verificationData?.verificationAgencyName,
    );

    if (matchingAgency) {
      setselectedverificationagency(matchingAgency?.agencyMasterId); // Set the corresponding value
    } else {
      console.warn(
        'No matching agency found for:',
        verificationData?.verificationAgencyName,
      );
      setselectedverificationagency(null); // Clear if no match
    }

    if (verificationData?.verificationAgentName) {
      // Split the full name into first and last name for comparison
      setselectedverificationAgenct(verificationData?.verificationAgentName);
    }

    // setselectedverificationagency(verificationData.verificationAgencyName || '');
    setselctedrelationWithOtherStates(
      verificationData?.relationWithApplicant || '',
    );

    const verificationResult = verificationData?.verificationResult || '';
    setselectedverifiercomment(verificationResult);

    const agentName = verificationData?.verificationAgentName || '';
    const agentMasterId = verificationData?.verificationAgent;
    setverificationAgenct([{ label: agentName, value: agentMasterId }]);
    setselectedverificationAgenct(agentMasterId);
    setTypeOfConstruction(verificationData?.fieldAgentName)
    setselectedFiA(verificationData?.fieldAgentName || '')
    setpersonaldetails(verificationData?.personalDetail || '');
    setProfessiondetails(verificationData?.professionDetail || '');
    setloanrequirementdetails(verificationData?.loanRequirementDetails || '');
    setBankrelationdetails(verificationData?.bankRelationshipDetails || '');
    setAdditionalinfor(verificationData?.additionalInformation || '');
    setmedicalhistory(verificationData?.medicalHistory || '');
    setRecommendation(verificationData?.recommendation || '');
    setConscernissue(verificationData?.concern || '');
    setStrength(verificationData?.strength || '');
    setRemarks(verificationData?.remark || '');
    setdateOfVisit(verificationData?.verificationDate || '');

    // setDocumentUpload(verificationData?.documentUpload);
    if (verificationData?.documentUpload) {
      setDocumentUpload(Array.isArray(verificationData?.documentUpload) ? verificationData?.documentUpload : [verificationData?.documentUpload]);
    }
    if (verificationData?.documentUploadName) {
      setDocumentUploadName(
        Array.isArray(verificationData.documentUploadName)
          ? verificationData.documentUploadName
          : [verificationData.documentUploadName]
      );
    } else {
      setDocumentUploadName([]); // Ensure it resets if no data is available
    }
    setFileName(verificationData?.documentUploadName); // Dynam

    const formattedDate = moment(verificationData?.verificationDate).format('DD-MM-YYYY');
    setdateOfVisit(formattedDate);
    setRawDateOfVisit(verificationData?.verificationDate);
  }, [getInitiateVerificationByApplicantidd]);



  const validateFields = () => {
    const missing = [];

    const isEmpty = (v) => v == null || String(v).trim() === "";

    const rules = [
      { check: isEmpty(selectedFiA), msg: "FieldAgentName cannot be empty" },
      { check: isEmpty(selectedApplicantType), msg: "Please select an Applicant Type." },
      { check: isEmpty(fullName), msg: "Full Name cannot be empty." },

      { check: isEmpty(personaldetails), msg: "Personal Details cannot be empty." },
      { check: isEmpty(loanrequirementdetails), msg: "Loan Requirement Detail cannot be empty." },

      // Optional validations (commented by you; easy to enable)
      // { check: isEmpty(Professiondetails), msg: "Profession Detail cannot be empty." },
      // { check: isEmpty(additionalinfor), msg: "Additional Information cannot be empty." },
      // { check: isEmpty(medicalhistory), msg: "Medical History cannot be empty." },
      // { check: isEmpty(Strength), msg: "Strength cannot be empty." },
      // { check: isEmpty(Bankrelationdetails), msg: "Bankrelationdetails cannot be empty." },
      // { check: isEmpty(conscernissue), msg: "Concern/issue cannot be empty." },
      // { check: isEmpty(dateOfVisit), msg: "Date cannot be empty." },
      // { check: isEmpty(typeOfConstruction), msg: "FieldAgent cannot be empty." },
      // { check: isEmpty(selectedverificationagency), msg: "Verification Agency cannot be empty." },
      // { check: isEmpty(selectedverificationAgenct), msg: "Verification Agent cannot be empty." },
      // { check: isEmpty(recommendation), msg: "Recommendation cannot be empty." },

      { check: isEmpty(remarks), msg: "Remarks cannot be empty." },
    ];

    rules.forEach(({ check, msg }) => check && missing.push(msg));

    return missing.length ? missing : true;
  };


  const handlesave = () => {
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
      setLoading(true); // Show loader
      createResidenceverification();
      const currentIndex = applicantTypess.findIndex(
        applicant => applicant.value === selectedApplicantType
      );

      if (currentIndex === -1) {
        console.warn("Invalid selectedApplicantType:", selectedApplicantType);
        return;
      }

      const nextIndex = (currentIndex + 1) % applicantTypess.length;
      const nextType = applicantTypess[nextIndex];

      // ✅ Mark current as saved
      setSavedStatus(prev => ({
        ...prev,
        [selectedApplicantType.toString()]: true,
      }));

      // ✅ Move to next applicant type
      setSelectedApplicantType(nextType.value);

      // ✅ Trigger dropdown change in correct format
      handleDropdownChange({
        value: nextType.value,
        label: nextType.label,
      });

    }
  };
  // const showSubmitButton = applicantTypes.every(type => savedStatus[type.toLowerCase()]);
  const showSubmitButton = applicantTypess?.every(applicant =>
    savedStatus?.[applicant?.value?.toString()]
  );



  const handleSubmit = async () => {
    setLoading(true); // Show loader
    try {
      // Call updateResidenceVerificationFlag and wait for its completion
      const residenceUpdateSuccess = await updateResidenceVerificationFlag();
      if (residenceUpdateSuccess) {

      } else {
        throw new Error('Failed to update residence verification flag.');
      }


      // Alert.alert('Success', 'All APIs were executed successfully!');
    } catch (error) {
      console.error('Error in submitting form:', error.message || error);
      Alert.alert('Error', error.message || 'Something went wrong!');
    }
  };

  const updateResidenceVerificationFlag = async () => {
    try {
      const payload = {
        active: true,
        applicationNumber: residid.applicationNumber,
      };

      const response = await axios.put(
        `${BASE_URL}updatePersonalDiscussionFlag/${residid.applicationNumber}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (response.data.msgKey === 'Success' || response.status === 200 || response.status === 201) {
        const msgKey = response?.data?.msgKey;
        const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
        // Alert.alert(msgKey, successMessage);

        // Call updateLogActivityById only if the residence verification flag update succeeds
        await updateLogActivityById();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to update residence verification flag.');
      }
    } catch (error) {
      console.error('Error updating residence verification flag:', error.message || error);
      return false; // Return false if the update fails
    }
  };

  const updateLogActivityById = async () => {
    try {
      const payload = {
        stage: residid.stage,
        status: 'Completed',
        type: residid.type,
        user: residid.user,
        description: residid.description,
        applicationNumber: residid.applicationNumber,
      };

      const response = await axios.put(
        `${BASE_URL}updateLogActivityById/${residid.id}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (response.data.msgKey === 'Success' || response.status === 200 || response.status === 201) {
        const msgKey = response?.data?.msgKey;
        const successMessage = response.data?.message || 'Log activity updated successfully!';
        // Alert.alert(msgKey, successMessage);

        // Call updateStageMaintain after log activity update succeeds
        await updateStageMaintain();
      } else {
        throw new Error(response.data.message || 'Failed to update log activity.');
      }
    } catch (error) {
      console.error('Error updating log activity:', error.message || error);
    }
  };


  const updateStageMaintain = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}updateStageMainTainByApplicationNumber/${residid.applicationNumber}`,
        {
          applicationNumber: residid.applicationNumber,
          stage: 'Initiate Collateral Technical',
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );

      if (response.data.msgKey === 'Success') {
        const successMessage = response.data?.message || 'Stage maintained successfully!';
        setLoading(false);

        addLogActivityFinanCialAnalysis();
        // navigation.navigate('Decision ');
      }
    } catch (error) {
      console.error('❌ Error in updateStageMaintain:', error.message || error);
    }
  };

  const getDecisionAssignUser = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getDecisionAssignUser/${item?.applicationNo}`,

        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );

      if (response?.data) {
        setDecisionUsers(response?.data)
      }
    } catch (error) {
      console.error('❌ Error in getDecisionAssignUser:', error.message || error);
    }
  };




  const addLogActivityFinanCialAnalysis = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        status: 'Pending',
        stage: "UnderWriting",
        type: residid.type,
        user: DecisionUsers?.data,
        description: 'Decision',
        applicationNumber: residid.applicationNumber,
      };

      // Make the API call to update the log activity by ID
      const response = await axios.post(
        `${BASE_URL}addLogActivity`,  // Assuming PUT request to update
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }, // Send the payload as the request body
      );
      if (response.data.msgKey === 'Success') {
        //   updateResidenceVerificationFlag();
        const msgKey = response?.data?.msgKey;
        const successMessage = response?.data?.message;
        Alert.alert(msgKey, successMessage);
        getLogsDetailsByApplicationNumber();
        // navigation.navigate('InitiateRCU');
        updateStageOfApplicationbyApplicationNumber();
        setLoading(false); // Hide loader
      }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };

  const updateStageOfApplicationbyApplicationNumber = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}updateStageOfApplicationByApplicationNumber/${residid.applicationNumber}/UnderWriting`,
        null, // no body required
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );

      // If needed
      // 
    } catch (error) {
      console.error('❌ Error in updateStageOfApplication:', error.message || error);
    }
  };


  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);  // For storing the photo
  const [photoFileName, setPhotoFileName] = useState('');  // For storing the photo
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);


  const [documentUpload, setDocumentUpload] = useState(null);
  const [documentUploadName, setDocumentUploadName] = useState([]);
  const [modalVisibleCutsomnameChange, setModalVisibleCutsomnameChange] = useState(false);

  const handleDocumentSelection = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true, // Enable multiple file selection
      });



      const validFiles = [];

      for (const file of res) {
        let filePath = file.uri;

        if (file.uri.startsWith('content://') && Platform.OS === 'android') {
          const localPath = `${RNFS.DocumentDirectoryPath}/${file.name}`;
          await RNFS.copyFile(file.uri, localPath);
          filePath = localPath;

        }

        const fileStats = await RNFS.stat(filePath);
        const fileSizeInMB = fileStats.size / (1024 * 1024);



        // if (fileSizeInMB > 1) {
        //   Alert.alert(
        //     'File Size Exceeded',
        //     `The file "${file.name}" exceeds 1MB and was not selected.`
        //   );
        //   continue; // Skip files exceeding the limit
        // }

        validFiles.push({
          uri: `file://${filePath}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
        });
      }

      if (validFiles.length === 0) {

        return;
      }



      setFile(validFiles);
      // setFileName(validFiles.map(file => file.name).join(', '));
      setDocumentUploadName(validFiles.map(file => file.name));

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {

      } else {
        console.error('Error selecting document:', err);
      }
    }
  };

  const CIBILFILEUpload = () => {
    // Check if the file is present
    if (!file || !file.uri || !file.name) {
      Alert.alert('Error', 'Please attach a file before submitting.');
      return;
    }

    // Ensure the file URI is correctly formatted
    const fileUri = Platform.OS === 'android' && file?.uri ? file.uri.replace('file://', '') : file?.uri;

    // Wrap the file in binary format using RNFetchBlob
    const wrappedFileData = RNFetchBlob.wrap(fileUri);

    // Check if the binary data is valid
    if (!wrappedFileData) {
      Alert.alert('Error', 'Failed to wrap the file in binary format. Please check the file.');
      return;
    }

    // Confirm that the file and binary data are being sent
    Alert.alert(
      'Confirmation',
      `File is present and will be uploaded:\n\nFile Name: ${file.name}\nBinary Data: ${wrappedFileData ? 'Exists' : 'Not Found'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            try {
              const response = await RNFetchBlob.fetch(
                'PT',
                `${BASE_URL}uploadFile/${applicantidApplicant}`,
                {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token}`,
                },
                [
                  { name: 'file', filename: file.name, data: wrappedFileData },
                  // { name: 'dto', data: JSON.stringify(dto) },
                ]
              );

              const responseData = response.json();


              if (responseData?.msgKey === 'Success') {
                Alert.alert(responseData?.msgKey, responseData?.message);
              } else {
                Alert.alert('Error', responseData.message || 'Failed to upload the file.');
              }

              return response.data;
            } catch (error) {
              console.error('Error in addRiskContainmentUnit:', error.message || error);
              Alert.alert('Error', 'Failed to add residence verification.');
            }
          },
        },
      ]
    );
  }

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
  const handleDownloadCibilFile = async (fileDataArray, fileNamesArray) => {
    if (!fileDataArray) {
      Alert.alert('Error', 'No files available for download.');
      return;
    }

    // Ensure the data is always an array
    const files = Array.isArray(fileDataArray) ? fileDataArray : [fileDataArray];
    const fileNames = Array.isArray(fileNamesArray) ? fileNamesArray : [fileNamesArray];

    try {
      // Request storage permission for Android < 11
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download files.');
        return;
      }

      const dirs = RNFetchBlob.fs.dirs;

      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const fileName = fileNames[i] || `file_${i}.pdf`; // Default filename if missing
        const sanitizedFileName = sanitizeFileName(fileName);
        const filePath = `${dirs.DownloadDir}/${sanitizedFileName}`;
        const mimeType = getMimeType(fileName);

        if (fileData.startsWith('http')) {
          // ✅ If it's a URL, download it using Android's Download Manager
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
          })
            .fetch('GET', fileData)
            .then(() => {
              ToastAndroid.show(`Downloaded: ${fileName}`, ToastAndroid.SHORT);
            })
            .catch((err) => {
              Alert.alert('Error', `Failed to download ${fileName}: ${err.message}`);
            });
        } else {
          // ✅ If it's Base64, write it to a file
          await RNFetchBlob.fs
            .writeFile(filePath, fileData, 'base64')
            .then(() => {
              ToastAndroid.show(`Downloaded: ${fileName}`, ToastAndroid.SHORT);
            })
            .catch((err) => {
              Alert.alert('Error', `Failed to download ${fileName}: ${err.message}`);
            });
        }
      }

      Alert.alert('Success', files.length === 1 ? 'File downloaded successfully!' : 'All files downloaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong: ' + error.message);
    }
  };

  const formatNumberWithCommas = (value) => {
    if (!value || isNaN(value)) return value; // Return original value if not a valid number
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
  };



  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to capture photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {

      } else {

      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleTakePhoto = async () => {
    await requestCameraPermission();
    const options = {
      mediaType: "photo",
      cameraType: "back",
      saveToPhotos: true,
    };

    // launchCamera(options, async (response) => {
    //   if (response.didCancel) {
    //     Alert.alert("Camera closed without taking a photo.");
    //     return;
    //   }

    //   if (response.errorCode) {
    //     Alert.alert("Error:", response.errorMessage);

    //     return;
    //   }

    //   if (!response.assets || response.assets.length === 0) {
    //     Alert.alert("Error", "No image was captured.");
    //     return;
    //   }

    //   let filePath = response.assets[0].uri;

    //   // Handle Android `content://` URI
    //   if (filePath.startsWith("content://") && Platform.OS === "android") {
    //     const localPath = `${RNFS.DocumentDirectoryPath}/${response.assets[0].fileName || "photo.jpg"}`;
    //     await RNFS.copyFile(filePath, localPath);
    //     filePath = localPath;

    //   }

    //   // Resize image
    //   const resizedImage = await ImageResizer.createResizedImage(filePath, 800, 600, "JPEG", 80);
    //   let resizedFilePath = resizedImage.uri;

    //   // Check file size
    //   const fileStats = await RNFS.stat(resizedFilePath);
    //   const fileSizeInMB = fileStats.size / (1024 * 1024);


    //   // if (fileSizeInMB > 1) {
    //   //   Alert.alert("File Size Exceeded", "Please select a smaller file.");
    //   //   return;
    //   // }

    //   // Store image temporarily (without a name)
    //   const newPhoto = {
    //     uri: `file://${resizedFilePath}`,
    //     name: "", // Will be updated after user input
    //     type: response.assets[0].type || "image/jpeg",
    //   };

    //   // Add the new image to the list
    //   setPhotoFile((prevPhotos) => (prevPhotos ? [...prevPhotos, newPhoto] : [newPhoto]));


    //   // Open modal to set custom name
    //   setCurrentPhotoIndex(photoFile ? photoFile.length : 0); // Save index of the new photo
    //   setModalVisibleCutsomnameChange(true);
    // });
  };

  const handleSaveFileName = () => {
    if (fileName.trim() === '') {
      Alert.alert("Please provide a name for the image.");
      return;
    }

    setPhotoFile((prevPhotos) => {
      const updatedPhotos = [...prevPhotos];
      if (currentPhotoIndex !== null && updatedPhotos[currentPhotoIndex]) {
        updatedPhotos[currentPhotoIndex] = {
          ...updatedPhotos[currentPhotoIndex],
          name: fileName, // ✅ Update the name directly in photoFile
        };
      }

      setPhotoFileName((prevNames) => [...prevNames, fileName]); // Store multiple names
      return updatedPhotos;
    });

    setModalVisibleCutsomnameChange(false);
    Alert.alert("Image name saved as:", fileName);
  };

  const isPending = residid.status === 'Pending';
  const isEditable = isPending && userDetails?.designation !== 'Sales Head';
  const isDisabled = !isPending || userDetails?.designation === 'Sales Head';

  const renderDropdownField = (label, data, value, onChange, placeholder = '', disabled = false) => {
    const fieldDisabled = disabled || !isEditable; // disable if not pending or forced
    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}<Text style={styles.required}>*</Text></Text>
        <Dropdown
          data={data}
          labelField="label"
          valueField="value"
          value={value}
          onChange={onChange}
          style={[
            styles.dropdown,
            fieldDisabled, // greyed out if disabled
          ]}
          placeholder={placeholder || `Select ${label}`}
          placeholderStyle={{ color: '#888' }} // proper placeholder color
          selectedTextStyle={{ color: 'black' }}
          disabled={fieldDisabled}
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </View>
          )}
        />

      </View>
    );
  };


  const renderButton = (title, onPress, loading, color = '#007bff') => (
    <TouchableOpacity
      style={{
        backgroundColor: color,
        borderRadius: 8,
        padding: 12,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
      }}
      onPress={onPress}
      disabled={loading || !isEditable}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{title}</Text>
      )}
    </TouchableOpacity>
  );

  const renderRows = (fields, columns = 2, spacing = 10) => {
    if (!fields || fields.length === 0) return null;

    const rows = [];
    for (let i = 0; i < fields.length; i += columns) {
      const rowFields = fields.slice(i, i + columns);
      const isSingle = rowFields.length === 1;

      rows.push(
        <View
          key={i}
          style={[styles.row, { flexDirection: 'row', justifyContent: 'space-between' }]}
        >
          {rowFields.map((field, idx) => (
            <View
              key={idx}
              style={{
                flex: isSingle ? 1 : 1 / columns, // full width if single
                paddingHorizontal: spacing / 2,
              }}
            >
              {field}
            </View>
          ))}

          {/* Fill empty space if needed for 2-column rows only */}
          {!isSingle &&
            rowFields.length < columns &&
            Array(columns - rowFields.length)
              .fill(null)
              .map((_, idx) => (
                <View key={`empty-${idx}`} style={{ flex: 1 / columns, paddingHorizontal: spacing / 2 }} />
              ))}
        </View>
      );
    }

    return rows;
  };


  useFocusEffect(
    React.useCallback(() => {
      getLogsDetailsByApplicationNumber();

    }, []) // Empty dependency array to ensure this runs every time the screen is focused
  );

  const headerChips = [
    {
      label: "Name",
      value: aaplicantName?.individualApplicant
        ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName.individualApplicant.middleName || ""
          } ${aaplicantName.individualApplicant.lastName || ""}`.trim()
        : aaplicantName?.organizationApplicant?.organizationName || "N/A",
    },
    {
      label: "Loan Amount",
      value: item?.loanAmount
        ? `₹ ${formatNumberWithCommas(item.loanAmount.toString())}`
        : "₹ 0",
    },
    { label: "Source Branch", value: item?.branchName || "—" },
    {
      label: "Category",
      value: item?.applicant?.[0]?.applicantCategoryCode || "—",
    },
    { label: "Source Type", value: item?.sourceType || "—" },
    {
      label: "Date Created",
      value: applicationByid?.createdDate?.replace(/\//g, "-") || "—",
    },
    { label: "Stage", value: item?.stage || "—" },
  ];



  return (
    <SafeAreaView style={styles.root}>
      <StatusBar backgroundColor="#021a3a" barStyle="light-content" />

      {/* HEADER – Glassy gradient with key info */}


      {/* MAIN BODY */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        <DetailHeader
          title="Application Detail"
          subTitle={item?.applicationNo || "—"}
          status={item?.status || "Pending"}
          chips={headerChips}
        // gradientColors={["#003A8C", "#005BEA"]}
        />



        {/* Card 1 – Application snapshot (existing component) */}
        {/* <View style={styles.card}>
          <ApplicationDetails
            title="Application Snapshot"
            isEditable={false}
            fields={[
              { label: "Application Number", value: item?.applicationNo },
              {
                label: "Name",
                value: aaplicantName?.individualApplicant
                  ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName.individualApplicant.middleName || ""} ${aaplicantName.individualApplicant.lastName || ""}`.trim()
                  : aaplicantName?.organizationApplicant?.organizationName || "N/A",
              },
              {
                label: "Loan Amount",
                value: item?.loanAmount
                  ? `₹ ${formatNumberWithCommas(item.loanAmount.toString())}`
                  : "₹ 0",
              },
              { label: "Source Branch", value: item?.branchName },
              { label: "Category", value: item.applicant[0]?.applicantCategoryCode },
              { label: "Source Type", value: item?.sourceType },
              {
                label: "Date Created",
                value: applicationByid?.createdDate?.replace(/\//g, "-"),
              },
              { label: "Status", value: item?.status },
              { label: "Stage", value: item?.stage },
            ]}
          />
        </View> */}
        <View style={{ marginTop: 12, }}>
          {/* Card 2 – Applicant */}




          <View style={styles.card}>
            <VerificationSection title="Applicant">
              <RenderDropdownField
                label="Applicant Type"
                data={applicantTypess}
                value={selectedApplicantType}
                onChange={handleDropdownChange}
                placeholder="Select Applicant Type"
                editable={true}
                required={true}
              />

              <RenderTextField
                label="Applicant Name"
                value={fullName || ""}
                onChange={() => { }}
                editable={false}
                placeholder="User Name"
                required={false}
              />
            </VerificationSection>
          </View>

          {/* Card 3 – Personal Discussion */}
          <View style={styles.card}>
            <VerificationSection title="Personal Discussion">
              {renderRows(
                [
                  {
                    label: "Personal Details",
                    value: personaldetails,
                    setter: setpersonaldetails,
                    placeholder: "Personal Details",
                    required: true,
                    multiline: true,
                  },
                  {
                    label: "Loan Requirement Details",
                    value: loanrequirementdetails,
                    setter: setloanrequirementdetails,
                    placeholder: "Loan Requirement Details",
                    required: true,
                    multiline: true,
                  },
                  {
                    label: "Profession Details",
                    value: Professiondetails,
                    setter: setProfessiondetails,
                    placeholder: "Profession Details",
                    required: false,
                  },
                  {
                    label: "Additional Information",
                    value: additionalinfor,
                    setter: setAdditionalinfor,
                    placeholder: "Additional Information",
                    required: false,
                    multiline: true,
                  },
                  {
                    label: "Medical History",
                    value: medicalhistory,
                    setter: setmedicalhistory,
                    placeholder: "Medical History",
                    required: false,
                  },
                  {
                    label: "Strength",
                    value: Strength,
                    setter: setStrength,
                    placeholder: "Strength",
                    required: false,
                  },
                  {
                    label: "Bank Relationship Details",
                    value: Bankrelationdetails,
                    setter: setBankrelationdetails,
                    placeholder: "Bank Relationship Details",
                    required: false,
                    multiline: true,
                  },
                  {
                    label: "Concern/issues",
                    value: conscernissue,
                    setter: setConscernissue,
                    placeholder: "Concern/Issue",
                    required: false,
                    multiline: true,
                  },
                ].map((field) => (
                  <RenderTextField
                    key={field.label}
                    label={field.label}
                    value={field.value}
                    onChange={(val) => field.setter(val)}
                    editable={isEditable}
                    placeholder={field.placeholder}
                    required={field.required}
                    multiline={field.multiline ?? false}
                  />
                )),
                2,
                10
              )}
            </VerificationSection>
          </View>

          {/* Card 4 – Summary + Uploads */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Summary</Text>

            {isPending && (
              <RenderDropdownField
                label="Field Agent"
                data={FIeldAgent}
                value={selectedFiA}
                onChange={hanldeFieldAgent}
                placeholder="Select Field Agent"
                editable={true}
                required={true}
              />
            )}

            {isPending && (
              <RenderTextField
                label="Field Agent Name"
                value={typeOfConstruction}
                onChange={setTypeOfConstruction}
                editable={residid.status === "Pending"}
                placeholder="Field Agent Name"
                required={true}
                multiline={true}
              />
            )}

            {/* Verification Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Verification Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
                <Text style={styles.dateText}>
                  {dateOfVisit || "Select Date"}
                </Text>
                <Image
                  source={require("../../asset/calendar.png")}
                  style={styles.dateIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                maximumDate={
                  BusinessDate.businnessDate?.length === 3
                    ? new Date(
                      BusinessDate.businnessDate[0],
                      BusinessDate.businnessDate[1] - 1,
                      BusinessDate.businnessDate[2]
                    )
                    : new Date()
                }
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </View>

            {/* Remarks */}
            <RenderTextField
              label="Remarks"
              value={remarks}
              onChange={setRemarks}
              editable={residid.status === "Pending"}
              placeholder="Remark"
              required={true}
              multiline={true}
            />

            {/* Custom Name Modal (unchanged content, just wrapped in card already) */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisibleCutsomnameChange}
              onRequestClose={() => setModalVisibleCutsomnameChange(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>
                    Enter a custom name for the image:
                  </Text>
                  <RenderTextField
                    label=""
                    value={fileName}
                    onChange={setFileName}
                    placeholder="Enter image name"
                    editable={true}
                    required={false}
                    multiline={true}
                  />
                  <ActionButton
                    onPress={handleSaveFileName}
                    style={styles.modalPrimaryButton}
                  >
                    <Text style={styles.modalPrimaryText}>Save Name</Text>
                  </ActionButton>
                  <ActionButton
                    onPress={() => setModalVisibleCutsomnameChange(false)}
                    style={styles.modalSecondaryButton}
                  >
                    <Text style={styles.modalSecondaryText}>Cancel</Text>
                  </ActionButton>
                </View>
              </View>
            </Modal>

            {/* Upload & Camera Section */}
            <View style={styles.uploadSection}>
              <View style={styles.uploadColumn}>
                <Text style={styles.label}>Document Upload</Text>
                <ActionButton
                  style={[
                    styles.documentButton,
                    isDisabled && styles.documentButtonDisabled,
                  ]}
                  onPress={handleDocumentSelection}
                  disabled={isDisabled}
                >
                  <Image
                    source={require("../../asset/upload.png")}
                    style={[
                      styles.iconStyle,
                      isDisabled && styles.iconDisabled,
                    ]}
                  />
                  <Text style={styles.buttonText}>Select Document</Text>
                </ActionButton>
                {(documentUploadName?.length > 0
                  ? documentUploadName
                  : ["No file selected"]
                ).map((name, index) => (
                  <Text
                    key={index}
                    style={styles.fileNameText}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                ))}
              </View>

              <ActionButton
                style={[styles.roundIconButton]}
                onPress={() =>
                  handleDownloadCibilFile(documentUpload, documentUploadName)
                }
              >
                <Image
                  source={require("../../asset/download.png")}
                  style={styles.downloadIcon}
                />
              </ActionButton>

              <ActionButton
                style={[
                  styles.roundIconButton,
                  isDisabled && styles.roundIconButtonDisabled,
                ]}
                onPress={handleTakePhoto}
                disabled={isDisabled}
              >
                <Image
                  source={require("../../asset/camera.png")}
                  style={[
                    styles.cameraIcon,
                    isDisabled && styles.iconDisabled,
                  ]}
                />
              </ActionButton>
            </View>

            {/* Uploaded Photos */}
            {photoFileName?.length > 0 && (
              <RenderTextField
                label="Uploaded Photos"
                value={photoFileName.map((name) => `• ${name}`).join("\n")}
                editable={false}
                placeholder=""
                required={false}
                multiline={true}
              />
            )}
          </View>

          {/* ACTION BUTTONS – persist at bottom of content */}
          {residid.status === "Pending" &&
            userDetails?.designation !== "Sales Head" && (
              <View style={styles.actionBar}>
                {loading ? (
                  <ActivityIndicator size="large" color="#4CAF50" />
                ) : (
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={handlesave}
                  >
                    <Text style={styles.primaryActionText}>Save</Text>
                  </TouchableOpacity>
                )}

                {showSubmitButton && (
                  <View style={{ marginTop: 10 }}>
                    {loading ? (
                      <ActivityIndicator size="large" color="#4CAF50" />
                    ) : (
                      <TouchableOpacity
                        style={styles.secondaryActionButton}
                        onPress={handleSubmit}
                      >
                        <Text style={styles.secondaryActionText}>Submit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

};

export default PersonalVerificationProcess;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f3f6ff",
    paddingHorizontal: 12
  },

  /* HEADER */
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerCard: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#E9F1FF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  headerSubTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  headerChipsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  headerChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    marginRight: 8,
  },
  chipLabel: {
    color: "#D0E2FF",
    fontSize: 11,
  },
  chipValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  /* SCROLL CONTENT */
  scrollContainer: {
    // paddingHorizontal: 16,
    // paddingBottom: 24,
  },

  /* GENERIC CARD */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 10,
  },

  /* FORM GROUP / DATE */
  formGroup: {
    marginTop: 10,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },
  required: {
    color: "#EF4444",
  },
  dateButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fbff",
  },
  dateText: {
    color: "#111827",
    fontSize: 13,
  },
  dateIcon: {
    width: 18,
    height: 18,
    // tintColor: "#4b6aff",
  },

  /* MODAL */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "86%",
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  modalTitle: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 10,
  },
  modalPrimaryButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: "center",
  },
  modalPrimaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalSecondaryButton: {
    backgroundColor: "#F82929C5",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: "center",
  },
  modalSecondaryText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* UPLOAD SECTION */
  uploadSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  uploadColumn: {
    flex: 1,
    marginRight: 8,
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#0f62fe",
    marginTop: 6,
  },
  documentButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  iconStyle: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: "#fff",
  },
  iconDisabled: {
    tintColor: "#6b7280",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  fileNameText: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 6,
  },

  roundIconButton: {
    width: 44,
    height: 44,
    marginTop: 24,
    marginLeft: 4,
    borderRadius: 22,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  roundIconButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  downloadIcon: {
    width: 20,
    height: 20,
    // tintColor: "#2563eb",
  },
  cameraIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },

  /* ACTION BUTTONS */
  actionBar: {
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  primaryActionButton: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryActionButton: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },

  headerChip: {
    width: "48%",                        // 2 per row
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    marginRight: "4%",                   // small gap to the right
  },
  chipLabel: {
    color: "#D0E2FF",
    fontSize: 11,
  },

  chipValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },


  /* ===== UNIVERSAL CARD WRAPPER ===== */
  cardWrapper: {
    width: "92%",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.22)",
    marginVertical: 14,
    paddingTop: 14,
    paddingBottom: 10,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* ===== CARD TITLE ===== */
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingBottom: 6,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  /* ===== INNER CONTENT WRAPPER ===== */
  cardInner: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },

  /* ===== UPLOAD SECTION IMPROVEMENTS ===== */
  uploadSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 12,
  },

  uploadColumn: {
    flex: 1,
    marginRight: 12,
  },

  // documentButton: {
  //   // backgroundColor: "#0A84FF",
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingVertical: 10,
  //   paddingHorizontal: 14,
  //   borderRadius: 10,
  //   marginTop: 6,
  // },

  // documentButtonDisabled: {
  //   backgroundColor: "rgba(255,255,255,0.25)",
  // },

  // roundIconButton: {
  //   width: 48,
  //   height: 48,
  //   backgroundColor: "#004DD1",
  //   borderRadius: 50,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   marginLeft: 8,
  // },

  // roundIconButtonDisabled: {
  //   backgroundColor: "rgba(180,180,180,0.4)",
  // },

  // fileNameText: {
  //   color: "#D6E4FF",
  //   marginTop: 4,
  //   fontSize: 12,
  //   width: "100%",
  // },

  // iconDisabled: {
  //   tintColor: "#979797",
  // },

  /* ===== DATE PICKER BUTTON ===== */
  // dateButton: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "space-between",
  //   backgroundColor: "rgba(255,255,255,0.12)",
  //   borderRadius: 12,
  //   borderWidth: 1,
  //   borderColor: "rgba(255,255,255,0.35)",
  //   paddingVertical: 12,
  //   paddingHorizontal: 12,
  //   marginTop: 4,
  // },

  // dateText: {
  //   fontSize: 14,
  //   color: "#fff",
  // },

  // dateIcon: {
  //   width: 22,
  //   height: 22,
  //   tintColor: "#fff",
  // },

  /* ===== MODAL SHAPING ===== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "82%",
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 14,
    elevation: 8,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },

  modalPrimaryButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },

  modalPrimaryText: {
    color: "#fff",
    fontWeight: "600",
  },

  modalSecondaryButton: {
    backgroundColor: "#F82929C5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },

  modalSecondaryText: {
    color: "#fff",
  },

});

