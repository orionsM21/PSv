// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const RCUProcess = () => {
//   return (
//     <View>
//       <Text>RCUProcess</Text>
//     </View>
//   )
// }

// export default RCUProcess

// const styles = StyleSheet.create({})



import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Button, ActivityIndicator, Alert, Image, Platform, PermissionsAndroid, ToastAndroid, Modal, FlatList,
    SafeAreaView
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import FormData from 'form-data';
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PushNotification from 'react-native-push-notification';
// import { launchCamera } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer';
import ApplicationDetails from '../Component/ApplicantDetailsComponent';
import { RenderDropdownField, RenderTextField } from '../Component/ResponsiveFormFields';
import DetailHeader from '../Component/DetailHeader';

const { width, height } = Dimensions.get('window');

// ===== Reusable Components =====
export const FormField = ({
    label,
    required,
    editable,
    value,
    onChange,
    data,
    placeholder,
    hideRequired = false,
}) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>
            {label} {required && !hideRequired && <Text style={styles.required}>*</Text>}
        </Text>
        {editable ? (
            data ? (
                <Dropdown
                    data={data}
                    labelField="label"
                    valueField="value"
                    value={value}
                    onChange={onChange}
                    style={[styles.dropdown, !editable && styles.disabledDropdown]}
                    placeholder={placeholder || `Select ${label}`}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={{ color: 'black' }}
                    renderItem={(item) => (
                        <View style={styles.dropdownItem}>
                            <Text style={styles.dropdownItemText}>{item.label}</Text>
                        </View>
                    )}
                />
            ) : (
                <TextInput
                    style={[styles.input, !editable && styles.disabledInput]}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor="#888"
                />
            )
        ) : (
            <TextInput
                style={[styles.input, styles.disabledInput]}
                value={typeof value === 'object' ? value?.label : value || ''}
                editable={false}
                placeholder={placeholder}
                placeholderTextColor="#888"
            />
        )}
    </View>
);

export const VerificationSection = ({ title, children, style }) => (
    <View style={[styles.sectionWrapper, style]}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

export const ActionButton = ({ onPress, disabled, style, children }) => (
    <TouchableOpacity style={[style, disabled && { backgroundColor: '#ccc' }]} onPress={onPress} disabled={disabled}>
        {children}
    </TouchableOpacity>
);

export const LoadingButton = ({ loading, onPress, title, style }) =>
    loading ? <ActivityIndicator size="large" color="#4CAF50" /> : (
        <ActionButton onPress={onPress} style={style}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{title}</Text>
        </ActionButton>
    );


const RCUProcess = ({ route }) => {
    const { item } = route.params;
    const { applicationNumber } = route.params;

    // const [conscernissue, setConscernissue] = useState('');
    const token = useSelector((state) => state.auth.token);
    const userDetails = useSelector((state) => state.auth.losuserDetails);
    // const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const applicant = item.applicant[0]?.individualApplicant;
    const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
    const [applicationByid, setApplicationByid] = useState(null);
    const [selectedApplicantType, setSelectedApplicantType] = useState('');
    const [ApplicantArray, setApplicantArray] = useState([]); // To store
    const salariedApplicants = ApplicantArray.filter(
        applicant => applicant.individualApplicant,
    );

    const [convertedFilePath, setConvertedFilePath] = useState(null);
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

    const [InitiateRCU, setInitiateRCU] = useState([]);
    const [getresidePincode, setresidePincode] = useState([]);


    const [Pincodes, setPincodes] = useState([]);
    const [selectedPincode, setSelectedPincode] = useState(null);
    const [selectedPincodeId, setSelectedPincodeId] = useState(null); // Track pincodeId

    const [relationwithothers, setrelationwithother] = useState([]);
    const [selctedrelationwithothers, setselctedrelationWithOtherStates] =
        useState(null);

    const [ownership, setownership] = useState([]);
    const [selectedownership, setselectedownership] = useState(null);

    const [accomodationm, setaccomodation] = useState([]);
    const [selectedaccomodation, setselectedaccomodation] = useState(null);

    const [verificationagency, setverificationagency] = useState([]);
    const [selectedverificationagency, setselectedverificationagency] = useState(null);

    const [verificationagencyType, setverificationagencyType] = useState([]);
    const [selectedverificationagencyType, setselectedverificationagencyType] = useState(null);
    const [backupagecytype, setbackupagecytype] = useState([]);



    const [verificationAgenct, setverificationAgenct] = useState([]);
    const [selectedverificationAgenct, setselectedverificationAgenct] =
        useState(null);

    const [agencyid, setagencyid] = useState('')
    const [agentid, setagentid] = useState('');



    // 


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
    const [BusinessDate, setBusinessDate] = useState([]);
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


    // const handleConfirm = (date) => {
    //     // Ensure the date is formatted correctly

    //     const formattedDate = moment(date).format('DD-MM-YYYY');
    //     
    //     setdateOfVisit(formattedDate); // Update state with selected date
    //     hideDatePicker(); // Close the DatePicker
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




    const [payloadd, setpayload] = useState([]);




    const coApplicantCountMap = {};
    const guarantorCountMap = {};

    const applicantTypess = applicantTypes.map(({ type, id }) => {
        if (type === "Co-Applicant") {
            coApplicantCountMap[type] = (coApplicantCountMap[type] || 0) + 1;
            return { label: `Co-Applicant ${coApplicantCountMap[type]}`, value: id };
        } else if (type === "Guarantor") {
            guarantorCountMap[type] = (guarantorCountMap[type] || 0) + 1;
            return { label: `Guarantor ${guarantorCountMap[type]}`, value: id };
        } else {
            return { label: type, value: id }; // Ensure id is used as value
        }
    });


    const [conscernissue, setConscernissue] = useState('');
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    // Show time picker
    const showTimePicker = () => {
        setTimePickerVisible(true);
    };

    // Hide time picker
    const hideTimePicker = () => {
        setTimePickerVisible(false);
    };

    // Handle the time selected
    const handleConfirmtime = (time) => {
        const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setConscernissue(formattedTime); // Set the time in your state
        hideTimePicker(); // Close the picker
    };
    const [caseId, setCaseId] = useState('');
    const [name, setName] = useState('');
    const [residentialAddress, setResidentialAddress] = useState('');
    const [mobile, setMobile] = useState('');
    const handleMobileChange = (text) => {
        // Allow only numeric input, restrict to 10 digits, and prevent all zeroes
        if (/^\d{0,10}$/.test(text) && text !== "0000000000") {
            setMobile(text); // Set the value if it matches the condition
        }
    };

    const [client, setClient] = useState('');
    const [clientBranch, setClientBranch] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [product, setProduct] = useState('');
    const [subStatus, setSubStatus] = useState('');
    const [tatMet, setTatMet] = useState(null);


    const options = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
    ];
    const [residenceProfile, setResidenceProfile] = useState('');
    const [officeProfile, setOfficeProfile] = useState('');
    const [physicalItr, setPhysicalItr] = useState('');
    const [bankStatement, setBankStatement] = useState('');
    const [additionalRemark, setAdditionalRemark] = useState('');
    const [file, setFile] = useState('');
    const [fileName, setFileName] = useState('');
    const [photoFile, setPhotoFile] = useState(null);  // For storing the photo
    const [photoFileName, setPhotoFileName] = useState('');  // For storing the photo
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);


    const convertTimestampToDate = timestamp => {
        const date = new Date(parseInt(timestamp)); // Create a Date object from the timestamp
        return date.toLocaleString(); // Convert to a readable date string
    };
    const readableDate = convertTimestampToDate(dateOfVisit);
    const [residid, setresidid] = useState([]);
    const [backwhereStarted, setbackwhereStarted] = useState([]);
    const [logDetails, setLogDetails] = useState([]);
    const [documentUpload, setDocumentUpload] = useState(null);
    const [documentUploadName, setDocumentUploadName] = useState(null);
    const [modalVisibleCutsomnameChange, setModalVisibleCutsomnameChange] = useState(false);

    const [savedStatus, setSavedStatus] = useState({
        applicant: false,
        coApplicant: false,
        guarantor: false,
    });

    // 
    useEffect(() => {
        getApplicationByid();
        getAllPincode();
        getAllAgencyType();
        getBusinessDate();
        // getAllAgency();
        // getByTypelookupTypeReleationWithApplicant();
        // getByTypelookupTypeOwnership();
        // getByTypelookupTypeTypeofAccommodation();
        getLogsDetailsByApplicationNumber();
    }, []);

    useEffect(() => {
        if (applicantidApplicant) {
            getBusinessDate();
            getInitiateRCUVerificationByApplicantId();
            getRiskContainmentUnitByApplicantIdd();
            // getPersonalDiscussionByid();
            getApplicationById();
            setCaseId('');
            setName('');
            setResidentialAddress('');
            setMobile('');
            setClient('');
            setClientBranch('');
            setdateOfVisit('');
            setConscernissue('');
            setCompanyName('');
            setProduct('');
            setSubStatus('');
            setTatMet('');
            setResidenceProfile('');
            setOfficeProfile('');
            setPhysicalItr('');
            setBankStatement('');
            setAdditionalRemark('');
            setDocumentUpload(null); // Assuming you want to reset the file/document
            setDocumentUploadName(''); // Reset document name to an empty string
            setFileName('');
            setFile('');
            setDocumentUpload('');
            setDocumentUploadName(''); //
            setselectedverificationagency('');
            setselectedverificationAgenct('');
            setselectedverificationagencyType('');
            setverificationagencyType([]);
            setverificationAgenct([]);
            setverificationagency([]);
            setPhotoFile('');
            setPhotoFileName('');
            getAllAgencyType();
            // setverificationAgenct([]);
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

    useFocusEffect(
        React.useCallback(() => {
            getLogsDetailsByApplicationNumber();

        }, []) // Empty dependency array to ensure this runs every time the screen is focused
    );

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
                (log) => log?.description === "Risk Containment Unit"
            );

            const residenceVerificationsInitiateverification = data.filter(
                (log) => log?.description === "InitiateVerification"
            );

            if (residenceVerificationsInitiateverification.length === 1) {
                // Only one object, handle as before
                setbackwhereStarted(residenceVerificationsInitiateverification[0]);
            } else if (residenceVerificationsInitiateverification.length > 1) {
                // Multiple objects, check their status
                const pendingVerification = residenceVerificationsInitiateverification.find(
                    (log) => log?.status === "Pending"
                );

                if (pendingVerification) {
                    setbackwhereStarted(pendingVerification);
                } else {
                    // If no pending status found, pick the first one
                    setbackwhereStarted(residenceVerificationsInitiateverification[0]);
                }
            } else {
                console.warn("Residence Verification object not found");
            }


            // setbackwhereStarted(residenceVerificationsInitiateverification)

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



    useEffect(() => {
        if (InitiateRCU) {

            setselectedverificationagencyType(InitiateRCU?.[0]?.verificationAgencyType)
            setselectedverificationagency(InitiateRCU?.[0]?.verificationAgencyName)
            setselectedverificationAgenct(InitiateRCU?.[0]?.verificationAgentName)

            setagencyid(InitiateRCU?.[0]?.verificationAgency)
            setagentid(InitiateRCU?.[0]?.verificationAgent)
        }
    }, [InitiateRCU])


    const getInitiateRCUVerificationByApplicantId = async () => {
        if (!applicantidApplicant) {
            console.error('Applicant ID is missing');
            return; // Exit early if applicantidIndividualApplicant is undefined
        }
        try {
            const response = await axios.get(
                `${BASE_URL}getInitiateRCUVerificationByApplicantId/${applicantidApplicant}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            const data = response.data.data;
            setInitiateRCU(data);
        } catch (error) {
            console.error(
                'Error fetching getRiskContainmentUnitByApplicantId:',
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

    const getRiskContainmentUnitByApplicantId = async (userid) => {
        // if (!applicantidApplicant) {
        //     console.error('Applicant ID is missing');
        //     return; // Exit early if applicantidIndividualApplicant is undefined
        // }
        try {
            const response = await axios.get(
                `${BASE_URL}getRiskContainmentUnitByApplicantId/${userid}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            const data = response.data.data;
            setgetInitiateVerificationByApplicantidd(data);
        } catch (error) {
            console.error(
                'Error fetching getRiskContainmentUnitByApplicantId:',
                error,
            );
        }
    };
    const getRiskContainmentUnitByApplicantIdd = async () => {
        // if (!applicantidApplicant) {
        //     console.error('Applicant ID is missing');
        //     return; // Exit early if applicantidIndividualApplicant is undefined
        // }
        try {
            const response = await axios.get(
                `${BASE_URL}getRiskContainmentUnitByApplicantId/${applicantidApplicant}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            const data = response.data.data;
            setgetInitiateVerificationByApplicantidd(data);
        } catch (error) {
            console.error(
                'Error fetching getRiskContainmentUnitByApplicantId:',
                error,
            );
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

        // Find applicant (Individual or Organization)
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

        // Fetch Risk Containment Unit data
        await getRiskContainmentUnitByApplicantId(userid);

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





    const downloadFile = async () => {
        if (!convertedFilePath) {
            Alert.alert('Error', 'No file to download.');
            return;
        }

        try {
            // Request permission for Android 9 and below
            if (Platform.OS === 'android' && Platform.Version < 29) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to download files.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Cannot download the file without permission.');
                    return;
                }
            }

            // Define the path to the Documents folder
            const fileName = convertedFilePath.split('/').pop(); // Extract the original file name
            const documentsPath = Platform.OS === 'android'
                ? `${RNFS.DownloadDirectoryPath}/${fileName}` // Use Download directory for Android
                : `${RNFS.DocumentDirectoryPath}/${fileName}`; // Use Document directory for iOS

            // Copy the file to the target path
            await RNFS.copyFile(convertedFilePath, documentsPath);

            // Show a success toast
            Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Download Complete!',
                text2: `File saved to: ${documentsPath}`,
                visibilityTime: 3000,
            });

            // Push notification to inform the user
            PushNotification.localNotification({
                channelId: 'download-channel',
                title: 'File Downloaded',
                message: `The file has been downloaded and saved at: ${documentsPath}`,
                smallIcon: 'go_fin', // Icon that appears in the notification bar
                largeIcon: 'go_fin', // Large icon for the notification (usually your app's logo)
                // Optional properties for a more customized notification
                bigText: `The file has been downloaded and saved at: ${documentsPath}`,  // Additional description
                priority: 'high',  // Makes the notification high priority
            });
            Alert.alert('Success', `File successfully saved at: \n${documentsPath}`, [{ text: 'OK' }]);


        } catch (error) {
            console.error('Error during file download:', error);
            Alert.alert('Error', 'Failed to download file.');
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



    const getAllAgency = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllAgency`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            });

            const data = response.data.data.content;

            if (Array.isArray(data)) {
                // Filter agencies where agencyType.agencyTypeName matches the selected type
                const selectedAgencyTypeName = backupagecytype?.label?.trim();

                const filteredAgencies = data.filter(
                    (agency) => agency.agencyType?.agencyTypeName.trim() === selectedAgencyTypeName
                );

                const mergedData = filteredAgencies.map((agency) => ({
                    label: agency.agencyName, // Display agency name
                    value: agency.agencyMasterId, // Unique identifier
                }));

                // 
                setverificationagency(mergedData); // Update the dropdown with filtered data
            } else {
                console.error('Expected an array in the response, but got:', response.data);
            }
        } catch (error) {
            console.error('Error fetching getAllAgency data:', error.message || error);
        }
    };



    const getAllAgencyType = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllAgencyType`,
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
                        label: `${agency.agencyTypeName} `, // Merge firstName and lastName
                        value: agency.agencyTypeId, // Assuming agencyMasterId is the unique identifier
                    };
                });


                // Update the dropdown data
                setverificationagencyType(mergedData); // Update the dropdown with merged names
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
                //     Alert.alert(
                //         'File Size Exceeded',
                //         `The file "${file.name}" exceeds 1MB and was not selected.`
                //     );
                //     continue; // Skip files exceeding the limit
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




    const createResidenceverification = async () => {
        // Format the date
        const formattedDate = rawDateOfVisit
            ? moment(rawDateOfVisit).format('YYYY-MM-DD')
            : moment(dateOfVisit, 'DD-MM-YYYY').format('YYYY-MM-DD');

        const dto = {
            riskContainmentUnitId: payloadd?.riskContainmentUnitId || '',
            caseId: caseId,
            name: name,
            residentialAddress: residentialAddress,
            mobile: mobile,
            client: client,
            clientBranch: clientBranch,
            dateOfReport: formattedDate || '',
            timeOfReport: conscernissue,
            companyName: companyName,
            product: product,
            subStatus: subStatus,
            tatMet: tatMet?.label,
            officeProfile: officeProfile,
            residenceProfile: residenceProfile,
            physicalITR: physicalItr,
            bankStatement: bankStatement,
            finalRemarks: additionalRemark,
            applicationNo: item?.applicationNo,
            applicationId: item.id,
            applicantId: applicantidApplicant,
            verificationAgency: agencyid,
            verificationAgent: agentid,
            verificationAgencyType: selectedverificationagencyType,
        };


        // Log the photoFile object to check its structure

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
        // ✅ Handling Camera Photo File (Single File)
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
                const documentUploadFileName = Array.isArray(documentUploadName) && documentUploadName.length > index
                    ? documentUploadName[index]
                    : `document_${index + 1}.pdf`;

                if (base64Data) {
                    filesArray.push({
                        name: documentUpload.length === 1 ? 'file' : `file`, // Correct naming
                        filename: documentUploadFileName,
                        type: 'application/pdf',
                        data: base64Data
                    });
                }
            });
        }

        // If no files, photo, or document is provided, show an alert and return
        // if (filesArray.length === 0) {
        //     Alert.alert('Error', 'No file, photo, or document provided. Please select a file.');
        //     setLoading(false);
        //     return;
        // }
        try {
            const response = await RNFetchBlob.fetch(
                'POST',
                `${BASE_URL}addRiskContainmentUnit`,
                {
                    'Content-Type': 'multipart/form-data',
                    Authorization: 'Bearer ' + token,
                },
                [
                    ...filesArray,
                    { name: 'dto', data: JSON.stringify(dto) },  // Ensure 'dto' is stringified here
                ]
            );

            const responseData = await response.json(); // Ensure the response is parsed as JSON


            if (responseData?.msgKey === 'Success') {
                // getRiskContainmentUnitByApplicantId();
                setLoading(false); // Show loader
            } else {
                Alert.alert('Error', responseData.message || 'Failed to upload the file.');
                setLoading(false); // Show loader
            }

            return response.data;
        } catch (error) {
            console.error('Error in addRiskContainmentUnit:', error.message || error);
            Alert.alert('Error', 'Failed to add residence verification.');
            setLoading(false); // Show loader
        }
    };






    useEffect(() => {
        if (getInitiateVerificationByApplicantidd) {
            const verificationData = getInitiateVerificationByApplicantidd[0]; // Accessing the first object, adjust if necessary

            if (!verificationData) {
                // getAllAgencyType();
                return; //
            }

            const agenctNameId = verificationData?.verificationAgent;
            const agentName = verificationData?.verificationAgentName;
            const agencynameId = verificationData?.verificationAgency;
            const agencyTypeName = verificationData?.verificationAgencyType
            const agencyName = verificationData?.verificationAgencyName;
            setpayload(verificationData);

            setCaseId(verificationData?.caseId || '');
            setName(verificationData?.name || '');
            setResidentialAddress(verificationData?.residentialAddress || '');
            setMobile(verificationData?.mobile || '');
            setClient(verificationData?.client || '');
            setClientBranch(verificationData?.clientBranch || '');
            setdateOfVisit(verificationData?.dateOfReport || '');
            setConscernissue(verificationData?.timeOfReport || '');
            setCompanyName(verificationData?.companyName || '');
            setProduct(verificationData?.product || '');
            setSubStatus(verificationData?.subStatus || '');
            setTatMet(verificationData?.tatMet || '');
            setResidenceProfile(verificationData?.residenceProfile || '');
            setOfficeProfile(verificationData?.officeProfile || '');
            setPhysicalItr(verificationData?.physicalITR || '');
            setBankStatement(verificationData?.bankStatement || '');
            setAdditionalRemark(verificationData?.finalRemarks || '');
            if (verificationData?.documentUpload) {
                setDocumentUpload(Array.isArray(verificationData?.documentUpload) ? verificationData?.documentUpload : [verificationData?.documentUpload]);
            } else {
                setDocumentUpload([]); // Ensure it resets if no data is available
            }
            if (verificationData?.documentUploadName) {
                setDocumentUploadName(Array.isArray(verificationData.documentUploadName) ? verificationData.documentUploadName : [verificationData.documentUploadName]);
            } else {
                setDocumentUploadName([]); // Ensure it resets if no data is available
            }
            // setFileName(verificationData?.documentUploadName);
            setselectedverificationagencyType(agencyTypeName);
            // setselectedverificationagency(agencynameId);
            // setselectedverificationAgenct(agenctNameId);

            setverificationAgenct([
                { label: agentName, value: agenctNameId }, // Populate with data as needed
            ]);
            setverificationagency([
                { label: agencyName, value: agencynameId }, // Populate with data as needed
            ]);
            setverificationagencyType([
                { label: agencyTypeName, value: agencyTypeName }, // Populate with data as needed
            ]);
        }
    }, [getInitiateVerificationByApplicantidd]);





    // useEffect(() => {
    //     // Set file if updateCollateral has file data
    //     if (documentUpload, documentUploadName) {
    //         const binaryData = documentUpload;
    //         const filename = documentUploadName || 'default_filename';
    //         handleFileConversiona(binaryData, filename);
    //     }
    // }, [documentUpload, documentUploadName]);



    const validateFields = () => {
        const errors = {};
        const missingFields = [];
        // Applicant Name Validation
        // if (!selectedApplicantType) {
        //     // errors.selectedApplicantType = 'Please select an Applicant Type.';
        //     missingFields.push('Please select an Applicant Type.');
        // }

        // // Full Name Validation
        // if (!fullName.trim()) {
        //     // errors.fullName = 'Full Name cannot be empty.';
        //     missingFields.push('Full Name cannot be empty.');
        // }

        // if (!selectedverificationagencyType) {
        //     missingFields.push('Verification Agency Type cannot be empty');
        // }

        // if (!payloadd?.verificationAgencyName && !InitiateRCU?.[0]?.verificationAgencyName) {
        //     missingFields.push('Verification Agency cannot be empty');
        // }

        // if (!payloadd?.verificationAgentName && !InitiateRCU?.[0]?.verificationAgentName) {
        //     missingFields.push('Verification Agent cannot be empty');
        // }


        // if (!caseId) {
        //     missingFields.push('Please enter a CaseID.');
        // }

        // if (!name) {
        //     missingFields.push('Please enter a Address.');
        // }

        // if (!residentialAddress) {
        //     missingFields.push('Please enter a Residential Address.');
        // }

        // Date of Visit Validation
        // if (!mobile) {
        //     missingFields.push('Please select a Mobile Number.');
        // }

        // if (!mobile) {
        //     missingFields.push('Mobile Number cannot be empty.');
        // } else if (mobile.length < 10) {
        //     missingFields.push('Mobile Number must be at least 10 digits long.');
        // }

        // Accommodation Validation
        // if (!client) {
        //     missingFields.push('OfficeName cannot be empty');
        // }

        // // Ownership Validation
        // if (!clientBranch) {
        //     missingFields.push('Please Enter a Branch Name.');
        // }

        // if (!dateOfVisit) {
        //     missingFields.push('Date cannot be empty');
        // }

        // if (!conscernissue) {
        //     missingFields.push('Time cannot be empty');
        // }

        // if (!companyName.trim()) {
        //     missingFields.push('Please Enter a Company Name.');
        // }

        // // Type of Construction Validation
        // if (!product.trim()) {
        //     missingFields.push('Please Enter a Product.');
        // }

        // // Area in SQ-FT Validation
        // if (!subStatus) {
        //     missingFields.push('Sub Status cannot be empty.');
        // }

        // // No of Years in House Validation
        // if (!tatMet) {
        //     missingFields.push('TAT Met cannot be empty.');
        // }

        // if (!residenceProfile) {
        //     missingFields.push(' residenceProfile Cannot be empty.');
        // }

        // if (!officeProfile) {
        //     missingFields.push('officeProfile cannot be Empty ');
        // }

        // if (!physicalItr) {
        //     missingFields.push('physicalItr cannot be empty.');
        // }

        // if (!bankStatement) {
        //     missingFields.push('bankStatement cannot be empty.');
        // }
        // if (!additionalRemark) {
        //     missingFields.push('additionalRemark cannot be empty.');
        // }


        if (!file && !documentUpload && !photoFile) {
            missingFields.push('Please click or upload a photo or File!!');
        }
        if (!documentUploadName && !photoFileName) {
            missingFields.push('FileName  cannot be empty.');
        }


        return missingFields.length ? missingFields : true;
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

            const currentIndex = applicantTypes.findIndex(applicant => applicant.id === selectedApplicantType);
            const nextIndex = (currentIndex + 1) % applicantTypes.length;
            const nextType = applicantTypes[nextIndex]; // Get the next object

            setSavedStatus(prev => ({ ...prev, [selectedApplicantType.toString()]: true })); // Store as string ID
            setSelectedApplicantType(nextType.id); // Store only the ID

            handleDropdownChange({ value: nextType.id, label: nextType.type }); // Pass correct format
        }
    };



    // const showSubmitButton = applicantTypes.every(type => savedStatus[type.toLowerCase()]);
    const showSubmitButton = applicantTypes?.every(applicant =>
        savedStatus[applicant?.id?.toString()] // Ensure it checks `id`, not `type`
    );

    const handleSubmit = async () => {
        setLoading(true); // Show loader
        try {
            // Call updateResidenceVerificationFlag and wait for its completion
            updateRiskContainmentUnitFlag();



            // Alert.alert('Success', 'All APIs were executed successfully!');
        } catch (error) {
            console.error('Error in submitting form:', error.message || error);
            Alert.alert('Error', error.message || 'Something went wrong!');
        }
    };

    const updateStageMaintain = async () => {
        try {
            const response = await axios.put(
                `${BASE_URL}updateStageMainTainByApplicationNumber/${residid.applicationNumber}`,
                {
                    applicationNumber: residid.applicationNumber,
                    stage: 'Personal Discussion',
                },
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            // if (response.data.msgKey === 'Success') {
            const msgKey = response?.data?.msgKey;
            const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
            // Alert.alert(msgKey, successMessage);

            await addLogActivity();
            // }

            return response.data;
        } catch (error) {
            console.error('Error in updateStageMaintain:', error.message || error);
        }
    };

    const addLogActivity = async () => {
        try {
            // Define the payload based on the data structure you provided
            const payload = {
                status: "Pending", // Example value, you may want to dynamically set it
                stage: "Pre-Underwriting", // Example value, adjust as needed
                type: residid?.type, // Example value
                user: backwhereStarted?.user, // Example value
                description: "Personal Discussion", // Fixed value in your case
                applicationNumber: residid?.applicationNumber, // Example application number, adjust dynamically if needed
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
                const msgKey = response?.data?.msgKey;
                const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
                // Alert.alert(msgKey, successMessage);
                // alert('Log activity updated successfully!'); // Show success alert
                // await getRiskContainmentUnitByApplicationNumber();
                navigation.replace('Personal Discussion', { item, item });
                setLoading(false); // Hide loader
            }


        } catch (error) {
            console.error("Error updating log activity:", error);
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
                await updateStageMaintain();


            }


        } catch (error) {
            console.error("Error updating log activity:", error);
        }
    };

    const updateRiskContainmentUnitFlag = async () => {

        try {
            // Define the payload based on the data structure you provided
            const payload = {
                active: true,
                applicationNo: residid.applicationNumber, // Example application number, adjust dynamically if needed
            };

            // Make the API call to update the log activity by ID
            const response = await axios.put(
                `${BASE_URL}updateRiskContainmentUnitFlag/${residid.applicationNumber}`,  // Assuming PUT request to update
                payload,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },  // Send the payload as the request body
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
    const documents = InitiateRCU[0]?.initiateVerificationDocumentDto || [];
    const handleDownloadCibilFilee = async (fileDataArray, fileNamesArray) => {
        if (!fileDataArray || fileDataArray.length === 0) {
            Alert.alert('Error', 'No files available for download.');
            return;
        }

        try {
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Storage permission is required to download files.');
                return;
            }

            const dirs = RNFetchBlob.fs.dirs;

            for (let i = 0; i < fileDataArray.length; i++) {
                const fileData = fileDataArray[i];
                const fileName = fileNamesArray[i] || `file_${i}.pdf`;
                const sanitizedFileName = sanitizeFileName(fileName);
                const filePath = `${dirs.DownloadDir}/${sanitizedFileName}`;
                const mimeType = getMimeType(fileName);

                if (fileData.startsWith('http')) {
                    // Download file via URL
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
                    // Save Base64 file
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

            Alert.alert('Success', fileDataArray.length === 1 ? 'File downloaded successfully!' : 'All files downloaded successfully!');
        } catch (error) {
            Alert.alert('Error', 'Something went wrong: ' + error.message);
        }
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

    const handleVerificatinAgencyType = async (item) => {
        setselectedverificationagencyType(item.value);
        setbackupagecytype(item);
    };
    useEffect(() => {
        if (backupagecytype) {
            getAllAgency();
            setverificationAgenct([]);
            setselectedverificationAgenct('');
        }
    }, [backupagecytype]);


    const handleverificationAgent = item => {
        setselectedverificationAgenct(item.value);
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
        //     if (response.didCancel) {
        //         Alert.alert("Camera closed without taking a photo.");
        //         return;
        //     }

        //     if (response.errorCode) {
        //         Alert.alert("Error:", response.errorMessage);

        //         return;
        //     }

        //     if (!response.assets || response.assets.length === 0) {
        //         Alert.alert("Error", "No image was captured.");
        //         return;
        //     }

        //     let filePath = response.assets[0].uri;

        //     // Handle Android `content://` URI
        //     if (filePath.startsWith("content://") && Platform.OS === "android") {
        //         const localPath = `${RNFS.DocumentDirectoryPath}/${response.assets[0].fileName || "photo.jpg"}`;
        //         await RNFS.copyFile(filePath, localPath);
        //         filePath = localPath;

        //     }

        //     // Resize image
        //     const resizedImage = await ImageResizer.createResizedImage(filePath, 800, 600, "JPEG", 80);
        //     let resizedFilePath = resizedImage.uri;

        //     // Check file size
        //     const fileStats = await RNFS.stat(resizedFilePath);
        //     const fileSizeInMB = fileStats.size / (1024 * 1024);


        //     // if (fileSizeInMB > 1) {
        //     //     Alert.alert("File Size Exceeded", "Please select a smaller file.");
        //     //     return;
        //     // }

        //     // Store image temporarily (without a name)
        //     const newPhoto = {
        //         uri: `file://${resizedFilePath}`,
        //         name: "", // Will be updated after user input
        //         type: response.assets[0].type || "image/jpeg",
        //     };

        //     // Add the new image to the list
        //     setPhotoFile((prevPhotos) => (prevPhotos ? [...prevPhotos, newPhoto] : [newPhoto]));


        //     // Open modal to set custom name
        //     setCurrentPhotoIndex(photoFile ? photoFile.length : 0); // Save index of the new photo
        //     setModalVisibleCutsomnameChange(true);
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
    const memoizedApplicantType = useMemo(() => selectedApplicantType, [selectedApplicantType]);
    const memoizedTATOptions = useMemo(() => options, [options]);
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



    const fields = [
        { label: 'Application Number', value: item?.applicationNo || 'N/A' },
        {
            label: 'Name',
            value:
                aaplicantName?.individualApplicant
                    ? `${aaplicantName?.individualApplicant?.firstName || ''} ${aaplicantName?.individualApplicant?.middleName || ''} ${aaplicantName?.individualApplicant?.lastName || ''
                        }`.trim()
                    : aaplicantName?.organizationApplicant?.organizationName || 'N/A',
        },
        {
            label: 'Loan Amount',
            value: item?.loanAmount
                ? `₹ ${formatNumberWithCommas(item.loanAmount.toString())}`
                : '₹ 0',
        },
        { label: 'Source Branch', value: item?.branchName || 'N/A' },
        { label: 'Category', value: item?.applicant?.[0]?.applicantCategoryCode || 'N/A' },
        { label: 'Source Type', value: item?.sourceType || 'N/A' },
        {
            label: 'Date Created',
            value:
                applicationByid?.createdDate
                    ?.toString()
                    ?.replace(/\//g, '-') || 'N/A',
        },
        { label: 'Status', value: item?.status || 'N/A' },
        { label: 'Stage', value: item?.stage || 'N/A' },
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
        <SafeAreaView>
            <ScrollView>
                <View style={styles.container}>

                    {/* <ApplicationDetails
                        title="Application Detail"
                        isEditable={false} // 🔒 read-only or true for editable
                        fields={[
                            { label: 'Application Number', value: item?.applicationNo },
                            {
                                label: 'Name',
                                value: aaplicantName?.individualApplicant
                                    ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName?.individualApplicant?.middleName || ""} ${aaplicantName.individualApplicant.lastName || ""}`.trim()
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
                    {/* --- Applicant Section --- */}
                    <VerificationSection title="Applicant">
                        <RenderDropdownField
                            label="Applicant Type"
                            data={applicantTypess}
                            value={selectedApplicantType}
                            onChange={handleDropdownChange}
                            placeholder="Select Applicant Type"
                            isEditable={true}
                        />
                        <RenderTextField
                            label="Applicant Name"
                            value={fullName}
                            editable={false}
                            placeholder="User Name"
                        />
                    </VerificationSection>

                    {/* --- Report Details Section --- */}
                    <VerificationSection title="Report Details">
                        {renderRows(
                            [
                                { label: 'Case Id', value: caseId, setter: setCaseId, placeholder: 'Enter Case ID' },
                                { label: 'Name', value: name, setter: setName, placeholder: 'Enter Name' },
                                { label: 'Residential Address', value: residentialAddress, setter: setResidentialAddress, placeholder: 'Enter Residential Address', multiline: true, },
                                {
                                    label: 'Mobile', value: mobile, setter: handleMobileChange, placeholder: 'Enter Mobile Number', maxLength: 10,
                                    numeric: true,
                                },
                                { label: 'Company Name', value: companyName, setter: setCompanyName, placeholder: 'Enter Company Name' },
                                { label: 'Product', value: product, setter: setProduct, placeholder: 'Enter Product' },
                                { label: 'Sub Status', value: subStatus, setter: setSubStatus, placeholder: 'Enter Sub Status' },
                                { label: 'Residence Profile', value: residenceProfile, setter: setResidenceProfile, placeholder: 'Enter Residence Profile', multiline: true, },
                                { label: 'Office Profile', value: officeProfile, setter: setOfficeProfile, placeholder: 'Enter Office Profile', multiline: true, },
                                { label: 'Physical ITR', value: physicalItr, setter: setPhysicalItr, placeholder: 'Enter Physical ITR' },
                                { label: 'Bank Statement', value: bankStatement, setter: setBankStatement, placeholder: 'Enter Bank Statement' },
                                { label: 'Final/Additional Remark', value: additionalRemark, setter: setAdditionalRemark, placeholder: 'Enter Additional Remark', multiline: true, },
                            ].map((field) => (
                                <RenderTextField
                                    key={field.label}
                                    label={field.label}
                                    value={field.value}
                                    onChange={(val) => field.setter(val)}
                                    editable={isEditable}
                                    placeholder={field.placeholder}
                                    required={false}
                                    numeric={field.numeric}
                                    multiline={field.multiline ?? false} // ✅ controlled expansion
                                    maxLength={field.maxLength}
                                />
                            )),
                            2, // columns
                            10 // spacing
                        )}

                        {/* --- Dropdown (TAT Met) --- */}
                        <RenderDropdownField
                            label="TAT Met"
                            data={memoizedTATOptions}
                            value={tatMet}
                            onChange={(val) => setTatMet(val)}
                            placeholder="Select TAT Met"
                            isEditable={true}
                            required={false}
                        />

                        {/* --- Custom Name Modal --- */}
                        <Modal
                            animationType="slide"
                            transparent
                            visible={modalVisibleCutsomnameChange}
                            onRequestClose={() => setModalVisibleCutsomnameChange(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <Text style={{ color: 'black' }}>Enter a custom name for the image:</Text>
                                    <TextInput
                                        value={fileName}
                                        onChangeText={setFileName}
                                        placeholder="Enter image name"
                                        placeholderTextColor="#888"
                                        style={styles.modalInput}
                                    />
                                    <ActionButton
                                        onPress={handleSaveFileName}
                                        style={styles.saveButton}
                                    >
                                        <Text style={{ color: 'white' }}>Save Name</Text>
                                    </ActionButton>
                                    <ActionButton
                                        onPress={() => setModalVisibleCutsomnameChange(false)}
                                        style={styles.cancelButton}
                                    >
                                        <Text style={{ color: 'white' }}>Cancel</Text>
                                    </ActionButton>
                                </View>
                            </View>
                        </Modal>

                        {/* --- Documents Section --- */}
                        <View style={styles.documentsSection}>
                            {documents.length === 0 ? (
                                <></>
                            ) : (
                                <>
                                    <FlatList
                                        data={documents}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({ item }) => (
                                            <View style={styles.documentItem}>
                                                <Text style={styles.documentText}>
                                                    {item.documentUploadName || 'Unnamed File'}
                                                </Text>
                                                <ActionButton
                                                    style={styles.downloadButton}
                                                    onPress={() =>
                                                        handleDownloadCibilFilee(
                                                            [item.documentUpload],
                                                            [item.documentUploadName]
                                                        )
                                                    }
                                                >
                                                    <Text style={styles.buttonText}>Download</Text>
                                                </ActionButton>
                                            </View>
                                        )}
                                    />
                                    <ActionButton
                                        style={styles.downloadAllButton}
                                        onPress={() =>
                                            handleDownloadCibilFilee(
                                                documents.map((doc) => doc.documentUpload),
                                                documents.map((doc) => doc.documentUploadName)
                                            )
                                        }
                                    >
                                        <Text style={styles.buttonText}>Download All Files</Text>
                                    </ActionButton>
                                </>
                            )}
                        </View>

                        {/* --- Upload & Camera Section --- */}
                        <View style={styles.uploadSection}>
                            <View style={styles.uploadColumn}>
                                <Text style={styles.label}>
                                    Document Upload <Text style={styles.required}>*</Text>
                                </Text>
                                <ActionButton
                                    style={styles.documentButton}
                                    onPress={handleDocumentSelection}
                                    disabled={isDisabled}
                                >
                                    <Image
                                        source={require('../../asset/upload.png')}
                                        style={[styles.iconStyle, isDisabled && { tintColor: '#888' }]}
                                    />
                                    <Text style={styles.buttonText}>Select Document</Text>
                                </ActionButton>

                                {(documentUploadName?.length > 0
                                    ? documentUploadName
                                    : ['No file selected']
                                ).map((name, index) => (
                                    <Text key={index} style={styles.fileNameText} numberOfLines={1}>
                                        {name}
                                    </Text>
                                ))}
                            </View>

                            <ActionButton
                                style={[styles.downloadbuttonLODA, styles.centerAlign]}
                                onPress={() =>
                                    handleDownloadCibilFile(documentUpload, documentUploadName)
                                }
                            >
                                <Image
                                    source={require('../../asset/download.png')}
                                    style={styles.downloadIcon}
                                />
                            </ActionButton>

                            <ActionButton
                                style={[styles.downloadbuttonLODA, styles.centerAlign]}
                                onPress={handleTakePhoto}
                                disabled={isDisabled}
                            >
                                <Image
                                    source={require('../../asset/camera.png')}
                                    style={[styles.cameraIcon, isDisabled && { tintColor: '#888' }]}
                                />
                            </ActionButton>
                        </View>

                        {/* --- Uploaded Photos Display --- */}
                        {photoFileName?.length > 0 && (
                            <View style={styles.photoFileListContainer}>
                                {photoFileName.map((name, index) => (
                                    <Text key={index} style={styles.photoFileItem}>
                                        • {name}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </VerificationSection>




                    {isEditable && (
                        <>
                            {renderButton('Save', handlesave, loading)}
                            {showSubmitButton && renderButton('Submit', handleSubmit, loading, '#4CAF50')}
                        </>
                    )}
                </View>



            </ScrollView>
        </SafeAreaView>
    );
};

export default RCUProcess;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        marginBottom: 50,
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
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

    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    dropdown1: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#fff',
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
        marginVertical: 10
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
    uploadSection: {
        flexDirection: 'row',
        marginVertical: 10,
        alignItems: 'center',
    },
    uploadColumn: {
        flex: 1,
        flexDirection: 'column',
    },
    documentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        padding: 10,
        borderRadius: 6,
        marginVertical: 6,
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



    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        fontSize: 14,
        backgroundColor: "#f9f9f9",
        color: 'black',
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
    placeholderStyle: { color: "#888" },
    dropdownItem: { padding: 10 },
    dropdownItemText: { fontSize: 14, color: "#000" },

});
