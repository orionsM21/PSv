import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  TextInput,
  Button,
  Alert,
  BackHandler,
  Animated,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { black } from '../../utility/Theme';
import apiClient from '../../../../common/hooks/apiClient';
import { BASE_URL } from '../../service/api';

const { width, height } = Dimensions.get('window');
const OnlineSelectedUserdetailsMap = ({ route }) => {
  const { user, selectedActivity, date, startTimeM21, endTimeM22 } = route.params;
  console.log(user, 'useruseruser')
  // console.log(startTimeM21, endTimeM22, date, 'MMMMMMMMSSSGSJLKKJJKJKKHJ');
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);

  const [loading, setLoading] = useState(true);
  const [trackerData, setTrackerData] = useState([]);

  // console.log(trackerData, 'XX')
  const [scheduleVisits, setScheduleVisits] = useState([]);
  // console.log(scheduleVisits, 'DDDDDDMM');
  const [coordinates, setCoordinates] = useState([]);
  const [addressCoordinates, setAddressCoordinates] = useState(null);
  const [messageVisible, setMessageVisible] = useState(false);
  const [addresses, setAddresses] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const mapRef = useRef(null);
  const GOOGLE_MAPS_APIKEY = 'AIzaSyA-qydLv54Exn34c4gPxzhPvbKRogjWQJA';
  const GOOGLE_MAPS_APIK_WorkingFordistance_direction = 'AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE';
  function handleBackButtonClick() {
    navigation.goBack();
    return true;
  }

  const [filteredTrackerData, setFilteredTrackerData] = useState([]);


  // const convertISOTo12Hour = isoString => {
  //   const date = parseISO(isoString);
  //   return format(date, 'h:mm a');
  // };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    mapDataByUserId();
  }, []);
  console.log(trackerData, scheduleVisits, 'scheduleVisitsscheduleVisitsscheduleVisits')
  const formatDate = useMemo(
    () => date => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    [],
  );

  // {
  //   console.log('TrackerContainer', user.userId);
  // }
  const parseLatLng = (value) => {
    if (!value || typeof value !== 'string') return null;

    const [lat, lng] = value.split(',').map(Number);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return { latitude: lat, longitude: lng };
    }

    return null;
  };
  const normalizeTrackerData = (data = []) =>
    data
      .map(item => {
        const latLng = parseLatLng(item.coordinates);
        return latLng ? { ...item, latLng } : null;
      })
      .filter(Boolean);

  const normalizeScheduleVisits = (visits = []) =>
    visits
      .map(v => {
        if (!v?.geoCordinates) return null;

        const [lat, lng] = v.geoCordinates.split(',').map(Number);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { ...v, latLng: { latitude: lat, longitude: lng } };
        }
        return null;
      })
      .filter(Boolean);





  const mapDataByUserId = async () => {
    const payload = {
      userIds: [user.userId],
      date: date || formatDate(new Date()),
      fromTime: startTimeM21 || '00-00',
      toTime: endTimeM22 || '24-00',
    };

    try {
      const response = await apiClient.post(`${BASE_URL}mapDataByUserId`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { tracker, shceduleVisits } = response.data.data;
      const trackerArray = tracker || [];
      const scheduleVisits = shceduleVisits || [];

      // Map tracker and schedule visits coordinates
      const normalizedTracker = normalizeTrackerData(trackerArray);
      // const normalizedVisits = normalizeScheduleVisits(scheduleVisits);
      const normalizedVisits = normalizeScheduleVisits(scheduleVisits);
      setScheduleVisits(normalizedVisits);
      setTrackerData(normalizedTracker);
      setFilteredTrackerData(normalizedTracker);
      // setScheduleVisits(normalizedVisits);

      setCoordinates(normalizedTracker.map(t => t.latLng));






      const shouldFilter = selectedActivity?.trim() !== '';

      const filteredTrackerData = normalizedTracker.filter(data => {
        if (
          data.activity === 'Login' ||
          data.activity === 'Logout' ||
          !data.activity
        ) {
          return true;
        }
        return shouldFilter ? data.activity === selectedActivity : true;
      });

      setFilteredTrackerData(filteredTrackerData);

      // const safeVisits = normalizeScheduleVisits(scheduleVisits);
      // setScheduleVisits(safeVisits);


      setLoading(false);
    } catch (error) {
      console.error('mapDataByUserId Error:', error);
      setLoading(false);
    }
  };







  useEffect(() => {
    const safeTrackerData = Array.isArray(trackerData) ? trackerData : [];
    const filteredData = safeTrackerData.filter(data => {
      if (
        data.activity === 'Login' ||
        data.activity === 'Logout' ||
        data.activity === null
      ) {
        return true;
      }
      // Apply selected activity filter
      return selectedActivity && selectedActivity.trim() !== ''
        ? data.activity === selectedActivity
        : true;
    });

    // Update state with filtered data
    setFilteredTrackerData(filteredData);

    // console.log(filteredTrackerData, 'TrackingH');
  }, [selectedActivity, trackerData]);

  const refreshpage = () => {
    setLoading(true);
    mapDataByUserId();
    Toast.show({
      type: 'info',
      text1: 'Data refreshed!',
      position: 'bottom',
      visibilityTime: 3000, // 3 sec visibility
    });

    setMessageVisible(true);
    setTimeout(() => {
      setMessageVisible(false);
    }, 1000);
  };

  const handleMarkerPress = () => {
    // Handle marker press if needed
  };

  const startLocationAddress =
    trackerData && trackerData.length > 0
      ? trackerData[0].areaName
      : 'No data available';


  // console.log(startLocationAddress, 'XCXE')

  const groupByTime = (data) => {
    const grouped = {};

    data.forEach(item => {
      const timeKey = new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      if (!grouped[timeKey]) {
        grouped[timeKey] = item;
      }
    });

    return Object.values(grouped);
  };

  const buildTimelineData = (trackerData = [], scheduleVisits = []) => {
    const trackerItems = trackerData.map(item => ({
      id: `tracker_${item.trackerId}`,
      type: 'TRACKER',
      activity: item.activity,
      areaName: item.areaName,
      lan: item.lan,
      status: item.status,
      timestamp: new Date(item.createdTime).getTime(),
      rawTime: item.createdTime,
      latLng: item.latLng,
    }));

    const visitItems = scheduleVisits.map((visit, index) => {
      // Combine date + time safely
      const dateTimeString = `${visit.date} ${visit.time}`;
      const timestamp = new Date(dateTimeString).getTime();

      return {
        id: `visit_${index}`,
        type: 'VISIT',
        activity: 'Schedule Visit',
        areaName: visit.address,
        lan: visit.lan,
        status: visit.status,
        timestamp,
        rawTime: dateTimeString,
        latLng: visit.latLng,
      };
    });

    return [...trackerItems, ...visitItems]
      .filter(item => Number.isFinite(item.timestamp))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const combinedTimelineData = useMemo(() => {
    if (!trackerData && !scheduleVisits) return [];

    const merged = buildTimelineData(trackerData || [], scheduleVisits || []);
    return groupByTime(merged);
  }, [trackerData, scheduleVisits]);

  const sectionedTimelineData = useMemo(() => {
    const sections = {};

    combinedTimelineData.forEach(item => {
      const header = new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      if (!sections[header]) {
        sections[header] = [];
      }

      sections[header].push(item);
    });

    return Object.keys(sections).map(title => ({
      title,
      data: sections[title],
    }));
  }, [combinedTimelineData]);
  const focusOnMap = useCallback((latLng) => {
    if (!latLng || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        ...latLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, []);


  const renderItem = useCallback(({ item, index }) => {
    const isLast = index === combinedTimelineData.length - 1;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedId(item.id);
          focusOnMap(item.latLng);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.itemContainer}>
          <View style={styles.timeline}>
            <View style={[styles.line, index === 0 && styles.lineStart]} />
            <View style={[styles.circle, isLast && styles.circleEnd]} />
            <View style={[styles.line, isLast && styles.lineEnd]} />
          </View>

          <Text style={styles.address}>{item.areaName || 'N/A'}</Text>

          <View style={styles.actionContainer}>
            <Text style={styles.action}>
              {item.type === 'VISIT' ? 'Scheduled Visit' : item.activity}
            </Text>
            <Text style={styles.time}>
              {new Date(item.timestamp).toLocaleTimeString('en-US')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [combinedTimelineData.length, focusOnMap]);






  useEffect(() => {
    const fetchAddresses = async () => {
      const newAddresses = {};

      await Promise.all(
        scheduleVisits.map(async visit => {
          if (!visit.latLng) return;

          const address = await getAddressFromCoordinates(
            visit.latLng.latitude,
            visit.latLng.longitude
          );

          newAddresses[`${visit.latLng.latitude},${visit.latLng.longitude}`] = address;
        })
      );

      setAddresses(newAddresses);
    };

    if (scheduleVisits.length) fetchAddresses();
  }, [scheduleVisits]);


  const getAddressFromCoordinates = async (latitude, longitude) => {
    const apiKey = 'AIzaSyA-qydLv54Exn34c4gPxzhPvbKRogjWQJA'; // Replace with your API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const address = response.data.results[0]?.formatted_address || 'Address not found';
      return address;
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Address not found';
    }
  };

  const initialRegionRef = useRef(null);

  useEffect(() => {
    if (!initialRegionRef.current && coordinates.length > 0) {
      initialRegionRef.current = {
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
  }, [coordinates]);

  console.log(loading, initialRegionRef.current, 'initialRegioninitialRegion')
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.menuButton}>
          <Image
            style={styles.icon}
            source={require('../../../../asset/icon/left.png')}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Online User Details</Text>

        <TouchableOpacity
          onPress={refreshpage} // Refresh button onPress
          style={styles.refreshButton}>
          <Image
            style={styles.iconSmall}
            source={require('../../../../asset/icon/refresh.png')}
          />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>

        <Toast ref={ref => Toast.setRef(ref)} />
      </View>
      {messageVisible && (
        <View style={{ padding: 10, backgroundColor: 'green', marginTop: 10 }}>
          <Text style={{ color: '#FFFFFF' }}>Page is refreshed</Text>
        </View>
      )}

      <ScrollView>
        <View style={styles.container}>
          <View style={styles.innerCard}>
            <View style={styles.detailsContainerAdd}>
              <Text style={styles.label}>Full Name:</Text>
              <Text style={styles.text}>{user.fullName}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.label}>Username:</Text>
              <Text style={styles.text}>{user.userName}</Text>
            </View>
            <View style={styles.detailsContainerAdd}>
              <Text style={styles.label}>Role:</Text>
              <Text style={styles.text}>{user.role}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.label}>Reporting Authority:</Text>
              <Text style={styles.text}>{user.reportingAuthority}</Text>
            </View>
            <View style={styles.detailsContainerAdd}>
              <Text style={styles.label}>Start Location:</Text>
              <Text style={styles.text}>{startLocationAddress}</Text>
            </View>
            <View style={styles.detailsContainerAdd}>
              <Text style={styles.label}>Current Location:</Text>
              <Text style={styles.text}>{startLocationAddress}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.text}>{user.status}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.label}>Login Time:</Text>
              <Text style={styles.text}>
                {user.loginTime ? user.loginTime : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mapContainer}>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}

          {!loading && initialRegionRef.current && (

            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={initialRegionRef.current}
              showsUserLocation
              followsUserLocation
              zoomEnabled
              scrollEnabled
              rotateEnabled
            >
              {/* Render directions based on selectedActivity */}
              {coordinates.length >= 2 && (
                <MapViewDirections
                  origin={coordinates[0] || scheduleVisits[0]?.latLng}
                  destination={coordinates[coordinates.length - 1]}
                  waypoints={coordinates.slice(1, -1)}
                  apikey={GOOGLE_MAPS_APIK_WorkingFordistance_direction}
                  strokeWidth={3}
                  strokeColor="hotpink"
                  optimizeWaypoints
                />
              )}


              {/* Conditionally render scheduleVisits directions when no activity is selected */}
              {!selectedActivity && scheduleVisits.length > 0 && (
                <MapViewDirections
                  origin={coordinates[0] || scheduleVisits[0]?.latLng} // Start from the first tracker coordinate
                  waypoints={scheduleVisits.map(visit => {
                    const [latitude, longitude] = visit.geoCordinates.split(',').map(Number);
                    return { latitude, longitude };
                  })}
                  destination={{
                    latitude: parseFloat(scheduleVisits[scheduleVisits.length - 1].geoCordinates.split(',')[0]),
                    longitude: parseFloat(scheduleVisits[scheduleVisits.length - 1].geoCordinates.split(',')[1]),
                  }}
                  apikey={GOOGLE_MAPS_APIK_WorkingFordistance_direction}
                  strokeWidth={3}
                  strokeColor="blue"
                  optimizeWaypoints
                  onError={errorMessage => console.error('MapViewDirections Error:', errorMessage)}
                />

              )}

              {/* Render trackerData markers */}
              {(filteredTrackerData.length ? filteredTrackerData : trackerData)
                .filter(item => item?.latLng)
                .map((data, index) => {
                  const [latitude, longitude] = data.coordinates.split(',').map(Number);
                  return (
                    <Marker
                      key={`tracker_${index}`}
                      coordinate={data.latLng}
                      pinColor={
                        data.activity === 'PTP'
                          ? '#F5B041'
                          : data.activity === 'Payment'
                            ? '#C2185B'
                            : data.activity === 'Raise Exception'
                              ? '#229954'
                              : data.activity === 'Request'
                                ? '#7D3C98'
                                : data.activity === 'ScheduleVisit'
                                  ? '#1E88E5'
                                  : data.activity === 'Dispute/RTP'
                                    ? '#FFFF00'
                                    : 'red'
                      }
                    >
                      <Callout>
                        <View>
                          <Text style={{ color: 'black' }}>Activity: {data.activity || 'No activity'}</Text>

                          {!['Login', 'Logout'].includes(data.activity) && (
                            <Text style={{ color: 'black' }}>LAN: {data.lan || 'N/A LAN'}</Text>
                          )}

                          <Text style={{ color: 'black' }}>Location: {data.areaName || 'No area name'}</Text>
                          <Text style={{ color: 'black' }}>Time: {new Date(data.createdTime || 'Time is N/A').toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}</Text>

                          {!['Login', 'Logout', 'Payment', 'PTP', 'Raise Exception', 'Request', 'Dispute/RTP'].includes(data.activity) && (
                            <Text style={{ color: 'black' }}>
                              Status: {data.status === null ? 'Pending' : data.status || 'Status N/A For This Lan'}
                            </Text>
                          )}


                        </View>
                      </Callout>
                    </Marker>
                  );
                })}


              {/* Conditionally render schedule visit markers */}
              {!selectedActivity &&
                scheduleVisits.map((visit, index) => (
                  <Marker
                    key={`visit_${index}`}
                    coordinate={visit.latLng}
                    pinColor={
                      visit.status === 'Pending'
                        ? 'orange'
                        : visit.status === 'Completed'
                          ? 'green'
                          : visit.status === 'Rejected'
                            ? 'red'
                            : 'blue'
                    }
                  >
                    <Callout>
                      <View>
                        <Text style={{ color: 'black' }}>Name: {visit.name}</Text>
                        <Text style={{ color: 'black' }}>Date: {visit.date}</Text>
                        <Text style={{ color: 'black' }}>Time: {visit.time}</Text>
                        <Text style={{ color: 'black' }}>Address: {visit.address}</Text>
                        <Text style={{ color: 'black' }}>Remark: {visit.remark}</Text>
                        <Text style={{ color: 'black' }}>Status: {visit.status}</Text>
                        <Text style={{ color: 'black' }}>LAN: {visit.lan}</Text>
                      </View>
                    </Callout>
                  </Marker>
                ))}

            </MapView>
          )}
        </View>

        {combinedTimelineData && combinedTimelineData.length > 0 ? (
          <View style={styles.trackerContainer}>
            <Text style={styles.title}>Tracker Data</Text>

            <SectionList
              sections={sectionedTimelineData}
              keyExtractor={item => item.id}
              stickySectionHeadersEnabled
              renderSectionHeader={({ section: { title } }) => (
                <View style={{ backgroundColor: '#EEE', paddingVertical: 6 }}>
                  <Text style={{ fontWeight: 'bold', color: '#333', marginLeft: 12 }}>
                    {title}
                  </Text>
                </View>
              )}
              renderItem={renderItem}
            />

          </View>
        ) : (
          <View style={{ padding: 20 }}>
            <Text style={{ color: 'gray', textAlign: 'center' }}>
              No tracker or schedule visit data available
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Background color for better visibility
  },
  mapContainer: {
    height: height / 2,
    marginTop: 16,
    backgroundColor: '#f0f0f0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001D56',
    borderRadius: 5,
    marginHorizontal: 10,
    padding: 4,
    // marginLeft: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: black,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsContainerAdd: {
    width: width * 0.5,
    flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    color: 'black',
    width: width * 0.3,
  },
  text: {
    fontSize: 14,
    color: 'black',
  },

  innerCard: {
    width: width * 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Translucent background for inner card
    borderRadius: 10,
    padding: 10,
    borderWidth: 8, // General border width, set here if needed for a consistent border width
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'rgba(355, 255, 255, 0.3)', // Color for each border side
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'rgba(0, 255, 0, 0.5)', // Left border color specifically
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },

  userId: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  areaName: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  createdTime: {
    fontSize: 12,
    color: '#999',
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 8,
  },
  line: {
    width: 2,
    height: 16,
    color: 'black',
    backgroundColor: '#ccc',
  },
  lineStart: {
    height: 8,
  },
  lineEnd: {
    height: 8,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 4,
  },
  circleEnd: {
    backgroundColor: 'red',
  },
  address: {
    width: width * 0.5,
    borderWidth: 1,
    color: 'black',
    borderColor: 'black',
    borderRadius: 8,
    padding: 8,
  },
  actionContainer: {
    width: width * 0.4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  action: {
    color: 'black',
    fontSize: 12,
    fontWeight: '500',
  },
  time: {
    color: 'black',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8', // Adjust as needed
  },
  menuButton: {
    padding: 5,
  },
  icon: {
    height: 20,
    width: 20,
  },
  iconSmall: {
    height: 16,
    width: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center', // Center align text
    color: '#333', // Adjust as needed
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
    marginLeft: 8,
  },
});

export default OnlineSelectedUserdetailsMap;
