import React, {useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {loginSuccess, logout} from '../../../redux/moduleSlice';
import GenericLogin from '../../../Login/GenericLogin';
import {LOGIN_CONFIGS} from '../../../Login/loginConfigs';
import {useLoginHandler} from '../../../Login/userLoginHandler';

export default function VehicleLogin() {
  const dispatch = useDispatch();

  const loginFn = useCallback(
    async ({userId}) => {
      await new Promise(resolve => setTimeout(resolve, 900));
      await AsyncStorage.setItem('@lastVehicleUser', userId.trim());
      dispatch(loginSuccess());
    },
    [dispatch],
  );

  const {handleLogin, loading} = useLoginHandler(loginFn);

  const handleBack = useCallback(() => {
    dispatch(logout());
    return true;
  }, [dispatch]);

  return (
    <GenericLogin
      {...LOGIN_CONFIGS.vehicle}
      onLogin={handleLogin}
      loading={loading}
      logo={require('../../../asset/icon/goFin.png')}
      footerLogo={require('../../../asset/icon/goFin.png')}
      onBackPress={handleBack}
    />
  );
}
