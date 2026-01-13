import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
    Dimensions,
    useColorScheme,
    Keyboard, TouchableOpacity, TextInput, Text, Image, Modal, FlatList, RefreshControl, ActivityIndicator
} from 'react-native';
import { Divider, Provider, Button, } from 'react-native-paper';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../api/Endpoints';

const { height, width } = Dimensions.get('screen');

import DateOfBirthInput from '../Component/DOB.js';
import moment from 'moment';
import dayjs from 'dayjs';
import { useRoute } from '@react-navigation/native';
const renderInputField = (
    label,
    value,
    onChangeText,
    editable,
    placeholder,
    keyboardType = 'default',
    maxLength,
    fieldName,
    error
) => {
    const colorScheme = useColorScheme();
    const placeholderColor = colorScheme === 'dark' ? '#d3d3d3' : '#808080';

    return (
        <View style={styles.inputField}>
            <Text style={styles.labelformodal}>
                {label}
                <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                style={[
                    styles.inputformodal,
                    { borderColor: error ? 'red' : 'gray', borderWidth: 1 },
                ]}
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
            {error && (
                <Text style={styles.errorText}>
                    {error}
                </Text>
            )}
        </View>
    );

};
const EnquiryWorklist = () => {
    const route = useRoute();
    const { data, label } = route.params || { data: [], label: '' };
    // 
    const token = useSelector((state) => state.auth.token);
    const mkc = useSelector((state) => state.auth.losuserDetails);
    const [refreshing, setrefreshing] = useState(false);
    const [EnquiryData, setEnquiryData] = useState([]);
    const [ScheduleDetailsByEnquiry, setScheduleDetailsByEnquiry] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [ModalProceed, setModalProceed] = useState(false);
    const [selectedLead, setSelectedLead] = useState([]);
    const [SelectedLeadEnquiry, setSelectedLeadEnquiry] = useState([]);
    // 
    const [expandedItem, setExpandedItem] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(null); // ✅ Main scheduled datetime
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date()); // Used to combine date + time
    const [enquirystatus, setenquirystatus] = useState([]);
    const [Selectedenquirystatus, setSelectedenquirystatus] = useState('');
    // 
    const [Comments, setComments] = useState('');
    const [BusinessDate, setBusinessDate] = useState([]);
    const [dobError, setDobError] = useState(null);
    const handleDropdownEnquiryStatus = (item) => {
        setSelectedenquirystatus(item)
    }
    const [loadinglinkFromAPI, setLoadinglinkFromAPI] = useState(false);
    const [email, setemail] = useState('');
    const [pan, setPan] = useState('');
    const [aadhaarNo, setAadhaarNo] = useState('');
    const [dob, setDob] = useState('');
    const [selectedgenders, setSelectedgenders] = useState('');
    const [visible, setVisible] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [otpApplicant, setOtpApplicant] = useState(['', '', '', '']);  // 4 empty strings for Applicant OTP
    const [otpCoApplicant, setOtpCoApplicant] = useState(['', '', '', '']);  // 4 empty strings for Co-Applicant OTP
    const [isVerifyingOtpCoApplicant, setIsVerifyingOtpCoApplicant] = useState(false);
    const [isVerifyingOtpApplicant, setIsVerifyingOtpApplicant] = useState(false);
    const [isLoadingsendotp, setIsLoadingsentotp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [setselectedUsers, setsetselectedUsers] = useState([]);
    const [loading, setloading] = useState(false);
    const openModal = (type) => {
        setModalType(type);
        setVisible(true);
    };

    useEffect(() => {
        if (ScheduleDetailsByEnquiry.length > 0) {
            getAllEnquiryStatus();
            getAllEnquiry();
        }
    }, [ScheduleDetailsByEnquiry])
    const parseScheduleDate = (date) => {
        // If it's a string, try to parse it
        if (typeof date === 'string') {
            // Try parsing as "DD-MM-YYYY hh:mm A" (like 29-08-2025 04:35 PM)
            const parsed = dayjs(date, 'DD-MM-YYYY hh:mm A');
            if (parsed.isValid()) {
                return parsed.toISOString(); // or .format('YYYY-MM-DD HH:mm:ss') if needed
            }
        }

        // If it's already a Date object
        if (date instanceof Date && !isNaN(date)) {
            return dayjs(date).toISOString();
        }

        return null; // fallback
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
    const isOtpFilled = (modalType === 'applicant'
        ? otpApplicant.every((digit) => digit !== '')
        : otpCoApplicant.every((digit) => digit !== '')
    );

    const convertToAPIDateFormat = (dob) => {
        return moment(dob, 'DD-MM-YYYY').format('YYYY-MM-DD');
    };

    useEffect(() => {
        if (ScheduleDetailsByEnquiry && ScheduleDetailsByEnquiry.length > 0) {
            const firstItem = ScheduleDetailsByEnquiry[0];

            if (firstItem?.convenientTime) {
                setScheduleDate(moment(firstItem.convenientTime).format('DD-MM-YYYY hh:mm A')); // Set as Date object
            }

            if (firstItem?.enquiryStatus) {
                setSelectedenquirystatus(firstItem?.enquiryStatus); // Set as Date object
            }

            if (firstItem?.scheduledRemark) {
                setComments(firstItem.scheduledRemark);
            }
        }
    }, [ScheduleDetailsByEnquiry]);


    const handleverifyotp = async () => {
        setIsVerifyingOtpApplicant(true); // Set loading state for Verify button
        setIsLoadingsentotp(true); // Show loader on screen
        setloading(true);
        try {
            // Step 2: Verify OTP
            await verifyOtp();

            // setCoApplicantFields({
            //     loanAmount: loanAmount,
            //     primaryOccupation: SelectdLeadStatus.label,
            //     product: selectedProduct,
            //     portfolio: selectedLoanType,
            // });

            // Alert.alert('Success', 'OTP verified and process completed successfully.');
        } catch (error) {
            console.error('Error in API chain:', error);
            Alert.alert('Error', 'An error occurred during the process. Please try again.');
            setIsLoadingsentotp(false)
            setloading(false);
        }
    };

    const verifyOtp = async () => {
        const otpPayload = {
            mobileNumber: selectedLead.mobileNo,
            otp: otpApplicant.join(''),
            // id: SelectedLeadApplicant?.id,
        };
        setIsLoading(true);
        setLoadinglinkFromAPI(true);
        setloading(true);
        try {
            const otpResponse = await axios.post(
                `${BASE_URL}verifyOtpToMobileForEnquiry`,
                otpPayload,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    },
                }
            );

            // Log response for inspection

            if (otpResponse.data.msgKey === "Success") {
                setVisible(false);
                // setIsOtpVerified(true); // Set OTP verified to true
                // getpanDetails();
                onClose();
                setIsLoading(false);

                ConvertToLead();

            } else {
                onClose();
                setIsLoadingsentotp(false);
                setTimeout(() => {
                    openModal('applicant'); // Then, call the API after a short delay
                }, 10); // 300ms delay to ensure smooth transition
                setIsLoading(false);
                setLoadinglinkFromAPI(false);
                setloading(false);

                Alert.alert(otpResponse.data.msgKey, otpResponse.data.message);
            }
        } catch (error) {
            console.error('Error in API sequence:', error);
            Alert.alert('Error', 'An error occurred while processing your request.');
            //   onClose();
            //   setIsLoading(false);
            setIsLoadingsentotp(false);
            setLoadinglinkFromAPI(false);
            setloading(false);
            setTimeout(() => {
                openModal('applicant'); // Then, call the API after a short delay
            }, 10); // 300ms delay to ensure smooth transition
        }
    };
    const handleverifyotpCoApplicant = async () => {

    }

    const handleEraseField = () => {
        setScheduleDate('')
        setSelectedenquirystatus('')
        setComments('');
        setDob('');
        setPan('');
        setAadhaarNo('');
        setemail('');
        setSelectedgenders('');
        setSelectedLead([]);
        setDobError(null);
        setScheduleDetailsByEnquiry([]);
    }

    const handleAgeValidation = (dobValue) => {
        const validDob = moment(dobValue, 'DD-MM-YYYY', true); // Parse user input
        if (!validDob.isValid()) {
            setDobError('Invalid date format. Please enter a valid date.');
            return;
        }

        if (BusinessDate?.businnessDate) {
            // Convert BusinessDate array [YYYY, MM, DD] into a moment date
            const businessDate = moment(BusinessDate.businnessDate.join('-'), 'YYYY-MM-DD');

            // Check if selected DOB is greater than the business date
            if (validDob.isAfter(businessDate)) {
                setDobError(`Selected date cannot be greater than ${businessDate.format('DD-MM-YYYY')}`);
                return;
            }

            // Calculate age using businessDate as the reference
            const age = businessDate.diff(validDob, 'years');

            if (age < 21) {
                setDobError('You must be at least 21 years old.');
            } else if (age > 60) {
                setDobError('Age cannot be greater than 60.');
            } else {
                setDobError(''); // Clear the error if the age is valid
            }
        }
    };


    // 
    const [locationData, setLocationData] = useState({
        cityName: '',
        stateName: '',
        countryName: '',
        areaName: ''
    });


    useEffect(() => {
        if (selectedLead.id) {
            getScheduleDetailsByEnquiryId();
        }

    }, [selectedLead])


    const addEnquiryScheduleDetails = async () => {
        const payload = {
            convenientTime: scheduleDate ? parseScheduleDate(scheduleDate) : null,
            enquiryId: selectedLead?.id,
            enquiryStage: Selectedenquirystatus?.label,
            enquiryStatusId: Selectedenquirystatus?.value,
            isActive: true,
            scheduleDate: new Date(),
            scheduledRemark: Comments
        };
        setloading(true);
        setIsLoadingsentotp(true);
        try {
            //  const response = await axios.get(`${BASE_URL}getAllEnquiry`,

            const response = await axios.post(
                //   'http://192.168.1.174:9090/api/v1/addEnquiryScheduleDetails',
                `${BASE_URL}addEnquiryScheduleDetails`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // Add Authorization if needed:
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            // ✅ Success

            if (response.data.msgKey === "Success") {
                Alert.alert('Success', 'Schedule created successfully!');
                getAllEnquiry();
                setIsLoadingsentotp(false);
                getScheduleDetailsByEnquiryId();
                setloading(false);
            } else {
                setIsLoadingsentotp(false);
                setloading(false);
            }

        } catch (error) {
            console.error('API Error:', error);
            Alert.alert('Error', 'Failed to schedule enquiry');
            setIsLoadingsentotp(false);
            setloading(false);
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
        getAllEnquiry();
        getAllEnquiryStatus();
        getBusinessDate();
    }, [token])


    const getScheduleDetailsByEnquiryId = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getScheduleDetailsByEnquiryId/${selectedLead?.id}`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                }
            })

            if (response.data.data.length > 0) {
                const ScheduledEnquiry = response.data.data
                setScheduleDetailsByEnquiry(ScheduledEnquiry)
                getAllEnquiryStatus();
                getAllEnquiry();
            }



        } catch (error) {

        }
    }

    const getAllEnquiryStatus = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllEnquiryStatus`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const content = response.data?.data?.content || [];

            // ✅ Filter only "Scheduled" and "Rescheduled"
            let filtered = content.filter(
                p =>
                    p.enquiryStatusName?.trim()?.toLowerCase() === 'scheduled' ||
                    p.enquiryStatusName?.trim()?.toLowerCase() === 'rescheduled'
            );

            // ✅ Hide based on ScheduleDetailsByEnquiry length
            if (ScheduleDetailsByEnquiry.length === 0) {

                // No schedule data → hide "Rescheduled"
                filtered = filtered.filter(
                    p => p.enquiryStatusName?.trim()?.toLowerCase() !== 'rescheduled'
                );
            } else {
                // Has schedule data → hide "Scheduled"

                filtered = filtered.filter(
                    p => p.enquiryStatusName?.trim()?.toLowerCase() !== 'scheduled'
                );
            }

            const transformed = filtered.map(p => ({
                value: p.enquiryStatusId,
                label: p.enquiryStatusName
            }));

            setenquirystatus(transformed);
        } catch {
            Alert.alert('Error', 'Failed to load enquiry statuses');
        }
    }, [token, ScheduleDetailsByEnquiry]);



    const renderDropdown = (label, data, value, setValue, placeholder) => (
        <View style={styles.inputField}>
            <Text style={styles.labelformodal}>
                {label}
                <Text style={styles.required}>*</Text>
            </Text>
            <Dropdown
                data={data}
                labelField="label"
                valueField="value"
                value={value}
                placeholder={placeholder}
                onChange={setValue}
                search
                style={styles.dropdown1}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedText}
                inputSearchStyle={styles.searchInput}
                renderItem={(item) => (
                    <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>{item.label}</Text>
                    </View>
                )}
            />
        </View>
    );



    const renderInput = (label, value, isValid = null, editable = false, multiline = false) => (
        <View style={{ flex: 1, padding: 5, minWidth: '45%' }}>
            <Text style={styles.labelformodal}>
                {label}
                {isValid && (
                    <Image
                        source={require('../asset/greencheck.png')}
                        style={{ width: 10, height: 10, marginLeft: 5 }}
                    />
                )}
            </Text>

            <TextInput
                style={[
                    styles.inputformodal,
                    multiline && styles.inputMultiline,
                ]}
                value={value !== null && value !== undefined ? String(value) : ''}
                editable={editable}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    );


    const toggleSection = (sectionId) => {
        setExpandedItem(expandedItem === sectionId ? null : sectionId);
    };




    useEffect(() => {
        axios.get(`${BASE_URL}getUserWithManagerAndCeo/${mkc.userName}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        })
            .then(response => {


                const formatted = response.data.data
                    // Ensure fcmToken is not null, undefined, or empty string
                    .filter(user => user.fcmToken && user.fcmToken.trim() !== '')
                    .map(user => ({
                        label: `${user.firstName} ${user.lastName}`.trim() || user.userName,
                        value: user.userName,
                    }));

                setsetselectedUsers(formatted);
            })
            .catch(err => {
                console.error('Failed to fetch users:', err);
            });
    }, [mkc]);

    const handleSendNotification = async () => {
        if (setselectedUsers.length === 0) {
            Alert.alert('Validation', 'Please select at least one user');
            return;
        }
        setLoadinglinkFromAPI(true);
        setIsLoadingsentotp(true);
        try {
            const userNamesParam = setselectedUsers.map(user => user.value).join(',');
            const tokenResponse = await axios.get(
                `${BASE_URL}getFcmTokenByUserName?userNames=${userNamesParam}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const tokensObj = tokenResponse.data.data;
            const tokens = Object.values(tokensObj).filter(t => t);

            if (tokens.length === 0) {
                Alert.alert('Error', 'No valid FCM tokens found for selected users');
                return;
            }

            // Hardcoded title and body
            const payload = {
                title: "Scheduled Notification", // 🔒 hardcoded title
                body: "This is a reminder notification.", // 🔒 hardcoded body
                tokens,
                // scheduleTime: scheduleDate ? scheduleDate.toISOString() : null,
                scheduleTime: null,
                priority: 'HIGH',
                data: {
                    info: 'Custom data if needed',
                },
                userName: userNamesParam
            };

            const response = await axios.post(`${BASE_URL}notificationsSend`, payload, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                }

            });

            if (response.data.msgKey === "Success") {


                Alert.alert('Success', 'Notification sent successfully!');
                // setTitle('');
                // setBody('');
                // setSelectedUsers([]);
                setIsLoadingsentotp(false);
                setLoadinglinkFromAPI(false);
                setModalVisible(false);
                setModalProceed(false);
                handleEraseField();
                getAllEnquiry();
                setloading(false);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            Alert.alert('Error', 'Failed to send notification');
            setIsLoadingsentotp(false);
            setLoadinglinkFromAPI(false);
            setModalVisible(false);
            setModalProceed(false);
            handleEraseField();
            getAllEnquiry();
            setloading(false);
        }
    };



    const handCancelProceedModal = () => {
        setDob('');
        setPan('');
        setAadhaarNo('');
        setemail('');
        setSelectedgenders('');
        setModalProceed(false);
    }

    const onRefresh = useCallback(async () => {
        setrefreshing(true);
        try {
            await getAllEnquiry(); // Wait for the worklist to be fetched
        } catch (error) {
            console.error("Failed to refresh worklist:", error);
        } finally {
            setrefreshing(false); // Ensure refreshing is turned off
        }
    }, []);

    const getAllEnquiry = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllEnquiry`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                }
            });

            const allLeads = response.data.data;
            const updatedLead = allLeads.filter(val => val.enquiryStatus.enquiryStatusName !== 'Closed' && val.isConvertedToLead !== true)
            setEnquiryData(updatedLead)

        } catch (error) {
            console.error('Error fetching leads:', error);
            Alert.alert('Error', 'Failed to fetch leads');
        }
    };


    useEffect(() => {
        getLocationByPincode();
    }, [selectedLead?.pincode?.pincode]);

    const getLocationByPincode = useCallback(async () => {
        const pincodeToUse = selectedLead?.pincode?.pincode;

        if (!pincodeToUse) return;

        try {
            const response = await axios.get(`${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincodeToUse}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLocationData(response.data?.data || {});
        } catch {
            Alert.alert('Error', 'Failed to fetch location data');
        }
    }, [selectedLead, token]);

    const handleSearch = (text) => {
        setSearchQuery(text);
    };
    // Use data from params if available, else fall back to full EnquiryData
    const sourceData = data.length > 0 ? data : EnquiryData;

    const filteredData = sourceData.filter((item) => {
        if (!searchQuery) return true; // ✅ Show all items if there's no search

        const query = searchQuery.toLowerCase();

        return (
            item?.firstName?.toLowerCase().includes(query) ||
            item?.lastName?.toLowerCase().includes(query) ||
            item?.mobileNo?.toLowerCase().includes(query) ||
            item?.enquiryStatus?.enquiryStatusName?.toLowerCase().includes(query) ||
            item?.enquiryId?.toLowerCase().includes(query) ||
            item?.product?.productName?.toLowerCase().includes(query) ||
            item?.assignTo?.userName?.toLowerCase().includes(query) ||
            item?.cityName?.toLowerCase().includes(query)

            // || (item?.dateOfBirth && calculateAge(item.dateOfBirth) === parseInt(query))
        );
    });


    const [drawerVisible, setDrawerVisible] = useState(false);

    const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
    };


    const handleClose = () => {
        setModalVisible(false);
        setSelectedLead([]);
        setScheduleDetailsByEnquiry([]);
    }

    const handleCardPress = (item) => {
        //   // Log before setting state
        setSelectedLead(item);  // Set selected lead
        setModalVisible(true);  // Show modal
        // setActiveTabView('Applicant');
    };

    useEffect(() => {
        if (selectedLead?.id) {
            getEnquiry()
        }
    }, [selectedLead?.id])
    const getEnquiry = async () => {
        const response = await axios.get(`${BASE_URL}getEnquiry/${selectedLead?.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        const getenquiry = response.data.data
        setSelectedLeadEnquiry(getenquiry)
    }
    const LeadCard = ({ item }) => {
        const [expandedItem, setExpandedItem] = useState(null);
        const toggleExpand = (itemId) => {
            setExpandedItem(prevState => prevState === itemId ? null : itemId);
        };
        return (
            <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
                {/* Collapsed View */}

                <View style={styles.collapsedHeader}>
                    <View>
                        <Text style={styles.cardTitle}>
                            Lead Name: {item.firstName} {item.lastName}
                        </Text>
                        <Text style={styles.cardTitle}>
                            id: {item.enquiryId}
                        </Text>

                        {item?.enquiryStatus?.enquiryStatusName && (
                            <Text style={styles.cardTitle}>
                                EnquiryStatus:  <Text style={styles.cardText}>{item.enquiryStatus.enquiryStatusName} </Text>
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

                        {/* <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>EnquiryStatus:</Text>
                            <Text style={styles.cardValue}>{item?.enquiryStatus?.enquiryStatusName || 'N/A'}</Text>
                        </View> */}

                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>MobileNumber:</Text>
                            <Text style={styles.cardValue}>{item?.mobileNo || 'N/A'}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>product:</Text>
                            <Text style={styles.cardValue}>{item?.product?.productName || 'N/A'}</Text>
                        </View>

                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>City:</Text>
                            <Text style={styles.cardValue}>{item?.cityName || 'N/A'}</Text>
                        </View>


                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>Assigned To:</Text>
                            <Text style={styles.cardValue}>
                                {/* {item.assignTo?.firstName || ''} {item.assignTo?.lastName || 'N/A'} */}
                                {item.assignTo?.userName || 'N/A'}

                            </Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };




    const validateFields = () => {
        const missingFields = [];
        if (!scheduleDate) {
            missingFields.push('Please select a Schedule Date');
        }

        if (!Selectedenquirystatus) {
            missingFields.push('Please Select a Enquiry Status')
        }

        if (!Comments) {
            missingFields.push('Please Enter a Comment')
        }
        return missingFields.length ? missingFields : true;
    }

    const validateProceedFields = () => {
        const missingFields = [];
        if (!dob) {
            missingFields.push('Please select a Date of Birth');
        }

        if (!pan) {
            missingFields.push('Please Enter a PAN Number')
        }

        // if (!aadhaarNo) {
        //     missingFields.push('Please Enter a  Aadhar Number')
        // }

        if (!selectedgenders) {
            missingFields.push('Please Select a Gender')
        }

        if (!email) {
            missingFields.push('Please Enter a Email')
        }
        return missingFields.length ? missingFields : true;
    }

    const closeEnquiry = async () => {
        const payload = {
            isClosed: true
        }
        setloading(true);
        try {
            const response = await axios.put(
                `${BASE_URL}closeEnquiry/${selectedLead?.id}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // Add Authorization if needed:
                        Authorization: `Bearer ${token}`,
                    }
                }
            )

            if (response.data.msgKey === 'Success') {
                handleworklistmodal();
                setloading(false);
            } else {
                setloading(false);
            }



        } catch (error) {
            console.error('API Error:', error);
            setloading(false);
        }
    }
    const handleSchedule = async () => {

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

            // setIsSubmitting(true); // Set loading state to true
            setIsLoadingsentotp(true);

            // Step 1: Send OTP
            await addEnquiryScheduleDetails();
            // setVisible(true); // Show OTP Modal


        }
    }
    const handleCloseEnquiry = () => {
        Alert.alert(
            'Confirm Close',
            'Are you sure you want to close this enquiry?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Close',
                    onPress: () => {
                        closeEnquiry(); // Call your actual close function here
                        // handleworklistmodal();
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    const handleworklistmodal = () => {
        setModalVisible(false);
        handleEraseField();
        getAllEnquiry();
    }

    const handleProcessModal = () => {
        setModalProceed(true);
    }

    const sendOtpToMobileForEnquiry = async () => {
        setIsLoading(true);
        setloading(true);
        setIsLoadingsentotp(true);
        const payload = {
            mobileNo: selectedLead?.mobileNo,
        }

        try {
            const response = await axios.post(`${BASE_URL}sendOtpToMobileForEnquiry`,
                payload,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            )

            if (response.data.msgKey === 'Success') {
                openModal('applicant')
                setIsLoadingsentotp(false);
                setIsSubmitting(false);
                setIsLoading(false);
                setloading(false);
            } else {
                Alert.alert(response.data.msgKey, response.data.message);
                setIsSubmitting(false);
                setIsLoadingsentotp(false);
                setIsLoading(false);
                setloading(false);
            }
        } catch (error) {

            setIsLoadingsentotp(false);
            setIsLoading(false);
            setloading(false);
        }
    }

    const onClose = () => {
        setVisible(false);
        setOtpApplicant(['', '', '', ''])
    }

    const handleGenderChange = (item) => {
        setSelectedgenders(item.value); // Set the selected gender value
    };


    const renderInputt = useCallback(
        (
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
            isVerified = null,
        ) => {
            const colorScheme = useColorScheme(); // Detect theme
            const placeholderColor = colorScheme === 'dark' ? '#d3d3d3' : '#808080';

            // Using `useRef` to avoid unnecessary re-renders
            const errors = useRef({});

            // Handle Aadhaar validation in real-time
            const handleAadhaarValidation = (aadhaarValue) => {
                if (aadhaarValue.length > 0 && aadhaarValue.length !== 12) {
                    errors.current[fieldName] = 'Invalid Aadhaar number. Must be 12 digits.';
                } else {
                    delete errors.current[fieldName];
                }
            };

            // Determine the keyboard type dynamically for PAN
            const getKeyboardTypeForPan = (panValue) => {
                if (panValue.length < 5) {
                    return 'default'; // Alphabet for the first 5 characters
                }
                if (panValue.length >= 5 && panValue.length < 9) {
                    return 'numeric'; // Numeric for the next 4 characters
                }
                if (panValue.length === 10) {
                    return 'default'; // Alphabet for the last character (9th character)
                }
                return 'default'; // Return default keyboard
            };

            //   // Check if the value passed is correctly initialized
            //  // Ensure fieldName is not undefined

            const handleKeyboardDismiss = (newValue, isFieldPan) => {
                if (isFieldPan && newValue.length === 10) {
                    // Close the keyboard when the PAN length reaches 10
                    Keyboard.dismiss();
                } else if (isMobile && newValue.length === 10) {
                    // Close the keyboard when Mobile length reaches 10
                    Keyboard.dismiss();
                } else if (isAadhaar && newValue.length === 12) {
                    // Close the keyboard when Aadhaar length reaches 12
                    Keyboard.dismiss();
                }
            };

            return (
                <View style={{ flex: 1, paddingHorizontal: 5 }}>
                    <Text style={styles.labelformodal}>{label}<Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[
                            styles.inputformodal,
                            {
                                borderColor: errors.current && errors.current[fieldName] ? 'red' : 'gray',
                                borderWidth: 1,
                            },
                        ]}
                        value={value || ''}
                        onChangeText={(text) => {
                            let newValue = text;

                            if (isPan) {
                                newValue = newValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                            } else if (isMobile || isAadhaar) {
                                newValue = newValue.replace(/[^0-9]/g, '');
                            }

                            // Call the onChangeText prop with the modified value
                            onChangeText(newValue);

                            // Perform validation for Aadhaar number as user types
                            if (isAadhaar) {
                                handleAadhaarValidation(newValue);
                            }

                            // Call the function to handle keyboard dismissal
                            handleKeyboardDismiss(newValue, isPan);
                        }}
                        editable={editable}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderColor}
                        keyboardType={isPan ? getKeyboardTypeForPan(value) : isMobile || isAadhaar ? 'numeric' : 'default'}
                        maxLength={isPan ? 10 : isMobile ? 10 : isAadhaar ? 12 : undefined}
                        onSubmitEditing={() => {
                            if (isPan && value.length === 10) {
                                Keyboard.dismiss();
                            }
                        }}
                    />
                    {isVerified && (
                        <Image
                            source={require('../asset/greencheck.png')} // Update with your actual image path
                            style={styles.checkIcon}
                        />
                    )}
                    {errors.current && errors.current[fieldName] && (
                        <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
                            {errors.current[fieldName]}
                        </Text>
                    )}
                </View>
            );
        },
        [] // dependencies - errors are handled internally with refs
    );

    const ConvertToLead = async () => {
        const payload = {
            pincodeId: selectedLead?.pincode?.pincodeId,
            area: selectedLead?.pincode?.areaName,
            firstName: selectedLead?.firstName,
            middleName: selectedLead?.middleName,
            lastName: selectedLead?.lastName,
            mobileNo: selectedLead?.mobileNo,
            enquiryId: selectedLead?.id,
            product: selectedLead?.product?.productId,
            portfolio: selectedLead?.portfolio?.portfolioId,
            leadStage: "ConverteToLead",
            pan: pan,
            gender: selectedgenders,
            dateOfBirth: convertToAPIDateFormat(dob),
            email: email,
            aadhar: aadhaarNo,
            userId: mkc?.userId,
            isMobileVerified: true,
            createdBy: mkc?.userName,


        }

        try {
            const response = await axios.post(`${BASE_URL}convertToLead`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // Add Authorization if needed:
                        Authorization: `Bearer ${token}`,
                    }
                }
            )

            if (response.data.msgKey === 'Success') {
                handleSendNotification();
                setIsLoadingsentotp(false);
                setIsLoading(false);
                setLoadinglinkFromAPI(false);
            } else {
                setIsLoadingsentotp(false);
                setIsLoading(false);
                setLoadinglinkFromAPI(false);
                setloading(false);
            }
        } catch (error) {

            setIsLoadingsentotp(false);
            setIsLoading(false);
            setLoadinglinkFromAPI(false);
            setloading(false);

        }
    }

    const FullDetailModal = async () => {



        const residenceValidationResult = validateProceedFields();
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

            // setIsSubmitting(true); // Set loading state to true
            setIsLoadingsentotp(true);
            setloading(true);

            try {
                // Step 1: Send OTP
                await sendOtpToMobileForEnquiry();
                // setVisible(true); // Show OTP Modal

            } catch (error) {
                console.error('Error sending OTP:', error);
                Alert.alert('Error', 'Failed to send OTP. Please try again.');
            } finally {
                // setIsSubmitting(false); // Reset loading state
            }
        }
    }


    return (
        <Provider>
            <View style={styles.header}>
                <TouchableOpacity onPress={toggleDrawer}>
                    <Image source={require('../asset/icons/menus.png')} style={styles.drawerIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Enquiry WorkList</Text>
            </View>
            <View style={styles.firstrow}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search..."
                    placeholderTextColor={'#888'}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />


            </View>

            <FlatList
                // data={EnquiryData}
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <LeadCard item={item} />}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={<Text style={styles.emptyListText}>No data available</Text>}

            />

            <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.label}>
                            {modalType === 'applicant' ? 'OTP Verification Applicant' : 'OTP Verification Co-Applicant'}
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
                                            value={modalType === 'applicant' ? otpApplicant[index] : otpCoApplicant[index]}
                                            onChangeText={(text) => handleOtpChange(text, modalType, index)}
                                            keyboardType="numeric"
                                            maxLength={1}
                                            onKeyPress={({ nativeEvent }) => {
                                                if (nativeEvent.key === 'Backspace' && (modalType === 'applicant' ? otpApplicant[index] : otpCoApplicant[index]) === '') {
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
                                        style={[styles.submitButton, (!isOtpFilled || (modalType === 'applicant' ? isVerifyingOtpApplicant : isVerifyingOtpCoApplicant)) && styles.disabledButton]}
                                        onPress={modalType === 'applicant' ? handleverifyotp : handleverifyotpCoApplicant}
                                        disabled={!isOtpFilled
                                            // || (modalType === 'applicant' ? isVerifyingOtpApplicant : isVerifyingOtpCoApplicant)
                                        }
                                    >
                                        {(modalType === 'applicant' ? isVerifyingOtpApplicant : isVerifyingOtpCoApplicant) ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.submitText}>Verify</Text>
                                        )}
                                    </TouchableOpacity>

                                )}
                                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                    <Text style={styles.closeText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {isLoadingsendotp && (
                <Modal transparent={true} animationType="fade">
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                </Modal>
            )}

            <Modal transparent visible={loadinglinkFromAPI}>
                <View style={styles.loaderFullScreen}>
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#040675FF" />
                        <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                </View>
            </Modal>


            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainerdetail}>
                    <View style={styles.modalContentdetail}>
                        <View>
                            <ScrollView >
                                <TouchableOpacity onPress={() => toggleSection('basicInfo')} style={styles.headerCollap}>
                                    <Text style={styles.headerText}>Basic Information</Text>
                                    <View style={styles.headerTouchable}>
                                        <Text style={styles.arrowIcon}>
                                            {expandedItem === 'basicInfo' ? '▲' : '▼'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                {expandedItem === 'basicInfo' && (
                                    <View style={styles.contenttt}>
                                        <View style={styles.row}>
                                            {renderInput("First Name", `${selectedLead?.firstName} `, false)}
                                            {renderInput("Middle Name", `${selectedLead?.middleName} `, false)}
                                        </View>
                                        <View style={styles.row}>
                                            {renderInput("Last Name", `${selectedLead?.lastName}`, false)}
                                            {renderInput("Mobile No", `${selectedLead?.mobileNo}`, false)}
                                        </View>
                                    </View>
                                )}

                                <View style={styles.headerCollap}>
                                    <Text style={styles.headerText}>
                                        Address
                                    </Text>
                                    <TouchableOpacity onPress={() => toggleSection('address')} style={styles.headerTouchable}>
                                        <Text style={styles.arrowIcon}>
                                            {expandedItem === 'address' ? '▲' : '▼'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {expandedItem === 'address' && (
                                    <View style={styles.contenttt}>
                                        <View style={styles.row}>
                                            {renderInput("Pincode", `${selectedLead?.pincode?.pincode} `, false)}
                                            {renderInput("Area", `${selectedLead?.pincode?.areaName} `, false)}

                                        </View>
                                        <View style={styles.row}>
                                            {renderInput("City", locationData.cityName || 'N/A', false)}
                                            {renderInput("Country", locationData.countryName || 'N/A', false)}
                                        </View>

                                        <View style={styles.row}>
                                            {renderInput("State", locationData.stateName, false)}
                                        </View>

                                    </View>
                                )}

                                <View style={styles.headerCollap}>
                                    <Text style={styles.headerText}>
                                        Loan Enquiry
                                    </Text>
                                    <TouchableOpacity onPress={() => toggleSection('loanenquiry')} style={styles.headerTouchable}>
                                        <Text style={styles.arrowIcon}>
                                            {expandedItem === 'loanenquiry' ? '▲' : '▼'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {expandedItem === 'loanenquiry' && (
                                    <View style={styles.contenttt}>
                                        <View style={styles.row}>
                                            {renderInput("Portfolio", `${selectedLead?.portfolio?.portfolioDescription} `, false)}
                                            {renderInput("Product", `${selectedLead?.product?.productName} `, false)}
                                        </View>

                                        <View style={styles.row}>

                                            {renderInput("Enquiry ID", `${selectedLead?.enquiryId} `, false)}

                                        </View>
                                    </View>
                                )}

                                {ScheduleDetailsByEnquiry.length > 0 && (
                                    <View style={styles.collapsibleContainer}>
                                        <TouchableOpacity
                                            onPress={() => toggleSection('ScheduleEnquiryDetails')}
                                            style={styles.headerCollap}
                                        >
                                            <Text style={styles.headerText}>Schedule Enquiry Details</Text>
                                            <Text style={styles.arrowIcon}>
                                                {expandedItem === 'ScheduleEnquiryDetails' ? '▲' : '▼'}
                                            </Text>
                                        </TouchableOpacity>

                                        {expandedItem === 'ScheduleEnquiryDetails' && (
                                            <View style={styles.contenttt}>
                                                {ScheduleDetailsByEnquiry.map((item, index) => {
                                                    const scheduleDate = moment(item.scheduleDate).format('DD-MM-YYYY hh:mm A');
                                                    const convenientTime = moment(item.convenientTime).format('DD-MM-YYYY hh:mm A');

                                                    return (
                                                        <View key={item.id || index} style={{ marginBottom: 15 }}>
                                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                                                {renderInput("Schedule Date", convenientTime)}
                                                                {renderInput("Created Date", scheduleDate)}
                                                            </View>
                                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                                                {item?.enquiryStatus && renderInput("Enquiry Status", item.enquiryStatus, null, false, true)}
                                                                {renderInput("Comment", item.scheduledRemark, null, false, true)}

                                                                {renderInput("Enquiry Status", selectedLead?.enquiryStage || SelectedLeadEnquiry?.enquiryStage, null, false, true)}
                                                            </View>

                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    </View>
                                )}


                                <View style={{ flex: 1, paddingHorizontal: 5 }}>
                                    <Text style={styles.labelformodal}>
                                        Schedule Date <Text style={styles.required}>*</Text>
                                    </Text>

                                    <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                                        <View style={styles.dateInputContainer}>
                                            <TextInput
                                                value={scheduleDate ? scheduleDate.toLocaleString() : ''}
                                                placeholder="Pick Schedule Time"
                                                placeholderTextColor={'#666161FF'}
                                                editable={false}
                                                style={styles.dateInput}
                                                pointerEvents="none"
                                            />
                                            <Image
                                                source={require('../asset/icons/calendar.png')} // Replace with your icon path
                                                style={styles.calendarIcon}
                                            />
                                        </View>
                                    </TouchableOpacity>


                                </View>


                                <View style={styles.row}>
                                    {renderDropdown("Enquiry Status", enquirystatus, Selectedenquirystatus, handleDropdownEnquiryStatus, "Select Status")}
                                </View>




                                <View style={styles.row}>
                                    {renderInputField("Comment", Comments, setComments, true, "Enter Comment", "default", undefined, "firstName")}

                                </View>

                                <View style={styles.row}>
                                    {loading ? (
                                        <ActivityIndicator size="large" color="#4CAF50" />
                                    ) : (
                                        <TouchableOpacity onPress={handleSchedule} style={styles.submitButton}>
                                            <Text style={styles.submitText}>
                                                {ScheduleDetailsByEnquiry.length > 0 ? 'Re-Schedule' : 'Schedule'}
                                            </Text>

                                        </TouchableOpacity>
                                    )}

                                    {ScheduleDetailsByEnquiry.length > 0 && (
                                        <TouchableOpacity onPress={handleProcessModal} style={styles.proceedButton}>
                                            <Text style={styles.submitText}>Proceed</Text>
                                        </TouchableOpacity>
                                    )}
                                    {loading ? (
                                        <ActivityIndicator size="large" color="#4CAF50" />
                                    ) : (
                                        <TouchableOpacity onPress={handleCloseEnquiry} style={styles.cancelButton}>
                                            <Text style={styles.submitText}>Close Enquiry</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <TouchableOpacity onPress={handleworklistmodal} style={styles.cancelButton}>
                                    <Text style={styles.submitText}>Cancel</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={ModalProceed}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalProceed(false)}
            >
                <View style={styles.modalContainerdetailpp}>
                    <View style={styles.modalContentdetailpp}>
                        <ScrollView >


                            <View style={{ width: width * 0.98 }}>
                                {/* DOB Input Section */}
                                <View style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <View style={{ width: width * 0.5, minHeight: height * 0.06, maxHeight: height * 0.7 }}>
                                        <DateOfBirthInput
                                            label="DOB (Date of Birth)"
                                            value={dob}
                                            onChange={(selectedDob) => {
                                                setDob(selectedDob);
                                                handleAgeValidation(selectedDob);
                                            }}
                                            setError={setDobError}
                                            businessDate={BusinessDate.businnessDate}
                                        />

                                        {/* Error Message */}
                                        {dobError ? (
                                            <Text
                                                style={{
                                                    color: 'red',
                                                    fontSize: 12,
                                                    // marginTop: 2,
                                                    flexWrap: 'wrap',
                                                    width: '100%',
                                                }}
                                                numberOfLines={2}
                                            >
                                                {dobError}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            </View>



                            <View style={[styles.row, { marginTop: dobError ? 35 : 10 }]}>
                                {renderInputt("PAN Number", pan, setPan, true, "Enter PAN Number", false, true, false, false, "pan")}

                                <View style={{ flex: 1, paddingHorizontal: 5 }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={styles.labelformodal}>
                                            Aadhar Number
                                            {/* <Text style={styles.required}>*</Text> */}
                                        </Text>
                                        <TextInput
                                            style={[
                                                styles.inputformodal, { borderWidth: 1 }
                                            ]}
                                            value={aadhaarNo}
                                            onChangeText={setAadhaarNo}
                                            keyboardType='numeric'
                                            placeholder='Enter Aadhaar Number'
                                            placeholderTextColor={'#888'}
                                            maxLength={12}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, paddingHorizontal: 5 }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={styles.labelformodal}>{'Email'}<Text style={styles.required}>*</Text></Text>
                                        <TextInput
                                            style={[
                                                styles.inputformodal, { borderWidth: 1 }
                                            ]}
                                            value={email}
                                            onChangeText={setemail}
                                            placeholder='Enter Email'
                                            placeholderTextColor={'#888'}
                                        />
                                    </View>
                                </View>
                                {renderDropdown("Gender", [
                                    { label: 'Male', value: 'Male' },
                                    { label: 'Female', value: 'Female' },
                                    { label: 'Others', value: 'Others' }
                                ], selectedgenders, handleGenderChange, "Select Gender")}
                            </View>

                            <View style={styles.buttonContainer}>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#4CAF50" />
                                ) : (
                                    <TouchableOpacity onPress={FullDetailModal} style={styles.submitButton} >
                                        <Text style={styles.submitText}>Submit</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={handCancelProceedModal} style={styles.cancelButton} >
                                    <Text style={styles.submitText}>Cancel</Text>
                                </TouchableOpacity>

                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </Provider>
    )
}

export default EnquiryWorklist

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    drawerIcon: {
        width: 30,
        height: 30,
        tintColor: 'white'
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
        backdropColor: "rgba(0,0,0,0.5)",
        zIndex: 1,  // Ensure the drawer appears above other content
    },
    firstrow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width * 0.9,
        marginHorizontal: 15,
        marginVertical: 15, // Use percentage to ensure responsive layout
    },
    searchBar: {
        flex: 1,
        height: height * 0.05,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginRight: 10,
        borderRadius: 5,
        color: 'black'
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

    submitButton: {
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginRight: 5,
    },
    cancelButton: {
        borderColor: '#d32f2f',
        flex: 1,
        marginLeft: 5,
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10,
    },
    placeholderStyle: {
        color: 'black',
        fontSize: 12,
    },
    labelformodal: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        color: 'black',
        marginLeft: 10
    },
    modalContainerdetail: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backdropColor: "rgba(0,0,0,0.5)",
    },
    modalContentdetail: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        maxHeight: '90%',
    },

    cancelButton: {
        borderColor: '#d32f2f',
        flex: 1,
        marginLeft: 5,
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 10,
    },
    collapsibleContainer: {
        flex: 1,
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
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
        textAlign: 'center',
    },
    expandIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    inputformodal: {
        // height: height * 0.05,
        // // borderRadius: 5,
        // paddingHorizontal: 10,
        // fontSize: 12,
        // backgroundColor: '#f9f9f9',
        // fontWeight: 'bold',
        // color: 'black',
        // borderColor: '#555', // ✅ Darker border color
        borderRadius: 5,
        fontSize: 12,
        backgroundColor: '#f9f9f9',
        color: 'black',
        // width: width * 0.4,
        height: height * 0.05,
        fontWeight: '400',
        // borderWidth: 0.1,
        // borderColor: '#555', // ✅ Darker border color
        paddingHorizontal: 10,

    },

    dateInputContainer: {
        position: 'relative',
        justifyContent: 'center',
    },

    dateInput: {
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 5,
        fontSize: 12,
        backgroundColor: '#f9f9f9',
        paddingLeft: 10,
        paddingRight: 40, // space for calendar icon
        height: height * 0.05,
        // width: width * 0.9, // or your preferred width
        color: 'black',
    },

    calendarIcon: {
        position: 'absolute',
        right: 10,
        width: 20,
        height: 20,
        // tintColor: 'gray',
    },
    dropdown1: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 6,
        backgroundColor: '#f9f9f9',
        height: height * 0.05,
        color: 'black'
    },
    dropdownItem: {
        padding: 6,
        backgroundColor: '#fff',
    },
    dropdownItemText: {
        fontSize: 12,
        color: 'black',
    },
    selectedText: {
        fontSize: 12,
        color: 'black',
    },
    searchInput: {
        fontSize: 12,
        color: 'black',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },


    cancelButton: {
        borderColor: '#F80C0CFF',
        flex: 1,
        marginLeft: 5,
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 11
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

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10,
    },
    required: {
        color: 'red', // Asterisk color to indicate mandatory
    },
    proceedButton: {
        backgroundColor: '#21F11AFF',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginRight: 5,
    },
    cancelButton: {
        backgroundColor: '#F80C0CFF',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginRight: 5,
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
    inputContainergg: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginHorizontal: 8,
        paddingHorizontal: 10,
        width: width * 0.85
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
    modalContainerdetailpp: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backdropColor: "rgba(0,0,0,0.5)",
    },
    modalContentdetailpp: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: width * 1,
        // height: height * 0.9, // Prevent modal from overflowing
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: '#007bff',
        fontWeight: 'bold',
    },

})