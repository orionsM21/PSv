import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, BackHandler, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { showDrawer } from '../redux/action';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const OfflineSelectedUserdetailsMap = ({ route }) => {
  const { user } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();


  function handleBackButtonClick() {
    navigation.goBack();
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
    };
  }, []);

  const refreshpage = () => {

  };
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.menuButton}
        >
          <Image
            style={styles.icon}
            source={require('../../../../asset/icon/left.png')}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Offline User Details Map</Text>

        <TouchableOpacity
          onPress={refreshpage}
          style={styles.refreshButton}
        >
          <Image
            style={styles.iconSmall}
            source={require('../../../../asset/icon/refresh.png')}
          />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.container}>
          {/* <Text style={styles.title}>User Details</Text> */}
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.text}>{user.fullName}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.text}>{user.userName}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.text}>{user.role}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Reporting Authority:</Text>
            <Text style={styles.text}>{user.reportingAuthority === '0' ? 'Self' : user.reportingAuthority} </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.textForstatus}>{user.status}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Last LogOut Time:</Text>
            <Text style={styles.text}>
              {user.logoutTime ? user.logoutTime : 'N/A'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
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
    marginLeft: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: 'black',
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    color: 'black',
    width: width * 0.3
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
  textForstatus: {
    fontSize: 16,
    color: 'red',
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

export default OfflineSelectedUserdetailsMap;
