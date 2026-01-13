import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../modules/vehicleLoan/screen/Dashboard/VehiclDashboard';
import CustomerList from '../modules/vehicleLoan/screen/CustomerList';
import Profile from '../modules/vehicleLoan/screen/Profile';
import Applications from '../modules/vehicleLoan/screen/Applications';

const Stack = createNativeStackNavigator();
export default function VehicleLoanNavigator() {

    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="Customers" component={CustomerList} options={{ headerShown: true }} />
                <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true }} />
                <Stack.Screen name="Applications" component={Applications} options={{ headerShown: true }} />
            </Stack.Navigator>


        </>
    );
}
