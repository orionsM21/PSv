import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../modules/goldLoan/screens/Dashboard';
import CustomerList from '../modules/goldLoan/screens/CustomerList';
import Profile from '../modules/goldLoan/screens/Profile';

const Stack = createNativeStackNavigator();
export default function GoldLoanNavigator() {
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="Customers" component={CustomerList} options={{ headerShown: true }} />
                <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true }} />
            </Stack.Navigator>
        </>
    );
}




