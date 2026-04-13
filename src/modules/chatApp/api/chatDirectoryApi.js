import {getApp} from '@react-native-firebase/app';
import {getDatabase, onValue, ref} from '@react-native-firebase/database';

export function subscribeToDirectoryUsers(onUsers, onError) {
  const database = getDatabase(getApp());
  const publicUsersRef = ref(database, 'publicUsers');

  return onValue(
    publicUsersRef,
    snapshot => {
      onUsers({
        publicUsers: snapshot.val() || {},
      });
    },
    onError,
  );
}
