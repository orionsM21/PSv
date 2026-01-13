import React, { useState, useCallback, useEffect, useMemo, useRef, useContext } from 'react';
import {
  View,
  Platform,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  FlatList,
  BackHandler,
  Alert,
  StatusBar,
} from 'react-native';
import MapView, { Marker, Callout, LatLng } from 'react-native-maps';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useDispatch, useSelector } from 'react-redux';
import Geolocation from '@react-native-community/geolocation';

import axios from 'axios';

import debounce from 'lodash/debounce';
import { useNavigation, user } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { BallIndicator } from 'react-native-indicators'; // Adjust import path if necessary
import { black, theme } from '../../utility/Theme';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import UltraDateTimeInput from "../Payment/Component/DateTimeInput";
// import { theme } from '../utility/Theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
// import { DrawerContext } from '../../DrawerContext';
import apiClient from '../../../../common/hooks/apiClient';
import { DrawerContext } from '../../../../Drawer/DrawerContext';
import { BASE_URL } from '../../service/api';

// import {
//   saveSearchDetail,
//   saveSelectedPortfolio,
//   saveSelectedState,
//   saveSelectedCity,
//   saveSelectedusertype
// } from '../redux/action';
// import { SAVE_SELECTED_USERTYPE } from '../redux/Actions/ActionTypes';
// import { useNavigation } from '@react-navigation/native';

// console.log(saveSearchParams, 'saveSearchParams')

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyA-qydLv54Exn34c4gPxzhPvbKRogjWQJA';
const GOOGLE_MAPS_APIK_WorkingFordistance_direction = 'AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE';


// ---------- Simple debounce hook ----------
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------- Memoized MarkerItem (keeps marker rendering cheap) ----------
const MarkerItem = React.memo(function MarkerItem({ coord, color, onPress, fullName }) {
  const handlePress = useCallback(() => {
    onPress(coord.latitude, coord.longitude);
  }, [coord.latitude, coord.longitude, onPress]);

  return (
    <Marker
      coordinate={{ latitude: coord.latitude, longitude: coord.longitude }}
      onPress={handlePress}
      pinColor={color}
      key={`${coord.userId || coord.latitude}_${coord.longitude}`}
    >
      <Callout>
        <View style={styles.callout}>
          {fullName ? <Text style={styles.calloutText}>Full Name: {fullName}</Text> : null}
          <Text style={styles.calloutText}>Latitude: {coord.latitude}</Text>
          <Text style={styles.calloutText}>Longitude: {coord.longitude}</Text>
        </View>
      </Callout>
    </Marker>
  );
});

// ---------- Memoized List Item ----------
const ListItem = React.memo(({ item }) => (
  <View style={styles.listItem}>
    <Text style={styles.itemTitle}>{item.title ?? item.userId}</Text>
    <Text style={styles.itemSub}>{item.sub ?? item.time}</Text>
  </View>
));

const DateTimePickerExample = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  // const reduxData = useSelector(state => state.auth);
  const reduxData = useSelector(state => state.auth || {});
  const token = reduxData.token;
  const userProfile = reduxData.userProfile || {};
  const [usergetdatafilter, setUsergetdatafilter] = useState([]);
  const [countfilter, setcountFilter] = useState(null);
  const [date, setDate] = useState(new Date());
console.log(countfilter, 'countfiltercountfilter')
  // Set startTime to 8:00 AM
  const startTimeInitial = new Date();
  startTimeInitial.setHours(8, 0, 0, 0); // Set time to 08:00:00

  const [startTime, setStartTime] = useState(startTimeInitial);
  const { isDrawerVisible, openDrawer, closeDrawer } = useContext(DrawerContext);
  // Set endTime to the current time
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [curlat, setCurLat] = useState();
  const [curLong, setCurLong] = useState();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [loadingUserType, setLoadingUserType] = useState(false);
  const [loadingUserNames, setLoadingUserNames] = useState(false);

  const [dropdownPressed, setDropdownPressed] = useState(false);
  const mapRef = useRef(null);
  const [internalUsers, setInternalUsers] = useState([]);
  // console.log(internalUsers, 'internalUsers');
  const [externalUsers, setExternalUsers] = useState([]);
  // console.log(externalUsers, 'externalUsers');
  const [userNames, setUserNames] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [agencyData, setAgencyData] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [SendingselectedActivity, setSendingselectedActivity] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const roleCode = useSelector(state => state.auth.roleCode);

  const [hasSearched, setHasSearched] = useState(false);

  // const [selectedAgency, setSelectedAgency] = useState(null);

  const userTypeData = [
    { label: 'Internal', value: 'usertype1' },
    { label: 'External', value: 'usertype2' },
  ];

  const stateOptions = [
    { label: 'Internal', value: 'U101' },
    { label: 'External', value: 'U103' }
  ];

  // const agencyData = [
  //   {label: 'Agency 1', value: 'agency1'},
  //   {label: 'Agency 2', value: 'agency2'},
  // ];
  const SelectActivity = [
    { label: 'ScheduleVisit', value: 'Role1' },
    { label: 'PTP', value: 'Role2' },
    { label: 'Payment', value: 'Role3' },
    { label: 'Dispute', value: 'Role4' },
    { label: 'RaiseException', value: 'Role5' },
    { label: 'Request', value: 'Role6' },
  ];

  const userName = [
    { label: 'userName1', value: 'userName1' },
    { label: 'userName2', value: 'userName2' },
  ];

  const [City, setCity] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null); // State to store selected city
  const [State, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null); // State to store selected city
  const [usertype, setUsertype] = useState([])
  const [selectedusertype, setSelectedusertype] = useState(null)
  const [Portfolio, setPortfolio] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null); // State to store selected Portfolio
  const [UserType, setUserType] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState(null);
  // const [selectedUserName, setSelectedUserName] = useState(null);

  // const [selectedAgency, setSelectedAgency] = useState(null);
  const [years, setYears] = useState([]);
  const [drpValues1, setdrpValues1] = useState();
  const [MapByUserId, setMapByUserId] = useState();
  const [id, setid] = useState([]);
  // console.log(id, 'M21');
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [liveLocationData, setLiveLocationData] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [trackerId, setTrackerId] = useState(null);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [apiError, setApiError] = useState(false);
  const [apiNotHit, setApiNotHit] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showLoaderclear, setShowLoaderclear] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [payloadtestid, setPayloadtestid] = useState(false);
  const [onlineUsersUserId, setonlineUsersUserId] = useState([]);
  // console.log(onlineUsersUserId, 'setOnlineUsersUser')

  const [offlineUsersUserId, setOfflineUsersUserId] = useState([]);

  const [LoginActivities, setLoginActivities] = useState([]);
  const [loginUserData, setLoginUserData] = useState([]);
  const [LogoutActivities, setLogoutActivities] = useState([]);

  const [loginCoordinates, setLoginCoordinates] = useState([]);
  const [logoutCoordinates, setLogoutCoordinates] = useState([]);

  // console.log(loginCoordinates, 'CXCX');
  // console.log(loginCoordinates, 'MNMBNJUH');

  const [mapRegion, setMapRegion] = useState(null);
  console.log(mapRegion, 'CXCX');

  const [FilteredLoginCoordinates, setFilteredLoginCoordinates] = useState([]);
  const [FilteredLogoutCoordinates, setFilteredLogoutCoordinates] = useState(
    [],
  );

  // console.log(FilteredLoginCoordinates, 'MNMB');
  // console.log(FilteredLogoutCoordinates, 'ONB');

  const [onlineuser, setonlineuser] = useState([]);
  const [offlineuser, setofflineuser] = useState([]);

  const [showLogins, setShowLogins] = useState(true);
  const [showLogouts, setShowLogouts] = useState(true);

  const filteredLoginCoordinates = FilteredLoginCoordinates;
  const filteredLogoutCoordinates = FilteredLogoutCoordinates;

  console.log(filteredLoginCoordinates, 'logged in');
  // console.log(filteredLogoutCoordinates, 'logged out');
  // console.log(loginCoordinates, 'loggedinCoord');
  // console.log(logoutCoordinates, 'loggedoutCoord');

  const [userList, setUserList] = useState([]); // State for storing user data
  const [userListForALL, setuserListForALL] = useState([]); // State for storing user data

  const [latestActivities, setLatestActivities] = useState([]);
  const [LogOutActivities, setLogOutActivities] = useState([]);
  const [LogInActivities, setLogInActivities] = useState([]);
  const [searchPressed, setSearchPressed] = useState(false);
  const [userIdsW, setUserIdsW] = useState([]);
  const [agencyIds, setAgencyIds] = useState([]); // State to store selected agencyId
  const [loading, setLoading] = useState(true);
  let eventSource = null; // Declare eventSource variable outside useEffect

  function handleBackButtonClick() {
    navigation.goBack();
    return true;
  }


  const [rolesWithStatusY, setRolesWithStatusY] = useState([]);
  const [TrackerAdminConfig, setTrackerAdminConfig] = useState([]);
  const [AgencyTrackingConfigs, setAgencyTrackingConfigs] = useState([]);
  const [showTrackingAccess, setShowTrackingAccess] = useState(true);

  // const navigation = useNavigation(); // Use navigation hook
  // console.log('NBCX', AgencyTrackingConfigs, rolesWithStatusY);


  // Center map on user's location on mount

  const getCurrentLocationonetime = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        // console.log('Current location:', latitude, longitude);

        const locationData = `${latitude},${longitude}`;
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
        // successSound.play(); // Play success sound
      },
      error => {
        console.error('Error getting locationLiveTracking.js:', error.message);
        // Retry fetching location after a delay
        setTimeout(getCurrentLocationonetime, 1000); // Retry after 1 second (adjust as needed)
      },
    );
  };

  useEffect(() => {
    getCurrentLocationonetime();
  }, []);

  // Fit to markers when they change
  useEffect(() => {
    const allCoords = [...filteredLoginCoordinates, ...filteredLogoutCoordinates]
      .filter(coord => coord.latitude && coord.longitude)
      .map(coord => ({ latitude: coord.latitude, longitude: coord.longitude }));

    if (mapRef.current && allCoords.length > 0) {
      mapRef.current.fitToCoordinates(allCoords, {
        edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
        animated: true,
      });
    }
  }, [filteredLoginCoordinates, filteredLogoutCoordinates]);

  useEffect(() => {
    // Calculate bounds
    if (loginCoordinates.length > 0 || logoutCoordinates.length > 0) {
      const allCoordinates = [...loginCoordinates, ...logoutCoordinates];
      const latitudes = allCoordinates.map(coord => coord.latitude);
      const longitudes = allCoordinates.map(coord => coord.longitude);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      // Calculate the center and delta values
      const latitudeDelta = maxLat - minLat;
      const longitudeDelta = maxLng - minLng;
      const centerLatitude = (maxLat + minLat) / 2;
      const centerLongitude = (maxLng + minLng) / 2;

      setMapRegion({
        latitude: centerLatitude,
        longitude: centerLongitude,
        latitudeDelta: latitudeDelta + 0.1, // Add padding
        longitudeDelta: longitudeDelta + 0.1, // Add padding
      });
    }
  }, [loginCoordinates, logoutCoordinates]);

  // Handle marker press to center map
  const handleMarkerPress = (latitude, longitude) => {
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  // Reusable Marker renderer
  const renderMarkers = (coordinates, pinColor, type) =>
    coordinates.map((coord, index) => {
      const fullName = onlineUserMap.get(coord.userId);
      return (
        <Marker
          key={`${type}_${index}`}
          coordinate={{ latitude: coord.latitude, longitude: coord.longitude }}
          onPress={() => handleMarkerPress(coord.latitude, coord.longitude)}
          pinColor={pinColor}
        >
          <Callout>
            <View>
              {fullName && <Text style={{ color: 'black' }}>Full Name: {fullName}</Text>}
              <Text style={{ color: 'black' }}>Latitude: {coord.latitude}</Text>
              <Text style={{ color: 'black' }}>Longitude: {coord.longitude}</Text>
              <Text style={{ color: 'black' }}>Time: {formatTimeTo12Hour(coord.time)}</Text>
            </View>
          </Callout>
        </Marker>
      );
    });



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
        // console.log('trackerAdminConfig', response.data);

        const responseData = response.data.response;
        // console.log('responseData', responseData);

        if (Array.isArray(responseData) && responseData.length > 0) {
          const firstItem = responseData[0];
          // console.log(firstItem.agencyTrackingConfigs, 'firstItem');
          setTrackerAdminConfig(firstItem);
          setRoles(firstItem.roles);
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
        console.log('getTrackerAdminConfig', error);
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
        // console.log('trackerAdminConfig', response.data);

        // Ensure responseData is correctly assigned
        const responseData = response.data.response;
        // console.log('responseData', responseData);

        // Check if responseData is an array and contains at least one item
        if (Array.isArray(responseData) && responseData.length > 0) {
          const firstItem = responseData[0];
          // console.log(
          //   firstItem.agencyTrackingConfigs,

          //   'firstItem',
          // );
          setTrackerAdminConfig(firstItem); // Update state with the first item

          // Extract and set roles and agencyTrackingConfigs
          setRoles(firstItem.roles);
          setAgencyTrackingConfigs(firstItem.agencyTrackingConfigs);
          // Process and filter roles
          processRoles(firstItem.agencyTrackingConfigs);

        }
      })
      .catch(error => {
        console.log('getTrackerAdminConfig', error);
      });
  };

  const processRoles = (configs) => {
    // Array to store roles with status 'Y'
    const filteredRoles = [];

    configs.forEach(config => {
      const roleStatusArray = JSON.parse(config.agencyTrackingRoleStatus);

      roleStatusArray.forEach(role => {
        if (role.status === 'Y') {
          // Push roleCode and agencyName into the filteredRoles array
          filteredRoles.push({
            roleCode: role.roleCode,
            agencyName: config.agencyName
          });
        }
      });
    });

    // Update state with the filtered roles
    setRolesWithStatusY(filteredRoles);
  };


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

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, []);

  const generateYears = () => {
    let currentYear = new Date().getFullYear();
    const yearsArray = [];
    for (currentYear; currentYear >= 2000; currentYear--) {
      yearsArray.push({ label: currentYear.toString(), value: currentYear });
    }
    return yearsArray;
  };

  useState(() => {
    const yearsData = generateYears();
    setYears(yearsData);
  }, []);

  useEffect(() => {
    getUserByUserType();
    getAgency();
  }, []);

  const getStates = async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}getAllStates`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      const res = response.data.data;
      // Extract state names and transform data for the dropdown
      const stateNames = res.map(state => ({
        label: state.stateName,
        value: state.stateId,
      }));
      setStates(stateNames);
      // console.log('State Names:', stateNames);
    } catch (error) {
      console.log('getDashBoardData:', error);
    }
  };

  const getCities = async stateId => {
    try {
      const response = await apiClient.get(
        `${BASE_URL}getCityByState/${stateId}/0/0`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const res = response.data.response;

      const cityNames = res.map(city => ({
        label: city.cityName,
        value: city.cityId,
      }));

      setCity(cityNames);
      // console.log('City Names:', cityNames);
    } catch (error) {
      console.log('getCities:', error);
    }
  };

  const getPortfolio = async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}getAllPortfolio`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      const res = response.data.data;

      // Extract portfolio descriptions and transform data for the dropdown
      const portfolioData = res.map(portfolio => ({
        label: portfolio.portfolioDescription,
        value: portfolio.portfolioId,
      }));

      setPortfolio(portfolioData);
      // console.log('Portfolio:', portfolioData);
    } catch (error) {
      console.log('Portfolio:', error);
    }
  };

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
      // console.log(res, 'User DataEEW');

      const userNamesList = res.map(user => ({
        label: `${user.firstName} ${user.lastName}`,
        userType: user.userType,
        userId: user.userId,
      }));

      // const internalUserList = userNamesList.filter(
      //   user => user.userType === 'U101',
      // );
      // const externalUserList = userNamesList.filter(
      //   user => user.userType === 'Agency',
      // );
      // console.log(externalUserList, 'ExternalUser');

      setInternalUsers(userNamesList);
      // setExternalUsers(externalUserList);
    } catch (error) {
      console.log('getUserByUserType:', error);
    } finally {
      setLoadingUserNames(false);
    }
  };

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
      // console.log(res, 'json response');
      const agencyOptions = res.map(agency => ({
        label: agency.agencyName, // Displayed text in the dropdown ppassword00#
        value: agency.agencyId, // Value associated with the option
        // managedBy: agency.managedBy
      }));
      // const filteredAgencies = agencyOptions.filter(
      //   agency => agency.managedBy === userProfile?.userId
      // );
      // console.log(agencyOptions, 'ExternalUser');
      // console.log(userProfile?.userId, 'YYYY');
      setExternalUsers(agencyOptions);
    } catch (error) {
      console.log('getAgency:', error);
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
      // console.log(userData, 'User Data by Agency');
      setUserList(formattedUserData); // Update state with user data
    } catch (error) {
      console.log('getUserByAgency:', error);
    } finally {
      setLoadingUserNames(false);
    }
  };

  useEffect(() => {
    if (selectedAgency?.value) {
      getUserByAgency(selectedAgency.value);
    }
  }, [selectedAgency]);

  const handleStateChange = item => {
    setSelectedState(item.value);
    // Call getCities only if a state is selected
    // if (item.value) {
    //   getCities(item.value);
    // }
    // dispatch(saveSelectedState(item.value));
  };

  const handleUserTypeChange = item => {
    setSelectedusertype(item.value); // Update selected value
    // dispatch(saveSelectedusertype(item.value))
  };

  const handleCityChange = item => {
    setSelectedCity(item.value); // Update selected city in state
    // Additional logic if needed
    // dispatch(saveSelectedCity(item.value));
  };

  const handlePortfolioChange = item => {
    setSelectedPortfolio(item.value); // Update selected portfolio in state
    // Additional logic if needed
    // dispatch(saveSelectedPortfolio(item.value));
  };

  const getPlaceName = useCallback(
    debounce(async (lat, lon) => {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_APIK_WorkingFordistance_direction}`,
        );
        const addressComponents = response.data.results[0].address_components;
        const placeName =
          addressComponents.find(component =>
            component.types.includes('premise'),
          )?.long_name ||
          addressComponents.find(component =>
            component.types.includes('sublocality_level_1'),
          )?.long_name ||
          addressComponents.find(component =>
            component.types.includes('neighborhood'),
          )?.long_name ||
          response.data.results[0].formatted_address;

        setSelectedPlace({ name: placeName, latitude: lat, longitude: lon });
      } catch (error) {
        console.log('Error fetching place name:', error);
      }
    }, 1000),
    [],
  );

  // Zoom In and Zoom Out handlers

  useEffect(() => {
    // Call getStates to populate the state dropdown
    getStates();

    // Call other functions that need to be executed on component mount

    fetchUserByFilter();

    getDashBoardData();
    fetchCurrentLocation();
    // if (id) {
    //   mapDataByUserId();
    // }
    // mapDataByUserId();
    getCurrentLocation();
    getPortfolio();
    getUserTypeData();

    // fetchUserByFilterfirstTimeCall();

    getAgencyForAll();
    //  getAlluserType();
    // getUserByUserType();
  }, []); // Empty dependency array ensures this runs only once on component mount

  useEffect(() => {
    if (selectedUserType) {
      getUserByUserType();
    } else {
      setUserNames([]);
    }
  }, [selectedUserType]);

  useEffect(() => {
    // Call getCities only when selectedState changes and has a value
    if (selectedState) {
      getCities(selectedState);
    }
  }, [selectedState]); // Dependency array ensures this runs when selectedState changes


  const refreshpage = () => {
    // getdata();
    getDashBoardData();
    if (id && userIdsW) {
      mapDataByUserId();
    }
    fetchCurrentLocation();
    if (loginCoordinates.length > 0) {
      fetchUserByFilterfirstTimeCall();
    }

    fetchUserByFilter();
    setDate(new Date());
    setStartTime(new Date(new Date().getTime() - 60 * 60 * 1000));
    setEndTime(new Date());
    getStates();
    handleClear();
    getUserTypeData();

    setMessageVisible(true);
    setTimeout(() => {
      setMessageVisible(false);
    }, 1000);
  };

  const fetchCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        getPlaceName(latitude, longitude);
      },
      error => {
        console.error('Error getting locationLiveTracking.js: 1:', error.message);
        // Retry fetching location after a delay
        setTimeout(() => fetchCurrentLocation(), 1000);
      },
    );
  };

  useEffect(() => {
    // Only call fetchUserByFilterfirstTimeCall when loginCoordinates has been updated and is not empty
    if (loginCoordinates.length > 0) fetchUserByFilterfirstTimeCall();
  }, [loginCoordinates, logoutCoordinates]); // This effect will run when `loginCoordinates` changes

  const fetchUserByFilterfirstTimeCall = async () => {
    try {
      let requestBody = {
        cityIds: selectedCity ? [selectedCity] : [],
        portfolioIds: selectedPortfolio ? [selectedPortfolio] : [],
        stateIds: selectedState ? [selectedState] : [],
        activity: drpValues1 ? [drpValues1] : [],
        productIds: [],
        regionIds: [],
        zoneIds: [],
        agencyIds: [],
        userIds: [],
        agencyIds: [],
        userType: selectedusertype ? [selectedusertype] : [],
        agencyIds: [],
      };

      // Check if any of the fields have data, otherwise set requestBody to "null"
      const hasData = Object.values(requestBody).some(
        value => value.length > 0,
      );

      if (!hasData) {
        requestBody = 'null'; // Set requestBody to "null" if all fields are empty
      }

      const response = await apiClient.post(
        `${BASE_URL}getUserByFilter/${userProfile?.userId}`,
        requestBody,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const onlineUsersF = response.data.data.filter(
        user => user.status === 'Online',
      );

      const filteredLoginCoordinates = loginCoordinates.filter(coord =>
        onlineUsersF.some(user => user.userId === coord.userId),
      );
      // console.log(loginCoordinates, 'JGFDLGI');
      console.log(filteredLoginCoordinates, 'MNMHLGI');
      // console.log(onlineUsersF, 'YTLGI');

      // Store the filtered coordinates in a new state
      setFilteredLoginCoordinates(filteredLoginCoordinates);

      const onlineUsers = response.data.data;
      setonlineuser(onlineUsers);

      // console.log(onlineUsers, 'Online users');
      const onlineUsersUserId = onlineUsers.map(user => user.userId);
      setonlineUsersUserId(onlineUsersUserId);

      const offlineUsers = response.data.data.filter(
        user => user.status === 'Offline',
      );
      // setofflineuser(offlineUsers);

      const filteredLogoutCoordinates = logoutCoordinates.filter(coord =>
        offlineUsers.some(user => user.userId === coord.userId),
      );
      // console.log(logoutCoordinates, 'JGFDLGO');
      // console.log(filteredLogoutCoordinates, 'MNMHLGO');
      // console.log(offlineUsers, 'JUy');

      setFilteredLogoutCoordinates(filteredLogoutCoordinates);

      const offlineUsersUserId = offlineUsers.map(user => user.userId);
      setOfflineUsersUserId(offlineUsersUserId);


    } catch (error) {
      console.log('fetchUserByFilter:', error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };

  const getDashBoardData = async () => {
    try {
      let requestBody = null;
      const response = await apiClient.post(
        `${BASE_URL}getLiveTrackerDashboard/${userProfile?.userId}`,
        requestBody,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      setcountFilter(response.data.data);
      // console.log('getDashBoardData:', response.data.data);
    } catch (error) {
      console.log('getDashBoardData:', error);
    }
  };

  const getDashBoardDataFilter = async () => {
    try {
      let requestBody = null;

      const formattedDate = formatDate(date);
      const formattedStartTime = formatTime(startTime);
      const formattedEndTime = formatTime(endTime);

      requestBody = {
        cityIds: selectedCity ? [selectedCity] : [],
        portfolioIds: selectedPortfolio ? [selectedPortfolio] : [],
        stateIds: selectedState ? [selectedState] : [],
        userType: selectedusertype ? [selectedusertype] : [],
        agencyIds: selectedAgency ? [selectedAgency] : [],
        activity: drpValues1 ? [drpValues1] : [],
        productIds: [],
        regionIds: [],
        zoneIds: [],
        agencyIds: [],
        userIds: [],

        // date: formattedDate ,
        // fromTime: formattedStartTime,
        // toTime: formattedEndTime,
        // date: '',
        // fromTime: '',
        // toTime: '',
      };
      // }

      const response = await apiClient.post(
        `${BASE_URL}getLiveTrackerDashboard/${userProfile?.userId}`,
        requestBody,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      setcountFilter(response.data.data);
      // console.log('getDashBoardData:', response.data.data);
    } catch (error) {
      console.log('getDashBoardData:', error);
    }
  };

  const fetchUserByFilter = async () => {
    try {
      let requestBody = null;

      const response = await apiClient.post(
        `${BASE_URL}getUserByFilter/${userProfile?.userId}`,
        requestBody,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const ids = response.data.data.map(user => user.userId);
      setid(ids);
      console.log(ids, 'ids');
    } catch (error) {
      console.log('fetchUserByFilter:', error);
    }
  };

  const fetchUserByFilterForFilter = async () => {
    try {
      let requestBody = null;

      const formattedDate = formatDate(date);
      const formattedStartTime = formatTime(startTime);
      const formattedEndTime = formatTime(endTime);

      requestBody = {
        cityIds: selectedCity ? [selectedCity] : [],
        portfolioIds: selectedPortfolio ? [selectedPortfolio] : [],
        stateIds: selectedState ? [selectedState] : [],
        userType: selectedusertype ? [selectedusertype] : [],
        agencyIds: selectedAgency ? [selectedAgency] : [],
        activity: drpValues1 ? [drpValues1] : [],
        productIds: [],
        regionIds: [],
        zoneIds: [],
        agencyIds: [],
        userIds: [],
        // date: formattedDate,
        // fromTime: formattedStartTime,
        // toTime: formattedEndTime,
        // date: '',
        // fromTime: '',
        // toTime: '',
      };

      // Check if any of the fields have data, otherwise set requestBody to null
      const hasData = Object.values(requestBody).some(
        value => value.length > 0 || value !== '',
      );

      if (!hasData) {
        requestBody = null;
      }

      const response = await apiClient.post(
        `${BASE_URL}getUserByFilter/${userProfile?.userId}`,
        requestBody,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const ids = response.data.data.map(user => user.userId);
      setid(ids);
    } catch (error) {
      console.log('fetchUserByFilter:', error);
    }
  };





  const formatDate = date => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(d.getDate()).padStart(2, '0'); // Ensure two digits

    return `${year}-${month}-${day}`;
  };

  const formatTime = time => {
    const d = new Date(time);
    const hours = String(d.getHours()).padStart(2, '0'); // Ensure two digits for hours
    const minutes = String(d.getMinutes()).padStart(2, '0'); // Ensure two digits for minutes

    return `${hours}-${minutes}`;
  };

  const getAgencyForAll = async () => {
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
        // console.log('No Agency found, fetching all agencies.');
        // Call getAllAgency if no agency is found
        await getAllAgency();
      } else {
        const allAgencyIds = res.map(agency => agency.agencyId);
        // console.log(allAgencyIds, 'All Agency IDs');

        // Set the agencyIds state with all agencyIds
        setAgencyIds(allAgencyIds);

        // console.log(res, 'json response');
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
      console.log('getAgency:', error);
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
      // console.log(allAgencyIds, 'All Agency IDs');

      // Set the agencyIds state with all agencyIds
      setAgencyIds(allAgencyIds);

      // console.log(res, 'Filtered json response');

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
      console.log('getAgency:', error);
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
      const formattedUserData = filteredUserData.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
      }));

      const extractedUserIds = formattedUserData.map(user => user.userId);
      setUserIdsW(extractedUserIds); // Update state with userIds

      // console.log(extractedUserIds, 'User Data by Agency');
      setuserListForALL(formattedUserData); // Update state with user data
    } catch (error) {
      console.log('getUserByAgency:', error);
    } finally {
      setLoadingUserNames(false);
    }
  };

  const mapDataByUserId = async () => {
    if (id.length === 0) return; // Avoid calling if id is empty

    const userIds = [...id, ...userIdsW];
    const payload = {
      userIds,
      date: formatDate(new Date()),
      fromTime: '00-00',
      toTime: '24-00',
    };

    try {
      const response = await apiClient.post(`${BASE_URL}mapDataByUserId`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      // const trackerData = response.data.data.tracker;
      const trackerData = Array.isArray(response?.data?.data?.tracker)
        ? response.data.data.tracker
        : [];


      const latestActivityMap = {};

      // Step 2: Iterate through the trackerData to filter and find the latest activity for each userId
      trackerData.forEach(activity => {
        const { userId, activity: activityType, createdTime } = activity;

        // Only consider Login and Logout activities
        if (activityType === 'Login' || activityType === 'Logout') {
          // Initialize user entry if not already present
          if (!latestActivityMap[userId]) {
            latestActivityMap[userId] = { userId, activityType, createdTime };
          } else {
            // Compare createdTime to keep the latest entry
            const existingActivityTime = new Date(
              latestActivityMap[userId].createdTime,
            );
            const newActivityTime = new Date(createdTime);

            if (newActivityTime > existingActivityTime) {
              latestActivityMap[userId] = { userId, activityType, createdTime };
            }
          }
        }
      });

      // Step 3: Convert the dictionary values to an array for state
      const latestActivities = Object.values(latestActivityMap);
      // console.log(latestActivities, 'VVVVVV');

      // Update state with the latest Login and Logout activities
      setLatestActivities(latestActivities);

      // Filter activities
      const loginActivities = trackerData.filter(
        activity => activity.activity === 'Login',
      );
      const logoutActivities = trackerData.filter(
        activity => activity.activity === 'Logout',
      );
      // const uniqueLogOutActivities = logoutActivities.filter((activity, index, self) =>
      //   index === self.findIndex((a) => a.userId === activity.userId)
      // );

      // // Update the state with filtered unique activities
      // setLogOutActivities(uniqueLogOutActivities);
      // setLogInActivities(loginActivities)
      // console.log(logoutActivities, 'NUI');
      // Create maps to store the latest coordinate for each user
      const latestLoginCoordinates = new Map();
      const latestLogoutCoordinates = new Map();

      // Update latest coordinates for login activities
      loginActivities.forEach(activity => {
        const [latitude, longitude] = activity.coordinates
          .split(',')
          .map(Number);
        if (
          !latestLoginCoordinates.has(activity.userId) ||
          new Date(activity.createdTime) >
          new Date(latestLoginCoordinates.get(activity.userId).time)
        ) {
          latestLoginCoordinates.set(activity.userId, {
            latitude,
            longitude,
            time: activity.createdTime,
          });
        }
      });

      // Update latest coordinates for logout activities
      logoutActivities.forEach(activity => {
        const [latitude, longitude] = activity.coordinates
          .split(',')
          .map(Number);
        if (
          !latestLogoutCoordinates.has(activity.userId) ||
          new Date(activity.createdTime) >
          new Date(latestLogoutCoordinates.get(activity.userId).time)
        ) {
          latestLogoutCoordinates.set(activity.userId, {
            latitude,
            longitude,
            time: activity.createdTime,
          });
        }
      });

      // Convert maps to arrays
      const loginCoordinates = Array.from(latestLoginCoordinates.entries()).map(
        ([userId, { latitude, longitude, time }]) => ({
          latitude,
          longitude,
          userId,
          time,
        }),
      );
      const logoutCoordinates = Array.from(
        latestLogoutCoordinates.entries(),
      ).map(([userId, { latitude, longitude, time }]) => ({
        latitude,
        longitude,
        userId,
        time,
      }));

      // Create a map to store the latest coordinates based on matching userId
      const latestCoordinates = new Map();

      // Add latest login coordinates to the map
      loginCoordinates.forEach(coord => {
        latestCoordinates.set(coord.userId, { ...coord, type: 'Login' });
      });

      // Compare and update with latest logout coordinates if userId exists
      logoutCoordinates.forEach(coord => {
        if (latestCoordinates.has(coord.userId)) {
          const existingCoord = latestCoordinates.get(coord.userId);
          if (new Date(coord.time) > new Date(existingCoord.time)) {
            latestCoordinates.set(coord.userId, { ...coord, type: 'Logout' });
          }
        } else {
          latestCoordinates.set(coord.userId, { ...coord, type: 'Logout' });
        }
      });

      // Convert the latestCoordinates map to an array
      const finalCoordinates = Array.from(latestCoordinates.values());

      // Separate login and logout coordinates

      const finalLogoutCoordinates = finalCoordinates.filter(
        coord => coord.type === 'Logout',
      );

      const finalLoginCoordinates = finalCoordinates.filter(
        coord => coord.type === 'Login',
      );

      // Update state

      setLogoutCoordinates(finalLogoutCoordinates);
      setLoginCoordinates(finalLoginCoordinates);

      // console.log('Final Login Coordinates:', finalLoginCoordinates);
      // console.log('Final Logout Coordinates:', finalLogoutCoordinates);
      // console.log('ZZZ', finalCoordinates);
    } catch (error) {
      console.log('mapDataByUserId Error:', error);
    }
  };

  useEffect(() => {
    // Call mapDataByUserId when id changes
    if (id && userIdsW.length > 0) {
      mapDataByUserId();
    }
  }, [id, userIdsW]); // Dependency array ensures this runs whenever `id` changes

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onChangeStartTime = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(false);
    setStartTime(currentTime);
  };

  const onChangeEndTime = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(false);
    setEndTime(currentTime);
  };

  const [filtersVisible, setFiltersVisible] = useState(false);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        // console.log(
        //   'curlat,curlong==>',
        //   position.coords.latitude,
        //   'curlong==>',
        //   position.coords.longitude,
        // );
        let locationData = `${position.coords.latitude},${position.coords.longitude}`;
        // console.log('GGDGDGDGDGD', locationData);
        setCurLat(position.coords.latitude);
        setCurLong(position.coords.longitude);
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        // console.log(
        //   'TESTSTSTTS========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
        //   position,
        // );
      },
      error => {
        console.error('Error getting locationLiveTracking.js: 2:', error.message);
      },
    );
  };

  const handleClear = () => {
    setShowLoaderclear(true);
    // Simulate async operation
    setTimeout(() => {
      setSelectedusertype('')
      setSelectedState('');
      setSelectedCity('');
      setCity([]);
      setSelectedPortfolio('');
      setSelectedUserType('');
      setSelectedUserName('');
      setSelectedAgency('');
      setSelectedUser(null);
      setShowLoaderclear(false);

      // dispatch(saveSelectedState('')); // Clear state value in Redux
      // dispatch(saveSelectedCity('')); // Clear city value in Redux
      // dispatch(saveSelectedPortfolio(''));
      // dispatch(saveSelectedusertype('')) // Clear portfolio value in Redux

      getDashBoardData();

      if (id && userIdsW) {
        mapDataByUserId();
      }

      fetchCurrentLocation();
      fetchUserByFilterfirstTimeCall();
      fetchUserByFilter();

      // Reset date and time
      const startTimeInitial = new Date();
      startTimeInitial.setHours(8, 0, 0, 0); // Set time to 08:00:00
      setStartTime(startTimeInitial);

      // Reset endTime to current time
      setEndTime(new Date());

      // Fetch states and user type data
      getStates();
      getUserTypeData();
    }, 1000); // Replace with your actual clear data duration
  };

  const handlesearch = () => {
    setHasSearched(true);
    setSendingselectedActivity(drpValues1);
    // dispatch(
    //   saveSearchDetail({
    //     selectedCity,
    //     selectedState,
    //     selectedPortfolio,
    //   }),
    // );
    // console.log(SendingselectedActivity, 'Sending selected activity');

    try {
      getDashBoardDataFilter();
      fetchUserByFilterForFilter();
      fetchUserByFilterfirstTimeCall();

      if (loginCoordinates.length > 0) {
        fetchUserByFilterfirstTimeCall();
      }
    } finally {
      setShowLoader(false);
    }
  };

  const getUserTypeData = () => {
    apiClient
      .get(`${BASE_URL}getAllUserType`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })
      .then(function (response) {
        // console.log('AllUserTyperesponse==>', response);
        setUserType(response.data.data);
        // dispatch(showLoader(false));
      })
      .catch(err => console.log('err=='));
  };

  const onlineUserMap = new Map(
    onlineuser.map(user => [user.userId, user.fullName]),
  );

  useEffect(() => {
    if (mapRef.current && (loginCoordinates.length > 0 || logoutCoordinates.length > 0)) {
      const allCoordinates = [...loginCoordinates, ...logoutCoordinates];

      mapRef.current.fitToCoordinates(
        allCoordinates.map(c => ({
          latitude: c.latitude,
          longitude: c.longitude
        })),
        {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true
        }
      );
    }
  }, [loginCoordinates, logoutCoordinates]);


  const handlePress = () => {
    try {
      const navigationParams = {
        onlineUsersUserId,
        offlineUsersUserId,
        internalUsers,
        userTypeIds: selectedusertype,
        cityIds: selectedCity,
        portfolioIds: selectedPortfolio,
        stateIds: selectedState,
        activity: drpValues1,
        AgencyUserStatus: latestActivities,
      };

      if (hasSearched) {
        navigationParams.date = formatDate(date);
        navigationParams.fromTime = formatTime(startTime);
        navigationParams.toTime = formatTime(endTime);
        // navigationParams.AgencyUserStatus = latestActivities;
      }

      navigation.navigate('OnlineUserList', navigationParams);
      // dispatch(currentScreen('OnlineUserList'));
    } catch (error) {
      console.error('Error navigating to OnlineUserList:', error);
    }
  };

  function formatTimeTo12Hour(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

  const aggregateRolesByAgency = (roles) => {
    const agencyMap = new Map();

    roles.forEach(({ roleCode }) => {
      if (!agencyMap.has(roleCode)) {
        agencyMap.set(roleCode, new Set());
      }
      agencyMap.get(roleCode).add(roleCode);
    });

    return Array.from(agencyMap, ([roleCode, roleCodes]) => ({
      roleCode,
      roleCodes: Array.from(roleCodes).join(', ')
    }));
  };

  const [Roles, setRoles] = useState([]);
  const aggregatedRoles = aggregateRolesByAgency(rolesWithStatusY);




  const listData = [
    {
      type: 'status',
      title: `Online Users (${filteredLoginCoordinates.length})`,
      icon: require('../../../../asset/TrueBoardIcon/greenmarker.png'),
    },
    {
      type: 'status',
      title: `Offline Users (${filteredLogoutCoordinates.length})`,
      icon: require('../../../../asset/TrueBoardIcon/redmarker.png'),
    },
    ...Roles.length > 0 && showTrackingAccess ? [{
      type: 'roles',
      title: 'Internal Roles',
      data: Roles.map(role => ({ key: role.roleName })),
    }] : [],
    ...aggregatedRoles.length > 0 && showTrackingAccess ? [{
      type: 'agencyRoles',
      title: 'Agency Roles',
      data: aggregatedRoles.map(item => ({
        // agencyName: item.agencyName,
        roleCodes: item.roleCodes,
      })),
    }] : []
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'status') {
      return (
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>{item.title}</Text>
          <Image style={styles.statusIcon} source={item.icon} />
        </View>
      );
    }

    if (item.type === 'roles') {
      return (
        <View style={styles.trackingAccessContainer}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          <View style={styles.rolesContainer}>
            {item.data.map((role, index) => (
              <Text key={index} style={styles.roleText}>
                {role.key}
                {index < item.data.length - 1 ? ', ' : ''}
              </Text>
            ))}
          </View>
        </View>
      );
    }

    if (item.type === 'agencyRoles') {
      return (
        <View style={styles.trackingAccessContainer}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          {item.data.map((role, index) => (
            <View key={index} style={styles.agencyContainer}>
              {/* Horizontal layout for role codes */}
              <View style={styles.horizontalRoleCodes}>
                <Text style={styles.roleText}>{role.roleCodes}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }


    return null;
  };

  useEffect(() => {
    if (mapRef.current && mapRegion) {
      mapRef.current.animateToRegion(mapRegion, 600);
    }
  }, [mapRegion]);

  const DEFAULT_REGION = {
    latitude: 20.5937,     // center of India (safe fallback)
    longitude: 78.9629,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };



  // Memoized marker render
  const renderLoginMarkers = useMemo(
    () => renderMarkers(filteredLoginCoordinates, 'green', 'login'),
    [filteredLoginCoordinates]
  );

  const renderLogoutMarkers = useMemo(
    () => renderMarkers(filteredLogoutCoordinates, 'red', 'logout'),
    [filteredLogoutCoordinates]
  );
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <SafeAreaView style={styles.safeContainer}> */}
      <StatusBar
        translucent
        backgroundColor="#001D56"
        barStyle="light-content"
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer}>
          <Image source={require('../../../../asset/icon/menus.png')} style={styles.drawerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LiveTracking</Text>
      </View>

      {messageVisible && (
        <View style={{ padding: 10, backgroundColor: 'green', marginTop: 10 }}>
          <Text style={{ color: '#FFFFFF' }}>Page is refreshed</Text>
        </View>
      )}

      {/* <ScrollView style={{ flex: 1 }}> */}

      <View style={styles.containeeer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.editable}>
              <Text style={{ color: 'black' }}>
                {date.toLocaleDateString()}
              </Text>
              <Image
                source={require('../../../../asset/icon/edit.png')}
                style={styles.editIcon}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <UltraDateTimeInput
                label="Select Date"
                value={date}
                onChange={setDate}
              />
            )}
          </View>

          <View>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              style={styles.editable}>
              <Text style={{ color: 'black' }}>
                {startTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
              <Image
                source={require('../../../../asset/icon/edit.png')}
                style={styles.editIcon}
              />
            </TouchableOpacity>
            {showStartTimePicker && (
              <UltraDateTimeInput
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
              />
            )}
          </View>

          <View>
            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              style={styles.editable}>
              <Text style={{ color: 'black' }}>
                {endTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
              <Image
                source={require('../../../../asset/icon/edit.png')}
                style={styles.editIcon}
              />
            </TouchableOpacity>
            {showEndTimePicker && (
              <UltraDateTimeInput
                label="End Time"
                value={endTime}
                onChange={setEndTime}
              />
            )}
          </View>
        </View>
      </View>

      <View style={styles.firstRow}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.tabSection} onPress={handlePress}>
            <View style={{ backgroundColor: '#001D56' }}>
              <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                Online user
              </Text>
            </View>
            <Text style={{ color: 'black', textAlign: 'center' }}>
              {countfilter?.onlineUser !== null &&
                countfilter?.onlineUser !== undefined
                ? countfilter.onlineUser
                : 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabSection}
            onPress={() => {
              navigation.navigate('OfflineUserList')
              // dispatch(currentScreen('OfflineUserList'));
            }}>
            <View style={{ backgroundColor: '#001D56' }}>
              <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                Offline User
              </Text>
            </View>
            <Text style={{ color: 'black', textAlign: 'center' }}>
              {/* {countfilter?.offlineUser ?? 'Loading...'} */}
              {countfilter?.offlineUser !== null &&
                countfilter?.offlineUser !== undefined
                ? countfilter.offlineUser
                : 0}
            </Text>
          </TouchableOpacity>

          <View style={styles.tabSection}>
            <View style={{ backgroundColor: '#001D56' }}>
              <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                Schedule Visit
              </Text>
            </View>
            <Text style={{ color: 'black', textAlign: 'center' }}>
              {countfilter?.scheduleVisit ?? 'Loading...'}
            </Text>
          </View>
        </View>

        <View style={styles.secondRow}>
          <View style={styles.tabSection}>
            <View style={{ backgroundColor: '#001D56' }}>
              <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                Complete Visit
              </Text>
            </View>
            <Text style={{ color: 'black', textAlign: 'center' }}>
              {countfilter?.completedVisit ?? 'Loading...'}
            </Text>
          </View>

          <View style={styles.tabSection}>
            <View style={{ backgroundColor: '#001D56' }}>
              <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                Reschedule Visit
              </Text>
            </View>
            <Text style={{ color: 'black', textAlign: 'center' }}>
              {countfilter?.rescheduledVisit ?? 'Loading...'}
            </Text>
          </View>

          <View style={styles.tabSection}>
            <View style={{ backgroundColor: '#001D56' }}>
              <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                Cancelled Visit
              </Text>
            </View>
            <Text style={{ color: 'black', textAlign: 'center' }}>
              {countfilter?.rejectedVisit ?? 'Loading...'}
            </Text>
          </View>
        </View>

        <View style={styles.thirdRow}>
          <View
            style={{
              width: width * 0.3,
              height: height * 0.07,
              borderWidth: 1,
              borderRadius: 8,
            }}>
            <View style={{ backgroundColor: '#001D56' }}>
              <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                Pending Visit
              </Text>
            </View>
            <Text style={{ color: 'black', textAlign: 'center' }}>
              {countfilter?.pendingVisit ?? 'Loading...'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={toggleFilters}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 5,
              padding: 5,
              backgroundColor: '#001D56',
            }}>
            <Image
              style={{ height: 16, width: 16 }}
              source={require('../../../../asset/TrueBoardIcon/filter.png')}
            />
            <Text style={{ color: '#FFFFFF' }}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filtersVisible && (
        <View style={styles.filterOptionsContainer}>
          <View style={styles.filterOptions}>
            <View style={{ flexDirection: 'row' }}>

            </View>

            <View style={{ flexDirection: 'row', marginVertical: 10 }}>

              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                data={stateOptions}  // Updated data prop with new options
                labelField="label"
                valueField="value"
                placeholder="Select UserType"
                value={selectedusertype}
                onChange={handleUserTypeChange}
              />

              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                data={Portfolio}
                labelField="label"
                valueField="value"
                placeholder={'Select Portfolio'}
                value={selectedPortfolio}
                onChange={handlePortfolioChange}
              />






            </View>

            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                data={State}
                labelField="label"
                valueField="value"
                placeholder={'Select State'}
                value={selectedState}
                onChange={handleStateChange}
                search
              />

              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                data={City}
                labelField="label"
                valueField="value"
                placeholder={'Select City'}
                value={selectedCity} // Ensure to bind the selected city value
                onChange={handleCityChange} // Pass the onChange handler
                search
              />
            </View>

            <View style={styles.buttonContainer}>

              {selectedusertype && (
                <TouchableOpacity
                  onPress={handlesearch}
                  style={styles.searchStyle}
                  disabled={showLoader}>
                  {showLoader ? (
                    <BallIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Search</Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleClear}
                style={styles.searchStyle}
                disabled={showLoaderclear}>
                {showLoaderclear ? (
                  <BallIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Clear</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.mapContainer}>

        {/* Render login markers */}
        {filteredLoginCoordinates.map((coord, index) => {
          const fullName = onlineUserMap.get(coord.userId); // Get fullName from onlineUserMap

          return (
            <Marker
              key={`login_${index}`}
              coordinate={{
                latitude: coord.latitude,
                longitude: coord.longitude,
              }}
              onPress={() =>
                handleMarkerPress(coord.latitude, coord.longitude)
              }
              pinColor="green" // Change to a distinct color for debugging
            >
              <Callout>
                <View>
                  {fullName && (
                    <Text style={{ color: 'black' }}>
                      Full Name: {fullName}
                    </Text>
                  )}
                  <Text style={{ color: 'black' }}>
                    Latitude: {coord.latitude}
                  </Text>
                  <Text style={{ color: 'black' }}>
                    Longitude: {coord.longitude}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {mapRegion && (
          <MapView ref={mapRef} style={{ flex: 1 }}
            region={mapRegion}
            showsUserLocation
            followsUserLocation={false}
            zoomEnabled
            scrollEnabled
            rotateEnabled >
            {renderMarkers(filteredLoginCoordinates, 'green', 'login')}
            {renderMarkers(filteredLogoutCoordinates, 'red', 'logout')}
          </MapView>
        )}

        {/* <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion} // ✅ use initialRegion instead of region
            showsUserLocation
            showsMyLocationButton={false}
            rotateEnabled
            scrollEnabled
            zoomEnabled
            pitchEnabled
            onMapReady={() => {
              if (mapRegion && mapRef.current) {
                mapRef.current.animateToRegion(mapRegion, 500);
              }
            }}
          >
            {renderLoginMarkers}
            {renderLogoutMarkers}
          </MapView> */}

        <View style={styles.container}>
          <FlatList
            data={listData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.contentContainer}
          />
        </View>
      </View>

      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

export default DateTimePickerExample;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    marginHorizontal: 10,
    height: height / 4,
  },
  contentContainer: {
    padding: 10, // Adjust if needed
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.light.darkBlue,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : verticalScale(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  drawerIcon: { width: scale(22), height: scale(22), tintColor: '#FFFFFF' },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#FFFFFF', marginLeft: scale(8) },
  tabSection: {
    width: width * 0.3,
    height: height * 0.07,
    borderWidth: 1,
    borderRadius: 8,
  },
  firstRow: {
    marginVertical: 15,
    marginHorizontal: 15,
  },
  secondRow: {
    flexDirection: 'row',
    marginVertical: 15,
    justifyContent: 'space-between',
  },
  thirdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fourthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    justifyContent: 'space-between',
  },
  mapContainer: {
    height: height / 2,
    marginTop: 16,
    position: 'relative', // Ensures relative positioning of child elements
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  statusContainer: {
    position: 'absolute',
    top: 280, // 10 units from the top of mapContainer
    left: 4,
    backgroundColor: 'transparent', // Transparent background
    width: width * 0.5,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 10,
  },
  statusBox: {
    width: width * 0.7,
    flexDirection: 'column',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 13,
  },
  statusIcon: {
    height: 20,
    width: 20,
    marginLeft: 5,
  },
  trackingAccessContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  trackingAccessRow: {
    marginBottom: 5,
  },
  trackingAccessText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 13,
  },
  roleText: {
    color: 'green',
    fontWeight: '600',
    fontSize: 14,
    // marginRight: 5, 

  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dateTimePickerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateTimePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  containeeer: {
    width: width * 0.9,
    marginHorizontal: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  editable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    width: 16,
    height: 16,
    marginLeft: 5,
  },
  filterOptionsContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
    maxHeight: height / 3, // Adjust height to ensure it doesn't overlap with the list
  },
  filterOptions: {
    width: width * 0.9,
    // backgroundColor: 'red',
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyListText: {
    color: 'red',
    alignSelf: 'flex-end',
    marginTop: -12,
    height: height * 0.02,
    width: height * 0.2,
  },
  controlContainer: {
    position: 'absolute',
    bottom: 310,
    right: 280,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: black,
  },

  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // To handle overflow and ensure wrapping
  },

  agencyContainer: {
    marginBottom: 10, // Vertical spacing between items
    // flexDirection:'row',
  },

  horizontalRoleCodes: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Ensures that the role codes wrap within the available space
    alignItems: 'center', // Vertically align items to the center
  },
});



