import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,

  BackHandler,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import apiClient from '../../../../common/hooks/apiClient';
import { BASE_URL } from '../../service/api';
import { trackerApi } from './api/trackerApi';

const { width, height } = Dimensions.get('window');

const UserCard = React.memo(({ user, onPress, showManagedBy }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.title}>
      {user.fullName} ({user.userName})
    </Text>

    <Text style={styles.text}>Role: {user.role}</Text>

    <Text style={styles.text}>
      Reporting Authority: {user.reportingAuthority === '0' ? 'Self' : user.reportingAuthority}
    </Text>

    <Text style={styles.text}>
      Status:
      <Text style={{ color: user.status === 'Offline' ? 'red' : 'green' }}>
        {" "}{user.status}
      </Text>
    </Text>

    <Text style={styles.text}>
      Last Login Time: {user.loginTime || 'N/A'}
    </Text>

    {showManagedBy && (
      <Text style={styles.text}>
        Managed By: {user.managedBy || 'N/A'}
      </Text>
    )}
  </TouchableOpacity>
));

// StylishSwitch component to toggle between Internal and External
const StylishSwitch = ({ isInternalSelected, isExternalSelected, onToggle }) => (
  <View style={styles.switchContainer}>
    <TouchableOpacity
      style={[
        styles.switchButton,
        isInternalSelected ? styles.active : styles.inactive,
      ]}
      onPress={() => onToggle('internal')}
    >
      <Text style={{ color: isInternalSelected ? 'white' : 'black' }}>Internal</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.switchButton,
        isExternalSelected ? styles.active : styles.inactive,
      ]}
      onPress={() => onToggle('external')}
    >
      <Text style={{ color: isExternalSelected ? 'white' : 'black' }}>External</Text>
    </TouchableOpacity>
  </View>
);


const OfflineUserList = () => {
  const [userFilter, setUserFilter] = useState([]); // State to hold filtered users
  const [UserId, setUserId] = useState([]); // State to hold user IDs
  const navigation = useNavigation(); // Navigation hook for screen navigation

  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);
  const [messageVisible, setMessageVisible] = useState(false);
  const [offlineExternalUsers, setOfflineExternalUsers] = useState([]);
  const [offlineInternalUsers, setOfflineInternalUsers] = useState([]);
  const [isInternalSelected, setIsInternalSelected] = useState(false); // true for Internal, false for External
  const [isExternalSelected, setIsExternalSelected] = useState(false); // true for External, false for Internal
  const [MapByUserId, setMapByUserId] = useState([])
  const selectedPortfolio = useSelector(
    state => state.auth.selectedPortfolio,
  );
  const selectedState = useSelector(state => state.auth.selectedState);
  const selectedCity = useSelector(state => state.auth.selectedCity);
  const selecteduserType = useSelector(state => state.auth.selecteduserType);
  // console.log(selecteduserType, 'selectedState')

  const [searchQuery, setSearchQuery] = useState('');
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (isInternalSelected) {
      return offlineInternalUsers.filter(user =>
        user.fullName.toLowerCase().includes(query),
      );
    }
    if (isExternalSelected) {
      return offlineExternalUsers.filter(user =>
        user.fullName.toLowerCase().includes(query),
      );
    }
    return userFilter.filter(user =>
      user.fullName.toLowerCase().includes(query),
    );
  }, [
    searchQuery,
    isInternalSelected,
    isExternalSelected,
    offlineInternalUsers,
    offlineExternalUsers,
    userFilter,
  ]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Handle back button press to navigate back
  const handleBackButtonClick = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, []);

  const lastRequestRef = useRef("");

  useEffect(() => {
    if (!UserId.length) return;

    const requestKey = UserId.join(",");

    if (lastRequestRef.current === requestKey) return;

    lastRequestRef.current = requestKey;
    mapDataByUserId(UserId);
  }, [UserId]);


  useEffect(() => {
    fetchUserByFilter();
  }, [token, selectedCity, selectedState, selectedPortfolio, selecteduserType]);


  const handleToggle = type => {
    if (type === 'internal') {
      setIsInternalSelected(true);
      setIsExternalSelected(false);
    } else if (type === 'external') {
      setIsInternalSelected(false);
      setIsExternalSelected(true);
    }
  };

  const fetchUserByFilter = async () => {
    let payload = null;

    // Check if any of the filters have values
    if (selectedCity || selectedState || selectedPortfolio || selecteduserType) {
      payload = {
        cityIds: selectedCity ? [selectedCity] : [],
        stateIds: selectedState ? [selectedState] : [],
        portfolioIds: selectedPortfolio ? [selectedPortfolio] : [],
        activity: [],
        productIds: [],
        regionIds: [],
        zoneIds: [],
        agencyIds: [],
        productIds: [],
        regionIds: [],
        userIds: [],
        userType: selecteduserType ? [selecteduserType] : [],
      };
    }
    try {
      const response = await apiClient.post(
        `${BASE_URL}getUserByFilter/${userProfile.userId}`,
        payload, // Sending null as the request body
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const offlineUsers = response.data.data.filter(
        user => user.status === 'Offline',
      );

      // Filter out users with userType 'U103'
      const offlineExternalUsers = offlineUsers.filter(
        user => user.userType === 'U103',
      );
      const offlineInternalUsers = offlineUsers.filter(
        user => user.userType === 'U101',
      );

      const offlineUsersUserId = offlineUsers.map(user => user.userId);
      setUserFilter(offlineUsers); // Update userFilter state with fetched data
      setUserId(offlineUsersUserId); // Update UserId
      setOfflineExternalUsers(offlineExternalUsers); // Update new state with offline users of type 'U103'
      setOfflineInternalUsers(offlineInternalUsers); // Update new state with offline users of type 'U101'
    } catch (error) {
      console.log('Error fetching user by filter:', error); // Log any errors
    }
  };


  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  const mapDataByUserId = async () => {
    if (UserId.length === 0) {
      // console.log('UserId is empty. Skipping API call.');
      return;
    }

    // const payload = {
    //   userId: UserId,
    //   date: formatDate(new Date()),
    //   fromTime: '00:00', // Corrected time format
    //   toTime: '24:00', // Corrected time format
    // };
    const payload = {
      userIds: UserId,
      date: new Date().toISOString().slice(0, 10),
      fromTime: "00-00",
      toTime: "24-00"
    };

    try {
      const response = await trackerApi.mapDataByUserId(payload, token)
      setMapByUserId(response.data.data);
      // console.log('mapDataByUserId response:', response.data.data);
    } catch (error) {
      console.error(
        'mapDataByUserId Error:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  // Function to handle press on a user card
  const handleCardPress = user => {
    navigation.navigate('OfflineSelectedUserdetailsMap', { user });
  };

  const refreshPage = () => {
    fetchUserByFilter();
    setMessageVisible(true);
    setTimeout(() => {
      setMessageVisible(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>

      {messageVisible && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Page is refreshed</Text>
        </View>
      )}

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onPress={() => handleCardPress(item)}
            showManagedBy={isExternalSelected}
          />
        )}

        ListHeaderComponent={
          <View style={styles.container}>
            <TextInput
              style={styles.searchBox}
              placeholder="Search by name"
              placeholderTextColor="black"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <StylishSwitch
              isInternalSelected={isInternalSelected}
              isExternalSelected={isExternalSelected}
              onToggle={handleToggle}
            />
          </View>
        }

        ListEmptyComponent={
          <Text style={styles.noUsersText}>
            No users found
          </Text>
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

// Styles for the component
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
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  headerTitle: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001D56',
    borderRadius: 5
  },
  refreshText: {
    color: '#ffffff',
    marginLeft: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  iconSmall: {
    width: 15,
    height: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  switchButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4, // Optional: Add rounded corners to buttons
  },
  active: {
    backgroundColor: '#001D56', // Color for the active switch
  },
  inactive: {
    backgroundColor: '#e0e0e0', // Color for the inactive switch
    borderColor: '#000',    // Border color for the inactive switch
    borderWidth: 2,            // Border width for the inactive switch
  },
  userListContainer: {
    marginTop: 10,
  },
  noUsersText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  text: {
    fontSize: 14,
    color: '#555',
  },
  textforstatus: {
    fontSize: 14,
    color: 'red',
  },
  messageContainer: {
    backgroundColor: '#007BFF',
    padding: 10,
    margin: 10,
    borderRadius: 8,
  },
  messageText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
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
    color: '#000',
    fontSize: 16,
  },
});

export default OfflineUserList;
