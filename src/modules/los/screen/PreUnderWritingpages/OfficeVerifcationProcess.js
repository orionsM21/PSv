import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity, Alert,
  ActivityIndicator, Image, Platform, ToastAndroid, Modal, Button, PermissionsAndroid,
  SafeAreaView
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
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
import DetailHeader from '../Component/DetailHeader';

const { width, height } = Dimensions.get('window');

// Outside the component
// export const RenderTextField = ({ label, value, onChange, editable = true, placeholder = '', numeric = false, maxLength, isEditable }) => {
//   const fieldEditable = editable && isEditable;

//   return (
//     <View style={styles.formGroup}>
//       <Text style={styles.label}>
//         {label}<Text style={styles.required}>*</Text>
//       </Text>
//       <TextInput
//         style={[styles.input, !editable && styles.disabledInput]}
//         value={value || ''}
//         onChangeText={text => {
//           if (numeric) {
//             onChange(text.replace(/[^0-9]/g, ''));
//           } else {
//             onChange(text);
//           }
//         }}
//         editable={fieldEditable}
//         placeholder={placeholder}
//         placeholderTextColor="#888"
//         keyboardType={numeric ? 'numeric' : 'default'}
//         maxLength={maxLength}  // ✅ apply maxLength
//       />
//     </View>
//   );
// };

// export const RenderDropdownField = ({
//   label,
//   data,
//   value,
//   onChange,
//   placeholder = '',
//   disabled = false,
//   isEditable,
//   enableSearch = true // ✅ new prop to toggle search
// }) => {
//   const fieldDisabled = disabled || !isEditable;

//   return (
//     <View style={styles.formGroup}>
//       <Text style={styles.label}>
//         {label} <Text style={styles.required}>*</Text>
//       </Text>

//       <Dropdown
//         data={data}
//         labelField="label"
//         valueField="value"
//         value={value}
//         onChange={onChange}
//         style={[
//           styles.dropdown,
//           fieldDisabled && { backgroundColor: '#d3d3d3' } // grey out if disabled
//         ]}
//         placeholder={placeholder || `Select ${label}`}
//         placeholderStyle={{ color: '#888' }}
//         selectedTextStyle={{ color: 'black' }}
//         disabled={fieldDisabled}

//         // ✅ Search functionality
//         search={enableSearch}
//         searchPlaceholder="Search..."
//         searchTextInputStyle={{ color: 'black' }}

//         renderItem={item => (
//           <View style={styles.dropdownItem}>
//             <Text style={styles.dropdownItemText}>{item.label}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };


export const VerificationSection = ({ title, children, style }) => (
  <View style={[styles.sectionWrapper, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const OfficeVerifcationProcess = ({ route }) => {
  const { item } = route.params;
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const applicant = item.applicant[0]?.individualApplicant;
  const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
  const [applicationByid, setApplicationByid] = useState(null);

  const [selectedApplicantType, setSelectedApplicantType] = useState('');
  const [ApplicantArray, setApplicantArray] = useState([]); // To store
  const [vaiwerdaaata, setvaiwerdaaata] = useState([])
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.losuserDetails);
  const [residid, setresidid] = useState([]);
  const [salariedApplicantIds, setSalariedApplicantIds] = useState([]);
  const [applicantidApplicant, setApplicantidApplicant] = useState(null);
  const [applicantidindividualApplicant, setApplicantidIndividualApplicant] =
    useState([]);
  const [applicantCategoryCode, setApplicantCategoryCode] = useState('');
  const [Cibilid, setCibilid] = useState('');
  const [fullName, setFullName] = useState('');
  const [applicantTypes, setApplicantTypes] = useState([]);

  // 
  const [
    getInitiateVerificationByApplicantidd,
    setgetInitiateVerificationByApplicantidd,
  ] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [others, setOthers] = useState('');
  const [relationwithothers, setrelationwithother] = useState([]);
  const [selctedrelationwithothers, setselctedrelationWithOtherStates] =
    useState(null);

  const [selectedverifiercomment, setselectedverifiercomment] = useState(null);
  const [typeOfConstruction, setTypeOfConstruction] = useState('');

  const [verificationagency, setverificationagency] = useState([]);
  const [selectedverificationagency, setselectedverificationagency] =
    useState('');

  const [verificationAgenct, setverificationAgenct] = useState([]); // Dropdown data
  const [selectedverificationAgenct, setselectedverificationAgenct] = useState(null);



  const [accomodation, setaccomodation] = useState([]);
  // const [dateOfVisit, setdateOfVisit] = useState('');
  // State for managing date and DatePicker visibility
  const [dateOfVisit, setdateOfVisit] = useState(''); // Correct state for date
  const [BusinessDate, setBusinessDate] = useState([]);
  const [rawDateOfVisit, setRawDateOfVisit] = useState(null); // Raw date for payload
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isSubmitVisible, setIsSubmitVisible] = useState(false);  // Track visibility of the submit button
  const [applicantTypess, setApplicantTypess] = useState([]);
  const [savedStatus, setSavedStatus] = useState({});



  const [documentUpload, setDocumentUpload] = useState(null);
  const [documentUploadName, setDocumentUploadName] = useState([]);
  const [modalVisibleCutsomnameChange, setModalVisibleCutsomnameChange] = useState(false);

  // useEffect(() => {
  //   // Set file if updateCollateral has file data
  //   if (documentUpload, documentUploadName) {
  //     const binaryData = documentUpload;
  //     const filename = documentUploadName || 'default_filename';
  //     handleDownloadCibilFile(binaryData, filename);
  //   }
  // }, [documentUpload, documentUploadName]);

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





  // Show the Date Picker
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  // Hide the Date Picker
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  // Handle date selection
  // const handleConfirm = (date) => {
  //   // Ensure the date is formatted correctly

  //   const formattedDate = moment(date).format('DD-MM-YYYY');
  //   
  //   setdateOfVisit(formattedDate); // Update state with selected date
  //   hideDatePicker(); // Close the DatePicker
  // };

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


  // useEffect(() => {
  //   // Only run if both arrays have items
  //   if (!Array.isArray(applicantTypes) || !applicantTypes.length) return;
  //   if (!Array.isArray(vaiwerdaaata) || !vaiwerdaaata.length) return;

  //   const waivedIds = new Set(vaiwerdaaata.map(item => Number(item.applicantId)));

  //   let coApplicantCounter = 0;
  //   let guarantorCounter = 0;

  //   const filteredApplicants = applicantTypes
  //     .filter(({ id }) => !waivedIds.has(Number(id))) // exclude waived
  //     .map(({ type, id }, index) => {
  //       let label = type;

  //       if (type === "Co-Applicant") {
  //         coApplicantCounter += 1;
  //         label = `Co-Applicant ${coApplicantCounter}`;
  //       } else if (type === "Guarantor") {
  //         guarantorCounter += 1;
  //         label = `Guarantor ${guarantorCounter}`;
  //       }

  //       return {
  //         label,
  //         value: id,
  //         _index: index
  //       };
  //     });

  //   setApplicantTypess(filteredApplicants);
  // }, [applicantTypes, vaiwerdaaata]);

  useEffect(() => {
    if (!Array.isArray(applicantTypes) || !Array.isArray(vaiwerdaaata)) return;

    const waivedIds = new Set(vaiwerdaaata.map(i => i.applicantId));
    const coCount = {};
    const guarCount = {};

    const result = applicantTypes
      .filter(a => !waivedIds.has(a.id))
      .map((a, index) => {
        // --- Label logic ---
        let label = a.type;
        if (a.type === "Co-Applicant") {
          label = `Co-Applicant ${(coCount[a.type] = (coCount[a.type] || 0) + 1)}`;
        } else if (a.type === "Guarantor") {
          label = `Guarantor ${(guarCount[a.type] = (guarCount[a.type] || 0) + 1)}`;
        }

        // --- Get CURRENT address pincode if exists ---
        const currentAddress = (a.address || []).find(addr => addr.addressType === "office") || {};
        const pincode = currentAddress.pincode?.pincode || "";

        return { label, value: a.id, pincode: a.pincode, pincodeId: a.pincodeId, _index: index };
      });


    setApplicantTypess(result);
  }, [applicantTypes, vaiwerdaaata]);



  const VerifierComment = [
    { label: 'Positive', value: 'Positive' },
    { label: 'Negative', value: 'Negative' },
  ];

  const [officename, setofficename] = useState('');
  const [applicationdesignation, setapplicationdesignation] = useState('');
  const [personName, setPersonName] = useState('');
  const [mobilenumber, setmobilenumber] = useState('');
  const [noOfAttemp, setNoOfAttemp] = useState('');

  const convertTimestampToDate = timestamp => {
    const date = new Date(parseInt(timestamp)); // Create a Date object from the timestamp
    return date.toLocaleString(); // Convert to a readable date string
  };
  const readableDate = convertTimestampToDate(dateOfVisit);
  const [companyNature, setcompanyNature] = useState('');


  const [noOfYearInHouse, setNoOfYearInHouse] = useState('');
  const [Comments, setComments] = useState('');
  const [logDetails, setLogDetails] = useState([]);
  const [FIeldAgent, setFIeldAgent] = useState([]);
  const [selectedFiA, setselectedFiA] = useState('');
  useEffect(() => {
    getApplicationByid();
    getBusinessDate();
    // getAllPincode();
    getAllAgency();
    getByTypelookupTypeReleationWithApplicant();
    getByTypelookupTypeOwnership();
    getByTypelookupTypeTypeofAccommodation();
    getLogsDetailsByApplicationNumber();
    getVerificationWaiverFromInitiateByApplicantId();
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

  const hanldeFieldAgent = item => {
    setselectedFiA(item.value)
  }

  // useEffect(() => {
  //   if (applicantidApplicant) {
  //     getResidenceVerificationByApplicantid();
  //   }
  // }, [applicantidApplicant]);

  // const getLogsDetailsByApplicationNumber = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${BASE_URL}getLogsDetailsByApplicationNumber/${item.applicationNo}`,
  //     );
  //     const data = response.data.data;
  //     setLogDetails(data);
  //   } catch (error) {
  //     console.error(
  //       'Error fetching logs details by application number:',
  //       error,
  //     );
  //   }
  // };

  const getVerificationWaiverFromInitiateByApplicantId = useCallback(async () => {
    if (!item?.applicationNo) {
      console.warn('Application number is missing');
      return;
    }

    try {
      const { data } = await axios.get(
        `${BASE_URL}getVerificationWaiverFromInitiateByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.data && Array.isArray(data.data)) {
        const filteredData = data.data.filter(
          i => i.verificationLists === "Office_Verification"
        );
        setvaiwerdaaata(filteredData);
      } else {
        console.warn('No data returned from API');
        setvaiwerdaaata([]);
      }
    } catch (error) {
      console.error(
        'Error fetching Verification Waiver from Initiate by Application Number:',
        error
      );
      setvaiwerdaaata([]);
    }
  }, [item?.applicationNo,]);



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
      if (!data) {
        throw new Error('Application data not found');
      }

      const applicant = data?.applicant || [];
      const salariedApplicantIds = applicant.map(app => app.id); // Extracting ids
      setSalariedApplicantIds(salariedApplicantIds);
      setApplicantArray(applicant);

      const applicantCodes = applicant
        .filter(app => app?.individualApplicant?.primaryOccupation !== 'House Wife')
        .map(app => ({
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

    // Reset states to prevent old data from being shown when switching users
    setgetInitiateVerificationByApplicantidd('');
    setNoOfAttemp('');
    setdateOfVisit('');
    setRawDateOfVisit('');
    setofficename('');
    setNoOfYearInHouse('');
    setapplicationdesignation('');
    setcompanyNature('');
    setPersonName('');
    setmobilenumber('');
    setselctedrelationWithOtherStates('');
    setselectedverifiercomment('');
    setComments('');
    setselectedverificationAgenct('');
    setselectedverificationagency('');
    setDocumentUpload('');
    setDocumentUploadName('');
    setPhotoFile('')//
    setPhotoFileName('')//
    setTypeOfConstruction('');
    setselectedFiA('');
    setIsOtherSelected(false);
    setOthers('');
    // setverificationAgenct('');
    // setverificationagency('');
    // setselectedverificationagency('');
    // setselectedverificationAgenct('');


    try {
      const response = await axios.get(
        `${BASE_URL}getOfficeVerificationOnApplicantId/${userid}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;


      // Only update state if data is available
      if (data) {
        setgetInitiateVerificationByApplicantidd(data);

        if (data.noOfAttempt) {
          setNoOfAttemp(data.noOfAttempt);
        }
        if (data.dateOfVisit) {
          const formattedDate = moment(data.dateOfVisit).format('DD-MM-YYYY');
          setdateOfVisit(formattedDate);
          setRawDateOfVisit(data.dateOfVisit);
        }
        if (data.officeName) {
          setofficename(data.officeName);
        }
        if (data.fieldAgentName) {
          setTypeOfConstruction(data.fieldAgentName);
          setselectedFiA(data?.fieldAgentName || '')
        }

        if (data.noOfYearInService) {
          setNoOfYearInHouse(data.noOfYearInService);
        }
        if (data.applicantDesignation) {
          setapplicationdesignation(data.applicantDesignation);
        }
        if (data.companyNature) {
          setcompanyNature(data.companyNature);
        }
        if (data.personName) {
          setPersonName(data.personName);
        }
        if (data.mobileNumber) {
          setmobilenumber(data.mobileNumber);
        }
        if (data.relationWithApplicant) {
          setselctedrelationWithOtherStates(data.relationWithApplicant);
        }
        if (data.verificationResult) {
          setselectedverifiercomment(data.verificationResult);
        }
        if (data.remark) {
          setComments(data.remark);
        }
        if (data.documentUploadName) {
          setDocumentUploadName(Array.isArray(data.documentUploadName) ? data.documentUploadName : [data.documentUploadName]);
          // setFileName(data.documentUploadName);
          setFile(data?.documentUploadName);
        }

        if (data.documentUpload) {
          // setDocumentUpload(data?.documentUpload);
          setDocumentUpload(Array.isArray(data?.documentUpload) ? data?.documentUpload : [data?.documentUpload]);
          setFile(data?.documentUpload);
        }
        if (data?.other) {
          setOthers(data?.other)
        }

        if (data?.other) {
          setIsOtherSelected(true);
        } else {
          setIsOtherSelected(false);
        }


      } else {

      }
    } catch (error) {
      console.error(
        'Error fetching getOfficeVerificationByApplicantId data:',
        error,
      );
    }
  };

  useEffect(() => {
    if (applicantidApplicant) {
      getResidenceVerificationByApplicantidd();
      setgetInitiateVerificationByApplicantidd('');
      setNoOfAttemp('');
      setdateOfVisit('');
      setRawDateOfVisit('');
      setofficename('');
      setNoOfYearInHouse('');
      setapplicationdesignation('');
      setcompanyNature('');
      setPersonName('');
      setmobilenumber('');
      setselctedrelationWithOtherStates('');
      setselectedverifiercomment('');
      setComments('');
      setselectedverificationAgenct('');
      setselectedverificationagency('');
      setDocumentUpload('');
      setDocumentUploadName('');
      setPhotoFile('')//
      setPhotoFileName('')//
      setTypeOfConstruction('');
      setselectedFiA('');
      setIsOtherSelected(false);
      setOthers('');
      // setFullName('')
    }
  }, [applicantidApplicant]);

  const getResidenceVerificationByApplicantidd = async () => {
    // if (!applicantidApplicant) {
    //   console.error('Applicant ID is missing');
    //   return; // Exit early if applicantidIndividualApplicant is undefined
    // }

    // Reset states to prevent old data from being shown when switching users
    setgetInitiateVerificationByApplicantidd('');
    setNoOfAttemp('');
    setdateOfVisit('');
    setRawDateOfVisit('');
    setofficename('');
    setNoOfYearInHouse('');
    setapplicationdesignation('');
    setcompanyNature('');
    setPersonName('');
    setmobilenumber('');
    setselctedrelationWithOtherStates('');
    setselectedverifiercomment('');
    setComments('');
    setselectedverificationAgenct('');
    setselectedverificationagency('');
    setDocumentUpload('');
    setDocumentUploadName('');
    setPhotoFile('')//
    setPhotoFileName('')//
    setTypeOfConstruction('');
    setselectedFiA('');
    setIsOtherSelected(false);
    setOthers('');
    // setverificationAgenct('');
    // setverificationagency('');
    // setselectedverificationagency('');
    // setselectedverificationAgenct('');


    try {
      const response = await axios.get(
        `${BASE_URL}getOfficeVerificationOnApplicantId/${applicantidApplicant}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;


      // Only update state if data is available
      if (data) {
        setgetInitiateVerificationByApplicantidd(data);

        if (data.noOfAttempt) {
          setNoOfAttemp(data.noOfAttempt);
        }
        if (data.dateOfVisit) {
          const formattedDate = moment(data.dateOfVisit).format('DD-MM-YYYY');
          setdateOfVisit(formattedDate);
          setRawDateOfVisit(data.dateOfVisit);
        }
        if (data.officeName) {
          setofficename(data.officeName);
        }
        if (data.fieldAgentName) {
          setTypeOfConstruction(data.fieldAgentName);
          setselectedFiA(data?.fieldAgentName || '')
        }

        if (data.noOfYearInService) {
          setNoOfYearInHouse(data.noOfYearInService);
        }
        if (data.applicantDesignation) {
          setapplicationdesignation(data.applicantDesignation);
        }
        if (data.companyNature) {
          setcompanyNature(data.companyNature);
        }
        if (data.personName) {
          setPersonName(data.personName);
        }
        if (data.mobileNumber) {
          setmobilenumber(data.mobileNumber);
        }
        if (data.relationWithApplicant) {
          setselctedrelationWithOtherStates(data.relationWithApplicant);
        }
        if (data.verificationResult) {
          setselectedverifiercomment(data.verificationResult);
        }
        if (data.remark) {
          setComments(data.remark);
        }
        if (data.documentUploadName) {
          setDocumentUploadName(Array.isArray(data.documentUploadName) ? data.documentUploadName : [data.documentUploadName]);
          // setFileName(data.documentUploadName);
          setFile(data?.documentUploadName);
        }

        if (data.documentUpload) {
          // setDocumentUpload(data?.documentUpload);
          setDocumentUpload(Array.isArray(data?.documentUpload) ? data?.documentUpload : [data?.documentUpload]);
          setFile(data?.documentUpload);
        }
        if (data?.other) {
          setOthers(data?.other)
        }

        if (data?.other) {
          setIsOtherSelected(true);
        } else {
          setIsOtherSelected(false);
        }


      } else {

      }
    } catch (error) {
      console.error(
        'Error fetching getOfficeVerificationByApplicantId data:',
        error,
      );
    }
  };


  useEffect(() => {
    // Clear previous data
    setverificationAgenct([]);
    setverificationagency([]);
    setselectedverificationagency(null);
    setselectedverificationAgenct(null);

    if (getInitiateVerificationByApplicantidd) {
      const verificationData = getInitiateVerificationByApplicantidd;
      // Logging the first object

      // Extract relevant data from verificationData
      const agentName = verificationData?.verificationAgentName;
      const agentId = verificationData?.verificationAgent;
      const agencyName = verificationData?.verificationAgencyName;
      const agencyId = verificationData?.verificationAgency;



      // If verificationData exists, use that data to populate state
      if (agentName && agentId && agencyName && agencyId) {
        setverificationAgenct([
          { label: agentName, value: agentId }, // Populate with agent data
        ]);

        setverificationagency([
          { label: agencyName, value: agencyId }, // Populate with agency data
        ]);

        setselectedverificationagency(agencyId);
        setselectedverificationAgenct(agentId);
      } else {
        // If no verification data, fall back to getAllAgency data

        getAllAgency();
      }
    } else {
      // If no verification data exists in the first place, fallback to getAllAgency
      getAllAgency();
    }
  }, [getInitiateVerificationByApplicantidd]); // Effect will run when `getInitiateVerificationByApplicantidd` changes


  useEffect(() => {
    if (applicantTypes.length === 1) {
      // Automatically select the only available applicant type
      const selectedType = applicantTypes[0];
      setSelectedApplicantType(selectedType);
      handleDropdownChange({ value: selectedType, label: selectedType });
    }
  }, [applicantTypes]); // Runs whenever applicantTypes is updated

  // const handleDropdownChange = async (item) => {
  //   setSelectedApplicantType(item.value);
  //   const userid = item.value;

  //   // Find applicant (organization or individual)
  //   const selectedApplicant = ApplicantArray.find(
  //     app => (app.individualApplicant || app.organizationApplicant) && app.id === userid
  //   );

  //   

  //   if (!selectedApplicant) {
  //     console.error('No applicant found for the selected ID');
  //     setApplicantCategoryCode('');
  //     setFullName('');
  //     setApplicantidApplicant(null);
  //     setApplicantidIndividualApplicant(null);
  //     setCibilid(null);
  //     return;
  //   }

  //   // Set common IDs
  //   setApplicantidApplicant(selectedApplicant.id);
  //   setApplicantidIndividualApplicant(selectedApplicant.id);
  //   setCibilid(selectedApplicant.id);

  //   // Determine type and set relevant state
  //   if (selectedApplicant.organizationApplicant) {
  //     const org = selectedApplicant.organizationApplicant;
  //     setApplicantCategoryCode(org.primaryOccupation || '');
  //     setFullName(org.organizationName || '');
  //   } else if (selectedApplicant.individualApplicant) {
  //     const individual = selectedApplicant.individualApplicant;
  //     setApplicantCategoryCode(individual.primaryOccupation || '');
  //     const { firstName, lastName } = individual;
  //     setFullName(`${firstName || ''} ${lastName || ''}`.trim());
  //   } else {
  //     setApplicantCategoryCode('');
  //     setFullName('');
  //   }

  //   // Fetch any required verification data
  //   // await getResidenceVerificationByApplicantid(userid);
  //   // await getInitiateVerificationByApplicantid(userid);

  //   
  // };


  const handleDropdownChange = async (item) => {
    try {


      // Reset all states
      setSelectedApplicantType(item.value);
      setgetInitiateVerificationByApplicantidd([]);


      const userid = item.value;

      // Find the selected applicant in the array
      const selectedApplicant = ApplicantArray.find(app =>
        (aaplicantName?.applicantCategoryCode === 'Organization'
          ? app.organizationApplicant
          : app.individualApplicant) && app.id === userid
      );

      if (!selectedApplicant) {
        console.error('Selected applicant not found');
        setApplicantCategoryCode('');
        setFullName('');
        return;
      }

      // Fetch verification data
      await getResidenceVerificationByApplicantid(userid);

      // Common IDs
      const applicantId = selectedApplicant.id;
      setApplicantidApplicant(applicantId);
      setApplicantidIndividualApplicant(applicantId);
      setCibilid(applicantId);

      // Set category and full name depending on type
      if (aaplicantName?.applicantCategoryCode === 'Organization') {
        const { organizationApplicant } = selectedApplicant;
        setApplicantCategoryCode(organizationApplicant?.primaryOccupation || '');
        setFullName(organizationApplicant?.organizationName || '');
      } else {
        const { individualApplicant } = selectedApplicant;
        setApplicantCategoryCode(individualApplicant?.primaryOccupation || '');
        const { firstName, middleName, lastName } = individualApplicant || {};
        setFullName(`${firstName || ''} ${middleName || ''} ${lastName || ''}`.trim());
      }

    } catch (error) {
      console.error('Error handling dropdown change:', error);
    }
  };


  const handlerelationwithother = item => {
    setselctedrelationWithOtherStates(item.value);
    if (item.label === 'Other ') {
      setIsOtherSelected(true);  // Show the "Others" field
    } else {
      setIsOtherSelected(false); // Hide the "Others" field
    }
  };

  const handleverifiercommented = item => {
    setselectedverifiercomment(item.value);
  };

  const handleVerificatinAgency = async item => {
    setselectedverificationagency(item.value);

    // Call the API only if the item has a value
    if (item.label) {
      await getAgencyByAgencyName(item.label);
    }
  };

  const handleverificationAgent = item => {
    setselectedverificationAgenct(item.value);
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
      // setownership(data);
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
      // 
      if (Array.isArray(response.data.data.content)) {
        const mergedData = response.data.data.content.map((agency) => {
          return {
            label: `${agency.agencyName} `, // Merge firstName and lastName
            value: agency.agencyMasterId, // Assuming agencyMasterId is the unique identifier
          };
        });

        // 
        // Update the dropdown data
        setverificationagency(mergedData); // Update the dropdown with merged names
      } else {
        console.error('Expected an array in the response, but got:', response.data);
      }
      // setverificationagency(data);
      // setverificationAgenct(data);
    } catch (error) {
      console.error(
        'Error fetching getAllAgency data:',
        error.message || error,
      );
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      getLogsDetailsByApplicationNumber();

    }, []) // Empty dependency array to ensure this runs every time the screen is focused
  );
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

      // Check if the response is successful
      if (Array.isArray(response.data.data)) {
        const mergedData = response.data.data.map((agency) => {
          return {
            label: `${agency.firstName} ${agency.lastName}`, // Merge firstName and lastName
            value: agency.userId, // Assuming agencyMasterId is the unique identifier
          };
        });

        // 
        // Update the dropdown data
        setverificationAgenct(mergedData); // Update the dropdown with merged names
      } else {
        console.error('Expected an array in the response, but got:', response.data);
      }
    } catch (error) {
      // Log and handle any errors that occur during the request
      console.error(
        'Error fetching getAgencyByAgencyName data:',
        error.message || error,
      );
      setverificationAgenct([]); // Clear agency data or handle as needed
      Alert.alert('An error occurred while fetching agency data.'); // Show a generic error message
    }
  };

  const createResidenceverification = async () => {
    try {
      const formattedDate = rawDateOfVisit
        ? moment(rawDateOfVisit).format('YYYY-MM-DD') // If rawDateOfVisit exists, format as date
        : moment(dateOfVisit, 'DD-MM-YYYY').format('YYYY-MM-DD'); // Otherwise, use dateOfVisit and format it



      const dto = {
        officeVerificationId: getInitiateVerificationByApplicantidd.officeVerificationId
          ? getInitiateVerificationByApplicantidd.officeVerificationId
          : '',
        applicationNo: item.applicationNo,
        fieldAgentName: selectedFiA,
        // verificationAgency: selectedverificationagency,
        // verificationAgent: selectedverificationAgenct,
        noOfAttempt: Number(noOfAttemp),
        dateOfVisit: formattedDate, // Ensure the API expects this date format
        officeName: officename,
        noOfYearInService: Number(noOfYearInHouse),
        applicantDesignation: applicationdesignation,
        companyNature: companyNature,
        personName: personName,
        mobileNumber: Number(mobilenumber),
        relationWithApplicant: selctedrelationwithothers,
        verificationResult: selectedverifiercomment, // If the API expects a specific value here
        remark: Comments,
        applicant: applicantidApplicant ? { id: applicantidApplicant } : null,
        officeVerificationId: getInitiateVerificationByApplicantidd.officeVerificationId
          ? getInitiateVerificationByApplicantidd.officeVerificationId
          : '',
        other: others || null,
      };

      let filesArray = [];

      // ✅ Ensure at least one file is sent under the "file" field
      if (Array.isArray(file) && file.length > 0) {
        file.forEach((f) => {
          const fileUri = Platform.OS === 'android' ? f.uri.replace('file://', '') : f.uri;
          filesArray.push({
            name: 'file',  // ✅ This ensures "file" field is present
            filename: f.name,
            type: f.type || 'application/octet-stream',
            data: RNFetchBlob.wrap(fileUri)
          });
        });
      }



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

      // Confirm that the file and binary data are being sent
      try {
        const response = await RNFetchBlob.fetch(
          'PUT',
          `${BASE_URL}addOfficeVerification`,
          {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + token,
          },
          [
            ...filesArray,
            { name: 'dto', data: JSON.stringify(dto) },
          ]
        );

        const responseData = response.json();


        if (responseData?.msgKey === 'Success') {
          // getResidenceVerificationByApplicantid();
          getResidenceVerificationByApplicantidd();
          // setLoading(false);
          // if (applicantTypes.length > 1) {
          //   setIsSubmitVisible(true); // Show Submit button upon success if applicantTypes.length > 1
          // }
          const currentIndex = applicantTypess.findIndex(applicant => applicant.value === selectedApplicantType);
          const nextIndex = (currentIndex + 1) % applicantTypess.length;
          const nextType = applicantTypess[nextIndex];

          setSavedStatus(prev => ({
            ...prev,
            [selectedApplicantType.toString()]: true,
          }));
          setSelectedApplicantType(nextType.value);

          handleDropdownChange({ value: nextType.value, label: nextType.label });
          setLoading(false);
          if (applicantTypes.length > 1) {
            setIsSubmitVisible(true); // Show Submit button upon success if applicantTypes.length > 1
          }

        } else {
          setLoading(false);
          Alert.alert('Error', responseData.message || 'Failed to upload the file.');
        }

        return response.data;
      } catch (error) {
        setLoading(false);
        console.error('Error in Office Verication:', error.message || error);
        Alert.alert('Error', 'Failed to add office verification.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error creating office verification:', error.message || error);
    }
  };


  const relationwithother = relationwithothers.map(pincodeObj => ({
    label: `${pincodeObj.lookupName} `, // Combine pincode and area name
    value: pincodeObj.lookupName, // Use pincode as the value
  }));


  const validateFields = () => {
    const missing = [];

    // Helpers
    const isEmpty = (v) => v == null || String(v).trim() === "";
    const isInvalidNum = (v) => isEmpty(v) || isNaN(v) || Number(v) <= 0;

    const rules = [
      { check: isEmpty(selectedApplicantType), msg: "Please select an Applicant Type." },
      { check: isEmpty(fullName), msg: "Full Name cannot be empty." },
      { check: isEmpty(selectedFiA), msg: "FieldAgentName cannot be empty" },

      { check: isInvalidNum(noOfAttemp), msg: "Please enter a valid number of attempts." },

      { check: isEmpty(dateOfVisit), msg: "Please select a Date of Visit." },

      { check: isEmpty(officename), msg: "OfficeName cannot be empty" },
      { check: isEmpty(noOfYearInHouse), msg: "No oF Year in Service cannot be empty" },

      { check: isEmpty(applicationdesignation), msg: "Applicant Designation cannot be empty." },
      { check: isEmpty(companyNature), msg: "Company Nature cannot be empty." },

      { check: isEmpty(personName), msg: "Person Name cannot be empty." },

      { check: isEmpty(mobilenumber), msg: "Mobile Number cannot be empty." },
      { check: mobilenumber && mobilenumber.length < 10, msg: "Mobile Number must be at least 10 digits long." },

      { check: isEmpty(selctedrelationwithothers), msg: "Please select a Relation with the Applicant." },
      { check: isEmpty(selectedverifiercomment), msg: "Please select a Result." },
      { check: isEmpty(Comments), msg: "Comments cannot be empty." },
    ];

    // Validate all
    rules.forEach(({ check, msg }) => check && missing.push(msg));

    return missing.length ? missing : true;
  };


  useEffect(() => {
    if (applicantTypess.length === 1) {
      // Automatically select the only available applicant type
      const selectedType = applicantTypes[0];
      setSelectedApplicantType(selectedType);
      handleDropdownChange({ value: selectedType, label: selectedType });
    }
  }, [applicantTypes]); // Runs whenever applicantTypes is updated



  const handlesave = () => {
    const residenceValidationResult = validateFields();
    const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

    if (missingFields.length) {
      const formattedMissingFields = missingFields
        .map((field) => `\u2022 ${field}`)
        .join('\n');

      Alert.alert(
        'Alert ⚠️',
        `${formattedMissingFields}`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return; // Stop execution if there are missing fields
    }

    setLoading(true);
    createResidenceverification();

    // if (applicantTypes.length > 1) {
    //   const currentIndex = applicantTypes.findIndex(applicant => applicant.id === selectedApplicantType);
    //   const nextIndex = (currentIndex + 1) % applicantTypes.length;
    //   const nextType = applicantTypes[nextIndex]?.id; // Extract id

    //   setSavedStatus((prev) => ({ ...prev, [(selectedApplicantType?.toString() || '').toLowerCase()]: true }));
    //   setSelectedApplicantType(nextType);

    //   // Ensure handleDropdownChange is called with correct format
    //   handleDropdownChange({ value: nextType });
    // } else {
    //   // If only one applicant type exists, mark it as saved and show the Submit button
    //   setSavedStatus((prev) => ({ ...prev, [selectedApplicantType.toString().toLowerCase()]: true }));
    //   setIsSubmitVisible(true);
    // }

    // const currentIndex = applicantTypess.findIndex(applicant => applicant.value === selectedApplicantType);
    // const nextIndex = (currentIndex + 1) % applicantTypess.length;
    // const nextType = applicantTypess[nextIndex];

    // setSavedStatus(prev => ({ ...prev, [selectedApplicantType.toString()]: true }));
    // setSelectedApplicantType(nextType.value);

    // handleDropdownChange({ value: nextType.value, label: nextType.label });

  };





  // const showSubmitButton = applicantTypes.length === 1 || applicantTypes.every(type => savedStatus[type.toLowerCase()]);
  // const showSubmitButton = applicantTypess?.every(applicant =>
  //   savedStatus[applicant?.value?.toString()]
  // );




  const handleSubmit = async () => {
    setLoading(true); // Show loader
    try {
      await updateResidenceVerificationFlag();

      // Alert.alert('Success', 'All APIs were executed successfully!');
    } catch (error) {
      console.error('Error in submitting form:', error.message || error);
      Alert.alert('Error', error.message || 'Something went wrong!');
    }
  };


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


      const residenceVerifications = data.filter(
        (log) => log?.description === "Office Verification"
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


      // Set the logs data
      setLogDetails(data);
    } catch (error) {
      console.error(
        'Error fetching logs details by application number:',
        error,
      );
    }
  };


  const updateLogActivityById = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        stage: residid.stage, // Example value, you may want to dynamically set it
        status: 'Completed', // Example value, adjust as needed
        type: residid.type, // Example value
        user: residid.user, // Example value
        description: residid.description, // Fixed value in your case
        applicationNumber: residid.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.put(
        `${BASE_URL}updateLogActivityById/${residid.id}`,  // Assuming PUT request to update
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
        const msgKey = response?.data?.msgKey;
        const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
        // Alert.alert(msgKey, successMessage);
        await updateStageMainTainByApplicationNumber();
      }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };



  const updateResidenceVerificationFlag = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        active: true,
        applicationNumber: residid.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.put(
        `${BASE_URL}updateOfficeVerificationFlag/${residid.applicationNumber}`,  // Assuming PUT request to update
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
        const msgKey = response?.data?.msgKey;
        const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
        // Alert.alert(msgKey, successMessage);
        await updateLogActivityById();
      }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };

  const updateStageMainTainByApplicationNumber = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        stage: "InitiateRCU",
        applicationNumber: residid.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.put(
        `${BASE_URL}updateStageMainTainByApplicationNumber/${residid.applicationNumber}`,  // Assuming PUT request to update
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }, // Send the payload as the request body
      );

      // if (response.data.msgKey === 'Success') {
      const msgKey = response?.data?.msgKey;
      const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
      // Alert.alert(msgKey, successMessage);
      await addLogActivity();
      // }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };

  const addLogActivity = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        stage: residid.stage, // Example value, you may want to dynamically set its
        status: "Pending", // Example value, adjust as needed
        type: residid.type, // Example value
        user: residid.user, // Example value
        description: "Initiate RCU", // Fixed value in your case
        applicationNumber: residid.applicationNumber, // Example application number, adjust dynamically if needed
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
        const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
        // Alert.alert(msgKey, successMessage);
        navigation.replace('InitiateRCU');
        setLoading(false); // Hide loader
      }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };



  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);  // For storing the photo
  const [photoFileName, setPhotoFileName] = useState('');  // For storing the photo
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);


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



  // const CIBILFILEUpload = () => {
  //   // Check if the file is present
  //   if (!file || !file.uri || !file.name) {
  //     Alert.alert('Error', 'Please attach a file before submitting.');
  //     return;
  //   }

  //   // Ensure the file URI is correctly formatted
  //   const fileUri = Platform.OS === 'android' && file?.uri ? file.uri.replace('file://', '') : file?.uri;

  //   // Wrap the file in binary format using RNFetchBlob
  //   const wrappedFileData = RNFetchBlob.wrap(fileUri);

  //   // Check if the binary data is valid
  //   if (!wrappedFileData) {
  //     Alert.alert('Error', 'Failed to wrap the file in binary format. Please check the file.');
  //     return;
  //   }

  //   // Confirm that the file and binary data are being sent
  //   Alert.alert(
  //     'Confirmation',
  //     `File is present and will be uploaded:\n\nFile Name: ${file.name}\nBinary Data: ${wrappedFileData ? 'Exists' : 'Not Found'}`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Proceed',
  //         onPress: async () => {
  //           try {
  //             const response = await RNFetchBlob.fetch(
  //               'POST',
  //               `${BASE_URL}uploadFile/${applicantidApplicant}`,
  //               {
  //                 'Content-Type': 'multipart/form-data',
  //               },
  //               [
  //                 { name: 'file', filename: file.name, data: wrappedFileData },
  //                 // { name: 'dto', data: JSON.stringify(dto) },
  //               ]
  //             );

  //             const responseData = response.json();

  //             
  //             if (responseData?.msgKey === 'Success') {
  //               Alert.alert(responseData?.msgKey, responseData?.message);
  //             } else {
  //               Alert.alert('Error', responseData.message || 'Failed to upload the file.');
  //             }

  //             return response.data;
  //           } catch (error) {
  //             console.error('Error in addRiskContainmentUnit:', error.message || error);
  //             Alert.alert('Error', 'Failed to add residence verification.');
  //           }
  //         },
  //       },
  //     ]
  //   );
  // }

  // const shouldShowSubmitButton =
  //   applicantTypes.length > 1 ? showSubmitButton : isSubmitVisible;

  // ✅ Compute showSubmitButton correctly
  const applicantsToCheck = vaiwerdaaata?.length > 0 ? applicantTypess : applicantTypes;

  const showSubmitButton = applicantsToCheck?.length > 0
    ? applicantsToCheck.every(applicant => savedStatus[applicant.value?.toString() || applicant.id?.toString()])
    : false;






  const formatNumberWithCommas = (num) => {
    if (!num) return '0';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
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

  const RenderDatePicker = ({
    label,
    value,
    showPicker,
    isVisible,
    onConfirm,
    onCancel,
    styles,
    businessDate // ✅ pass businessDate as prop
  }) => {
    // Convert businessDate array to JS Date
    const maxDate =
      businessDate?.businnessDate?.length === 3
        ? new Date(
          businessDate.businnessDate[0],
          businessDate.businnessDate[1] - 1, // months are 0-indexed
          businessDate.businnessDate[2]
        )
        : new Date(); // fallback today

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {label} <Text style={styles.required}>*</Text>
        </Text>

        <TouchableOpacity onPress={showPicker} style={styles.dateButton}>
          <Text style={styles.dateText}>{value || 'Select Date'}</Text>
          <Image
            source={require('../../asset/calendar.png')}
            style={styles.dateIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isVisible}
          mode="date"
          date={maxDate} // ✅ default date shows businessDate
          maximumDate={maxDate} // ✅ user cannot select a future date beyond businessDate
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </View>
    );
  };


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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/** Form Configuration Array */}
        {/* <ApplicationDetails
          title="Application Detail"
          isEditable={false} // 🔒 read-only or true for editable
          fields={[
            { label: 'Application Number', value: item?.applicationNo },
            {
              label: 'Name',
              value: aaplicantName?.individualApplicant
                ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName.individualApplicant.middleName || ""} ${aaplicantName.individualApplicant.lastName || ""}`.trim()
                : aaplicantName?.organizationApplicant?.organizationName || "N/A"
            },
            {
              label: 'Loan Amount',
              value: item?.loanAmount
                ? `₹ ${formatNumberWithCommas(item.loanAmount.toString())}`
                : '₹ 0'
            },
            { label: 'Source Branch', value: item?.branchName },
            { label: 'Category', value: item.applicant[0]?.applicantCategoryCode },
            { label: 'Source Type', value: item?.sourceType },
            { label: 'Date Created', value: applicationByid?.createdDate?.replace(/\//g, '-') },
            { label: 'Status', value: item?.status },
            { label: 'Stage', value: item?.stage },
          ]}
        /> */}
        <DetailHeader
          title="Application Detail"
          subTitle={item?.applicationNo || "—"}
          status={item?.status || "Pending"}
          chips={headerChips}
          // gradientColors={["#003A8C", "#005BEA"]}
        />


        {[
          {
            title: 'Applicant Details',
            fields: [
              {
                type: 'dropdown',
                label: 'Applicant Type',
                options: applicantTypess?.length
                  ? applicantTypess
                  : (applicantTypes || []).map(a => ({ label: a.type, value: a.id })),
                selectedValue: selectedApplicantType,
                onChange: handleDropdownChange,
                placeholder: 'Select Applicant Type',
                enableSearch: false,
              },
              {
                type: 'text',
                label: 'Applicant Name',
                value: fullName,
                placeholder: 'Applicant Name',
                editable: false,
              },
            ],
          },
          {
            title: 'Verification Details',
            fields: [
              ...(isPending ? [
                {
                  type: 'dropdown',
                  label: 'Field Agent Name',
                  options: FIeldAgent,
                  selectedValue: selectedFiA,
                  onChange: hanldeFieldAgent,
                  disabled: !isEditable,
                }
              ] : []),
              ...(!isPending ? [
                {
                  type: 'text',
                  label: 'Field Agent Name',
                  value: typeOfConstruction,
                  onChange: setTypeOfConstruction,
                  placeholder: 'Enter Field Agent Name',
                  multiline: false,
                },
              ] : []),
              {
                type: 'text',
                label: 'No of Attempt',
                value: String(noOfAttemp),
                onChange: text => setNoOfAttemp(text.replace(/[^0-9]/g, '')),
                placeholder: 'Enter Number of Attempts',
                numeric: true,
                multiline: false,
              },
              {
                type: 'date',
                label: 'Date of Visit',
                value: dateOfVisit,
                onConfirm: handleConfirm,
                showPicker: showDatePicker,
                isPickerVisible: isDatePickerVisible,
                onCancel: hideDatePicker,
              },
            ],
            useRows: true,
          },
          {
            title: 'Office Verification',
            fields: [
              { type: 'text', label: 'Office Name', value: officename, onChange: setofficename, placeholder: 'Enter Office Name' },
              { type: 'text', label: 'Company Nature', value: companyNature, onChange: setcompanyNature, placeholder: 'Enter Company Nature' },
              { type: 'text', label: 'No of Years in Service', value: String(noOfYearInHouse), onChange: setNoOfYearInHouse, numeric: true, placeholder: 'Enter Years in Service' },
              { type: 'text', label: 'Applicant Designation', value: applicationdesignation, onChange: setapplicationdesignation, placeholder: 'Enter Designation' },
            ],
            useRows: true,
          },
          {
            title: 'Person Contacted',
            fields: [
              { type: 'text', label: 'Person Name', value: personName, onChange: setPersonName, placeholder: 'Enter Person Name' },
              { type: 'text', label: 'Mobile Number', value: String(mobilenumber), onChange: text => setmobilenumber(text.replace(/[^0-9]/g, '')), numeric: true, maxLength: 10, placeholder: 'Enter Mobile Number' },
              { type: 'dropdown', label: 'Relation With Applicant', options: relationwithother || [], selectedValue: selctedrelationwithothers, onChange: handlerelationwithother, placeholder: 'Select Relation' },
              { type: 'text', label: 'Others', value: others, onChange: setOthers, condition: isOtherSelected, placeholder: 'Specify Other Relation' },
            ],
            useRows: true,
          },
          {
            title: 'Application Verification',
            fields: [
              { type: 'dropdown', label: 'Verification Result', options: VerifierComment, selectedValue: selectedverifiercomment, onChange: handleverifiercommented, placeholder: 'Select Verification Result', enableSearch: false },
              { type: 'text', label: 'Remarks', value: Comments, onChange: setComments, placeholder: 'Enter Remarks', multiline: true, },
              {
                type: 'upload',
                label: 'Document Upload',
                documentNames: documentUploadName,
                handleSelect: handleDocumentSelection,
                handleDownload: handleDownloadCibilFile,
                handleCamera: handleTakePhoto,
                disabled: isDisabled,
              },
            ],
          },
        ].map((section, sIndex) => (
          <VerificationSection key={sIndex} title={section.title}>
            {section.title === 'Applicant Details' ? (
              // Render fields normally without renderRows
              section.fields
                .filter(field => field.condition !== false)
                .map((field, fIndex) => {
                  switch (field.type) {
                    case 'text':
                      return (
                        <RenderTextField
                          key={fIndex}
                          label={field.label}
                          value={field.value}
                          onChange={field.onChange}
                          editable={field.editable ?? true}
                          placeholder={field.placeholder || ''}
                          numeric={field.numeric ?? false}
                          isEditable={isEditable}
                          // styles={styles}
                          multiline={field.multiline ?? false}
                          maxLength={field.maxLength}
                        />
                      );

                    case 'dropdown':
                      return (
                        <RenderDropdownField
                          key={fIndex}
                          label={field.label}
                          data={field.options}
                          value={field.selectedValue}
                          onChange={field.onChange}
                          placeholder={field.placeholder || ''}
                          isEditable={isEditable}
                          enableSearch={field.enableSearch} // enables search
                        />
                      );
                    default:
                      return null;
                  }
                })
            ) : (
              // Apply renderRows for all other sections
              renderRows(
                section.fields
                  .filter(field => field.condition !== false)
                  .map((field, fIndex) => {
                    switch (field.type) {
                      case 'text':
                        return (
                          <RenderTextField
                            key={fIndex}
                            label={field.label}
                            value={field.value}
                            onChange={field.onChange}
                            editable={field.editable ?? true}
                            placeholder={field.placeholder || ''}
                            numeric={field.numeric ?? false}
                            isEditable={isEditable}
                            styles={styles}
                            multiline={field.multiline ?? false}
                            maxLength={field.maxLength}
                          />
                        );

                      case 'dropdown':
                        return (
                          <RenderDropdownField
                            key={fIndex}
                            label={field.label}
                            data={field.options}
                            value={field.selectedValue}
                            onChange={field.onChange}
                            placeholder={field.placeholder || ''}
                            isEditable={isEditable}
                            enableSearch={field.enableSearch} // enables search
                          />
                        );

                      case 'date':
                        return (
                          <RenderDatePicker
                            key={fIndex}
                            label={field.label}
                            value={field.value}
                            onConfirm={field.onConfirm}
                            isVisible={field.isPickerVisible}
                            showPicker={field.showPicker}
                            onCancel={field.onCancel}
                            styles={styles}
                            businessDate={BusinessDate} // ✅ pass BusinessDate
                          />

                        );

                      case 'upload':
                        return (
                          <View key={fIndex} style={styles.uploadSection}>
                            <View style={styles.uploadColumn}>
                              <Text style={styles.label}>Document Upload</Text>
                              <TouchableOpacity
                                style={[styles.documentButton, isDisabled && { backgroundColor: '#ccc' }]}
                                onPress={handleDocumentSelection}
                                disabled={isDisabled}
                              >
                                <Image
                                  source={require('../../asset/upload.png')}
                                  style={[styles.iconStyle, isDisabled && { tintColor: '#888' }]}
                                />
                                <Text style={styles.buttonText}>Select Document</Text>
                              </TouchableOpacity>

                              <View style={styles.fileList}>
                                {(documentUploadName?.length > 0 ? documentUploadName : ['No file selected']).map((name, index) => (
                                  <Text key={index} style={styles.fileNameText} numberOfLines={1}>
                                    {name}
                                  </Text>
                                ))}
                              </View>
                            </View>

                            <View style={styles.actionColumn}>
                              <TouchableOpacity
                                style={[styles.actionButton,]}
                                onPress={() => handleDownloadCibilFile(documentUpload, documentUploadName)}
                              // disabled={isDisabled}
                              >
                                <Image
                                  source={require('../../asset/download.png')}
                                  style={[styles.actionIcon, { tintColor: '#fff', }]}
                                />
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.actionButton, isDisabled && { backgroundColor: '#ccc' }]}
                                onPress={handleTakePhoto}
                                disabled={isDisabled}
                              >
                                <Image
                                  source={require('../../asset/camera.png')}
                                  style={[styles.actionIcon, isDisabled && { tintColor: '#888' }]}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );

                      default:
                        return null;
                    }
                  }),
                2, // columns
                10 // spacing
              )
            )}
          </VerificationSection>


        ))}

        {/** Action Buttons */}
        {isPending && (
          <>
            {renderButton('Save', handlesave, loading)}
            {showSubmitButton && renderButton('Submit', handleSubmit, loading, '#4CAF50')}
          </>
        )}
      </ScrollView>
    </SafeAreaView>

  );

};

export default OfficeVerifcationProcess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
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
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    color: 'black',
  },
  disabledInput: {
    backgroundColor: "#DDDBDBFF", // gray background when disabled
    color: "black",
    fontWeight: '500'
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#fff",
  },
  disabledDropdown: {
    backgroundColor: "#DDDBDBFF", // gray background when disabled
  },
  placeholderStyle: {
    color: '#888',
    fontSize: 14,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFFBB',
    marginBottom: 16,
  },
  sectionWrapper: {
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    color: 'black',
    marginVertical: 10,
    paddingLeft: 8,
    borderRadius: 6,
  },
  documentsSection: {
    padding: 16,
    marginVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  documentText: {
    color: '#000',
    flex: 1,
  },
  downloadButton: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 5,
  },
  downloadAllButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    marginTop: 20,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fileList: {
    marginTop: 4,
  },
  actionColumn: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  actionIcon: {
    width: 24,
    height: 24,
    // tintColor: '#fff',
  },
  uploadSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  uploadColumn: {
    flex: 3,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginBottom: 5,
  },
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#fff',
  },
  downloadbuttonLODA: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 6,
  },
  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  downloadIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  cameraIcon: {
    width: 24,
    height: 24,
  },
  fileNameText: {
    fontSize: 12,
    color: '#000',
    marginVertical: 2,
  },
  photoFileList: {
    width: width * 0.4,
    height: height * 0.15,
    color: 'black',
    textAlignVertical: 'center',
    fontSize: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  dateIcon: {
    width: 24,
    height: 24,
  },

  sectionWrapper: {
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
    marginVertical: 5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});
