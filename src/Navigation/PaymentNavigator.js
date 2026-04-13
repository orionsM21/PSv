/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {designTheme} from '../design-system/theme';
import {defaultStackScreenOptions} from '../core/navigation/navigationTheme';
import {PAYMENT_THEME} from '../modules/payment/theme/paymentTheme';
import HomeScreen from '../modules/payment/Screen/HomeScreen';
import MoneyScreen from '../modules/payment/Screen/MoneyScreen';
import UserScreen from '../modules/payment/Screen/UserScreen';
import MoreScreen from '../modules/payment/Screen/MoreScreen';
import RecentTransaction from '../modules/payment/Screen/RecentTrnsaction';
import FundTransfer from '../modules/payment/Screen/FundTransfer';
import Customers from '../modules/payment/TestScreens/Customers';

const icons = {
  home: require('../modules/payment/asset/home.png'),
  money: require('../modules/payment/asset/money.png'),
  user: require('../modules/payment/asset/user.png'),
  more: require('../modules/payment/asset/More.png'),
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PaymentTabs() {
  const renderTabIcon =
    iconSource =>
    ({focused}) =>
      (
        <Image
          source={iconSource}
          style={[
            styles.tabIcon,
            focused ? styles.tabIconActive : styles.tabIconInactive,
          ]}
        />
      );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: 'none',
        sceneStyle: styles.scene,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: PAYMENT_THEME.accent,
        tabBarInactiveTintColor: PAYMENT_THEME.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarBackground: () => (
          <View pointerEvents="none" style={styles.tabBarBackground} />
        ),
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarIcon: renderTabIcon(icons.home)}}
      />
      <Tab.Screen
        name="Money"
        component={MoneyScreen}
        options={{tabBarIcon: renderTabIcon(icons.money)}}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{tabBarIcon: renderTabIcon(icons.user)}}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{tabBarIcon: renderTabIcon(icons.more)}}
      />
    </Tab.Navigator>
  );
}

export default function PaymentNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen name="PaymentTabs" component={PaymentTabs} />
      <Stack.Screen
        name="RecentTransaction"
        component={RecentTransaction}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="FundTransfer"
        component={FundTransfer}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="Customers"
        component={Customers}
        options={{headerShown: true}}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: PAYMENT_THEME.background[0],
  },
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 0,
    backgroundColor: PAYMENT_THEME.background[0],
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: PAYMENT_THEME.background[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: PAYMENT_THEME.border,
  },
  tabItem: {
    paddingVertical: 2,
  },
  tabLabel: {
    ...designTheme.typography.caption,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  tabIconActive: {
    tintColor: PAYMENT_THEME.accent,
  },
  tabIconInactive: {
    tintColor: PAYMENT_THEME.textMuted,
  },
});
