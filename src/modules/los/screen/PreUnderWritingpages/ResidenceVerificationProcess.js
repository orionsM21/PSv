import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity, Alert,
  ActivityIndicator, Image, Platform, ToastAndroid, PermissionsAndroid, Button, Modal,
  SafeAreaView
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
import { RNCamera } from 'react-native-camera';
import { request, } from 'react-native-permissions';
// import { launchCamera } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer';

import ApplicationDetails from '../Component/ApplicantDetailsComponent';
import { RenderDropdownField, RenderTextField } from '../Component/ResponsiveFormFields';
import DetailHeader from '../Component/DetailHeader';
const { width, height } = Dimensions.get('window');




export const VerificationSection = ({ title, children, style }) => (
  <View style={[styles.sectionWrapper, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);
const ResidenceVerificationProcess = ({ route }) => {
  const { item } = route.params;
  // 
  const token = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.losuserDetails);

  const [loading, setLoading] = useState(false);
  const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
  const navigation = useNavigation();
  const applicant = item.applicant[0]?.individualApplicant;
  const [applicationByid, setApplicationByid] = useState(null);
  const [BusinessDate, setBusinessDate] = useState([]);
  const [selectedApplicantType, setSelectedApplicantType] = useState('');
  const [ApplicantArray, setApplicantArray] = useState([]); // To store

  const [applicantidApplicant, setApplicantidApplicant] = useState(null);
  const [applicantidindividualApplicant, setApplicantidIndividualApplicant] =
    useState([]);
  const [applicantCategoryCode, setApplicantCategoryCode] = useState('');
  const [currentAddress, setcurrentAddress] = useState({})
  const [Cibilid, setCibilid] = useState('');
  const [fullName, setFullName] = useState('');
  const [applicantTypes, setApplicantTypes] = useState([]);

  const [
    getInitiateVerificationByApplicantidd,
    setgetInitiateVerificationByApplicantidd,
  ] = useState([]);
  const [getresidePincode, setresidePincode] = useState([]);
  const [residid, setresidid] = useState([]);


  const [Pincodes, setPincodes] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [selectedPincodeId, setSelectedPincodeId] = useState(null); // Track pincodeId


  const [verificationWaiverData, setVerificationWaiverData] = useState([])
  const [getInditiateVerificationWaiverByApplicationNumber, setgetInitiateVerificationWaiverByApplicationNumber] = useState([])

  const [agencyForLength, setAgnecyForLength] = useState([]);
  const [agencyForAgent, setAgencyForAgent] = useState([]);
  const agencyForAgentLength = agencyForLength?.length


  const officeVerificationWaive = verificationWaiverData?.filter(
    (val) => val?.verificationLists === 'Office_Verification',
  )


  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [relationwithothers, setrelationwithother] = useState([]);
  const [selctedrelationwithothers, setselctedrelationWithOtherStates] =
    useState(null);

  const [selectedverifiercomment, setselectedverifiercomment] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [ownership, setownership] = useState([]);
  const [selectedownership, setselectedownership] = useState(null);

  const [accomodationm, setaccomodation] = useState([]);
  const [selectedaccomodation, setselectedaccomodation] = useState(null);

  const [verificationagency, setverificationagency] = useState([]);
  const [selectedverificationagency, setselectedverificationagency] = useState(null);


  // const [residenceVerificationId, setResidenceVerificationId] = useState(null);
  const [verificationAgenct, setverificationAgenct] = useState([]);
  const [selectedverificationAgenct, setselectedverificationAgenct] =
    useState(null);

  const [payloadd, setpayload] = useState([]);



  ;


  const VerifierComment = [
    { label: 'Positive', value: 'Positive' },
    { label: 'Negative', value: 'Negative' },
  ];

  const [locality, setLocality] = useState('');
  const [typeOfConstruction, setTypeOfConstruction] = useState('');
  const [fullNamew, setfullNamew] = useState('');

  const [houseHoldTerms, setHouseHoldTerms] = useState('');

  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [address3, setAddress3] = useState('');

  const [landMark, setlandMark] = useState('');
  const [others, setOthers] = useState('');

  const [noOfFamily, setNoOfFamily] = useState('');
  const [noOfAttemp, setNoOfAttemp] = useState('');
  const [dateOfVisit, setdateOfVisit] = useState('');
  const [areaSQFT, setAreaSQFT] = useState('');
  const [noOfYearInHouse, setNoOfYearInHouse] = useState('');
  const [residenceVerificationId, setResidenceVerificationId] = useState('');

  const [CityName, setcityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [locationData, setlocationData] = useState('');


  const [documentUpload, setDocumentUpload] = useState(null);
  const [documentUploadName, setDocumentUploadName] = useState([]);
  const [modalVisibleCutsomnameChange, setModalVisibleCutsomnameChange] = useState(false);



  useEffect(() => {
    if (!currentAddress) return;

    const { addressLine1 = '', addressLine2 = '', addressLine3 = '', pincode = {} } = currentAddress;

    // // Only update state if values are different
    // if (address1 !== addressLine1) setAddress1(addressLine1);
    // if (address2 !== addressLine2) setAddress2(addressLine2);
    // if (address3 !== addressLine3) setAddress3(addressLine3);

    const { pincode: pin = '', pincodeId: pinId = null } = pincode;
    if (selectedPincode !== pin) setSelectedPincode(pin);
    if (selectedPincodeId !== pinId) setSelectedPincodeId(pinId);

    if (pin) {
      findAreaName(pin)
        .then((response) => {
          const data = response.data?.data || {};
          setcityName(data.cityName || '');
          setStateName(data.stateName || '');
          setCountryName(data.countryName || '');
        })
        .catch((err) => console.error('Error fetching area info:', err));
    }
  }, [currentAddress]);





  // useEffect(() => {
  //   // Set file if updateCollateral has file data
  //   if (documentUpload, documentUploadName) {
  //     const binaryData = documentUpload;
  //     const filename = documentUploadName || 'default_filename';
  //     handleDownloadCibilFile(binaryData, filename);
  //   }
  // }, [documentUpload, documentUploadName]);


  // const handleTakePhoto = () => {
  //   const options = {
  //     mediaType: 'photo',
  //     cameraType: 'back', // You can use 'front' for front camera
  //     saveToPhotos: true, // Save photo to the gallery
  //   };

  //   launchCamera(options, (response) => {
  //     if (response.didCancel) {
  //       Alert.alert('Camera closed without taking a photo.');
  //     } else if (response.errorCode) {
  //       Alert.alert('Error:', response.errorMessage);
  //     } else {
  //       const source = { uri: response.assets[0].uri };
  //       setImageUri(source.uri);
  //     }
  //   });
  // };

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

  // const [imageUri, setImageUri] = useState(null);



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
              c
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



  const [pincodeforAPi, setpincodeforAPi] = useState('');

  const [applicantTypess, setApplicantTypess] = useState([]);
  const [Comments, setComments] = useState('');
  const [logdetails, setLogDetails] = useState([]);
  const [errors, setErrors] = useState({});
  const [vaiwerdaaata, setvaiwerdaaata] = useState([])
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  // const [dateOfVisit, setDateOfVisit] = useState('');  // State for date
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);  // State to manage DatePicker visibility
  const [savedStatus, setSavedStatus] = useState({
    applicant: false,
    coApplicant: false,
    guarantor: false,
  });


  // const coApplicantCountMap = {};
  // const guarantorCountMap = {};

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
        const currentAddress = (a.address || []).find(addr => addr.addressType === "CURRENT") || {};
        const pincode = currentAddress.pincode?.pincode || "";

        return { label, value: a.id, pincode: a.pincode, pincodeId: a.pincodeId, _index: index };
      });


    setApplicantTypess(result);
  }, [applicantTypes, vaiwerdaaata]);









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



  const [
    indAreaNameCityStateRegionZoneCountryByPincode,
    setindAreaNameCityStateRegionZoneCountryByPincode,
  ] = useState([]);






  useEffect(() => {
    getApplicationByid();
    getAllPincode();
    getAllAgency();
    getByTypelookupTypeReleationWithApplicant();
    getByTypelookupTypeOwnership();
    getByTypelookupTypeTypeofAccommodation();
    getLogsDetailsByApplicationNumber();
    getBusinessDate();
    getVerificationWaiverFromInitiateByApplicantId();
    getInitiateVerificationWaiverByApplicationNumber();
    FieldAgent();
  }, []);

  useEffect(() => {
    if (applicantidApplicant) {
      getInitiateVerificationWaiverByApplicationNumber();
      getResidenceVerificationByApplicantidd();
      setselctedrelationWithOtherStates('');
      setselectedverifiercomment('');
      setselectedaccomodation('');
      setselectedownership('');
      setComments('');
      setLocality('');
      setTypeOfConstruction('');
      setselectedFiA('');
      setfullNamew('');
      setHouseHoldTerms('');
      // setAddress1('');
      // setAddress2('');
      // setAddress3('');
      setlandMark('');
      setNoOfFamily('');
      setNoOfAttemp('');
      setdateOfVisit('');
      setAreaSQFT('');
      setNoOfYearInHouse('');
      setcityName('');
      setStateName('');
      // setSelectedPincode('');
      setselectedverificationagency('');
      setselectedverificationAgenct('');
      setResidenceVerificationId('');
      setFile(null);
      setFileName('');
      setDocumentUpload(null);
      setDocumentUploadName(null);
      setOthers('');
      setPhotoFile(null);
      setPhotoFileName('');
      // setFullName('')
    }
  }, [applicantidApplicant]);

  const getInitiateVerificationWaiverByApplicationNumber = async () => {

    try {
      const response = await axios.get(
        `${BASE_URL}getInitiateVerificationByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      setgetInitiateVerificationWaiverByApplicationNumber(data)
      // setgetInitiateVerificationByApplicantidd(data);

      // setvaiwerdaaata(data);
    } catch (error) {
      console.error(
        'Error fetching getVerificationFromInitiateByApplicantionNumber:',
        error,
      );
    }
  };

  useEffect(() => {
    const getAppData = async () => {
      if (!item || !item.id) {
        console.error('Item ID is missing');
        return;
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
          }
        );

        const allData = response?.data?.data;

        const filterHouseWife = allData?.applicant?.filter(
          (val) => val?.individualApplicant?.primaryOccupation !== 'House Wife',
        )
        // Set the full list of applicants
        setAgnecyForLength(filterHouseWife);

        // Extract all waived applicant IDs
        const waivedApplicantIds = [
          ...new Set((verificationWaiverData || []).map((w) => w.applicantId)),
        ];

        // Filter only those applicants who are waived
        const filteredApplicants = (allData?.applicant || []).filter((applicant) =>
          waivedApplicantIds.includes(applicant.id)
        );

        // Map applicant names
        const applicantName = filteredApplicants.map((applicant) => ({
          label: `${applicant?.individualApplicant?.firstName} ${applicant?.individualApplicant?.middleName} ${applicant?.individualApplicant?.lastName}`,
          value: applicant.applicantTypeCode,
          id: applicant.id,
        }));

        setAgencyForAgent(applicantName);
      } catch (error) {
        console.error('Failed to fetch application data:', error);
      }
    };

    if (item?.id && verificationWaiverData?.length) {
      getAppData();
    }
  }, [item?.id, verificationWaiverData]);

  const getVerificationWaiverFromInitiateByApplicantId = async () => {

    try {
      const response = await axios.get(
        `${BASE_URL}getVerificationWaiverFromInitiateByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response?.data?.data;
      const filtereddata = data?.filter(i => i.verificationLists === "Residence_Verification")
      // setgetInitiateVerificationByApplicantidd(data);
      setVerificationWaiverData(response.data.data);
      setvaiwerdaaata(filtereddata);
    } catch (error) {
      console.error(
        'Error fetching getVerificationWaiverFromInitiateByApplicantionNumber:',
        error,
      );
    }
  };


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
    if (!pincodeforAPi) return;
    findAreaNameCityStateRegionZoneCountryByPincode(pincodeforAPi);
  }, [pincodeforAPi]);

  const getApplicationByid = useCallback(async () => {
    if (!item?.id) return console.error('❌ Item ID missing');

    try {
      const { data } = await axios.get(`${BASE_URL}getApplicationById/${item.id}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const appData = data?.data;
      if (!appData) throw new Error('Application data not found');

      setApplicationByid(appData);
      setApplicantArray(appData.applicant || []);

      // Normalize applicant types for dropdown
      const mapped = (appData.applicant || []).map(app => {
        // Find the CURRENT address (or fallback to any address)
        const currentAddress = (app.address || []).find(
          addr => ["CURRENT", "Registered Address"].includes(addr.addressType)
        );
        // Get pincode from the currentAddress, if exists
        const pincode = currentAddress.pincode?.pincode || '';
        const pincodeId = currentAddress.pincode?.pincodeId || '';
        return {
          type: app.applicantTypeCode,
          id: app.id,
          pincode: pincode,
          pincodeId: pincodeId
        };
      });


      setApplicantTypes(mapped);
    } catch (error) {
      console.error('❌ Error fetching application data:', error);
      Alert.alert('Error', 'Failed to fetch application data');
    }
  }, [item?.id, token]);


  // const getResidenceVerificationByApplicantid = async (userid) => {
  //   // if (!applicantidApplicant) {
  //   //   console.error('Applicant ID is missing');
  //   //   return; // Exit early if applicantidApplicant is undefined
  //   // }
  //   try {
  //     const response = await axios.get(
  //       `getResidenceVerificationByApplicantId/${userid}`,
  //       {
  //         headers: {
  //           Accept: 'application/json',
  //           'Content-Type': 'application/json',
  //           Authorization: 'Bearer ' + token,
  //         },
  //       },
  //     );
  //     const data = response?.data?.data; // Safely access data
  //     
  //     if (Array.isArray(data) && data.length > 0) {
  //       const pincode = data[0]?.pincode;
  //       if (pincode) {
  //         setresidePincode(pincode);
  //       } else {
  //         console.error('Pincode is missing in the data:', data[0]);
  //       }
  //       setgetInitiateVerificationByApplicantidd(data);
  //     } else {
  //       console.error('Data is undefined or empty:', data);
  //     }
  //   } catch (error) {
  //     console.error(
  //       'Error fetching getResidenceVerificationByApplicantId data:',
  //       error,
  //     );
  //   }
  // };

  const getResidenceVerificationByApplicantidd = async () => {
    // if (!applicantidApplicant) {
    //   console.error('Applicant ID is missing');
    //   return; // Exit early if applicantidApplicant is undefined
    // }
    try {
      const response = await axios.get(
        `${BASE_URL}getResidenceVerificationByApplicantId/${applicantidApplicant}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response?.data?.data; // Safely access data

      if (Array.isArray(data) && data.length > 0) {
        const pincode = data[0]?.pincode;
        if (pincode) {
          setresidePincode(pincode);
        } else {
          console.error('Pincode is missing in the data:', data[0]);
        }
        setgetInitiateVerificationByApplicantidd(data);
      } else {
        console.error('Data is undefined or empty:', data);
      }
    } catch (error) {
      console.error(
        'Error fetching getResidenceVerificationByApplicantId data:',
        error,
      );
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
        (log) => log?.description === "Residence Verification"
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
  // const handleSubmit = async () => {
  //   // Update the log activity status and stage
  //   await updateLogActivityById();

  //   // Update the residence verification flag
  //   await updateResidenceVerificationFlag();

  //   // Update the residence verification details
  //   await updateStageMainTainByApplicationNumber();
  // }


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
        },  // Send the payload as the request body
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
  useFocusEffect(
    React.useCallback(() => {
      getLogsDetailsByApplicationNumber();

    }, []) // Empty dependency array to ensure this runs every time the screen is focused
  );
  const updateResidenceVerificationFlag = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        active: true,
        applicationNumber: residid.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.put(
        `${BASE_URL}updateResidenceVerificationFlag/${residid.applicationNumber}`,  // Assuming PUT request to update
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }, // Send the payload as the request body
      );

      if (response.data.msgKey === 'Success' || response.status === 200 || response.status === 201) {
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
        stage: "Office Verification",
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
      const successMessage = response.data?.message || 'Stage updated successfully!';
      // Alert.alert(msgKey, successMessage);

      setLoading(false); // Hide loader


      if (officeVerificationWaive?.length === agencyForAgentLength) {
        addLogActivityRCU(); // ✅ Executes when they MATCH
      } else {
        navigation.replace('Office Verifcation', { item: item }); // Runs when they DON'T match
      }
      // }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };

  const addLogActivityRCU = async () => {
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
        navigation.replace('Initiate RCU', { item: item });
        setLoading(false); // Hide loader
      }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };

  const handleSelectionChange = async (item) => {
    if (!item) return;

    const userid = item.value ?? item.id;
    if (userid) setSelectedApplicantType(userid);

    const selectedApplicant = ApplicantArray.find(app => app.id === userid);
    if (!selectedApplicant) {
      setApplicantCategoryCode('');
      setFullName('');
      setApplicantidApplicant(null);
      setApplicantidIndividualApplicant(null);
      setCibilid(null);
      setcurrentAddress(null);
      setAddress1('');
      setAddress2('');
      setAddress3('');
      return;
    }

    setApplicantidApplicant(userid);
    setApplicantidIndividualApplicant(userid);
    setCibilid(userid);

    if (selectedApplicant.organizationApplicant) {
      const { primaryOccupation, organizationName } = selectedApplicant.organizationApplicant;
      setApplicantCategoryCode(primaryOccupation || '');
      setFullName(organizationName || '');
    } else if (selectedApplicant.individualApplicant) {
      const { primaryOccupation, firstName, middleName, lastName } = selectedApplicant.individualApplicant;
      setApplicantCategoryCode(primaryOccupation || '');
      setFullName(`${firstName || ''} ${middleName || ''} ${lastName || ''}`.trim());
    } else {
      setApplicantCategoryCode('');
      setFullName('');
    }

    // ✅ Safely find current address
    const selectedAddress = (selectedApplicant?.address || []).find(
      addr => ["CURRENT", "Registered Address"].includes(addr.addressType)
    );

    if (selectedAddress) {
      setcurrentAddress(selectedAddress); // update state
      setAddress1(selectedAddress.addressLine1 || '');
      setAddress2(selectedAddress.addressLine2 || '');
      setAddress3(selectedAddress.addressLine3 || '');
      const selectedPincodeValue = selectedAddress?.pincode?.pincode; // Extracting pincode directly
      setpincodeforAPi(selectedPincodeValue);
    } else {
      // fallback if no address found
      setcurrentAddress(null);
      setAddress1('');
      setAddress2('');
      setAddress3('');
    }


  };




  const handlePincodee = async (item) => {
    setSelectedPincode(item.value);
    setSelectedPincodeId(item.pincodeId);


    try {
      // Make API call to find area name based on selected pincode
      const response = await findAreaName(item.label);

      // Assuming the response returns an object with an areaName property
      // setAreaName(response.data.areaName);
      setcityName(response.data.data.cityName); // Set city name
      setStateName(response.data.data.stateName); // Set state name
      setCountryName(response.data.data.countryName)
    } catch (error) {
      console.error("Error fetching area name:", error);
    }
  };

  // Function to call the API for area name
  const findAreaName = (pincode) => {
    return axios.get(`${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincode}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      },
    );
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

  const handleOwnership = item => {
    setselectedownership(item.value);
  };

  const hanldeFieldAgent = item => {
    setselectedFiA(item.value)
  }

  const handleAccomodation = item => {
    setselectedaccomodation(item.value);
  };

  const handleVerificatinAgency = async (item) => {
    setselectedverificationagency(item.value);

    const userType = item.label.replace(' ', '%20'); // URL encoding

    try {
      const response = await axios.get(`${BASE_URL}getAgencyByAgencyName/${userType}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      // Log the response to check its structure


      // Accessing the 'data' field, which is an array
      if (Array.isArray(response.data.data)) {
        const mergedData = response.data.data.map((agency) => {
          return {
            label: `${agency.firstName} ${agency.lastName}`, // Merge firstName and lastName
            value: agency.agencyMasterId, // Assuming agencyMasterId is the unique identifier
          };
        });


        // Update the dropdown data
        setverificationAgenct(mergedData); // Update the dropdown with merged names
      } else {
        console.error('Expected an array in the response, but got:', response.data);
      }

    } catch (error) {
      console.error('Error fetching agency data:', error);
    }
  };



  const handleverificationAgent = item => {
    setselectedverificationAgenct(item.value);
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
        `${BASE_URL}getByType?lookupType=RelationWithApplicant`,
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
        'Error fetching getByType?lookupType=ReleationWithApplicant data:',
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
        `${BASE_URL}getByType?lookupType=TypeOfAccommodation`,
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
      // setverificationagency(data);

      if (Array.isArray(response.data.data.content)) {
        const mergedData = response.data.data.content.map((agency) => {
          return {
            label: `${agency.agencyName} `, // Merge firstName and lastName
            value: agency.agencyMasterId, // Assuming agencyMasterId is the unique identifier
          };
        });


        // Update the dropdown data
        setverificationagency(mergedData); // Update the dropdown with merged names
      } else {
        console.error('Expected an array in the response, but got:', response.data);
      }
      // setverificationAgenct(data);
    } catch (error) {
      console.error(
        'Error fetching getAllAgency data:',
        error.message || error,
      );
    }
  };

  const findAreaNameCityStateRegionZoneCountryByPincode = async (pincode) => {
    try {
      const response = await axios.get(
        `${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincode}`,
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
      setindAreaNameCityStateRegionZoneCountryByPincode(data);
    } catch (error) {
      console.error(
        'Error fetching indAreaNameCityStateRegionZoneCountryByPincode data:',
        error.message || error,
      );
    }
  };
  useEffect(() => {
    if (indAreaNameCityStateRegionZoneCountryByPincode) {
      const info = indAreaNameCityStateRegionZoneCountryByPincode;

      setcityName(info?.cityName || '');
      setStateName(info?.stateName || '');
      setCountryName(info?.countryName || '');
      setSelectedPincode(info?.pincode);
    }
  }, [indAreaNameCityStateRegionZoneCountryByPincode]);

  const createResidenceverification = async () => {


    let formattedDatepayload = null;

    if (dateOfVisit) {
      const parsedDate = moment(dateOfVisit, 'DD-MM-YYYY');
      if (parsedDate.isValid()) {
        formattedDatepayload = parsedDate.format('YYYY-MM-DD');

      } else {
        console.error("Invalid date:", dateOfVisit);
      }
    } else {
      console.error("No date provided.");
    }

    const dto = {
      residenceVerificationId: residenceVerificationId || '',
      applicationNumber: item.applicationNo,
      noOfAttempt: noOfAttemp ? Number(noOfAttemp) : null,
      dateOfVisit: formattedDatepayload,
      locality: locality,
      typeOfAccommodation: selectedaccomodation,
      ownership: selectedownership,
      fieldAgentName: selectedFiA,
      noOfYearInHouse: noOfYearInHouse ? Number(noOfYearInHouse) : null,
      houseHoldTerms: houseHoldTerms,
      fullName: fullNamew,
      relationWithApplicant: selctedrelationwithothers,
      noOfFamily: noOfFamily ? Number(noOfFamily) : null,
      verificationResult: selectedverifiercomment,
      verifierComments: Comments,
      applicantId: applicantidApplicant || null,
      address1: address1,
      address2: address2,
      address3: address3,
      landMark: landMark,
      other: others || null,
      pincode: {
        pincodeId: selectedPincodeId
      }
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
    // ✅ Ensure multiple photo uploads are handled
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
    //   return;
    // }

    try {
      const response = await RNFetchBlob.fetch(
        'PUT',
        `${BASE_URL}createResidenceVerification`,
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
        // Handle successful response
        getResidenceVerificationByApplicantidd();
      } else {
        Alert.alert('Error', responseData.message || 'Failed to upload the file.');
      }
      return response.data;
    } catch (error) {
      console.error('Error in createResidenceVerification:', error.message || error);
      Alert.alert('Error', 'Failed to add residence verification.');
    }
  };




  const getResidenceVerificationByApplicationNumber = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getResidenceVerificationByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

    } catch (error) {
      console.error(
        'Error fetching getResidenceVerificationByApplicationNumber data:',
        error.message || error,
      );
    }
  }

  const getResidenceVerificationByApplicantid = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getResidenceVerificationByApplicantId/${applicantidApplicant}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      if (response.data && response.data.length > 0) {
        const firstVerification = response.data[0]; // Take the first object (or modify if you need another)
        setResidenceVerificationId(firstVerification.residenceVerificationId); // Store the residenceVerificationId in state
        setLoading(false); //
      } else {

      }

    } catch (error) {
      console.error(
        'Error fetching getResidenceVerificationByApplicationNumber data:',
        error.message || error,
      );
    }
  }

  const pincodeData = Pincodes.map(pincodeObj => ({
    label: `${pincodeObj.pincode} `, // Combine pincode and area name
    value: pincodeObj.pincode, // Use pincode as the value
    pincodeId: pincodeObj.pincodeId,
  }));

  const relationwithother = relationwithothers.map(pincodeObj => ({
    label: `${pincodeObj.lookupName} `, // Combine pincode and area name
    value: pincodeObj.lookupName, // Use pincode as the value
  }));

  const ownershipa = ownership.map(pincodeObj => ({
    label: `${pincodeObj.lookupName} `, // Combine pincode and area name
    value: pincodeObj.lookupName, // Use pincode as the value
  }));

  const Accomodation = accomodationm.map(pincodeObj => ({
    label: `${pincodeObj.lookupName} `, // Combine pincode and area name
    value: pincodeObj.lookupName, // Use pincode as the value
  }));




  // 
  useEffect(() => {
    // Check if `getInitiateVerificationByApplicantidd` has data
    if (getInitiateVerificationByApplicantidd.length > 0) {
      const verificationData = getInitiateVerificationByApplicantidd[0];
      // Assuming you're working with the first object
      setpayload(verificationData);
      // setselectedverificationagency(verificationData.verificationAgencyName);
      setselctedrelationWithOtherStates(verificationData.relationWithApplicant);
      const verificationResult = verificationData.verificationResult;
      // 

      // Set the selected value in the dropdown
      setselectedverifiercomment(verificationResult);

      // Ensure that verificationAgentName exists in the data array and matches one of the values
      const agenctNameId = verificationData.verificationAgent;
      const agentName = verificationData.verificationAgentName;
      const agencynameId = verificationData.verificationAgency;
      const agencyName = verificationData.verificationAgencyName;
      // const agencyMasterId = verificationData.agencyMasterId; // You may need to adjust based on the actual field name


      // Here, you need to set the dropdown data. It might come from `getInitiateVerificationByApplicantidd` or another source.
      // For now, I'm assuming it's a static array of agents, but you could populate it dynamically.
      setverificationAgenct([
        { label: agentName, value: agenctNameId }, // Populate with data as needed
      ]);

      // setverificationagency([
      //   { label: agencyName, value: agencynameId }, // Use agencyName as the label, and agencyMasterId as the value
      // ]);



      setselectedaccomodation(verificationData.typeOfAccommodation);
      setselectedownership(verificationData.ownership);

      // Set the selected verification agent
      setselectedverificationagency(agencynameId);
      setselectedverificationAgenct(agenctNameId);


      setComments(verificationData.verifierComments || '');
      setLocality(verificationData.locality || ''); // Use default if the field is empty
      setTypeOfConstruction(verificationData.fieldAgentName || '');
      setselectedFiA(verificationData?.fieldAgentName || '')
      setfullNamew(verificationData.fullName || ''); // Convert number to string
      // setNoOfFamily(verificationData.|| ''); // Convert number to string
      setHouseHoldTerms(verificationData.houseHoldTerms || '');
      setAddress1(verificationData?.address1 || ''); // Convert)
      setAddress2(verificationData?.address2 || '');
      setAddress3(verificationData?.address3 || '');
      setlandMark(verificationData.landMark || '');
      setNoOfFamily(verificationData.noOfFamily || ''); // Convert number to string
      setNoOfAttemp(verificationData.noOfAttempt || '');
      setdateOfVisit(verificationData.dateOfVisit || '');
      setAreaSQFT(verificationData.areaSQFT || ''); // Convert number to string
      setNoOfYearInHouse(verificationData.noOfYearInHouse || '');
      setResidenceVerificationId(verificationData.residenceVerificationId);
      setOthers(verificationData.other)

      // setDocumentUpload(verificationData?.documentUpload);
      if (verificationData?.documentUpload) {
        setDocumentUpload(Array.isArray(verificationData?.documentUpload) ? verificationData?.documentUpload : [verificationData?.documentUpload]);
      }
      if (verificationData?.documentUploadName) {
        setDocumentUploadName(Array.isArray(verificationData.documentUploadName) ? verificationData.documentUploadName : [verificationData.documentUploadName]);
      }
      // setFileName(verificationData?.fileName); // Dynam

      if (verificationData?.other) {
        setIsOtherSelected(true);
      } else {
        setIsOtherSelected(false);
      }


      const pincodeFromData = verificationData.pincode;
      const City = pincodeFromData.city;
      setcityName(City.cityName || '');

      const State = City.state;
      // 
      setStateName(State.stateName || '');
      setCountryName(State.countryName)

      const selectedPincodeValue = pincodeFromData.pincode; // Extracting pincode directly
      setpincodeforAPi(selectedPincodeValue);


      // Set the selected pincode if it matches an option in the dropdown
      const matchingPincode = Pincodes.find(
        p => p.pincode === selectedPincodeValue,
      );
      if (matchingPincode) {
        setSelectedPincode(matchingPincode.pincode); // Set the selected pincode based on the matching data
        setSelectedPincodeId(matchingPincode.pincodeId)
      }
    }
    if (getresidePincode.length > 0) {
      setPincodes(getresidePincode.pincode);

    }
  }, [getInitiateVerificationByApplicantidd]);


  const ResidenceValidation = () => {
    const missingFields = [];

    // Step 1: Validate Required Fields
    if (!selectedApplicantType) {
      missingFields.push('Applicant Type');
    }

    if (!fullName) {
      missingFields.push('Applicant Name');
    }

    if (!isChecked1 && !isChecked2 && !isChecked3) {
      missingFields.push('At least Check one checkbox  in Residence');
    }

    if (isChecked2 && !residextAgencytype && !selectedResidenceExtagency) {
      // Skip External Agency Type validation if Internal or Waiver is selected
      missingFields.push('issue in  External Agency in Residence');
    }

    if (!noofInstance) {
      missingFields.push('Number of Instances in Residence');
    }

    // Step 3: Conditional Validations for Disabled Fields
    if (isChecked3 && !selectedResidenceWaiver) {
      // Skip Waiver Reason validation if Waiver is not checked
      missingFields.push('please selecte a Waiver Reason');
    }

    // if (isChecked3 && !selectedResidenceExtagency && !isChecked1) {
    //   // Skip External Agency validation if Internal is checked
    //   missingFields.push('External Agency when "Waiver" is checked in Residence');
    // }

    if (!remark) {
      missingFields.push('Remarks in Residence');
    }

    return missingFields.length ? missingFields : true;
  };




  const validateFields = () => {
    const failures = [];

    // helper
    const isEmpty = (v) => v == null || String(v).trim() === "";
    const isInvalidNum = (v) => isEmpty(v) || isNaN(v) || Number(v) <= 0;

    // rule-based schema
    const fields = [
      { check: isEmpty(selectedApplicantType), msg: "Please select an Applicant Type." },
      { check: isEmpty(fullName), msg: "Full Name cannot be empty." },
      { check: isEmpty(selectedFiA), msg: "Field Agent Name cannot be empty." },
      { check: isInvalidNum(noOfAttemp), msg: "Please enter a valid number of attempts." },
      { check: isEmpty(dateOfVisit), msg: "Please select a Date of Visit." },
      { check: isEmpty(selectedaccomodation), msg: "Please select the Type of Accommodation." },
      { check: isEmpty(selectedownership), msg: "Please select Ownership." },
      { check: isEmpty(locality), msg: "Locality cannot be empty." },
      { check: noOfYearInHouse == null || isNaN(noOfYearInHouse) || Number(noOfYearInHouse) < 0, msg: "Please enter a valid number of years in the house." },
      { check: isEmpty(address1), msg: "Address 1 cannot be empty." },
      { check: isEmpty(address2), msg: "Address 2 cannot be empty." },
      { check: isEmpty(selectedPincode), msg: "Please select a Pincode." },
      { check: isEmpty(CityName), msg: "City cannot be empty." },
      { check: isEmpty(stateName), msg: "State cannot be empty." },
      { check: isEmpty(fullNamew), msg: "Full Name of Person Contacted cannot be empty." },
      { check: isEmpty(selctedrelationwithothers), msg: "Please select a Relation with the Applicant." },
      { check: isEmpty(noOfFamily), msg: "No Of Family cannot be empty." },
      { check: isEmpty(selectedverifiercomment), msg: "Please select a Result." },
      { check: isEmpty(Comments), msg: "Comments cannot be empty." },
    ];

    // run validation
    fields.forEach(({ check, msg }) => {
      if (check) failures.push(msg);
    });

    return failures.length ? failures : true;
  };


  const handlesave = async () => {
    const residenceValidationResult = validateFields();
    const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

    if (missingFields.length) {
      const formattedMissingFields = missingFields
        .map(field => `\u2022 ${field}`)
        .join('\n');

      Alert.alert('⚠️ Alert', formattedMissingFields, [{ text: 'OK', style: 'cancel' }]);
      return;
    }

    try {
      setLoading(true);

      // ✅ Save residence verification
      await createResidenceverification();

      // ✅ Refresh verification data
      await getResidenceVerificationByApplicationNumber();
      await getResidenceVerificationByApplicantid();

      // ✅ Mark current applicant as saved
      setSavedStatus(prev => ({ ...prev, [selectedApplicantType.toString()]: true }));

      // ✅ Determine which array to use
      const dropdownArray = applicantTypess.length
        ? applicantTypess
        : applicantTypes.map(a => ({ label: a.type, value: a.id }));

      // ✅ Find next applicant or fallback to current
      const currentIndex = dropdownArray.findIndex(app => app.value === selectedApplicantType);
      const nextIndex = currentIndex + 1;
      const nextType = nextIndex < dropdownArray.length
        ? dropdownArray[nextIndex]
        : dropdownArray[currentIndex]; // fallback to current if last

      setSelectedApplicantType(nextType.value);

      // ✅ Call dropdown change for next/current applicant
      handleSelectionChange({ value: nextType.value, label: nextType.label });

    } catch (error) {
      console.error('Error saving verification:', error);
      Alert.alert('Error', 'Something went wrong while saving verification.');
    } finally {
      setLoading(false);
    }
  };



  // const showSubmitButton = applicantTypes?.every(applicant =>
  //   savedStatus[applicant?.type?.toLowerCase()] // Ensure it checks `type`, not entire object
  // );

  const dropdownArray = applicantTypess.length
    ? applicantTypess
    : applicantTypes.map(a => ({ label: a.type, value: a.id }));

  const showSubmitButton = dropdownArray.length > 0
    ? dropdownArray.every(applicant => {
      const key = applicant?.value?.toString();
      return key ? savedStatus[key] : false;
    })
    : false;




  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');


  const [photoFile, setPhotoFile] = useState(null);  // For storing the photo
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);
  const [photoFileName, setPhotoFileName] = useState([]);  // For storing the photo
  const [customFilenames, setCustomFilenames] = useState('')
  const [FIeldAgent, setFIeldAgent] = useState([]);
  const [selectedFiA, setselectedFiA] = useState('');

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




  // const handleTakePhoto = async () => {
  //   await requestCameraPermission();
  //   const options = {
  //     mediaType: 'photo',
  //     cameraType: 'back',
  //     saveToPhotos: true,
  //   };

  //   launchCamera(options, async (response) => {
  //     if (response.didCancel) {
  //       Alert.alert('Camera closed without taking a photo.');
  //     } else if (response.errorCode) {
  //       Alert.alert('Error:', response.errorMessage);
  //       
  //     } else {
  //       let filePath = response.assets[0].uri;

  //       // Handle Android `content://` URI
  //       if (filePath.startsWith('content://') && Platform.OS === 'android') {
  //         const localPath = `${RNFS.DocumentDirectoryPath}/${response.assets[0].fileName || 'photo.jpg'}`;
  //         await RNFS.copyFile(filePath, localPath);
  //         filePath = localPath;
  //         
  //       }

  //       // Resize image
  //       const resizedImage = await ImageResizer.createResizedImage(filePath, 800, 600, 'JPEG', 80);
  //       let resizedFilePath = resizedImage.uri;

  //       // Check file size
  //       const fileStats = await RNFS.stat(resizedFilePath);
  //       const fileSizeInMB = fileStats.size / (1024 * 1024);
  //       } MB`);

  //       if (fileSizeInMB > 1) {
  //         Alert.alert('File Size Exceeded', 'Please select a smaller file.');
  //         return;
  //       }

  //       // Store the file without a name (waiting for user input)
  //       setPhotoFile({
  //         uri: `file://${resizedFilePath}`,
  //         name: '', // Initially empty, will be updated after modal input
  //         type: response.assets[0].type || 'image/jpeg',
  //       });

  //       // Show modal for custom name input
  //       setModalVisibleCutsomnameChange(true);
  //     }
  //   });
  // };

  // const FieldAgent = async () => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}getByType?lookupType=FieldAgentName`,
  //       {
  //         headers: {
  //           Accept: 'application/json',
  //           'Content-Type': 'application/json',
  //           Authorization: 'Bearer ' + token,
  //         },
  //       },
  //     );
  //     setFIeldAgent(response?.data?.data)
  //     console.log(response?.data?.data, 'FieldAgentName')
  //   } catch {

  //   }
  // }

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


  // const handleSaveFileName = () => {
  //   if (fileName.trim() === '') {
  //     Alert.alert('Please provide a name for the image.');
  //     return;
  //   }

  //   // Update the file object with the user-provided name
  //   setPhotoFile((prevFile) => ({
  //     ...prevFile,
  //     name: fileName, // Set the custom name
  //   }));

  //   setPhotoFileName(fileName);
  //   setModalVisibleCutsomnameChange(false);
  //   Alert.alert('Image name saved as:', fileName);
  // };

  // const handleSaveFileName = () => { 
  //   if (fileName.trim() === '') {
  //     Alert.alert("Please provide a name for the image.");
  //     return;
  //   }

  //   setPhotoFileName((prevNames) => [...prevNames, fileName]); // Store multiple names
  //   setModalVisibleCutsomnameChange(false);
  //   Alert.alert("Image name saved as:", fileName);
  // };

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
                'POST',
                `uploadFile/${applicantidApplicant}`,
                {
                  'Content-Type': 'multipart/form-data',
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

  const formatNumberWithCommas = (num) => {
    if (!num) return '0';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };


  const isPending = residid.status === 'Pending';
  const isEditable = isPending && userDetails?.designation !== 'Sales Head';
  const isDisabled = !isPending || userDetails?.designation === 'Sales Head';


  const renderDropdownField = (
    label,
    data,
    value,
    onChange,
    placeholder = '',
    disabled = false,
    enableSearch = true // ✅ new param to toggle search
  ) => {
    const fieldDisabled = disabled || !isEditable; // disable if not pending or forced

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {label}
          <Text style={styles.required}>*</Text>
        </Text>

        <Dropdown
          data={data}
          labelField="label"
          valueField="value"
          value={value}
          onChange={onChange}
          style={[
            styles.dropdown,
            fieldDisabled && { backgroundColor: '#f0f0f0' }, // grey out if disabled
          ]}
          placeholder={placeholder || `${label}`}
          placeholderStyle={{ color: '#888' }}
          selectedTextStyle={{ color: 'black' }}
          disabled={fieldDisabled}

          // ✅ Search functionality
          search={enableSearch}
          searchPlaceholder="Search..."
          searchTextInputStyle={{ color: 'black' }}

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


  const handleNoOfAttemptChange = useCallback((text) => {
    setNoOfAttemp(text.replace(/[^0-9]/g, ''));
  }, []);

  const renderTextField = (label, value, onChange, editable = true, placeholder = '',
    keyboardType = 'default', required = true) => {
    const fieldEditable = editable && isEditable;
    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, !fieldEditable && styles.disabledInput]}
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

  const formConfig = [

    {
      title: 'Applicant Details',
      // useRows: true,
      fields: [
        {
          type: 'dropdown',
          label: 'Applicant Type',
          options: applicantTypess?.length
            ? applicantTypess
            : (applicantTypes || []).map(a => ({ label: a.type, value: a.id })),
          selectedValue: selectedApplicantType,
          onChange: handleSelectionChange,
          placeholder: 'Applicant Type',
          disabled: !isEditable,
          enableSearch: false,
        },
        { label: 'Applicant Name', value: fullName || '', editable: false, placeholder: 'Applicant Name' },
      ],
    },
    {
      title: 'Residence Verification',
      useRows: true,
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
          { label: 'Field Agent Name', value: typeOfConstruction, onChange: setTypeOfConstruction, editable: isEditable, placeholder: 'Enter Agent Name', required: true },
        ] : []),
        { label: 'No of Attempt', value: noOfAttemp?.toString(), onChange: text => setNoOfAttemp(text.replace(/[^0-9]/g, '')), editable: isEditable, keyboardType: 'numeric', placeholder: 'No of Attempt', required: true },
        {
          type: 'date',
          label: 'Date of Visit',
          value: dateOfVisit,
          onChange: handleConfirm,
          showPicker: showDatePicker,
          hidePicker: hideDatePicker,
          pickerVisible: isDatePickerVisible,
          maxDate: BusinessDate.businnessDate?.length === 3
            ? new Date(BusinessDate.businnessDate[0], BusinessDate.businnessDate[1] - 1, BusinessDate.businnessDate[2])
            : new Date(),
        },
      ],
    },
    {
      title: 'Residence Details',
      useRows: true,
      fields: [
        { type: 'dropdown', label: 'Type of Accommodation', options: Accomodation, selectedValue: selectedaccomodation, onChange: handleAccomodation, disabled: !isEditable },
        { label: 'No of Years in House', value: noOfYearInHouse?.toString(), onChange: setNoOfYearInHouse, editable: isEditable, keyboardType: 'numeric', placeholder: 'Enter Number of year', required: true },
        { type: 'dropdown', label: 'Ownership', options: ownershipa, selectedValue: selectedownership, onChange: handleOwnership, disabled: !isEditable },
        { label: 'Locality', value: locality, onChange: setLocality, editable: isEditable, placeholder: 'Enter Locality', required: true },

        { label: 'House Hold Terms', value: houseHoldTerms, onChange: setHouseHoldTerms, editable: isEditable, placeholder: 'House Hold terms', required: false, multiline: true },
      ],
    },
    {
      title: 'Residence Address',
      useRows: true,
      fields: [
        { label: 'Address 1', value: address1, onChange: setAddress1, editable: isEditable, placeholder: 'Enter Address 1', multiline: true },
        { label: 'Address 2', value: address2, onChange: setAddress2, editable: isEditable, placeholder: 'Enter Address 2', multiline: true },
        { label: 'Address 3', value: address3, onChange: setAddress3, editable: isEditable, placeholder: 'Enter Address 3 (optional)', required: false },
        { label: 'Land Mark', value: landMark, onChange: setlandMark, editable: isEditable, placeholder: 'Enter nearby landmark' },

        { type: 'dropdown', label: 'Pincode', options: pincodeData || [], selectedValue: selectedPincode, onChange: handlePincodee, disabled: !isEditable },
        { label: 'City', value: CityName, editable: false, placeholder: 'city' },
        { label: 'State', value: stateName, editable: false, placeholder: 'state' },
        { label: 'Country', value: countryName, editable: false, placeholder: 'country' },
      ],
    },
    {
      title: 'Person Contacted',
      useRows: true,
      fields: [
        { label: 'Full Name', value: fullNamew, onChange: setfullNamew, editable: isEditable, placeholder: 'Enter Full Name', required: true },
        { type: 'dropdown', label: 'Relation With Applicant', options: relationwithother || [], selectedValue: selctedrelationwithothers, onChange: handlerelationwithother, disabled: !isEditable },
        { label: 'No of Family Members', value: noOfFamily?.toString(), onChange: text => setNoOfFamily(text.replace(/[^0-9]/g, '')), editable: isEditable, keyboardType: 'numeric', placeholder: 'Enter No of Family Member', required: true },
        { label: 'Others', value: others, onChange: setOthers, editable: isEditable, conditional: isOtherSelected, placeholder: 'Enter Relation Name', required: true },

      ],
    },
    {
      title: 'Application Verification',
      useRows: true,
      fields: [
        { type: 'dropdown', label: 'Verification Result', options: VerifierComment || [], selectedValue: selectedverifiercomment, onChange: handleverifiercommented, disabled: !isEditable, enableSearch: false, },
        { label: 'Verifier Comments', value: Comments, onChange: setComments, editable: isEditable, placeholder: 'Enter Comment', required: true, multiline: true },
        { type: 'upload', label: 'Document Upload', documentNames: documentUploadName, handleSelect: handleDocumentSelection, handleDownload: handleDownloadCibilFile, handleCamera: handleTakePhoto, disabled: isDisabled }
      ],
    },
  ];

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
        {formConfig.map((section, sIndex) => (
          <VerificationSection key={sIndex} title={section.title}>
            {section.useRows
              ? renderRows(
                section.fields
                  .filter(field => field.conditional !== false) // Skip hidden fields
                  .map((field, fIndex) => {
                    switch (field.type) {
                      case 'dropdown':
                        return (
                          <RenderDropdownField
                            key={`${sIndex}-${fIndex}`}
                            label={field.label}
                            data={field.options}
                            value={field.selectedValue}
                            onChange={field.onChange}
                            placeholder={field.placeholder || ''}
                            isEditable={!field.disabled && isEditable}
                            enableSearch={field.enableSearch ?? true}
                          />
                        );

                      case 'date':
                        return (
                          <View key={`${sIndex}-${fIndex}`} style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>
                              {field.label}
                              <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity onPress={field.showPicker} style={styles.dateButton}>
                              <Text style={styles.dateText}>{field.value || 'Select Date'}</Text>
                              <Image
                                source={require('../../asset/calendar.png')}
                                style={styles.dateIcon}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
                            <DateTimePickerModal
                              isVisible={field.pickerVisible}
                              mode="date"
                              maximumDate={field.maxDate}
                              onConfirm={field.onChange}
                              onCancel={field.hidePicker}
                            />
                          </View>
                        );

                      case 'upload':
                        return (
                          <View key={`${sIndex}-${fIndex}`} style={styles.uploadSection}>
                            <View style={styles.uploadColumn}>
                              <Text style={styles.label}>{field.label}</Text>
                              <TouchableOpacity
                                style={[styles.documentButton, field.disabled && { backgroundColor: '#ccc' }]}
                                onPress={field.handleSelect}
                                disabled={field.disabled}
                              >
                                <Image
                                  source={require('../../asset/upload.png')}
                                  style={[styles.iconStyle, field.disabled && { tintColor: '#888' }]}
                                />
                                <Text style={styles.buttonText}>Select Document</Text>
                              </TouchableOpacity>

                              <View style={styles.fileList}>
                                {(field.documentNames?.length > 0
                                  ? field.documentNames
                                  : ['No file selected']
                                ).map((name, index) => (
                                  <Text key={index} style={styles.fileNameText} numberOfLines={1}>
                                    {name}
                                  </Text>
                                ))}
                              </View>
                            </View>

                            <View style={styles.actionColumn}>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() =>
                                  field.handleDownload &&
                                  field.handleDownload(field.documentUpload, field.documentNames)
                                }
                              >
                                <Image
                                  source={require('../../asset/download.png')}
                                  style={[styles.actionIcon, { tintColor: '#fff' }]}
                                />
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.actionButton, field.disabled && { backgroundColor: '#ccc' }]}
                                onPress={field.handleCamera}
                                disabled={field.disabled}
                              >
                                <Image
                                  source={require('../../asset/camera.png')}
                                  style={[styles.actionIcon, field.disabled && { tintColor: '#888' }]}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );

                      default:
                        return (
                          <RenderTextField
                            key={`${sIndex}-${fIndex}`}
                            label={field.label}
                            value={field.value}
                            onChange={field.onChange}
                            editable={field.editable ?? true}
                            placeholder={field.placeholder || ''}
                            numeric={field.keyboardType === 'numeric'}
                            isEditable={isEditable}
                            maxLength={field.maxLength}
                            required={field.required ?? false}
                            multiline={field.multiline ?? false}
                          />
                        );
                    }
                  }),
                2, // columns
                10 // spacing
              )
              : section.fields
                .filter(field => field.conditional !== false)
                .map((field, fIndex) => {
                  switch (field.type) {
                    case 'dropdown':
                      return (
                        <RenderDropdownField
                          key={`${sIndex}-${fIndex}`}
                          label={field.label}
                          data={field.options}
                          value={field.selectedValue}
                          onChange={field.onChange}
                          placeholder={field.placeholder || ''}
                          isEditable={!field.disabled && isEditable}
                          enableSearch={field.enableSearch ?? true}
                        />
                      );

                    case 'upload':
                      return (
                        <View key={`${sIndex}-${fIndex}`} style={styles.uploadSection}>
                          <Text style={styles.label}>{field.label}</Text>
                          <TouchableOpacity
                            style={[styles.documentButton, field.disabled && { backgroundColor: '#ccc' }]}
                            onPress={field.handleSelect}
                            disabled={field.disabled}
                          >
                            <Image
                              source={require('../../asset/upload.png')}
                              style={[styles.iconStyle, field.disabled && { tintColor: '#888' }]}
                            />
                            <Text style={styles.buttonText}>Select Document</Text>
                          </TouchableOpacity>

                          <View style={styles.fileList}>
                            {(field.documentNames?.length > 0
                              ? field.documentNames
                              : ['No file selected']
                            ).map((name, index) => (
                              <Text key={index} style={styles.fileNameText} numberOfLines={1}>
                                {name}
                              </Text>
                            ))}
                          </View>
                        </View>
                      );

                    default:
                      return (
                        <RenderTextField
                          key={`${sIndex}-${fIndex}`}
                          label={field.label}
                          value={field.value}
                          onChange={field.onChange}
                          editable={field.editable ?? true}
                          placeholder={field.placeholder || ''}
                          numeric={field.keyboardType === 'numeric'}
                          isEditable={isEditable}
                          maxLength={field.maxLength}
                          required={field.required ?? false}
                          multiline={field.multiline ?? false}
                        />
                      );
                  }
                })}
          </VerificationSection>
        ))}



        {/* Buttons */}
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

export default ResidenceVerificationProcess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  header: {
    height: 60,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 0,
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
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: 'black',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: '#e9ecef',
    color: 'black',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFFBB',
    marginBottom: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#DDDBDBFF", // gray background when disabled
    color: "black",
    fontWeight: '500'
  },
  disabledDropdown: {
    backgroundColor: "#DDDBDBFF", // gray background when disabled
  },
  placeholderStyle: {
    color: '#888',
  },
  dropdownItem: {
    padding: 10,
    backgroundColor: '#fff',
  },

  dropdownItemText: {
    color: '#000',
  },

  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
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
  button: {
    // Your button style here
    flexDirection: 'row', // Align TextInput and Image horizontally
    alignItems: 'center', // Center the items vertically
    borderWidth: 1,
    borderColor: '#ccc'
  },
  required: {
    color: 'red', // Asterisk color to indicate mandatory
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
  fileNameText: {
    flexWrap: 'wrap', // Allow text wrapping
    // marginLeft: 10,
    fontSize: 14,
    color: '#888', // Set text color (or use your theme)
    alignItems: 'flex-start'
  },

  downloadbutton: {
    backgroundColor: '#007bff', // Button background color
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    // marginLeft: 10,
    height: height * 0.04,// Adds space between buttons
    marginHorizontal: 10
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
});
