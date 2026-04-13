import React, { useState, useCallback, useContext, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, StyleSheet, Image, Dimensions, RefreshControl, Platform, ToastAndroid, TouchableOpacity, Alert, FlatList, Switch, Modal, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { Button, Divider, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import Card from '../Component/Card'
import { useSelector } from 'react-redux';

import FormField from '../Component/Field.js';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from '@expo/vector-icons';
import DateOfBirthInput from '../Component/DOB.js';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
// import { useSelector } from 'react-redux';
import CustomInput from '../Component/CustomInput.js';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import { DrawerContext } from '../../../../Drawer/DrawerContext.js';
import LinearGradient from 'react-native-linear-gradient';
const { width, height } = Dimensions.get('window');


const Lead = ({ route }) => {
    // If you passed selectedLeadfromtab || applicant and applicant together:
    const { selectedLeadfromtab, applicant } = route.params || {};


    const mkc = useSelector((state) => state.auth.losuserDetails);

    const [Pincode, setPincode] = useState([]);
    const [coPincode, setcoPincode] = useState([]);
    const [selectedCoApplicant, setSelectedCoApplicant] = useState(null);
    const [SelectedLeadApplicant, setSelectedLeadApplicant] = useState([]);
    const [IsLoadingLeads, setIsLoadingLeads] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { navigate, addListener } = useNavigation();
    const token = useSelector((state) => state.auth.token);
    const { openDrawer } = useContext(DrawerContext);

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
    const [activeTabView, setActiveTabView] = useState('Applicant');
    const [leadByLeadiD, setleadByLeadiD] = useState([])
    const [showAllLeads, setShowAllLeads] = useState(false);
    const [leadID, setleadID] = useState([])
    const [refreshing, setrefreshing] = useState(false);
    const [deviationApplicant, setdeviationApplicant] = useState([]);
    const [deviationCoApplicant, setdeviationCoApplicant] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectReason, setrejectReason] = useState([]);
    // 

    const [downloadCibilReportCoApplicant, setDownloadCibilReportCoApplicant] = useState(null);
    const [downloadCibilReportApplicant, setDownloadCibilReportApplicant] = useState(null);
    const [leads, setLeads] = useState([]);
    const [finalApplication, setfinalApplication] = useState([]);
    const [matchedLeads, setmatchedLeads] = useState([]);
    const userDetails = useSelector((state) => state.auth.losuserDetails);
    console.log(leads, 'leadsleadsleads')

    // 

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
    const formatNumberWithCommas = (num) => {
        if (!num) return '0';
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
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

                        // 
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
                            Comment: item.comment || '',
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

            // 

            setDeviationState(formattedData);
        } catch (error) {
            console.error('Error fetching deviations:', error?.response?.data || error.message);
            Alert.alert('Error', 'Something went wrong while fetching deviations.');
        }
    }, []);
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


    const formtime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString(); // Converts to a string like "MM/DD/YYYY, HH:MM:SS AM/PM"
    };



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

    useEffect(() => {
        // Handle both applicants in one useEffect to avoid redundancy
        if (selectedCoApplicant?.pincodeId) {
            fetchApplicantDataByPincode(selectedCoApplicant.pincodeId, setcoFindApplicantByCategoryCodView);
        }
        if (SelectedLeadApplicant?.pincodeId) {
            fetchApplicantDataByPincode(SelectedLeadApplicant.pincodeId, setFindApplicantByCategoryCodView);
        }
    }, [SelectedLeadApplicant?.pincodeId, selectedCoApplicant?.pincodeId, fetchApplicantDataByPincode]);




    const onRefresh = useCallback(async () => {
        setrefreshing(true);
        try {
            await getAllLeads(); // Wait for the worklist to be fetched
            await fetchData();
        } catch (error) {
            console.error("Failed to refresh worklist:", error);
        } finally {
            setrefreshing(false); // Ensure refreshing is turned off
        }
    }, []);

    const getAllLeads = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getLeads`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            const allLeads = response.data.data

            // Filter leads into two groups: with and without loan amount
            const leadsWithAmount = allLeads.filter(lead => lead.loanAmount > 0);
            // const leadsWithAmount = allLeads.filter(lead => {
            //     const hasCoApplicant = allLeads.some(
            //         coApp => coApp.leadId === lead.leadId && coApp.applicantTypeCode === 'Co-Applicant'
            //     );

            //     return (
            //         (lead.loanAmount <= 0 || lead.loanAmount === null || lead.loanAmount === undefined) &&

            //         hasCoApplicant
            //     );
            // });

            const leadsWithoutAmount = allLeads.filter(
                lead => lead.loanAmount <= 0 || lead.loanAmount === null || lead.loanAmount === undefined
            );

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
            // const leadsData = leadsResponse?.data?.data?.filter(
            //     (lead) => lead.applicantTypeCode === 'Applicant'
            // ) || [];
            // // Update states
            // setLeads(leadsData);
            setAllLoeds(leadsWithAmount);
            setLeadsWithLoanAmount(leadsWithoutAmount);
            setGroupedLeadsById(groupedLeadsArray); // Assuming `setGroupedLeadsById` is the state setter




        } catch (error) {
            console.error('Error fetching leads:', error);
            Alert.alert('Error', 'Failed to fetch leads');
        }
    };

    const fetchData = async () => {
        // setIsLoading(true); // Start loading indicator

        try {
            // Step 1: Fetch Leads
            const leadsResponse = await axios.get(`${BASE_URL}getLeads`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const leadsData = leadsResponse?.data?.data?.filter(
                (lead) => lead.applicantTypeCode === 'Applicant'
            ) || [];

            const allLeads = leadsResponse?.data?.data
            const applicantLeads = allLeads.filter(
                lead =>
                    // lead.loanAmount !== null &&
                    // lead.loanAmount !== undefined &&
                    // !isNaN(Number(lead.loanAmount)) &&
                    // lead.loanAmount > 0 &&
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
            setLeads(filteredLeadsAll);


            if (!Array.isArray(leadsData) || leadsData.length === 0) {

                // Alert.alert('No Data', 'No leads found.');
                // setIsLoading(false);
                return;
            }

            // Step 2: Fetch Applications
            const applicationsResponse = await axios.get(`${BASE_URL}getAllApplication`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            let applicationsData = applicationsResponse?.data?.data;

            // Ensure applicationsData is always an array
            if (!Array.isArray(applicationsData)) {
                applicationsData = [];
            }

            if (applicationsData.length === 0) {

                // Alert.alert('No Data', 'No applications found.');
                // setIsLoading(false);
                return;
            }




            await getLogsDetailsByApplicationNumber(applicationsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load data. Please try again.');
        } finally {
            // setIsLoading(false); // Stop loading indicator
            // setIsRefreshing(false); // Stop refreshing
        }
    };

    const getLogsDetailsByApplicationNumber = async (applications) => {
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


            // Filter logs to only include those created by the logged-in user
            const userLogs = logsData.filter(log => log.user === mkc.userName);
            const userAppNumbers = new Set(userLogs.map(log => log.applicationNumber));

            // Filter logs where applicationNumber matches any from userLogs
            const forlead = logsData.filter(k => userAppNumbers.has(k.applicationNumber));

            const filteredLeadSales = forlead.filter(log =>
                log.description === "Application Generated"
            );
            const filteredLeadCredit = [];
            const seenApplicationNumbers = new Set();

            // Step 1: Collect all applicationNumbers that have status "Disbursed"
            const disbursedApplicationNumbers = new Set();
            forlead.forEach(log => {
                if (log.status === "Disbursed") {
                    disbursedApplicationNumbers.add(log.applicationNumber);
                }
            });

            // Step 2: Filter out logs whose applicationNumber exists in the disbursed set
            forlead.forEach(log => {
                if (
                    log.user === mkc.userName &&
                    !disbursedApplicationNumbers.has(log.applicationNumber) && // Exclude disbursed cases
                    !seenApplicationNumbers.has(log.applicationNumber) // Avoid duplicates
                ) {
                    seenApplicationNumbers.add(log.applicationNumber);
                    filteredLeadCredit.push(log);
                }
            });



            // Initialize filteredLeadCreditDisbursedCases before use
            const filteredLeadCreditDisbursedCases = [];
            const seenApplicationNumbersDisbursedCase = new Set();

            forlead.forEach(log => {
                if (log.status === "Disbursed" && !seenApplicationNumbersDisbursedCase.has(log.applicationNumber)) {
                    seenApplicationNumbersDisbursedCase.add(log.applicationNumber);
                    filteredLeadCreditDisbursedCases.push(log);
                }
            });

            const filteredLeadCreditRejectedCases = [];
            const seenApplicationNumbersRejectedCase = new Set();

            forlead.forEach(log => {
                if (log.status === "Rejected" && !seenApplicationNumbersRejectedCase.has(log.applicationNumber)) {
                    seenApplicationNumbersRejectedCase.add(log.applicationNumber);
                    filteredLeadCreditRejectedCases.push(log);
                }
            });

            const matchedLeadSales = filteredLeadSales.filter(salesLog =>
            // If filteredLeadCreditDisbursedCases is not empty, use it, otherwise use filteredLeadCredit
            (filteredLeadCreditDisbursedCases.length > 0
                ? filteredLeadCreditDisbursedCases.some(disbursedLog => disbursedLog.applicationNumber === salesLog.applicationNumber)
                : filteredLeadCredit.some(creditLog => creditLog.applicationNumber === salesLog.applicationNumber)
            )
            );

            const LBC = filteredLeadSales.filter(salesLog =>
            // If filteredLeadCreditDisbursedCases is not empty, use it, otherwise use filteredLeadCredit
            (filteredLeadCreditDisbursedCases.length > 0
                //  filteredLeadCreditDisbursedCases.some(disbursedLog => disbursedLog.applicationNumber === salesLog.applicationNumber)
                ? filteredLeadSales.some(creditLog => creditLog.applicationNumber === salesLog.applicationNumber) : ''
            )
            );

            // Optimized lookup using Set
            const matchingAppNumbers = new Set(userLogs.map(log => log.applicationNumber));


            // Filter applications based on the user's logs
            const filteredApplications = applications.filter(item =>
                matchingAppNumbers.has(item.applicationNo)
            );

            const disbursedcasedata = applications.filter(item =>
                matchingAppNumbers.has(item.applicationNo) &&
                item.stage === "Disbursed"
            );


            const filteredApplicationsCredit = applications.filter(item =>
                matchingAppNumbers.has(item.applicationNo) &&
                item.stage !== "Disbursed" &&
                item.stage !== "Rejected"
                // item.stage !== "DDE"
            );


            // Further filter Disbursed and Rejected cases based on the same user
            const DisbursedCases = filteredApplications.filter(item => item.stage === "Disbursed")
            const RejectedCases = filteredApplications.filter(item => item.stage === "Rejected")















            // const matchedLeads = leads.filter(lead =>
            //   new Set(forSales.map(sale => sale.applicationNumber)).has(lead.appId)
            // );
            // 
            //   setForSales(matchedLeadSales);
            //   setForCredit(filteredLeadCredit);
            //   // setmatchedLeads(matchedLeads);
            //   setRejectedCase(RejectedCases);
            //   // setDisbursedCase(filteredLeadCreditDisbursedCases);
            //   setDisbursedCase(disbursedcasedata)
            setfinalApplication(filteredApplications);
            //   setfinalApplicationCredit(filteredApplicationsCredit);




        } catch (error) {
            console.error('Error fetching logs details:', error.message || error);
        }
    };



    useEffect(() => {
        if (finalApplication.length > 0 && leads.length > 0) {
            const matched = leads.filter(lead =>
                new Set(finalApplication.map(sale => sale.applicationNo)).has(lead.appId)
            );

            setmatchedLeads(matched);
        }
    }, [finalApplication, leads]); // Re-run when forSales or leads change


    useFocusEffect(
        React.useCallback(() => {
            getAllLeads();
            fetchData();
        }, []) // Empty dependency array to ensure this runs every time the screen is focused
    );

    const [expandedItem, setExpandedItem] = useState(null);

    // Toggle expanded state for the card
    const toggleExpand = (itemId) => {
        // If the same card is clicked again, collapse it, otherwise expand the new card
        setExpandedItem(prevState => prevState === itemId ? null : itemId);
    };
    const handleCardPress = (item) => {
        //   // Log before setting state
        setSelectedLead(item);  // Set selected lead
        setIsLoadingLeads(true);
        setModalVisible(true);  // Show modal
    };

    useEffect(() => {
        if (selectedLead) {
            const fetchLeadDetails = async (leadId) => {
                try {
                    const response = await axios.get(`${BASE_URL}getLeadByLeadId/${leadId}`,
                        {
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + token,
                            },
                        },
                    );
                    const lead = response.data.data
                    // 
                    setleadByLeadiD(lead);
                    // Handle the response (e.g., show modal, update state, etc.)
                } catch (error) {
                    console.error('Error fetching lead details:', error);
                }
            };

            // Trigger the API call with leadId
            fetchLeadDetails(selectedLead.leadId);
        }
    }, [selectedLead]); // This will trigger whenever selectedLead changes

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
            // 

            // Initialize variables to hold Applicant and Co-Applicant data
            let applicant = null;
            let coApplicant = null;

            // Loop through the array and separate Applicant and Co-Applicant
            leadByLeadiD.forEach((person) => {
                if (person.applicantTypeCode === 'Applicant') {
                    applicant = person;
                } else if (person.applicantTypeCode === 'Co-Applicant') {
                    coApplicant = person;
                }
            });

            // 
            // 

            // Set the appropriate state based on applicant type
            if (applicant) {
                setSelectedLeadApplicant(applicant);  // Set Applicant if available
                setIsLoadingLeads(false)
            }

            if (coApplicant) {
                setSelectedCoApplicant(coApplicant); // Set Co-Applicant if available
            }
        }
    }, [leadByLeadiD]);
    const filteredData = AllLoads.filter((item) => {
        const searchTerm = searchQuery.toLowerCase();

        return item?.applicantTypeCode === "Applicant" && (
            (item?.firstName?.toLowerCase().includes(searchTerm)) ||
            (item?.lastName?.toLowerCase().includes(searchTerm)) ||
            (item?.leadStatus?.leadStatusName?.toLowerCase().includes(searchTerm)) ||
            (item?.pan?.toLowerCase().includes(searchTerm)) ||
            (item?.mobileNo?.toLowerCase().includes(searchTerm)) ||
            (item?.gender?.toLowerCase().includes(searchTerm)) ||
            (item?.leadId?.toLowerCase().includes(searchTerm))
            // You can add more conditions here, e.g., for dateOfBirth or other properties.
        );
    });

    // 

    // const filteredData = (showAllLeads ? AllLoads : leadsWithLoanAmount)
    // .filter((item) => item?.applicantTypeCode === "Applicant")


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



    const handleClose = () => {
        setModalVisible(false);  // Close the modal
        setSelectedCoApplicant([]);
        setSelectedLeadApplicant([]);
        setdeviationCoApplicant([]);
        setdeviationApplicant([]);
        setFindApplicantByCategoryCodView([]);
        setcoFindApplicantByCategoryCodView([]);
        setIsLoadingLeads(false);
        getAllLeads();
        fetchData();
        setActiveTabView('Applicant')
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    useEffect(() => {
        fetchRejectReasons();
    }, [])

    const fetchRejectReasons = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllRejectReason`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            });

            const fetchedRejectReasons = response.data.data.content.map((reason) => ({
                label: reason.rejectReasonName,
                value: reason.rejectReasonId,
            }));

            setrejectReason(fetchedRejectReasons);
        } catch (error) {
            console.error('Error fetching reject reasons:', error);
        }
    };


    const [reasonsLabels, setReasonsLabels] = useState([]); // To store the extracted labels

    useEffect(() => {
        // Function to extract labels based on rejectReason id
        // 
        const extractLabels = () => {
            const labels = deviationApplicant.map((applicant) => {
                const matchedRejectReason = rejectReason.find((reason) => {
                    const applicantReason = Number(applicant.rejectReason);  // Convert to number
                    const reasonValue = Number(reason.value);  // Ensure reason.value is a number
                    // 
                    return applicantReason === reasonValue;
                });


                // 
                // 
                // If a match is found, return the label; otherwise, return null or some default value
                return matchedRejectReason ? matchedRejectReason.label : null;
            });

            // Update state with the extracted labels
            setReasonsLabels(labels);
        };

        // Run the extraction when either rejectReason or deviationApplicant changes
        extractLabels();
    }, [rejectReason, deviationApplicant]);


    useEffect(() => {
        // Check if selectedLeadfromtab || applicant is defined
        if (selectedLeadfromtab || applicant) {
            handleCardPress(selectedLeadfromtab || applicant); // Trigger handleCardPress if data exists
        } else {
            // Handle case where selectedLeadfromtab || applicant is undefined or empty

        }
    }, [selectedLeadfromtab || applicant]);


    const renderRows = (fields, customColumns, baseSpacing = 10) => {
        if (!fields || fields.length === 0) return null;

        const isSmallDevice = width < 380;
        const isTablet = width > 768;

        // 🧩 Adaptive layout configuration
        const columns = customColumns || (isTablet ? 3 : isSmallDevice ? 1 : 2);

        // 🧩 Dynamic spacing for smaller devices
        const spacing = isSmallDevice ? baseSpacing * 0.4 : baseSpacing * 0.8;
        const rowGap = isSmallDevice ? baseSpacing * 0.35 : baseSpacing * 0.6;

        const rows = [];

        for (let i = 0; i < fields.length; i += columns) {
            const chunk = fields.slice(i, i + columns);
            const emptyCount = columns - chunk.length;

            rows.push(
                <View key={i} style={[styles.row, { marginBottom: rowGap }]}>
                    {chunk.map((field, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.cell,
                                {
                                    paddingHorizontal: spacing / 2,
                                    flex: 1 / columns,
                                },
                            ]}
                        >
                            {field}
                        </View>
                    ))}

                    {/* Fill empty columns for alignment */}
                    {Array.from({ length: emptyCount }).map((_, idx) => (
                        <View
                            key={`empty-${idx}`}
                            style={{
                                flex: 1 / columns,
                                paddingHorizontal: spacing / 2,
                            }}
                        />
                    ))}
                </View>
            );
        }

        return rows;
    };


    // Section wrapper with bordered design
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
    const DynamicFields = ({ fields, columns = 2 }) => {

        // Fields that should ALWAYS use multiline
        const MULTILINE_FIELDS = [
            "Email",
            "Address",
            "Organization Name",
            "Contact Person",
            "Designation",
            "Description",
        ];

        const renderedFields = fields
            .map(f => {
                if (!f.value) return null;

                // AUTO multiline condition
                const isMultiline =
                    MULTILINE_FIELDS.includes(f.label) ||
                    String(f.value).length > 28; // ⭐ auto-multiline if text is long

                if (f.extra) {
                    return (
                        <View
                            key={f.label}
                            style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}
                        >
                            <CustomInput
                                label={f.label}
                                value={String(f.value)}
                                setValue={() => { }}
                                editable={false}
                                multiline={isMultiline}
                                isVerified={f.verified || false}
                            />

                            {f.extra(handleDownloadCibilFile)}
                        </View>
                    );
                }

                return (
                    <CustomInput
                        key={f.label}
                        label={f.label}
                        value={String(f.value)}
                        setValue={() => { }}
                        editable={false}
                        multiline={isMultiline}
                        isVerified={f.verified || false}
                    />
                );
            })
            .filter(Boolean);

        return renderRows(renderedFields, columns);
    };



    // Basic Info Section
    const BasicInfoSection = ({ applicant }) => {
        const fieldsData = [
            { label: "Name", value: applicant.firstName || applicant.lastName ? `${applicant.firstName || ''} ${applicant.middleName || ''} ${applicant.lastName || ''}`.trim() : null },
            { label: "Organization Name", value: applicant.organizationName },
            { label: applicant.organizationName ? "Incorporation Date" : "Date of Birth", value: formatDate(applicant.dateOfBirth) },
            ...(applicant.applicantCategoryCode === "Organization" ? [
                { label: "Organization Type", value: applicant.organizationType },
                { label: "Registration Number", value: applicant.registrationNumber },
                { label: "CIN Number", value: applicant.cin },
                { label: "Industry Type", value: applicant.industryType },
                { label: "Segment Type", value: applicant.segmentType },
                { label: "Contact Person", value: applicant.contactPersonName },
                { label: "Designation", value: applicant.contactPersonDesignation },

            ] : []),
            {
                label: applicant?.applicantCategoryCode === "Organization"
                    ? "Registration Type"
                    : "Primary Occupation",
                value: applicant?.primaryOccupation,
            },
            { label: "Mobile No", value: applicant.mobileNo, verified: applicant.isMobileVerified },
            { label: "Gender", value: applicant.gender },
            { label: "Email", value: applicant.email, verified: applicant.emailVerified },

        ];
        return <DynamicFields fields={fieldsData} />;
    };

    // KYC Section
    const KYCSection = ({ applicant }) => {
        const fieldsData = [
            { label: "PAN", value: applicant.pan, verified: applicant.isPanVerified },
            { label: "Aadhar", value: applicant.aadhar },
        ];
        return <DynamicFields fields={fieldsData} columns={2} />;
    };

    // Location Section
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

    // Lead Info Section
    const LeadInfoSection = ({ fields }) => <DynamicFields fields={fields} columns={2} />;

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
        {
            label: "Loan Amount",
            value: applicant?.loanAmount
                ? `₹ ${formatNumberWithCommas(applicant.loanAmount.toString())}`
                : "₹ 0"
        },

        { label: "Application Number", value: applicant?.appId },
        applicant?.convertedFromEnquiry !== undefined
            ? { label: "Converted From Enquiry", value: applicant?.convertedFromEnquiry ? "YES" : "NO" }
            : null,
        applicant?.enquiryId ? { label: "Enquiry ID", value: applicant?.enquiryId } : null,
        applicant?.rejectReason ? { label: "Reject Reason", value: applicant?.rejectReason } : null,
        cibilFiles?.length > 0
            ? {
                label: "Bureau File",
                value: cibilFiles.map(item => `\u2022 ${item.description}`).join("\n"),
                extra: (handleDownloadCibilFile) => (
                    <TouchableOpacity
                        style={styles.downloadbutton}
                        onPress={() => handleDownloadCibilFile(cibilFiles)}
                    >
                        <Image
                            source={require("../../asset/download.png")}
                            style={{ width: 24, height: 24, tintColor: "#FFFFFF" }}
                        />
                    </TouchableOpacity>
                )
            }
            : null,
    ].filter(Boolean);

    // Deviation Section
    const DeviationSection = ({ deviations }) => {
        if (!Array.isArray(deviations) || deviations.length === 0) return <Text style={styles.noDeviationText}>No deviations available</Text>;

        return deviations.map((item, index) => (
            <View key={index}>
                <View style={styles.row}>
                    {item.description && (
                        <CustomInput
                            label="Description"
                            value={item.description}
                            setValue={() => { }}
                            editable={false}
                            multiline={true}
                        />
                    )}
                    {item.lastModifiedTime && (
                        <CustomInput
                            label="Last Modified"
                            value={formtime(item.lastModifiedTime)}
                            setValue={() => { }}
                            editable={false}
                            multiline={true}
                        />
                    )}
                </View>

                <View style={styles.row}>
                    {item.approvedBy ? (
                        <CustomInput
                            label="Approved By"
                            value={item.approvedBy}
                            setValue={() => { }}
                            editable={false}
                        />
                    ) : item.rejectedBy ? (
                        <CustomInput
                            label="Rejected By"
                            value={item.rejectedBy}
                            setValue={() => { }}
                            editable={false}
                        />
                    ) : null}

                    {item.isApproved !== undefined && (
                        <CustomInput
                            label="Status"
                            value={item.isApproved ? "Approved" : "Pending"}
                            setValue={() => { }}
                            editable={false}
                        />
                    )}
                </View>

                <View style={styles.row}>
                    {item.deviationLog && (
                        <CustomInput
                            label="Deviation Log"
                            value={item.deviationLog}
                            setValue={() => { }}
                            editable={false}
                            multiline={true}
                        />
                    )}
                    {item.rejectReason && (
                        <CustomInput
                            label="Reject Reason"
                            value={item.rejectReason}
                            setValue={() => { }}
                            editable={false}
                            multiline={true}
                        />
                    )}
                </View>

            </View>
        ));
    };

    const renderTabContent = (tab) => {
        const data = tab === 'Applicant' ? SelectedLeadApplicant : selectedCoApplicant;
        const location = tab === 'Applicant' ? findApplicantByCategoryCodeview : cofindApplicantByCategoryCodView;
        const deviations = tab === 'Applicant' ? deviationApplicant : deviationCoApplicant;
        const downloadCibil = tab === 'Applicant' ? downloadCibilReportApplicant : downloadCibilReportCoApplicant;

        // if (!data || Object.keys(data).length === 0 || !location.data) {

        //     return (
        //         <View style={{ padding: 20, alignItems: 'center' }}>
        //             <ActivityIndicator size="small" color="#007bff" />
        //             <Text style={{ marginTop: 8, color: 'gray' }}>Loading...</Text>
        //         </View>
        //     );
        // }

        return (
            <>
                <Section
                    title={
                        data?.applicantCategoryCode === "Organization"
                            ? "Organization Detail"
                            : "Individual Detail"
                    }
                >
                    <BasicInfoSection applicant={data} />
                </Section>

                <Section title="KYC Detail">
                    <KYCSection applicant={data} />
                </Section>
                {/* {location?.data?.length > 0 && ( */}
                <Section title="Location Detail">
                    <LocationSection applicant={data} locationData={location?.data} />
                </Section>
                {/* )} */}

                <Section title="Lead Information">
                    {/* All standard fields */}
                    <LeadInfoSection
                        fields={leadFields(tab === 'Applicant' ? SelectedLeadApplicant : selectedCoApplicant)}
                    />

                    {downloadCibil?.length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={{ color: 'black', fontWeight: '500', fontSize: 12, marginBottom: 4 }}>
                                    Bureau File
                                </Text>
                                <TextInput
                                    style={{
                                        borderRadius: 5,
                                        fontSize: 12,
                                        backgroundColor: '#f9f9f9',
                                        color: 'black',
                                        padding: 6,
                                        fontWeight: 'bold',
                                        textAlignVertical: 'center',
                                        minHeight: 40,
                                    }}
                                    value={
                                        downloadCibil?.length > 0
                                            ? downloadCibil.map(item => `\u2022 ${item.description}`).join('\n')
                                            : 'N/A'
                                    }
                                    editable={false}
                                    multiline
                                    placeholder="N/A"
                                    placeholderTextColor="#aaa"
                                />
                            </View>

                            {downloadCibil?.length > 0 && (
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
                                        source={require('../../asset/download.png')}
                                        style={{ width: 20, height: 20, tintColor: '#fff' }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Medical Done toggle */}

                </Section>



                {deviations?.length > 0 && (
                    <Section title="Deviation">
                        <DeviationSection deviations={deviations} />
                    </Section>
                )}
            </>
        );
    };
    const onClose = () => {
        setModalVisible(false); // Hide the modal
    };

    // ✅ Memoize filtered leads (to avoid recalculating on every render)
    const filteredLeads = useMemo(() => {
        const term = searchQuery.toLowerCase();
        return leads?.filter((item) => {
            if (item?.applicantTypeCode !== "Applicant") return false;
            return (
                item?.firstName?.toLowerCase()?.includes(term) ||
                item?.lastName?.toLowerCase()?.includes(term) ||
                item?.leadStatus?.leadStatusName?.toLowerCase()?.includes(term) ||
                item?.pan?.toLowerCase()?.includes(term) ||
                item?.mobileNo?.toLowerCase()?.includes(term) ||
                item?.gender?.toLowerCase()?.includes(term) ||
                item?.leadId?.toString()?.includes(term)
            );
        });
    }, [leads, searchQuery]);

    // ✅ Stable renderItem (performance improvement)
    const renderItem = useCallback(
        ({ item, index }) => {
            const isRejected =
                item?.leadStage?.stageName?.toLowerCase() === "rejected" ||
                item?.leadStage?.toLowerCase() === "rejected" ||
                item?.leadStatus?.leadStatusName?.toLowerCase() === "rejected";

            const hasAppId = !!item?.appId;

            const cardStyle = [
                styles.cardBase,
                isRejected && { backgroundColor: "#F85050" },
                hasAppId && !isRejected && { backgroundColor: "#4CAF50" },
            ];

            return (
                <Card
                    item={item}
                    index={index}
                    handleCardPress={handleCardPress}
                    expandedItem={expandedItem}
                    toggleExpand={toggleExpand}
                    isExpanded={expandedItem === index}
                    style={cardStyle}
                    isRejected={isRejected}
                    hasAppId={hasAppId}
                />
            );
        },
        [expandedItem]
    );

    return (
        // <Provider>
        //     <SafeAreaView style={styles.safeContainer}>
        //         <StatusBar translucent backgroundColor="#2196F3" barStyle="light-content" />

        //         <View style={styles.container}>

        //             {/* HEADER */}
        //             <View style={styles.header}>
        //                 <TouchableOpacity onPress={openDrawer}>
        //                     <Image
        //                         source={require('../asset/icons/menus.png')}
        //                         style={styles.drawerIcon}
        //                     />
        //                 </TouchableOpacity>

        //                 <Text style={styles.headerTitle}>Lead Details</Text>
        //             </View>

        //             {/* SEARCH BAR */}
        // <View style={styles.searchRow}>
        //     <TextInput
        //         style={styles.searchBar}
        //         placeholder="Search..."
        //         placeholderTextColor="#888"
        //         value={searchQuery}
        //         onChangeText={handleSearch}
        //     />
        // </View>

        <Provider>
            <SafeAreaView style={styles.safeContainer}>
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

                {/* ▬▬▬ HEADER ▬▬▬ */}
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

                        <Text style={styles.headerTitle}>Lead Details</Text>

                        <View style={styles.headerAvatar}>
                            <Text style={styles.avatarText}>
                                {mkc.firstName[0]}
                                {mkc.lastName[0]}
                            </Text>
                        </View>


                    </View>
                    <View style={styles.searchRow}>
                        <TextInput
                            style={styles.searchBar}
                            placeholder="Search..."
                            placeholderTextColor="#FFFFFFFF"
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>
                </LinearGradient>
                {/* LEAD LIST */}
                <FlatList
                    data={filteredLeads}
                    keyExtractor={(item) => item.id?.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />

                {/* MODAL */}
                <Modal
                    visible={isModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={onClose}
                >
                    <View style={styles.overlay}>
                        <View style={styles.modalWrapper}>

                            {/* TAB SWITCHER */}
                            {/* <View style={styles.tabContainer}>
                                {["Applicant", ...(selectedCoApplicant ? ["Co-Applicant"] : [])]
                                    .map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            activeOpacity={0.8}
                                            style={[
                                                styles.tab,
                                                activeTabView === tab && styles.activeTab,
                                            ]}
                                            onPress={() => setActiveTabView(tab)}
                                        >
                                            <Text
                                                style={[
                                                    styles.tabText,
                                                    activeTabView === tab && styles.activeTabText,
                                                ]}
                                            >
                                                {tab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                            </View> */}
                            <View style={styles.tabContainer}>
                                {['Applicant', ...(selectedCoApplicant && Object.keys(selectedCoApplicant).length ? ['Co-Applicant'] : [])].map(
                                    (tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            activeOpacity={0.8}
                                            style={[
                                                styles.tab,
                                                activeTabView === tab && styles.activeTab,
                                            ]}
                                            onPress={() => setActiveTabView(tab)}
                                        >
                                            <Text
                                                style={[
                                                    styles.tabText,
                                                    activeTabView === tab && styles.activeTabText,
                                                ]}
                                            >
                                                {tab}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>

                            {/* MODAL BODY */}
                            {IsLoadingLeads ? (
                                <ActivityIndicator
                                    size="large"
                                    color="#007AFF"
                                    style={{ marginTop: 20 }}
                                />
                            ) : SelectedLeadApplicant ? (
                                <ScrollView
                                    contentContainerStyle={styles.scrollContent}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    {renderTabContent(activeTabView)}
                                </ScrollView>
                            ) : (
                                <Text style={styles.noLogText}>No applicant details available</Text>
                            )}

                            {/* FOOTER BUTTON */}
                            <View style={styles.buttonSection}>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleClose}
                                >
                                    <Text style={styles.closeText}>Close</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </Modal>
                {/* </View> */}
            </SafeAreaView>
        </Provider >
    );

};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        // backgroundColor: '#2196F3', // backgroundColor same as header for seamless look
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerWrapper: {
        paddingTop: StatusBar.currentHeight + 10,
        paddingBottom: 18,
        paddingHorizontal: 18,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
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
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(10),
    },
    searchBar: {
        flex: 1,
        height: verticalScale(40),
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: scale(8),
        paddingHorizontal: scale(10),
        fontSize: moderateScale(13),
        color: "#ffffffff",
    },
    list: {
        paddingBottom: verticalScale(100),
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalWrapper: {
        // width: width * 0.94,
        // maxHeight: height * 0.88,
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: moderateScale(14),
        // paddingVertical: verticalScale(12),
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        backgroundColor: "#E5E7EB",
        borderRadius: 10,
        marginVertical: verticalScale(10),
        paddingVertical: verticalScale(4),
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: verticalScale(10),
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: "#007AFF",
        shadowColor: "#007AFF",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        fontSize: moderateScale(13),
        color: "#333",
        fontWeight: "600",
    },
    activeTabText: {
        color: "#fff",
        fontWeight: "700",
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    cell: {
        minHeight: 48, // ✅ Ensures consistent visual row height
    },
    noLogText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 30,
        color: '#6B7280',
        fontWeight: '500',
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
    buttonSection: {
        alignItems: "center",
        marginTop: verticalScale(12),
    },
    cardBase: {
        borderRadius: 10,
        padding: 12,
        marginVertical: 6,
        marginHorizontal: 10,
        elevation: 3,
        backgroundColor: "#FFF",
    },
});

export default Lead;