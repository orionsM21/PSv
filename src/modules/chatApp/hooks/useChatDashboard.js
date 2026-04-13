import {Alert, InteractionManager} from 'react-native';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';

import useAuthSession from '../../../core/auth/useAuthSession';
import {logout, logoutOnly} from '../../../redux/moduleSlice';
import {matchDirectoryContacts} from '../business/chatDirectory.rules';
import {
  loadDirectoryContacts,
  requestDirectoryAccess,
  watchDirectoryUsers,
} from '../services/chatDirectory.service';
import {signOutChatSession} from '../services/chatIdentity.service';

export default function useChatDashboard() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {uid: currentUserId} = useAuthSession();

  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const deferredSearch = useDeferredValue(search);

  const loadContacts = useCallback(async () => {
    try {
      const permission = await requestDirectoryAccess();

      if (!permission?.granted) {
        setError('Contacts permission denied');
        return;
      }

      const data = await loadDirectoryContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (nextError) {
      console.log('Contact load error:', nextError);
      setError('Failed to load contacts');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await loadContacts();
      } catch {
        if (mounted) {
          setError('Failed to load contacts');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const unsubscribe = watchDirectoryUsers(users => {
      if (!mounted) {
        return;
      }

      setDirectoryUsers(Array.isArray(users) ? users : []);
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [loadContacts]);

  const matchedUsers = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return matchDirectoryContacts({
      contacts,
      currentUid: currentUserId,
      directoryUsers,
      search: deferredSearch,
    });
  }, [contacts, currentUserId, deferredSearch, directoryUsers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadContacts();
    } finally {
      setRefreshing(false);
    }
  }, [loadContacts]);

  const handleOpenChat = useCallback(
    contact => {
      if (!contact?.uid) {
        return;
      }

      navigation.navigate('chat', {contact});
    },
    [navigation],
  );

  const handleOpenAddContact = useCallback(() => {
    navigation.navigate('AddContact', {
      onGoBack: handleRefresh,
    });
  }, [handleRefresh, navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Where do you want to go?', [
      {
        text: 'Module Selector',
        onPress: () => {
          InteractionManager.runAfterInteractions(() => {
            signOutChatSession()
              .catch(() => null)
              .finally(() => {
                dispatch(logout());
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{name: 'ModuleSelector'}],
                  }),
                );
              });
          });
        },
      },
      {
        text: 'Login Again',
        onPress: () => {
          InteractionManager.runAfterInteractions(() => {
            signOutChatSession()
              .catch(() => null)
              .finally(() => {
                dispatch(logoutOnly());
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{name: 'ModuleFlow'}],
                  }),
                );
              });
          });
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  }, [dispatch, navigation]);

  return {
    directoryCount: directoryUsers.length,
    error,
    loading,
    matchedUsers,
    onLogout: handleLogout,
    onOpenAddContact: handleOpenAddContact,
    onOpenChat: handleOpenChat,
    onRefresh: handleRefresh,
    onSearchChange: setSearch,
    refreshing,
    search,
  };
}
