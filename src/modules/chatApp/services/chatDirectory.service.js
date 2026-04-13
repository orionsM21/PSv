import {
  getAllContacts,
  requestContactsPermission,
} from '../api/chatContactsApi';

import { subscribeToDirectoryUsers } from '../api/chatDirectoryApi';
import { mapDirectoryUsers } from '../business/chatDirectory.rules';

// ==============================
// 🔐 PERMISSION
// ==============================
export async function requestDirectoryAccess() {
  const permission = await requestContactsPermission('read');

  if (!permission.granted) {
    throw new Error(
      permission.blocked
        ? 'Enable contacts permission from settings'
        : 'Contacts permission required',
    );
  }

  return permission;
}

// ==============================
// 📱 CONTACTS
// ==============================
export async function loadDirectoryContacts() {
  return getAllContacts();
}

// ==============================
// 🔥 FIREBASE WATCH (ONLY PLACE FOR MAPPING)
// ==============================
export function watchDirectoryUsers(onUsers) {
  return subscribeToDirectoryUsers(data => {
    const raw = data?.publicUsers || {};

    const mapped = mapDirectoryUsers(raw);

    console.log('🔥 SERVICE MAPPED USERS:', mapped);

    onUsers(mapped); // ✅ ALWAYS ARRAY
  });
}