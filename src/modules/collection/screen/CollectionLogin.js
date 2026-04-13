import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';

import GenericLogin from '../../../Login/GenericLogin';
import {LOGIN_CONFIGS} from '../../../Login/loginConfigs';
import apiClient from '../../../common/hooks/apiClient';
import {
  saveRoleCode,
  saveTokenAndID,
  saveUserProfile,
} from '../../../redux/actions';
import {loginSuccess, logout} from '../../../redux/moduleSlice';

export default function CollectionLogin() {
  const navigation = useNavigation();
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

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('[PERM] Notifications not granted');
        }
      } catch (error) {
        console.warn('[PERM] Notification error', error);
      }
    }
  }, []);

  const requestLocationPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const fineLocationGranted =
        permissions[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const coarseLocationGranted =
        permissions[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;

      if (!fineLocationGranted || !coarseLocationGranted) {
        return false;
      }

      if (Platform.Version >= 29) {
        const backgroundLocation = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        );

        return backgroundLocation === PermissionsAndroid.RESULTS.GRANTED;
      }

      return true;
    } catch (error) {
      console.warn('[PERM] Location permission error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    requestLocationPermissions();
    requestNotificationPermission();
  }, [requestLocationPermissions, requestNotificationPermission]);

  const handleLogin = useCallback(
    async ({userId, password}) => {
      const normalizedUserId = userId.trim();
      const normalizedPassword = password.trim();

      if (!normalizedUserId || !normalizedPassword) {
        Alert.alert('Missing Info', 'Please enter credentials');
        return;
      }

      if (!isOnline) {
        Alert.alert('No Internet', 'Check your internet connection');
        return;
      }

      setLoading(true);

      try {
        const tokenResponse = await apiClient.post('mobile/token?type=uid', {
          principal: normalizedUserId,
          credentials: normalizedPassword,
        });

        const {response, token, user: userInfo} = tokenResponse?.data || {};

        if (
          [
            'Access denied',
            'Bad credentials',
            'Password is inactive...',
            'Invalid user ID',
          ].includes(response)
        ) {
          Alert.alert(response);
          return;
        }

        if (!userInfo?.name || !userInfo?.userId) {
          Alert.alert(
            'Login Failed',
            'User information is missing from server.',
          );
          return;
        }

        const userNameString = `${userInfo.name}`;
        const userIdString = `${userInfo.userId}`;

        const userResponse = await apiClient.get(
          `getUserByUserNameForDashboard/${encodeURIComponent(userNameString)}`,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const userData = userResponse?.data?.data;
        const roleCode = userData?.role?.[0]?.roleCode || '';

        await AsyncStorage.multiSet([
          ['@token', token],
          ['@selectedModule', 'collection'],
          ['@isLoggedIn', 'true'],
          ['@userId', userIdString],
          ['@userName', userNameString],
          ['@roleCode', roleCode],
          ['@userProfile', JSON.stringify(userData)],
        ]);

        dispatch(
          saveTokenAndID({
            messageKey: true,
            token,
            user: {
              name: userNameString,
              userId: userIdString,
            },
          }),
        );
        dispatch(saveUserProfile(userData));
        dispatch(saveRoleCode(roleCode));

        if (userResponse?.data?.msgKey === 'Success') {
          dispatch(loginSuccess());
        }
      } catch (error) {
        Alert.alert('Login Failed', error?.message || JSON.stringify(error));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, isOnline],
  );

  const linkItems = useMemo(
    () => [
      {
        label: isOnline ? 'Field sync active' : 'Offline mode',
        disabled: true,
      },
      {
        label: 'Forgot Password?',
        onPress: () => navigation.navigate('Forgotpassword'),
      },
    ],
    [isOnline, navigation],
  );

  return (
    <GenericLogin
      {...LOGIN_CONFIGS.collection}
      onLogin={handleLogin}
      loading={loading}
      logo={require('../../../asset/images/goFin.png')}
      footerLogo={require('../../../asset/images/goFin.png')}
      onBackPress={handleBack}
      linkItems={linkItems}
    />
  );
}
