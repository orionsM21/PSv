// src/Navigation/PaymentNavigator.js

import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

/* ===== SCREENS ===== */

import HomeScreen from '../modules/payment/Screen/HomeScreen';
import MoneyScreen from '../modules/payment/Screen/MoneyScreen';
import UserScreen from '../modules/payment/Screen/UserScreen';
import MoreScreen from '../modules/payment/Screen/MoreScreen';
import RecentTransaction from '../modules/payment/Screen/RecentTrnsaction';
import FundTransfer from '../modules/payment/Screen/FundTransfer';
import PaymentLogin from '../modules/payment/PaymentLogin';
import PaymentDrawer from '../Drawer/payment/PaymentDrawer';
import Customers from '../modules/payment/TestScreens/Customers';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
/* ===== ICONS ===== */
const icons = {
  home: require('../modules/payment/asset/home.png'),
  money: require('../modules/payment/asset/money.png'),
  user: require('../modules/payment/asset/user.png'),
  more: require('../modules/payment/asset/More.png'),
};

/* ================= BOTTOM TABS ================= */

const Tab = createBottomTabNavigator();

const PaymentTabs = () => {
  const navigation = useNavigation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarPressColor: 'transparent', // 🔥
        tabBarPressOpacity: 1,            // 🔥
        animation: 'none',
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.home}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#007AFF' : '#9CA3AF',
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Money"
        component={MoneyScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.money}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#007AFF' : '#9CA3AF',
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.user}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#007AFF' : '#9CA3AF',
              }}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} />
            </TouchableOpacity>
          ),
          headerShown: true
        }}
      />

      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.more}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#007AFF' : '#9CA3AF',
              }}
            />
          ),

        }}
      />
    </Tab.Navigator>
  );
};

/* ================= STACK NAVIGATOR ================= */

const Stack = createNativeStackNavigator();


export default function PaymentNavigator() {
  return (
    <>
      {/* <PaymentDrawer /> */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PaymentTabs" component={PaymentTabs} />
        <Stack.Screen name="RecentTransaction" component={RecentTransaction} options={{ headerShown: true }} />
        <Stack.Screen name="FundTransfer" component={FundTransfer} options={{ headerShown: true }} />
        <Stack.Screen
          name="Customers"
          component={Customers}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </>
  );
}




// import React, { useState } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Dashboard from '../modules/payment/TestScreens/Dashboard';
// import Customers from '../modules/payment/TestScreens/Customers';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import PaymentDrawer from '../Drawer/payment/PaymentDrawer';
// import AIChat from '../modules/payment/Screen/RecentTrnsaction';
// import FundTransfer from '../modules/payment/Screen/FundTransfer';
// import HomeScreen from '../modules/payment/Screen/HomeScreen';
// import MoneyScreen from '../modules/payment/Screen/MoneyScreen';
// import UserScreen from '../modules/payment/Screen/UserScreen';
// import MoreScreen from '../modules/payment/Screen/MoreScreen';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';



// /* ================= BOTTOM TABS ================= */

// const Tab = createBottomTabNavigator();
// const PaymentTabs = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarHideOnKeyboard: true,
//         tabBarStyle: {
//           height: 60,
//           paddingBottom: 6,
//         },
//         tabBarActiveTintColor: '#007AFF',
//         tabBarInactiveTintColor: '#9CA3AF',
//       }}
//     >
//       <Tab.Screen
//         name="Dashboard"
//         component={Dashboard}
//         options={{
//           tabBarIcon: ({ color }) => (
//             <MaterialIcons name="home" size={24} color={color} />
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="Money"
//         component={MoneyScreen}
//         options={{
//           tabBarIcon: ({ color }) => (
//             <MaterialIcons name="account-balance-wallet" size={24} color={color} />
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="User"
//         component={UserScreen}
//         options={{
//           tabBarIcon: ({ color }) => (
//             <MaterialIcons name="person" size={24} color={color} />
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="More"
//         component={MoreScreen}
//         options={{
//           tabBarIcon: ({ color }) => (
//             <MaterialIcons name="more-horiz" size={24} color={color} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };


// const Stack = createNativeStackNavigator();

// export default function PaymentNavigator() {
//   return (
//     <>
//       {/* Drawer stays OUTSIDE stack */}
//       {/* <PaymentDrawer /> */}

//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {/* ✅ Tabs as ROOT */}
//         <Stack.Screen
//           name="PaymentTabs"
//           component={PaymentTabs}
//         />

//         {/* ❌ NO TAB here */}
//         <Stack.Screen
//           name="RecentTransaction"
//           component={AIChat}
//         />

//         <Stack.Screen
//           name="FundTransfer"
//           component={FundTransfer}
//         />

// <Stack.Screen
//   name="Customers"
//   component={Customers}
//   options={{ headerShown: true }}
// />
//       </Stack.Navigator>
//     </>
//   );
// }





