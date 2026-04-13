import Contacts from 'react-native-contacts';
import { PermissionsAndroid, Platform } from 'react-native';

const READ_CONTACTS = PermissionsAndroid.PERMISSIONS.READ_CONTACTS;
const WRITE_CONTACTS = PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS;

export async function requestContactsPermission(mode = 'read') {
  if (Platform.OS === 'ios') {
    const status = await Contacts.requestPermission();
    return {
      granted: status === 'authorized',
      blocked: status === 'denied',
    };
  }

  if (Platform.OS !== 'android') {
    return {
      granted: true,
      blocked: false,
    };
  }

  const permissions =
    mode === 'write' ? [READ_CONTACTS, WRITE_CONTACTS] : [READ_CONTACTS];

  const granted = await PermissionsAndroid.requestMultiple(permissions);
  const isGranted = permissions.every(
    permission => granted[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );
  const isBlocked = permissions.some(
    permission =>
      granted[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  );

  return {
    granted: isGranted,
    blocked: isBlocked,
  };
}

export async function getAllContacts() {
  return Contacts.getAll();
}

export async function saveContact(contact) {
  return new Promise((resolve, reject) => {
    Contacts.addContact(contact, error => {
      if (error) {
        reject(error);
        return;
      }

      resolve(contact);
    });
  });
}
