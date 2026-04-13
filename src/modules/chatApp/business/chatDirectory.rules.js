// export function getAvatarLabel(name = '') {
//   const parts = String(name).trim().split(/\s+/).filter(Boolean);

//   if (!parts.length) {
//     return '?';
//   }

//   return parts
//     .slice(0, 2)
//     .map(part => part[0]?.toUpperCase() || '')
//     .join('');
// }

// export const mapDirectoryUsers = rawUsers => {
//   if (!rawUsers || typeof rawUsers !== 'object') return [];

//   return Object.entries(rawUsers).map(([uid, value]) => ({
//     uid,
//     phone: value?.phone || '',
//     name: value?.name || '',        // ✅ ADD
//     avatar: value?.avatar || '',    // ✅ ADD
//     online: value?.online || false,
//   }));
// };

// export function normalizePhone(value = '') {
//   let phone = String(value).replace(/\D/g, '');

//   // Remove leading 0
//   if (phone.length === 11 && phone.startsWith('0')) {
//     phone = phone.slice(1);
//   }

//   // Handle India (+91)
//   if (phone.length > 10 && phone.startsWith('91')) {
//     phone = phone.slice(-10);
//   }

//   return phone;
// }
// export function matchDirectoryContacts({
//   contacts = [],
//   directoryUsers = [],
//   currentUid,
//   search = '',
// }) {
//   const phoneMap = new Map();

//   // 🔥 Build lookup map
//   directoryUsers.forEach(user => {
//     if (!user?.phone || !user?.uid) return;

//     const normalized = normalizePhone(user.phone);

//     if (normalized.length === 10) {
//       phoneMap.set(normalized, user);
//     }
//   });

//   const seen = new Set();

//   let result = [];

//   contacts.forEach(contact => {
//     const numbers = contact?.phoneNumbers || [];

//     numbers.forEach(entry => {
//       const normalized = normalizePhone(entry?.number);
//       const matchedUser = phoneMap.get(normalized);

//       if (!matchedUser) return;
//       if (matchedUser.uid === currentUid) return;

//       // Deduplication
//       if (seen.has(matchedUser.uid)) return;
//       seen.add(matchedUser.uid);

//       const displayName =
//         contact?.displayName ||
//         [contact?.givenName, contact?.familyName]
//           .filter(Boolean)
//           .join(' ') ||
//         'Unknown';

//       result.push({
//         uid: matchedUser.uid,
//         displayName,
//         phone: matchedUser.phone,
//         avatar: contact?.thumbnailPath || '',
//       });
//     });
//   });

//   // 🔍 Search filter
//   if (search?.trim()) {
//     const lower = search.toLowerCase();

//     result = result.filter(item =>
//       item.displayName.toLowerCase().includes(lower) ||
//       item.phone.includes(search)
//     );
//   }

//   return result.sort((a, b) =>
//     a.displayName.localeCompare(b.displayName)
//   );
// }

import {
  getAllContacts,
  requestContactsPermission,
} from '../api/chatContactsApi';

import {subscribeToDirectoryUsers} from '../api/chatDirectoryApi';
// import { mapDirectoryUsers } from '../business/chatDirectory.rules';

// ==============================
// 🔐 PERMISSION
// ==============================

export function getAvatarLabel(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return '?';
  }

  return parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
}

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

export function normalizePhone(value = '') {
  let phone = String(value).replace(/\D/g, '');

  if (phone.length === 11 && phone.startsWith('0')) {
    phone = phone.slice(1);
  }

  if (phone.length > 10 && phone.startsWith('91')) {
    phone = phone.slice(-10);
  }

  if (phone.length > 10) {
    phone = phone.slice(-10);
  }

  return phone;
}

export const mapDirectoryUsers = rawUsers => {
  if (!rawUsers || typeof rawUsers !== 'object') {
    return [];
  }

  const canonicalUsers = new Map();

  Object.keys(rawUsers).forEach(uid => {
    const value = rawUsers[uid] || {};
    const canonicalUid = value?.mergedInto || value?.canonicalUid || uid;
    const existingUser = canonicalUsers.get(canonicalUid);
    const nextUser = {
      uid: canonicalUid,
      phone: value?.phone || existingUser?.phone || '',
      name: value?.name || existingUser?.name || '',
      avatar: value?.avatar || existingUser?.avatar || '',
      online: Boolean(value?.online || existingUser?.online),
    };

    canonicalUsers.set(canonicalUid, nextUser);
  });

  return [...canonicalUsers.values()];
};

export function matchDirectoryContacts({
  contacts = [],
  directoryUsers = [],
  currentUid,
  search = '',
}) {
  const phoneMap = new Map();

  directoryUsers.forEach(user => {
    if (!user?.phone || !user?.uid) {
      return;
    }

    const normalized = normalizePhone(user.phone);

    if (normalized.length === 10) {
      phoneMap.set(normalized, user);
    }
  });

  const seen = new Set();
  let result = [];

  contacts.forEach(contact => {
    const numbers = contact?.phoneNumbers || [];

    numbers.forEach(entry => {
      const normalized = normalizePhone(entry?.number);

      if (normalized.length !== 10) {
        return;
      }

      const matchedUser = phoneMap.get(normalized);

      if (!matchedUser) {
        return;
      }
      if (matchedUser.uid === currentUid) {
        return;
      }

      if (seen.has(matchedUser.uid)) {
        return;
      }
      seen.add(matchedUser.uid);

      const displayName =
        contact.displayName ||
        [contact.givenName, contact.familyName].filter(Boolean).join(' ') ||
        matchedUser.name ||
        'Unknown';

      result.push({
        uid: matchedUser.uid,
        displayName,
        phone: matchedUser.phone,
        avatar: contact?.thumbnailPath || matchedUser.avatar || '',
      });
    });
  });

  if (search?.trim()) {
    const lower = search.toLowerCase();

    result = result.filter(
      item =>
        item.displayName.toLowerCase().includes(lower) ||
        item.phone.includes(search),
    );
  }

  return result.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
