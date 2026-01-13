import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import {
  setModule,
  loginSuccess,
  logout,
  setUserHydrated,
} from '../../../redux/moduleSlice';

import {
  saveToken,
  saveTokenAndID,
  saveUserDetails,
} from '../../../redux/actions';

import { BASE_URL } from '../api/Endpoints';

const AuthLogin = () => {
  const dispatch = useDispatch();
  const hasRunRef = useRef(false); // 🔒 Prevent double execution

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const restoreLOS = async () => {
      try {
        const [
          tokenEntry,
          moduleEntry,
          userNameEntry,
          roleCodeEntry,
        ] = await AsyncStorage.multiGet([
          '@token',
          '@selectedModule',
          '@userName',
          '@roleCode',
        ]);

        const token = tokenEntry?.[1];
        const module = moduleEntry?.[1];
        const userName = userNameEntry?.[1];
        const roleCode = roleCodeEntry?.[1];

        // ❌ Invalid or mismatched session
        if (!token || !userName || module !== 'los') {
          dispatch(logout());
          return;
        }

        // ✅ Step 1: Restore base auth state
        dispatch(setModule('los'));
        dispatch(saveToken(token));

        // ✅ Step 2: Fetch LOS user details
        const res = await axios.get(
          `${BASE_URL}getUserDetailByUserName/${userName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const userDetail = res?.data?.data;
        if (!userDetail) throw new Error('Invalid user detail');

        // ✅ Step 3: Hydrate Redux atomically
        dispatch(saveUserDetails(userDetail));

        dispatch(
          saveTokenAndID({
            token,
            user: {
              userId: String(userDetail.userId),
              name: userName,
            },
          })
        );

        dispatch(loginSuccess(roleCode || null));
        dispatch(setUserHydrated()); // 🔑 LAST STEP
      } catch (err) {
        console.warn('[LOS AUTH] restore failed', err);
        dispatch(logout());
      }
    };

    restoreLOS();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthLogin;
