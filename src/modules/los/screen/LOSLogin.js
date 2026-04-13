import React, {useCallback, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {useDispatch} from 'react-redux';
import axios from 'axios';

import GenericLogin from '../../../Login/GenericLogin';
import {LOGIN_CONFIGS} from '../../../Login/loginConfigs';
import {
  saveToken,
  saveTokenAndID,
  saveUserDetails,
} from '../../../redux/actions';
import {
  loginSuccess,
  logout,
  setUserHydrated,
} from '../../../redux/moduleSlice';
import {BASE_URL} from '../api/Endpoints';

export default function LOSLogin() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const handleBack = useCallback(() => {
    dispatch(logout());
    return true;
  }, [dispatch]);

  const handleLogin = useCallback(
    async ({userId, password}) => {
      const normalizedUserId = userId.trim();
      const normalizedPassword = password.trim();

      if (!normalizedUserId || !normalizedPassword) {
        Alert.alert('Error', 'Please enter both username and password.');
        return;
      }

      if (!isOnline) {
        Alert.alert(
          'No Internet',
          'Check your internet connection and try again.',
        );
        return;
      }

      setLoading(true);

      try {
        const payload = {
          userName: normalizedUserId,
          password: normalizedPassword,
        };

        const {data} = await axios.post(`${BASE_URL}login`, payload);
        const token = data.data.token;
        const loggedInUserName = data.data.userName;

        dispatch(saveToken(token));

        await AsyncStorage.setItem('@token', token);
        await AsyncStorage.setItem('@userName', loggedInUserName);

        const userDetailResponse = await axios.get(
          `${BASE_URL}getUserDetailByUserName/${loggedInUserName}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        const userDetailData = userDetailResponse.data.data;
        const uid = String(userDetailData.userId);
        const roleCode = userDetailData.role?.[0]?.roleCode || '';

        dispatch(saveUserDetails(userDetailData));
        await AsyncStorage.setItem('@roleCode', roleCode);

        dispatch(
          saveTokenAndID({
            token,
            user: {
              userId: uid,
              name: loggedInUserName,
            },
          }),
        );
        dispatch(setUserHydrated());

        try {
          const fcmToken = await messaging().getToken();

          if (fcmToken) {
            await axios.post(
              `${BASE_URL}saveFcmToken`,
              {
                userName: loggedInUserName,
                fcmToken,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          }
        } catch (fcmError) {
          console.error('Failed to save FCM token:', fcmError);
        }

        dispatch(loginSuccess(roleCode));

        await AsyncStorage.multiSet([
          ['@token', token],
          ['@selectedModule', 'los'],
          ['@isLoggedIn', 'true'],
          ['@userName', loggedInUserName],
          ['@roleCode', roleCode],
        ]);
      } catch (error) {
        const loginMessage =
          typeof error.response?.data === 'string'
            ? error.response.data
            : 'Unable to login right now. Please try again.';

        Alert.alert('Login failed', loginMessage);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, isOnline],
  );

  return (
    <GenericLogin
      {...LOGIN_CONFIGS.los}
      onLogin={handleLogin}
      loading={loading}
      logo={require('../../../asset/icon/goFin.png')}
      footerLogo={require('../../../asset/icon/goFin.png')}
      onBackPress={handleBack}
      linkItems={[
        {
          label: isOnline ? 'Network ready' : 'Offline mode',
          disabled: true,
        },
        {
          label: 'Role sync enabled',
          disabled: true,
        },
      ]}
    />
  );
}
