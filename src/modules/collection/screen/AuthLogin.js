import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import {
  setModule,
  loginSuccess,
  logout,
  setUserHydrated,
} from '../../../redux/moduleSlice';

import {
  saveTokenAndID,
  saveUserProfile,
  saveRoleCode,
} from '../../../redux/actions';

import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
import { useNavigation } from '@react-navigation/native';

const AuthLogin = () => {
  const dispatch = useDispatch();
  const ran = useRef(false); // 🔒 prevent double call
  const navigation = useNavigation();
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const restoreCollection = async () => {
      try {
        const [
          tokenEntry,
          moduleEntry,
          userNameEntry,
          userIdEntry,
          roleCodeEntry,
          profileEntry,
        ] = await AsyncStorage.multiGet([
          '@token',
          '@selectedModule',
          '@userName',
          '@userId',
          '@roleCode',
          '@userProfile',
        ]);

        const token = tokenEntry?.[1];
        const module = moduleEntry?.[1];
        const userName = userNameEntry?.[1];
        const userId = userIdEntry?.[1];

        if (!token || !userName || module !== 'collection') {
          dispatch(logout());
          navigation.navigate('CollectionLogin')
          return;
        }

        // dispatch(setModule('collection'));

        // 🔁 Always refetch profile (avoid stale data)
        const res = await apiClient.get(
          `getUserByUserNameForDashboard/${encodeURIComponent(userName)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'X-From-Mobile': 'true',
            },
          }
        );

        const userProfile = res?.data?.data;
        if (!userProfile) throw new Error('Invalid profile');

        const roleCode = userProfile?.role?.[0]?.roleCode || '';

        dispatch(
          saveTokenAndID({
            token,
            user: { userId, name: userName },
          })
        );

        dispatch(saveUserProfile(userProfile));
        dispatch(saveRoleCode(roleCode));
        dispatch(loginSuccess(roleCode));
        navigation.navigate('Dashboard')
        // dispatch(setUserHydrated()); // 🔑 LAST STEP
      } catch (err) {
        console.warn('[COLLECTION AUTH] restore failed', err);
        // dispatch(logout());
        navigation.navigate('CollectionLogin')
      }
    };

    restoreCollection();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* <ActivityIndicator size="large" /> */}
      <Text>Loading</Text>
    </View>
  );
};

export default AuthLogin;
