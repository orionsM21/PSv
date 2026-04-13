import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  SafeAreaView,
  StatusBar,
  FlatList,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  View,
  Pressable,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { DrawerContext } from '../../../Drawer/DrawerContext';
import {
  scale,
  verticalScale,
  moderateScale,
  ms,
} from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
// import CheckBox from '@react-native-community/checkbox';

import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import LinearGradient from 'react-native-linear-gradient';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import apiClient from '../../../common/hooks/apiClient';
import { theme } from '../utility/Theme';
import DashboardCard from '../component/DashboardCard';
import CoolectionHeader from '../component/CoolectionHeader';
import { saveAdminRoles } from '../../../redux/actions';
import {
  flushPendingCollectionTrackers,
  saveCollectionTrackingContext,
  syncCollectionTrackingService,
  trackCollectionCoordinates,
} from '../service/collectionTrackingService';

const { height, width } = Dimensions.get('window');
const PERIOD_OPTIONS = [
  { label: 'All', value: '1' },
  { label: 'Daily', value: '2' },
  { label: 'Current Week', value: '3' },
  { label: 'Current Month', value: '4' },
  { label: 'Annually', value: '5' },
];

const formatDashboardValue = value => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
  }

  const parsedValue = Number(value);
  if (!Number.isNaN(parsedValue)) {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: Number.isInteger(parsedValue) ? 0 : 2,
    }).format(parsedValue);
  }

  return value;
};


const Row = ({ label, value }) => (
  <View style={styles.rowItem}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value ?? 0}</Text>
  </View>
);
const MCCheck = ({ value, onChange }) => (
  <Pressable onPress={() => onChange(!value)} style={styles.checkWrap}>
    <MaterialCommunityIcons
      name={value ? 'checkbox-marked' : 'checkbox-blank-outline'}
      size={24}
      color={value ? '#001D56' : '#555'}
    />
  </Pressable>
);

/* --------------------------
   LenderSelectorModal Component
   --------------------------*/
const LenderSelectorModal = React.memo(
  ({
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
    const renderLender = useCallback(
      ({ item }) => (
        <Pressable
          style={styles.lenderRow}
          onPress={() => onToggleLender(item.lenderId)}>
          <MCCheck
            value={selectedLenders.includes(item.lenderId)}
            onChange={() => onToggleLender(item.lenderId)}
          />

          <Text style={styles.itemText}>{item.lenderName}</Text>
        </Pressable>
      ),
      [selectedLenders, onToggleLender],
    );

    return (
      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalBox}>
          <Text style={styles.title}>Select Lender</Text>

          <Pressable style={styles.selectAllRow} onPress={onToggleSelectAll}>
            {/* <CheckBox value={selectAll} onValueChange={onToggleSelectAll} /> */}

            <MCCheck value={selectAll} onChange={onToggleSelectAll} />
            <Text style={styles.rowText}>Select All</Text>
          </Pressable>

          <View style={styles.separator} />

          <View style={{ maxHeight: height * 0.45 }}>
            <FlatList
              data={lenderLists}
              keyExtractor={i => String(i.lenderId)}
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
  },
);

/* --------------------------
   TodayTasksModal Component
   --------------------------*/
const TodayTasksModal = React.memo(({ visible, onClose, tasks }) => (
  <Modal
    animationType="fade"
    transparent
    visible={visible}
    onRequestClose={onClose}>
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
  const { openDrawer } = useContext(DrawerContext);
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const userProfile = useSelector(state => state.auth.userProfile);
  // console.log(token, 'tokentoken')
  const roleCode = useSelector(state => state.auth.roleCode);
  const agencyIds = useMemo(
    () => userProfile?.agency?.map(a => a.agencyId) ?? [],
    [userProfile],
  );
  const GOOGLE_MAPS_APIKEY = 'AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE';
  useEffect(() => {
    setAgencyId(agencyIds);
  }, [agencyIds]);

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
  const [ApprovedPaymentDepositionAmount, setApprovedPaymentDepositionAmount] =
    useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [ApproveUnallocared, setApproveUnallocared] = useState([]);
  const [FilteredDeposition, setFilteredDeposition] = useState([]);
  const [depositionAmountss, setDepositionAmounts] = useState([]);
  const [
    finalApprovedPaymentDepositionAmount,
    setfinalApprovedPaymentDepositionAmount,
  ] = useState([]);
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
  const [
    AgencyTrackingConfigsForfirstTime,
    setAgencyTrackingConfigsForfirstTime,
  ] = useState([]);
  const [agencyTrackingConfigs, setAgencyTrackingConfigs] = useState([]);
  // console.log(roles, 'rolesroles')
  const [drpvalues, setdrpValues] = useState({
    label: 'Current Month',
    value: '4',
  });

  const [isFocus, setIsFocus] = useState(false);
  const trackingContext = useMemo(
    () => ({
      token,
      userId: userProfile?.userId,
      roleCode,
      agencyIds: AgencyId,
      trackerAdminConfig: TrackerAdminConfig,
      roles,
      agencyTrackingConfigs,
    }),
    [
      token,
      userProfile?.userId,
      roleCode,
      AgencyId,
      TrackerAdminConfig,
      roles,
      agencyTrackingConfigs,
    ],
  );

  const toggleModal = () => {
    setModalVisible(prev => {
      const newState = !prev;

      if (newState === false) {
        // Modal closed → reset all
        setSelectedLenders([]);
        setSelectAll(false);
        setDropdownValue('');
        setOkPressed(false);
      }

      return newState;
    });
  };

  const onToggleLender = useCallback(lenderId => {
    setSelectedLenders(prev => {
      const idx = prev.indexOf(lenderId);
      if (idx !== -1) {
        return prev.filter(i => i !== lenderId);
      }
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
      selectedLenders.includes(lender.lenderId),
    );

    const selectedLenderNames = selectedLendersData.map(
      lender => lender.lenderName,
    );
    setDropdownValue(selectedLenderNames.join(', '));

    const selectedLenderIds = selectedLendersData.map(
      lender => lender.lenderId,
    );

    if (selectedLenderNames.length === 0) {
      setOkPressed(false);
    } else {
      const filtered = (apiResponseData ?? []).filter(item =>
        selectedLenderNames.includes(item.lenderName),
      );

      const approveFilteredData = (unAllocatedApprovedData ?? []).filter(item =>
        selectedLenderNames.includes(item.lenderName),
      );

      const paymentDeposition = (PaymentDepostion ?? []).filter(item =>
        selectedLenderNames.includes(item.lenderName),
      );

      const Approvepayemntdeposition = (
        ApprovedPaymentDepositionAmount ?? []
      ).filter(item => selectedLenderNames.includes(item.lenderName));

      const depositionAmounts = paymentDeposition.map(item => item.amount);
      const approveDepositionAmounts = Approvepayemntdeposition.map(
        item => item.amount,
      );

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
      async position => {
        const { latitude, longitude } = position.coords;
        const locationData = `${latitude},${longitude}`;
        await trackCollectionCoordinates({
          context: trackingContext,
          coordinates: locationData,
          activity: 'Login',
        });

        setCurLat(latitude);
        setCurLong(longitude);
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
        roleCodesToCheck.includes(role.roleName),
      );
      console.log(
        roleCodesToCheck,
        roleCode,
        roles,
        roleMatch,
        'roleMatchroleMatch',
      );
      if (roleMatch) {
        // Role matches, call the API instantly
        getCurrentLocationonetime();
        setHasCalledApi(true); // Ensure the API is marked as called
      }
    }
  }, [roles, roleCode, hasCalledApi]);

  useEffect(() => {
    if (hasCalledApi || !AgencyTrackingConfigsForfirstTime.length) {
      return;
    }

    const roleCodesToCheck = Array.isArray(roleCode) ? roleCode : [roleCode];
    const agencyIdsToCheck = Array.isArray(AgencyId) ? AgencyId : [AgencyId];

    const matchingAgencyConfig = AgencyTrackingConfigsForfirstTime.find(
      config => agencyIdsToCheck.includes(config.agencyId),
    );

    if (!matchingAgencyConfig) {
      return;
    }

    const roleStatusArray = JSON.parse(
      matchingAgencyConfig.agencyTrackingRoleStatus,
    );

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
      async position => {
        let locationData = `${position.coords.latitude},${position.coords.longitude}`;
        await trackCollectionCoordinates({
          context: trackingContext,
          coordinates: locationData,
        });
        setCurLat(position.coords.latitude);
        setCurLong(position.coords.longitude);
      },
      error => {
        console.error('Error getting location:', error.message);
        // Retry fetching location after a delay
        setTimeout(getCurrentLocation, 1000); // Retry after 1 second (adjust as needed)
      },
    );
  };

  useEffect(() => {
    if (!trackingContext?.token || !trackingContext?.userId) {
      return;
    }
    saveCollectionTrackingContext(trackingContext);
    syncCollectionTrackingService(trackingContext);
  }, [trackingContext]);

  useEffect(() => {
    flushPendingCollectionTrackers();
  }, []);

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
        const currentMonth = new Date().toLocaleString('en-US', {
          month: 'short',
        });
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
        const currentDay = new Date().toLocaleString('en-US', {
          weekday: 'short',
        });
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
      if (window.currentInterval) {
        clearInterval(window.currentInterval);
      }

      window.currentInterval = setInterval(() => {
        getCurrentLocation();
      }, intervalTime);

      showAlert;
    };

    checkConditionsAndSetInterval();

    return () => {
      if (window.currentInterval) {
        clearInterval(window.currentInterval);
      }
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

    let apiCalledOnce = false;

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
        const currentMonth = new Date().toLocaleString('en-US', {
          month: 'short',
        });
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
        const currentDay = new Date().toLocaleString('en-US', {
          weekday: 'short',
        });
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

      if (window.currentInterval) {
        clearInterval(window.currentInterval);
      }

      window.currentInterval = setInterval(() => {
        getCurrentLocation();
      }, intervalTime);
    };

    checkConditionsAndSetInterval();

    return () => {
      if (window.currentInterval) {
        clearInterval(window.currentInterval);
      }
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
        },
      );

      const geocodeData = geocodeResponse.data; // Use geocodeData as needed

      if (geocodeResponse.data.status !== 'OK') {
        console.warn(
          '⚠️ Google Geocoding failed:',
          geocodeResponse.data.error_message || 'Unknown error',
        );
      }

      const areaName =
        geocodeResponse.data.results?.[0]?.formatted_address || null;

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
      const response = await apiClient.post('addUserTracker', payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.data; // Use responseData as needed
    } catch (err) {
      console.error('❌ liveLocationontimeTracking Error:', err.message);
    }
  };

  const liveLocationTracking = async curLoc => {
    try {
      if (!curLoc || !userProfile?.userId) {
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
        },
      );

      let areaName = null;
      if (
        geocodeResponse.data.status === 'OK' &&
        geocodeResponse.data.results.length > 0
      ) {
        areaName = geocodeResponse.data.results[0].formatted_address;
      } else {
        console.warn(
          '⚠️ Geocoding failed:',
          geocodeResponse.data.error_message || 'No results found',
        );
      }

      // Build payload
      const payload = {
        userId: userProfile?.userId,
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
      const response = await apiClient.post('addUserTracker', payload, {
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
  }, []);

  const liveTrackerAdminConfig = async () => {
    try {
      const response = await apiClient.get('getTrackingConfig', {
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
        dispatch(saveAdminRoles(firstItem.roles));
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
      const response = await apiClient.get('getTrackingConfig', {
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
    } catch (error) { }
  };

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        await Promise.all([
          getUnallocatedApprovedData(),
          getUnAllocatedPendingData(),
          paymentDepositionView(),
          getallCount(),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (active) {
      fetchData();
    }

    return () => {
      active = false;
    };
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
      const response = await apiClient.get('getLenderList', {
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
    if (!userId) {
      return;
    }

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
        },
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
    if (!userProfile?.userId) {
      return;
    }

    setLoadingcount(true);
    const { userId, role = [], activityType } = userProfile;
    const roleCodes = role.map(r => r.roleCode);
    const isFieldActivity =
      FiledORCallvalues === true || activityType === 'Field';

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
      const response = await apiClient.get(
        `${endpoint}/${userId}/${roleCodes}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setallcount(response.data.data);
    } catch (error) {
      console.error('Failed to fetch case count:', error);
    } finally {
      setLoadingcount(false);
    }
  };

  const dashboardLenderData = async () => {
    if (!userProfile?.userId) {
      return;
    }

    const payload = {
      lenderId:
        (selectAll && selectedLenders?.length > 0) ||
          (!selectAll && selectedLenders?.length === 0)
          ? []
          : selectedLenders,
      period: drpvalues?.label,
      userId: userProfile.userId,
    };

    try {
      const response = await apiClient.post(
        'getMobileDashboardCount',
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
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
      if (!userProfile?.userId) {
        return;
      }

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

      const response = await apiClient.post('followupRedirect', payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

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
      if (!userProfile?.userId) {
        return;
      }

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

      const response = await apiClient.post('ptpCountRedirect', payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

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
      if (!userProfile?.userId) {
        return;
      }

      const roleCode = userProfile?.role?.map(a => a?.roleCode);

      const payload = {
        lenderId: selectAll ? [] : selectedLenders,
        period: drpvalues?.label,
        userId: userProfile?.userId,
      };

      const response = await apiClient.post(
        'getPendingScheduleVisitRedirect',
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
      if (!userProfile?.userId) {
        return;
      }

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
          `getBulkUploadSuccessByListOfLan/${userProfile?.userId}`,
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
      if (!userProfile?.userId) {
        return;
      }

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
        'getPendingScheduleVisitRedirect',
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
                  .catch(function (error) { });
              }
            })
            .catch(function (error) { });
        } else if (roleCode?.includes('CA')) {
          if (
            FiledORCallvalues === true ||
            userProfile?.activityType === 'Field'
          ) {
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
                      `getBulkUploadSuccessByListOfLan/${userProfile?.userId}`,
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
                    .catch(function (error) { });
                }
              })
              .catch(function (error) { });
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
                      `getBulkUploadSuccessByListOfLan/${userProfile?.userId}`,
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
                    .catch(function (error) { });
                }
              })
              .catch(function (error) { });
          }
        } else {
          const url =
            FiledORCallvalues === true || userProfile?.activityType === 'Field'
              ? 'getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationApprovedField'
              : 'getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationApproved';

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
                    `getBulkUploadSuccessByListOfLan/${userProfile?.userId}`,
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
                  .catch(function (error) { });
              }
            })
            .catch(function (error) { });
        }
      }
    } catch (error) { }
  };

  const paymentDepositionView = async () => {
    if (!userProfile?.userId) {
      return;
    }

    try {
      const response = await apiClient.get(
        `getDepositionHistory/${userProfile?.userId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const validPaymentModes = ['Cash', 'Cheque', 'Demand Draft'];
      const data = response?.data?.response ?? []; // 🛡 SAFE fallback

      if (Array.isArray(data)) {
        const pendingPayments = data.filter(
          payment =>
            payment.status === 'Pending' &&
            validPaymentModes.includes(payment.paymentCollectionMode),
        );

        const approvedPayments = data.filter(
          payment =>
            payment.status === 'Approved' &&
            validPaymentModes.includes(payment.paymentCollectionMode),
        );

        setPaymentDepostion(pendingPayments);
        setApprovedPaymentDepositionAmount(approvedPayments);
      } else {
        // 🛡 Non-array response fallback
        setPaymentDepostion([]);
        setApprovedPaymentDepositionAmount([]);
      }
    } catch (error) {
      console.log('paymentDepositionView error:', error);
      // 🛡 API failed fallback
      setPaymentDepostion([]);
      setApprovedPaymentDepositionAmount([]);
    }
  };

  const hasUser = Boolean(userProfile?.firstName && userProfile?.lastName);

  const allCasesCount =
    roleCode?.includes('FA') || roleCode?.includes('CA')
      ? allcount?.countCACaseAllocation ?? '0'
      : allcount?.allCount ?? '0';

  const hasLocation = Number.isFinite(curlat) && Number.isFinite(curLong);
  const taskPercentage =
    TodayTaskList?.percentage != null
      ? Math.round(TodayTaskList.percentage)
      : null;
  const totalVisits = Number(TodayTaskList?.totalVisit ?? 0);
  const completedVisits = Number(TodayTaskList?.completedVisit ?? 0);
  const selectedLenderCount =
    selectAll && lenderLists.length > 0
      ? lenderLists.length
      : selectedLenders.length;
  const lenderSummaryLabel =
    selectedLenderCount > 0
      ? `${selectedLenderCount} lender${selectedLenderCount > 1 ? 's' : ''
      } selected`
      : 'All lenders';
  const activityModeLabel =
    userProfile?.activityType === 'Both'
      ? FiledORCallvalues
        ? 'Field mode'
        : 'Call mode'
      : `${userProfile?.activityType || 'Collection'} mode`;

  const toggleTodayTasksModal = () => {
    settodayTaskModal(!todayTaskModal);
  };

  const handleOpenVisits = useCallback(() => {
    if (!hasLocation) {
      Alert.alert('Location not updated yet. Please wait.');
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
  }, [
    hasLocation,
    navigation,
    daily,
    visitForTodayData,
    curlat,
    curLong,
    lat,
    long,
    curName,
  ]);

  const todayVisitsRemaining = Math.max(totalVisits - completedVisits, 0);
  const taskProgressWidth = `${Math.min(
    Math.max(taskPercentage ?? 0, 0),
    100,
  )}%`;

  const todayOverviewStats = useMemo(
    () => [
      {
        label: 'Visits due',
        value: visitForTodayData.length,
      },
      {
        label: 'Follow-ups',
        value: followupData.length,
      },
      {
        label: 'PTPs due',
        value: dashboardCountData?.ptpDueForToday ?? 0,
      },
    ],
    [
      visitForTodayData.length,
      followupData.length,
      dashboardCountData?.ptpDueForToday,
    ],
  );

  const priorityActions = useMemo(
    () => [
      {
        icon: 'map-marker-path',
        accentColor: '#2563EB',
        title: 'Visits Due Today',
        caption: hasLocation
          ? 'Open the routed visit list for today'
          : 'Waiting for live location to open route',
        value: visitForTodayData.length,
        onPress: handleOpenVisits,
        disabled: !hasUser,
      },
      {
        icon: 'account-voice',
        accentColor: '#7C3AED',
        title: 'Follow-Ups Due',
        caption: 'Review follow-up cases that need attention',
        value: followupData.length,
        onPress: () =>
          navigation.navigate('FollowUpDueForToday', {
            screenName: 'Follow-Up Due For Today',
            data: followupData,
          }),
        disabled: !hasUser,
      },
      {
        icon: 'handshake-outline',
        accentColor: '#B45309',
        title: 'PTPs Due Today',
        caption: 'Review promise-to-pay cases for the day',
        value: dashboardCountData?.ptpDueForToday ?? 0,
        onPress: () =>
          navigation.navigate('FollowUpDueForToday', {
            screenName: 'PTPs due for today',
            data: ptpData,
          }),
        disabled: !hasUser,
      },
    ],
    [
      dashboardCountData?.ptpDueForToday,
      followupData,
      hasLocation,
      hasUser,
      handleOpenVisits,
      navigation,
      ptpData,
      visitForTodayData.length,
    ],
  );

  const dashboardMetricCards = useMemo(
    () => [
      {
        icon: require('../../../asset/icon/rupee.png'),
        value: dashboardCountData?.collectAmount,
        label: 'Amount Collected',
        accentColor: '#0E8A6A',
        helperText: 'Recovered in selected period',
        disabled: !hasUser,
      },
      {
        icon: require('../../../asset/TrueBoardIcon/visit-dues-today.png'),
        value: visitForTodayData.length,
        label: 'Visits due for today',
        accentColor: '#1D4ED8',
        helperText: 'Tap to open visit list',
        disabled: !hasUser,
        onPress: () =>
          navigation.navigate('FollowUpDueForToday', {
            screenName: 'Visits due for today',
            data: visitForTodayData,
          }),
      },
      {
        icon: require('../../../asset/TrueBoardIcon/visit-dues-today.png'),
        value: dashboardCountData?.ptpDueForToday,
        label: 'PTPs due for today',
        accentColor: '#B45309',
        helperText: 'Tap to review cases',
        disabled: !hasUser,
        onPress: () =>
          navigation.navigate('FollowUpDueForToday', {
            screenName: 'PTPs due for today',
            data: ptpData,
          }),
      },
      {
        icon: require('../../../asset/TrueBoardIcon/visit-dues-today.png'),
        value: followupData.length,
        label: 'Follow-Up Due For Today',
        accentColor: '#7C3AED',
        helperText: 'Tap to review cases',
        disabled: !hasUser,
        onPress: () =>
          navigation.navigate('FollowUpDueForToday', {
            screenName: 'Follow-Up Due For Today',
            data: followupData,
          }),
      },
      {
        value: dashboardCountData?.ptpCount,
        label: 'PTP',
        accentColor: '#0369A1',
        helperText: 'Total promise-to-pay count',
      },
      {
        icon: require('../../../asset/icon/rupee.png'),
        value: !pressedButton
          ? summaryData?.totalDepositionSummery?.pendingAmount
          : undefined,
        label: 'Pending Deposition',
        accentColor: '#DC2626',
        helperText: 'Awaiting approval',
        valueColor: '#B42318',
      },
      {
        value: !pressedButton ? allcount?.unAllocated_p_Count : 0,
        label: 'Unallocated',
        subLabel: '(Pending)',
        accentColor: '#6D28D9',
        helperText: 'Pending allocation',
      },
      {
        value: !pressedButton ? allcount?.unAllocated_a_Count : 0,
        label: 'Unallocated',
        subLabel: '(Approved)',
        accentColor: '#0F766E',
        helperText: 'Approved allocation',
      },
    ],
    [
      dashboardCountData?.collectAmount,
      dashboardCountData?.ptpDueForToday,
      dashboardCountData?.ptpCount,
      visitForTodayData,
      ptpData,
      followupData,
      pressedButton,
      summaryData?.totalDepositionSummery?.pendingAmount,
      allcount?.unAllocated_p_Count,
      allcount?.unAllocated_a_Count,
      hasUser,
      navigation,
    ],
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar
        translucent
        backgroundColor="#001D56"
        barStyle="light-content"
      />
      {/* <Header title="Dashboard" onOpenDrawer={openDrawer} /> */}

      <View style={styles.container}>
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

        <TodayTasksModal
          visible={todayTaskModal}
          onClose={toggleTodayTasksModal}
          tasks={TodayTaskList}
        />

        {loadingcount && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        <CoolectionHeader
          title="Dashboard"
          onOpenDrawer={openDrawer}
          userProfile={userProfile}
          hasUser={hasUser}
          hasLocation={hasLocation}
          allCasesCount={allCasesCount}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* <LinearGradient
            colors={['#08245C', '#0B3D89', '#145C9E']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroCard}>
            <View style={styles.heroHeaderRow}>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroEyebrow}>Daily Dashboard</Text>
                <Text style={styles.heroTitle}>
                  {hasUser
                    ? `Welcome back, ${userProfile.firstName}!`
                    : 'Preparing your dashboard'}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {hasLocation
                    ? 'Location is synced and route actions are ready.'
                    : 'Syncing live location so visit actions stay accurate.'}
                </Text>
              </View>

              <View style={styles.heroCaseBadge}>
                <Text style={styles.heroCaseValue}>
                  {formatDashboardValue(allCasesCount)}
                </Text>
                <Text style={styles.heroCaseLabel}>All Cases</Text>
              </View>
            </View>

          </LinearGradient> */}

          <View style={styles.filtersPanel}>
            <Pressable
              onPress={toggleModal}
              disabled={!hasUser}
              style={[
                styles.selectorPressable,
                !hasUser && styles.disabledSurface,
              ]}>
              <View style={styles.selectorTextWrap}>
                <Text style={styles.selectorLabel}>Lender Focus</Text>
                <Text style={styles.selectorValueText}>
                  {selectedLenderCount > 0
                    ? lenderSummaryLabel
                    : 'Select lender'}
                </Text>
                <Text numberOfLines={1} style={styles.selectorSubText}>
                  {selectedLenderCount > 0
                    ? dropdownValue
                    : 'Choose lender filters for this dashboard'}
                </Text>
              </View>

              <View style={styles.selectorIconWrap}>
                <Image
                  source={require('../../../asset/icon/arrow_down.png')}
                  style={styles.iconDark}
                />
              </View>
            </Pressable>

            <View style={styles.filtersControlRow}>
              <View style={styles.filterControlBlock}>
                <Text style={styles.filterControlLabel}>Period</Text>
                <Dropdown
                  style={[styles.dropdown, isFocus && styles.dropdownFocus]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  itemTextStyle={styles.itemTextStyle}
                  data={PERIOD_OPTIONS}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select period"
                  value={drpvalues?.value}
                  disable={!hasUser}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setdrpValues(item);
                    setIsFocus(false);
                  }}
                />
              </View>

              {userProfile?.activityType === 'Both' ? (
                <View style={styles.modePanel}>
                  <Text style={styles.filterControlLabel}>Mode</Text>
                  <View style={styles.modeSwitchWrap}>
                    <Pressable
                      onPress={() => setFiledORCallvalues(false)}
                      disabled={!hasUser}
                      style={[
                        styles.modeOption,
                        !FiledORCallvalues && styles.modeOptionActive,
                        !hasUser && styles.disabledSurface,
                      ]}>
                      <MaterialCommunityIcons
                        name="phone-outline"
                        size={18}
                        color={!FiledORCallvalues ? '#FFFFFF' : '#0B2D6C'}
                      />
                      <Text
                        style={[
                          styles.modeOptionText,
                          !FiledORCallvalues && styles.modeOptionTextActive,
                        ]}>
                        Call
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setFiledORCallvalues(true)}
                      disabled={!hasUser}
                      style={[
                        styles.modeOption,
                        FiledORCallvalues && styles.modeOptionActive,
                        !hasUser && styles.disabledSurface,
                      ]}>
                      <MaterialCommunityIcons
                        name="map-marker-radius-outline"
                        size={18}
                        color={FiledORCallvalues ? '#FFFFFF' : '#0B2D6C'}
                      />
                      <Text
                        style={[
                          styles.modeOptionText,
                          FiledORCallvalues && styles.modeOptionTextActive,
                        ]}>
                        Field
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.modeStatusCard}>
                  <Text style={styles.filterControlLabel}>Mode</Text>
                  <Text style={styles.modeStatusValue}>
                    {activityModeLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <LinearGradient
            colors={['#0B2D6C', '#0D4F98']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryTaskCard}>
            <View style={styles.primaryTaskHeader}>
              <View style={styles.primaryTaskHeaderText}>
                <Text style={styles.primaryTaskEyebrow}>Today&apos;s Work</Text>
                <Text style={styles.primaryTaskTitle}>
                  Route & Task Readiness
                </Text>
              </View>

              <Pressable
                disabled={!hasUser}
                onPress={toggleTodayTasksModal}
                style={styles.primaryTaskBadge}>
                <MaterialCommunityIcons
                  name="clipboard-pulse-outline"
                  size={15}
                  color="#FFFFFF"
                />
                <Text style={styles.primaryTaskBadgeText}>Tasks</Text>
              </Pressable>
            </View>

            <View style={styles.primaryTaskBody}>
              <View style={styles.taskCircle}>
                <Text style={styles.taskPercentageText}>
                  {taskPercentage != null ? `${taskPercentage}%` : '--'}
                </Text>
              </View>

              <View style={styles.primaryTaskContent}>
                <Text
                  style={
                    styles.primaryTaskValue
                  }>{`${completedVisits}/${totalVisits}`}</Text>
                <Text style={styles.primaryTaskLabel}>Visits completed</Text>
                <Text style={styles.primaryTaskCaption}>
                  {hasLocation
                    ? `${todayVisitsRemaining} visits remaining for today.`
                    : 'Location sync is in progress for visit actions.'}
                </Text>

                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: taskProgressWidth }]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.taskStatsRow}>
              {todayOverviewStats.map(stat => (
                <View key={stat.label} style={styles.taskStatCard}>
                  <Text style={styles.taskStatValue}>
                    {formatDashboardValue(stat.value)}
                  </Text>
                  <Text style={styles.taskStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.primaryTaskActionsRow}>
              <Pressable
                disabled={!hasUser}
                onPress={handleOpenVisits}
                style={styles.primaryTaskButton}>
                <Text style={styles.primaryTaskButtonText}>View Visits</Text>
              </Pressable>

              <Pressable
                disabled={!hasUser}
                onPress={toggleTodayTasksModal}
                style={styles.secondaryTaskButton}>
                <Text style={styles.secondaryTaskButtonText}>
                  Today&apos;s Tasks
                </Text>
              </Pressable>

            </View>

            <Pressable
              disabled={!hasUser}
              onPress={() => navigation.navigate('Incentive')}
              style={styles.incentiveBanner}>
              <View style={styles.incentiveBannerLeft}>
                <View style={styles.incentiveBannerIcon}>
                  <Image
                    source={require('../../../asset/icon/rupee.png')}
                    style={styles.incentiveBannerIconImage}
                  />
                </View>

                <View style={styles.incentiveBannerTextWrap}>
                  <Text style={styles.incentiveBannerLabel}>My Incentive</Text>
                  <Text style={styles.incentiveBannerCaption}>
                    Track incentive details without leaving this flow.
                  </Text>
                </View>
              </View>

              <View style={styles.incentiveBannerRight}>
                <Text style={styles.incentiveBannerValue}>----</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="#0B2D6C"
                />
              </View>
            </Pressable>
          </LinearGradient>

          <View style={styles.prioritySection}>
            <View style={styles.priorityHeader}>
              <View style={styles.priorityHeaderText}>
                <Text style={styles.priorityEyebrow}>Need Attention</Text>
                <Text style={styles.priorityTitle}>Next Best Actions</Text>
              </View>

              <View style={styles.priorityPill}>
                <Text style={styles.priorityPillText}>{drpvalues?.label}</Text>
              </View>
            </View>

            {priorityActions.map(action => (
              // <View style={styles.primaryTaskActionsRow}>
              <Pressable
                key={action.title}
                disabled={action.disabled}
                onPress={action.onPress}
                style={styles.priorityCard}>
                <View
                  style={[
                    styles.priorityIconWrap,
                    { backgroundColor: `${action.accentColor}14` },
                  ]}>
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={20}
                    color={action.accentColor}
                  />
                </View>

                <View style={styles.priorityCardContent}>
                  <Text style={styles.priorityCardTitle}>{action.title}</Text>
                  <Text style={styles.priorityCardCaption}>
                    {action.caption}
                  </Text>
                </View>

                <View style={styles.priorityCardRight}>
                  <Text
                    style={[
                      styles.priorityCardValue,
                      { color: action.accentColor },
                    ]}>
                    {formatDashboardValue(action.value)}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color="#8CA4C8"
                  />
                </View>
              </Pressable>
              // </View>
            ))}
          </View>



          <View style={styles.metricsSection}>
            <View style={styles.metricsHeader}>
              <View style={styles.metricsHeaderTextWrap}>
                <Text style={styles.metricsEyebrow}>My Dashboard</Text>
                <Text style={styles.metricsTitle}>Performance Snapshot</Text>
                <Text style={styles.metricsSubtitle}>
                  Supporting metrics remain here for quick scanning.
                </Text>
              </View>

              <View style={styles.metricsBadge}>
                <MaterialCommunityIcons
                  name="chart-box-outline"
                  size={16}
                  color="#0B2D6C"
                />
                <Text style={styles.metricsBadgeText}>Insights</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              {dashboardMetricCards.map((card, index) => (
                <DashboardCard
                  key={`${card.label}-${index}`}
                  icon={card.icon}
                  value={card.value}
                  label={card.label}
                  subLabel={card.subLabel}
                  onPress={card.onPress}
                  disabled={card.disabled}
                  valueColor={card.valueColor}
                  accentColor={card.accentColor}
                  helperText={card.helperText}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#EEF3FB',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.light.darkBlue,
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : verticalScale(5),
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  drawerIcon: { width: scale(22), height: scale(22), tintColor: '#FFFFFF' },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: scale(10),
  },

  container: {
    flex: 1,
    backgroundColor: '#EEF3FB',
  },

  scrollContent: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(32),
  },

  selectorPressable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#F6FAFF',
    borderWidth: 1,
    borderColor: '#D8E6F8',
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
  },
  selectorTextWrap: {
    flex: 1,
    paddingRight: scale(10),
  },
  selectorLabel: {
    fontSize: ms(11),
    color: '#0B4A8D',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  selectorValueText: {
    color: '#0F172A',
    fontSize: ms(16),
    fontWeight: '800',
    marginTop: verticalScale(4),
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '700',
    marginTop: verticalScale(3),
  },
  selectorSubText: {
    color: '#64748B',
    fontSize: ms(11),
    marginTop: verticalScale(5),
  },
  selectorIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1FF',
  },
  icon: { height: 18, width: 18, tintColor: '#FFFFFF' },
  iconDark: { height: 16, width: 16, tintColor: '#0B2D6C' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },

  modalBox: {
    position: 'absolute',
    top: height * 0.12,
    alignSelf: 'center',
    width: width * 0.86,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 18,
    elevation: 15,
    shadowColor: '#07152D',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },

  title: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },

  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowText: {
    color: '#0F172A',
    marginLeft: 6,
    fontSize: ms(15),
    fontWeight: '600',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  lenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
  },
  itemText: {
    marginLeft: 6,
    fontSize: ms(15),
    color: '#1E293B',
    width: width * 0.62,
  },
  checkWrap: {
    padding: 2,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  cancelText: { color: '#0F172A', fontSize: ms(15), fontWeight: '700' },
  okButtonWrapper: {
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  okButton: {
    minWidth: width * 0.28,
    height: height * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#001D56',
    paddingHorizontal: scale(18),
  },
  okText: { color: 'white', fontSize: ms(15), fontWeight: '700' },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
  },

  heroCard: {
    borderRadius: moderateScale(28),
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(14),
    marginTop: verticalScale(16),
    overflow: 'hidden',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: scale(14),
  },
  heroEyebrow: {
    color: '#BFD8FF',
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: ms(24),
    fontWeight: '800',
    marginTop: verticalScale(6),
  },
  heroSubtitle: {
    color: '#D9E7FF',
    fontSize: ms(12),
    lineHeight: ms(18),
    marginTop: verticalScale(6),
    maxWidth: '88%',
  },
  heroCaseBadge: {
    minWidth: scale(88),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
  },
  heroCaseValue: {
    color: '#FFFFFF',
    fontSize: ms(22),
    fontWeight: '800',
  },
  heroCaseLabel: {
    color: '#D9E7FF',
    fontSize: ms(11),
    marginTop: 2,
    fontWeight: '600',
  },
  heroChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: verticalScale(12),
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(99),
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginRight: scale(8),
    marginBottom: verticalScale(6),
  },
  heroChipText: {
    color: '#FFFFFF',
    fontSize: ms(11),
    fontWeight: '600',
    marginLeft: scale(6),
  },
  disabledSurface: {
    opacity: 0.65,
  },
  modeSwitchWrap: {
    flexDirection: 'row',
    marginTop: verticalScale(8),
    justifyContent: 'space-between',
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#D7E4F8',
    backgroundColor: '#F6FAFF',
  },
  modeOptionActive: {
    backgroundColor: '#0B2D6C',
    borderColor: '#0B2D6C',
  },
  modeOptionText: {
    color: '#0B2D6C',
    fontSize: ms(13),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  modeOptionTextActive: {
    color: '#FFFFFF',
  },

  filtersPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(16),
    shadowColor: '#0B214A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  filtersControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(12),
  },
  filterControlBlock: {
    width: '39%',
  },
  filterControlLabel: {
    color: '#0B4A8D',
    fontSize: ms(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: verticalScale(7),
  },
  modePanel: {
    width: '57%',
  },
  modeStatusCard: {
    width: '57%',
    backgroundColor: '#F6FAFF',
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: '#D8E6F8',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(13),
  },
  modeStatusValue: {
    color: '#0F172A',
    fontSize: ms(14),
    fontWeight: '800',
  },

  dropdown: {
    width: '100%',
    minHeight: verticalScale(46),
    borderColor: '#D7E3F4',
    borderWidth: 1,
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(12),
    backgroundColor: '#F8FBFF',
  },
  dropdownFocus: { borderColor: '#0B4A8D' },
  placeholderStyle: { fontSize: ms(13), color: '#7B8794' },
  selectedTextStyle: { fontSize: ms(13), color: '#0F172A', fontWeight: '700' },
  inputSearchStyle: { height: 40, fontSize: ms(13) },
  itemTextStyle: { fontSize: ms(13), color: '#475569' },
  iconStyle: { width: 18, height: 18, tintColor: '#0B2D6C' },

  primaryTaskCard: {
    marginTop: verticalScale(18),
    borderRadius: moderateScale(28),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  primaryTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  primaryTaskHeaderText: {
    flex: 1,
    paddingRight: scale(10),
  },
  primaryTaskEyebrow: {
    color: '#C7DAFF',
    fontSize: ms(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  primaryTaskTitle: {
    color: '#FFFFFF',
    fontSize: ms(22),
    fontWeight: '800',
    marginTop: verticalScale(6),
  },
  primaryTaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(99),
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  primaryTaskBadgeText: {
    color: '#FFFFFF',
    fontSize: ms(11),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  primaryTaskBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  primaryTaskContent: {
    flex: 1,
    marginLeft: scale(14),
  },
  primaryTaskValue: {
    color: '#FFFFFF',
    fontSize: ms(24),
    fontWeight: '800',
  },
  primaryTaskLabel: {
    color: '#D9E7FF',
    fontSize: ms(12),
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  primaryTaskCaption: {
    color: '#D9E7FF',
    fontSize: ms(11),
    lineHeight: ms(16),
    marginTop: verticalScale(8),
  },
  taskStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(16),
  },
  taskStatCard: {
    width: '31.5%',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: moderateScale(18),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(8),
    alignItems: 'center',
  },
  taskStatValue: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '800',
  },
  taskStatLabel: {
    color: '#D9E7FF',
    fontSize: ms(10),
    fontWeight: '600',
    marginTop: verticalScale(4),
  },
  primaryTaskActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(16),
  },
  primaryTaskButton: {
    width: '48.3%',
    minHeight: verticalScale(44),
    borderRadius: moderateScale(16),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTaskButtonText: {
    color: '#0B2D6C',
    fontSize: ms(13),
    fontWeight: '800',
  },
  secondaryTaskButton: {
    width: '48.3%',
    minHeight: verticalScale(44),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTaskButtonText: {
    color: '#FFFFFF',
    fontSize: ms(13),
    fontWeight: '800',
  },
  prioritySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(26),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(18),
    shadowColor: '#0B214A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  priorityHeaderText: {
    flex: 1,
    paddingRight: scale(10),
  },
  priorityEyebrow: {
    color: '#0B4A8D',
    fontSize: ms(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  priorityTitle: {
    color: '#0F172A',
    fontSize: ms(22),
    fontWeight: '800',
    marginTop: verticalScale(6),
  },
  priorityPill: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(99),
    backgroundColor: '#EEF4FF',
  },
  priorityPillText: {
    color: '#0B2D6C',
    fontSize: ms(11),
    fontWeight: '700',
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#E9EFF8',
  },
  priorityIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityCardContent: {
    flex: 1,
    marginLeft: scale(12),
    paddingRight: scale(8),
  },
  priorityCardTitle: {
    color: '#0F172A',
    fontSize: ms(15),
    fontWeight: '800',
  },
  priorityCardCaption: {
    color: '#64748B',
    fontSize: ms(11),
    lineHeight: ms(16),
    marginTop: verticalScale(4),
  },
  priorityCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityCardValue: {
    fontSize: ms(18),
    fontWeight: '800',
    marginRight: scale(2),
  },
  incentiveBanner: {
    marginTop: verticalScale(18),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0B214A',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  incentiveBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: scale(10),
  },
  incentiveBannerIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: '#0B2D6C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incentiveBannerIconImage: {
    width: scale(16),
    height: scale(16),
    tintColor: '#FFFFFF',
  },
  incentiveBannerTextWrap: {
    flex: 1,
    marginLeft: scale(12),
  },
  incentiveBannerLabel: {
    color: '#0F172A',
    fontSize: ms(15),
    fontWeight: '800',
  },
  incentiveBannerCaption: {
    color: '#64748B',
    fontSize: ms(11),
    lineHeight: ms(16),
    marginTop: verticalScale(4),
  },
  incentiveBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incentiveBannerValue: {
    color: '#0B2D6C',
    fontSize: ms(20),
    fontWeight: '800',
    marginRight: scale(8),
  },

  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(18),
  },
  quickActionItem: {
    width: '48.2%',
  },
  quickActionCard: {
    minHeight: verticalScale(250),
    borderRadius: moderateScale(26),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderWidth: 1,
    borderColor: '#DCE8FB',
    shadowColor: '#0B214A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  quickActionCardDark: {
    borderColor: 'rgba(255,255,255,0.12)',
  },
  quickActionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(99),
    backgroundColor: '#DBEAFE',
  },
  quickActionTagText: {
    color: '#0B2D6C',
    fontSize: ms(11),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  quickActionTagDark: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(99),
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  quickActionTagTextDark: {
    color: '#FFFFFF',
    fontSize: ms(11),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  quickActionMiniText: {
    color: '#D9E7FF',
    fontSize: ms(10),
    fontWeight: '600',
  },
  quickActionValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(18),
  },
  quickActionIconCircle: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#0B2D6C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  iconSmall: { width: 16, height: 16, tintColor: '#FFFFFF' },
  quickActionValue: {
    color: '#0F172A',
    fontSize: ms(24),
    fontWeight: '800',
  },
  quickActionTitle: {
    color: '#0F172A',
    fontSize: ms(18),
    fontWeight: '800',
    marginTop: verticalScale(14),
  },
  quickActionCaption: {
    color: '#475569',
    fontSize: ms(12),
    lineHeight: ms(18),
    marginTop: verticalScale(8),
  },
  quickActionFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: verticalScale(18),
  },
  quickActionFooterText: {
    color: '#0B2D6C',
    fontSize: ms(12),
    fontWeight: '700',
  },
  visitProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(18),
  },
  taskCircle: {
    height: scale(70),
    width: scale(70),
    borderRadius: scale(35),
    borderWidth: scale(4),
    borderColor: '#FBB34A',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskPercentageText: { fontSize: ms(15), fontWeight: '800', color: '#FFF' },
  visitProgressMeta: {
    flex: 1,
    marginLeft: scale(14),
  },
  visitProgressValue: {
    color: '#FFFFFF',
    fontSize: ms(21),
    fontWeight: '800',
  },
  visitProgressLabel: {
    color: '#D9E7FF',
    fontSize: ms(12),
    marginTop: verticalScale(2),
  },
  progressTrack: {
    height: verticalScale(8),
    borderRadius: moderateScale(99),
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginTop: verticalScale(10),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: moderateScale(99),
    backgroundColor: '#FDBA3A',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: moderateScale(18),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    marginTop: verticalScale(16),
  },
  taskMiniStat: {
    flex: 1,
    alignItems: 'center',
  },
  taskMiniDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  taskMiniValue: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '800',
  },
  taskMiniLabel: {
    color: '#D9E7FF',
    fontSize: ms(10),
    fontWeight: '600',
    marginTop: verticalScale(4),
  },
  viewVisitsBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    width: '100%',
    minHeight: verticalScale(42),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  viewVisitsText: { fontSize: ms(13), fontWeight: '800', color: '#001D56' },

  focusStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(18),
  },
  focusStatCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(22),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(14),
    shadowColor: '#0B214A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  focusStatIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F2FF',
  },
  focusStatValue: {
    color: '#0F172A',
    fontSize: ms(20),
    fontWeight: '800',
    marginTop: verticalScale(12),
  },
  focusStatLabel: {
    color: '#0F172A',
    fontSize: ms(11),
    fontWeight: '700',
    marginTop: verticalScale(5),
  },
  focusStatHelper: {
    color: '#64748B',
    fontSize: ms(10),
    marginTop: verticalScale(4),
    lineHeight: ms(14),
  },

  metricsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(28),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(18),
    shadowColor: '#0B214A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  metricsHeaderTextWrap: {
    flex: 1,
    paddingRight: scale(12),
  },
  metricsEyebrow: {
    color: '#0B4A8D',
    fontSize: ms(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricsTitle: {
    color: '#0F172A',
    fontSize: ms(22),
    fontWeight: '800',
    marginTop: verticalScale(6),
  },
  metricsSubtitle: {
    color: '#64748B',
    fontSize: ms(12),
    lineHeight: ms(18),
    marginTop: verticalScale(6),
  },
  metricsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(99),
    backgroundColor: '#EAF2FF',
  },
  metricsBadgeText: {
    color: '#0B2D6C',
    fontSize: ms(11),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: verticalScale(14),
  },

  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  rowLabel: { fontSize: ms(14), color: '#0F172A', fontWeight: '600', flex: 1 },
  rowValue: {
    fontSize: ms(14),
    color: '#0F172A',
    fontWeight: '800',
    marginLeft: 10,
    textAlign: 'right',
    minWidth: 40,
  },
});
