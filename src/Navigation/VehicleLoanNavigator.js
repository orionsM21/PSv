import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Dashboard from '../modules/vehicleLoan/screen/Dashboard/VehiclDashboard';
import CustomerList from '../modules/vehicleLoan/screen/CustomerList';
import Profile from '../modules/vehicleLoan/screen/Profile';
import Applications from '../modules/vehicleLoan/screen/Applications';
import NewApplication from '../modules/vehicleLoan/screen/NewApplication';
import ApplicationForm from '../modules/vehicleLoan/screen/ApplicationForm';
import ApplicationDetails from '../modules/vehicleLoan/screen/ApplicationDetails';
import {defaultStackScreenOptions} from '../core/navigation/navigationTheme';

const Stack = createNativeStackNavigator();

export default function VehicleLoanNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackScreenOptions,
        headerShown: false,
      }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="New Application" component={NewApplication} />
      <Stack.Screen name="Application Form" component={ApplicationForm} />
      <Stack.Screen name="Customers" component={CustomerList} />
      <Stack.Screen name="Applications" component={Applications} />
      <Stack.Screen name="Application Details" component={ApplicationDetails} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}
