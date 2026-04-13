import {useCallback, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';

import {loginSuccess, logout} from '../../../redux/moduleSlice';
import {
  ensureChatIdentityProfile,
  normalizeEmail,
  normalizePhone,
  persistChatSession,
  signOutChatSession,
} from '../services/chatIdentity.service';

function normalizeAuthErrorValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function getAuthErrorDetails(error) {
  return {
    code: normalizeAuthErrorValue(error?.code || error?.userInfo?.code),
    nativeCode: normalizeAuthErrorValue(error?.nativeErrorCode),
    message: normalizeAuthErrorValue(
      error?.message || error?.userInfo?.message || error?.nativeErrorMessage,
    ),
    rawMessage: String(
      error?.message ||
        error?.userInfo?.message ||
        error?.nativeErrorMessage ||
        '',
    ).trim(),
  };
}

function matchesAuthError(error, fragments) {
  const details = getAuthErrorDetails(error);

  return fragments.some(fragment => {
    const normalizedFragment = normalizeAuthErrorValue(fragment);

    return (
      details.code.includes(normalizedFragment) ||
      details.nativeCode.includes(normalizedFragment) ||
      details.message.includes(normalizedFragment)
    );
  });
}

function getChatAuthErrorMessage(error, context) {
  if (
    matchesAuthError(error, [
      'too-many-requests',
      'quota-exceeded',
      '17010',
      'retry later',
    ])
  ) {
    return context === 'otpVerify'
      ? 'Too many OTP attempts were made. Wait a while, request a fresh OTP, and try again.'
      : 'Too many attempts were made just now. Please wait a while before trying again.';
  }

  if (matchesAuthError(error, ['network-request-failed', 'network error'])) {
    return 'Network issue detected. Check your internet connection and try again.';
  }

  if (
    matchesAuthError(error, [
      'app-not-authorized',
      'invalid-app-credential',
      'captcha-check-failed',
      'missing-client-identifier',
      'play integrity',
    ])
  ) {
    return 'This build is not fully authorized for Firebase phone verification yet. Check SHA fingerprints, Play Integrity, and App Check setup.';
  }

  if (context === 'phoneSend') {
    if (matchesAuthError(error, ['invalid-phone-number'])) {
      return 'Enter a valid 10 digit mobile number.';
    }

    if (matchesAuthError(error, ['operation-not-allowed'])) {
      return 'Phone number login is not enabled in Firebase Authentication.';
    }

    return (
      getAuthErrorDetails(error).rawMessage ||
      'Unable to send OTP right now. Please try again shortly.'
    );
  }

  if (context === 'otpVerify') {
    if (matchesAuthError(error, ['invalid-verification-code'])) {
      return 'The OTP you entered is incorrect.';
    }

    if (matchesAuthError(error, ['code-expired', 'session-expired'])) {
      return 'This OTP has expired. Request a fresh OTP and try again.';
    }

    return (
      getAuthErrorDetails(error).rawMessage ||
      'Unable to verify the OTP right now. Please request a new code and try again.'
    );
  }

  if (context === 'emailLogin') {
    if (matchesAuthError(error, ['invalid-email'])) {
      return 'Enter a valid email address.';
    }

    if (
      matchesAuthError(error, [
        'invalid-login-credentials',
        'wrong-password',
        'user-not-found',
        'invalid-credential',
      ])
    ) {
      return 'Email or password is incorrect.';
    }

    if (matchesAuthError(error, ['operation-not-allowed'])) {
      return 'Email/password login is not enabled in Firebase Authentication.';
    }

    return (
      getAuthErrorDetails(error).rawMessage ||
      'Unable to login with email right now. Please try again.'
    );
  }

  if (context === 'emailSignup') {
    if (matchesAuthError(error, ['invalid-email'])) {
      return 'Enter a valid email address.';
    }

    if (matchesAuthError(error, ['email-already-in-use'])) {
      return 'This email is already registered. Use Login with Email instead.';
    }

    if (matchesAuthError(error, ['weak-password'])) {
      return 'Use a stronger password with at least 6 characters.';
    }

    if (matchesAuthError(error, ['operation-not-allowed'])) {
      return 'Email signup is not enabled in Firebase Authentication.';
    }

    return (
      getAuthErrorDetails(error).rawMessage ||
      'Unable to create the account right now. Please try again.'
    );
  }

  if (context === 'phoneLink') {
    if (matchesAuthError(error, ['invalid-phone-number'])) {
      return 'Enter a valid 10 digit mobile number before continuing.';
    }

    return (
      getAuthErrorDetails(error).rawMessage ||
      'Unable to save the phone number right now. Please try again.'
    );
  }

  return getAuthErrorDetails(error).rawMessage || 'Something went wrong.';
}

export default function useChatLogin() {
  const dispatch = useDispatch();

  const [phone, setPhone] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingPhoneLink, setPendingPhoneLink] = useState(null);
  const [identityNotice, setIdentityNotice] = useState('');

  const handleSubmit = useCallback(async () => {
    if (normalizePhone(phone).length < 10) {
      setError('Invalid phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIdentityNotice('');
      setConfirmation(null);
      setOtp('');

      const formattedPhone = `+91${normalizePhone(phone)}`;
      const confirmationResult = await auth().signInWithPhoneNumber(
        formattedPhone,
      );

      setConfirmation(confirmationResult);
    } catch (err) {
      console.log('OTP SEND ERROR:', err);
      setError(getChatAuthErrorMessage(err, 'phoneSend'));
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const handleVerifyOtp = useCallback(async () => {
    if (!confirmation) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIdentityNotice('');

      const result = await confirmation.confirm(otp);
      const profile = await ensureChatIdentityProfile({
        authUid: result.user.uid,
        phone: normalizePhone(phone),
      });

      await persistChatSession({
        phone: profile.phone,
        profileUid: profile.uid,
      });
      await AsyncStorage.setItem(
        'phone',
        profile.phone || normalizePhone(phone),
      );
      setPendingPhoneLink(null);

      if (profile.mergedAliasUids.length) {
        setIdentityNotice(
          'Phone and email access now open the same chat profile.',
        );
      }

      dispatch(loginSuccess({uid: profile.uid}));
    } catch (err) {
      console.log('OTP VERIFY ERROR:', err);
      setError(getChatAuthErrorMessage(err, 'otpVerify'));
    } finally {
      setLoading(false);
    }
  }, [confirmation, dispatch, otp, phone]);

  const handleEmailLogin = useCallback(async () => {
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Email & password required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIdentityNotice('');
      setConfirmation(null);
      setOtp('');

      const result = await auth().signInWithEmailAndPassword(
        cleanEmail,
        cleanPassword,
      );
      const profile = await ensureChatIdentityProfile({
        authUid: result.user.uid,
        email: cleanEmail,
        preferredProfileUid: result.user.uid,
      });

      if (!profile.hasPhone) {
        setPendingPhoneLink({email: cleanEmail, uid: profile.uid});
        return;
      }

      await persistChatSession({
        phone: profile.phone,
        profileUid: profile.uid,
      });
      setPendingPhoneLink(null);

      if (profile.mergedAliasUids.length) {
        setIdentityNotice(
          'Existing phone and email details were merged into one chat profile.',
        );
      }

      dispatch(loginSuccess({uid: profile.uid}));
    } catch (err) {
      console.log('EMAIL LOGIN ERROR:', err?.code || err);
      setError(getChatAuthErrorMessage(err, 'emailLogin'));
    } finally {
      setLoading(false);
    }
  }, [dispatch, email, password]);

  const handleSavePhoneAfterEmailLogin = useCallback(
    async (value, uid, userEmail) => {
      try {
        setLoading(true);
        setError('');
        setIdentityNotice('');

        const cleanPhone = normalizePhone(value);

        if (cleanPhone.length !== 10) {
          setError('Invalid phone number');
          return;
        }

        const profile = await ensureChatIdentityProfile({
          authUid: auth().currentUser?.uid || uid,
          email: userEmail,
          phone: cleanPhone,
          preferredProfileUid: uid,
        });

        await persistChatSession({
          phone: profile.phone,
          profileUid: profile.uid,
        });

        if (profile.mergedAliasUids.length) {
          setIdentityNotice(
            'Your phone and email now open the same chat account.',
          );
        }

        setPendingPhoneLink(null);
        dispatch(loginSuccess({uid: profile.uid}));
      } catch (err) {
        console.log('PHONE LINK ERROR:', err);
        setError(getChatAuthErrorMessage(err, 'phoneLink'));
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  const handleEmailSignup = useCallback(async () => {
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Email & password required');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIdentityNotice('');
      setConfirmation(null);
      setOtp('');

      const result = await auth().createUserWithEmailAndPassword(
        cleanEmail,
        cleanPassword,
      );
      const profile = await ensureChatIdentityProfile({
        authUid: result.user.uid,
        email: cleanEmail,
        preferredProfileUid: result.user.uid,
      });

      setPendingPhoneLink({email: cleanEmail, uid: profile.uid});
    } catch (err) {
      console.log('SIGNUP ERROR:', err);
      setError(getChatAuthErrorMessage(err, 'emailSignup'));
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const handleToggleMode = useCallback(() => {
    setIsEmailMode(prev => !prev);
    setError('');
    setIdentityNotice('');
    setConfirmation(null);
    setOtp('');
  }, []);

  const handleBack = useCallback(() => {
    signOutChatSession().catch(() => null);
    dispatch(logout());
  }, [dispatch]);

  return {
    phone,
    otp,
    email,
    password,
    isEmailMode,
    pendingPhoneLink,
    identityNotice,
    loading,
    error,
    confirmation,
    onPhoneChange: setPhone,
    onOtpChange: setOtp,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onSubmit: handleSubmit,
    onVerifyOtp: handleVerifyOtp,
    onEmailLogin: handleEmailLogin,
    onEmailSignup: handleEmailSignup,
    onSavePhoneAfterEmailLogin: handleSavePhoneAfterEmailLogin,
    toggleMode: handleToggleMode,
    onBack: handleBack,
  };
}
