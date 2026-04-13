import React, {useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import GenericLogin from '../../Login/GenericLogin';
import {LOGIN_CONFIGS} from '../../Login/loginConfigs';
import {useLoginHandler} from '../../Login/userLoginHandler';
import {loginSuccess, logout} from '../../redux/moduleSlice';

export default function PaymentLogin() {
  const dispatch = useDispatch();

  const loginFn = useCallback(
    async ({userId}) => {
      await new Promise(resolve => setTimeout(resolve, 900));
      await AsyncStorage.setItem('@lastPaymentUser', userId.trim());
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
      {...LOGIN_CONFIGS.payment}
      onLogin={handleLogin}
      loading={loading}
      logo={require('../../asset/icon/goFin.png')}
      footerLogo={require('../../asset/icon/goFin.png')}
      onBackPress={handleBack}
    />
  );
}
