import React, { useState, memo, useCallback, useEffect, useContext, useRef, useMemo } from 'react';
import { View, Text, TextInput, FileProvider, ScrollView, StyleSheet, Image, Platform, ToastAndroid, PermissionsAndroid, Linking, Dimensions, Keyboard, useColorScheme, RefreshControl, TouchableOpacity, Alert, FlatList, Switch, Modal, ActivityIndicator, SafeAreaView, TouchableWithoutFeedback, Animated, StatusBar } from 'react-native';
import { Button, Divider, Provider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { useSelector } from 'react-redux';

import DateOfBir from '../Component/DOB.js';
import { DrawerContext } from '../../../../Drawer/DrawerContext.js';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import CustomToast from '../Component/Toast.js';
import RNFetchBlob from 'rn-fetch-blob';
import CustomInput from '../Component/CustomInput.js';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Clipboard from '@react-native-clipboard/clipboard';
import XLSX from 'xlsx';
import Card from '../Component/Card.js';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import CustomerExistsModal from '../Component/CustomerExistsModal.jsx';
const { width, height, } = Dimensions.get('window');
const isSmallScreen = width < 768;
const MAX_WIDTH = 640;
const MAX_HEIGHT_RATIO = 1;
const renderDropdown = ({
    label,
    data,
    selectedValue,
    onChange,
    placeholder,
    isRequired = true,
    hideAsterisk = false,
    finaloccupation = "",
    finaloccupationCo = "",

}) => {


    return (
        <View style={styles.inputField}>
            <Text style={styles.label}>
                {label}
                {isRequired && !hideAsterisk && (
                    <Text style={styles.required}>*</Text>
                )}
            </Text>
            <Dropdown
                data={data}
                labelField="label"
                valueField="value"
                placeholder={placeholder}
                placeholderStyle={styles.placeholderStyle}
                value={selectedValue}
                search
                onChange={onChange}
                style={styles.dropdown1}
                renderItem={(item) => (
                    <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>{item.label}</Text>
                    </View>
                )}
                selectedTextStyle={{ fontSize: 12, color: "black" }}
                inputSearchStyle={{ color: "black", fontSize: 12 }}
            />
        </View>
    );
};

const CustomInputy = memo(
    ({
        label,
        value,
        onChangeText = () => { },
        editable = true,
        multiline = false,
        containerStyle,
    }) => {
        const [inputHeight, setInputHeight] = useState(42); // default single-line height

        return (
            <View style={[styles.containerinputy, containerStyle]}>
                {label && <Text style={styles.label}>{label}</Text>}

                <View
                    style={[
                        styles.inputWrapper,
                        !editable && styles.disabled,
                    ]}
                >
                    <TextInput
                        value={value ? String(value) : ""}
                        onChangeText={onChangeText}
                        editable={editable}
                        multiline={multiline}
                        scrollEnabled={multiline}
                        onContentSizeChange={(e) => {
                            if (multiline) {
                                const height = e.nativeEvent.contentSize.height;
                                setInputHeight(Math.max(42, height));
                            }
                        }}
                        style={[
                            styles.input,
                            multiline && { height: inputHeight },
                        ]}
                        placeholderTextColor="#999"
                    />
                </View>
            </View>
        );
    }
);
const BusinessDurationInput = ({
    label = "No Of Year in Business",
    monthValue,
    setMonthValue,
    yearValue,
    setYearValue,
}) => {
    const colorScheme = useColorScheme();
    const placeholderColor = colorScheme === "dark" ? "#d3d3d3" : "#808080";

    // --- Handle month change ---
    const handleMonthChange = (text) => {
        const num = text.replace(/[^0-9]/g, "");
        if (num === "" || (parseInt(num, 10) >= 1 && parseInt(num, 10) <= 12)) {
            setMonthValue(num);
        }
    };

    // --- Handle year change ---
    const handleYearChange = (text) => {
        const num = text.replace(/[^0-9]/g, "");
        setYearValue(num);
    };

    return (
        <View style={styles.inputField}>
            {/* Label */}
            <Text style={styles.labelformodal}>{label}</Text>

            {/* Row of Month + Year inputs */}
            <View style={styles.row}>

                <TextInput
                    style={styles.businessinput}
                    placeholder="Year"
                    placeholderTextColor={placeholderColor}
                    keyboardType="numeric"
                    value={yearValue}
                    onChangeText={handleYearChange}
                    maxLength={4}
                />

                <TextInput
                    style={styles.businessinput}
                    placeholder="Month"
                    placeholderTextColor={placeholderColor}
                    keyboardType="numeric"
                    value={monthValue}
                    onChangeText={handleMonthChange}
                    maxLength={2}
                />
            </View>
        </View>
    );
};


const QDE = ({ route }) => {
    // 
    const { openDrawer } = useContext(DrawerContext);
    const selectedLeadfromtab = route?.params?.selectedLeadfromtab;
    const colorScheme = useColorScheme(); // 'light' or 'dark'
    const token = useSelector((state) => state.auth.token);
    const mkc = useSelector((state) => state.auth.losuserDetails);
    const [dateErrors, setDateErrors] = useState({});
    const [Error, setError] = useState({});
    const autoCreate = route?.params?.autoCreate;
    useEffect(() => {
        if (autoCreate) {
            handleCreatePress();   // the same function your Create button uses
        }
    }, [autoCreate]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [activeTab, setActiveTab] = useState('Applicant');
    const [applicantForms, setApplicantForms] = useState([]); // Holds all added forms
    const [activeFormIndex, setActiveFormIndex] = useState(0);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [portfolioDescriptions, setPortfolioDescriptions] = useState([]);
    // const [products, setproduct] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [products, setproduct] = useState([]);


    const [selectedportfolio, setSelectedportfolio] = useState(''); // State for selected dropdown value
    const [selectedproduct, setSelectedproduct] = useState('');

    //

    const [payloadportfolio, setpayloadportfolio] = useState('');
    const [payloadproduct, setpayloadproduct] = useState('')




    useEffect(() => {
        if (payloadproduct === 'Joint Liability Group loan' && applicantForms.length === 0) {
            setApplicantForms([{
                firstName: '',
                lastName: '',
                middleName: '',
                mobileNo: '',
                dob: '',
                gender: '',
                email: '',
                pan: '',
                aadhar: '',
                loanPurpose: '',
                leadSourceid: '',
                leadSourceName: '',
                branchNameid: '',
                branchName: '',
                pincodeid: '',
                pincodeNumber: '',
                stateName: '',
                cityName: '',
                areaName: '',
                countryName: '',
                product: payloadproduct || '',    // Use currently selected product
                productid: selectedproduct || '',

            }]);
            setActiveFormIndex(0); // Ensure first form is active
        }
    }, [payloadproduct]);


    const handlePortfolio = (item) => {
        setSelectedportfolio(item.value);
        setpayloadportfolio(item.label);
    }
    const [payloadorgtype, setpayloadorgtype] = useState('')
    const handleorgtype = (item) => {
        setselectedorgtype(item.value)
        setpayloadorgtype(item.label)
    }
    const handleIndustry = (item) => {
        setselectedindtype(item.value)
        setpayloadind(item.label)
    }
    const [payloadsegtype, setpayloadsegtype] = useState('')

    const handlesegmenttype = (item) => {

        setselectedsegtype(item.value)
        setpayloadsegtype(item.label)
    }
    const [payloadorgtypeco, setpayloadorgtypeco] = useState('')
    const handleorgtypeco = (item) => {
        setselectedorgtypeco(item.value)
        setpayloadorgtypeco(item.label)
    }
    const handleIndustryco = (item) => {
        setselectedindtypeco(item.value)
        setpayloadindco(item.label)
    }
    const [payloadsegtypeco, setpayloadsegtypeco] = useState('')
    const handlesegmenttypeco = (item) => {
        setselectedsegtypeco(item.value)
        setpayloadsegtypeco(item.label)
    }
    const [salutations, setSalutations] = useState([]);
    const [sourceType, setSourceType] = useState([]);
    const [Pincode, setPincode] = useState([]);

    const [coPincode, setcoPincode] = useState([]);
    const safePincodeArray = Array.isArray(Pincode) ? Pincode : [];
    const safePincodeArrayCo = Array.isArray(coPincode) ? coPincode : [];
    const [dobError, setDobError] = useState("");

    const [codobError, setcoDobError] = useState("");
    const [selectedCoApplicant, setSelectedCoApplicant] = useState({});
    const [SelectedLeadApplicant, setSelectedLeadApplicant] = useState({});
    const [IsLoadingLeads, setIsLoadingLeads] = useState(false)
    const [backupselectedCard, setbackupselectedCard] = useState("");
    const [backleadByLeadiD, setbackleadByLeadiD] = useState([])
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [loading, setLoading] = useState(false);
    const [loadingCo, setLoadingCo] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { addListener } = useNavigation();

    const [contactperson, setcontactperson] = useState('');
    const [orgname, setorgname] = useState('');
    const [orgtype, setorgtype] = useState([]);
    const [selectedorgtype, setselectedorgtype] = useState('')
    const [regnumber, setregnumber] = useState('');
    const [CINnumber, setCINnumber] = useState('');
    const [incorpratedat, setincorpratedat] = useState('');

    const [keybusinessparnerdob, setkeybusinessparnerdob] = useState('');
    const [numberofemp, setnumberofemp] = useState('');
    const [design, setdesign] = useState('');
    const [indtype, setindtype] = useState([]);
    const [selectedindtype, setselectedindtype] = useState('')
    const [payloadind, setpayloadind] = useState('')
    const [segtype, setsegtype] = useState([]);
    const [otherindtypetxt, setotherindtypetxt] = useState('');
    const [otherindtypetxtco, setotherindtypetxtco] = useState('');
    const [segtypetxt, setsegtypetxt] = useState('');
    const [segtypetxtco, setsegtypetxtco] = useState('');
    const [selectedsegtype, setselectedsegtype] = useState('');
    const [otherapplicationtypetxt, setotherapplicationtypetxt] = useState('');

    const [fax, setfax] = useState('');
    const [nofmonthinbusiness, setnofmonthinbusiness] = useState('')
    const [nofyearinbusiness, setnofyearinbusiness] = useState('')


    const [contactpersonco, setcontactpersonco] = useState('');
    const [orgnameco, setorgnameco] = useState('');
    const [orgtypeco, setorgtypeco] = useState([]);
    const [selectedorgtypeco, setselectedorgtypeco] = useState('')
    const [regnumberco, setregnumberco] = useState('');
    const [CINumberco, setCINnumberco] = useState('');

    const [incorpratedatco, setincorpratedatco] = useState('');
    const [keybusinessparnerdobco, setkeybusinessparnerdobco] = useState('');
    const [numberofempco, setnumberofempco] = useState('');
    const [designco, setdesignco] = useState('');
    const [indtypeco, setindtypeco] = useState([]);
    const [selectedindtypeco, setselectedindtypeco] = useState('')
    const [payloadindco, setpayloadindco] = useState('')
    const [segtypeco, setsegtypeco] = useState([]);
    const [selectedsegtypeco, setselectedsegtypeco] = useState('')
    const [faxco, setfaxco] = useState('');
    const [nofmonthinbusinessco, setnofmonthinbusinessco] = useState('')
    const [nofyearinbusinessco, setnofyearinbusinessco] = useState('')
    const [fields, setFields] = useState({}); // Dynamic fields object

    const [existsModalVisible, setExistsModalVisible] = useState(false);
    const [existingCustomerData, setExistingCustomerData] = useState(null);
    console.log(existingCustomerData, 'existingCustomerDataexistingCustomerData')
    useEffect(() => {
        if (showSubmitButton && applicantForms.length === 0) {
            handleAddApplicant();
        }
    }, [showSubmitButton]);


    const handleAddApplicant = () => {
        setApplicantForms(prevForms => {
            const newForms = [
                ...prevForms,
                {
                    firstName: '',
                    lastName: '',
                    middleName: '',
                    mobileNo: '',
                    dob: '',
                    gender: '',
                    email: '',
                    pan: '',
                    aadhar: '',
                    loanPurpose: '',
                    leadSourceid: '',
                    leadSourceName: '',
                    branchNameid: '',
                    branchName: '',
                    pincodeid: '',
                    pincodeNumber: '',
                    stateName: '',
                    cityName: '',
                    areaName: '',
                    countryName: '',
                    product: payloadproduct || '',    // Use currently selected product
                    productid: selectedproduct || '',
                }
            ];
            setActiveFormIndex(newForms.length - 1); // Show newly added form
            setFindApplicantByCategoryCod({
                data: {
                    cityName: '',
                    stateName: '',
                    countryName: '',
                    areaName: ''
                }
            });
            return newForms;
        });
    };


    const handleSubmitJLGL = async () => {
        // Prepare payload using applicantForms data
        const payload = {
            applicantLeaddto: applicantForms, // send all form objects as array
            coApplicantLeaddto: {}  // ensure coApplicantLeaddto is handled properly
        };

        try {
            const response = await axios.post(`${BASE_URL}lead`, payload, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                }
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Unexpected status code: ${response.status}`);
            }

            if (response.data && response.data.msgKey === 'Success') {
                const leadId = response.data.data.leadId;
                setleadID(leadId);

                const toastMessage = `${response.data.message} of Applicant!!`;
                handleClosePress(); // Clear applicantForms
                showToast(toastMessage);

                setloading(false);
                setIsLoadingsentotp(false);

                Alert.alert(
                    'Success',
                    response.data.msgKey || 'Co-Applicant added successfully!',
                    [{ text: 'OK', onPress: handleWithoutCoApplicant }]
                );

            } else {
                console.warn('API did not return success:', response.data);
                Alert.alert('Error', response.data.msgKey || 'Failed to add lead. Please try again.');
                setloading(false);
                setIsLoadingsentotp(false);
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            Alert.alert('Error', 'An error occurred. Please try again later.');
            setloading(false);
            setIsLoadingsentotp(false);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        if (backleadByLeadiD.length > 0) {
            let applicant = "";
            let coApplicant = "";

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
                setIsLoadingLeads(false)
            }

            if (coApplicant) {
                setSelectedCoApplicant(coApplicant); // Set Co-Applicant if available
            }
        }
    }, [backleadByLeadiD]);  // Only run when leadByLeadiD changes




    // Toggle drawer visibility
    const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
    };


    useEffect(() => {
        return () => {
            setSearchQuery(''); // Reset the search query when the component unmounts
            setShowAllLeads(false); // Show all
        };
    }, []);

    // Close the drawer when navigating away from the current screen
    useEffect(() => {
        const unsubscribe = addListener('blur', () => {
            setDrawerVisible(false); // Close the drawer on screen blur
        });

        // Clean up the listener on component unmount
        return unsubscribe;
    }, [addListener]);

    const handleSearch = (text) => {
        setSearchQuery(text);
    };
    const [isSubmittingApplicant, setisSubmittingApplicant] = useState(false); // State to track submission
    const [isCardVisible, setCardVisible] = useState(false);
    const [selectedApplicantType, setSelectedApplicantType] = useState(''); // State for selected dropdown value
    const [selectedExistinguser, setSelectedExistinguser] = useState('');

    const [selectedsalutation, setSelectedsalutation] = useState('');
    const [selectedgenders, setSelectedgenders] = useState('');
    const [coselectedgenders, setcoSelectedgenders] = useState('');


    const [selectedbranch, setSelectedbranch] = useState('');
    const [selectedloanpurpose, setSelectedloanpurpose] = useState('');
    const [selectedsourseType, setSelectedsourceType] = useState('');



    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [cofirstName, setcoFirstName] = useState('');
    const [comiddleName, setcoMiddleName] = useState('');
    const [colastName, setcoLastName] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isOtpVerifiedCo, setIsOtpVerifiedCo] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [comobileNumber, setcoMobileNumber] = useState('');
    const [coemail, setcoEmail] = useState('');
    const [pan, setPan] = useState('');
    const [copan, setcoPan] = useState('');
    const [aadhaarNo, setAadhaarNo] = useState('');
    const [coaadhaarNo, setcoAadhaarNo] = useState('');
    const [dob, setDob] = useState('');
    const [codob, setcoDob] = useState('');
    const [gender, setGender] = useState('');
    const [loanAmount, setLoanAmount] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isModalVisibleCoApplicant, setModalVisibleCoAPplicant] = useState(false);
    const [loadingf, setloading] = useState(false);
    const [isLoadingsendotp, setIsLoadingsentotp] = useState(false);
    const [applicantpincode, setapplicantpincode] = useState('');
    const [selectedPincodes, setSelectedPincodes] = useState('');


    const [applicantpincodeco, setapplicantpincodeco] = useState('');
    const [coselectedPincodes, setcoSelectedPincodes] = useState({
        value: '',
        label: '',
    });
    const [otpApplicant, setOtpApplicant] = useState(['', '', '', '']);  // 4 empty strings for Applicant OTP
    const [otpCoApplicant, setOtpCoApplicant] = useState(['', '', '', '']);  // 4 empty strings for Co-Applicant OTP
    const [visible, setVisible] = useState(false);
    const [leadsWithLoanAmount, setLeadsWithLoanAmount] = useState([]);
    const [GroupedLeadsById, setGroupedLeadsById] = useState([]);
    const [productName, setProductName] = useState('');
    const [portfolioDescription, setPortfolioDescription] = useState('');
    const [findApplicantByCategoryCod, setFindApplicantByCategoryCod] = useState({
        data: {
            cityName: '',
            stateName: '',
            countryName: '',
            areaName: ''
        }
    });


    const [cofindApplicantByCategoryCod, setcoFindApplicantByCategoryCod] = useState({
        data: {
            cityName: '',
            stateName: '',
            countryName: '',
            areaName: ''
        }
    });
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


    // ✅ State Management


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


    const [isModalVisiblecreate, setIsModalVisible] = useState(false);
    const [isModalVisiblecreateJLG, setisModalVisiblecreateJLG] = useState(false)
    const [LeadDropdown, setLeadDropdown] = useState([]);
    const [SelectdLeadSourceDropdown, setSelectedLeadSourceDropdown] = useState('')

    const [BranchName, setBranchname] = useState([]);
    const [SelectdbranchName, setSelectedbranchName] = useState('')

    const [LoanPurposeName, setLoanPurposeName] = useState([]);
    const [SelectdLoanPurposeName, setSelectedLoanPurposeName] = useState('')
    // const [BusinessDate, setBusinessDate] = useState([]);
    const [leadSourceId, setLeadSourceId] = useState([]);
    // 
    const [showAllLeads, setShowAllLeads] = useState(false);
    const [BusinessDate, setBusinessDate] = useState([]);



    const [Designation, setAllDesignation] = useState([]);
    const [AllLoadSource, setAllLoadSource] = useState([]);
    const [Category, setCategory] = useState([]);
    const [CategoryCo, setCategoryCo] = useState([]);
    const [applicantCategoryCo, setapplicantCategoryCo] = useState(null)
    const [SelectdCategory, setSelectedCategory] = useState('')
    const [getByType, setgetByType] = useState([]);
    const [selectsetgetByType, setselectsetgetByType] = useState('');
    const [getByTypeCo, setgetByTypeCo] = useState([]);
    const [selectsetgetByTypeCo, setselectsetgetByTypeCo] = useState('')

    const [AllLoads, setAllLoeds] = useState([]);
    const [LeadStatus, setAllLeadStatus] = useState([]);
    const [selectedLead, setSelectedLead] = useState("");
    const [activeTabView, setActiveTabView] = useState('Applicant');
    const [leadByLeadiD, setleadByLeadiD] = useState([])
    const [ApplicantleadByLeadiD, setApplicantleadByLeadiD] = useState([])
    const Applicantlead = leadByLeadiD[0];

    const [backupismedicaldone, setbackupismedicaldone] = useState(false);
    const [backupismedicaldoneCoApp, setbackupismedicaldoneCoApp] = useState(false);

    const toggleMedicalDone = (applicant, setBackupState) => {
        setBackupState(prevState => !prevState);
    };
    const [cateselec, setcatselct] = useState('');
    const [cateselecCo, setcatselctCo] = useState('');
    const [finaloccupation, setfinaloccupation] = useState('');
    const [finaloccupationCo, setfinaloccupationCo] = useState('');
    const [otherapplicationtypetxtCo, setotherapplicationtypetxtCo] = useState('');



    const handleProductchange = useCallback((item) => {
        console.log(item, 'itemitem')
        setSelectedproduct(item.value);
        setpayloadproduct(item.label);
        setApplicantForms(prevForms =>
            prevForms.map(form => ({
                ...form,
                product: item.label,
                productid: item.value,
            }))
        );
    }, []);
    const handleOccupationChange = (item) => {
        setselectsetgetByType(item.value); // Set the selected gender value
        setfinaloccupation(item.label);
    };

    const handleOccupationChangeCo = (item) => {
        setselectsetgetByTypeCo(item.value); // Set the selected gender value
        setfinaloccupationCo(item.label);
    };

    useEffect(() => {
        if (SelectedLeadApplicant.medicalCheck === true) {
            setbackupismedicaldone(true);
        } else {
            setbackupismedicaldone(false);
        }
    }, [SelectedLeadApplicant.medicalCheck]);

    useEffect(() => {
        if (selectedCoApplicant.medicalCheck === true) {
            setbackupismedicaldoneCoApp(true);
        } else {
            setbackupismedicaldoneCoApp(false);
        }
    }, [selectedCoApplicant.medicalCheck]);
    const [leadID, setleadID] = useState([]);
    const [CoApllicant, setCoApplicant] = useState(false);
    // 

    const [errors, setErrors] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        dob: '',
        email: '',
        mobileNumber: '',
        pan: '',
        aadhaarNo: '',
        pincode: '',
        countryName: '',
        area: '',
        stateName: '',
        cityName: '',
        gender: '',
        loanpurpose: '',
        branchName: '',


        coFirstName: '',
        coMiddleName: '',
        coLastName: '',
        coDob: '',
        coEmail: '',
        coMobileNumber: '',
        copan: '',
        coAadhaarNo: '',
        coPincode: '',
        coCountryName: '',
        coArea: '',
        coStateName: '',
        coCityName: '',
        cogender: '',
        coloanpurpose: '',
        cobranchName: ''

    });

    const handleCreatePress = () => {
        setIsModalVisible(true);
        setActiveTab('Applicant');
        setAllLoeds([]);
        setLeadsWithLoanAmount([]);
    };


    const [refreshing, setrefreshing] = useState(false);
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

    // const colorScheme = useColorScheme();
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
        isCIN = false,
    ) => {
        const handleAadhaarValidation = (aadhaarValue) => {
            if (aadhaarValue.length > 0 && aadhaarValue.length !== 12) {
                errorsRef.current[fieldName] = "Invalid Aadhaar number. Must be 12 digits.";
            } else {
                delete errorsRef.current[fieldName];
            }
        };

        const getKeyboardTypeForPan = (panValue) => {
            if (panValue.length < 5) return "default";
            if (panValue.length >= 5 && panValue.length < 9) return "numeric";
            if (panValue.length === 10) return "default";
            return "default";
        };

        const getKeyboardTypeForCIN = (cinValue) => {
            const len = cinValue.length;
            // L or U → alphabet
            if (len === 0) return "default";
            if (len < 6 && len > 0) return "numeric";     // digits after L/U
            if (len >= 6 && len < 8) return "default";    // state code
            if (len >= 8 && len < 12) return "numeric";   // year
            if (len >= 12 && len < 15) return "default";  // company type
            if (len >= 15) return "numeric";              // registration number
            return "default";
        };

        const handleCINValidation = (cinValue, fieldName) => {
            if (cinValue.length > 0 && !/^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cinValue)) {
                errorsRef.current[fieldName] = "Invalid CIN. Example: L12345MH2012PLC123456";
            } else {
                delete errorsRef.current[fieldName];
            }
        };


        const handleKeyboardDismiss = (newValue, isFieldPan) => {
            if (isFieldPan && newValue.length === 10) Keyboard.dismiss();
            else if (isMobile && newValue.length === 10) Keyboard.dismiss();
            else if (isAadhaar && newValue.length === 12) Keyboard.dismiss();
        };

        const hideStar = ["Private Limited", "Limited", "Sole Proprietor"].includes(
            (finaloccupation || finaloccupationCo || "").trim()
        );

        return (
            <View style={styles.inputField}>
                <Text style={styles.label}>
                    {label}
                    {required && !hideStar && <Text style={styles.required}>*</Text>}
                </Text>

                <TextInput
                    style={[
                        styles.inputformodal,
                        {
                            borderColor: errorsRef.current?.[fieldName] ? "red" : "black",
                            borderWidth: 1,
                            textAlignVertical: multiline ? "top" : "center",
                        },
                    ]}
                    value={value || ""}
                    onChangeText={(text) => {
                        let newValue = text;

                        if (isPan) {
                            newValue = newValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                        } else if (isMobile || isAadhaar) {
                            newValue = newValue.replace(/[^0-9]/g, "");
                        } else if (isCIN) {
                            newValue = newValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                        }


                        setValue(newValue);

                        if (isAadhaar) handleAadhaarValidation(newValue);
                        if (isCIN) handleCINValidation(newValue, fieldName);
                        handleKeyboardDismiss(newValue, isPan);

                    }}
                    editable={editable}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderColor}
                    keyboardType={
                        isPan
                            ? getKeyboardTypeForPan(value)
                            : isCIN
                                ? getKeyboardTypeForCIN(value)
                                : isMobile || isAadhaar
                                    ? "numeric"
                                    : "default"
                    }
                    maxLength={isPan ? 10 : isMobile ? 10 : isAadhaar ? 12 : isCIN ? 21 : undefined}
                    onSubmitEditing={() => {
                        if (isPan && value.length === 10) Keyboard.dismiss();
                    }}
                    multiline={multiline}
                    numberOfLines={multiline ? 3 : 1}
                />

                {isVerified && (
                    <Image source={require("../../asset/greencheck.png")} style={styles.checkIcon} />
                )}

                {errorsRef.current?.[fieldName] && (
                    <Text style={{ color: "red", fontSize: 12, marginTop: 5 }}>
                        {errorsRef.current[fieldName]}
                    </Text>
                )}
            </View>
        );
    };

    const getAllDesignations = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllDesignations`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            setAllDesignation(response.data.data);

        } catch (error) {
            console.error('Error fetching lead Designation:', error);
            Alert.alert('Error', 'Failed to fetch Designation');
        }
    }

    const getByTypelookupTypeApplicantCategory = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getByType?lookupType=ApplicantCategory`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const data = response.data.data

            const fetchCategory = data;
            const options = fetchCategory.map(lead => ({
                label: lead.lookupName, // For display
                value: lead.lookupId,        // For identification
            }));

            setCategory(options); // Set dropdown options
            setCategoryCo(options);
        } catch (error) {
            console.error('Error fetching lead Designation:', error);
            Alert.alert('Error', 'Failed to fetch Designation');
        }
    }



    useEffect(() => {
        getByTypelookupType();
        getByTypelookupTypeOrganizationType();
        INDUSTRYTYPE();

    }, [cateselec])

    useEffect(() => {
        getByTypelookupTypeCo();
        // getByTypelookupTypeOrganizationTypeCo();
        // INDUSTRYTYPECo();

    }, [cateselecCo])
    useEffect(() => {
        if (selectedindtype) {
            getByTypelookupTypeSegmentType();
        }
    }, [selectedindtype,]);

    useEffect(() => {
        if (selectedindtypeco) {
            getByTypelookupTypeSegmentTypeCo();
        }
    }, [selectedindtypeco,]);

    const getByTypelookupTypeSegmentType = async () => {
        try {
            const code = selectedindtype; // ✅ Pick whichever is present

            if (!code) return; // If neither is present, exit

            const response = await axios.get(`${BASE_URL}getLookupByCode/${code}`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            const data = response.data.data || [];
            const options = data.map((lead) => ({
                label: lead.lookupEFinedFor,
                value: lead.description,
            }));

            setsegtype(options);
            // setsegtypeco(options);


        } catch (error) {
            console.error("Error fetching lead Designation:", error);
            Alert.alert("Error", "Failed to fetch Designation");
        }
    };


    const getByTypelookupTypeSegmentTypeCo = async () => {
        try {
            const code = selectedindtypeco; // ✅ Pick whichever is present

            if (!code) return; // If neither is present, exit

            const response = await axios.get(`${BASE_URL}getLookupByCode/${code}`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            const data = response.data.data || [];
            const options = data.map((lead) => ({
                label: lead.lookupEFinedFor,
                value: lead.description,
            }));

            // setsegtype(options);
            setsegtypeco(options);


        } catch (error) {
            console.error("Error fetching lead Designation:", error);
            Alert.alert("Error", "Failed to fetch Designation");
        }
    };


    const INDUSTRYTYPE = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getLookupByLookupEFinedFor/INDUSTRY_TYPE`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const data = response.data.data

            const fetchCategory = data;
            const options = fetchCategory.map(lead => ({
                label: lead.description, // For display
                value: lead.code,        // For identification
            }));

            setindtype(options); // Set dropdown options
            setindtypeco(options); // Set dropdown options
        } catch (error) {
            console.error('Error fetching lead Designation:', error);
            Alert.alert('Error', 'Failed to fetch Designation');
        }
    }

    const getByTypelookupTypeOrganizationType = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getByType?lookupType=OrganizationType`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const data = response.data.data

            const fetchCategory = data;
            const options = fetchCategory.map(lead => ({
                label: lead.lookupName, // For display
                value: lead.lookupId,        // For identification
            }));

            setorgtype(options); // Set dropdown options
            setorgtypeco(options); // Set dropdown options
        } catch (error) {
            console.error('Error fetching lead Designation:', error);
            Alert.alert('Error', 'Failed to fetch Designation');
        }
    }
    const getByTypelookupType = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}getByType`,
                {
                    params: { lookupType: cateselec }, // ✅ query parameter
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            const data = response.data.data;


            const fetchCategory = data;
            const options = fetchCategory
                // .filter(item => item.lookupCode !== "House Wife")
                .map(lead => ({
                    label: lead.lookupName,
                    value: lead.lookupId,
                }));

            const optionsCo = fetchCategory

                .map(lead => ({
                    label: lead.lookupName,
                    value: lead.lookupId,
                }));




            setgetByType(options);
            // setgetByTypeCo(optionsCo);
        } catch (error) {
            console.error('Error fetching lead Designation:', error);
            Alert.alert('Error', 'Failed to fetch Designation');
        }
    };
    const getByTypelookupTypeCo = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}getByType`,
                {
                    params: { lookupType: cateselecCo }, // ✅ query parameter
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            const data = response.data.data;


            const fetchCategory = data;
            const options = fetchCategory
                // .filter(item => item.lookupCode !== "House Wife")
                .map(lead => ({
                    label: lead.lookupName,
                    value: lead.lookupId,
                }));

            const optionsCo = fetchCategory

                .map(lead => ({
                    label: lead.lookupName,
                    value: lead.lookupId,
                }));




            // setgetByType(options);
            setgetByTypeCo(optionsCo);
        } catch (error) {
            console.error('Error fetching lead Designation:', error);
            Alert.alert('Error', 'Failed to fetch Designation');
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
            setAllLoadSource(response.data.data.content);

            const fetchedLeads = response.data.data.content;
            const options = fetchedLeads.map(lead => ({
                label: lead.leadSourceName, // For display
                value: lead.leadSourceId,        // For identification
            }));
            // 
            setLeadDropdown(options); // Set dropdown options
            // setAllLeadStatus(fetchedLeads);
        } catch (error) {
            console.error('Error fetching lead source:', error);
            Alert.alert('Error', 'Failed to fetch lead source');
        }
    }


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
            setAllLoadSource(response.data.data.content);

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

    const getLoanPurpose = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getByType?lookupType=LoanPurpose`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            setAllLoadSource(response.data.data.content);

            const fetchedLeads = response.data.data;
            const options = fetchedLeads.map(lead => ({
                label: lead.lookupName, // For display
                value: lead.lookupName,        // For identification
            }));
            // 
            setLoanPurposeName(options); // Set dropdown options
            // setAllLeadStatus(fetchedLeads);
        } catch (error) {
            console.error('Error fetching getByType?lookupType=LoanPurpose:', error);
            Alert.alert('Error', 'Failed to fetch getByType?lookupType=LoanPurpose');
        }
    }

    const getAllLeads = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getLeads`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                }
            });
            const rr = response.data.data;
            const allLeadswithloanAmount = rr
            const allLeads = rr.filter(lead => lead.appId === null && lead.loanAmount === 0 && lead.leadStatus.leadStatusName !== 'Rejected');

            // Filter leads into two groups: with and without loan amount
            const leadsWithAmount = allLeadswithloanAmount.filter(lead => lead.loanAmount > 0 && lead.createdBy === mkc.userName);
            // const leadsWithoutAmount = allLeads.filter(
            //     lead => (lead.loanAmount <= 0 || lead.loanAmount === "" || lead.loanAmount === undefined) && lead.createdBy === mkc.userName
            // );
            // Correct the filtering for leads without loan amount
            const leadsWithoutAmount = allLeads.filter(lead => {
                const hasCoApplicant = allLeads.some(
                    // coApp => coApp.leadId === lead.leadId && coApp.applicantTypeCode === 'Co-Applicant'
                    coApp => coApp.leadId === lead?.leadId
                );

                return (
                    (lead?.loanAmount <= 0 || lead?.loanAmount === "" || lead.loanAmount === undefined) &&
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
            setAllLoeds(leadsWithAmount); // Correct naming if needed
            setLeadsWithLoanAmount(leadsWithoutAmount); // Correct naming if needed
            // Clear form fields

            // 

            // 
        } catch (error) {
            console.error('Error fetching leads:', error);
            Alert.alert('Error', 'Failed to fetch leads');
        }
    };




    const getAllLeadStatus = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllLeadStatus`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            setAllLeadStatus(response.data.data);

        } catch (error) {
            console.error('Error fetching lead status:', error);
            Alert.alert('Error', 'Failed to fetch lead status');
        }
    }


    const onClose = () => {
        setModalVisible(false); // Hide the modal
    };


    const findApplicantByCategoryCodeJLGL = async (pincode, formIndex) => {
        try {
            const response = await axios.get(
                `${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincode}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    }
                }
            );

            const { countryName, stateName, cityName, areaName } = response.data.data;

            setApplicantForms(prevForms => {
                const newForms = [...prevForms];
                newForms[formIndex] = {
                    ...newForms[formIndex],
                    countryName,
                    stateName,
                    cityName,
                    areaName,
                };
                return newForms;
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch location data');
        }
    };



    const findApplicantByCategoryCode = useCallback(async () => {
        const pincodeToUse = selectedPincodes.label ? selectedPincodes.label : applicantpincode

        try {
            const response = await axios.get(`${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincodeToUse}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const responseData = response.data;
            setFindApplicantByCategoryCod({ data: responseData.data });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch application data findAreaNameCityStateRegionZoneCountryByPincode');
        }
    }, [selectedPincodes]);

    const findApplicantByCategoryCodeCo = useCallback(async () => {

        const pincodeToUse = coselectedPincodes.label
        try {
            const response = await axios.get(`${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincodeToUse}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const responseData = response.data;
            setcoFindApplicantByCategoryCod({ data: responseData.data });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch application data findAreaNameCityStateRegionZoneCountryByPincode');
        }
    }, [coselectedPincodes]);



    const getAllPincodes = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllPincodes`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const responseData = response.data;
            const Pincodes = responseData.data?.content || [];

            if (Array.isArray(Pincodes) && Pincodes.length > 0) {
                const transformedPincodes = Pincodes.map(pincode => ({
                    pincodeId: pincode.pincodeId, // Extracting pincodeId
                    pincode: pincode.pincode        // Extracting pincode
                }));

                // Assuming you have a state for both pincode and pincodeId
                setPincode(transformedPincodes); // Store both pincode and pincodeId
                setcoPincode(transformedPincodes);
            } else {
                console.error('No Pincodes found or content is not an array');
                Alert.alert('Error', 'No Pincodes data found');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch Pincodes data');
        }
    }, []);

    const SourceType = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}getByType?lookupType=SourceType`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            // 
            const responseData = response.data;
            // 
            const SourceType = responseData.data || [];
            // 
            if (Array.isArray(SourceType) && SourceType.length > 0) {
                const descriptions = SourceType.map(SourceType => SourceType.lookupName);
                // 

                // Update state with the extracted descriptions
                setSourceType(descriptions);
            } else {
                console.error('No SourceType found or content is not an array');
                Alert.alert('Error', 'No SourceType data found');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch Branch data');
        }
    }, []);

    const getAllalutation = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}getByType?lookupType=Salutation`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const responseData = response.data;
            const salutationData = responseData.data || [];
            const salutationNames = salutationData.map(item => item.lookupName);
            setSalutations(salutationNames);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch salutation data');
        }
    }, []);


    const getAllProducts = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllProducts`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            });

            const responseData = response.data;
            const product = responseData.data?.content || [];

            if (Array.isArray(product) && product.length > 0) {
                // ✅ Step 1: Base filter (active only and skip )
                let filteredProducts = product.filter(
                    (item) => item.active === "true" && item.productCode !== "JLG"
                );


                // ✅ Step 3: Transform into dropdown format
                const transformedProducts = filteredProducts.map((product) => ({
                    label: product.productName,
                    value: product.productId,
                }));

                setproduct(transformedProducts);
                setAllProducts(transformedProducts)
            } else {
                console.error("No product found or content is not an array");
                Alert.alert("Error", "No portfolio data found");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch portfolio data");
        }
    }, [token, formData]);

    const getAllportfolio = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllPortfolios`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const responseData = response.data;
            const portfolios = responseData.data?.content || [];
            if (Array.isArray(portfolios) && portfolios.length > 0) {
                const descriptions = portfolios.map(portfolio => ({
                    label: portfolio.portfolioDescription,
                    value: portfolio.portfolioId, // Use portfolioId as the value
                }));
                setPortfolioDescriptions(descriptions);
            } else {
                console.error('No portfolios found or content is not an array');
                Alert.alert('Error', 'No portfolio data found');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch portfolio data');
        }
    }, []);

    useEffect(() => {
        getAllportfolio();
        getAllProducts();
        getAllalutation();
        SourceType();
        getAllPincodes();
        getAllLeadSource();
        getAllLeads();
        getAllLeadStatus();
        getAllDesignations();
        getBranchName();
        getLoanPurpose();
        getBusinessDate();
        getByTypelookupTypeApplicantCategory();
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            getAllLeads();
            getBusinessDate();
        }, []) // Empty dependency array to ensure this runs every time the screen is focused
    );


    useEffect(() => {
        if (selectedPincodes.label || applicantpincode) {
            findApplicantByCategoryCode();
        }
    }, [applicantpincode, selectedPincodes.label, findApplicantByCategoryCode]);


    useEffect(() => {
        if (coselectedPincodes.label || applicantpincodeco) {
            findApplicantByCategoryCodeCo();
        }
    }, [applicantpincodeco, coselectedPincodes.label, findApplicantByCategoryCodeCo]);

    const transformedPincodes = safePincodeArray.length === 1
        ? [{
            label: safePincodeArray[0].pincode.toString(),
            value: safePincodeArray[0].pincodeId // Use pincodeId as the value
        }]
        : safePincodeArray.map(({ pincodeId, pincode }) => ({
            label: pincode.toString(),
            value: pincodeId // Use pincodeId as the value
        }));


    const transformedPincodesCo = safePincodeArrayCo.length === 1
        ? [{
            label: safePincodeArrayCo[0].pincode.toString(),
            value: safePincodeArrayCo[0].pincodeId // Use pincodeId as the value
        }]
        : safePincodeArrayCo.map(({ pincodeId, pincode }) => ({
            label: pincode.toString(),
            value: pincodeId // Use pincodeId as the value
        }));

    const groupedLeads = GroupedLeadsById.reduce((acc, lead) => {
        if (!acc[lead.leadId]) acc[lead.leadId] = [];
        acc[lead.leadId].push(lead);
        return acc;
    }, {});

    // 1️⃣ Utility to match text query
    const matchesQuery = (item, query) => {
        return [
            item?.firstName,
            item?.lastName,
            item?.organizationName,
            item?.leadStatus?.leadStatusName,
            item?.pan,
            item?.mobileNo,
            item?.gender,
            item?.leadId,
            item?.appId,
        ].some((field) => field?.toLowerCase().includes(query));
    };

    // 2️⃣ Remove duplicates — keep the "Applicant" record if multiple share same leadId
    const uniqueLeads = (showAllLeads ? AllLoads : leadsWithLoanAmount).reduce((acc, item) => {
        const existing = acc.find((i) => i.leadId === item.leadId);

        if (!existing) {
            // If not present, add it
            acc.push(item);
        } else if (
            item?.applicantTypeCode === "Applicant" &&
            existing?.applicantTypeCode !== "Applicant"
        ) {
            // Replace if current is Applicant and previous isn’t
            acc = acc.map((i) => (i.leadId === item.leadId ? item : i));
        }

        return acc;
    }, []);

    // 3️⃣ Now filter by search query
    const filteredData = uniqueLeads.filter((item) => {
        const query = searchQuery?.toLowerCase() ?? "";

        return query
            ? matchesQuery(item, query) ||
            (item?.applicantTypeCode === "Applicant" && matchesQuery(item, query))
            : true;
    });



    const handleDropdownChangePincode = (item) => {
        setSelectedPincodes(item); // store the full object
    };

    const handleDropdownChangePincodeCo = (item) => {
        setcoSelectedPincodes({
            value: item.value,   // Set selected pincode ID
            label: item.label,   // Set selected pincode label
        }); // Set selected pincodeId
        //  // Debugging output
    };

    const handleMobileNumberChange = (value) => {
        // Allow only up to 10 digits and ensure it's not all zeroes
        if (value.length <= 10 && value !== "0000000000") {
            setMobileNumber(value);
        }
    };


    const handleMobileNumberChangeCo = (value) => {
        // Allow only up to 10 digits
        if (value.length <= 10 && value !== "0000000000") {
            setcoMobileNumber(value);
        }
    };

    const handleCardPress = (item) => {
        // Log before setting state
        setSelectedLead(item);  // Set selected lead
        setIsLoadingLeads(true);
        // if (!selectedCoApplicant?.firstName || !selectedCoApplicant?.lastName) {
        //     setModalVisibleCoAPplicant(true);
        // } else {
        //     setActiveTabView('Applicant');
        // }
        setModalVisible(true);  // Show modal
        setActiveTabView('Applicant');
    };
    const [expandedItem, setExpandedItem] = useState("");
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);
    // const toggleExpand = (itemId) => {
    //     setExpandedItem(prevState => prevState === itemId ? "" : itemId);
    // };

    const toggleExpand = index => {
        setExpandedItem(prevIndex => (prevIndex === index ? null : index));
    };



    const requestCameraPermission = async () => {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message: "App needs access to your camera to scan documents.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const openCameraAndScan = async () => {
        try {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                Alert.alert("Permission Denied", "Camera access is required.");
                return;
            }

            const result = await launchCamera({ mediaType: "photo", quality: 1 });

            // Safe checks
            if (!result || result.didCancel) {

                return;
            }
            if (result.errorCode) {
                Alert.alert("Camera Error", result.errorMessage || "Unknown error");
                return;
            }
            if (!result.assets || result.assets.length === 0) {
                Alert.alert("Error", "No image captured.");
                return;
            }

            const imageUri = result.assets[0].uri;

            // Run OCR
            const recognizedTextArray = await TextRecognition.recognize(imageUri);
            const recognizedText = recognizedTextArray.join("\n");


            // 🔹 PAN CARD Specific Parser
            const parseOCRText = (text) => {
                const lines = text
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line);

                let extractedFields = {};

                lines.forEach((line, index) => {
                    // PAN Number
                    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(line)) {
                        extractedFields["PAN"] = line;
                    }
                    // Date of Birth
                    else if (
                        /^(0[1-9]|[12][0-9]|3[01])[\/\-](0[1-9]|1[0-2])[\/\-]\d{4}$/.test(line)
                    ) {
                        extractedFields["Date of Birth"] = line;
                    }
                    // Father’s Name (next line after "Father" or "Father's Name")
                    else if (/Father/i.test(line)) {
                        extractedFields["Father’s Name"] = lines[index + 1] || "";
                    }
                    // Applicant Name (must be all caps, exclude Father/Dept keywords)
                    else if (
                        /^[A-Z ]{3,}$/.test(line) &&
                        !/FATHER|GOVT|INCOME|TAX|DEPARTMENT|PERMANENT|ACCOUNT|NUMBER|CARD/.test(
                            line
                        )
                    ) {
                        // Only set applicant name if we haven't already set it
                        if (!extractedFields["First Name"]) {
                            const nameParts = line.split(" ").filter(Boolean);

                            if (nameParts.length === 1) {
                                extractedFields["First Name"] = nameParts[0];
                            } else if (nameParts.length === 2) {
                                extractedFields["First Name"] = nameParts[0];
                                extractedFields["Last Name"] = nameParts[1];
                            } else {
                                extractedFields["First Name"] = nameParts[0];
                                extractedFields["Middle Name"] = nameParts.slice(1, -1).join(" ");
                                extractedFields["Last Name"] = nameParts[nameParts.length - 1];
                            }
                        }
                    }
                });

                // 🔹 Directly update your form states
                const applicantFirstName = extractedFields["First Name"] || "";
                const applicantLastName = extractedFields["Last Name"] || ""; // From applicant’s name line
                const fatherFullName = extractedFields["Father’s Name"] || "";

                let middleName = "";
                let lastName = applicantLastName;

                // If father’s name exists, split it
                if (fatherFullName) {
                    const fatherParts = fatherFullName.split(" ");
                    if (fatherParts.length > 0) {
                        middleName = fatherParts[0]; // Father’s first name
                    }
                    if (!lastName && fatherParts.length > 1) {
                        lastName = fatherParts[fatherParts.length - 1]; // Fallback to father’s surname if applicant’s last name missing
                    }
                }

                // ✅ Push values into state
                setFirstName(applicantFirstName);
                setMiddleName(middleName);
                setLastName(lastName);
                setPan(extractedFields["PAN"] || "");
                setDob(extractedFields["Date of Birth"] || "");


                return extractedFields;
            };

            const fields = parseOCRText(recognizedText);
            setFields(fields);
        } catch (err) {
            console.error("OCR Error:", err);
            Alert.alert("Error", "Failed to scan document.");
        }
    };

    // const selectFileAutoPopulate = async () => {
    //     try {
    //         const res = await DocumentPicker.pickSingle({
    //             type: [DocumentPicker.types.allFiles],
    //         });

    //         const fileUri = res.uri;
    //         const fileName = res.name;
    //         const extension = fileName.split('.').pop().toLowerCase();

    //         const fileData = await RNFetchBlob.fs.readFile(fileUri, 'base64');
    //         const decoded = RNFetchBlob.base64.decode(fileData);

    //         if (extension === 'xlsx' || extension === 'xls') {
    //             const workbook = XLSX.read(decoded, { type: 'binary' });
    //             const sheetName = workbook.SheetNames[0];
    //             const sheet = workbook.Sheets[sheetName];

    //             // Convert to JSON with keys from header row
    //             const jsonData = XLSX.utils.sheet_to_json(sheet);

    //             if (jsonData.length > 0) {
    //                 const row = jsonData[0]; // Take first row of data
    //                 
    //                 setFirstName(row.firstName)
    //                 setLastName(row.lastName)
    //                 setMiddleName(row.middleName)
    //                 setDob(row.dob)
    //                 setMobileNumber(row.mobileNo?.toString())
    //                 setSelectedgenders(row.gender)
    //                 setEmail(row.email)
    //                 setAadhaarNo(row.aadhar)
    //                 setPan(row.pan)
    //                 setSelectedLoanPurposeName(row.loanPurpose)
    //                 // setapplicantpincode(row.pincode);

    //                 // ✅ Lead Source
    //                 const matchedLeadSource = LeadDropdown.find(
    //                     (l) => l.label === row.leadsource
    //                 );
    //                 setSelectedLeadSourceDropdown(
    //                     matchedLeadSource || { value: row.leadsource, label: row.leadsource }
    //                 );
    //                 const matchedBranch = BranchName.find(
    //                     (b) => b.label === row.branchname
    //                 );

    //                 if (matchedBranch) {
    //                     setSelectedbranchName(matchedBranch);
    //                 } else {
    //                     setSelectedbranchName({
    //                         value: row.branchname,
    //                         label: row.branchname,
    //                     });
    //                 }


    //                 // 🔥 Find matching pincodeId from transformed list
    //                 const matchedPincode = transformedPincodes.find(
    //                     (p) => p.label === row.pincode.toString()
    //                 );

    //                 if (matchedPincode) {
    //                     setSelectedPincodes(matchedPincode);
    //                 } else {
    //                     // fallback if not found
    //                     setSelectedPincodes({
    //                         value: row.pincode,
    //                         label: row.pincode.toString(),
    //                     });
    //                 }


    //                 // Map directly to applicant form state
    //                 // setApplicantForms([{
    //                 //     firstName: row.firstName || '',
    //                 //     lastName: row.lastName || '',
    //                 //     middleName: row.middleName || '',
    //                 //     mobileNo: row.mobileNo?.toString() || '',
    //                 //     dob: row.dob || '',
    //                 //     gender: row.gender || '',
    //                 //     email: row.email || '',
    //                 //     pan: row.pan || '',
    //                 //     aadhar: row.aadhar || '',
    //                 //     loanPurpose: row.loanPurpose || '',
    //                 //     leadSourceid: '',
    //                 //     leadSourceName: '',
    //                 //     branchNameid: '',
    //                 //     branchName: '',
    //                 //     pincodeid: '',
    //                 //     pincodeNumber: '',
    //                 //     stateName: '',
    //                 //     cityName: '',
    //                 //     areaName: '',
    //                 //     countryName: '',
    //                 //     product: '',
    //                 //     productid: '',
    //                 // }]);

    //                 // setActiveFormIndex(0);
    //                 Alert.alert("Success", "Form populated from Excel file!");
    //             }
    //         } else {
    //             Alert.alert('Unsupported', 'Please select an Excel (.xlsx or .xls) file.');
    //         }

    //     } catch (err) {
    //         if (!DocumentPicker.isCancel(err)) {

    //         }
    //     }
    // };


    const selectFileAutoPopulate = async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.allFiles],
            });

            const fileUri = res.uri;
            const fileName = res.name;
            const extension = fileName.split('.').pop().toLowerCase();

            const fileData = await RNFetchBlob.fs.readFile(fileUri, 'base64');
            const decoded = RNFetchBlob.base64.decode(fileData);

            if (extension === 'xlsx' || extension === 'xls') {
                const workbook = XLSX.read(decoded, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert to JSON with keys from header row
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                if (!jsonData || jsonData.length === 0) {
                    Alert.alert('Empty File', 'No data found in the Excel sheet.');
                    return;
                }



                if (jsonData.length === 1) {
                    // ✅ Case 1: Single Row → Auto Populate form
                    populateFormFromRow(jsonData[0]);
                    Alert.alert("Success", "Form populated from Excel file!");
                } else {
                    // ✅ Case 2: Multiple Rows → Bulk Processing
                    const formattedApplicants = jsonData.map((row) => formatApplicantRow(row));


                    // Save all into state for later API call or batch upload
                    // setApplicantForms(formattedApplicants);
                    // setShowSubmitButton(true);
                    // Alert.alert(
                    //     "Bulk Data Ready",
                    //     `${formattedApplicants.length} applicants loaded from Excel.`
                    // );
                }
            } else {
                Alert.alert('Unsupported', 'Please select an Excel (.xlsx or .xls) file.');
            }
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                console.error("File Picker Error:", err);
                Alert.alert("Error", "Failed to read Excel file.");
            }
        }
    };

    // 🔥 Utility: Populate the current form from one row
    const populateFormFromRow = (row) => {
        setFirstName(row.firstName || '');
        setLastName(row.lastName || '');
        setMiddleName(row.middleName || '');
        setDob(row.dob || '');
        setMobileNumber(row.mobileNo?.toString() || '');
        setSelectedgenders(row.gender || '');
        setEmail(row.email || '');
        setAadhaarNo(row.aadhar || '');
        setPan(row.pan || '');
        setSelectedLoanPurposeName(row.loanPurpose || '');

        // Lead Source mapping
        const matchedLeadSource = LeadDropdown.find(l => l.label === row.leadsource);
        setSelectedLeadSourceDropdown(
            matchedLeadSource || { value: row.leadsource, label: row.leadsource }
        );

        // Branch mapping
        const matchedBranch = BranchName.find(b => b.label === row.branchname);
        setSelectedbranchName(
            matchedBranch || { value: row.branchname, label: row.branchname }
        );

        // Pincode mapping
        const matchedPincode = transformedPincodes.find(
            p => p.label === row.pincode?.toString()
        );
        setSelectedPincodes(
            matchedPincode || { value: row.pincode, label: row.pincode?.toString() }
        );
    };

    // 🔥 Utility: Format a row into applicant object (for bulk processing)
    const formatApplicantRow = (row) => ({
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        middleName: row.middleName || '',
        mobileNo: row.mobileNo?.toString() || '',
        dob: row.dob || '',
        gender: row.gender || '',
        email: row.email || '',
        pan: row.pan || '',
        aadhar: row.aadhar || '',
        loanPurpose: row.loanPurpose || '',
        leadSource: row.leadsource || '',
        branchName: row.branchname || '',
        pincode: row.pincode?.toString() || '',
    });


    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        Alert.alert('Copied', 'Text copied to clipboard.');
    };



    useEffect(() => {
        // Check if selectedLeadfromtab is defined
        if (selectedLeadfromtab) {
            handleCardPress(selectedLeadfromtab); // Trigger handleCardPress if data exists
        } else {
            // Handle case where selectedLeadfromtab is undefined or empty

        }
    }, [selectedLeadfromtab]);


    // UseMemo for selectedLead to prevent recalculating on each render
    const selectedLeadId = useMemo(() => selectedLead?.leadId, [selectedLead]);
    const selectedCoApplicantId = useMemo(() => selectedCoApplicant?.id, [selectedCoApplicant]);
    const selectedLeadApplicantId = useMemo(() => SelectedLeadApplicant?.id, [SelectedLeadApplicant]);

    // Fetch Lead Details
    const fetchLeadDetails = useCallback(async (leadId) => {
        try {
            const response = await axios.get(`${BASE_URL}getLeadByLeadId/${leadId}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            const lead = response.data.data;

            const Applicantlead = lead.find(item => item.applicantTypeCode === 'Applicant')
            setApplicantleadByLeadiD(Applicantlead)
            setleadByLeadiD(lead);
        } catch (error) {
            console.error('Error fetching lead details:', error);
        }
    }, []);

    useEffect(() => {
        if (selectedLead) {
            fetchLeadDetails(selectedLeadId);
        }

    }, [selectedLead, selectedLeadId, fetchLeadDetails]);

    // Fetch Applicant Data by Pincode
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

    // Fetch Deviation by Lead ID
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



    const validateFields = () => {
        const missingFields = [];
        const {
            product,
            firstName,
            lastName,
            dob,
            gender,
            mobileNumber,
            pan,
            loanPurpose,
            leadSource,
            branchName,
            pincode,
            industryType,
            segmentType,
            orgName,
            regNumber,
            CINnumber,
            incorpDate,
            contactPerson,
            otherApplicantType
        } = formData;

        const isEmpty = (val) =>
            val === undefined || val === null || (typeof val === "string" && !val.trim());

        const occ = (finaloccupation || "").trim().toLowerCase();

        // ✅ CONFIG: Occupation → Required Fields
        const validationMap = {
            "salaried": [
                "product", "firstName", "lastName", "mobileNumber", "gender", "pan",
                "dob", "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "self employment": [
                "product", "firstName", "lastName", "mobileNumber", "gender", "pan",
                "dob", "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "house wife": [
                "product", "firstName", "lastName", "mobileNumber", "gender", "pan",
                "dob", "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "other": [
                "product", "firstName", "lastName", "mobileNumber", "gender", "pan",
                "dob", "leadSource", "loanPurpose", "branchName", "pincode", "otherApplicantType"
            ],

            "llp": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "sole proprietor": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "limited": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "private limited": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "partnership firm": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
        };

        // ✅ Field Labels for Better Error Messages
        const fieldLabels = {
            product: "Product",
            firstName: "First Name",
            lastName: "Last Name",
            dob: "Date of Birth",
            gender: "Gender",
            mobileNumber: "Mobile Number",
            pan: "PAN",
            loanPurpose: "Loan Purpose",
            leadSource: "Lead Source",
            branchName: "Sourcing Branch",
            pincode: "Pincode",
            industryType: "Industry Type",
            segmentType: "Segment Type",
            orgName: "Organization Name",
            regNumber: "Registration Number",
            CINnumber: "CIN Number",
            incorpDate: "Incorporation Date",
            contactPerson: "Contact Person",
            finaloccupation: "Applicant Type",
            otherApplicantType: 'Other Applicant Type',
        };

        // ✅ Dropdown Fields — will use “select” instead of “enter”
        const dropdownFields = [
            "pincode",
            "branchName",
            "leadSource",
            "industryType",
            "segmentType",
            "product",
            "finaloccupation",
            "dob", // if DOB is picked via date picker, treat as select
        ];

        // ✅ Validate occupation
        if (isEmpty(finaloccupation)) {
            missingFields.push("Please select Applicant Type");
        }

        const requiredFields = validationMap[occ];
        if (!requiredFields) {
            missingFields.push("Invalid occupation type selected.");
        } else {
            requiredFields.forEach((field) => {
                const value = formData[field];
                if (isEmpty(value)) {
                    const action = dropdownFields.includes(field) ? "select" : "enter";
                    missingFields.push(`Please ${action} ${fieldLabels[field]}`);
                }
            });
        }

        // ✅ Pattern Validations
        if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
            missingFields.push("Mobile Number must be a 10-digit number.");
        }

        if (pan && !/^([A-Z]{5}\d{4}[A-Z])$/.test(pan)) {
            missingFields.push("Invalid PAN format.");
        }

        return missingFields.length > 0 ? missingFields : true;
    };



    const validateFieldsCoApplicant = () => {
        const missingFields = [];
        const {
            applicantCategory,
            otherApplicantType,
            portfolio,
            product,
            firstName,
            middleName,
            lastName,
            dob,
            orgName,
            regNumber,
            CINnumber,
            incorpDate,
            keyPartnerDob,
            industryType,
            otherIndustryType,
            segmentType,
            segtypetxt,
            contactPerson,
            mobileNumber,
            gender,
            email,
            aadhaarNo,
            pan,
            loanPurpose,
            leadSource,
            branchName,
            pincode,
        } = formDataCo;

        const occ = (finaloccupationCo || "").trim().toLowerCase();
        const isOrg = (cateselecCo || "").toLowerCase() === "organization";

        const isEmpty = (val) =>
            val === undefined || val === null || (typeof val === "string" && !val.trim());

        // 🏷 Field Labels
        const fieldLabels = {
            product: "Product",
            firstName: "First Name",
            lastName: "Last Name",
            dob: "Date of Birth",
            gender: "Gender",
            mobileNumber: "Mobile Number",
            email: "Email",
            pan: "PAN",
            orgName: "Organization Name",
            regNumber: "Registration Number",
            CINnumber: "CIN Number",
            incorpDate: "Incorporation Date",
            industryType: "Industry Type",
            otherIndustryType: "Other Industry Type",
            segmentType: "Segment Type",
            segtypetxt: "Segment Type",
            contactPerson: "Contact Person",
            // loanPurpose: "Loan Purpose",
            // leadSource: "Lead Source",
            // branchName: "Sourcing Branch",
            pincode: "Pincode",
            otherApplicantType: 'Other Applicant Type',
        };

        // 🧩 Dropdown Fields (use “select”)
        const dropdownFields = [
            "finaloccupationCo",
            "industryType",
            "segmentType",
            "segtypetxt",
            "pincode",
        ];

        // 🗂 Occupation-based Required Fields
        const validationMap = {
            "salaried": ["firstName", "lastName", "mobileNumber", "gender", "pan", "dob", "pincode"],
            "self employment": ["firstName", "lastName", "mobileNumber", "gender", "pan", "dob", "pincode"],
            "house wife": ["firstName", "lastName", "mobileNumber", "gender", "pan", "dob", "pincode"],
            "other": ["firstName", "lastName", "mobileNumber", "gender", "pan", "dob", "pincode", "otherApplicantType"],

            "llp": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
            "sole proprietor": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
            "limited": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
            "private limited": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
            "partnership firm": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
        };

        // 🔹 Check Occupation
        if (isEmpty(finaloccupationCo)) {
            const labelText = isOrg ? "Registration Type" : "Primary Occupation";
            missingFields.push(`Please select a ${labelText}`);
        }

        const requiredFields = validationMap[occ];
        if (!requiredFields) {
            missingFields.push("Invalid co-applicant occupation type selected.");
        } else {
            requiredFields.forEach((field) => {
                if (isEmpty(formDataCo[field])) {
                    const action = dropdownFields.includes(field) ? "select" : "enter";
                    missingFields.push(`Please ${action} ${fieldLabels[field]}`);
                }
            });
        }

        // 🔸 Conditional Extra Fields for “Other” Industry Type
        if (isOrg) {
            if (payloadindco === "Other") {
                if (isEmpty(otherIndustryType))
                    missingFields.push(`Please enter ${fieldLabels.otherIndustryType}`);
                if (isEmpty(segtypetxt))
                    missingFields.push(`Please select ${fieldLabels.segtypetxt}`);
            } else if (isEmpty(segmentType)) {
                missingFields.push(`Please select ${fieldLabels.segmentType}`);
            }
        }

        // 🧾 Pattern Validations
        if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            missingFields.push("Invalid email format.");
        }

        if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
            missingFields.push("Mobile Number must be a 10-digit number.");
        }

        if (pan && !/^([A-Z]{5}\d{4}[A-Z])$/.test(pan)) {
            missingFields.push("Invalid PAN format.");
        }

        return missingFields.length > 0 ? missingFields : true;
    };




    // Call this function to show the validation alert
    const showAlertWithErrors = (validationErrors) => {
        if (Object.keys(validationErrors).length > 0) {
            const errorMessages = Object.keys(validationErrors)
                .map((key) => `${validationErrors[key]}`)
                .join('\n');

            Alert.alert('Validation Errors', errorMessages);
        } else {

            // Proceed with form submission or API call if needed
        }
    };


    const hideDatePicker = () => {
        setDatePickerVisibility(false); // Hide date picker modal
    };

    // Function to handle Gender change
    const handleGenderChange = (item) => {
        setSelectedgenders(item.value); // Set the selected gender value

    };
    const [selecteddesignation, setselecteddesignation] = useState('');
    const handleDesignationChange = (item) => {
        setselecteddesignation(item.value); // Set the selected gender value
        setdesign(item.label)
    };

    const [selecteddesignationco, setselecteddesignationco] = useState('');
    const handleDesignationChangeco = (item) => {
        setselecteddesignationco(item.value); // Set the selected gender value
        setdesignco(item.label)
    };
    const handleGenderChangeCo = (item) => {
        setcoSelectedgenders(item.value); // Set the selected gender value
    };

    const handleOtpChange = (text, type, index) => {
        if (type === 'applicant') {
            let newOtp = [...otpApplicant];  // Clone current array
            newOtp[index] = text;  // Update the corresponding index
            setOtpApplicant(newOtp);
        } else if (type === 'coApplicant') {
            let newOtp = [...otpCoApplicant];  // Clone current array
            newOtp[index] = text;  // Update the corresponding index
            setOtpCoApplicant(newOtp);
        }
    };

    const handleLeadStatusChange = (item) => {
        setSelectedLeadSourceDropdown(item.value); // Set the selected gender value
        setLeadSourceId(item.value); // Set the
        setLeadSource(item.label)
    };
    const [LeadSource, setLeadSource] = useState('');
    const [loanPurpose, setLoanPurpose] = useState('');
    const [branchName, setBranchName] = useState('');

    const handleBranchNameChange = (item) => {
        setSelectedbranchName(item.value); // Set the selected gender value
        // setLeadSourceId(item.value); // Set the
        setBranchName(item.label);
    };



    const handleLoanPurposeChange = (item) => {
        setSelectedLoanPurposeName(item.value); // Set the selected gender value
        // setLeadSourceId(item.value); // Set the


        setLoanPurpose(item.label);
    };

    const resetfield = () => {
        // Reset all fields and error messages
        setErrors({});
        setFirstName('');
        setcoFirstName('');

        setMiddleName('');
        setcoMiddleName('');

        setLastName('');
        setcoLastName('');

        setDob('');
        setcoDob('');

        setEmail('');
        setcoEmail('');

        setMobileNumber('');
        setcoMobileNumber('');

        setPan('');
        setcoPan('');

        setAadhaarNo('');
        setcoAadhaarNo('');


        setSelectedPincodes('');
        setcoSelectedPincodes('')

        setFindApplicantByCategoryCod('');
        setcoFindApplicantByCategoryCod('');

        setSelectedgenders('');
        setcoSelectedgenders('');

        setSelectedLeadSourceDropdown('');
        setActiveTab('Applicant')
        setisSubmittingApplicant(false);
        setShowSubmitButton(false);
        setIsSettlement(false);


        setSelectedLoanPurposeName('');
        setSelectedbranchName('');
        setLoanPurpose('');
        setBranchName('');
        setLeadSource('')
        setCoApplicant(false);
        // setSelectedLeadSourceDropdown('');

        // setSelectedLeadSourceDropdown('');
    }

    const handleSave = () => {
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

            // Proceed to create the lead if switch is OFF

            if (isSettlement) {
                setShowSubmitButton(true);
            } else {
                CreateLead();
                // setActiveTab('Co-applicant');
                // setCoApplicant(true);
                // // setisSubmittingApplicant(true); // Set the
            }

        }
    };

    const handleSubmit = () => {
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
            CreateLeadwithoutCoApplicant();
        }
    }


    const handleSaveCoApplicant = () => {
        const residenceValidationResult = validateFieldsCoApplicant();
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
            CreateLeadCoApplicant();
        }
    };

    const handleSaveCoApplicantifForget = () => {
        const residenceValidationResult = validateFieldsCoApplicant();
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
            CreateLeadCoApplicantIfForget();
        }
    };

    const convertToAPIDateFormat = (dob) => {
        return moment(dob, 'DD-MM-YYYY').format('YYYY-MM-DD');
    };

    const handleWithoutCoApplicant = () => {
        setIsModalVisible(false)
        resetfield(); // Clear form fields
        handleCardPress();
        getAllLeads(); // Refresh leads list
    }
    const handleClosePress = () => {
        setApplicantForms([])
        setorgname('');
        setorgnameco('');

        setselectedorgtype('');
        setselectedorgtypeco('');
        setorgtype([]);
        setorgtypeco([]);

        setregnumber('');
        setregnumberco('');

        setincorpratedat('')
        setincorpratedatco('');

        setkeybusinessparnerdob('');
        setkeybusinessparnerdobco('');

        setnumberofemp('');
        setnumberofempco('');

        setselectedindtype('');
        setselectedindtypeco('');

        setorgtype([]);
        setorgtypeco([]);
        setselectedsegtype('');
        setselectedsegtypeco('');

        setcontactperson('');
        setcontactpersonco('');

        setdesign('');
        setdesignco('');

        setfax('');
        setfaxco('');

        setnofmonthinbusiness('')
        setnofmonthinbusinessco('')

        setnofyearinbusiness('')
        setnofyearinbusinessco('');



        setLoadingCo(false);
        setgetByType([]);
        setgetByTypeCo([]);
        setselectsetgetByType('');
        setSelectedCategory('');
        setcatselct('');
        setfinaloccupation('');
        setfinaloccupationCo('');
        setCardVisible(false); // Remove
        setIsModalVisible(false);
        setSelectedPincodes('');
        setcoSelectedPincodes('');

        setSelectedApplicantType(''); // remove
        setSelectedExistinguser('');
        setSelectedportfolio('');
        setSelectedproduct('');
        setpayloadportfolio('');
        setpayloadproduct('');
        setSelectedsalutation('');
        setSelectedgenders('');
        setSelectedbranch('');
        setSelectedloanpurpose('');
        setSelectedsourceType('');

        setFirstName('');
        setMiddleName('');
        setLastName('');
        setMobileNumber('');
        setEmail('');
        setPan('');
        setAadhaarNo('');
        setDobError('')
        setcoDobError(''),
            setDob('');
        setGender('');
        setLoanAmount('');

        setFindApplicantByCategoryCod('');
        setcoFindApplicantByCategoryCod('');
        setFirstName('');
        setMiddleName('');
        setLastName('');
        setMobileNumber('');
        setEmail('');
        setPan('');
        setAadhaarNo('');
        setDob('');
        setSelectedgenders('')
        setSelectedPincodes('');

        setFindApplicantByCategoryCod('');

        setcoFirstName('');
        setcoMiddleName('')
        setcoLastName('');
        setcoMobileNumber('');
        setcoEmail('');
        setcoPan('');
        setcoAadhaarNo('');
        setcoDob('');
        setcoSelectedgenders('')
        setcoSelectedPincodes('');

        setcoFindApplicantByCategoryCod('');

        setErrors({});
        setActiveTabView('Applicant');
        setActiveTab('Applicant');
        setSelectedLeadSourceDropdown('')
        setSelectedLoanPurposeName('');
        setSelectedbranchName('');
        setLoanPurpose('');
        setBranchName('');
        setLeadSource('')
        setIsSettlement(false); // Reset the Switch to OFF
        setShowSubmitButton(false); // Hide the Submit button
        getAllLeads();
        setisSubmittingApplicant(false); //
        setCoApplicant(false); // Reset the CoApplicant

        setFormData({
            applicantCategory: "",
            otherApplicantType: "",
            portfolio: "",
            product: "",
            firstName: "",
            middleName: "",
            lastName: "",
            dob: "",
            orgName: "",
            regNumber: "",
            CINnumber: "",
            incorpDate: "",
            keyPartnerDob: "",
            industryType: "",
            otherIndustryType: "",
            segmentType: "",
            nofmonthinbusiness: "",
            nofyearinbusiness: "",
            designation: "",
            contactPerson: "",
            mobileNumber: "",
            gender: "",
            email: "",
            aadhaarNo: "",
            pan: "",
            loanPurpose: "",
            leadSource: "",
            branchName: "",
            pincode: "",
            country: "",
            city: "",
            state: "",
            area: "",
        });

        setFormDataCo({
            applicantCategory: "",
            otherApplicantType: "",
            portfolio: "",
            product: "",
            firstName: "",
            middleName: "",
            lastName: "",
            dob: "",
            orgName: "",
            regNumber: "",
            CINnumber: "",
            incorpDate: "",
            keyPartnerDob: "",
            industryType: "",
            otherIndustryType: "",
            segmentType: "",
            nofmonthinbusiness: "",
            nofyearinbusiness: "",
            designation: "",
            contactPerson: "",
            mobileNumber: "",
            gender: "",
            email: "",
            aadhaarNo: "",
            pan: "",
            loanPurpose: "",
            leadSource: "",
            branchName: "",
            pincode: "",
            country: "",
            city: "",
            state: "",
            area: "",
        });

        // Optional: reset other state variables if needed
        setDobError("");
        setDateErrors({})
    };

    const CreateLeadwithoutCoApplicant = async () => {
        setLoading(true); // Show the loader
        setIsLoadingsentotp(true);
        const applicantLeaddto = {
            applicantTypeCode: 'Applicant',
            aadhar: formData.aadhaarNo || "",
            dateOfBirth: formData.dob
                ? convertToAPIDateFormat(formData.dob)
                : convertToAPIDateFormat(formData.incorpDate),
            email: formData.email || "",
            firstName: formData.firstName || "",
            gender: formData.gender.label || "",
            lastName: formData.lastName || "",
            middleName: formData.middleName || "",
            leadSourceId: formData.leadSource?.value || "",
            branchId: formData.branchName?.value || "",
            loanPurpose: formData.loanPurpose || "",
            mobileNo: formData.mobileNumber || "",
            pan: formData.pan || "",
            pincodeId: formData.pincode?.value || '',
            userId: mkc.userId || "",
            createdBy: mkc.userName || "",
            isActive: true,
            portfolioName: formData.portfolio || portfolioDescriptions[0]?.label || "",
            productName: formData.product.label || "",
            applicantCategoryCode: formData.applicantCategory.label || "",
            productId: selectedproduct || "",  // if productId comes from another state, keep it
            portfolioId: selectedportfolio || portfolioDescriptions[0]?.value || "",
            primaryOccupation: finaloccupation || "",
            primaryOccupationOtherType: formData.otherApplicantType || "",

            // Organization specific fields
            businessDOB: formData.keyPartnerDob ? convertToAPIDateFormat(formData.keyPartnerDob) : "",
            faxNumber: formData.fax || "",
            contactPersonDesignation: formData.designation.label || "",
            registrationNumber: formData.regNumber || "",
            cin: formData.CINnumber || "",
            organizationName: formData.orgName || "",
            organizationType: payloadorgtype || "",  // keep if coming from another state
            industryType: formData.industryType.label || "",
            segmentType: formData.segmentType.label || formData.segtypetxt || "",
            industryOtherType: formData.otherIndustryType || "",
            segmentOtherType: formData?.segtypetxt || "",
            noOfEmployee: formData.numberOfEmp || "",
            contactPersonName: formData.contactPerson || "",
            noOfMonthsInBusiness: formData.nofmonthinbusiness || "",
            noOfYearsInBusiness: formData.nofyearinbusiness || "",



        };

        const coApplicantLeaddto = {
        }
        const payload = { applicantLeaddto, coApplicantLeaddto };
        try {
            const response = await axios.post(`${BASE_URL}lead`, payload,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );


            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Unexpected status code: ${response.status}`);
            }

            if (response.data && response.data.msgKey === 'Success') {
                const leadId = response.data.data.leadId;
                setleadID(leadId);


                // Concatenate the message with the additional text
                const toastMessage = `${response.data.message} of Applicant!!`;
                handleClosePress();
                showToast(toastMessage); // Show the concatenated message in the toast
                setloading(false);
                setIsLoadingsentotp(false);
                Alert.alert(
                    'Success',
                    response.data.message || 'Co-Applicant added successfully!',
                    [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
                );

                // Wait for the toast to be visible for 2 seconds before switching tab
                // setTimeout(() => {
                //     setActiveTab('Co-applicant');
                // }, 3000); // Delay the tab switch by 3 seconds (adjust as needed)
                // setLoading(false);
            } else {
                console.warn('API did not return success:', response.data);
                Alert.alert('Error', response.data.msgKey || 'Failed to add lead. Please try again.');
                setloading(false);
                setIsLoadingsentotp(false);

            }

        } catch (error) {
            console.error('Error submitting form:', error);
            Alert.alert('Error', 'An error occurred. Please try again later.');
            setloading(false);
            setIsLoadingsentotp(false);
        } finally {
            setLoading(false);
        }
    };


    const CreateLead = async () => {
        // setLoading(true); // Show the loader
        // const payload = {
        //     applicantTypeCode: 'Applicant',
        //     aadhar: aadhaarNo,
        //     dateOfBirth: convertToAPIDateFormat(dob),
        //     email: email,
        //     firstName: firstName,
        //     gender: selectedgenders,
        //     lastName: lastName,
        //     middleName: middleName,
        //     leadSourceId: SelectdLeadSourceDropdown,
        //     branchId: SelectdbranchName,
        //     loanPurpose: SelectdLoanPurposeName,
        //     mobileNo: mobileNumber,
        //     pan: pan,
        //     pincodeId: selectedPincodes?.value || '',
        //     userId: mkc.userId,
        //     createdBy: mkc.userName,
        //     isActive: true,
        // };

        // try {
        //     const response = await axios.post(`${BASE_URL}lead`, payload,
        //         {
        //             headers: {
        //                 Accept: 'application/json',
        //                 'Content-Type': 'application/json',
        //                 Authorization: 'Bearer ' + token, // Add the token to the Authorization header
        //             }
        //         }
        //     );
        //     

        //     if (response.status < 200 || response.status >= 300) {
        //         throw new Error(`Unexpected status code: ${response.status}`);
        //     }

        //     if (response.data && response.data.msgKey === 'Success') {
        //         const leadId = response.data.data.leadId;
        //         setleadID(leadId);
        //         fetchLeadDetails(leadId)
        //         

        //         // Concatenate the message with the additional text
        //         const toastMessage = `${response.data.message} of Applicant!!`;

        //         showToast(toastMessage); // Show the concatenated message in the toast
        setCoApplicant(true); // Set the                            
        //         // Wait for the toast to be visible for 2 seconds before switching tab
        //         setTimeout(() => {
        setActiveTab('Co-Applicant');
        setisSubmittingApplicant(true); // Set the
        setsegtypeco([]);
        //         }, 100); // Delay the tab switch by 3 seconds (adjust as needed)
        //         setLoading(false);
        //     } else {
        //         console.warn('API did not return success:', response.data);
        //         Alert.alert('Error', response.data.msgKey || 'Failed to add lead. Please try again.');
        //     }

        // } catch (error) {
        //     console.error('Error submitting form:', error);
        //     Alert.alert('Error', 'An error occurred. Please try again later.');
        // } finally {
        //     setLoading(false);
        // }
    };

    const CreateLeadCoApplicant = async () => {
        setLoadingCo(true); // Show the loader
        setIsLoadingsentotp(true);
        const applicantLeaddto = {
            applicantTypeCode: 'Applicant',
            aadhar: formData.aadhaarNo || "",
            dateOfBirth: formData.dob
                ? convertToAPIDateFormat(formData.dob)
                : convertToAPIDateFormat(formData.incorpDate),
            email: formData.email || "",
            firstName: formData.firstName || "",
            gender: formData.gender.label || "",
            lastName: formData.lastName || "",
            middleName: formData.middleName || "",
            leadSourceId: formData.leadSource?.value || "",
            branchId: formData.branchName?.value || "",
            loanPurpose: formData.loanPurpose || "",
            mobileNo: formData.mobileNumber || "",
            pan: formData.pan || "",
            pincodeId: formData.pincode?.value || '',
            userId: mkc.userId || "",
            createdBy: mkc.userName || "",
            isActive: true,
            portfolioName: formData.portfolio || portfolioDescriptions[0]?.label || "",
            productName: formData.product.label || "",
            applicantCategoryCode: formData.applicantCategory.label || "",
            productId: selectedproduct || "",  // if productId comes from another state, keep it
            portfolioId: selectedportfolio || portfolioDescriptions[0]?.value || "",
            primaryOccupation: finaloccupation || "",
            primaryOccupationOtherType: formData.otherApplicantType || "",

            // Organization specific fields
            businessDOB: formData.keyPartnerDob ? convertToAPIDateFormat(formData.keyPartnerDob) : "",
            faxNumber: formData.fax || "",
            contactPersonDesignation: formData.designation.label || "",
            registrationNumber: formData.regNumber || "",
            cin: formData.CINnumber || "",
            organizationName: formData.orgName || "",
            organizationType: payloadorgtype || "",  // keep if coming from another state
            industryType: formData.industryType.label || "",
            segmentType: formData.segmentType.label || formData.segtypetxt || "",
            industryOtherType: formData.otherIndustryType || "",
            segmentOtherType: formData?.segtypetxt || "",
            noOfEmployee: formData.numberOfEmp || "",
            contactPersonName: formData.contactPerson || "",
            noOfMonthsInBusiness: formData.nofmonthinbusiness || "",
            noOfYearsInBusiness: formData.nofyearinbusiness || "",




        };



        const coApplicantLeaddto = {
            applicantTypeCode: 'Co-Applicant',
            aadhar: formDataCo?.aadhaarNo || "",
            dateOfBirth: formDataCo?.dob
                ? convertToAPIDateFormat(formDataCo?.dob)
                : convertToAPIDateFormat(formDataCo?.incorpDate),
            email: formDataCo?.email || "",
            firstName: formDataCo?.firstName || "",
            gender: formDataCo?.gender?.label || "",
            lastName: formDataCo?.lastName || "",
            middleName: formDataCo?.middleName || "",
            mobileNo: formDataCo?.mobileNumber || "",
            pan: formDataCo?.pan || "",
            pincodeId: formDataCo?.pincode?.value || '',
            userId: mkc.userId || "",
            createdBy: mkc.userName || "",
            isActive: true,
            // leadId: leadID, // Pass leadId directly
            leadSourceId: SelectdLeadSourceDropdown || "",
            branchId: SelectdbranchName || "",
            loanPurpose: SelectdLoanPurposeName || "",
            portfolioName: payloadportfolio || portfolioDescriptions[0]?.label || "",
            productName: payloadproduct || "",
            applicantCategoryCode: cateselecCo || "",


            productId: selectedproduct || "",
            portfolioId: selectedportfolio || portfolioDescriptions[0]?.value || "",
            primaryOccupation: formDataCo?.getByType?.label || "",
            primaryOccupationOtherType: formDataCo?.otherApplicantType || "",
            businessDOB: formDataCo?.keyPartnerDob ? convertToAPIDateFormat(formDataCo?.keyPartnerDob) : '',
            faxNumber: faxco || "",
            contactPersonDesignation: formDataCo?.designation?.label || "",
            registrationNumber: formDataCo?.regNumber || "",
            cin: formDataCo?.CINnumber || "",
            organizationName: formDataCo?.orgName || "",
            organizationType: payloadorgtypeco || "",
            industryType: formDataCo?.industryType?.label || "",
            segmentType: formDataCo?.segmentType?.label || formDataCo?.segtypetxt || "",
            industryOtherType: formDataCo.otherIndustryType || "",
            segmentOtherType: formDataCo?.segtypetxt || "",
            contactPersonName: formDataCo?.contactPerson || "",
            noOfMonthsInBusiness: formDataCo?.nofmonthinbusiness || "",
            noOfYearsInBusiness: formDataCo?.nofyearinbusiness || "",
        };

        const payload = { applicantLeaddto, coApplicantLeaddto };
        try {
            const response = await axios.post(`${BASE_URL}lead`, payload,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );


            if (response.data && response.data.msgKey === 'Success') {

                resetfield(); // Clear form fields
                getAllLeads(); // Refresh leads list
                handleClosePress();
                Alert.alert(
                    'Success',
                    response.data.message || 'Co-Applicant added successfully!',
                    [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
                );
                const toastMessage = `${response.data.message} of Co-Applicant!!`;
                showToast(toastMessage); // Show the concatenated message in the toast
                setLoadingCo(false);
                setIsLoadingsentotp(false);
            } else {
                console.warn('API did not return success for Co-Applicant:', response.data);
                Alert.alert('Error', response.data.message || 'Failed to add Co-Applicant. Please try again.');
                setLoadingCo(false)
                setIsLoadingsentotp(false);
            }

        } catch (error) {
            console.error('Error submitting Co-Applicant form:', error);
            Alert.alert('Error', 'An error occurred. Please try again later.');
            setIsLoadingsentotp(false);
        } finally {
            // setLoadingCo(false);
        }
    };

    const CreateLeadCoApplicantIfForget = async () => {
        setLoadingCo(true); // Show the loader
        const payload = {
            applicantTypeCode: 'Co-Applicant',
            aadhar: coaadhaarNo,
            dateOfBirth: convertToAPIDateFormat(codob),
            email: coemail,
            firstName: cofirstName,
            gender: coselectedgenders,
            lastName: colastName,
            middleName: comiddleName,
            mobileNo: comobileNumber,
            pan: copan,
            pincodeId: coselectedPincodes?.value || '',
            userId: mkc.userId,
            createdBy: mkc.userName,
            isActive: true,
            leadId: Applicantlead.leadId, // Pass leadId directly
            leadSourceId: Applicantlead.leadSourceId,
            branchId: Applicantlead.branchId,
            loanpurpose: Applicantlead.loanPurpose,
            portfolioName: payloadportfolio,
            productName: payloadproduct,
            applicantCategoryCode: cateselecCo,
            productId: selectedproduct,
            portfolioId: selectedportfolio,
            primaryOccupation: finaloccupation,

        };

        try {
            const response = await axios.post(`${BASE_URL}lead`, payload,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );


            if (response.data && response.data.msgKey === 'Success') {


                resetfield(); // Clear form fields
                getAllLeads(); // Refresh leads list
                handleClosePress();
                Alert.alert(
                    'Success',
                    response.data.message || 'Co-Applicant added successfully!',
                    [{ text: 'OK', onPress: () => setModalVisibleCoAPplicant(false) }]
                );
                const toastMessage = `${response.data.message} of Co-Applicant!!`;
                showToast(toastMessage); // Show the concatenated message in the toast
                setLoadingCo(false);
                handleCloseAdddata();
            } else {
                console.warn('API did not return success for Co-Applicant:', response.data);
                Alert.alert('Error', response.data.msgKey || 'Failed to add Co-Applicant. Please try again.');
            }

        } catch (error) {
            console.error('Error submitting Co-Applicant form:', error);
            Alert.alert('Error', 'An error occurred. Please try again later.');
        } finally {
            setLoadingCo(false);
        }
    };


    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [isSettlement, setIsSettlement] = useState(false);


    const toggleSwitch = () => {
        const nextState = !isSettlement;
        setIsSettlement(nextState);
        setShowSubmitButton(nextState); // Show the button when switch is ON (true), hide when OFF (false)
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


    const formatDateForce = (timestamp) => {
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return "-";

        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();

        return `${dd}-${mm}-${yyyy}`;
    };



    const formtime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString(); // Converts to a string like "MM/DD/YYYY, HH:MM:SS AM/PM"
    };


    useEffect(() => {
        if (leadByLeadiD && leadByLeadiD.length > 0) {


            // Initialize variables to hold Applicant and Co-Applicant data
            let applicant = "";
            let coApplicant = "";

            // Loop through the array and separate Applicant and Co-Applicant
            leadByLeadiD.forEach((person) => {
                if (person.applicantTypeCode === 'Applicant') {
                    applicant = person;
                } else if (person.applicantTypeCode === 'Co-Applicant') {
                    coApplicant = person;
                }
            });




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

    const handleClose = () => {
        setModalVisible(false);  // Close the modal
        setSelectedCoApplicant([]);
        setSelectedLeadApplicant([]);
        getAllLeads();
        setCoApplicant(false); //
        setIsLoadingLeads(false);
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
    };

    const handleCloseAdddata = () => {
        setModalVisibleCoAPplicant(false)
        setSelectedLeadApplicant([]);
        setSelectedCoApplicant([]);
        setleadByLeadiD('');
        setcoPan('');
        setcoAadhaarNo('');
        setcoMobileNumber('');
        setcoDob('');
        setcoEmail('');
        setcoFirstName('');
        setcoLastName('');
        setcoSelectedPincodes('');
        setcoSelectedgenders('');
        getAllLeads();
        setCoApplicant(false); //
        if (selectedLead) {
            fetchLeadDetails(selectedLeadId);
        }


    }

    // const base64FileData = Buffer.from(downloadCibilReportApplicant.file, 'binary').toString('base64');


    const requestManageExternalStoragePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'App needs access to your storage to open the file',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {

            } else {

                Alert.alert(
                    'Permission Denied',
                    'You need to enable permission in settings to access storage'
                );
            }
        } catch (err) {
            console.warn(err);
        }
    };



    useEffect(() => {
        requestManageExternalStoragePermission
    }, []);


    // Request permission for storage (Android 6.0 and above)
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
            // Check if filesData is empty
            if (!filesData || filesData.length === 0) {
                Alert.alert('No Files', 'There are no files to download.');
                return;
            }
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



    const handleLeadClick = (item) => {
        if (item?.leadStatus?.leadStatusName?.toLowerCase() === 'under credit review') {
            const matchingApplicant = filteredData.find((dataItem) =>
                dataItem?.applicantTypeCode === 'Applicant' && dataItem?.leadId === item?.leadId
            );

            if (matchingApplicant) {
                fetchLeadDetails(item?.leadId);
            }
        }
    };
    useEffect(() => {
        if (backupselectedCard) {
            fetchLeadDetailsbackup(backupselectedCard.leadId);
        }
    }, [backupselectedCard, fetchLeadDetailsbackup]);  // Ensure fetchLeadDetails is stable

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

    const formatNumberWithCommas = (value) => {
        if (!value || isNaN(value)) return value; // Return original value if not a valid number
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
    };

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

        // ⭐ Fields that should ALWAYS behave as multiline
        const ALWAYS_MULTILINE = [
            "Address",
            "Organization Name",
            "Contact Person",
            "Designation",
            "Description",
            "Email"
        ];

        const renderedFields = fields
            .map(f => {
                if (!f.value) return null;

                const stringValue = String(f.value);

                // ⭐ Auto-detect multiline based on FIELD or CONTENT length
                const isMultiline =
                    ALWAYS_MULTILINE.includes(f.label) || stringValue.length > 25;

                // ----- CASE: Field with extra UI -----
                if (f.extra) {
                    return (
                        <View
                            key={f.label}
                            style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}
                        >
                            <CustomInput
                                label={f.label}
                                value={stringValue}
                                setValue={() => { }}
                                editable={false}
                                multiline={isMultiline}
                                isVerified={f.verified || false}
                            />

                            {f.extra(handleDownloadCibilFile)}
                        </View>
                    );
                }

                // ----- CASE: Normal read-only field -----
                return (
                    <CustomInput
                        key={f.label}
                        label={f.label}
                        value={stringValue}
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
            { label: "Name", value: applicant.firstName || applicant.lastName ? `${applicant.firstName || ''} ${applicant?.middleName || ''} ${applicant.lastName || ''}`.trim() : null, verified: applicant.panValid },
            { label: "Organization Name", value: applicant.organizationName, verified: applicant.panValid },
            { label: applicant.organizationName ? "Incorporation Date" : "Date of Birth", value: formatDate(applicant.dateOfBirth), verified: applicant.panValid },
            ...(applicant.applicantCategoryCode === "Organization" ? [
                { label: "Organization Type", value: applicant.organizationType },
                { label: "Registration Number", value: applicant.registrationNumber },

                { label: "CIN Number", value: applicant.cin },
                {
                    label: applicant?.applicantCategoryCode === "Organization"
                        ? "Registration Type"
                        : "Primary Occupation",
                    value: applicant?.primaryOccupation,
                },
                { label: "Industry Type", value: applicant.industryType },
                { label: "Segment Type", value: applicant.segmentType },
                { label: "Contact Person", value: applicant.contactPersonName },
                { label: "Designation", value: applicant.contactPersonDesignation },

            ] : []),

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
        // { label: "Category Type", value: applicant?.applicantCategoryCode },
        { label: "Portfolio", value: applicant?.portfolioName },
        { label: "Product", value: applicant?.productName },
        { label: "Lead Source", value: applicant?.leadSourceName },
        { label: "Lead Status", value: applicant?.leadStatusName },
        { label: "Lead Stage", value: applicant?.leadStage },
        { label: "Lead ID", value: applicant?.leadId },
        { label: "Assigned To", value: applicant?.assignTo },
        { label: "Created By", value: applicant?.createdBy },
        { label: "CIBIL Score", value: applicant?.cibilScore },


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
        { label: "Bureau Score", value: applicant?.crifScore },
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
        if (!Array.isArray(deviations) || deviations.length === 0) {
            return <Text style={styles.noDeviationText}>No deviations available</Text>;
        }

        return deviations.map((item, index) => (
            <View key={index} style={styles.sectionContainer}>

                {/* Row 1: Description + Last Modified */}
                <View style={styles.row1}>
                    {item.description && (
                        <View style={styles.halfWidth}>
                            <CustomInputy
                                label="Description"
                                value={item.description}
                                editable={false}
                                multiline
                            />
                        </View>
                    )}

                    {item.lastModifiedTime && (
                        <View style={styles.halfWidth}>
                            <CustomInputy
                                label="Last Modified"
                                value={formtime(item.lastModifiedTime)}
                                editable={false}
                            />
                        </View>
                    )}
                </View>

                {/* Row 2: Status Info */}
                <View style={styles.row1}>
                    {item.approvedBy && (
                        <View style={styles.halfWidth}>
                            <CustomInputy
                                label="Approved By"
                                value={item.approvedBy}
                                editable={false}
                            />
                        </View>
                    )}

                    {item.rejectedBy && (
                        <View style={styles.halfWidth}>
                            <CustomInputy
                                label="Rejected By"
                                value={item.rejectedBy}
                                editable={false}
                            />
                        </View>
                    )}

                    {item.isApproved !== undefined && (
                        <View style={styles.halfWidth}>
                            <CustomInputy
                                label="Status"
                                value={item.isApproved ? "Approved" : "Rejected"}
                                editable={false}
                            />
                        </View>
                    )}
                </View>

                {/* Full Width Fields */}
                {item.deviationLog && (
                    <View style={styles.fullWidth}>
                        <CustomInputy
                            label="Deviation Log"
                            value={item.deviationLog}
                            editable={false}
                            multiline
                        />
                    </View>
                )}

                {item.rejectReason && (
                    <View style={styles.fullWidth}>
                        <CustomInputy
                            label="Reject Reason"
                            value={item.rejectReason}
                            editable={false}
                            multiline
                        />
                    </View>
                )}
            </View>
        ));
    };


    const renderTabContent = (tab) => {
        const data = tab === 'Applicant' ? SelectedLeadApplicant : selectedCoApplicant;
        const location = tab === 'Applicant' ? findApplicantByCategoryCodeview : cofindApplicantByCategoryCodView;
        const deviations = tab === 'Applicant' ? deviationApplicant : deviationCoApplicant;
        const downloadCibil = tab === 'Applicant' ? downloadCibilReportApplicant : downloadCibilReportCoApplicant;

        if (!data || Object.keys(data).length === 0 || !location.data) {

            return (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#007bff" />
                    <Text style={{ marginTop: 8, color: 'gray' }}>Loading...</Text>
                </View>
            );
        }

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
                    <Section title="Deviatiddon">
                        <DeviationSection deviations={deviations} />
                    </Section>
                )}
            </>
        );
    };

    const Sections = ({ title, children, setIsModalVisible, handleClosePress }) => (
        <View>
            {/* Title and Close icon in one row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 10, }}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {/* Close Icon */}
                <TouchableOpacity onPress={handleClosePress} style={{ paddingLeft: 10 }}>
                    <Image source={require('../../asset/close.png')} />
                </TouchableOpacity>
            </View>

            {children}
        </View>
    );

    const labelText = cateselec === "Individual" ? "Primary Occupation" : "Registration Type";
    const labelTextCo = cateselecCo === "Individual" ? "Primary Occupation" : "Registration Type";
    const placeholderText = cateselec === "Individual" ? "Primary Occupation" : "Registration Type";

    useEffect(() => {
        if (payloadproduct === "Joint Liability Group loan") {
            setShowSubmitButton(true);
        }
    }, [payloadproduct])





    const [formData, setFormData] = useState({
        applicantCategory: "",
        otherApplicantType: "",
        portfolio: "",
        product: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        orgName: "",
        regNumber: "",
        CINnumber: "",
        incorpDate: "",
        keyPartnerDob: "",
        industryType: "",
        otherIndustryType: "",
        segmentType: "",
        nofmonthinbusiness: "",
        nofyearinbusiness: "",
        designation: "", // for sole proprietor / llp occupations
        contactPerson: "",
        mobileNumber: "",
        gender: "",
        email: "",
        aadhaarNo: "",
        pan: "",
        loanPurpose: "",
        leadSource: "",
        branchName: "",
        pincode: "",
        country: "",
        city: "",
        state: "",
        area: "",
    });

    const handleInputChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handlePanValidation = async (panNumber) => {
        try {
            const response = await axios.get(`${BASE_URL}getLeadsByPan`, {
                params: { pan: panNumber },
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const list = response.data?.data || [];
            if (!Array.isArray(list) || list.length === 0) return;
            try {
                const logApp = await axios.get(
                    `${BASE_URL}getAllApplication`,
                    {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // 👇 pick ONLY what you need
                console.log(logApp, 'logApplogApplogApp')
            } catch (e) {
                console.warn("Log fetch failed for", item.id);
            }
            // 🔥 Fetch logs for each applicationNo (PARALLEL)
            const enrichedCases = await Promise.all(
                list.map(async (item) => {
                    let logs = null;

                    if (item?.id) {
                        try {
                            const logRes = await axios.get(
                                `${BASE_URL}getApplicationById/${item.id}`,
                                {
                                    headers: {
                                        Accept: "application/json",
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            // 👇 pick ONLY what you need
                            logs = logRes.data?.data || null;
                            console.log(logs, logRes, 'gettApplicatiobyidlogslogs')
                        } catch (e) {
                            console.warn("Log fetch failed for", item.id);
                        }
                    }

                    return {
                        // 🔹 PAN DATA
                        pan: panNumber,
                        applicationNo: item?.applicationNumber,
                        name: `${item?.fullName || ""}`.trim(),
                        loginId: item?.loginId || "-",
                        loginDate: formatDateForce(item?.createdDate),
                        caseType: item?.productName,
                        caseStatus: item?.applicationStage,
                        executive: item?.createdBy,
                        dealer: item?.leadSource,
                        applicantTypeCode: item?.applicantTypeCode,

                        // 🔹 LOG DETAILS (USED IN CARDS)
                        lastAction: logs?.action,
                        Status: logs?.status,
                        lastRemark: logs?.remark,
                        updatedBy: logs?.createdBy,
                        updatedAt: formatDateForce(logs?.createdTime),
                        lan: item?.lan
                    };
                })
            );

            setExistingCustomerData(enrichedCases); // ✅ ARRAY
            setExistsModalVisible(true);
            setAllDesignation(list);

        } catch (error) {
            console.error("PAN validation error", error);
            Alert.alert("Error", "Failed to fetch PAN details");
        }
    };


    const handleCategoryChange = useCallback((item) => {
        setSelectedCategory(item.value);
        setcatselct(item.label);

        setFormData((prev) => {
            const isOrganization = (item.label || "").toLowerCase() === "organization";

            // Fields specific to Organization
            const organizationFields = [
                "industryType",
                "otherIndustryType",
                "segmentType",
                "segtypetxt",
                "orgName",
                "regNumber",
                "CINnumber",
                "incorpDate",
                "keyPartnerDob",
                "businessDuration",
                "pan",
                "contactPerson",
                "designation",
                "gender",
                "aadhaarNo",
            ];

            // Fields specific to Individual
            const individualFields = [
                "firstName",
                "middleName",
                "lastName",
                "dob",
                "gender",
                "aadhaarNo",
                "pan",
            ];

            // Determine which fields to reset
            const fieldsToReset = isOrganization ? individualFields : organizationFields;

            // Reset only the relevant fields
            const updated = { ...prev, applicantCategory: item };
            fieldsToReset.forEach((key) => {
                updated[key] = "";
            });

            return updated;
        });
    }, []);
    const handleCategoryChangeCo = useCallback((item) => {
        const categoryValue = item?.value; // 113 / 114
        const categoryLabel = item?.label;

        setcatselctCo(categoryLabel);
        setapplicantCategoryCo(categoryValue);

        const isOrganization = categoryValue === 113;

        setFormDataCo((prev) => {
            const organizationFields = [
                "industryType",
                "otherIndustryType",
                "segmentType",
                "segtypetxt",
                "orgName",
                "regNumber",
                "CINnumber",
                "incorpDate",
                "keyPartnerDob",
                "businessDuration",
                "pan",
                "contactPerson",
                "designation",
                "gender",
                "aadhaarNo",
            ];

            const individualFields = [
                "firstName",
                "middleName",
                "lastName",
                "dob",
                "gender",
                "aadhaarNo",
                "pan",
            ];

            const fieldsToReset = isOrganization
                ? individualFields
                : organizationFields;

            const updated = {
                ...prev,
                applicantCategory: categoryValue, // ✅ STORE NUMBER ONLY
            };

            fieldsToReset.forEach((key) => {
                updated[key] = "";
            });

            return updated;
        });
    }, []);

    const formConfig = useMemo(() => {
        const isOrganization = (cateselec || "").toLowerCase() === "organization";

        return [
            {
                section: "Applicant Info",
                fields: [
                    { key: "applicantCategory", type: "dropdown", label: "Applicant Category", options: Category, handler: handleCategoryChange },
                    {
                        key: "getByType",
                        type: "dropdown",
                        label: labelText,
                        options: getByType,
                        handler: handleOccupationChange,
                        show: getByType?.length > 0
                    },
                    { key: "otherApplicantType", type: "input", label: "Other Applicant Type", placeholder: "Enter Industry Type", show: finaloccupation === "Other" },
                    { key: "portfolio", type: "input", label: "Portfolio", value: portfolioDescriptions[0]?.label || "N/A", editable: false },
                    { key: "product", type: "dropdown", label: "Product", options: products, handler: handleProductchange, show: products?.length > 0 },
                ]
            },
            {
                section: "Organization Info",
                fields: [
                    { key: "industryType", type: "dropdown", label: "Industry Type", options: indtype, handler: handleIndustry, show: isOrganization },
                    { key: "otherIndustryType", type: "input", label: "Other Industry Type", placeholder: "Enter Industry Type", show: payloadind === "Other", required: payloadind === "Other" ? true : false, },
                    { key: "segmentType", type: "dropdown", label: "Segment Type", options: segtype, handler: handlesegmenttype, show: isOrganization && payloadind !== "Other" },
                    { key: "segtypetxt", type: "input", label: "Segment Type", placeholder: "Enter Segment", show: payloadind === "Other", required: payloadind === "Other" ? true : false, },

                    { key: "orgName", type: "input", label: "Organization Name", placeholder: "Enter Organization", show: isOrganization, required: isOrganization ? true : false, },
                    { key: "regNumber", type: "input", label: "Registration Number", placeholder: "Enter Reg Number", show: isOrganization, },
                    { key: "CINnumber", type: "input", label: "CIN Number", placeholder: "Enter CIN Number", show: isOrganization, },
                    { key: "incorpDate", type: "date", label: "Incorporation Date", show: isOrganization, },
                    { key: "keyPartnerDob", type: "date", label: "Key Business Partner DOB", show: isOrganization && !["Private Limited", "Limited"].includes(finaloccupation), },
                    { key: "businessDuration", type: "custom", show: isOrganization },
                    // PAN should move here if organization
                    { key: "pan", type: "input", label: "PAN Number", placeholder: 'Enter PAN Number ', inputType: "pan", show: isOrganization, required: isOrganization ? true : false, },
                ]
            },
            {
                section: "Personal Info",
                fields: [
                    { key: "firstName", type: "input", label: "First Name", placeholder: "Enter first name", show: !isOrganization, required: !isOrganization ? true : false, },
                    { key: "middleName", type: "input", label: "Middle Name", placeholder: "Enter middle name", show: !isOrganization },
                    { key: "lastName", type: "input", label: "Last Name", placeholder: "Enter last name", show: !isOrganization, required: !isOrganization ? true : false, },
                    { key: "dob", type: "date", label: "DOB", show: !isOrganization },
                    // Gender + Aadhaar should move to Contact Info if organization
                    { key: "gender", type: "dropdown", label: "Gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Transgender", value: "Transgender" }], handler: handleGenderChange, show: !isOrganization, isRequired: true },
                    { key: "aadhaarNo", type: "input", label: "Aadhar Number", placeholder: 'Enter Aadhaar Number', inputType: "aadhaar", show: !isOrganization },
                    // PAN stays here if individual
                    { key: "pan", type: "input", label: "PAN Number", placeholder: 'Enter PAN Number ', inputType: "pan", show: !isOrganization, required: !isOrganization ? true : false, },
                ]
            },
            {
                section: "Contact Info",
                fields: [
                    { key: "contactPerson", type: "input", label: "Contact Person", placeholder: "Enter Contact Person", show: isOrganization, required: isOrganization ? true : false, },
                    {
                        key: "designation", type: "dropdown", label: "Designation", options: [
                            { label: "Director", value: "Director" },
                            { label: "Sole Proprietor", value: "Sole Proprietor" },
                            { label: "Partner", value: "Partner" }
                        ], handler: handleDesignationChange, show: isOrganization && ["sole proprietor", "llp", "partnership firm"].includes((finaloccupation || "").toLowerCase()),
                    },
                    { key: "mobileNumber", type: "input", label: "Mobile Number", placeholder: "Enter 10-digit number", inputType: "mobile", required: true, },
                    { key: "email", type: "input", label: "Email", placeholder: 'Enter Email', inputType: "email" },
                    // Move designation, gender, aadhaar here if organization

                    { key: "gender", type: "dropdown", label: "Gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Transgender", value: "Transgender" }], handler: handleGenderChange, show: isOrganization && ["LLP", "Sole Proprietor", "Partnership Firm"].includes(finaloccupation), required: false, },
                    { key: "aadhaarNo", type: "input", label: "Aadhar Number", placeholder: 'Enter Aadhaar Number', inputType: "aadhaar", show: isOrganization && ["hh"].includes(finaloccupation) },
                ]
            },
            {
                section: "Loan Details",
                fields: [
                    { key: "loanPurpose", type: "input", label: "Loan Purpose", placeholder: "Enter Loan Purpose", required: true, },
                    { key: "leadSource", type: "dropdown", label: "Lead Source", options: LeadDropdown, handler: handleLeadStatusChange },
                    { key: "branchName", type: "dropdown", label: "Sourcing Branch", options: BranchName, handler: handleBranchNameChange },
                ]
            },
            {
                section: "Applicant Location Info",
                fields: [
                    { key: "pincode", type: "dropdown", label: "Pincode", options: transformedPincodes, handler: handleDropdownChangePincode },
                    { key: "country", type: "input", label: "Country", value: findApplicantByCategoryCod.data?.countryName || "", editable: false },
                    { key: "city", type: "input", label: "City", value: findApplicantByCategoryCod.data?.cityName || "", editable: false },
                    { key: "state", type: "input", label: "State", value: findApplicantByCategoryCod.data?.stateName || "", editable: false },
                    { key: "area", type: "input", label: "Area", value: findApplicantByCategoryCod.data?.areaName || "", editable: false },
                ]
            }
        ];
    }, [Category, finaloccupation, portfolioDescriptions, products, cateselec, payloadind, indtype, segtype, LeadDropdown, BranchName, transformedPincodes, findApplicantByCategoryCod]);

    const renderFieldQDEentry = (field) => {
        if (field.show === false) return null;

        let value = formData[field.key] ?? field.value ?? "";

        // Override for location fields
        if (["country", "city", "state", "area"].includes(field.key)) {
            value = findApplicantByCategoryCod.data?.[`${field.key}Name`] ?? "";
        }

        if (field.key === "portfolio") {
            value = portfolioDescriptions[0]?.label ?? "N/A";
        }

        // Input fields
        if (field.type === "input") {
            return (
                <CustomInput
                    key={field.key}
                    label={field.label}
                    value={value}
                    setValue={(val) => handleInputChange(field.key, val)}
                    placeholder={field.placeholder}
                    type={field.inputType || "text"}
                    editable={field.editable ?? true}
                    required={field.required ?? false}
                    onEndEditing={() => {
                        if (field.key === "pan" && formData.pan?.length === 10) {
                            handlePanValidation(formData.pan);
                        }
                    }}
                />
            );
        }

        // Dropdown fields
        // Inside your map/render loop
        if (field.type === "dropdown") {
            return renderDropdown({
                label: field.label,
                data: field.options,
                selectedValue: value,
                onChange: (val) => {
                    handleInputChange(field.key, val);
                    field.handler?.(val);
                },
                placeholder: field.label,
                finaloccupation,
                finaloccupationCo,
                isRequired: field.isRequired ?? true, // <-- use field's value
                hideAsterisk: ["designation"].includes(field.key)
            });
        }


        // Date fields → push min/max + type, validation owned by 
        if (field.type === "date") {
            let minAge = 0;
            let maxAge = 100;

            if (field.key === "dob") {
                if (formData.product?.label === "Personal Loan") {
                    minAge = 21;
                    maxAge = 60;
                } else if (formData.product?.label === "Business Loan") {
                    minAge = 21;
                    maxAge = 58;
                }
            }

            if (field.key === "incorpDate") {
                if (
                    formData.product?.label === "Business Loan" &&
                    formData.applicantCategory?.label === "Organization"
                ) {
                    minAge = 1;
                    maxAge = 80;
                } else if (formData.product?.label === "Personal Loan") {
                    minAge = 21;
                    maxAge = 60;
                }
            }

            return (
                <DateOfBir
                    key={field.key}
                    type={field.key} // "dob" or "incorpDate"
                    label={field.label}
                    value={formData[field.key]}
                    onChange={(val) => handleInputChange(field.key, val)}
                    setError={(err) =>
                        setDateErrors((prev) => ({ ...prev, [field.key]: err }))
                    }
                    error={dateErrors[field.key]}
                    businessDate={BusinessDate.businnessDate}
                    minAge={minAge}
                    maxAge={maxAge}
                    hideAsterisk={field.key === "keyPartnerDob"}
                />
            );
        }

        // Custom component (Business Duration)
        if (field.type === "custom" && field.key === "businessDuration") {
            return (
                <BusinessDurationInput
                    monthValue={formData.nofmonthinbusiness}
                    setMonthValue={(val) =>
                        setFormData((prev) => ({
                            ...prev,
                            nofmonthinbusiness: val,
                        }))
                    }
                    yearValue={formData.nofyearinbusiness}
                    setYearValue={(val) =>
                        setFormData((prev) => ({
                            ...prev,
                            nofyearinbusiness: val,
                        }))
                    }
                />
            );
        }

        return null;
    };

    const [formDataCo, setFormDataCo] = useState({
        applicantCategory: "",
        finalOccupation: "",
        otherApplicantType: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        orgName: "",
        regNumber: "",
        CINnumber: "",
        incorpDate: "",
        keyPartnerDob: "",
        designation: "",
        industryType: "",
        otherIndustryType: "",
        segmentType: "",
        segmentTypeOther: "",
        nofmonthinbusiness: "",
        nofyearinbusiness: "",
        contactPerson: "",
        mobileNumber: "",
        gender: "",
        email: "",
        aadhaarNo: "",
        pan: "",
        loanPurpose: "",
        leadSource: "",
        branchName: "",
        pincode: "",
        country: "",
        city: "",
        state: "",
        area: "",
    });

    console.log(formDataCo, 'formDataCoformDataCo')
    const handleInputChangeCo = (key, value) => {
        setFormDataCo((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const formConfigCo = useMemo(() => {
        const isOrganization = (cateselecCo || "").toLowerCase() === "organization";

        return [
            {
                section: "Co-Applicant Info",
                fields: [
                    {
                        key: "applicantCategory", type: "dropdown", label: "Applicant Category",
                        options: CategoryCo, handler: handleCategoryChangeCo
                    },
                    {
                        key: "getByType",
                        type: "dropdown",
                        label: labelTextCo,
                        options: getByTypeCo,
                        handler: handleOccupationChangeCo,
                        show: getByTypeCo?.length > 0
                    },
                    { key: "otherApplicantType", type: "input", label: "Other Primary Occupation", placeholder: "Enter Industry Type", show: finaloccupationCo === "Other" },
                    { key: "portfolio", type: "input", label: "Portfolio", value: portfolioDescriptions[0]?.label || "N/A", editable: false },
                    { key: "product", type: "input", label: "Product", value: payloadproduct || "NA", editable: false },
                ]
            },
            {
                section: "Organization Info",
                fields: [
                    { key: "industryType", type: "dropdown", label: "Industry Type", options: indtypeco, handler: handleIndustryco, show: isOrganization },
                    { key: "otherIndustryType", type: "input", label: "Other Industry Type", placeholder: "Enter Industry Type", show: payloadindco === "Other" },
                    { key: "segmentType", type: "dropdown", label: "Segment Type", options: segtypeco, handler: handlesegmenttypeco, show: isOrganization && payloadindco !== "Other" },
                    { key: "segtypetxt", type: "input", label: "Other Segment Type", placeholder: "Enter Segment", show: payloadindco === "Other" },

                    { key: "orgName", type: "input", label: "Organization Name", placeholder: "Enter Organization", show: isOrganization, required: isOrganization ? true : false, },
                    { key: "regNumber", type: "input", label: "Registration Number", placeholder: "Enter Reg Number", show: isOrganization, },
                    { key: "CINnumber", type: "input", label: "CIN Number", placeholder: "Enter CIN Number", show: isOrganization, },
                    { key: "incorpDate", type: "date", label: "Incorporation Date", show: isOrganization },
                    { key: "keyPartnerDob", type: "date", label: "Key Business Partner DOB", show: isOrganization && !["Private Limited", "Limited"].includes(finaloccupationCo), },
                    { key: "businessDuration", type: "custom", show: isOrganization },
                    // PAN goes here if Organization
                    { key: "pan", type: "input", label: "PAN Number", placeholder: "Enter PAN Number", inputType: "pan", show: isOrganization, required: isOrganization ? true : false, },
                ]
            },
            {
                section: "Personal Info",
                fields: [
                    { key: "firstName", type: "input", label: "First Name", placeholder: "Enter first name", show: !isOrganization, required: !isOrganization ? true : false, },
                    { key: "middleName", type: "input", label: "Middle Name", placeholder: "Enter middle name", show: !isOrganization },
                    { key: "lastName", type: "input", label: "Last Name", placeholder: "Enter last name", show: !isOrganization, required: !isOrganization ? true : false, },
                    { key: "dob", type: "date", label: "DOB", show: !isOrganization },
                    // Gender + Aadhaar move to Contact Info if Organization
                    { key: "gender", type: "dropdown", label: "Gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Transgender", value: "Transgender" }], handler: handleGenderChangeCo, show: !isOrganization, isRequired: true },
                    { key: "aadhaarNo", type: "input", label: "Aadhar Number", placeholder: "Enter Aadhaar Number", inputType: "aadhaar", show: !isOrganization },
                    // PAN stays here if Individual
                    { key: "pan", type: "input", label: "PAN Number", placeholder: "Enter PAN Number", inputType: "pan", show: !isOrganization, required: !isOrganization ? true : false, },
                ]
            },
            {
                section: "Contact Info",
                fields: [
                    { key: "contactPerson", type: "input", label: "Contact Person", placeholder: "Enter Contact Person", show: isOrganization, required: isOrganization ? true : false, },
                    {
                        key: "designation", type: "dropdown", label: "Designation", options: [
                            { label: "Director", value: "Director" },
                            { label: "Sole Proprietor", value: "Sole Proprietor" },
                            { label: "Partner", value: "Partner" }
                        ], handler: handleDesignationChangeco, show: isOrganization && ["sole proprietor", "llp", "partnership firm"].includes((finaloccupationCo || "").toLowerCase())
                    },
                    { key: "mobileNumber", type: "input", label: "Mobile Number", placeholder: "Enter 10-digit number", inputType: "mobile", required: true, },
                    { key: "email", type: "input", label: "Email", placeholder: "Enter Email", inputType: "email" },
                    // Gender + Aadhaar here if Organization
                    { key: "gender", type: "dropdown", label: "Gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Transgender", value: "Transgender" }], handler: handleGenderChange, show: isOrganization && ["LLP", "Sole Proprietor", "Partnership Firm"].includes(finaloccupationCo), isRequired: false },
                    { key: "aadhaarNo", type: "input", label: "Aadhar Number", placeholder: 'Enter Aadhaar Number', inputType: "aadhaar", show: isOrganization && ['hh'].includes(finaloccupationCo) },
                ]
            },
            {
                section: "Loan Details",
                fields: [
                    { key: "loanPurpose", type: "input", label: "Loan Purpose", value: formData?.loanPurpose, editable: false },
                    { key: "leadSource", type: "input", label: "Lead Source", value: LeadSource, editable: false },
                    { key: "branchName", type: "input", label: "Sourcing Branch", value: branchName, editable: false },
                ]
            },
            {
                section: "Applicant Location Info",
                fields: [
                    { key: "pincode", type: "dropdown", label: "Pincode", options: transformedPincodesCo, handler: handleDropdownChangePincodeCo },
                    { key: "country", type: "input", label: "Country", value: cofindApplicantByCategoryCod.data?.countryName || "", editable: false },
                    { key: "city", type: "input", label: "City", value: cofindApplicantByCategoryCod.data?.cityName || "", editable: false },
                    { key: "state", type: "input", label: "State", value: cofindApplicantByCategoryCod.data?.stateName || "", editable: false },
                    { key: "area", type: "input", label: "Area", value: cofindApplicantByCategoryCod.data?.areaName || "", editable: false },
                ]
            }
        ];
    }, [
        CategoryCo,
        cateselecCo,
        getByTypeCo,
        payloadproduct,
        LeadSource,
        branchName,
        transformedPincodesCo,
        cofindApplicantByCategoryCod,
        payloadindco,
        finaloccupationCo,
    ]);

    const renderFieldQDEentryCo = (field) => {
        if (field.show === false) return null;

        let value = formDataCo[field.key] ?? field.value ?? "";

        // Override for location fields
        if (["country", "city", "state", "area"].includes(field.key)) {
            value = cofindApplicantByCategoryCod.data?.[`${field.key}Name`] ?? "";
        }

        if (field.key === "portfolio") {
            value = portfolioDescriptions[0]?.label ?? "N/A";
        }
        if (field.key === "product") {
            value = payloadproduct ?? "N/A";
        }
        if (field.key === "branchName") {
            value = branchName ?? "N/A";
        }
        if (field.key === "leadSource") {
            value = LeadSource ?? "N/A";
        }

        if (field.key === "loanPurpose") {
            value = formData?.loanPurpose ?? "N/A";
        }

        // Input fields
        if (field.type === "input") {
            return (
                <CustomInput
                    key={field.key}
                    label={field.label}
                    value={value}
                    setValue={(val) => handleInputChangeCo(field.key, val)}
                    placeholder={field.placeholder}
                    type={field.inputType || "text"}
                    editable={field.editable ?? true}
                    required={field.required ?? false}
                    onEndEditing={() => {
                        if (field.key === "pan" && formDataCo.pan?.length === 10) {
                            handlePanValidation(formDataCo.pan);
                        }
                    }}
                />
            );
        }

        // Dropdown fields
        // if (field.type === "dropdown") {
        //     return renderDropdown(
        //         field.label,
        //         field.options,
        //         value,
        //         (val) => {
        //             handleInputChangeCo(field.key, val);
        //             field.handler?.(val);
        //         },
        //         field.label

        //     );
        // }



        if (field.type === "dropdown") {
            return renderDropdown({
                label: field.label,
                data: field.options,
                selectedValue: value,
                onChange: (val) => {
                    handleInputChangeCo(field.key, val);
                    field.handler?.(val);
                },
                placeholder: field.label,
                finaloccupation,
                finaloccupationCo,
                isRequired: field.isRequired ?? true,
                hideAsterisk: ["designation",].includes(field.key) // <-- hide * for these keys
            });
        }

        // Date fields → all validation handled by 
        if (field.type === "date") {
            let minAge = 0;
            let maxAge = 100;

            if (field.key === "dob") {
                if (payloadproduct === "Personal Loan") {
                    minAge = 21;
                    maxAge = 60;
                } else if (payloadproduct === "Business Loan") {
                    minAge = 21;
                    maxAge = 58;
                }
            }

            if (field.key === "incorpDate") {
                if (payloadproduct === "Business Loan" && cateselecCo === "Organization") {
                    minAge = 1;   // At least 1 year old
                    maxAge = 80;  // Organization cap
                } else if (payloadproduct === "Personal Loan") {
                    minAge = 21;
                    maxAge = 60;
                }
            }

            return (
                <DateOfBir
                    key={field.key}
                    type={field.key} // "dob" or "incorpDate"
                    label={field.label}
                    value={formDataCo[field.key]}
                    onChange={(val) => handleInputChangeCo(field.key, val)}
                    setError={(err) =>
                        setDateErrors((prev) => ({ ...prev, [field.key]: err }))
                    }
                    error={dateErrors[field.key]}
                    businessDate={BusinessDate.businnessDate}
                    minAge={minAge}
                    maxAge={maxAge}
                    hideAsterisk={field.key === "keyPartnerDob"} // <-- hide * only for keyPartnerDob
                />
            );
        }

        // Custom business duration
        if (field.type === "custom" && field.key === "businessDuration") {
            return (
                <BusinessDurationInput
                    monthValue={formDataCo.nofmonthinbusiness}
                    setMonthValue={(val) =>
                        setFormDataCo((prev) => ({ ...prev, nofmonthinbusiness: val }))
                    }
                    yearValue={formDataCo.nofyearinbusiness}
                    setYearValue={(val) =>
                        setFormDataCo((prev) => ({ ...prev, nofyearinbusiness: val }))
                    }
                />
            );
        }

        return null;
    };



    // 🔥 apply filters whenever formData / formDataCo changes
    useEffect(() => {
        let filtered = [...allProducts];

        // ✅ Applicant Filters
        if (formData?.applicantCategory?.label === "Organization") {
            filtered = filtered.filter((item) => item.label !== "Personal Loan");
        }

        if (
            formData?.getByType?.label === "Salaried" ||
            formData?.getByType?.label === "House Wife"
        ) {
            // ❌ Only remove Business Loan for Salaried / House Wife — keep for Self Employment
            filtered = filtered.filter((item) => item.label !== "Business Loan");
        }

        // ✅ Co-Applicant Filters
        if (formDataCo?.applicantCategory?.label === "Organization") {
            filtered = filtered.filter((item) => item.label !== "Personal Loan");
        }

        if (
            formDataCo?.getByType?.label === "Salaried" ||
            formDataCo?.getByType?.label === "House Wife"
        ) {
            filtered = filtered.filter((item) => item.label !== "Business Loan");
        }

        // ✅ Self Employment explicitly allows "Business Loan" → re-add it if filtered
        if (formData?.getByType?.label === "Self Employment" ||
            formDataCo?.getByType?.label === "Self Employment") {
            filtered = allProducts; // Keep all products for Self Employment
        }

        setproduct(filtered);
    }, [formData, formDataCo, allProducts]);







    useEffect(() => {
        // For co-applicant
        if (formDataCo?.industryType?.label === "Other") {
            setFormDataCo((prev) => ({
                ...prev,
                segmentType: null,
                segtypetxt: "",
            }));
        }

        // For main applicant
        if (formData?.industryType?.label === "Other") {
            setFormData((prev) => ({
                ...prev,
                segmentType: null,
                segtypetxt: "",
            }));
        }
    }, [formDataCo?.industryType, formData?.industryType]);

    const tabs = ['Applicant'];
    if (selectedCoApplicant && Object.keys(selectedCoApplicant).length > 0) {
        tabs.push('Co-Applicant');
    }

    const renderApplicantView = () => {
        return (
            <>
                {formConfig.map((section) => {
                    const visibleFields = section.fields
                        .map(renderFieldQDEentry)
                        .filter(Boolean);
                    if (!visibleFields.length) return null;
                    if (
                        section.section === 'Organization Info' &&
                        (cateselec || '').toLowerCase() === 'individual'
                    )
                        return null;

                    return (
                        <View key={section.section} style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>{section.section}</Text>
                            <View style={styles.fieldContainer}>{renderRows(visibleFields)}</View>
                        </View>
                    );
                })}

                {/* Save / Submit Buttons */}
                {/* {!CoApllicant && ( */}
                <View style={styles.switchOuter}>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>
                            {isSettlement
                                ? 'Going Without Co-Applicant'
                                : 'Without Co-Applicant Lead'}
                        </Text>
                        <Switch
                            value={isSettlement}
                            onValueChange={toggleSwitch}
                            trackColor={{ false: '#D1D1D6', true: '#81b0ff' }}
                            thumbColor={isSettlement ? '#FFD700' : '#f4f3f4'}
                        />
                    </View>
                </View>
                {/* )} */}
                <View style={styles.buttonSection}>
                    {!showSubmitButton ? (
                        loading ? (
                            <ActivityIndicator size="large" color="#007AFF" />
                        ) : (
                            <TouchableOpacity
                                style={[styles.button,]}
                                onPress={handleSave}
                            >
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        )
                    ) : loadingf ? (
                        <ActivityIndicator size="large" color="#4CAF50" />
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Co-Applicant Toggle */}

            </>
        );
    }

    // 🧩 Co-Applicant Tab Content
    const renderCoApplicantView = () => {
        return (
            <>
                {formConfigCo.map((section) => {
                    const visibleFields = section.fields
                        .map(renderFieldQDEentryCo)
                        .filter(Boolean);
                    if (!visibleFields.length) return null;
                    if (
                        section.section === 'Organization Info' &&
                        (cateselecCo || '').toLowerCase() === 'individual'
                    )
                        return null;

                    return (
                        <View key={section.section} style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>{section.section}</Text>
                            <View style={styles.fieldContainer}>{renderRows(visibleFields)}</View>
                        </View>
                    );
                })}

                <View style={styles.buttonSection}>
                    {loadingCo ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                        <TouchableOpacity
                            style={[styles.button,]}
                            onPress={handleSaveCoApplicant}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </>
        );
    }


    return (
        <Provider>

            <SafeAreaView style={styles.safeContainerstatus}>
                <StatusBar
                    translucent
                    backgroundColor="#2196F3"
                    barStyle="light-content"
                />
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={openDrawer}>
                            <Image source={require('../../asset/menus.png')} style={styles.drawerIcon} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Lead  Management</Text>
                    </View>
                    <View style={styles.firstrow}>
                        <TextInput
                            style={styles.searchBar}
                            placeholder="Search..."
                            placeholderTextColor={'#888'}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        <TouchableWithoutFeedback
                            onPressIn={() =>
                                Animated.spring(scaleAnim, {
                                    toValue: 0.96,
                                    useNativeDriver: true,
                                    speed: 40,
                                    bounciness: 6,
                                }).start()
                            }
                            onPressOut={() =>
                                Animated.spring(scaleAnim, {
                                    toValue: 1,
                                    useNativeDriver: true,
                                    speed: 30,
                                }).start()
                            }
                            onPress={handleCreatePress}
                            disabled={loading}
                        >
                            <Animated.View
                                style={[
                                    styles.createButton,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                        backgroundColor: loading ? "#6faafc" : "#2196F3",
                                        opacity: loading ? 0.9 : 1,
                                    },
                                ]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.createButtonText}>Create</Text>
                                )}
                            </Animated.View>
                        </TouchableWithoutFeedback>

                    </View>

                    <View style={styles.switchContainerend}>
                        <Text style={styles.switchLabel}>
                            {showAllLeads ? '' : ''}
                        </Text>
                        <Switch
                            value={showAllLeads}
                            onValueChange={(value) => setShowAllLeads(value)}
                        />
                    </View>
                    { }
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item, index }) => {
                            const isRejected =
                                item?.leadStage?.stageName?.toLowerCase() === "rejected" ||
                                item?.leadStage?.toLowerCase() === "rejected" ||
                                item?.leadStatus?.leadStatusName?.toLowerCase() === "rejected";

                            const hasAppId = !!item?.appId; // ✅ appId exists

                            // ✅ Conditional card background color logic
                            const cardStyle = [
                                styles.cardBase, // your default card style (optional)
                                isRejected && { backgroundColor: '#F85050' }, // 🔴 red for rejected
                                hasAppId && !isRejected && { backgroundColor: '#4CAF50' }, // 🟢 green for appId (only if not rejected)
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
                            )
                        }}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            <Text style={styles.emptyListText}>No data available</Text>
                        }
                    />


                    <Modal transparent visible={isLoadingsendotp}>
                        <View style={styles.loaderFullScreen}>
                            <View style={styles.loaderOverlay}>
                                <ActivityIndicator size="large" color="#040675FF" />
                                <Text style={styles.loadingText}>Processing...</Text>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        visible={isModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={onClose}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.modalWrapper}>
                                {/* 🔹 Header Tabs */}
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

                                {IsLoadingLeads ? (
                                    // 🌀 Loading Spinner
                                    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
                                ) : SelectedLeadApplicant && Object.keys(SelectedLeadApplicant).length > 0 ? (

                                    <ScrollView
                                        contentContainerStyle={styles.scrollContent}
                                        keyboardShouldPersistTaps="handled"
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {renderTabContent(activeTabView)}

                                        {/* 🔹 Footer Buttons */}
                                    </ScrollView>
                                ) : (
                                    // 🚫 Empty State
                                    <Text style={styles.noLogText}>No applicant details available</Text>
                                )}
                                <View style={styles.buttonSection}>

                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        activeOpacity={0.8}
                                        onPress={handleClose}
                                    >
                                        <Text style={styles.closeText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisiblecreate}
                        onRequestClose={() => setIsModalVisible(false)}
                    >
                        <CustomToast message={toastMessage} isVisible={isToastVisible} />

                        <View style={styles.overlay}>
                            <SafeAreaView style={styles.modalWrapper}>
                                {/* <View style={styles.containermodal}> */}
                                <Sections title="Lead Creation" handleClosePress={handleClosePress} />

                                {/* 🟩 TAB HEADER */}
                                <View style={[styles.tabContainer, { marginTop: 10 }]}>
                                    {['Applicant', 'Co-Applicant'].map((tab) => {
                                        if (tab === 'Co-Applicant' && showSubmitButton) return null;
                                        return (
                                            <TouchableOpacity
                                                key={tab}
                                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                                onPress={() => {
                                                    if (tab === 'Co-Applicant') {
                                                        const missing = validateFields?.() || [];
                                                        if (missing.length > 0) {
                                                            Alert.alert(
                                                                'Alert ⚠️',
                                                                missing.map((f) => `• ${f}`).join('\n'),
                                                                [{ text: 'OK', style: 'cancel' }]
                                                            );
                                                            return;
                                                        }
                                                        if (!CoApllicant) {
                                                            Alert.alert('Alert ⚠️', 'Please save the Applicant first!');
                                                            return;
                                                        }
                                                    }
                                                    setActiveTab(tab);
                                                }}
                                            >
                                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                                    {tab}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* CONTENT */}
                                <ScrollView
                                    contentContainerStyle={styles.scrollContent}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >

                                    {activeTab === 'Applicant'
                                        ? renderApplicantView()
                                        : renderCoApplicantView()}

                                </ScrollView>

                            </SafeAreaView>
                        </View>
                    </Modal>

                    <CustomerExistsModal
                        visible={existsModalVisible}
                        data={existingCustomerData}
                        onCancel={() => {
                            setExistsModalVisible(false);
                            handleClosePress();
                        }}
                        onProceed={(selectedItem) => {
                            setExistsModalVisible(false);
                            console.log("Selected Case:", selectedItem);

                            // 🔥 USE ANYWHERE
                            // navigation.navigate(...)
                            // setCardData(selectedItem)
                        }}
                    />





                </View >
            </SafeAreaView>


            <Modal
                animationType="slide" // Animation type for the modal
                transparent={true} // To ensure background is transparent
                visible={isModalVisiblecreateJLG} // Controlled visibility of the modal
                onRequestClose={() => setIsModalVisible(false)} >
                <CustomToast message={toastMessage} isVisible={isToastVisible} />
                <View style={styles.containermodal}>
                    <Sections title="" handleClosePress={handleClosePress} />

                    <View style={styles.tabContainer}>

                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'Applicant' && styles.activeTab

                            ]}
                            onPress={() => setActiveTab('Applicant')}

                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'Applicant'
                                    && styles.activeTabText

                                ]}
                            >
                                Applicant
                            </Text>
                        </TouchableOpacity>


                        {!showSubmitButton && (
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'Co-Applicant' && styles.activeTab]}
                                onPress={() => {
                                    const residenceValidationResult = validateFields();
                                    const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];
                                    if (missingFields?.length > 0) {
                                        Alert.alert(
                                            'Alert ⚠️',
                                            missingFields.map((field) => `\u2022 ${field}`).join('\n'),
                                            [{ text: 'OK', style: 'cancel' }]
                                        );
                                        return;
                                    }
                                    if (!CoApllicant) {
                                        Alert.alert('Alert ⚠️', 'Please Save the Applicant first!');
                                        return; // Prevent switching to Co-Applicant tab
                                    }
                                    setActiveTab('Co-Applicant');
                                }}>
                                <Text style={[styles.tabText, activeTab === 'Co-Applicant' && styles.activeTabText]}>
                                    Co-Applicant
                                </Text>
                            </TouchableOpacity>
                        )}

                    </View>


                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, marginTop: 10, }}
                        keyboardShouldPersistTaps="handled">
                        {activeTab === 'Applicant' && (
                            <SafeAreaView style={styles.tabViewWrapper}>


                                {applicantForms.length === 0 && (
                                    <ScrollView
                                        style={styles.formWrapper}
                                        contentContainerStyle={{ paddingBottom: 80 }}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {formConfig.map((section) => {
                                            const visibleFields = section.fields.map(renderFieldQDEentry).filter(Boolean);

                                            if (visibleFields.length === 0) return null;
                                            if (section.section === "Organization Info" && (cateselec || "").toLowerCase() === "individual") {
                                                return null;
                                            }

                                            return (
                                                <View key={section.section} style={styles.sectionCard}>
                                                    <Text style={styles.sectionHeader}>{section.section}</Text>
                                                    <View style={styles.fieldContainer}>{renderRows(visibleFields)}</View>
                                                </View>
                                            );
                                        })}


                                        <View style={styles.buttonSection}>
                                            {!showSubmitButton ? (
                                                loading ? (
                                                    <ActivityIndicator size="large" color="#007AFF" />
                                                ) : (
                                                    <TouchableOpacity
                                                        style={[styles.button, isSubmittingApplicant && styles.disabledButton]}
                                                        onPress={handleSave}
                                                        disabled={isSubmittingApplicant}
                                                    >
                                                        <Text style={styles.buttonText}>Save</Text>
                                                    </TouchableOpacity>
                                                )
                                            ) : loadingf ? (
                                                <ActivityIndicator size="large" color="#4CAF50" />
                                            ) : (
                                                <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                                                    <Text style={styles.buttonText}>Submit</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>


                                        {!CoApllicant && (
                                            <View style={styles.switchOuter}>
                                                <View style={styles.switchContainer}>
                                                    <Text style={styles.switchLabel}>
                                                        {isSettlement ? "Going Without Co-Applicant" : "Without Co-Applicant"}
                                                    </Text>
                                                    <Switch
                                                        value={isSettlement}
                                                        onValueChange={toggleSwitch}
                                                        trackColor={{ false: "#D1D1D6", true: "#81b0ff" }}
                                                        thumbColor={isSettlement ? "#f5dd4b" : "#f4f3f4"}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </ScrollView>
                                )}


                                {applicantForms.length > 0 && (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.formSelectorScroll}
                                    >
                                        {applicantForms.map((_, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.formNumberButton,
                                                    activeFormIndex === index && styles.activeFormNumberButton
                                                ]}
                                                onPress={() => setActiveFormIndex(index)}
                                            >
                                                <Text style={[
                                                    styles.formNumberText,
                                                    activeFormIndex === index && styles.activeTabText
                                                ]}>
                                                    {index + 1}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}



                            </SafeAreaView>
                        )}

                        {activeTab === 'Co-Applicant' && (
                            <SafeAreaView style={styles.tabViewWrapper}>
                                <ScrollView
                                    style={styles.formWrapper}
                                    contentContainerStyle={{ paddingBottom: 80 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {formConfigCo.map((section) => {
                                        const visibleFields = section.fields.map(renderFieldQDEentryCo).filter(Boolean);

                                        if (visibleFields.length === 0) return null;
                                        if (
                                            section.section === "Organization Info" &&
                                            (cateselecCo || "").toLowerCase() === "individual"
                                        ) {
                                            return null;
                                        }

                                        return (
                                            <View key={section.section} style={styles.sectionCard}>
                                                <Text style={styles.sectionHeader}>{section.section}</Text>
                                                <View style={styles.fieldContainer}>{renderRows(visibleFields)}</View>
                                            </View>
                                        );
                                    })}


                                    <View style={styles.buttonSection}>
                                        {loadingCo ? (
                                            <ActivityIndicator size="large" color="#007AFF" />
                                        ) : (
                                            <TouchableOpacity style={styles.button} onPress={handleSaveCoApplicant}>
                                                <Text style={styles.buttonText}>Save</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </ScrollView>

                            </SafeAreaView>
                        )}
                    </ScrollView>
                </View>
            </Modal >
        </Provider >
    );
};







const styles = StyleSheet.create({
    dropdown1: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: moderateScale(6),
        fontSize: moderateScale(12),
        fontWeight: "600",
        paddingVertical: verticalScale(6),
        paddingHorizontal: scale(8),
        backgroundColor: "#FFF",
        color: "#000",
        flex: 1,
        height: height * 0.05,
    },

    inputField: {
        flex: 1, paddingHorizontal: 5, marginVertical: 6,
    },

    required: {
        color: 'red',
    },

    placeholderStyle: {
        color: "#333",
        fontSize: moderateScale(12),
    },

    dropdownItem: {
        padding: 6,
        color: 'black',
        fontSize: 10,
        backgroundColor: '#fff',
    },
    dropdownItemText: {
        color: 'black',
        fontSize: 12,
    },

    label: {
        fontSize: 13,
        marginBottom: 4,
        color: '#333',
        fontWeight: '600',
        width: width * 0.35
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

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    row1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6
    },
    halfWidth: {
        flex: 1,
    },

    fullWidth: {
        width: "100%",
        marginBottom: 10,
    },

    noDeviationText: {
        textAlign: "center",
        color: "#888",
        marginVertical: 20,
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        backgroundColor: "#f9fafb",
        paddingHorizontal: 10,
        justifyContent: "center",
        minHeight: 42,
    },
    containerinputy: {
        width: "100%",
        marginBottom: 12,
    },
    multilineWrapper: {
        minHeight: 80,
        paddingVertical: 8,
    },

    input: {
        fontSize: 14,
        color: "#111827",
        padding: 0,
    },

    multilineInput: {
        textAlignVertical: "top",
    },

    disabled: {
        backgroundColor: "#f3f4f6",
    },
    cell: {
        minHeight: 48, // ✅ Ensures consistent visual row height
    },

    businessinput: {
        flex: 1,
        height: height * 0.05, // ✅ aligned height
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        fontSize: 12,
        fontWeight: "bold",
        paddingHorizontal: 6,
        backgroundColor: "#f9f9f9",
        color: "black",
        marginRight: 8, // spacing between Month and Year
    },

    sectionTitle: {
        color: '#007bff',
        fontSize: moderateScale(16.5),
        fontWeight: 'bold',
        marginBottom: verticalScale(6),
        paddingLeft: scale(5),
    },
    // ---------- GLOBAL ----------
    safeContainerstatus: {
        flex: 1,
        backgroundColor: '#2196F3', // backgroundColor same as header for seamless look
    },
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9",
    },



    safeContainer: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: moderateScale(20),
        borderTopRightRadius: moderateScale(20),
        overflow: "hidden",
    },
    // ---------- HEADER ----------
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
        color: "#fff",
        fontSize: moderateScale(18),
        fontWeight: "700",
        marginLeft: 12,
    },

    // ---------- SEARCH / CREATE ----------
    firstrow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: width * 0.9,
        marginHorizontal: "5%",
        marginVertical: verticalScale(12),
    },
    searchBar: {
        flex: 1,
        height: verticalScale(40),
        borderColor: "#ccc",
        borderWidth: 1,
        paddingHorizontal: 10,
        marginRight: 10,
        borderRadius: 8,
        fontSize: moderateScale(13),
        color: "#000",
    },
    createButton: {
        backgroundColor: "#2196F3",
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(20),
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    createButtonText: {
        color: "#fff",
        fontSize: moderateScale(14),
        fontWeight: "700",
        letterSpacing: 0.3,
    },

    // ---------- SWITCH ----------
    switchContainerend: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },

    // ---------- LIST / FLATLIST ----------
    list: {
        paddingBottom: verticalScale(80),
    },
    emptyListText: {
        textAlign: "center",
        marginTop: verticalScale(50),
        fontSize: moderateScale(14),
        color: "#777",
    },

    // ---------- MODALS ----------
    containermodal: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: scale(14),
        paddingTop: verticalScale(8),
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },

    modalWrapper: {
        width: width * 0.98,
        maxHeight: height * MAX_HEIGHT_RATIO,
        backgroundColor: "#FFFFFF",
        borderRadius: moderateScale(16),
        paddingHorizontal: moderateScale(14),
        paddingVertical: verticalScale(22),
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },

    modalContainerdetail: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    modalContentdetail: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: scale(14),
        width: width * 0.95,
        maxHeight: height * 0.88,
    },

    // ---------- TABS ----------
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

    // ---------- FORM / SECTIONS ----------
    formWrapper: {
        flexGrow: 1,
        paddingHorizontal: scale(10),
        paddingTop: verticalScale(8),
        backgroundColor: "#F3F4F6",
    },
    sectionCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: scale(12),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        fontSize: moderateScale(15),
        fontWeight: "700",
        color: "#1C1C1E",
        marginBottom: verticalScale(8),
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
        paddingBottom: 4,
    },

    // ---------- FIELDS ----------
    fieldContainer: {
        flex: 1,
        gap: verticalScale(8),
    },
    labelmodal: {
        fontSize: moderateScale(12),
        color: "#333",
        fontWeight: "600",
    },
    inputmodal: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 8,
        fontSize: moderateScale(12),
        height: verticalScale(40),
        backgroundColor: "#FAFAFA",
        color: "#000",
    },

    // ---------- BUTTONS ----------
    buttonSection: {
        alignItems: "center",
        marginVertical: verticalScale(14),
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(50),
        borderRadius: 10,
        elevation: 3,
    },
    submitButton: {
        backgroundColor: "#28A745",
    },
    buttonText: {
        color: "#fff",
        fontSize: moderateScale(14),
        fontWeight: "700",
    },
    disabledButton: {
        opacity: 0.6,
    },

    // ---------- SWITCH ----------
    switchOuter: {
        alignItems: "center",
        marginVertical: verticalScale(8),
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(14),
        elevation: 2,
    },
    switchLabel: {
        fontSize: moderateScale(13),
        fontWeight: "600",
        color: "#333",
    },

    // ---------- LOADER ----------
    loaderFullScreen: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    loaderOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#fff",
        fontSize: moderateScale(14),
        fontWeight: "500",
    },


    //////New Style Suppoerted ///
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: scale(10),


    },

    scrollContent: {
        paddingBottom: verticalScale(50),
    },

    /* ============================
       🟦 TAB HEADER
    ============================ */
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        backgroundColor: "#E5E7EB",
        borderRadius: moderateScale(10),
        marginVertical: verticalScale(10),
        paddingVertical: verticalScale(4),
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(8),
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
        color: "#333333",
        fontWeight: "600",
    },
    activeTabText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    /* ============================
       🧩 SECTION CARDS
    ============================ */
    sectionCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(10),
        paddingVertical: verticalScale(10),
        marginBottom: verticalScale(10),
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionHeader: {
        fontSize: moderateScale(15),
        fontWeight: "700",
        color: "#111827",
        marginBottom: verticalScale(6),
    },
    fieldContainer: {
        gap: verticalScale(8),
    },

    /* ============================
       💾 BUTTONS
    ============================ */
    buttonSection: {
        marginVertical: verticalScale(12),
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        width: "90%",
        backgroundColor: "#007AFF",
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
    },
    submitButton: {
        backgroundColor: "#4CAF50",
    },
    buttonText: {
        fontSize: moderateScale(14),
        color: "#FFFFFF",
        fontWeight: "600",
    },

    /* ============================
       🔀 CO-APPLICANT SWITCH
    ============================ */
    switchOuter: {
        alignItems: "center",
        marginTop: verticalScale(10),
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "85%",
        backgroundColor: "#F2F2F7",
        borderRadius: moderateScale(10),
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(6),
    },
    switchLabel: {
        fontSize: moderateScale(13),
        fontWeight: "500",
        color: "#333333",
    },

    inputField: {
        width: "100%",            // FULL WIDTH → consistent across devices
        marginVertical: 6,
    },

    label: {
        fontSize: 13,
        color: "#333",
        marginBottom: 4,
        fontWeight: "600",
    },

    required: {
        color: "red",
    },

    dropdown: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        backgroundColor: "#FFF",
        height: verticalScale(30),                // FIXED height → SAME look on all screens
        justifyContent: "center",
    },

    placeholderStyle: {
        color: "#666",
        fontSize: 12,
    },

    selectedTextStyle: {
        fontSize: 12,
        color: "#000",
    },

    inputSearchStyle: {
        fontSize: 12,
        color: "#000",
    },

    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
    },

    dropdownItemText: {
        fontSize: 12,
        color: "#000",
    },
});

export default QDE;

















