import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');


const SuccessPage = ({ route }) => {
  const navigation = useNavigation();

  const handleDone = () => {
    // Trigger the callback function passed via navigation params
    if (route.params?.onSuccessNavigate) {
      route.params.onSuccessNavigate(); // This will call fetchData() in Home page
    }
    navigation.navigate('Dashboard'); // Navigate to the Home page
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../asset/greencheck.png')}
        style={styles.icon}
      />
      <Text style={styles.successText}>Worklist Update Successfully!</Text>
      <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width * 1,
    height: height * 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
  },
  icon: {
    width: width * 1,
    height: height * 0.5,
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SuccessPage;
