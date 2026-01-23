import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { SafeAreaView, StatusBar, FlatList, StyleSheet, Text, Dimensions, Image, TouchableOpacity, View, Pressable, Modal, ActivityIndicator, ScrollView, Alert } from 'react-native'
import { DrawerContext } from '../../../Drawer/DrawerContext';
import { scale, verticalScale, moderateScale, ms } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
// import CheckBox from '@react-native-community/checkbox';

import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';


import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
import { theme } from '../utility/Theme';
import DashboardCard from '../component/DashboardCard';
const { height, width } = Dimensions.get('window')

const Header = React.memo(({ title, onOpenDrawer }) => (
  <View style={styles.header}>
    <Pressable onPress={onOpenDrawer}>
      <Image source={require('../../../asset/icon/menus.png')} style={styles.drawerIcon} />
    </Pressable>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
));

const Row = ({ label, value }) => (
  <View style={styles.rowItem}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value ?? 0}</Text>
  </View>
);
const MCCheck = ({ value, onChange }) => (
  <Pressable onPress={() => onChange(!value)} style={styles.checkWrap}>
    <MaterialCommunityIcons
      name={value ? "checkbox-marked" : "checkbox-blank-outline"}
      size={24}
      color={value ? "#001D56" : "#555"}
    />
  </Pressable>
);

/* --------------------------
   LenderSelectorModal Component
   --------------------------*/
const LenderSelectorModal = React.memo(({
  visible,
  onClose,
  lenderLists,
  selectedLenders,
  onToggleLender,
  onToggleSelectAll,
  selectAll,
  onOK,
  pressedButton,
}) => {
  const renderLender = useCallback(({ item }) => (
    <Pressable style={styles.lenderRow} onPress={() => onToggleLender(item.lenderId)}>
      <MCCheck
        value={selectedLenders.includes(item.lenderId)}
        onChange={() => onToggleLender(item.lenderId)}
      />

      <Text style={styles.itemText}>{item.lenderName}</Text>
    </Pressable>
  ), [selectedLenders, onToggleLender]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.modalBox}>
        <Text style={styles.title}>Select Lender</Text>

        <Pressable style={styles.selectAllRow} onPress={onToggleSelectAll}>
          {/* <CheckBox value={selectAll} onValueChange={onToggleSelectAll} /> */}

          <MCCheck
            value={selectAll}
            onChange={onToggleSelectAll}
          />
          <Text style={styles.rowText}>Select All</Text>
        </Pressable>

        <View style={styles.separator} />

        <View style={{ maxHeight: height * 0.45 }}>
          <FlatList
            data={lenderLists}
            keyExtractor={(i) => String(i.lenderId)}
            renderItem={renderLender}
            showsVerticalScrollIndicator
          />
        </View>

        <View style={styles.modalButtons}>
          <Pressable onPress={onClose}>
            <View style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </View>
          </Pressable>

          <Pressable onPress={onOK}>
            <View style={styles.okButton}>
              <Text style={styles.okText}>OK</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

/* --------------------------
   TodayTasksModal Component
   --------------------------*/
const TodayTasksModal = React.memo(({ visible, onClose, tasks }) => (
  <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose} />
    <View style={styles.modalBox}>
      <Text style={styles.title}>Today's Task</Text>

      <Row label="Total PTPs" value={tasks?.totalPtp} />
      <Row label="PTPs Collected" value={tasks?.ptpCollected} />
      <Row label="Total Visits" value={tasks?.totalVisit} />
      <Row label="Visits Completed" value={tasks?.completedVisit} />
      <Row label="Visits Cancelled" value={tasks?.cancelledVisit} />
      <Row label="Visit Scheduled" value={tasks?.scheduledVisit} />
      <Row label="Visit Rescheduled" value={tasks?.reScheduleVisit} />

      <Pressable onPress={onClose} style={styles.okButtonWrapper}>
        <View style={styles.okButton}>
          <Text style={styles.okText}>Okay</Text>
        </View>
      </Pressable>
    </View>
  </Modal>
));


const Dashboard = () => {
  const { isDrawerVisible, openDrawer, closeDrawer } = useContext(DrawerContext);
  const token = useSelector(state => state.auth.token);
  const userProfile = useSelector(state => state.auth.userProfile);
  // console.log(token, 'tokentoken')
  const roleCode = useSelector(state => state.auth.roleCode);
  const agencyIds = useMemo(() => userProfile?.agency?.map(a => a.agencyId) ?? [], [userProfile]);
  const GOOGLE_MAPS_APIKEY = 'AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE';
  useEffect(() => {
    setAgencyId(agencyIds);
  }, [agencyIds])

  const [AgencyId, setAgencyId] = useState([]);
  // console.log(userProfile, 'userProfileuserProfile')
  const [lenderLists, setlenderLists] = useState([]);
  const [hasCalledApi, setHasCalledApi] = useState(false);
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pressedButton, setPressedButton] = useState(true);
  const [dropdownValue, setDropdownValue] = useState('');
  const [okPressed, setOkPressed] = useState(false);
  const [apiResponseData, setApiResponseData] = useState(null);
  const [unAllocatedApprovedData, setUnAllocatedApprovedData] = useState([]);
  const [PaymentDepostion, setPaymentDepostion] = useState([]);
  const [ApprovedPaymentDepositionAmount, setApprovedPaymentDepositionAmount] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [ApproveUnallocared, setApproveUnallocared] = useState([]);
  const [FilteredDeposition, setFilteredDeposition] = useState([]);
  const [depositionAmountss, setDepositionAmounts] = useState([]);
  const [finalApprovedPaymentDepositionAmount, setfinalApprovedPaymentDepositionAmount] = useState([]);
  const [FiledORCallvalues, setFiledORCallvalues] = useState(false);
  const [TodayTaskList, setTodayTaskList] = useState({});
  const [todayTaskModal, settodayTaskModal] = useState(false);

  const [daily, setDaily] = useState([]);
  const [visitForTodayData, setVisitForTodayData] = useState([]);
  const [curlat, setCurLat] = useState();
  const [curLong, setCurLong] = useState();
  // console.log(curlat, curLong, 'curlatcurlatcurlong')
  const [lat, setLat] = useState();
  const [long, setLong] = useState();
  const [curName, setCurName] = useState('');
  const [followupData, setfollowupData] = useState([]);

  const [ptpData, setptpData] = useState([]);
  const [allcount, setallcount] = useState({});
  const [summaryData, setSummaryData] = useState([]);
  const [dashboardCountData, setdashboardCountData] = useState({});
  const [loadingcount, setLoadingcount] = useState(false);
  const navigation = useNavigation();

  const [TrackerAdminConfig, setTrackerAdminConfig] = useState([]);
  // 
  // console.log(TrackerAdminConfig, 'TrackerAdminConfigTrackerAdminConfig')
  const [roles, setRoles] = useState([]);
  const [AgencyTrackingConfigsForfirstTime, setAgencyTrackingConfigsForfirstTime] = useState([])
  const [agencyTrackingConfigs, setAgencyTrackingConfigs] = useState([]);
  // console.log(roles, 'rolesroles')
  const [drpvalues, setdrpValues] = useState({
    label: 'Current Month',
    value: '4',
  });

  const [isFocus, setIsFocus] = useState(false);
  const toggleModal = () => {
    setModalVisible(prev => {
      const newState = !prev;

      if (newState === false) {
        // Modal closed → reset all
        setSelectedLenders([]);
        setSelectAll(false);
        setDropdownValue("");
        setOkPressed(false);
      }

      return newState;
    });
  };


  const onToggleLender = useCallback((lenderId) => {
    setSelectedLenders(prev => {
      const idx = prev.indexOf(lenderId);
      if (idx !== -1) return prev.filter(i => i !== lenderId);
      return [...prev, lenderId];
    });
  }, []);
  // const toggleModal = useCallback(() => setModalVisible(v => !v), []);
  // const toggleTodayTasksModal = useCallback(() => setTodayTaskModal(v => !v), []);
  const onToggleSelectAll = useCallback(() => {
    setSelectAll(p => {
      const next = !p;
      if (next) {
        setSelectedLenders(lenderLists.map(l => l.lenderId));
      } else {
        setSelectedLenders([]);
      }
      return next;
    });
  }, [lenderLists]);

  const handleOK = () => {
    const selectedLendersData = (lenderLists ?? []).filter(lender =>
      selectedLenders.includes(lender.lenderId)
    );

    const selectedLenderNames = selectedLendersData.map(lender => lender.lenderName);
    setDropdownValue(selectedLenderNames.join(', '));

    const selectedLenderIds = selectedLendersData.map(lender => lender.lenderId);

    if (selectedLenderNames.length === 0) {
      setOkPressed(false);
    } else {
      const filtered = (apiResponseData ?? []).filter(item =>
        selectedLenderNames.includes(item.lenderName)
      );

      const approveFilteredData = (unAllocatedApprovedData ?? []).filter(item =>
        selectedLenderNames.includes(item.lenderName)
      );

      const paymentDeposition = (PaymentDepostion ?? []).filter(item =>
        selectedLenderNames.includes(item.lenderName)
      );

      const Approvepayemntdeposition = (ApprovedPaymentDepositionAmount ?? []).filter(
        item => selectedLenderNames.includes(item.lenderName)
      );

      const depositionAmounts = paymentDeposition.map(item => item.amount);
      const approveDepositionAmounts = Approvepayemntdeposition.map(item => item.amount);

      const totalDepositionAmount =
        depositionAmounts.length > 1
          ? depositionAmounts.reduce((acc, curr) => acc + curr, 0)
          : depositionAmounts[0] || 0;

      const totalApprovedDepositionAmount =
        approveDepositionAmounts.length > 1
          ? approveDepositionAmounts.reduce((acc, curr) => acc + curr, 0)
          : approveDepositionAmounts[0] || 0;

      setFilteredData(filtered);
      setApproveUnallocared(approveFilteredData);
      setFilteredDeposition(paymentDeposition);
      setDepositionAmounts(totalDepositionAmount);
      setfinalApprovedPaymentDepositionAmount(totalApprovedDepositionAmount);
      setOkPressed(true);
    }

    toggleModal();
  };

  const getCurrentLocationonetime = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        // 

        const locationData = `${latitude},${longitude}`;
        liveLocationontimeTracking(locationData);

        setCurLat(latitude);
        setCurLong(longitude);
        // setLatitude(latitude);
        // setLongitude(longitude);
        // successSound.play(); // Play success sound
      },
      error => {
        console.error('Error getting locationDashboard.js:', error.message);
        // Retry fetching location after a delay
        setTimeout(getCurrentLocationonetime, 1000); // Retry after 1 second (adjust as needed)
      },
    );
  };

  useEffect(() => {
    if (!hasCalledApi) {
      const roleCodesToCheck = Array.isArray(roleCode) ? roleCode : [roleCode];
      const roleMatch = roles.find(role =>
        roleCodesToCheck.includes(role.roleName)
      );
      console.log(roleCodesToCheck, roleCode, roles, roleMatch, 'roleMatchroleMatch')
      if (roleMatch) {
        // Role matches, call the API instantly
        getCurrentLocationonetime();
        setHasCalledApi(true); // Ensure the API is marked as called
      }
    }
  }, [roles, roleCode, hasCalledApi]);


  useEffect(() => {
    if (hasCalledApi || !AgencyTrackingConfigsForfirstTime.length) return;

    const roleCodesToCheck = Array.isArray(roleCode) ? roleCode : [roleCode];
    const agencyIdsToCheck = Array.isArray(AgencyId) ? AgencyId : [AgencyId];

    const matchingAgencyConfig = AgencyTrackingConfigsForfirstTime.find(config =>
      agencyIdsToCheck.includes(config.agencyId)
    );

    if (!matchingAgencyConfig) {

      return;
    }


    const roleStatusArray = JSON.parse(matchingAgencyConfig.agencyTrackingRoleStatus);

    const isRoleMatched = roleCodesToCheck.some(code => {
      const role = roleStatusArray.find(role => role.roleCode === code);
      return role?.status === 'Y';
    });

    if (isRoleMatched) {

      getCurrentLocationonetime();
      setHasCalledApi(true);
    } else {

    }
  }, [AgencyTrackingConfigsForfirstTime, roleCode, AgencyId, hasCalledApi]);



  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        let locationData = `${position.coords.latitude},${position.coords.longitude}`;
        liveLocationTracking(locationData);
        setCurLat(position.coords.latitude);
        setCurLong(position.coords.longitude);
        // setLatitude(position.coords.latitude);
        // setLongitude(position.coords.longitude);
        // console.log(locationData, 'locationDatalocationData')

      },
      error => {
        console.error('Error getting location:', error.message);
        // Retry fetching location after a delay
        setTimeout(getCurrentLocation, 1000); // Retry after 1 second (adjust as needed)
      },
    );
  };

  useEffect(() => {
    const showAlert = message => {
      Alert.alert(
        'Condition Check Failed For Internal', // Title
        message, // Message
        [{ text: 'OK' }], // Button
      );
    };
    const checkMandatoryConditions = () => {
      const { active, frequencyStartTime, frequencyEndTime, frequencyType } =
        TrackerAdminConfig;

      if (
        active === undefined ||
        frequencyStartTime === undefined ||
        frequencyEndTime === undefined ||
        frequencyType === undefined
      ) {

        // showAlert('TrackerAdminConfig is not fully initialized yet');
        return false;
      }

      // 1. Check if active is true
      if (!active) {

        // showAlert('Tracking is inactive.');
        return false; // Stop execution if active is false
      }


      // 2. Check if role matches any internal role
      const roleCodesToCheck = Array.isArray(roleCode) ? roleCode : [roleCode];
      const roleMatch = roles.find(role =>
        roleCodesToCheck.includes(role.roleName),
      );
      if (!roleMatch) {

        // showAlert('Role code mismatch.');
        return false; // Stop execution if role does not match
      }


      // 3. Check if frequencyStartTime and frequencyEndTime are present
      if (!frequencyStartTime || !frequencyEndTime) {

        // showAlert('Start or end time is missing.');
        return false; // Stop execution if start or end time is missing
      }


      // 4. Check if frequencyType is present
      if (!frequencyType) {

        // showAlert('Frequency type is missing.');
        return false; // Stop execution if frequencyType is missing
      }


      return true; // All mandatory conditions passed
    };

    const checkConditionsAndSetInterval = () => {
      // First, check all mandatory conditions
      if (!checkMandatoryConditions()) {

        return; // Stop execution if any mandatory condition fails
      }

      // Additional non-mandatory checks
      const {
        repeatEvery,
        selectedMonths,
        selectedYears,
        selectedWeeks,
        startDate,
        endDate,
        frequencyStartTime,
        frequencyEndTime,
      } = TrackerAdminConfig;
      const currentDate = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Repeat conditions checks
      if (repeatEvery === 'Monthly') {
        const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
        // .format(currentDate);
        const selectedMonthsArray = selectedMonths
          .split(', ')
          .map(month => month.trim());
        if (!selectedMonthsArray.includes(currentMonth)) {

          // showAlert('Current month is not in selected months.');
          return;
        }

      } else if (repeatEvery === 'Yearly') {
        const currentYear = currentDate.getFullYear();
        const selectedYearsArray = selectedYears
          .split(', ')
          .map(year => year.trim());
        if (!selectedYearsArray.includes(currentYear.toString())) {

          // showAlert('Current year is not in selected years.');
          return;
        }

      } else if (repeatEvery === 'Days') {
        if (currentDate < start || currentDate > end) {

          // showAlert('Current date is not within the specified date range.');
          return;
        }

      } else if (repeatEvery === 'Weekly') {
        const currentDay = new Date().toLocaleString('en-US', { weekday: 'short' });
        // .format(currentDate);
        const selectedWeeksArray = selectedWeeks
          .split(', ')
          .map(day => day.trim());
        if (!selectedWeeksArray.includes(currentDay)) {

          // showAlert('Current day is not in selected weeks.');
          return;
        }

      }

      // Convert start and end times to Date objects and check if the current time is within the interval
      const [frequencyStartHour, frequencyStartMinute] = frequencyStartTime
        .split(' ')[0]
        .split(':')
        .map(Number);
      const frequencyStartPeriod = frequencyStartTime.split(' ')[1];
      const frequencyStart = new Date();
      frequencyStart.setHours(
        frequencyStartPeriod === 'PM'
          ? frequencyStartHour + 12
          : frequencyStartHour,
        frequencyStartMinute,
      );

      const [frequencyEndHour, frequencyEndMinute] = frequencyEndTime
        .split(' ')[0]
        .split(':')
        .map(Number);
      const frequencyEndPeriod = frequencyEndTime.split(' ')[1];
      const frequencyEnd = new Date();
      frequencyEnd.setHours(
        frequencyEndPeriod === 'PM' ? frequencyEndHour + 12 : frequencyEndHour,
        frequencyEndMinute,
      );

      const currentTime = new Date();

      if (currentTime < frequencyStart || currentTime > frequencyEnd) {


        // showAlert('Current time is not within the tracking time range.');
        return;
      }


      // All conditions met, set interval for location tracking

      const intervalTime =
        TrackerAdminConfig.frequencyType === 'realtime' ? 15000 : 3600000; // 1 min or 1 hour
      // console.log(intervalTime, 'intervalTimeintervalTime')
      if (window.currentInterval) clearInterval(window.currentInterval);

      window.currentInterval = setInterval(() => {
        getCurrentLocation();
      }, intervalTime);


      showAlert;
    };

    checkConditionsAndSetInterval();

    return () => {
      if (window.currentInterval) clearInterval(window.currentInterval);
    };
  }, [TrackerAdminConfig, roles, roleCode]);

  //Working For Agency
  useEffect(() => {
    const excludedRoles = ['DRA', 'ARM', 'PRM', 'CH', 'RH', 'ZRM'];

    if (Array.isArray(roleCode)) {
      if (roleCode.some(code => excludedRoles.includes(code))) {

        return; // Exit useEffect early
      }
    } else {
      if (excludedRoles.includes(roleCode)) {

        return; // Exit useEffect early
      }
    }

    const showAlert = message => {
      Alert.alert(
        'Condition Check Failed For Agency', // Title
        message, // Message
        [{ text: 'OK' }], // Button
      );
    };

    const checkRoleCodeAndAgencyId = () => {
      const roleCodesToCheck = Array.isArray(roleCode) ? roleCode : [roleCode];
      const agencyIdsToCheck = Array.isArray(AgencyId) ? AgencyId : [AgencyId];

      const agencyConfig = agencyTrackingConfigs.find(config =>
        agencyIdsToCheck.includes(config.agencyId),
      );

      if (!agencyConfig) {

        return false; // Early return if agencyId does not match
      }


      const roleStatusArray = JSON.parse(agencyConfig.agencyTrackingRoleStatus);

      const roleMatchFound = roleCodesToCheck.some(code => {
        const role = roleStatusArray.find(role => role.roleCode === code);
        if (role) {
          if (role.status === 'Y') {

            return true; // Status is 'Y', allow further execution
          } else {

            return false; // Early return if status is not 'Y'
          }
        }
        return false; // No role match found
      });

      if (!roleMatchFound) {

        return false; // Early return if no role match found
      }

      return true; // Allow further execution if all checks pass
    };

    const checkMandatoryConditions = () => {
      const { active, frequencyStartTime, frequencyEndTime, frequencyType } =
        TrackerAdminConfig;

      if (
        active === undefined ||
        frequencyStartTime === undefined ||
        frequencyEndTime === undefined ||
        frequencyType === undefined
      ) {

        // showAlert('TrackerAdminConfig is not fully initialized yet');
        return false;
      }

      // 1. Check if active is true
      if (!active) {

        // showAlert('Tracking is inactive.');
        return false; // Stop execution if active is false
      }


      // 2. Check if role matches any internal role
      if (!checkRoleCodeAndAgencyId()) {

        // showAlert(' RoleCode or AgencyId code mismatch.');
        return; // Stop execution if any mandatory condition fails
      }


      // 3. Check if frequencyStartTime and frequencyEndTime are present
      if (!frequencyStartTime || !frequencyEndTime) {

        // showAlert('Start or end time is missing.');
        return false; // Stop execution if start or end time is missing
      }


      // 4. Check if frequencyType is present
      if (!frequencyType) {

        // showAlert('Frequency type is missing.');
        return false; // Stop execution if frequencyType is missing
      }


      return true; // All mandatory conditions passed
    };

    const checkConditionsAndSetInterval = () => {
      // First, check all mandatory conditions
      if (!checkMandatoryConditions()) {

        return; // Stop execution if any mandatory condition fails
      }

      // If all mandatory conditions are met, continue with additional checks
      const {
        repeatEvery,
        selectedMonths,
        selectedYears,
        selectedWeeks,
        startDate,
        endDate,
        frequencyStartTime,
        frequencyEndTime,
      } = TrackerAdminConfig;

      const currentDate = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (repeatEvery === 'Monthly') {
        const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
        // .format(currentDate); // Get current month in short form
        const selectedMonthsArray = selectedMonths
          .split(', ')
          .map(month => month.trim());

        if (!selectedMonthsArray.includes(currentMonth)) {

          // showAlert('Current month is not in selected months.');
          return;
        }

      } else if (repeatEvery === 'Yearly') {
        const currentYear = currentDate.getFullYear();
        const selectedYearsArray = selectedYears
          .split(', ')
          .map(year => year.trim());

        if (!selectedYearsArray.includes(currentYear.toString())) {

          // showAlert('Current year is not in selected years.');
          return;
        }

      } else if (repeatEvery === 'Days') {
        if (currentDate < start || currentDate > end) {

          // showAlert('Current date is not within the specified date range.');
          return;
        }

      } else if (repeatEvery === 'Weekly') {
        const currentDay = new Date().toLocaleString('en-US', { weekday: 'short' });
        // .format(currentDate);

        const selectedWeeksArray = selectedWeeks
          .split(', ')
          .map(day => day.trim());


        if (!selectedWeeksArray.includes(currentDay)) {

          // showAlert('Current day is not in selected weeks.');
          return;
        }

      }

      // Convert start and end times to Date objects
      const [frequencyStartHour, frequencyStartMinute] = frequencyStartTime
        .split(' ')[0]
        .split(':')
        .map(Number);
      const frequencyStartPeriod = frequencyStartTime.split(' ')[1];
      const frequencyStart = new Date();
      frequencyStart.setHours(
        frequencyStartPeriod === 'PM'
          ? frequencyStartHour + 12
          : frequencyStartHour,
        frequencyStartMinute,
      );

      const [frequencyEndHour, frequencyEndMinute] = frequencyEndTime
        .split(' ')[0]
        .split(':')
        .map(Number);
      const frequencyEndPeriod = frequencyEndTime.split(' ')[1];
      const frequencyEnd = new Date();
      frequencyEnd.setHours(
        frequencyEndPeriod === 'PM' ? frequencyEndHour + 12 : frequencyEndHour,
        frequencyEndMinute,
      );

      const currentTime = new Date();
      if (currentTime < frequencyStart || currentTime > frequencyEnd) {

        // showAlert('Current time is not within the tracking time range.');
        return;
      }



      // If all conditions are met, set the interval for location tracking


      // Ensure API is called only once
      if (!apiCalledOnce) {

        getCurrentLocationonetime(); // Call API once
        apiCalledOnce = true; // Set flag to true to prevent further API calls
      }


      const intervalTime =
        TrackerAdminConfig.frequencyType === 'realtime' ? 15000 : 3600000; // 60,000ms for 1 min, 3,600,000ms for 1 hour

      if (window.currentInterval) clearInterval(window.currentInterval);

      window.currentInterval = setInterval(() => {
        getCurrentLocation();
      }, intervalTime);
    };

    checkConditionsAndSetInterval();

    return () => {
      if (window.currentInterval) clearInterval(window.currentInterval);
    };
  }, [TrackerAdminConfig, roles, roleCode]);


  const liveLocationontimeTracking = async curLoc => {
    if (!curLoc || !userProfile?.userId || !token) {
      console.warn('⚠️ Missing location or user info.');
      return;
    }

    try {
      // Reverse Geocode using Google Maps API
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${curLoc}&key=${GOOGLE_MAPS_APIKEY}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      const geocodeData = geocodeResponse.data;  // Use geocodeData as needed



      if (geocodeResponse.data.status !== 'OK') {
        console.warn('⚠️ Google Geocoding failed:', geocodeResponse.data.error_message || 'Unknown error');
      }

      const areaName = geocodeResponse.data.results?.[0]?.formatted_address || null;

      // Prepare Payload
      const payload = {
        userId: userProfile?.userId,
        activity: 'Login',
        activityId: null,
        coordinates: curLoc,
        areaName,
        lan: null,
        customerAddress: null,
        addressType: null,
        addressCoordinates: null,
        differenceInKm: null,
        exception: null,
      };

      // Send to backend
      const response = await apiClient.post(`addUserTracker`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });


      const responseData = response.data;  // Use responseData as needed


    } catch (err) {
      console.error('❌ liveLocationontimeTracking Error:', err.message);
    }
  };



  const liveLocationTracking = async curLoc => {
    try {
      if (!curLoc || !(userProfile?.userId || user?.userId)) {
        console.warn('⚠️ Missing location or user ID');
        return;
      }

      // Reverse Geocode
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${curLoc}&key=${GOOGLE_MAPS_APIKEY}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );



      let areaName = null;
      if (geocodeResponse.data.status === 'OK' && geocodeResponse.data.results.length > 0) {
        areaName = geocodeResponse.data.results[0].formatted_address;

      } else {
        console.warn('⚠️ Geocoding failed:', geocodeResponse.data.error_message || 'No results found');
      }

      // Build payload
      const payload = {
        userId: userProfile?.userId || user?.userId,
        activity: null,
        activityId: null,
        coordinates: curLoc,
        areaName: areaName,
        lan: null,
        customerAddress: null,
        addressType: null,
        addressCoordinates: null,
        differenceInKm: null,
        exception: null,
      };

      // API call to add user tracker
      const response = await apiClient.post(`addUserTracker`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });


    } catch (err) {
      console.error('❌ liveLocationTracking error:', err.message);
    }
  };

  useEffect(() => {
    liveTrackerAdminConfig();
  }, []);

  useEffect(() => {
    // liveTrackerAdminConfig();
    const intervalId = setInterval(() => {
      liveTrackerAdminConfig();
    }, 20000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);



  useEffect(() => {
    getLenderListData();
    getMobileGraphData();
    getVisitHistory();
    getallCount();
    getDepositionSummeryData();
    liveTrackerAdminConfigForfirstTime();
  }, [])

  const liveTrackerAdminConfig = async () => {
    try {
      const response = await apiClient.get(`getTrackingConfig`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'X-From-Mobile': 'true',
        },
      });

      const responseData = response.data.response;

      if (Array.isArray(responseData) && responseData.length > 0) {
        const firstItem = responseData[0];
        setTrackerAdminConfig(firstItem);
        setRoles(firstItem.roles);
        dispatch(saveadminPanelrole(firstItem.roles));
        setAgencyTrackingConfigs(firstItem.agencyTrackingConfigs);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {

          // dispatch(logoutUser()); 
          // navigation.dispatch(StackActions.replace('Login'));
        } else {

        }
      } else {

      }
    }
  };

  const liveTrackerAdminConfigForfirstTime = async () => {
    try {
      const response = await apiClient.get(`getTrackingConfig`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'X-From-Mobile': 'true',
        },
      });


      const responseData = response.data.response;

      if (Array.isArray(responseData) && responseData.length > 0) {
        const firstItem = responseData[0];
        setAgencyTrackingConfigsForfirstTime(firstItem.agencyTrackingConfigs);
      }
    } catch (error) {

    }
  };








  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        await Promise.all([
          getUnallocatedApprovedData(),
          getUnAllocatedPendingData(),
          paymentDepositionView()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (active) fetchData();

    return () => { active = false };
  }, [userProfile, FiledORCallvalues]);

  useEffect(() => {
    const fetchData = async () => {

      try {
        dashboardLenderData();
        getLenderListData();
        getFollowUpDueForToday();
        getPTPDueForToday();
        getPendingScheduleVisitByUserId();
        getUnAllocatedPendingData();
        getVisitDueForToday();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {

      }
    };

    fetchData();
  }, [drpvalues, selectedLenders, selectAll]);

  const getLenderListData = async () => {
    try {
      const response = await apiClient.get(`getLenderList`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.status === 200 && response?.data?.data) {
        setlenderLists(response.data.data);
        // successSound.play(); // Uncomment if needed
      }
    } catch (error) {
      console.error('Error in getLenderListData:', error);
      // Optionally handle loader or fallback UI here
    }
  };

  const getMobileGraphData = async () => {
    const userId = userProfile?.userId;
    if (!userId) return;

    try {
      const response = await apiClient.get(`getMobileGraphData/${userId}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });



      if (response?.data) {
        setTodayTaskList(response.data);
        // successSound.play(); // Uncomment if needed
      }
    } catch (error) {
      console.error('Error in getMobileGraphData:', error);
    }
  };

  const getVisitHistory = async () => {
    try {
      const response = await apiClient.get(
        `getVisitsByType/0/${userProfile?.userId}?reportType=daily`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        const dailyData = response.data.data;
        setDaily(dailyData);
        setCurName(dailyData[0].name);

        const geoCordinates = dailyData[0]?.geoCordinates;
        if (geoCordinates) {
          const [lat, long] = geoCordinates
            .split(',')
            .map(coord => parseFloat(coord));
          setLat(lat);
          setLong(long);
        }
      }
    } catch (error) {
      console.error('Error in getVisitHistory:', error);
    }
  };
  const getallCount = async () => {
    if (!userProfile?.userId) return;

    setLoadingcount(true)
    const { userId, role = [], activityType } = userProfile;
    const roleCodes = role.map(r => r.roleCode);
    const isFieldActivity = FiledORCallvalues === true || activityType === 'Field';

    // Determine URL based on role and activity type
    const urlMap = {
      MIS: isFieldActivity ? 'getCountCasesMISField' : 'getCountCasesMIS',
      CA: 'getCountCA',
      DRA: 'getCountDRA',
      DEFAULT: isFieldActivity ? 'getCountField' : 'getCount',
    };

    const matchedRole = roleCodes.find(code => urlMap[code]);
    const endpoint = urlMap[matchedRole] || urlMap.DEFAULT;

    try {
      const response = await apiClient.get(`${endpoint}/${userId}/${roleCodes}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });


      setallcount(response.data.data);
    } catch (error) {
      console.error('Failed to fetch case count:', error);
    } finally {
      setLoadingcount(false)
    }

  };

  const dashboardLenderData = async () => {
    if (!userProfile?.userId) return;

    const payload = {
      lenderId:
        (selectAll && selectedLenders?.length > 0) || (!selectAll && selectedLenders?.length === 0)
          ? []
          : selectedLenders,
      period: drpvalues?.label,
      userId: userProfile.userId,
    };

    try {
      const response = await apiClient.post(
        `getMobileDashboardCount`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.status === 200 && response?.data?.data) {
        setdashboardCountData(response.data.data);
        // successSound.play(); // Uncomment if needed
      }
    } catch (error) {
      console.error('getMobileDashboardCount Error:', error);
      // Optionally handle fallback UI or loader state here
    }
  };

  const getFollowUpDueForToday = async () => {
    try {
      if (!userProfile?.userId) return;

      const roleCode = userProfile?.role?.map(a => a?.roleCode);
      // 

      const payload = {
        lenderId:
          (selectAll && selectedLenders.length > 0) ||
            (!selectAll && selectedLenders.length === 0)
            ? []
            : selectedLenders,
        period: drpvalues?.label,
        userId: userProfile?.userId,
      };

      const response = await apiClient.post(
        `followupRedirect`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const followupData = response?.data?.data;
      // // successSound.play(); // Play success sound
      if (followupData) {
        setfollowupData(followupData);
      }
    } catch (error) {
      console.error('getfollowupRedirectErr', error);
    }
  };

  const getPTPDueForToday = async () => {
    try {
      if (!userProfile?.userId) return;

      const roleCode = userProfile?.role?.map(a => a?.roleCode);
      // 

      const payload = {
        lenderId:
          (selectAll && selectedLenders.length > 0) ||
            (!selectAll && selectedLenders.length === 0)
            ? []
            : selectedLenders,
        period: drpvalues?.label,
        userId: userProfile?.userId,
      };

      const response = await apiClient.post(
        `ptpCountRedirect`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const ptpData = response?.data?.data;
      // // successSound.play(); // Play success sound
      if (ptpData) {
        setptpData(ptpData);
      }
    } catch (error) {
      console.error('getptpCountRedirectErr', error);
    }
  };

  const getPendingScheduleVisitByUserId = async () => {
    try {
      if (!userProfile?.userId) return;

      const roleCode = userProfile?.role?.map(a => a?.roleCode);


      const payload = {
        lenderId: selectAll ? [] : selectedLenders,
        period: drpvalues?.label,
        userId: userProfile?.userId,
      };

      const response = await apiClient.post(
        `getPendingScheduleVisitRedirect`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const visitData = response?.data?.data;

      // // successSound.play(); // Play success sound
      if (visitData) {
        // setVisitDueForTodayData(visitData);
      }
    } catch (error) {
      console.error('getfollowupRedirectErr', error);
    }
  };

  const getDepositionSummeryData = async () => {
    try {


      const url = `getDepositionSummeryByUserId/${userProfile?.userId}`;
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const response = await apiClient.get(url, { headers });

      if (response?.status === 200 && response.data?.response) {
        setSummaryData(response.data.response);
        // successSound.play(); // Optional
      } else {
        console.warn('Unexpected response:', response);
      }
    } catch (error) {
      console.error('getDepositionSummeryData error:', error);
    } finally {

    }
  };

  const getUnAllocatedPendingData = async () => {
    try {
      if (!userProfile?.userId) return;

      const roleCode = userProfile.role?.map(a => a.roleCode).join(',');

      const fetchData = async (url, params) => {
        // Log URL for debugging
        const response = await apiClient.get(`${url}/${params}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        });

        const allData = response.data.response;
        const allLan = allData.map(val => val.allLan);

        const bulkUploadResponse = await apiClient.post(
          `getBulkUploadSuccessByListOfLan/${userProfile?.userId
          }`,
          allLan,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
          },
        );

        return bulkUploadResponse?.data?.data;
      };

      let apiResponseData;

      if (roleCode.includes('DRA')) {
        const url = 'getDRACaseAllocationByUseridUnAllocatedPending';
        apiResponseData = await fetchData(
          url,
          `${userProfile?.userId}/${roleCode}/0/0`,
        );
      } else if (roleCode.includes('CA')) {
        const url =
          FiledORCallvalues === true || userProfile?.activityType === 'Field'
            ? 'getDRACaseAllocationByUseridUnAllocatedPending'
            : 'getCACaseAllocationByUseridUnAllocatedPending';
        apiResponseData = await fetchData(
          url,
          `${userProfile?.userId}/${roleCode}/0/0`,
        );
      } else {
        const url =
          userProfile?.activityType === 'Field'
            ? 'getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationPendingField'
            : 'getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationPending';
        apiResponseData = await fetchData(url, `${userProfile?.userId}/0/0`);
      }


      setApiResponseData(apiResponseData);
    } catch (error) {
      console.error('Error in getUnAllocatedPendingData:', error);
      // Handle errors as needed
    }
  };

  const getVisitDueForToday = async () => {
    try {
      if (!userProfile?.userId) return;

      const roleCode = userProfile?.role?.map(a => a?.roleCode);
      // 

      const payload = {
        lenderId:
          (selectAll && selectedLenders.length > 0) ||
            (!selectAll && selectedLenders.length === 0)
            ? []
            : selectedLenders,
        period: drpvalues?.label,
        userId: userProfile?.userId,
      };
      // 

      const response = await apiClient.post(
        `getPendingScheduleVisitRedirect`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const visitData = response?.data?.data;
      // // successSound.play(); // Play success sound
      if (visitData) {
        setVisitForTodayData(visitData);
      }
    } catch (error) {
      console.error('getptpCountRedirectErr', error);
    }
  };
  const getUnallocatedApprovedData = () => {
    try {
      if (userProfile?.userId) {
        const roleCode = userProfile?.role?.map(a => a?.roleCode);
        const isMis = roleCode?.includes('MIS');

        if (roleCode?.includes('DRA')) {
          apiClient
            .get(
              `getDRACaseAllocationByUseridUnAllocatedApproved/${userProfile?.userId}/${roleCode}/0/0`,
              {
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
              },
            )
            .then(function (response) {
              const allData = response.data.response;
              const allLan = [];
              if (allData.length > 0) {
                allData.map(val => {
                  allLan.push(val.allLan);
                });
                apiClient

                  .post(
                    `getBulkUploadSuccessByListOfLan/${userProfile?.userId || userProfile.id
                    }`,
                    allLan,
                    {
                      headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                      },
                    },
                  )
                  .then(function (response) {

                    setUnAllocatedApprovedData(response.data.data);
                    // 
                  })
                  .catch(function (error) {

                  });
              }
            })
            .catch(function (error) {

            });
        } else if (roleCode?.includes('CA')) {
          if (FiledORCallvalues === true || userProfile?.activityType === 'Field') {
            apiClient
              .get(
                `getDRACaseAllocationByUseridUnAllocatedApproved/${userProfile?.userId}/${roleCode}/0/0`,
                {
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                  },
                },
              )
              .then(function (response) {
                const allData = response.data.response;
                const allLan = [];
                if (allData.length > 0) {
                  allData.map(val => {
                    allLan.push(val.allLan);
                  });
                  apiClient
                    .post(
                      `getBulkUploadSuccessByListOfLan/${userProfile?.userId
                      }`,
                      allLan,
                      {
                        headers: {
                          Accept: 'application/json',
                          'Content-Type': 'application/json',
                          Authorization: 'Bearer ' + token,
                        },
                      },
                    )
                    .then(function (response) {

                      setUnAllocatedApprovedData(response.data.data);

                    })
                    .catch(function (error) {

                    });
                }
              })
              .catch(function (error) {

              });
          } else {
            apiClient
              .get(
                `getCACaseAllocationByUseridUnAllocatedApproved/${userProfile?.userId}/${roleCode}/0/0`,
                {
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + userProfile.token,
                  },
                },
              )
              .then(function (response) {
                const allData = response.data.response;
                const allLan = [];
                if (allData.length > 0) {
                  allData.map(val => {
                    allLan.push(val.allLan);
                  });
                  apiClient

                    .post(
                      `getBulkUploadSuccessByListOfLan/${userProfile?.userId
                      }`,
                      allLan,
                      {
                        headers: {
                          Accept: 'application/json',
                          'Content-Type': 'application/json',
                          Authorization: 'Bearer ' + token,
                        },
                      },
                    )
                    .then(function (response) {

                      setUnAllocatedApprovedData(response.data.data);

                    })
                    .catch(function (error) {

                    });
                }
              })
              .catch(function (error) {

              });
          }
        } else {
          const url =
            FiledORCallvalues === true || userProfile?.activityType === 'Field'
              ? `getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationApprovedField`
              : `getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationApproved`;

          apiClient
            .get(`${url}/${userProfile?.userId}/0/0`, {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              },
            })
            .then(function (response) {
              const allData = response.data.response;
              const allLan = [];
              if (allData.length > 0) {
                allData.map(val => {
                  allLan.push(val.allLan);
                });
                apiClient

                  .post(
                    `getBulkUploadSuccessByListOfLan/${userProfile?.userId
                    }`,
                    allLan,
                    {
                      headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                      },
                    },
                  )
                  .then(function (response) {

                    setUnAllocatedApprovedData(response.data.data);
                    // 
                  })
                  .catch(function (error) {

                  });
              }
            })
            .catch(function (error) {

            });
        }
      }
    } catch (error) {

    }
  };

  const paymentDepositionView = async () => {
    if (!userProfile?.userId) return;

    try {
      const response = await apiClient.get(
        `getDepositionHistory/${userProfile?.userId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );

      const validPaymentModes = ['Cash', 'Cheque', 'Demand Draft'];
      const data = response?.data?.response ?? []; // 🛡 SAFE fallback

      if (Array.isArray(data)) {
        const pendingPayments = data.filter(
          payment =>
            payment.status === 'Pending' &&
            validPaymentModes.includes(payment.paymentCollectionMode)
        );

        const approvedPayments = data.filter(
          payment =>
            payment.status === 'Approved' &&
            validPaymentModes.includes(payment.paymentCollectionMode)
        );

        setPaymentDepostion(pendingPayments);
        setApprovedPaymentDepositionAmount(approvedPayments);
      } else {
        // 🛡 Non-array response fallback
        setPaymentDepostion([]);
        setApprovedPaymentDepositionAmount([]);
      }
    } catch (error) {
      console.log("paymentDepositionView error:", error);
      // 🛡 API failed fallback
      setPaymentDepostion([]);
      setApprovedPaymentDepositionAmount([]);
    }
  };

  const hasUser = userProfile?.firstName && userProfile?.lastName;

  const allCasesCount =
    roleCode?.includes("FA") || roleCode?.includes("CA")
      ? allcount?.countCACaseAllocation ?? "0"
      : allcount?.allCount ?? "0";

  const toggleTodayTasksModal = () => {
    settodayTaskModal(!todayTaskModal);
  };


  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar translucent backgroundColor="#001D56" barStyle="light-content" />
      <Header title="Dashboard" onOpenDrawer={openDrawer} />

      <View style={styles.container}>
        <Pressable
          onPress={toggleModal}
          disabled={!hasUser}
          style={styles.selectorPressable}
        >
          <Text style={styles.dropdownText}>
            {selectedLenders.length > 0 ? dropdownValue : 'Select Lender'}
          </Text>
          <Image source={require('../../../asset/icon/arrow_down.png')} style={styles.icon} />
        </Pressable>

        <LenderSelectorModal
          visible={modalVisible}
          onClose={toggleModal}
          lenderLists={lenderLists}
          selectedLenders={selectedLenders}
          onToggleLender={onToggleLender}
          onToggleSelectAll={onToggleSelectAll}
          selectAll={selectAll}
          onOK={handleOK}
          pressedButton={pressedButton}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.greetingWrap}>
            <Text style={styles.greetingText}>
              {hasUser ? `Welcome ${userProfile.firstName} ${userProfile.lastName}!` : 'Loading...'}
            </Text>
          </View>

          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>My Dashboard</Text>
          </View>

          <View style={styles.cardsRow}>
            <View style={styles.card}>
              <Pressable disabled={!hasUser} onPress={() => navigation.navigate('Incentive')} style={styles.cardButton}>
                <View style={styles.iconRow}>
                  <View style={styles.iconCircle}>
                    <Image source={require('../../../asset/icon/rupee.png')} style={styles.iconSmall} />
                  </View>
                  <Text style={styles.incentiveText}>----</Text>
                </View>
                <Text style={styles.cardLabel}>My Incentive</Text>
              </Pressable>
            </View>

            <Pressable disabled={!hasUser} onPress={toggleTodayTasksModal} style={styles.card}>
              <View style={styles.visitButtonContainer}>
                <Pressable
                  disabled={!hasUser}
                  // onPress={() => navigation.navigate('MyVisits', {
                  //   daily: [], visitForTodayData, curlat: null, curLong: null, lat: null, long: null, curName: ''
                  // })}
                  onPress={() => {
                    if (!curlat || !curLong || isNaN(curlat) || isNaN(curLong)) {
                      alert("Location not updated yet. Please wait.");
                      return;
                    }

                    navigation.navigate('MyVisits', {
                      daily,
                      visitForTodayData,
                      curlat,
                      curLong,
                      lat,
                      long,
                      curName,
                    });
                  }}

                  style={styles.viewVisitsBtn}
                >
                  <Text style={styles.viewVisitsText}>View Visits</Text>
                </Pressable>
              </View>

              <View style={styles.taskCircleContainer}>
                <View style={styles.taskCircle}>
                  <Text style={styles.taskPercentageText}>
                    {TodayTaskList?.percentage != null ? `${Math.round(TodayTaskList.percentage)}%` : 'Loading!'}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>

          <TodayTasksModal visible={todayTaskModal} onClose={toggleTodayTasksModal} tasks={TodayTaskList} />

          {loadingcount && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}

          <View style={styles.rowContainer}>
            <View style={styles.leftBox}>
              <Text style={styles.caseText}>{`All Cases: ${allCasesCount}`}</Text>
            </View>

            <Dropdown
              style={[styles.dropdown, isFocus && styles.dropdownFocus]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              itemTextStyle={styles.itemTextStyle}
              data={[
                { label: 'All', value: '1' },
                { label: 'Daily', value: '2' },
                { label: 'Current Week', value: '3' },
                { label: 'Current Month', value: '4' },
                { label: 'Annually', value: '5' },
              ]}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select item"
              value={drpvalues}
              disable={!hasUser}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setdrpValues(item);
                setIsFocus(false);
              }}
            />
          </View>

          {userProfile?.activityType === 'Both' && (
            <View style={styles.fieldToggleWrap}>
              <Pressable onPress={() => {/* toggling kept in parent originally */ }} disabled={!hasUser}>
                <View style={styles.fieldToggle}>
                  <Text style={styles.fieldToggleText}>Field Visit</Text>
                </View>
              </Pressable>
            </View>
          )}

          <View style={[styles.containerCardf, { marginTop: 12 }]}>
            <View style={styles.rowCardf}>
              <DashboardCard icon={require('../../../asset/icon/rupee.png')} value={dashboardCountData?.collectAmount} label="Amount Collected" disabled={!hasUser} />
              <DashboardCard icon={require('../../../asset/TrueBoardIcon/visit-dues-today.png')} value={visitForTodayData.length} label="Visits due for today" onPress={() => navigation.navigate('FollowUpDueForToday', { screenName: 'Visits due for today', data: visitForTodayData })} disabled={!hasUser} />
            </View>

            <View style={styles.rowCardf}>
              <DashboardCard icon={require('../../../asset/TrueBoardIcon/visit-dues-today.png')} value={dashboardCountData?.ptpDueForToday} label="PTPs due for today" onPress={() => navigation.navigate('FollowUpDueForToday', { screenName: 'PTPs due for today', data: ptpData })} disabled={!hasUser} />
              <DashboardCard icon={require('../../../asset/TrueBoardIcon/visit-dues-today.png')} value={followupData.length} label="Follow-Up Due For Today" onPress={() => navigation.navigate('FollowUpDueForToday', { screenName: 'Follow-Up Due For Today', data: followupData })} disabled={!hasUser} />
            </View>

            <View style={styles.rowCardf}>
              <DashboardCard value={dashboardCountData?.ptpCount} label="PTP" />
              <DashboardCard icon={require('../../../asset/icon/rupee.png')} value={!pressedButton ? summaryData?.totalDepositionSummery?.pendingAmount : undefined} label="Pending Deposition" valueColor="#FF0000" />
            </View>

            <View style={styles.rowCardf}>
              <DashboardCard value={!pressedButton ? allcount?.unAllocated_p_Count : 0} label="Unallocated" subLabel="(Pending)" />
              <DashboardCard value={!pressedButton ? allcount?.unAllocated_a_Count : 0} label="Unallocated" subLabel="(Approved)" />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.light.darkBlue,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.light.darkBlue,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : verticalScale(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  drawerIcon: { width: scale(22), height: scale(22), tintColor: '#FFFFFF' },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#FFFFFF', marginLeft: scale(8) },

  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  selectorPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.75,
    justifyContent: 'space-between',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    marginVertical: 12,
  },
  dropdownText: { color: 'black', flex: 1, fontSize: 15 },
  icon: { height: 20, width: 20 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },

  modalBox: {
    position: 'absolute',
    top: height * 0.15,
    alignSelf: 'center',
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 15,
  },

  title: { fontSize: width * 0.045, fontWeight: 'bold', color: 'black', textAlign: 'center', marginBottom: height * 0.02 },

  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowText: { color: 'black', marginLeft: 6, fontSize: 15 },
  separator: { height: 1, width: '100%', backgroundColor: '#ccc', marginVertical: 10 },
  lenderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  itemText: { marginLeft: 6, fontSize: 15, color: 'black', width: width * 0.6 },

  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelButton: { backgroundColor: '#444', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8 },
  cancelText: { color: 'white', fontSize: 16 },
  okButton: { width: width * 0.27, height: height * 0.045, justifyContent: 'center', alignItems: 'center', borderWidth: 0.4, borderColor: 'black', borderRadius: 8, backgroundColor: '#001D56' },
  okText: { color: 'white', fontSize: 16 },

  greetingWrap: { paddingHorizontal: scale(12), paddingTop: 6 },
  greetingText: { fontSize: width * 0.037, color: '#888', fontWeight: '800' },

  sectionTitleWrap: { marginTop: 8, alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#000000' },

  cardsRow: { flexDirection: 'row', justifyContent: 'space-evenly', gap: 10, marginBottom: 8 },
  card: { width: width * 0.4, height: height * 0.19, borderRadius: 12, backgroundColor: '#001D56', alignItems: 'center', justifyContent: 'center' },
  cardButton: { backgroundColor: '#FFFFFF', borderRadius: 8, width: width * 0.3, height: height * 0.06, justifyContent: 'center', alignItems: 'center' },

  iconRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 22, height: 22, borderRadius: 50, borderWidth: 1, borderColor: 'black', backgroundColor: '#001D56', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  iconSmall: { width: 13, height: 13 },
  incentiveText: { color: '#000', fontSize: width * 0.035, fontWeight: '500' },
  cardLabel: { fontSize: width * 0.035, fontWeight: '600', color: '#000', marginTop: 4 },

  visitButtonContainer: { marginTop: height * 0.018, alignItems: 'center' },
  viewVisitsBtn: { backgroundColor: '#FFFFFF', borderRadius: scale(6), width: width * 0.22, height: verticalScale(28), justifyContent: 'center', alignItems: 'center' },
  viewVisitsText: { fontSize: width * 0.032, fontWeight: '700', color: '#001D56' },

  taskCircleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: height * 0.035 },
  taskCircle: { height: scale(48), width: scale(48), borderRadius: scale(48), borderWidth: scale(3), borderColor: '#FB9129', justifyContent: 'center', alignItems: 'center' },
  taskPercentageText: { fontSize: width * 0.032, fontWeight: '700', color: '#FFF' },

  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999 },

  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: scale(12), marginTop: height * 0.015 },
  leftBox: { width: width * 0.42, justifyContent: 'center' },
  caseText: { fontSize: width * 0.04, color: '#888', fontWeight: '700' },

  dropdown: { width: width * 0.4, height: height * 0.055, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
  dropdownFocus: { borderColor: '#007AFF' },
  placeholderStyle: { fontSize: width * 0.038, color: '#888' },
  selectedTextStyle: { fontSize: width * 0.038, color: '#000' },
  inputSearchStyle: { height: 40, fontSize: width * 0.038 },
  itemTextStyle: { fontSize: width * 0.038, color: '#888' },
  iconStyle: { width: 20, height: 20 },

  fieldToggleWrap: { alignSelf: 'center', width: width * 0.9, paddingHorizontal: 20 },
  fieldToggle: { width: width * 0.2, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, padding: 3, borderRadius: 5, marginVertical: 10, borderColor: 'gray', backgroundColor: '#ffffff' },
  fieldToggleText: { fontSize: 12, color: 'gray' },

  containerCardf: { backgroundColor: '#DCDCDC', borderRadius: 8, borderWidth: 1, margin: 12 },
  rowCardf: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(8) },

  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { fontSize: 14, color: '#000', fontWeight: '500', flex: 1 },
  rowValue: { fontSize: 14, color: '#000', fontWeight: '700', marginLeft: 10, textAlign: 'right', minWidth: 40 },
})