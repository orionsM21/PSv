import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { getDatabase, ref, set, update } from '@react-native-firebase/database';

const STORAGE_KEYS = {
  currentUserId: 'currentUserId',
  displayUserId: 'displayUserId',
};

// export async function signInToChat({phone}) {
//   const userCredential = await auth().signInAnonymously();
//   const uid = userCredential?.user?.uid;

//   if (!uid) {
//     throw new Error('Unable to create chat session.');
//   }

//   const database = getDatabase(getApp());
//   const payload = {
//     phone,
//     displayName: phone,
//     createdAt: Date.now(),
//     updatedAt: Date.now(),
//   };

//   await AsyncStorage.multiSet([
//     [STORAGE_KEYS.currentUserId, uid],
//     [STORAGE_KEYS.displayUserId, phone],
//   ]);

//   await Promise.all([
//     set(ref(database, `users/${uid}`), payload),
//     update(ref(database, `publicUsers/${uid}`), payload),
//   ]);

//   return {
//     uid,
//     phone,
//   };
// }

export async function signInToChat({ phone }) {
  const confirmation = await auth().signInWithPhoneNumber(phone);
  return confirmation;
}