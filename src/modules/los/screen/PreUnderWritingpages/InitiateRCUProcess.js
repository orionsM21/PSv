// // import { StyleSheet, Text, View } from 'react-native'
// // import React from 'react'

// // const InitaiateRCUProcess = () => {
// //   return (
// //     <View>
// //       <Text>InitaiateRCUProcess</Text>
// //     </View>
// //   )
// // }

// // export default InitaiateRCUProcess

// // const styles = StyleSheet.create({})

// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const InitaiateRCUProcess = ({ route }) => {
//   // Access the passed 'item' data using route.params
//   const { item } = route.params;

//   // You can now use the `item` data to display the application information
//   const applicant = item.applicant[0]?.individualApplicant;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Application Details</Text>
//       <Text style={styles.detailText}>Application No: {item.applicationNo}</Text>
//       <Text style={styles.detailText}>Name: {applicant?.firstName} {applicant?.lastName}</Text>
//       <Text style={styles.detailText}>Product: {item.productName}</Text>
//       <Text style={styles.detailText}>Category: {item.applicant[0]?.applicantCategoryCode}</Text>
//       <Text style={styles.detailText}>Mobile: {applicant?.mobileNumber}</Text>
//       <Text style={styles.detailText}>Stage: {item.stage}</Text>
//       <Text style={styles.detailText}>ID: {item.id}</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: 'white',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   detailText: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
// });

// export default InitaiateRCUProcess;

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity, ActivityIndicator, Alert, Image
} from 'react-native';
// import CheckBox from '@react-native-community/checkbox';
import { Dropdown } from 'react-native-element-dropdown';
import { BASE_URL } from '../../api/Endpoints';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';


import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { format, isValid } from "date-fns";
import ApplicationDetails from '../Component/ApplicantDetailsComponent.js';
import DetailHeader from '../Component/DetailHeader.js';
const { width, height } = Dimensions.get('window');


// ✅ Utility: format numbers with commas
const formatNumberWithCommas = (value) =>
    value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";

// ✅ Reusable FormField component
const FormField = ({
    label,
    required,
    editable,
    value,
    onChange,
    data,
    placeholder,
    hideRequired = false, // <-- new prop
}) => {
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>
                {label} {required && !hideRequired && <Text style={styles.required}>*</Text>}
            </Text>
            {editable ? (
                <Dropdown
                    data={data}
                    labelField="label"
                    valueField="value"
                    value={value}
                    onChange={onChange}
                    style={[styles.dropdown, !editable && styles.disabledDropdown]}
                    placeholder={placeholder || `Select ${label}`}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={{ color: "black" }}
                    renderItem={(item) => (
                        <View style={styles.dropdownItem}>
                            <Text style={styles.dropdownItemText}>{item.label}</Text>
                        </View>
                    )}
                />
            ) : (
                <TextInput
                    style={[styles.input, !editable && styles.disabledInput]}
                    value={typeof value === "object" ? value?.label : value || ""}
                    editable={false}
                    placeholder={placeholder}
                    placeholderTextColor={"#888"}
                />
            )}
        </View>
    );
};
export const VerificationSection = ({ title, children, style }) => (
    <View style={[styles.sectionWrapper, style]}>
        <Text style={styles.sectionTitlever}>{title}</Text>
        {children}
    </View>
);

const InitaiateRCUProcess = ({ route }) => {
    const { item } = route.params;
    const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
    const [loading, setLoading] = useState(false);
    const [showSubmitButton, setshowSubmitButton] = useState(false);
    const navigation = useNavigation(); // Access navigation to go back
    const [residid, setresidid] = useState([]);

    const [applicationByid, setApplicationByid] = useState(null);
    const token = useSelector((state) => state.auth.token);
    const userDetails = useSelector((state) => state.auth.losuserDetails);
    const [getInitiateVerificationByApplicantidd, setgetInitiateVerificationByApplicantidd] = useState([]);
    const [documentUploads, setDocumentUploads] = useState([]);
    const [residenceIds, setResidenceIds] = useState({});
    const [residence, setresidence] = useState('');
    const [payloadd, setpayload] = useState("");

    const [Cibilid, setCibilid] = useState('');
    const [applicantCategoryCode, setApplicantCategoryCode] = useState('');
    const [applicantidindividualApplicant, setApplicantidIndividualApplicant] =
        useState([]);
    const [ApplicantArray, setApplicantArray] = useState([]); // To store
    const [Applicantid, setApplicantid] = useState([]); // To store
    const [coApplicantid, setcoApplicantid] = useState([]); // To store

    useEffect(() => {
        if (ApplicantArray) {
            const Applicant = ApplicantArray.filter(d => d.applicantTypeCode === 'Applicant')
            const CoApplicant = ApplicantArray.filter(d => d.applicantTypeCode === 'Co-Applicant')
            setApplicantid(Applicant)
            setcoApplicantid(CoApplicant)
        }
    }, [ApplicantArray])
    // 
    const [applicantidApplicant, setApplicantidApplicant] = useState(null);
    const [selectedApplicantType, setSelectedApplicantType] = useState('');
    const [applicantTypes, setApplicantTypes] = useState([]); // To store applicant types for dropdown
    const [fullName, setFullName] = useState('');
    const [remark, setremark] = useState('');
    const [verificationagency, setverificationagency] = useState([]);
    const [selectedverificationagency, setselectedverificationagency] = useState(null);
    const [verificationagencyType, setverificationagencyType] = useState([]);
    const [selectedverificationagencyType, setselectedverificationagencyType] = useState(null);
    const [backupAgencySelection, setBackupAgencySelection] = useState({}); // Store selections dynamically

    const [setDisablefield, setsetDisablefield] = useState(false);
    const [selectedvaluationType, setselectedvaluationType] = useState('');

    const [backupagecytype, setbackupagecytype] = useState([]);
    const [backupagencyname, setbackupagencyname] = useState([]);
    const [backupagentname, setbackupagentname] = useState([]);

    const [verificationAgenct, setverificationAgenct] = useState([]);
    const [selectedverificationAgenct, setselectedverificationAgenct] = useState(null);


    const [fixAgencyTypeA, setfixAgencyTypeA] = useState(true);
    const [fixAgencynameA, setfixAgencyNameA] = useState(true);
    const [fixAgenctnameA, setfixAgenctnameA] = useState(true);


    const [fixAgencyTypecover, setfixAgencyTypecover] = useState(false);
    const [fixAgencynamecover, setfixAgencyNamecover] = useState(false);
    const [fixAgenctnamecover, setfixAgenctnamecover] = useState(false)

    const [fixAgencyType, setfixAgencyType] = useState('');
    const [fixAgencyname, setfixAgencyName] = useState('');
    const [fixAgenctname, setfixAgenctname] = useState('')


    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [documentUploadName, setDocumentUploadName] = useState([]);

    // 

    useEffect(() => {
        if (documentUploads) {
            setFile(null)
        }
    }, [documentUploads])

    const [selectedValuationType, setSelectedValuationType] = useState(null);
    const [disableField, setDisableField] = useState(false);


    const handleValuationType = (item) => {
        setSelectedValuationType(item.value);
        if (item.value === "internal") {
            setDisableField(true);
        } else {
            setDisableField(false);
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



    // 

    useEffect(() => {
        getApplicationByid();
        getAllAgencyType();
        getLogsDetailsByApplicationNumber();
    }, []);


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

                // 
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
    const [savedStatus, setSavedStatus] = useState({
        applicant: false,
        coApplicant: false,
        guarantor: false,
    });
    useEffect(() => {
        getApplicationByid();
        getLogsDetailsByApplicationNumber();
    }, []);
    useEffect(() => {
        if (ApplicantArray) {
            getInitiateVerificationByApplicantid();
            // getAllAgencyType();
        }
    }, [ApplicantArray]);

    useEffect(() => {
        const verificationData = getInitiateVerificationByApplicantidd?.find(
            item => item.verificationLists === 'RCU_Verification',
        );
        if (!verificationData) {
            getAllAgencyType();
        }
        // setpayload(verificationData)

        setresidence(verificationData?.initiateVerificationId)
        const agenctNameId = verificationData?.verificationAgent;
        const agentName = verificationData?.verificationAgentName;
        const agencynameId = verificationData?.verificationAgency;
        const agencyTypeName = verificationData?.verificationAgencyType
        const agencyName = verificationData?.verificationAgencyName;

        setselectedverificationagencyType(agencyTypeName);
        setselectedverificationagency(agencynameId);
        setselectedverificationAgenct(agenctNameId);

        setverificationAgenct([
            { label: agentName, value: agenctNameId }, // Populate with data as needed
        ]);
        setverificationagency([
            { label: agencyName, value: agencynameId }, // Populate with data as needed
        ]);
        setverificationagencyType([
            { label: agencyTypeName, value: agencyTypeName }, // Populate with data as needed
        ]);
        setremark(verificationData?.remarks || '');

        setfixAgenctname(agentName)
        setfixAgencyName(agencyName)
        setfixAgencyType(agencyTypeName)

    }, [getInitiateVerificationByApplicantidd]);


    const getApplicationByid = useCallback(async () => {
        if (!item?.id) {
            console.warn('⚠️ Missing application ID');
            return;
        }

        try {
            const { data } = await axios.get(`${BASE_URL}getApplicationById/${item.id}`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const appData = data?.data;
            if (!appData) {
                console.warn('No application data found');
                return;
            }

            setApplicationByid(appData);

            const applicants = Array.isArray(appData.applicant) ? appData.applicant : [];
            setApplicantArray(applicants);

            // If applicantTypeCode is an object instead of array — keep original structure
            const applicantTypesData = applicants.map(app => ({
                type: app.applicantTypeCode,
                id: app.id,
            }));

            setApplicantTypes(applicantTypesData);
        } catch (error) {
            console.error('❌ Error fetching application data:', error);
            Alert.alert('Error', 'Failed to fetch application data');
        }
    }, [item?.id,]);

    const getInitiateVerificationByApplicantid = async () => {
        try {
            const requests = ApplicantArray.map(async (applicant) => {
                if (!applicant.id) {
                    console.error('Applicant ID is missing for:', applicant);
                    return null; // Skip if no ID is found
                }

                const response = await axios.get(
                    `${BASE_URL}getInitiateRCUVerificationByApplicantId/${applicant.id}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );

                return response?.data?.data;
            });

            // Wait for all API responses
            const results = await Promise.all(requests);

            // Flatten the array (if API returns nested arrays)
            const validResults = results.filter(Boolean).flat();

            // 

            // ✅ Update state with **all** fetched data
            setgetInitiateVerificationByApplicantidd(validResults);

            // Convert array to object mapping { applicantId: initiateVerificationId }
            const residenceMap = validResults.reduce((acc, item) => {
                acc[item.applicantId] = item.initiateVerificationId;
                return acc;
            }, {});

            // 

            setResidenceIds(residenceMap); // Store mapped initiateVerificationId

        } catch (error) {
            console.error('Error fetching getInitiateVerificationByApplicantId data:', error);
        }
    };


    useEffect(() => {
        if (Array.isArray(getInitiateVerificationByApplicantidd)) {
            // const extractedDocuments = getInitiateVerificationByApplicantidd.flatMap(item =>
            //     item.initiateVerificationDocumentDto?.map(doc => ({
            //         documentUpload: doc.documentUpload,
            //         documentUploadName: doc.documentUploadName
            //     })) || []
            // );

            const firstItem = Array.isArray(getInitiateVerificationByApplicantidd) && getInitiateVerificationByApplicantidd.length > 0
                ? getInitiateVerificationByApplicantidd[0]
                : null;

            const extractedDocuments = firstItem?.initiateVerificationDocumentDto?.map(doc => ({
                documentUpload: doc.documentUpload,
                documentUploadName: doc.documentUploadName
            })) || [];


            const verificationData = getInitiateVerificationByApplicantidd?.[0]; // first object
            const selectedValuationType = verificationData
                ? verificationData.internal === true
                    ? "internal"
                    : "external"
                : ""; // default empty if no data
            setSelectedValuationType(selectedValuationType)
            setDocumentUploads(extractedDocuments);
        }
    }, [getInitiateVerificationByApplicantidd]);

    useEffect(() => {
        if (selectedValuationType === 'internal') {
            setDisableField(true);
        }
    }, [selectedValuationType])
    //  // ✅ Check the extracted data


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
                }
            );
            const data = response.data.data;
            // setLogDetails(data);

            // Filter objects with description "InitiateVerification"
            const residenceVerifications = data.filter(
                (log) => log?.description === "Initiate RCU"
            );

            const FeeDetails = data.filter(
                (log) => log?.description === "Fee Details"
            );

            const isPending = FeeDetails.some((detail) => detail.status === "Pending");

            if (isPending) {
                Alert.alert(
                    "Pending Fee Details",
                    "Fee Details have a pending status. Please complete the required actions.",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.goBack(), // Navigate to the previous page
                        },
                    ],
                    { cancelable: false } // Prevent dismissing the alert by tapping outside
                );
            }

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
                error
            );
        }
    };

    const handleVerificatinAgency = async (item) => {
        setselectedverificationagency(item.value);
        setfixAgencyName(item);
        setbackupagencyname(item);

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
                        value: agency.userId
                        , // Assuming agencyMasterId is the unique identifier
                    };
                });

                // 
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
        getAllAgencyType();
        setselectedverificationagencyType(item.value);
        setbackupagecytype(item);
        setfixAgencyType(item)
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
        setfixAgenctname(item)
        setbackupagentname(item);
    };

    // Function to make the API call
    const createInitiateVerification = async () => {
        try {
            setLoading(true);

            const requests = ApplicantArray.map(async (applicant) => {
                const matchedData = getInitiateVerificationByApplicantidd.find(
                    (item) => item.applicantId === applicant.id
                );

                const initiateVerificationId = matchedData ? matchedData.initiateVerificationId : null;

                const dto = {
                    applicantId: applicant.id,
                    applicationNumber: item?.applicationNo,
                    initiateVerificationLists: [
                        {
                            initiateVerificationId: initiateVerificationId,
                            verificationLists: "RCU_Verification",
                            external: disableField ? false : true,
                            internal: disableField ? true : false,
                            verificationAgency: selectedverificationagency,
                            verificationAgent: selectedverificationAgenct,
                            verificationAgencyType: backupagecytype.label,
                            remarks: remark,
                        },
                    ],
                };

                let filesArray = [];

                // Ensure file array is valid
                if (Array.isArray(file) && file.length > 0) {
                    file.forEach((f) => {
                        const fileUri = Platform.OS === "android" ? f.uri.replace("file://", "") : f.uri;
                        filesArray.push({
                            name: "files",
                            filename: f.name,
                            type: f.type || "application/octet-stream",
                            data: RNFetchBlob.wrap(fileUri),
                        });
                    });
                }

                if (Array.isArray(documentUploads) && documentUploads.length > 0) {
                    filesArray = documentUploads.map((f) => {
                        // Get the correct file URI for platform
                        const fileUri =
                            Platform.OS === "android" ? f.documentUpload.replace("file://", "") : f.uri;

                        return {
                            name: "files", // This is the field name expected by your API
                            filename: f.documentUploadName, // Pass the filename
                            type: f.type || "application/octet-stream", // MIME type fallback
                            data: f.documentUpload
                        };
                    });
                }



                try {
                    const response = await RNFetchBlob.fetch(
                        "PUT",
                        `createInitiateVerification`,
                        {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                        },
                        [
                            ...filesArray,
                            { name: "dto", data: JSON.stringify(dto), type: "application/json" },
                        ]
                    );

                    const responseData = await response.json();


                    if (responseData?.msgKey === "Success") {
                        // 
                        setLoading(false);
                        Alert.alert(responseData.message);
                    } else {
                        Alert.alert("Error", responseData.message || "Failed to upload the file.");
                        return null;
                    }
                } catch (error) {
                    console.error("Error in createInitiateVerification:", error.message || error);
                    Alert.alert("Error", "Failed to add residence verification.");
                    return null;
                }
            });

            const responses = await Promise.all(requests);
            const successfulResponses = responses.filter((res) => res !== null);

            if (successfulResponses.length === ApplicantArray.length) {
                setfixAgenctnameA(false);
                setfixAgencyTypeA(false);
                setfixAgencyNameA(false);
                setfixAgenctnamecover(true);
                setfixAgencyTypecover(true);
                setfixAgencyNamecover(true);

                setshowSubmitButton(true);
                getInitiateVerificationByApplicantid();
            } else {
                // Alert.alert("Some requests failed. Please check.");
            }
        } catch (error) {
            console.error("Error creating verification:", error);
            Alert.alert("Error occurred while saving the data.");
        } finally {
            setLoading(false);
        }
    };

    const axiosConfig = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    };


    const handleSubmitClick = async () => {
        setLoading(true);
        try {
            const agencyTechName = await updatenitiateVerificationFlag();
            if (!agencyTechName) throw new Error('Failed to update verification flag');

            await updateLogActivityById(agencyTechName);
            await updateStageMainTainByApplicationNumber(agencyTechName);
            await addLogActivity(agencyTechName);

            // Successfully completed all operations
            setshowSubmitButton(false);
            navigation.replace('RCU', {
                applicationNumber: residid?.applicationNumber, item, item
            });


        } catch (error) {
            console.error('Error in submitting form:', error);
            Alert.alert('Error', error.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            getLogsDetailsByApplicationNumber();

        }, []) // Empty dependency array to ensure this runs every time the screen is focused
    );
    const updatenitiateVerificationFlag = async () => {
        try {
            const payload = { active: true, applicationNumber: residid?.applicationNumber };
            const response = await axios.put(
                `${BASE_URL}updateInitiateVerificationFlag/${residid?.applicationNumber}`,
                payload,
                axiosConfig
            );

            if (response?.data?.msgKey === 'Success') {
                return response.data?.data; // agencyTechName
            }

            return null;
        } catch (error) {
            console.error('Error updating verification flag:', error);
            return null;
        }
    };

    const updateLogActivityById = async (agencyTechName) => {
        try {
            const payload = {
                stage: residid.stage,
                status: 'Completed',
                type: residid?.type,
                user: residid?.user,
                description: residid?.description,
                applicationNumber: residid?.applicationNumber,
            };

            const response = await axios.put(
                `${BASE_URL}updateLogActivityById/${residid?.id}`,
                payload,
                axiosConfig
            );

            if (response?.data?.msgKey !== 'Success') {
                throw new Error('Failed to update log activity');
            }

            return true;
        } catch (error) {
            console.error('Error updating log activity:', error);
            throw error;
        }
    };

    const updateStageMainTainByApplicationNumber = async (agencyTechName) => {
        try {
            const payload = {
                stage: 'RiskContainmentUnit',
                applicationNumber: residid?.applicationNumber,
            };

            const response = await axios.put(
                `${BASE_URL}updateStageMainTainByApplicationNumber/${residid?.applicationNumber}`,
                payload,
                axiosConfig
            );

            if (response?.data?.msgKey !== 'Success') {
                throw new Error('Failed to update stage');
            }

            return true;
        } catch (error) {
            console.error('Error updating stage:', error);
            throw error;
        }
    };

    const addLogActivity = async (agencyTechName) => {
        try {
            const payload = {
                status: 'Pending',
                stage: 'Pre-Underwriting',
                type: residid?.type,
                user: String(agencyTechName),
                description: 'Risk Containment Unit',
                applicationNumber: residid?.applicationNumber,
            };

            const response = await axios.post(
                `${BASE_URL}addLogActivity`,
                payload,
                axiosConfig
            );

            if (response?.data?.msgKey !== 'Success') {
                throw new Error('Failed to add log activity');
            }

            return true;
        } catch (error) {
            console.error('Error adding log activity:', error);
            throw error;
        }
    };



    const ResidenceValidation = () => {
        const missingFields = [];
        if (!disableField) {
            if (!selectedverificationagencyType) {
                missingFields.push('Verification Agency Type cannot be empty');
            }

            if (!selectedverificationagency) {
                missingFields.push('Verification Agency cannot be empty');
            }

            if (!selectedverificationAgenct) {
                missingFields.push('Verification Agent cannot be empty');
            }

        }
        if (!remark) {
            missingFields.push('Remarks cannot be empty');
        }
        return missingFields.length ? missingFields : true;
    };

    const handleSaveClick = () => {
        const residenceValidationResult = ResidenceValidation();


        const missingFields = [
            ...(Array.isArray(residenceValidationResult) ? residenceValidationResult : []),
        ];

        if (missingFields.length) {
            // Format missing fields into a styled list
            const formattedMissingFields = missingFields
                .map((field, index) => `\u2022 ${field}`) // Add bullet points
                .join('\n'); // Join with new lines

            Alert.alert(
                ' Alert ⚠️',
                `${formattedMissingFields}`,
                [{ text: 'OK', style: 'cancel' }] // Optionally, add a cancel button
            );
        } else {
            setLoading(true);
            createInitiateVerification();
        }
    };

    const formatNumberWithCommas = (value) => {
        if (!value || isNaN(value)) return value; // Return original value if not a valid number
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
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
        <View style={styles.container}>
            <ScrollView style={{ padding: 10 }}>
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



                {/* RCU Section */}
                <View style={[styles.cardWrapper, { marginVertical: 10 }]}>
                    <Text style={styles.sectionTitle}>Initiate RCU</Text>

                    {/* Verification Agency Type */}
                    <FormField
                        label="Verification Agency Type"
                        required
                        editable
                        value={selectedValuationType}
                        onChange={handleValuationType}
                        data={[
                            { label: "Internal", value: "internal" },
                            { label: "External", value: "external" },
                        ]}
                    />

                    {/* Agency Dropdowns */}
                    <FormField
                        label="Verification Agency Type"
                        required
                        editable={!disableField}
                        value={null}
                        onChange={handleVerificatinAgencyType}
                        data={backupAgencySelection[item?.applicant?.[0]?.applicantCategoryCode] || verificationagencyType}
                        hideRequired={selectedValuationType === "internal"} // <-- hide * if internal
                    />

                    <FormField
                        label="Verification Agency Name"
                        required
                        editable={!disableField}
                        value={null}
                        onChange={handleVerificatinAgency}
                        data={verificationagency}
                        hideRequired={selectedValuationType === "internal"} // <-- hide * if internal
                    />

                    <FormField
                        label="Verification Agent"
                        required
                        editable={!disableField}
                        value={null}
                        onChange={handleverificationAgent}
                        data={verificationAgenct}
                        hideRequired={selectedValuationType === "internal"} // <-- hide * if internal
                    />

                    {/* Remark */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Remark <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                residid.status !== "Pending" && styles.disabledInput, // apply disabled style if not Pending
                            ]}
                            value={remark}
                            onChangeText={setremark}
                            editable={residid.status === "Pending"} // only editable if Pending
                            placeholder="Enter Remark"
                            placeholderTextColor="#888"
                        />

                    </View>

                    {/* Document Upload */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Document Upload</Text>
                        <TouchableOpacity
                            style={[
                                styles.documentButton,
                                residid.status !== "Pending" && styles.disabledButton, // apply disabled style
                            ]}
                            onPress={handleDocumentSelection}
                            disabled={residid.status !== "Pending"} // disable if not Pending
                        >
                            <Image source={require("../../asset/upload.png")} style={styles.iconStyle} />
                            <Text style={styles.buttonText}>Select Document</Text>
                        </TouchableOpacity>


                        {/* New Files */}
                        {file?.length > 0 &&
                            file.map((fileItem, index) => (
                                <Text key={index} style={styles.fileNameText}>
                                    {`\u2022 ${fileItem.name}`}
                                </Text>
                            ))}

                        {/* Already Uploaded */}
                        {documentUploads?.length > 0 &&
                            documentUploads.map((doc, index) => (
                                <Text key={index} style={styles.fileNameText}>
                                    {`\u2022 ${doc.documentUploadName}`}
                                </Text>
                            ))}
                    </View>
                </View>

                {/* Action Buttons */}
                {residid.status === "Pending" && (
                    <View style={{ marginBottom: 20 }}>
                        {loading ? (<ActivityIndicator size="large" color="#4CAF50" />) : (
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveClick}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        )}
                        {loading ? (
                            <ActivityIndicator size="large" color="#4CAF50" />
                        ) : showSubmitButton ? (
                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitClick}>
                                <Text style={styles.submitText}>Submit</Text>
                            </TouchableOpacity>
                        ) : null}


                    </View>
                )}
            </ScrollView>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        height: 60,
        backgroundColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        // paddingHorizontal: 15,
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
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007BFFBB',
        marginBottom: 16,
    },
    dropdown: {
        width: width * 0.64,
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
        padding: 6,
        width: width * 0.86,
        color: 'pink',
        fontSize: 16,
        fontWeight: 'bold',
        // backgroundColor:'red'
    },
    placeholderStyle: {
        color: '#888',
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },


    dropdownItem: {
        padding: 10,
        backgroundColor: '#fff',
    },

    dropdownItemText: {
        color: 'black',
    },

    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },

    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#333',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    checked: {
        backgroundColor: '#333',
        color: 'white',
    },

    selectedTextStyle: {
        color: 'black', // Set to a visible color for both light and dark modes
        fontSize: 16,
        // fontWeight: 'bold',
    },
    required: {
        color: 'red', // Asterisk color to indicate mandatory
    },

    buttonText: {
        color: 'black',
        fontSize: 10,
        fontWeight: 'bold',
    },
    fileNameText: {
        flexWrap: 'wrap', // Allow text wrapping
        marginLeft: 30,
        fontSize: 14,
        color: '#000', // Set text color (or use your theme)
    },





    container: { flex: 1, backgroundColor: "#fff" },
    formGroup: { marginBottom: 12 },
    label: { fontSize: 14, color: "#333", marginBottom: 5 },
    required: { color: "red" },
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

    documentButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        borderRadius: 6,
        marginTop: 5,
    },
    iconStyle: { width: 20, height: 20, marginRight: 8 },
    // buttonText: { fontSize: 14 },

    saveBtn: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    saveText: { color: "#fff", fontSize: 16 },
    submitBtn: {
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    submitText: { color: "#fff", fontWeight: "bold" },
    label: {
        fontSize: width * 0.035, // ~14px on average screen
        color: '#333',
        marginBottom: 6,
        fontWeight: '500',
        flexWrap: 'wrap',        // ensures wrapping instead of overlap
    },

    documentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',        // prevents overlap when text is long
        paddingVertical: width * 0.025,
        paddingHorizontal: width * 0.03,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        marginTop: 6,
        width: '100%',
    },
    disabledButton: {
        backgroundColor: "#ccc", // gray background when disabled
    },
    iconStyle: {
        width: width * 0.05,
        height: width * 0.05,
        marginRight: 8,
        resizeMode: 'contain',
    },

    buttonText: {
        color: '#000',
        fontSize: width * 0.035,
        fontWeight: 'bold',
        flexShrink: 1,           // allows text to shrink gracefully
        flexWrap: 'wrap',        // ensures wrapping on multiple lines
        textAlign: 'center',     // centers text when wrapped
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

    sectionTitlever: {
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
});

export default InitaiateRCUProcess;
