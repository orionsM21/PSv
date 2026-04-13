import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Button, ActivityIndicator, Alert, Image,
    SafeAreaView
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import FormData from 'form-data';
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob';
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import ApplicationDetails from '../Component/ApplicantDetailsComponent';
import { RenderDropdownField, RenderTextField } from '../Component/ResponsiveFormFields';
import DetailHeader from '../Component/DetailHeader';


const { width, height } = Dimensions.get('window');
// ✅ Move this outside your component
const renderTextField = (label, value, onChange, editable = true, placeholder = '', isEditable = true) => {
    const fieldEditable = Boolean(editable) && Boolean(isEditable);

    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, !fieldEditable && styles.disabledInput]}
                value={Array.isArray(value) ? value.join(', ') : String(value || '')}
                onChangeText={onChange}
                editable={fieldEditable} // ✅ guaranteed boolean
                placeholder={placeholder}
                placeholderTextColor="#888"
            />
        </View>
    );
};

const VerificationSection = ({ title, children, style }) => (
    <View style={[styles.sectionWrapper, style]}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const VerificationWaiverProcess = ({ route }) => {
    const token = useSelector((state) => state.auth.token);
    const userDetails = useSelector((state) => state.auth.losuserDetails);
    const { item } = route.params;
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const applicant = item.applicant[0]?.individualApplicant;
    const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
    const [applicationByid, setApplicationByid] = useState(null);
    // const [selectedApplicantType, setSelectedApplicantType] = useState('');
    const [ApplicantArray, setApplicantArray] = useState([]); // To store
    const [salariedApplicantIds, setSalariedApplicantIds] = useState([]);
    const [applicantidApplicant, setApplicantidApplicant] = useState(null);
    const [applicantidindividualApplicant, setApplicantidIndividualApplicant] = useState([]);
    const [applicantCategoryCode, setApplicantCategoryCode] = useState('');
    const [Cibilid, setCibilid] = useState('');
    const [fullName, setFullName] = useState('');
    const [applicantTypesw, setApplicantTypes] = useState([]);
    const [agencyForAgent, setAgencyForAgent] = useState([]);
    const [agencyForLength, setAgnecyForLength] = useState([]);
    const [agnecyForLengthOffice, setAgnecyForLengthOffice] = useState([]);
    const [filterUserIDD, setfilterUserIDD] = useState([]);
    const agencyForAgentLength = agencyForLength?.length
    const agencyForAgentLengthOffice = agnecyForLengthOffice?.length

    const [getInitiateVerificationByApplicantidd, setgetInitiateVerificationByApplicantidd,] = useState([]);
    const [VerificationWaiverFromInitiateByApplicationNumber, setVerificationWaiverFromInitiateByApplicationNumber] = useState([])

    const [logdetails, setLogDetails] = useState([]);
    const [residid, setresidid] = useState([]);

    // const applicantTypess = applicantTypes.map(type => ({
    //     label: type,
    //     value: type,
    // }));
    const [ListOfVerfifcation, setListOfVerfifcation] = useState([
        { label: 'Residence Verification', value: 'Residence_Verification' }, // Match the value
        { label: 'Office Verification', value: 'Office_Verification' },
    ]);
    const [VVListOfVerification, setVVListOfVerification] = useState([]);
    const [selctedlistofVerification, setSelctedlistofVerification] = useState('');


    const [vaiwerdaaata, setvaiwerdaaata] = useState([])


    const [applicantTypes, setApplicantTypesw] = useState([
        { label: 'Applicant', value: 'Applicant' }, // Match the value
        { label: 'Co-Applicant', value: 'Co-Applicant' },
        { label: 'Guarantor', value: 'Guarantor' },
    ]);

    const [applicantTypesx, setApplicantTypesx] = useState([]);

    const [Vvapplicantypes, setVvApplications] = useState([]);
    const [selectedApplicantType, setSelectedApplicantType] = useState('');

    const [WaiverReasons, setWaiverReasons] = useState([]);
    const [selectedWaiverReasons, setSelectedWaiverReasons] = useState('');

    const [decision, setdecision] = useState([]);
    const [selectedDecision, setselectedDecision] = useState('');


    const [remark, setremark] = useState('');
    const [waiver, setWaiver] = useState([]);


    const [verificationWaiverData, setVerificationWaiverData] = useState([])
    const [getInditiateVerificationWaiverByApplicationNumber, setgetInitiateVerificationWaiverByApplicationNumber] = useState([])



    const residenceVerificationWaive = verificationWaiverData?.filter(
        (val) => val?.verificationLists === 'Residence_Verification',
    )





    const officeVerificationWaive = verificationWaiverData?.filter(
        (val) =>
            val?.verificationLists === 'Office_Verification'
        // &&    val?.applicantId === applicantidApplicant
    );




    const [savedStatus, setSavedStatus] = useState({});


    // useEffect(() => {
    //     if (Array.isArray(Vvapplicantypes) && Vvapplicantypes.length > 0) {
    //         const initialStatus = Vvapplicantypes.reduce((acc, item) => {
    //             acc[item.id.toString()] = false; // each applicant id as key
    //             return acc;
    //         }, {});
    //         setSavedStatus(initialStatus);
    //     }
    // }, [Vvapplicantypes]);


    // 
    useEffect(() => {
        const fetchData = async () => {
            // First call
            await getAllVerificationWaiverFromInitiate();
            // Second call
            await getApplicationByid();
            // Third call
            await getLogsDetailsByApplicationNumber();
            // Fourth call
            await getVerificationWaiverFromInitiateByApplicantId();

            await getInitiateVerificationWaiverByApplicationNumber();
        };

        fetchData();
    }, []);


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
            setLogDetails(data);

            // Filter objects with description "InitiateVerification"
            const residenceVerifications = data.filter(
                (log) => log?.description === "Verification Waiver"
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
                error
            );
        }
    };

    useEffect(() => {
        if (applicantidApplicant) {
            getRiskContainmentUnitByApplicantId();
            getApplicationByid();
            getVerificationWaiverFromInitiateByApplicantId();
            getInitiateVerificationWaiverByApplicationNumber();
        }
    }, [applicantidApplicant]);


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
            const applicationNumber = data?.applicationNo || '';
            const userName = data?.createdBy?.userName || '';

            setApplicantArray(applicants);
            // if (applicants.length > 0) setApplicant(applicants[0]);
            // if (applicants.length > 1) setCoApplicant(applicants[1]);
            // if (applicants.length > 2) setguarantor(applicants[2]);
            const applicantCodes = applicants.map(app => ({
                type: app.applicantTypeCode,
                id: app.id
            }));

            // Check if mapping works
            setApplicantTypes(applicantCodes);

            // setApplicationDetails(Array.isArray(data) ? data : [data || {}]);

            // Now call addLogActivity with applicationNumber and userName
            // await addLogActivity(applicationNumber, userName);
            // await updateStageMainTainByApplicationNumber();
        } catch (error) {
            console.error('Error fetching application data:', error);
            Alert.alert('Error', 'Failed to fetch application data');
        }
    }, []);
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
                // setAgnecyForLength(filterHouseWife);

                const filterUserIDD = allData?.applicant?.map(item => item.id);
                setfilterUserIDD(filterUserIDD);
                setAgnecyForLength(allData?.applicant);

                setAgnecyForLengthOffice(filterHouseWife);

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
                    label: `${applicant?.individualApplicant?.firstName} ${applicant?.individualApplicant?.middlename} ${applicant?.individualApplicant?.lastName}`,
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


    const getRiskContainmentUnitByApplicantId = async () => {
        if (!applicantidApplicant) {
            console.error('Applicant ID is missing');
            return; // Exit early if applicantidIndividualApplicant is undefined
        }
        try {
            const response = await axios.get(
                `${BASE_URL}getVerificationWaiverByApplicantId/${applicantidApplicant}`,
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
                'Error fetching getVerificationWaiverByApplicantId:',
                error,
            );
        }
    };

    const getAllVerificationWaiverFromInitiate = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}${BASE_URL}getAllVerificationWaiverFromInitiate`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            if (response.status === 200 && response.data?.data) {
                setWaiver(response.data.data);
            } else {
                console.error('No waiver data found');
            }
        } catch (error) {
            console.error('Error calling API:', error.message || error);
        }
    }, []);

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
            const data = response.data.data;
            setVerificationWaiverFromInitiateByApplicationNumber(data)
            // setgetInitiateVerificationByApplicantidd(data);
            setVerificationWaiverData(response.data.data);
            setvaiwerdaaata(data);
        } catch (error) {
            console.error(
                'Error fetching getVerificationWaiverFromInitiateByApplicantionNumber:',
                error,
            );
        }
    };

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


    // const getApplicationById = async () => {
    //     if (!applicantidApplicant) {
    //         console.error('Applicant ID is missing');
    //         return; // Exit early if applicantidIndividualApplicant is undefined
    //     }
    //     try {
    //         const response = await axios.get(
    //             `getApplicationById/${applicantidApplicant}`,
    //         );
    //         const data = response.data.data;
    //         // 
    //     } catch (error) {
    //         console.error('Error fetching getApplicationById:', error);
    //     }
    // };




    // const handleDropdownChange = item => {
    //     setSelectedApplicantType(item.value);
    //     const selectedApplicant = ApplicantArray.find(
    //         app => app.applicantTypeCode === item.value,
    //     );
    //     if (selectedApplicant && selectedApplicant.individualApplicant) {
    //         const individualApplicantId = selectedApplicant.id;
    //         const applicantid = selectedApplicant.id;
    //         
    //         setApplicantidApplicant(applicantid);
    //         setApplicantidIndividualApplicant(individualApplicantId);
    //     } else {
    //         console.error('No individualApplicant found in selectedApplicant');
    //     }

    //     if (selectedApplicant) {
    //         setApplicantCategoryCode(selectedApplicant.applicantCategoryCode);
    //         setCibilid(selectedApplicant.id);
    //         const { firstName, lastName } = selectedApplicant.individualApplicant || {};
    //         setFullName(`${firstName || ''} ${lastName || ''}`);
    //     } else {
    //         setApplicantCategoryCode('');
    //         setFullName('');
    //     }
    // };

    const handleDropdownChange = async (item) => {

        setSelectedApplicantType(item.value);
        setgetInitiateVerificationByApplicantidd([]); // Clear state immediately

        let userid = item.value;
        // const selectedApplicant = ApplicantArray.find(
        //     app => app.customerId === item.value,
        // );

        const selectedApplicant = ApplicantArray.find(app =>
            (aaplicantName?.applicantCategoryCode === 'Organization'
                ? app.organizationApplicant
                : app.individualApplicant) && app.id === userid
        );



        if (selectedApplicant) {
            const individualApplicantId = selectedApplicant.id;
            const applicantid = selectedApplicant?.id;

            setApplicantidApplicant(applicantid);
            // 
            setApplicantidIndividualApplicant(individualApplicantId);

        } else {
            console.error('No individualApplicant found in selectedApplicant');
        }

        if (aaplicantName?.applicantCategoryCode === 'Organization') {
            const { organizationApplicant } = selectedApplicant;
            setApplicantCategoryCode(organizationApplicant?.primaryOccupation || '');
            setFullName(organizationApplicant?.organizationName || '');
        } else {
            const { individualApplicant } = selectedApplicant;
            setApplicantCategoryCode(individualApplicant?.primaryOccupation || '');
            const { firstName, middlename, lastName } = individualApplicant || {};
            setFullName(`${firstName || ''} ${middlename || ''} ${lastName || ''}`.trim());
        }
    };

    const applicantTypess = Vvapplicantypes.map(({ type, id }) => {
        if (type === "Co-Applicant" || type === "Guarantor") {
            return { label: type, value: id }; // No number suffix
        } else {
            return { label: type, value: id };
        }
    });





    const handleWaiverReason = item => {

        setSelectedWaiverReasons(item);
    };

    const handlelistOfVerifcation = item => {
        setSelctedlistofVerification(item.value);
    };

    const handleRemark = (name) => {
        setremark(name); // Update state with user input
    };

    const handleDecision = item => {
        setselectedDecision(item);
    };
    const ResidenceValidation = () => {
        const missingFields = [];

        // Step 1: Validate Required Fields
        if (!selectedApplicantType) {
            missingFields.push('Applicant Type');
        }

        // if (!fullName) {
        //     missingFields.push('Applicant Name');
        // }

        if (!selectedDecision) {
            missingFields.push('Please Select a Decision');
        }

        if (!remark) {
            missingFields.push('Please Enter a Remark');
        }

        return missingFields.length ? missingFields : true;
    };

    const handlesave = () => {
        const residenceValidationResult = ResidenceValidation();
        const missingFields = [
            ...(Array.isArray(residenceValidationResult) ? residenceValidationResult : []),
            // ...(Array.isArray(officeValidationResult) ? officeValidationResult : []),
        ];

        if (missingFields.length) {
            const formattedMissingFields = missingFields
                .map(field => `\u2022 ${field}`)
                .join('\n');

            Alert.alert('⚠️ Alert', formattedMissingFields, [
                { text: 'OK', style: 'cancel' },
            ]);
            return;
        } else {
            createVerificationWaiver();
        }

        if (Array.isArray(Vvapplicantypes) && Vvapplicantypes.length > 0) {
            if (Vvapplicantypes.length === 1) {
                const selectedItem = Vvapplicantypes[0];
                setSelectedApplicantType(selectedItem.id);
                handleDropdownChange({ value: selectedItem.id, label: selectedItem.type });
            } else {
                const selectedItem = Vvapplicantypes.find(
                    item => item.id === selectedApplicantType
                );
                if (selectedItem) {
                    handleDropdownChange({ value: selectedItem.id, label: selectedItem.type });
                } else {
                    const firstItem = Vvapplicantypes[0];
                    setSelectedApplicantType(firstItem.id);
                    handleDropdownChange({ value: firstItem.id, label: firstItem.type });
                }
            }
        }



    };




    const handleSubmit = async () => {
        setLoading(true); // Show loader
        try {
            updateRiskContainmentUnitFlag();
        } catch (error) {
            console.error('Error in submitting form:', error.message || error);
            Alert.alert('Error', error.message || 'Something went wrong!');
        } finally {
            setLoading(false); // Hide loader
        }
    };

    const addLogActivity = async () => {
        try {
            // Define the payload based on the data structure you provided
            const payload = {
                status: "Pending", // Example value, you may want to dynamically set it
                stage: "Pre-Underwriting", // Example value, adjust as needed
                type: residid?.type, // Example value
                user: residid?.user, // Example value
                description: "Residence Verification", // Fixed value in your case
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
                // await addLogActivityOffice();
                // navigation.navigate('ResidenceVerification');
                // setLoading(false); // Hide loader
                navigation.replace('Residence Verification', { item: item });
            }



        } catch (error) {
            console.error("Error updating log activity:", error);
        }
    };

    const addLogActivityOffice = async () => {
        try {
            // Define the payload based on the data structure you provided
            const payload = {
                status: "Pending", // Example value, you may want to dynamically set it
                stage: "Pre-Underwriting", // Example value, adjust as needed
                type: residid?.type, // Example value
                user: residid?.user, // Example value
                description: "Office Verification", // Fixed value in your case
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
                navigation.replace('Office Verifcation', { item: item });
                setLoading(false); // Hide loader
            }


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
    useFocusEffect(
        React.useCallback(() => {
            getLogsDetailsByApplicationNumber();

        }, []) // Empty dependency array to ensure this runs every time the screen is focused
    );
    const updateRiskContainmentUnitFlag = async () => {
        try {
            const payload = {
                active: true,
                applicationNo: item.applicationNo, // Example application number, adjust dynamically if needed
            };
            const response = await axios.put(
                `${BASE_URL}updateVerificationWaiverFlag/${item.applicationNo}`,  // Assuming PUT request to update

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
                await updateStageMaintain();
            }


        } catch (error) {
            console.error("Error updating log activity:", error);
        }
    };

    const updateStageMaintain = async () => {
        try {
            const response = await axios.put(
                `${BASE_URL}updateStageMainTainByApplicationNumber/${item.applicationNo}`,
                {
                    applicationNumber: item.applicationNo,
                    stage: 'VerificationWaiver',
                },
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            if (response.data.msgKey === 'Success') {
                const msgKey = response?.data?.msgKey;
                const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
                // Alert.alert(msgKey, successMessage);
                await updateLogActivityById();
            }
            return response.data;

        } catch (error) {
            console.error('Error in updateStageMaintain:', error.message || error);
        }
    };

    const updateLogActivityById = async () => {
        try {
            // Define the payload based on the data structure you provided
            const payload = {
                stage: residid.stage, // Example value, you may want to dynamically set it
                status: 'Completed', // Example value, adjust as needed
                type: residid?.type, // Example value
                user: residid?.user, // Example value
                description: residid?.description, // Fixed value in your case
                applicationNumber: residid?.applicationNumber, // Example application number, adjust dynamically if needed
            };

            // Make the API call to update the log activity by ID
            const response = await axios.put(
                `${BASE_URL}updateLogActivityById/${residid?.id}`,  // Assuming PUT request to update
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

                const allWaiversTrue = getInditiateVerificationWaiverByApplicationNumber?.every((val) => val?.waiver === true)
                if (allWaiversTrue) {
                    addLogActivityRCU();
                }

                if (residenceVerificationWaive?.length !== agencyForAgentLength) {
                    addLogActivity();
                }

                if (agencyForAgentLengthOffice > 0) {
                    // Case 1: Some agency data exists, but not all match the waiver entries
                    if (agencyForAgentLengthOffice !== officeVerificationWaive?.length) {
                        await addLogActivityOffice();
                    }
                } else {
                    // Case 2: No agency data exists (i.e., agencyForAgentLengthOffice === 0)
                    // but all office waivers match agencyForAgentLength
                    if (officeVerificationWaive?.length === agencyForAgentLength) {
                        await addLogActivityOffice();
                    }
                }

            }






        } catch (error) {
            console.error("Error updating log activity:", error);
        }
    };

    useEffect(() => {
        const verificationData = getInitiateVerificationByApplicantidd;
        const waiverData = waiver;

        // Set initial states from verificationData
        setSelectedWaiverReasons(verificationData?.waiverReason || '');
        setselectedDecision(verificationData?.decision?.trim() || ''); // Trim to avoid whitespace mismatches
        setremark(verificationData?.remarks || '');

        // Find matching waiver for the current applicantId
        const matchingWaiver = waiverData?.filter(item => item.applicantId === applicantidApplicant);

        if (Array.isArray(matchingWaiver) && matchingWaiver.length > 0) {
            const allVerificationKeys = [];

            matchingWaiver.forEach(item => {
                const verificationList = Array.isArray(item.verificationLists)
                    ? item.verificationLists
                    : [item.verificationLists];

                allVerificationKeys.push(...verificationList);
            });

            const uniqueVerificationKeys = [...new Set(allVerificationKeys)];



            const filteredVerification = ListOfVerfifcation.filter(verificationObj =>
                uniqueVerificationKeys.includes(verificationObj.value)
            );



            if (filteredVerification.length > 0) {
                // setVVListOfVerification(filteredVerification);

                const firstValue = filteredVerification[0]?.value || '';
                setSelctedlistofVerification(firstValue);

                const firstReason = matchingWaiver.find(item => item.waiverReason)?.waiverReason || '';
                const allReasonsString = matchingWaiver
                    .map(item => item.waiverReason)
                    .filter(reason => !!reason)
                    .join(', ');


                // setSelectedWaiverReasons(firstReason);
                setSelectedWaiverReasons(allReasonsString)

                // 👇 Here's the part that formats to "Residence Verification && Office Verification"
                const combinedLabels = filteredVerification.map(v => v.label).join(' && ');

                setVVListOfVerification(combinedLabels);
                // Optional: save this in a state if needed
                // setCombinedLabelText(combinedLabels);
            }
        }




        if (Array.isArray(vaiwerdaaata) && vaiwerdaaata.length > 0) {
            const applicantTypeCodes = vaiwerdaaata.map(item => item.applicantId);

            const filteredVerification = applicantTypesw.filter(verificationObj =>
                applicantTypeCodes.includes(verificationObj.id)
            );


            setVvApplications(filteredVerification);
        }


    }, [getInitiateVerificationByApplicantidd, waiver, applicantTypesw]);

    const WWaiverReasion = WaiverReasons.map(pincodeObj => ({
        label: `${pincodeObj.lookupName} `,
        value: pincodeObj.lookupName,
    }));

    const DDcison = decision.map(pincodeObj => ({
        label: `${pincodeObj.lookupName} `,
        value: pincodeObj.lookupName,
    }));

    const decisionOptions = [
        { label: 'Positive', value: 'Positive' },
        { label: 'Negative', value: 'Negative' },
    ];

    useEffect(() => {
        getByTypelookupTypeDecision();
        getVerificationWaiverFromInitiateByApplicantId();
        getByTypelookupTypeWaiverReason();
        getInitiateVerificationWaiverByApplicationNumber();
    }, []);


    const getByTypelookupTypeDecision = async () => {
        try {
            const response = await axios.get(`${BASE_URL}${BASE_URL}getByType?lookupType=valuationDecision`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            const formattedData = response.data.data.map(item => ({
                label: item.lookupName,  // Display the lookUpName
                value: item.lookupId      // Store the lookUpId as value
            }));

            setdecision(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getByTypelookupTypeWaiverReason = async () => {
        try {
            const response = await axios.get(`${BASE_URL}${BASE_URL}getByType?lookupType=WaiverReason`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            // Assuming the API returns an array with `lookUpName` and `lookUpId`
            const formattedData = response.data.data.map(item => ({
                label: item.lookupName,  // Display the lookUpName
                value: item.lookupId     // Store the lookUpId as value
            }));
            setWaiverReasons(response.data.data);  // Set the fetched data
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };


    const createVerificationWaiver = async () => {
        const payload = {
            verificationWaiverId: getInitiateVerificationByApplicantidd?.verificationWaiverId ? getInitiateVerificationByApplicantidd?.verificationWaiverId : '',
            applicationNumber: item?.applicationNo ? item?.applicationNo : '',
            listOfVerification: selctedlistofVerification.label ? selctedlistofVerification.label : selctedlistofVerification ? selctedlistofVerification : '',
            waiverReason: selectedWaiverReasons.label ? selectedWaiverReasons.label : selectedWaiverReasons ? selectedWaiverReasons : '',
            decision: selectedDecision.label ? selectedDecision.label : selectedDecision ? selectedDecision : '',
            remarks: remark ? remark : '',
            applicantId: applicantidApplicant ? applicantidApplicant : '', // Ensure applicantId is a number
        };

        try {
            const response = await axios.put(`${BASE_URL}createVerificationWaiver`, payload,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            if (response.data.msgKey === 'Success') {
                const msgKey = response?.data?.msgKey
                const successMessage = response.data?.message
                getRiskContainmentUnitByApplicantId();
                Alert.alert(msgKey, successMessage);
                // setLoading(true);
                // createInitiateVerification();

                // Cycle through Applicant types
                if (Array.isArray(Vvapplicantypes) && Vvapplicantypes.length > 0) {
                    const currentIndex = Vvapplicantypes.findIndex(
                        applicant => applicant.id === selectedApplicantType
                    );

                    const nextIndex = (currentIndex + 1) % Vvapplicantypes.length;
                    const nextType = Vvapplicantypes[nextIndex]; // { type, id }

                    // ✅ Mark the current one as saved
                    setSavedStatus(prev => ({
                        ...prev,
                        [selectedApplicantType.toString()]: true,
                    }));

                    // ✅ Move to the next applicant
                    setSelectedApplicantType(nextType.id);
                    handleDropdownChange({ value: nextType.id, label: nextType.type });
                }


                // Alert.alert('Success', 'Verification waiver created successfully!');
            } else {
                Alert.alert('Error', `Unexpected response: ${response.status}`);
            }
        } catch (error) {
            console.error('Error creating verification waiver:', error);
            Alert.alert('Error', 'Failed to create verification waiver.');
        }
    };
    const applicantsToCheck = vaiwerdaaata?.length > 0 ? applicantTypess : applicantTypes;

    const showSubmitButton = applicantsToCheck?.length > 0
        ? applicantsToCheck.every(applicant => savedStatus[applicant.value?.toString() || applicant.id?.toString()])
        : false;
    // const showSubmitButton =
    //     Array.isArray(Vvapplicantypes) &&
    //     Vvapplicantypes.length > 0 &&
    //     Vvapplicantypes.every(applicant =>
    //         savedStatus?.[applicant?.id?.toString()]
    //     );





    const renderInput = useCallback(
        (label, value, editable = false, onChangeText) => (
            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={styles.input}
                    value={value || ''}
                    editable={editable}
                    onChangeText={onChangeText} // This is necessary for user input to update the state
                />
            </View>
        ),
        [],
    );


    const isPending = residid.status === 'Pending';
    const isEditable = isPending && userDetails?.designation !== 'Sales Head';
    const isDisabled = !isPending || userDetails?.designation === 'Sales Head';



    const renderDropdownField = (label, data, value, onChange, placeholder = '', disabled = false) => {
        const fieldDisabled = disabled || !isEditable; // disable if not pending or forced
        return (
            <View style={styles.formGroup}>
                <Text style={styles.label}>{label}</Text>
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

        // ✅ Store all measured heights without causing re-renders
        const colHeightsRef = React.useRef({});

        return fields.reduce((acc, _, i) => {
            if (i % columns !== 0) return acc; // only start new row every n columns

            const rowFields = fields.slice(i, i + columns);
            const isSingle = rowFields.length === 1;

            acc.push(
                <View
                    key={i}
                    style={[
                        styles.row,
                        {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: verticalScale(10),
                        },
                    ]}
                >
                    {rowFields.map((field, idx) => (
                        <View
                            key={idx}
                            style={{
                                flex: isSingle ? 1 : 1 / columns,
                                paddingHorizontal: spacing / 2,
                            }}
                            onLayout={(e) => {
                                const height = e.nativeEvent.layout.height;
                                const key = `${i}-${idx}`;
                                colHeightsRef.current[key] = height;
                            }}
                        >
                            {field}
                        </View>
                    ))}

                    {/* Fill empty slot if columns are not full */}
                    {!isSingle &&
                        rowFields.length < columns &&
                        Array(columns - rowFields.length)
                            .fill(null)
                            .map((_, idx) => (
                                <View
                                    key={`empty-${i}-${idx}`}
                                    style={{
                                        flex: 1 / columns,
                                        paddingHorizontal: spacing / 2,
                                    }}
                                />
                            ))}
                </View>
            );

            return acc;
        }, []);
    };


    const formatNumberWithCommas = (num) => {
        if (!num) return '0';
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };
    const dropdownOptions = Vvapplicantypes.map(item => ({
        label: item.type, // what user sees
        value: item.id,   // what you store or send
    }));


    const formConfig = useMemo(
        () => [
            {
                title: 'Applicant Details',
                fields: [
                    {
                        type: 'dropdown',
                        label: 'Applicant Type',
                        options: dropdownOptions,
                        selectedValue: selectedApplicantType,
                        onChange: handleDropdownChange,
                        placeholder: 'Select Applicant Type',
                        disabled: !isEditable,
                    },
                    {
                        label: 'Applicant Name',
                        value: fullName || 'N/A',
                        editable: false,
                        multiline: false, // 👈 single-line
                    },
                ],
            },
            {
                title: 'Verification Summary',
                fields: [
                    {
                        label: 'List of Verification',
                        value: VVListOfVerification || 'N/A',
                        editable: false,
                        multiline: true, // 👈 expandable if text can be long
                    },
                    {
                        label: 'Waiver Reason',
                        value: selectedWaiverReasons || 'N/A',
                        editable: false,
                        multiline: true, // 👈 also can expand
                    },
                ],
            },
            {
                title: 'Verification Decision',
                fields: [
                    {
                        type: 'dropdown',
                        label: 'Decision',
                        options: decisionOptions,
                        selectedValue: selectedDecision,
                        onChange: handleDecision,
                        placeholder: 'Select Decision',
                        disabled: !isEditable,
                    },
                    {
                        label: 'Remark',
                        value: remark,
                        onChange: setremark,
                        editable: !!isEditable,
                        placeholder: 'Enter Remark',
                        multiline: true, // 👈 remark should expand naturally
                    },
                ],
            },
        ],
        [
            item,
            aaplicantName,
            applicationByid,
            VVListOfVerification,
            selectedWaiverReasons,
            decisionOptions,
            selectedDecision,
            remark,
            isEditable,
        ]
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

    // inside your component
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
                                ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName.individualApplicant?.middlename || ""} ${aaplicantName.individualApplicant.lastName || ""}`.trim()
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
                {formConfig.map((section, sIndex) => {
                    // 1️⃣ Map through each section’s fields
                    const renderedFields = section.fields.map((field, fIndex) => {
                        // 🟣 Dropdown field
                        if (field.type === 'dropdown') {
                            return (
                                <RenderDropdownField
                                    key={`${sIndex}-${fIndex}`}
                                    label={field.label}
                                    data={field.options || []}
                                    value={field.selectedValue}
                                    onChange={field.onChange}
                                    placeholder={field.placeholder || ''}
                                    isEditable={!field.disabled}
                                    enableSearch={field.enableSearch || false}
                                />
                            );
                        }

                        // 🔵 Default text field
                        return (
                            <RenderTextField
                                key={`${sIndex}-${fIndex}`}
                                label={field.label}
                                value={field.value || ''}
                                onChange={field.onChange}
                                editable={field.editable ?? false}
                                placeholder={field.placeholder || ''}
                                keyboardType={field.keyboardType || 'default'}
                                required={field.required ?? false}
                                multiline={field.multiline ?? false}
                            />
                        );
                    });

                    // 2️⃣ Render section
                    return (
                        <VerificationSection key={sIndex} title={section.title}>
                            {section.title === 'Applicant Details'
                                ? renderedFields // render normally for Applicant Details
                                : renderRows(renderedFields, 2, 10)}
                        </VerificationSection>
                    );
                })}

                {residid.status === 'Pending' && (
                    <View style={styles.saveSection}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#4CAF50" />
                        ) : (
                            <>
                                {renderButton('Save', handlesave, loading)}
                            </>
                        )}

                        {showSubmitButton && (
                            <View style={styles.submitWrapper}>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#4CAF50" />
                                ) : (
                                    <>
                                        {renderButton('Submit', handleSubmit, loading, '#4CAF50')}
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );

};

export default VerificationWaiverProcess;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        // marginBottom: 50,
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
        alignItems: 'flex-start', // ✅ top alignment fixes text cutoff
    },
    formGroup: {
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
        marginVertical: 5
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007BFFBB',
        marginBottom: 16,
    },
    dropdown: {
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
        padding: 6,
        width: width * 0.91,
    },
    dropdown1: {
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
        padding: 6,
        width: width * 0.86,
    },
    dropdown2: {
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
        padding: 6,
        width: width * 0.86,
    },
    dropdown11: {
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
        padding: 6,
        width: width * 0.88,
    },
    placeholderStyle: {
        color: 'black',
    },
    dropdownItem: {
        padding: 10,
        backgroundColor: '#fff',
    },

    dropdownItemText: {
        color: 'black',
    },
    icon: {
        width: 20, // Adjust the width of the icon
        height: 20, // Adjust the height of the icon
        marginLeft: 10, // Add space between the TextInput and icon
    },
    button: {
        // Your button style here
        flexDirection: 'row', // Align TextInput and Image horizontally
        alignItems: 'center', // Center the items vertically
        borderWidth: 1,
        borderColor: '#ccc'
    },


    dropdown1: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 8,
        fontSize: 12,
        backgroundColor: '#f9f9f9',
        color: 'black',
        width: width * 0.4,
        height: height * 0.04,
    },

    placeholderStyle: {
        color: 'black',
        fontSize: 10,
    },

    dropdownItem: {
        padding: 10,
        backgroundColor: '#fff',
    },

    dropdownItemText: {
        color: '#000',
    },
    verificationContainer: {
        marginVertical: 10,
        width: '48%', // Adjusts width to make space for other elements in row
    },
    textField: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
        color: '#333',
        minHeight: 40,
        textAlignVertical: 'center',
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: 'black',
        backgroundColor: '#fff',
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
    buttonSection: {
        marginTop: 10,
        marginBottom: 40,
    },
    button: {
        borderRadius: 8,
        padding: 12,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
