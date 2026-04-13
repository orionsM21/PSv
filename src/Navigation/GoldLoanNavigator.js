import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../modules/goldLoan/screens/Dashboard';
import CustomerList from '../modules/goldLoan/screens/CustomerList';
import Profile from '../modules/goldLoan/screens/Profile';
import NewLoan from '../modules/goldLoan/screens/NewLoan';
import CustomerDetails from '../modules/goldLoan/components/CustomerDetails';
import { defaultStackScreenOptions } from '../core/navigation/navigationTheme';

const Stack = createNativeStackNavigator();

export default function GoldLoanNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen
        name="Customers"
        component={CustomerList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="New Loan"
        component={NewLoan}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerDetails"
        component={CustomerDetails}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
