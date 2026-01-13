import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { BASE_URL } from '../../api/Endpoints';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import moment from 'moment'; // For formatting date
import DatePickerField from '../Component/DatePicker.js';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const getDefaultExpiryDate = () => {
  return moment().add(2, 'months').format('DD-MM-YYYY'); // Date two months ahead
};
const CibilReportProcess = ({ route }) => {
  const { item } = route.params || {}; // Get the passed item
  // 
  // const { applicationNumber, userName } = route.params;

  // 
  // 
  // 
  const navigation = useNavigation();
  const token = useSelector((state) => state.auth.token);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [expiryDate, setExpiryDate] = useState(getDefaultExpiryDate());
  const [applicationDetails, setApplicationDetails] = useState(null);

  const [applicantTypes, setApplicantTypes] = useState([]); // To store applicant types for dropdown
  const [fullName, setFullName] = useState('');

  const [applicantCibilResult, setApplicantCibilResult] = useState([]); // To store applicant types for dropdown
  const [CibilReportid, setCibilReportid] = useState([]); // To
  // 
  const [selectedApplicantType, setSelectedApplicantType] = useState(''); // State for selected dropdown value
  const [selectedApplicantCibilResult, setSelectedApplicantCibilResult] =
    useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  // 

  const [ApplicantArray, setApplicantArray] = useState([]); // To store
  const [applicantCategoryCode, setApplicantCategoryCode] = useState('');

  const [applicantidindividualApplicant, setApplicantidIndividualApplicant] =
    useState([]);
  const [applicantidApplicant, setApplicantidApplicant] = useState(null);
  const [Cibilid, setCibilid] = useState('');
  // 

  const [applicant, setApplicant] = useState(null);
  const [Coapplicant, setCoApplicant] = useState(null);
  const [guarantor, setguarantor] = useState(null);

  const [applicantId, setApplicantId] = useState(null);
  const [CibilScoreStorage, setCibilScoreStorage] = useState({});
  // 

  useEffect(() => {
    // Extract applicantId from CibilScoreStorage when it changes or component mounts
    if (CibilScoreStorage && CibilScoreStorage.applicantId) {
      setApplicantId(CibilScoreStorage.applicantId);
    }
  }, [CibilScoreStorage]);
  // 

  const [applicationNo, setApplicationNo] = useState('');
  // 
  // 

  const [CibilReportUpdateFlags, setCibilReportUpdateFlags] = useState([]);
  const [
    UpdateCibilReportFlagByApplicationNumber,
    setUpdateCibilReportFlagByApplicationNumber,
  ] = useState([]);
  const [
    CibilReportFlagByApplicationNumber,
    setCibilReportFlagByApplicationNumber,
  ] = useState(null);
  // 
  const [filteredActiveFlags, setFilteredActiveFlags] = useState([]);
  const [LogsDetailsByApplicationNumberr, setLogsDetailsByApplicationNumberr] =
    useState(null);
  // 

  // 

  const [cibilScore, setCibilScore] = useState('');
  const [issaveclicked, setissaveclicked] = useState(false);

  const [totalNoOfLoanAccount, setTotalNoOfLoanAccount] = useState(
    CibilScoreStorage?.totalNoOfLoanAccount || '',
  );
  const [totalLoansWithOverDues, setTotalLoansWithOverDues] = useState(
    CibilScoreStorage?.totalLoansWithOverDues || '',
  );
  const [totalLoanWithZeroBalance, setTotalLoanWithZeroBalance] = useState(
    CibilScoreStorage?.totalLoanWithZeroBalance || '',
  );
  const [currentBalance, setCurrentBalance] = useState(
    CibilScoreStorage?.currentBalance || '',
  );
  const [overDuesBalance, setOverDuesBalance] = useState(
    CibilScoreStorage?.overDuesBalance || '',
  );
  const [lastAvailedCreditFacility, setLastAvailedCreditFacility] = useState(
    CibilScoreStorage?.lastAvailedCreditFacility || '',
  );
  const [noOfEnquiriesInLast30Days, setNoOfEnquiriesInLast30Days] = useState(
    CibilScoreStorage?.noOfEnquiriesInLast30Days || '',
  );
  const [noOfEnquiriesInLast12Months, setNoOfEnquiriesInLast12Months] =
    useState(CibilScoreStorage?.noOfEnquiriesInLast12Months || '');
  const [applicantResult, setApplicantResult] = useState(
    CibilScoreStorage?.applicantResult || '',
  );
  const [applicationResult, setApplicationResult] = useState(
    CibilScoreStorage?.applicationResult || '',
  );
  const [verifiersComment, setVerifiersComment] = useState(
    CibilScoreStorage?.verifiersComment || '',
  );
  const [LogId, setLogId] = useState([]);
  const [logger, setlogger] = useState(null);
  // 

  const [
    CibilReportFlagByApplicationNumberQQQ,
    setCibilReportFlagByApplicationNumberQQ,
  ] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [userName, setUserName] = useState('');

  // 

  useEffect(() => {
    if (CibilScoreStorage && CibilScoreStorage.cibilScore != null) {
      setCibilScore(String(CibilScoreStorage.cibilScore));
    } else {
      setCibilScore(''); // Default value if CibilScoreStorage or cibilScore is null
    }
  }, [CibilScoreStorage?.cibilScore]); // Optional chaining in dependency

  const handleCibilScoreChange = value => {
    setCibilScore(value);
  };

  const handleverifiercomment = value => {
    // Update the local state
    setVerifiersComment(value);
  };
  const resultOptions = [
    { label: 'Positive', value: 'positive' },
    { label: 'Negative', value: 'negative' },
  ];

  // 
  useEffect(() => {
    //  // Log entire object for debugging

    if (CibilScoreStorage?.applicantResult) {
      // 
      setApplicantResult(CibilScoreStorage?.applicantResult);
    }

    if (CibilScoreStorage?.applicationResult) {
      // 
      setApplicationResult(CibilScoreStorage?.applicationResult);
    }

    setVerifiersComment(CibilScoreStorage?.verifiersComment || '');
  }, [CibilScoreStorage]);

  // 
  // 

  // 

  // Handle date picker visibility
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  // Confirm date handler

  const handleConfirm = useCallback(date => {
    setExpiryDate(moment(date).format('DD-MM-YYYY')); // Format the date
    hideDatePicker();
  }, []);

  const applicantTypess = applicantTypes.map(type => ({
    label: type,
    value: type,
  }));

  // const applicantCibilRESS = applicantCibilResult.map((type) => (
  //     label: type,
  //     value: type,
  // }));
  const handleSave = () => {
    createCibilReport();
    // setissaveclicked(true);
  };

  const createCibilReport = async () => {
    const payload = {
      applicantId: CibilScoreStorage?.applicantId || applicantidApplicant, // Dynamic values from props or state
      applicantResult: CibilScoreStorage?.applicantResult || applicantResult,
      applicantTypeCode: CibilScoreStorage?.applicantTypeCode,
      applicationNo: item?.applicationNo, // Dynamic value from props or state
      applicationResult:
        CibilScoreStorage?.applicationResult || applicationResult,
      cibilExpiryDate: CibilScoreStorage?.cibilExpiryDate,
      cibilScore: CibilScoreStorage?.cibilScore || cibilScore,
      currentBalance: CibilScoreStorage?.currentBalance || currentBalance,
      lastAvailedCreditFacility:
        CibilScoreStorage?.lastAvailedCreditFacility ||
        lastAvailedCreditFacility,
      noOfEnquiriesInLast12Months:
        CibilScoreStorage?.noOfEnquiriesInLast12Months ||
        noOfEnquiriesInLast12Months,
      noOfEnquiriesInLast30Days:
        CibilScoreStorage?.noOfEnquiriesInLast30Days ||
        noOfEnquiriesInLast30Days,
      overDuesBalance: CibilScoreStorage?.overDuesBalance || overDuesBalance,
      totalLoanWithZeroBalance:
        CibilScoreStorage?.totalLoanWithZeroBalance || totalLoanWithZeroBalance,
      totalLoansWithOverDues:
        CibilScoreStorage?.totalLoansWithOverDues || totalLoansWithOverDues,
      totalNoOfLoanAccount:
        CibilScoreStorage?.totalNoOfLoanAccount || totalNoOfLoanAccount,
      verifiersComment: CibilScoreStorage?.verifiersComment || verifiersComment,
    };

    try {
      const response = await axios.post(
        `${BASE_URL}createCibilReport/${Cibilid}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;

      // Set Cibil Report Flag once response data is received
      setCibilReportFlagByApplicationNumber(data);

      if (response.data.msgKey === 'Success') {
        Alert.alert('Success', 'CIBIL report created successfully');
        getCibilByApplicationNo();
        setissaveclicked(true); // Set flag on success
      } else {
        Alert.alert('Error', 'Failed to create CIBIL report');
      }
    } catch (error) {
      console.error('Error creating CIBIL report:', error);
      Alert.alert('Error', 'Failed to create CIBIL report');
    }
  };

  const getAllCibilReportUpdateFlag = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getAllCibilReportUpdateFlag`,
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
      // Handle the data as needed
      // For example, set it to a state if necessary
      setCibilReportUpdateFlags(data || []); // Assuming you're storing this in state

      if (response.data.msgKey === 'Success') {
        const message = response.data.message; // Extract the message from response data
        Alert.alert('Success', message, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]); // Show the message in the Alert box
        // 

        // Call getAllCibilReportUpdateFlag on success
        // updateCibilReportFlagByApplicationNumber(); // Fetch update flags after successful update
      } else {
        Alert.alert('Error', 'Failed to update CIBIL report flag');
      }
    } catch (error) {
      console.error('Error fetching getAllCibilReportUpdateFlag:', error);
      Alert.alert('Error', 'Failed to fetch getAllCibilReportUpdateFlag');
    }
  }, []);

  const updateCibilReportFlagByApplicationNumber = useCallback(async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}updateCibilReportFlagByApplicationNumber/${applicationNo}/true`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data;
      // 
      // Handle the data as needed
      // For example, set it to a state if necessary
      setUpdateCibilReportFlagByApplicationNumber(data || []); // Assuming you're storing this in state

      if (response.data.msgKey === 'Success') {
        const message = response.data.message; // Extract the message from response data
        Alert.alert('Success', message, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]); // Show the message in the Alert box
        // 

        // Call getAllCibilReportUpdateFlag on success
        // Fetch update flags after successful update
      } else {
        Alert.alert('Error', 'Failed to update CIBIL report flag');
      }
    } catch (error) {
      console.error(
        'Error fetching updateCibilReportFlagByApplicationNumber:',
        error,
      );
      Alert.alert(
        'Error',
        'Failed to fetch updateCibilReportFlagByApplicationNumber',
        error,
      );
    }
  }, []);

  const updateLogActivityById = useCallback(async () => {
    if (!logger) {
      // If logger is not set, return early and do not make API calls
      return; // Exit the function early if logger is not available
    }

    const payload = {
      applicationNumber: applicationNumber,
      description: 'Cibil Report',
      stage: 'Cibil',
      status: 'Pending',
      type: 'User',
      user: userName,
    };

    try {
      // First API call: Update log activity by ID
      const response = await axios.put(
        `${BASE_URL}updateLogActivityById/${logger}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      ); // Use the passed id here
      const data = response.data;
      // 

      // Check CibilReportFlagByApplicationNumber before calling updateCibilReportFlag
      if (!CibilReportFlagByApplicationNumber) {
        // 
        return; // Skip the update if CibilReportFlagByApplicationNumber is invalid
      }

      // Second API call: Update Cibil report flag
      await updateCibilReportFlag(); // Ensure this function is defined and returns a Promise

      // Third API call: Update stage maintain by application number
      await updateStageMainTainByApplicationNumber(); // Ensure this function is defined and returns a Promise

      // Fourth API call: Add log activity
      await addLogActivity(); // Ensure this function is defined and returns a Promise

      // Optionally show success alert or log success message
      // 
    } catch (error) {
      console.error('Error in sequential API calls:', error);
      Alert.alert(
        'Error',
        'Failed to update log activity and call subsequent APIs',
      );
    }
  }, [applicationNumber, userName, logger, CibilReportFlagByApplicationNumber]); // Add CibilReportFlagByApplicationNumber as a dependency
  // Ensure these values are included in the dependencies
  // Ensure these values are included in the dependencies
  // Empty dependency array, as this function doesn't rely on any state changes

  const updateCibilReportFlag = async () => {
    if (!CibilReportFlagByApplicationNumber) {
      // 
      return; // Exit the function early if no valid value
    }

    const payload = {
      active: 'true',
      applicationNo: applicationNo, // Use your dynamic applicationNo here
    };

    try {
      const response = await axios.put(
        `${BASE_URL}updateCibilReportFlag/${CibilReportFlagByApplicationNumber}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      // 

      // Uncomment and handle success if needed
      // if (response.data.msgKey === "Success") {
      //     Alert.alert('Success', response.data.message, [{ text: 'OK' }]);
      // }
    } catch (error) {
      console.error('Error updating CibilReportFlag:', error);
      Alert.alert('Error', 'Failed to update CibilReportFlag');
    }
  };

  const updateStageMainTainByApplicationNumber = useCallback(async () => {
    // Construct the payload once
    const payload = {
      stage: 'DDE',
      applicationNo: applicationNo,
    };

    try {
      // Make the PUT request with applicationNo in the URL
      const response = await axios.put(
        `${BASE_URL}updateStageMainTainByApplicationNumber/${applicationNo}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },

      );

      // Handle response if necessary (e.g., updating local state)
      // 
    } catch (error) {
      // Handle specific error codes if needed
      console.error(`Error updating application ${applicationNo}:`, error);
      Alert.alert(
        'Error',
        `Failed to update the stage for application number ${applicationNo}. Please try again.`,
      );
    }
  }, [applicationNo, BASE_URL]);

  // useEffect(() => {
  //     updateStageMainTainByApplicationNumber();
  // }, []);

  const addLogActivity = useCallback(async () => {
    const payload = {
      applicationNumber: applicationNumber,
      description: 'DDE',
      stage: 'DDE',
      status: 'Pending',
      type: 'User',
      user: userName,
    };

    try {
      // Make the API call with the payload
      const { data } = await axios.post(`${BASE_URL}addLogActivity`, payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      // 

      // Optional success notification if required
      Alert.alert('Success', 'Log activity updated successfully');
    } catch (error) {
      console.error('Error updating log activity:', error?.message || error);

      // Improved error handling with specific user feedback
      Alert.alert(
        'Error',
        error.response?.data?.message ||
        'Failed to update log activity. Please try again.',
      );
    }
  }, [applicationNumber, userName, BASE_URL]);

  const getCibilScoreDataByid = async applicantId => {
    if (applicantId) {
      // Check if applicantId has a value
      try {
        const response = await axios.get(
          `${BASE_URL}getCibilReportOnApplicantId/${applicantId}`,
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
        setCibilScoreStorage(data); // Ensure it's not null
        setApplicantCibilResult(data?.applicantResult);
        setCibilReportid(data?.cibilReportId);
      } catch (error) {
        console.error('Error fetching CIBIL data:', error);
        // Optionally alert the user
        // Alert.alert('Error', 'Failed to fetch Cibil Score data');
      }
    }
  };

  // Effect to call the API only when applicantidApplicant has a value
  useEffect(() => {
    if (applicantidApplicant) {
      getCibilScoreDataByid(applicantidApplicant); // Pass the applicant ID to the function
    }
  }, [applicantidApplicant]); // Dependency on applicantidApplicant

  useEffect(() => {
    if (item && item.id) {
      getAllApplication(); // Fetch the data only when item and item.id exist
      getAllCibilReports();
      getCibilByApplicationNoo();
      getFlagDataOfCibilReportByApplicationNumberr();
      getLogsDetailsByApplicationNumber();
    } else {
      console.error('Item or Item ID is undefined');
      Alert.alert('Error', 'Item or Item ID is missing');
    }
  }, [item]);

  const getAllApplication = useCallback(async () => {
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

      // Ensure that data is valid before proceeding
      if (!data) {
        throw new Error('Application data not found');
      }

      const applicants = data?.applicant || [];
      const applicationNo = data?.applicationNo || '';
      const createdBy = data?.createdBy || {};
      const userNameFromApi = createdBy.userName || '';

      // Store applicationNumber and userName in state
      setApplicationNumber(applicationNo);
      setUserName(userNameFromApi);

      // Set other state variables based on the response data
      setApplicantArray(applicants);
      if (applicants.length > 0) setApplicant(applicants[0]);
      if (applicants.length > 1) setCoApplicant(applicants[1]);
      if (applicants.length > 2) setguarantor(applicants[2]);

      const applicantCodes = applicants.map(app => app.applicantTypeCode);
      setApplicantTypes(applicantCodes);
      setApplicationDetails(Array.isArray(data) ? data : [data || {}]);

      // Now you can use the applicationNumber and userName state as needed
      // For example, you could call other functions with these values like:
      // await addLogActivity(applicationNo, userName);
      // await updateStageMainTainByApplicationNumber();
    } catch (error) {
      console.error('Error fetching application data:', error);
      Alert.alert('Error', 'Failed to fetch application data');
    }
  }, [item.id]);

  const getAllCibilReports = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getAllCibilReports`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data; // Adjust as per your API response structure
      // 

      // Process the data as needed
      // For example, you might want to update state or perform other actions based on the response
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch CIBIL reports');
    }
  };

  const getCibilByApplicationNo = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getCibilByApplicationNo/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data; // Adjust as per your API response structure
      // 
      if (response.data.message === 'Success') {
        Alert.alert('Success', 'CIBIL report created successfully');
        getFlagDataOfCibilReportByApplicationNumber();
      } else {
        Alert.alert('Error', 'Failed to create CIBIL report');
      }
      // Process the data as needed
      // For example, you might want to update state or perform other actions based on the response
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch CIBIL reports');
    }
  };

  const getCibilByApplicationNoo = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getCibilByApplicationNo/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data; // Adjust as per your API response structure
      // 
      if (response.data.message === 'Success') {
        // Alert.alert('Success', 'CIBIL report created successfully');
        // getFlagDataOfCibilReportByApplicationNumber();
      } else {
        Alert.alert('Error', 'Failed to create CIBIL report');
      }
      // Process the data as needed
      // For example, you might want to update state or perform other actions based on the response
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch CIBIL reports');
    }
  };

  const getFlagDataOfCibilReportByApplicationNumber = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getFlagDataOfCibilReportByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data;
      // 

      if (response.data.msgKey === 'Success') {
        Alert.alert('Success', 'getFlagDataOfCibilReportByApplicationNumber');
        getCibilScoreDataByid();
        getLogsDetailsByApplicationNumber();
      } else {
        Alert.alert('Error', 'getFlagDataOfCibilReportByApplicationNumber');
      }

      // Handle the data as needed
      // For example, set it to a state if necessary
      // setCibilReportFlagByApplicationNumber(data || []); // Assuming you're storing this in state
    } catch (error) {
      console.error(
        'Error fetching getFlagDataOfCibilReportByApplicationNumber:',
        error,
      );
      Alert.alert(
        'Error',
        'Failed to fetch getFlagDataOfCibilReportByApplicationNumber',
      );
    }
  }, []);

  const getFlagDataOfCibilReportByApplicationNumberr = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getFlagDataOfCibilReportByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data;
      // 

      // if (response.data.msgKey === 'Success') {
      //     Alert.alert('Success', 'getFlagDataOfCibilReportByApplicationNumber');
      //     getCibilScoreDataByid();
      // } else {
      //     Alert.alert('Error', 'getFlagDataOfCibilReportByApplicationNumber');
      // }

      // Handle the data as needed
      // For example, set it to a state if necessary
      // setCibilReportFlagByApplicationNumber(data || []); // Assuming you're storing this in state
    } catch (error) {
      console.error(
        'Error fetching getFlagDataOfCibilReportByApplicationNumber:',
        error,
      );
      Alert.alert(
        'Error',
        'Failed to fetch getFlagDataOfCibilReportByApplicationNumber',
      );
    }
  }, []);

  const getLogsDetailsByApplicationNumber = async () => {
    try {
      // Fetch logs based on the application number
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
      // 

      // Filter the logs where applicationNumber matches the applicationNo state
      // and the description is "Cibil Report" and status is "Pending"
      const filteredLogs = data.filter(
        log =>
          // log.applicationNumber === applicationNo &&
          log.description === 'Cibil Report' && log.status === 'Pending',
      );
      // 

      // Check if any filtered logs are found
      if (filteredLogs.length > 0) {
        // Extract the id from the first matching log and set it to logger state
        const logid = filteredLogs[0].id;
        setlogger(logid); // Set the logger state after data is found
        // 
      } else {
        // 
        setlogger(null); // Set logger to null if no logs match
      }

      // Update state with filtered logs only if data is valid
      if (filteredLogs.length > 0) {
        setLogsDetailsByApplicationNumberr(filteredLogs); // Set filtered logs to state
      }
    } catch (error) {
      console.error('Error fetching getLogsDetailsByApplicationNumber:', error);
      Alert.alert('Error', 'Failed to fetch getLogsDetailsByApplicationNumber');
    }
  };

  // UseEffect to log the value of logger when it updates
  useEffect(() => {
    if (logger !== null) {
      //   // Log the updated value of logger after it has been set
    }
  }, [logger]);
  // Add dependencies for `applicationNo` and `item.applicationNo`

  // useEffect(() => {
  //     if (applicantidApplicant) {
  //         getCibilScoreDataByid(); // Fetch Cibil Score data whenever Cibilid changes
  //     }
  // }, [applicantidApplicant]); //

  // Optimize the content rendering with useMemo for expensive calculations
  const applicantName = useMemo(() => {
    // Ensure item and item.applicant are defined and an array
    const applicant = item?.applicant?.find(
      app => app.applicantTypeCode === 'Applicant',
    );

    // Check if individualApplicant is not null or undefined
    if (applicant && applicant?.individualApplicant) {
      const { firstName = '', lastName = '' } = applicant?.individualApplicant;
      return `${firstName} ${lastName}`;
    }

    return ''; // Return an empty string if individualApplicant is null or undefined
  }, [item]);

  const handleDropdownChange = item => {
    setSelectedApplicantType(item.value);
    const selectedApplicant = ApplicantArray.find(
      app => app.applicantTypeCode === item.value,
    );

    // 

    if (selectedApplicant && selectedApplicant?.individualApplicant) {
      const individualApplicantId = selectedApplicant?.id;
      const applicantid = selectedApplicant?.id;
      setApplicantidApplicant(applicantid);
      // 
      setApplicantidIndividualApplicant(individualApplicantId);
    } else {
      console.error('No individualApplicant found in selectedApplicant');
    }

    if (selectedApplicant) {
      setApplicantCategoryCode(selectedApplicant?.applicantCategoryCode);
      setCibilid(selectedApplicant?.id);
      const { firstName, lastName } =
        selectedApplicant?.individualApplicant || {};
      setFullName(`${firstName || ''} ${lastName || ''}`);
    } else {
      setApplicantCategoryCode('');
      setFullName('');
    }
  };

  const handleDropdownChangeapplicantResult = item => {
    setSelectedApplicantCibilResult(item.value);
  };

  useEffect(() => {
    // Extract applicationNo when CibilScoreStorage changes
    if (CibilScoreStorage?.applicationNo) {
      setApplicationNo(CibilScoreStorage?.applicationNo);
    } else {
      setApplicationNo(item?.applicationNo);
    }
  }, [CibilScoreStorage]);

  useEffect(() => {
    //  // Log applicationNo
    const filteredFlags = CibilReportUpdateFlags.filter(
      flag => flag.applicationNo === applicationNo && flag.active,
    );
    setFilteredActiveFlags(filteredFlags);
  }, [CibilReportUpdateFlags, applicationNo]);

  const handleSubmitButton = () => {
    // getAllApplicationSub();
    // getFlagDataOfCibilReportByApplicationNumberrSub();
    // getLogsDetailsByApplicationNumberSub();
    // getCibilByApplicationNooSub();
    updateLogActivityById();
  };

  const getAllApplicationSub = useCallback(async () => {
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
    } catch (error) {
      console.error('Error fetching application data:', error);
      Alert.alert('Error', 'Failed to fetch application data');
    }
  }, []);

  const getFlagDataOfCibilReportByApplicationNumberrSub =
    useCallback(async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}getFlagDataOfCibilReportByApplicationNumber/${item.applicationNo}`,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
          },
        );
        const data = response.data;
        // 
      } catch (error) {
        console.error(
          'Error fetching getFlagDataOfCibilReportByApplicationNumber:',
          error,
        );
        Alert.alert(
          'Error',
          'Failed to fetch getFlagDataOfCibilReportByApplicationNumber',
        );
      }
    }, []);

  const getLogsDetailsByApplicationNumberSub = useCallback(async () => {
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
      const data = response.data;

      // 
    } catch (error) {
      console.error('Error fetching getLogsDetailsByApplicationNumber:', error);
      Alert.alert('Error', 'Failed to fetch getLogsDetailsByApplicationNumber');
    }
  }, []);

  const getCibilByApplicationNooSub = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getCibilByApplicationNo/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data; // Adjust as per your API response structure
      // 
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch CIBIL reports');
    }
  };

  const renderInput = useCallback(
    (label, value, editable = false, onChangeText = null) => (
      <View style={{ flex: 1, paddingHorizontal: 5, minWidth: '30%' }}>
        <Text style={styles.labelformodal}>{label}</Text>
        <TextInput
          style={styles.inputformodal}
          value={value || ''}
          editable={editable}
          onChangeText={onChangeText} // Attach the handler to update the value
        />
      </View>
    ),
    [],
  );

  const renderDropdown = useCallback(
    (label, data, selectedValue, onChange, placeholder) => (
      <View style={{ flex: 1, width: width * 0.9, marginLeft: 4 }}>
        <Text style={styles.labeldropd}>{label}</Text>
        <Dropdown
          data={data}
          labelField="label"
          valueField="value"
          placeholder={placeholder}
          placeholderStyle={styles.placeholderStyledrop}
          value={selectedValue}
          onChange={onChange}
          style={styles.dropdown1}
          renderItem={item => (
            <View style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </View>
          )}
          selectedTextStyle={{ fontSize: 10, color: 'black' }}
        />
      </View>
    ),
    [],
  );

  const CustomButton = ({ title, color, onPress }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Sales')}>
          <Image source={require('../../asset/icons/back.png')} />
        </TouchableOpacity>
        <Text style={styles.cardTitle}>CIBIL Report</Text>

        <Section title="Application Details">
          {renderInput('Application Number', item?.applicationNo)}
          {renderInput('Applicant Name', applicantName)}
          {renderInput('Applied Loan Amount', String(item?.loanAmount))}
          {renderInput(
            'Created Date',
            applicationDetails?.length > 0
              ? applicationDetails[0]?.createdDate
              : item?.createdDate,
          )}
          {renderInput('Status', item?.status)}
          {renderInput('Stage', item?.stage)}
        </Section>

        <Section title="Applicant Details">
          {renderInput('CIF/Applicant Name', fullName)}
          <View style={{ flexDirection: 'row', marginVertical: 10 }}>
            {renderDropdown(
              'Select Applicant Type',
              applicantTypess,
              selectedApplicantType,
              handleDropdownChange,
              'Select Applicant Type',
            )}
          </View>
          {/* <InputRow label="Category" value={applicantCategoryCode} /> */}
          {renderInput('Category', applicantCategoryCode)}
        </Section>

        <Section title="CIBIL Details">
          {renderInput(
            'CIBIL Score',
            cibilScore,
            true,
            handleCibilScoreChange, // Use the handler for text change
          )}

          {/* CIBIL Expiry Date */}
          <View style={styles.expiryRow}>
            {renderInput(
              'CIBIL Expiry Date',
              CibilScoreStorage?.cibilExpiryDate || expiryDate,
              false, // Non-editable
              <TouchableOpacity
                style={styles.touchableOpacity}
                onPress={showDatePicker}>
                <Image
                  source={require('../asset/icons/calendar.png')}
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>,
            )}
          </View>

          {renderInput(
            'Total No Of Loan Account',
            totalNoOfLoanAccount,
            false,
            'Total No Of Loan Account',
            setTotalNoOfLoanAccount,
          )}
          {renderInput(
            'Total Loans With Overdues',
            totalLoansWithOverDues,
            false,
            'Total Loans With Overdues',
            setTotalLoansWithOverDues,
          )}
          {renderInput(
            'Total Loan With Zero Balance',
            totalLoanWithZeroBalance,
            false,
            'Total Loan With Zero Balance',
            setTotalLoanWithZeroBalance,
          )}
          {renderInput(
            'Current Balance',
            currentBalance,
            false,
            'Current Balance',
            setCurrentBalance,
          )}
          {renderInput(
            'Overdues Balance',
            overDuesBalance,
            false,
            'Overdues Balance',
            setOverDuesBalance,
          )}
          {renderInput(
            'Last Availed Credit Facility',
            lastAvailedCreditFacility,
            false,
            'Last Availed Credit Facility',
            setLastAvailedCreditFacility,
          )}
          {renderInput(
            'No Of Enquiries in Last 30 Days',
            noOfEnquiriesInLast30Days,
            false,
            'No Of Enquiries in Last 30 Days',
            setNoOfEnquiriesInLast30Days,
          )}
          {renderInput(
            'No Of Enquiries in Last 12 Months',
            noOfEnquiriesInLast12Months,
            false,
            'No Of Enquiries in Last 12 Months',
            setNoOfEnquiriesInLast12Months,
          )}

          {/* Applicant Result */}
          {CibilScoreStorage?.applicantResult &&
            renderInput(
              'Applicant Result',
              CibilScoreStorage?.applicantResult,
              false,
              'Applicant Result',
              null,
              { color: 'black' },
            )}

          {/* Application Result */}
          {CibilScoreStorage?.applicationResult &&
            renderInput(
              'Application Result',
              CibilScoreStorage?.applicationResult,
              false,
              'Application Result',
              null,
              { color: 'black' },
            )}

          <View>
            {/* Check if CibilScoreStorage has data for applicantResult */}
            {!CibilScoreStorage?.applicantResult && (
              <View style={{ flexDirection: 'column', marginVertical: 10 }}>
                {renderDropdown(
                  'Applicant Result',
                  resultOptions,
                  applicantResult,
                  item => setApplicantResult(item.value),
                  'Select Result',
                )}
              </View>
            )}

            {/* Check if CibilScoreStorage has data for applicationResult */}
            {!CibilScoreStorage?.applicationResult && (
              <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                {renderDropdown(
                  'Application Result',
                  resultOptions,
                  applicationResult,
                  item => {
                    setApplicationResult(item.value);
                    setCibilScoreStorage(prev => ({
                      ...prev,
                      applicationResult: item.value,
                    }));
                  },
                  'Select Result',
                )}
              </View>
            )}
          </View>

          {renderInput(
            "Verifier's Comment",
            verifiersComment,
            true,
            text => setVerifiersComment(text), // Update state on text change
          )}
          <View style={styles.buttonContainer}>
            <CustomButton
              title="View Report"
              color="blue"
              onPress={() => {
                /* Your action for View Report */
              }}
            />
            <CustomButton
              title="CIBIL Trigger"
              color="grey"
              onPress={() => Alert.alert('CIBIL Trigger pressed')}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton title="Save" color="green" onPress={handleSave} />
            {issaveclicked && (
              <CustomButton
                title="Submit"
                color="blue"
                onPress={handleSubmitButton}
              />
            )}
            <CustomButton
              title="Close"
              color="red"
              onPress={() => Alert.alert('Close pressed')}
            />
          </View>
        </Section>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </ScrollView>
  );
};

const Section = React.memo(({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.divider} />
    {children}
  </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  card: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    color: 'black',
    marginVertical: 5,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: 'black',
  },
  labeldropd: {
    fontSize: 12,
    marginBottom: 4,
    color: 'black',
    fontWeight: 'bold',
  },
  input: {
    padding: 5,
    borderRadius: 5,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    borderRadius: 5,
    height: 60,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.3,
    height: height * 0.05,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  required: {
    color: 'red',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 5,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  touchableOpacity: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  calendarIcon: {
    width: 20,
    height: 20,
    tintColor: '#666', // Adjust color if needed
    marginLeft: 10,
  },
  calendarIcon: {
    marginLeft: 10,
    width: 20,
    height: 20,
  },
  placeholderStyle: {
    color: 'black',
  },
  placeholderStyledrop: {
    color: 'black',
    fontSize: 10,
  },
  dropdown: {
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    padding: 6,
    width: width * 0.5,
    marginLeft: 20,
  },
  dropdownApplicationResult: {
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    padding: 6,
    width: width * 0.5,
    marginLeft: 10,
  },
  dropdownItem: {
    padding: 10,
    backgroundColor: '#fff',
  },
  dropdownItemText: {
    color: '#000',
  },
  dropdown1: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 8,
    fontSize: 12,
    backgroundColor: '#f9f9f9',
    color: 'black',
    width: width * 0.84,
    height: height * 0.04,
  },

  labelformodal: {
    fontSize: 12,
    marginBottom: 4,
    color: 'black',
    fontWeight: 'bold',
  },

  inputformodal: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 8,
    fontSize: 12,
    backgroundColor: '#f9f9f9',
    color: 'black',
    width: width * 0.84,
    height: height * 0.04,
  },
});

export default CibilReportProcess;
