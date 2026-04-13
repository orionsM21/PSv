import React from 'react';
import 'react-native-gesture-handler';
import './src/polyfills/global-shim';
import 'fast-text-encoding';

import {AppRegistry, NativeModules, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import App from './App';
import {name as appName} from './app.json';

// 🔥 Firebase
import appCheck from '@react-native-firebase/app-check';
import messaging from '@react-native-firebase/messaging';

// 🔔 Notifications
import PushNotification from 'react-native-push-notification';

// 🚀 Foreground Service
import ForegroundService from 'react-native-foreground-service';
import {
  COLLECTION_TRACKING_TASK,
  collectionTrackingForegroundTask,
} from './src/modules/collection/service/collectionTrackingService';
import {buildChatNotificationPayload} from './src/modules/chatApp/services/chatNotification.service';

// ==============================
// ✅ ENV INJECTION
// ==============================
(function injectEnv() {
  try {
    const env =
      NativeModules?.AppEnv?.APP_ENV || NativeModules?.AppEnv?.getEnv?.();

    if (env) {
      global.__APP_ENV__ = env;
      console.log('Injected APP_ENV:', env);
    }
  } catch {
    console.log('ENV inject failed');
  }
})();

const readAppEnvValue = key => {
  const env = global.__APP_ENV__;

  if (!env || typeof env !== 'object') {
    return '';
  }

  return String(env[key] || '').trim();
};

const resolveAppCheckDebugToken = () =>
  readAppEnvValue('FIREBASE_APP_CHECK_DEBUG_TOKEN') ||
  readAppEnvValue('APP_CHECK_DEBUG_TOKEN') ||
  readAppEnvValue('appCheckDebugToken');

let appCheckInitialized = false;

// ==============================
// FIREBASE APP CHECK INIT
// ==============================
const initAppCheck = async () => {
  if (appCheckInitialized) {
    return;
  }

  try {
    const provider = appCheck().newReactNativeFirebaseAppCheckProvider();

    if (__DEV__) {
      const debugToken = resolveAppCheckDebugToken();

      if (!debugToken) {
        console.log(
          'App Check skipped in debug mode because no debug token is configured.',
        );
        return;
      }

      provider.configure({
        android: {
          provider: 'debug',
          debugToken,
        },
        apple: {
          provider: 'debug',
          debugToken,
        },
        isTokenAutoRefreshEnabled: true,
      });

      await appCheck().initializeAppCheck({
        provider,
        isTokenAutoRefreshEnabled: true,
      });
      appCheckInitialized = true;
      console.log('Firebase App Check initialized in debug mode.');
      return;
    }

    provider.configure({
      android: {
        provider: 'playIntegrity',
      },
      apple: {
        provider: 'deviceCheck',
      },
      isTokenAutoRefreshEnabled: true,
    });

    await appCheck().initializeAppCheck({
      provider,
      isTokenAutoRefreshEnabled: true,
    });
    appCheckInitialized = true;
    console.log('Firebase App Check initialized for production.');
  } catch (error) {
    console.log(
      'App Check init failed:',
      error?.code || error?.message || error,
    );
  }
};

initAppCheck();

// ==============================
// 🚀 FOREGROUND TASK REGISTER
// ==============================
ForegroundService.registerForegroundTask(
  COLLECTION_TRACKING_TASK,
  collectionTrackingForegroundTask,
);

// ==============================
// 🔔 BACKGROUND FCM HANDLER
// ==============================
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // If FCM already includes a notification payload, let Android show it once.
  if (remoteMessage?.notification) {
    return;
  }

  const notificationPayload = buildChatNotificationPayload(remoteMessage);
  const title =
    notificationPayload?.senderName ||
    notificationPayload?.senderPhone ||
    remoteMessage?.notification?.title ||
    remoteMessage?.data?.title ||
    'New Notification';

  const message =
    remoteMessage?.notification?.body ||
    remoteMessage?.data?.body ||
    remoteMessage?.data?.info ||
    'You have received a new notification.';

  PushNotification.localNotification({
    channelId: 'fcm-default',
    largeIcon: 'go_fin',
    title,
    message,
    smallIcon: 'go_fin',
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
    userInfo: notificationPayload,
    vibrate: true,
  });
});

// ==============================
// 🧩 ROOT COMPONENT
// ==============================
const Root = () => (
  <GestureHandlerRootView style={styles.root}>
    <App />
  </GestureHandlerRootView>
);

// ==============================
// 🚀 APP REGISTER
// ==============================
AppRegistry.registerComponent(appName, () => Root);

// ==============================
// 🎨 STYLES
// ==============================
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
