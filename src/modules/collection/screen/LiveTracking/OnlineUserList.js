import React, { useEffect, useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  BackHandler,
  TextInput,
  FlatList,
} from 'react-native';


import { showDrawer, currentScreen } from '../redux/action';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { BallIndicator } from 'react-native-indicators'; // Adjust import path if necessary
import apiClient from '../../../../common/hooks/apiClient';
import { BASE_URL } from '../../service/api';

const { width, height } = Dimensions.get('window');

const OnlineUserList = () => {
  const [userFilter, setUserFilter] = useState([]);
  const [MapByUserId, setMapByUserId] = useState([]);
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);
  const roleCode = useSelector(state => state.auth.usersrolecode)
  const AgencyId = useSelector(state => state.auth.usersagencyId);
  const selectedPortfolio = useSelector(state => state.auth.selectedPortfolio,);
  const selectedState = useSelector(state => state.auth.selectedState);
  const selectedCity = useSelector(state => state.auth.selectedCity);
  const selecteduserType = useSelector(state => state.auth.selecteduserType);
  // const user = useSelector(state => state.auth);

  const searchdetail = useSelector(state => state.auth.searchdetail);



  const [messageVisible, setMessageVisible] = useState(false);
  const [drpValues1, setdrpValues1] = useState({ label: '', value: '' });
  const [onlineuserId, setonlineuserId] = useState([]);
  const [externalUserList, setexternalUserList] = useState([]);

  const {
    SendingselectedActivity,
    onlineUsersUserId,
    date,
    fromTime,
    toTime,
    AgencyUserStatus,

    userTypeIds,
    cityIds,
    portfolioIds,
    stateIds,
    activity,
  } = route.params;


  const [loadingUserNames, setLoadingUserNames] = useState(false);

  const [selectedUserType, setSelectedUserType] = useState(null);
  // const [selectedUserName, setSelectedUserName] = useState(null);

  const [selectedUserName, setSelectedUserName] = useState(null);
  const [selectedInternalUserId, setSelectedInternalUserId] = useState(null);

  // 
  const [CardFilterId, setCardFilterId] = useState(null);
  // setCardFilterId(selectedUserName.userId);
  const [selectedAgency, setSelectedAgency] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userList, setUserList] = useState([]); // State for storing user data
  const [userListForALL, setuserListForALL] = useState([]); // State for storing user data


  const [internalUsers, setInternalUsers] = useState([]);

  const [externalUsers, setExternalUsers] = useState([]);



  // const [selectedInternalUserId, setSelectedInternalUserId] = useState(null);
  const [selectedExternalUserId, setSelectedExternalUserId] = useState(null);


  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  // const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(
    new Date(new Date().getTime() - 60 * 60 * 1000),
  );
  const [endTime, setEndTime] = useState(new Date());
  const [agencyIds, setAgencyIds] = useState([]); // State to store selected agencyId
  const [AllAgencyIds, setAllAgencyIds] = useState([]); // State to store selected agencyId

  const [isInternalSelected, setIsInternalSelected] = useState(false); // true for Internal, false for External
  const [isExternalSelected, setIsExternalSelected] = useState(false); // true for External, false for Internal
  const [OnlineExternalUsers, setOnlineExternalUsers] = useState([]);
  const [OnlineInternalUsers, setOnlineInternalUsers] = useState([]);

  // const [AgencyId, setAgencyId] = useState([]);
  const [AgencyTrackingConfigs, setAgencyTrackingConfigs] = useState([]);
  const [rolesWithStatusY, setRolesWithStatusY] = useState([])

  const [Roles, setRoles] = useState([]);


  const liveTrackerAdminConfigForOnetime = () => {
    apiClient
      .get(`${BASE_URL}getTrackingConfig`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })
      .then(response => {


        const responseData = response.data.response;


        if (Array.isArray(responseData) && responseData.length > 0) {
          const firstItem = responseData[0];

          // setTrackerAdminConfig(firstItem);
          setRoles(firstItem.roles);
          console.log
          setAgencyTrackingConfigs(firstItem.agencyTrackingConfigs);

          if (firstItem.active === false) {
            setShowTrackingAccess(false);
            Alert.alert(
              'Tracking Status',
              'Tracking of user is OFF!',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Dashboard'), // Navigate to Dashboard
                },
              ],
            );
          }
        }
      })
      .catch(error => {

      });
  };

  const liveTrackerAdminConfig = () => {
    apiClient
      .get(`${BASE_URL}getTrackingConfig`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })
      .then(response => {


        // Ensure responseData is correctly assigned
        const responseData = response.data.response;


        // Check if responseData is an array and contains at least one item
        if (Array.isArray(responseData) && responseData.length > 0) {
          const firstItem = responseData[0];

          // setTrackerAdminConfig(firstItem); // Update state with the first item

          // Extract and set roles and agencyTrackingConfigs
          setRoles(firstItem.roles);
          setAgencyTrackingConfigs(firstItem.agencyTrackingConfigs);


        }
      })
      .catch(error => {

      });
  };

  const checkRoleCodeAndAgencyId = () => {
    const roleCodesToCheck = Array.isArray(roleCode) ? roleCode : [roleCode];
    const agencyIdsToCheck = Array.isArray(AgencyId) ? AgencyId : [AgencyId];

    const agencyConfig = AgencyTrackingConfigs.find(config =>
      agencyIdsToCheck.includes(config.agencyId),
    );

    if (!agencyConfig) {

      return false; // Early return if agencyId does not match
    }


    const roleStatusArray = JSON.parse(agencyConfig.agencyTrackingRoleStatus);

    // Initialize an array to store roles with a status of 'Y'
    const matchingRoles = [];

    const roleMatchFound = roleCodesToCheck.some(code => {
      const role = roleStatusArray.find(role => role.roleCode === code);
      if (role) {
        if (role.status === 'Y') {

          matchingRoles.push(role); // Store the matching role
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

    // Store the matching roles in the state

    setRolesWithStatusY(matchingRoles);

    return true; // Allow further execution if all checks pass
  };

  // useEffect(() => {
  //   // if(AgencyTrackingConfigs.length > 0) {
  //     checkRoleCodeAndAgencyId();
  //   // }
  // },[]);


  useEffect(() => {
    liveTrackerAdminConfig();
    liveTrackerAdminConfigForOnetime();
  }, []);

  useEffect(() => {
    liveTrackerAdminConfig();
    const intervalId = setInterval(() => {
      liveTrackerAdminConfig();
    }, 70000);
    return () => clearInterval(intervalId);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');


  const filteredUsers = userFilter.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );


  const CustomCard = React.memo(({ user, onPress, disabled, cardColor }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cardColor },
        disabled && styles.disabledCard,
      ]}
      onPress={!disabled ? onPress : null}
      disabled={disabled}>
      <View>
        <Text style={styles.title}>
          {user.fullName} ({user.userName})
        </Text>
        <Text style={styles.text}>Role: {user.role}</Text>
        <Text style={styles.text}>
          Reporting Authority:{' '}
          {user.reportingAuthority === '0' ? 'Self' : user.reportingAuthority}
        </Text>
        <Text style={styles.text}>
          Status:
          <Text style={{ color: user.status === 'Online' ? 'green' : 'black' }}>
            {user.status}
          </Text>
        </Text>

        <Text style={styles.text}>
          Login Time: {user.loginTime ? user.loginTime : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  ));

  const CustomCardForAgency = ({
    user,
    onPress,
    disabled,
    cardColor,
    managedBy,
  }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cardColor },
        disabled && styles.disabledCard,
      ]}
      onPress={!disabled ? onPress : null}
      disabled={disabled}>
      <View>
        <Text> {user.userId}</Text>
        <Text style={styles.title}>
          {user.fullName} ({user.userName})
        </Text>

        <Text style={styles.text}>
          Reporting Authority:{' '}
          {user.reportingAuthority === '0' ? 'Self' : user.reportingAuthority}
        </Text>
        <Text style={{ color: 'black' }}>Managed-By: {managedBy}</Text>

        <Text style={{ color: 'black' }}>Role:{user.roleName}</Text>
        <Text style={{ color: 'black' }}>UserId {user.userId}</Text>
      </View>
    </TouchableOpacity>
  );

  // 

  // const onChangeDate = (event, selectedDate) => {
  //   const currentDate = selectedDate || date;
  //   setShowDatePicker(false);
  //   setDate(currentDate);
  // };

  // const onChangeStartTime = (event, selectedTime) => {
  //   const currentTime = selectedTime || startTime;
  //   setShowStartTimePicker(false);
  //   setStartTime(currentTime);
  // };

  // const onChangeEndTime = (event, selectedTime) => {
  //   const currentTime = selectedTime || endTime;
  //   setShowEndTimePicker(false);
  //   setEndTime(currentTime);
  // };

  // const formatDatee = date => {
  //   return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  // };

  // const formatTime = date => {
  //   return date.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"
  // };

  // const formatDates = date => {
  //   const d = new Date(date);
  //   const year = d.getFullYear();
  //   const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
  //   const day = String(d.getDate()).padStart(2, '0'); // Ensure two digits

  //   return `${year}-${month}-${day}`;
  // };

  // const formatTimes = date => {
  //   return date.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"
  // };

  function handleBackButtonClick() {
    navigation.goBack();
    return true;
  }

  const userTypeData = [
    { label: 'Internal', value: 'usertype1' },
    { label: 'External', value: 'usertype2' },
  ];

  const formatDate = date => {
    // Your date formatting logic here
    return date.toISOString().split('T')[0];
  };

  const SelectActivity = [
    { label: 'ScheduleVisit', value: 'Role1' },
    { label: 'PTP', value: 'Role2' },
    { label: 'Payment', value: 'Role3' },
    { label: 'Dispute/RTP', value: 'Role4' },
    { label: 'Raise Exception', value: 'Role5' },
    { label: 'Request', value: 'Role6' },

    { label: 'WRONG NUMBER', value: 'Role8' },
    { label: 'LEFT MESSAGE', value: 'Role9' },
    { label: 'NOT REACHABLE', value: 'Role10' },
    { label: 'CUSTOMER BUSY', value: 'Role11' },
    { label: 'VISIT PENDING', value: 'Role12' },
    { label: 'NOT SERVICEABLE AREA', value: 'Role13' },
    { label: 'ADDRESS NOT FOUND // SHORT ADD/WRONG ADD', value: 'Role14' },
    { label: 'OUT OF STATION', value: 'Role15' },
    { label: 'DOOR LOCK/REVISIT', value: 'Role16' },
    { label: 'ENTRY RESTRICTED', value: 'Role17' },
    { label: 'RINGING NO RESPONSE', value: 'Role18' },
    { label: 'SWITCHED OFF', value: 'Role19' },

    { label: 'Call Back', value: '21' },
    { label: 'Left Message', value: '20' },
  ];

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, []);

  const getUserByUserType = async () => {
    try {
      setLoadingUserNames(true);
      const response = await apiClient.get(
        `${BASE_URL}getAllocatedLowerHierarchyByUserId/${userProfile?.userId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const res = response.data.data;


      const userNamesList = res.map(user => ({
        label: `${user.firstName} ${user.lastName}`,
        userType: user.userType,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        reportingAuthority: user.reportingAuthority,
        status: user.status,
      }));


      // const internalUserList = userNamesList.filter(
      //   user => user.userType === 'U101',
      // );
      // const externalUserList = userNamesList.filter(
      //   user => user.userType === 'Agency',
      // );
      // 

      // setInternalUsers(userNamesList);
      // setExternalUsers(externalUserList);
    } catch (error) {

    } finally {
      setLoadingUserNames(false);
    }
  };

  // const formattedDate = formatDate(date);
  // const formattedStartTime = formatTime(startTime);
  // const formattedEndTime = formatTime(endTime);

  const getAgency = async () => {
    try {
      setLoadingUserNames(true);

      const response = await apiClient.get(
        `${BASE_URL}getAgencyByUserId/${userProfile?.userId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const res = response.data.data;

      // Check if the message is "No Agency found"
      if (response.data.message === 'No Agency found') {

        // Call getAllAgency if no agency is found
        await getAllAgency();
      } else {
        const allAgencyIds = res.map(agency => agency.agencyId);


        // Set the agencyIds state with all agencyIds
        setAgencyIds(allAgencyIds);


        const agencyOptions = res.map(agency => ({
          label: agency.agencyName, // Displayed text in the dropdown
          value: agency.agencyId, // Value associated with the option
        }));



        setExternalUsers(agencyOptions);

        if (allAgencyIds.length > 0) {
          getUserByAgencyForAll(allAgencyIds);
        }
      }
    } catch (error) {

    } finally {
      setLoadingUserNames(false);
    }
  };

  const getAllAgency = async () => {
    try {
      setLoadingUserNames(true);

      const response = await apiClient.get(`${BASE_URL}getAllAgency`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      // Filter agencies by status "Y"
      const res = response.data.data.filter(agency => agency.status === 'Y');

      // Extract all agency IDs
      const allAgencyIds = res.map(agency => agency.agencyId);


      // Set the agencyIds state with all agencyIds
      setAllAgencyIds(allAgencyIds);



      // Prepare options for the dropdown
      const agencyOptions = res.map(agency => ({
        label: agency.agencyName, // Displayed text in the dropdown
        value: agency.agencyId, // Value associated with the option
      }));




      // Set the filtered agency options in state
      setExternalUsers(agencyOptions);

      // If there are any filtered agency IDs, call getUserByAgencyForAll
      if (allAgencyIds.length > 0) {
        getUserByAgencyForAll(allAgencyIds);
      }
    } catch (error) {

    } finally {
      setLoadingUserNames(false);
    }
  };

  const getUserByAgency = async agencyId => {
    try {
      setLoadingUserNames(true);
      const response = await apiClient.get(
        `${BASE_URL}getUserByAgency/${agencyId}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const userData = response.data.data;
      const filteredUserData = userData.filter(
        user => user.userType === 'U103',
      );
      const formattedUserData = filteredUserData.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
      }));

      setUserList(formattedUserData); // Update state with user data
    } catch (error) {

    } finally {
      setLoadingUserNames(false);
    }
  };

  const getUserByAgencyForAll = async agencyIds => {
    try {
      setLoadingUserNames(true);
      const agencyIdsString = agencyIds.join(',');
      const response = await apiClient.get(
        `${BASE_URL}getAllUserByAgencyId/${agencyIdsString}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const userData = response.data.data;
      const filteredUserData = userData.filter(
        user => user.userType === 'U103',
      );

      // Map user data including roleCode and roleName
      const formattedUserData = filteredUserData.map(user => {
        // Assuming you want to get the first role if there are multiple
        const role = user.role[0] || {}; // Take the first role or an empty object if none exist

        return {
          fullName: `${user.firstName} ${user.lastName}`,
          userId: user.userId,
          reportingManager: user.reportingManager,
          userName: user.userName,
          roleCode: role.roleCode, // Extract roleCode
          roleName: role.roleName, // Extract roleName
        };
      });


      setuserListForALL(formattedUserData); // Update state with user data
    } catch (error) {

    } finally {
      setLoadingUserNames(false);
    }
  };

  useEffect(() => {
    if (selectedAgency?.value) {
      getUserByAgency(selectedAgency.value);
    }
  }, [selectedAgency]);

  useEffect(() => {
    getUserByUserType();
    getAgency();
    // getAllAgency();
    // getUserByAgencyForAll();
  }, []);

  // useEffect(() => {
  //   getUserByAgencyForAll();
  // }, [getAgency()]);

  const fetchUserByFilter = () => {
    let payload = null;

    // Check if any of the filters have values
    if (cityIds || stateIds || portfolioIds || userTypeIds) {
      payload = {
        cityIds: cityIds || selectedCity ? [cityIds || selectedCity] : [],
        stateIds: stateIds || selectedState ? [stateIds || selectedState] : [],
        portfolioIds:
          portfolioIds || selectedPortfolio
            ? [portfolioIds || selectedPortfolio]
            : [],
        activity: [],
        productIds: [],
        regionIds: [],
        zoneIds: [],
        agencyIds: [],
        productIds: [],
        regionIds: [],
        userIds: [],
        userType: userTypeIds || selecteduserType ? [userTypeIds || selecteduserType] : [],
      };
    }
    apiClient
      .post(
        `${BASE_URL}getUserByFilter/${userProfile?.userId}`,
        payload, // Sending null as the request body
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(response => {
        const res = response?.data?.data;
        const MaksadJanab = res.filter(user => user.userType === 'U101');

        const userNamesList = MaksadJanab.map(user => ({
          label: user.fullName,
          userType: user.userType,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          reportingAuthority: user.reportingAuthority,
          status: user.status,
        }));


        setInternalUsers(userNamesList);

        const onlineUsers = response.data.data.filter(
          user => user.status === 'Online',
        );

        const onlineUsersId = onlineUsers.map(user => user.userId);
        setUserFilter(onlineUsers);
        setonlineuserId(onlineUsersId);

        const InternalUsers = onlineUsers.filter(
          user => user.userType === 'U101',
        );

        const ExternalUsers = onlineUsers.filter(
          user => user.userType === 'U103',
        );
        setOnlineExternalUsers(ExternalUsers);
        setOnlineInternalUsers(InternalUsers);



        setexternalUserList(ExternalUsers);



      })
      .catch(error => {

      });
  };

  const mapDataByUserId = async () => {
    // const formattedDate = formatDate(date);
    // const formattedStartTime = formatTime(startTime);
    // const formattedEndTime = formatTime(endTime);

    // 
    const payload = {
      userIds: onlineUsersUserId,
      date: formatDate(new Date()),
      fromTime: '03-00',
      toTime: '22-00',
    };
    try {
      const response = await apiClient.post(`${BASE_URL}mapDataByUserId`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      setMapByUserId(response?.data?.data?.tracker);
      const trackerArray = response?.data?.data?.tracker;

    } catch (error) {
      console.error(
        'mapDataByUserId Error:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  useEffect(() => {
    if (onlineUsersUserId) {
      mapDataByUserId(); // Call fetch function only if UserId is not empty
    }
  }, []);

  useEffect(() => {
    fetchUserByFilter();
  }, [userProfile?.userId, token]);

  const isActivityMatching = userId => {
    if (!drpValues1.label) {
      return true; // All cards should be enabled when label is empty
    }
    const userActivities = MapByUserId.filter(
      item => item.userId === userId,
    ).map(item => item.activity);
    return userActivities.includes(drpValues1.label);
  };

  const handleCardPress = user => {
    navigation.navigate('OnlineSelectedUserdetailsMap', {
      user,
      selectedActivity: drpValues1.label, // Pass the selected dropdown value
      date: date,
      startTimeM21: fromTime,
      endTimeM22: toTime,
    });
  };

  const refreshpage = () => {
    fetchUserByFilter();
    if (onlineUsersUserId) {
      mapDataByUserId(); // Call fetch function only if UserId is not empty
    }
    setMessageVisible(true);
    setdrpValues1('');
    setSelectedUserType('');
    setSelectedAgency('');
    setSelectedUser('');
    setSelectedUserName('');
    setSelectedInternalUserId('');
    setTimeout(() => {
      setMessageVisible(false);
    }, 1000);
  };
  // Filter users whose status is "Online"
  // const onlineUsers = userFilter.filter(user => user.status === 'Online');
  const [filtersVisible, setFiltersVisible] = useState(false);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  // const usersToDisplay = selectedInternalUserId
  //   ? userFilter.filter(user => user.userId === selectedInternalUserId)
  //   : userFilter;

  const OnlineInternalUsersJKJ = selectedInternalUserId
    ? OnlineInternalUsers.filter(user => user.userId === selectedInternalUserId)
    : OnlineInternalUsers;

  const OnlineExternalUsersJKJ = selectedExternalUserId
    ? OnlineExternalUsers.filter(user => user.userId === selectedExternalUserId)
    : OnlineExternalUsers;

  const isUserInAgencyUserStatus = userId => {
    // Find if the userId exists and has activityType 'Login'
    const user = AgencyUserStatus.find(user => user.userId === userId);
    return user && user.activityType === 'Login';
  };



  const usersToDisplay = useMemo(() => {
    if (selectedUserType?.value === 'usertype2') {
      return OnlineExternalUsersJKJ;
    } else if (selectedUserType?.value === 'usertype1') {
      return OnlineInternalUsersJKJ;
    } else {
      return filteredUsers;
    }
  }, [
    selectedUserType,
    OnlineExternalUsersJKJ,
    OnlineInternalUsersJKJ,
    filteredUsers,
  ]);

  const renderItem = ({ item }) => (
    <CustomCard
      user={item}
      onPress={() => handleCardPress(item)}
      disabled={!isActivityMatching(item.userId)}
      cardColor={isActivityMatching(item.userId) ? '#fff' : '#d3d3d3'}
    />
  );

  // Conditionally render only if Roles array is not empty
  if (Roles.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>Loading roles, please wait...</Text>
      </View>
    );
  }


  const filteredUsersToDisplayForLoginTime = usersToDisplay.filter(user => user.loginTime !== 'N/A');


  const roleNames = Roles.map(role => role.roleCode);


  // Define the roles that should always be shown
  const rolesToAlwaysShow = ['AGENCY ADMIN', 'AGENCY AGENT', 'AGENCY TL'];

  // Filter usersToDisplay based on the roles logic
  const filteredUsersToDisplayForRole = usersToDisplay.filter(user => {
    // Check if the user's role is one of the roles that should always be shown
    if (rolesToAlwaysShow.includes(user.role)) {
      return true;
    }

    return roleNames.includes(user.role);
  });





  return (
    <SafeAreaView style={{ flex: 1 }}>

      {/* HEADER – fixed (non-scroll) */}
      <View style={styles.header}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
            <Image style={styles.iconSmall} source={require('../../../../asset/TrueBoardIcon/filter.png')} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={refreshpage} style={styles.refreshButton}>
            <Image style={styles.icon} source={require('../../../../asset/icon/refresh.png')} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {messageVisible && (
        <View style={{ padding: 10, backgroundColor: 'green' }}>
          <Text style={{ color: '#fff' }}>Page is refreshed</Text>
        </View>
      )}

      {/* 🔥 MAIN SCROLL CONTAINER */}
      <FlatList
        data={filteredUsersToDisplayForRole}
        keyExtractor={item => item.userId.toString()}
        renderItem={renderItem}

        ListHeaderComponent={
          <>
            {filtersVisible && (
              <View style={styles.filterOptionsContainer}>

                <View style={styles.filterOptions}>
                  <View style={{ flexDirection: 'row' }}>
                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      itemTextStyle={styles.itemTextStyle}
                      data={SelectActivity} // Use SelectActivity here
                      labelField="label"
                      valueField="value"
                      placeholder={'Select Activity'}
                      value={drpValues1.value}
                      onChange={item => {
                        setdrpValues1(item);
                      }}
                    />
                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      itemTextStyle={styles.itemTextStyle}
                      data={userTypeData}
                      labelField="label"
                      valueField="value"
                      placeholder={'Select User Type'}
                      value={selectedUserType}
                      onChange={item => {
                        setSelectedUserType(item);
                        setSelectedUserName(null);
                        setSelectedAgency(null);
                      }}
                    />
                  </View>

                  <View style={{ flexDirection: 'row' }}>
                    {loadingUserNames ? (
                      <BallIndicator color="black" />
                    ) : (
                      <>
                        {selectedUserType &&
                          selectedUserType.value === 'usertype1' && (
                            <Dropdown
                              style={styles.dropdown}
                              placeholderStyle={styles.placeholderStyle}
                              selectedTextStyle={styles.selectedTextStyle}
                              inputSearchStyle={styles.inputSearchStyle}
                              itemTextStyle={styles.itemTextStyle}
                              data={internalUsers} // Ensure this array is correct
                              labelField="label" // Label to display in the dropdown
                              valueField="value" // Value that should match `selectedUserName`
                              placeholder={'Select InternalUser'}
                              value={selectedUserName || null} // Ensure the dropdown starts with no selection
                              onChange={item => {
                                // Debug to ensure `item` structure
                                setSelectedUserName(item.value); // Set value instead of whole object
                                setSelectedInternalUserId(item.userId); // Ensure `userId` exists in `item`
                              }}
                              search
                            />
                          )}

                        {selectedUserType &&
                          selectedUserType.value === 'usertype2' && (
                            <Dropdown
                              style={styles.dropdown}
                              placeholderStyle={styles.placeholderStyle}
                              selectedTextStyle={styles.selectedTextStyle}
                              inputSearchStyle={styles.inputSearchStyle}
                              itemTextStyle={styles.itemTextStyle}
                              data={externalUsers}
                              labelField="label"
                              valueField="value"
                              placeholder={'Select Agency'}
                              value={selectedAgency}
                              onChange={item => {
                                setSelectedAgency(item);
                              }}
                              search
                            />
                          )}
                        {selectedAgency && userList.length > 0 && (
                          <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.itemTextStyle}
                            data={userList}
                            labelField="fullName" // Use fullName for display
                            valueField="id" // Assuming each user has a unique ID
                            placeholder={'Select User'}
                            value={selectedUser?.id || ''} // Ensure value matches valueField
                            onChange={item => {

                              setSelectedUser(item); // Update state with selected item
                              setSelectedExternalUserId(item.userId);
                            }}
                            search
                          />
                        )}
                      </>
                    )}
                  </View>
                </View>

              </View>
            )}

            {!selectedUserType && (
              <TextInput
                style={styles.searchBox}
                placeholder="Search by name"
                placeholderTextColor="black"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            )}
          </>
        }

        ListEmptyComponent={
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {selectedUserType?.value === 'usertype2'
                ? 'No Agency User Online'
                : selectedUserType?.value === 'usertype1'
                  ? 'No Online Internal Users'
                  : 'No Users Online'}
            </Text>
          </View>
        }

        /* 🔥 PERFORMANCE TUNING */
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />

    </SafeAreaView>
  );



};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',

    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: 'black',
    borderBottomWidth: 0.5,
  },
  menuButton: {
    width: 50,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
    marginLeft: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'black',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: 'black',
  },
  noUsersText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: 'black',
  },

  filterOptionsContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  filterOptions: {
    width: width * 0.9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  filterfirstrow: {
    width: width * 0.25,
    height: height * 0.07,
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
  },
  filterfirstrowusertype: {
    width: width * 0.25,
    height: height * 0.07,
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
  },
  dropdown: {
    flex: 1,
    width: width * 0.3,
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    margin: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },
  placeholderStyle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'black',
  },
  selectedTextStyle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'black',
  },
  inputSearchStyle: {
    color: 'black',
  },
  placeholderStyle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'black',
  },
  selectedTextStyle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'black',
  },
  inputSearchStyle: {
    color: 'black',
  },
  itemTextStyle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'black',
  },
  searchStyle: {
    backgroundColor: '#001D56',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  disabledCard: {
    backgroundColor: '#d3d3d3', // Example color for disabled card
    opacity: 0.5, // Make card semi-transparent to indicate it's disabled
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF', // Adjust as needed
  },
  menuButton: {
    padding: 5,
  },
  icon: {
    height: 16,
    width: 16,
  },
  iconSmall: {
    height: 12,
    width: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Adjust as needed
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#001D56',
    marginRight: 10,
  },
  filterText: {
    color: '#FFFFFF',
    marginLeft: 5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001D56',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshText: {
    color: '#FFFFFF',
    marginLeft: 5,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    // marginLeft: 10,
    // textAlign: 'center',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    color: '#555',
  },
  switchContainer: {
    flexDirection: 'row',
    marginBottom: 20, // Added space below the switch
    marginTop: 20, // Added space above the switch
    // backgroundColor: 'red',
  },
  switchButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5, // Space between switch buttons
  },
  switchText: {
    fontSize: 16,
  },
  active: {
    backgroundColor: '#007BFF',
    color: '#fff',
  },
  inactive: {
    backgroundColor: '#ccc',
    color: '#000',
  },

  searchBox: {
    height: height * 0.05,
    borderColor: 'black',
    borderRadius: 5,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    color: '#000', // Set text color to black or any contrasting color
    fontSize: 16, // Ensure the font size is readable
  },
});

export default OnlineUserList;
