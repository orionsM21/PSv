import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatDashboard from '../modules/chatApp/screen/ChatDashboard';
import ChatScreen from '../modules/chatApp/screen/ChatScreen';
import { useSelector } from 'react-redux';



const Stack = createNativeStackNavigator();
export default function ChatAppNavigator() {
    const { selectedModule, isLoggedIn, roleCode, userHydrated } = useSelector(
        state => state.module
    );
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isLoggedIn && (
                    <>

                        <Stack.Screen name="LOSLogin" component={LOSLogin} />
                    </>
                )}
                {isLoggedIn && (
                    <>
                        <Stack.Screen name="ChatDashboard" component={ChatDashboard} />
                        <Stack.Screen name="chat" component={ChatScreen} />
                    </>
                )}
            </Stack.Navigator>
        </>
    );
}



