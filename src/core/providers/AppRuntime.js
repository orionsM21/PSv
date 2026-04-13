import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {getApp} from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {
  getDatabase,
  onDisconnect,
  ref,
  serverTimestamp,
  update,
} from '@react-native-firebase/database';
import {useSelector} from 'react-redux';

import useAuthSession from '../../core/auth/useAuthSession';
import {registerPushInstallation} from '../../modules/chatApp/usecases/notification.usecases';
import {setPresence} from '../../modules/chatApp/usecases/presence.usecases';
import {
  buildChatNotificationPayload,
  flushPendingChatNotification,
  queueChatNotificationOpen,
} from '../../modules/chatApp/services/chatNotification.service';

function uniqueUserIds(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export default function AppRuntime({children}) {
  const isLoggedIn = useSelector(state => state.module.isLoggedIn);
  const selectedModule = useSelector(state => state.module.selectedModule);
  const {uid, initializing} = useAuthSession();
  const selectedModuleRef = useRef(selectedModule);

  useEffect(() => {
    selectedModuleRef.current = selectedModule;
  }, [selectedModule]);

  useEffect(() => {
    PushNotification.createChannel({
      channelId: 'fcm-default',
      channelName: 'General',
      importance: 4,
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });

    PushNotification.configure({
      onNotification: notification => {
        if (!notification?.userInteraction) {
          return;
        }

        queueChatNotificationOpen(notification).catch(() => null);
      },
      popInitialNotification: true,
      requestPermissions: false,
    });
  }, []);

  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(async message => {
      const notificationPayload = buildChatNotificationPayload(message);

      PushNotification.localNotification({
        channelId: 'fcm-default',
        largeIcon: 'go_fin',
        message:
          message?.notification?.body ||
          message?.data?.body ||
          'Message received',
        smallIcon: 'go_fin',
        title:
          notificationPayload?.senderName ||
          notificationPayload?.senderPhone ||
          message?.notification?.title ||
          message?.data?.title ||
          'New Message',
        userInfo: notificationPayload,
      });
    });

    const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp(
      remoteMessage => {
        queueChatNotificationOpen(remoteMessage).catch(() => null);
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          queueChatNotificationOpen(remoteMessage).catch(() => null);
        }
      })
      .catch(() => null);

    return () => {
      unsubscribeForeground();
      unsubscribeNotificationOpen();
    };
  }, []);

  useEffect(() => {
    if (initializing || !uid) {
      return undefined;
    }

    const authUid = auth().currentUser?.uid || uid;
    const registrationTargets = uniqueUserIds([uid, authUid]);
    let isMounted = true;
    let unsubscribeTokenRefresh = () => {};

    Promise.all(
      registrationTargets.map(targetUid => registerPushInstallation(targetUid)),
    )
      .then(unsubscribes => {
        if (isMounted) {
          unsubscribeTokenRefresh = () => {
            unsubscribes.forEach(unsubscribe => unsubscribe?.());
          };
        } else {
          unsubscribes.forEach(unsubscribe => unsubscribe?.());
        }
      })
      .catch(error => {
        console.log('Push registration failed:', error?.message || error);
      });

    return () => {
      isMounted = false;
      unsubscribeTokenRefresh?.();
    };
  }, [uid, initializing]);

  useEffect(() => {
    if (initializing) {
      return;
    }

    flushPendingChatNotification({
      currentUserId: uid,
      isLoggedIn,
      selectedModule,
    }).catch(() => null);
  }, [initializing, isLoggedIn, selectedModule, uid]);

  useEffect(() => {
    if (initializing || !uid) {
      return undefined;
    }

    const database = getDatabase(getApp());
    const authUid = auth().currentUser?.uid || uid;
    const presenceTargets = uniqueUserIds([uid, authUid]);

    presenceTargets.forEach(targetUid => {
      const presenceRef = ref(database, `presence/${targetUid}`);

      onDisconnect(presenceRef)
        .set({
          activeModule: null,
          lastSeen: serverTimestamp(),
          online: false,
        })
        .catch(() => null);
    });

    const applyPresence = state => {
      const isActive = state === 'active';

      Promise.allSettled(
        presenceTargets.map(targetUid =>
          setPresence(targetUid, {
            activeModule: isActive ? selectedModuleRef.current || null : null,
            lastSeen: isActive ? null : Date.now(),
            online: isActive,
            updatedAt: Date.now(),
          }),
        ),
      ).catch(() => null);
    };

    applyPresence(AppState.currentState);

    const subscription = AppState.addEventListener('change', applyPresence);

    return () => {
      subscription.remove();
      Promise.allSettled(
        presenceTargets.map(targetUid =>
          setPresence(targetUid, {
            activeModule: null,
            lastSeen: Date.now(),
            online: false,
            updatedAt: Date.now(),
          }),
        ),
      ).catch(() => null);
    };
  }, [uid, initializing]);

  useEffect(() => {
    if (initializing || !uid) {
      return;
    }

    const authUid = auth().currentUser?.uid || uid;

    Promise.allSettled(
      uniqueUserIds([uid, authUid]).map(targetUid =>
        update(ref(getDatabase(getApp()), `presence/${targetUid}`), {
          activeModule: selectedModule || null,
          updatedAt: Date.now(),
        }),
      ),
    ).catch(() => null);
  }, [selectedModule, uid, initializing]);

  return children;
}
