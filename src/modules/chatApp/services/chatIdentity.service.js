import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApp} from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {get, getDatabase, ref, update} from '@react-native-firebase/database';

export const CHAT_STORAGE_KEYS = {
  currentUserId: 'currentUserId',
  phone: 'phone',
};

function database() {
  return getDatabase(getApp());
}

function isPermissionDeniedError(error) {
  const raw = String(error?.code || error?.message || '').toLowerCase();

  return raw.includes('permission-denied');
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function pickFirstString(...values) {
  return (
    values.find(value => {
      const nextValue = asString(value);
      return Boolean(nextValue);
    }) || ''
  );
}

function pickEarliestTimestamp(...values) {
  const timestamps = values
    .map(value => Number(value))
    .filter(value => Number.isFinite(value) && value > 0);

  return timestamps.length ? Math.min(...timestamps) : Date.now();
}

function toBooleanMap(...maps) {
  return maps.reduce((result, nextMap) => {
    Object.keys(nextMap || {}).forEach(key => {
      if (asString(key)) {
        result[key] = true;
      }
    });

    return result;
  }, {});
}

function buildEmailLookupKey(email = '') {
  return ['.', '#', '$', '/', '[', ']'].reduce(
    (result, token) => result.split(token).join('_'),
    asString(email).toLowerCase(),
  );
}

function deriveDisplayName({
  email,
  canonicalPublic = {},
  canonicalUser = {},
  sourcePublic = [],
  sourceUsers = [],
}) {
  const candidateName = pickFirstString(
    canonicalPublic?.name,
    canonicalUser?.displayName,
    canonicalUser?.name,
    ...sourcePublic.map(item => item?.name),
    ...sourceUsers.map(item => item?.displayName),
    ...sourceUsers.map(item => item?.name),
  );

  if (candidateName) {
    return candidateName;
  }

  const normalizedEmail = asString(email).toLowerCase();

  if (!normalizedEmail) {
    return '';
  }

  return normalizedEmail.split('@')[0] || normalizedEmail;
}

function resolveAlias(uid, usersByUid, publicUsersByUid) {
  let currentUid = asString(uid);
  const visited = new Set();

  while (currentUid && !visited.has(currentUid)) {
    visited.add(currentUid);

    const nextUid = pickFirstString(
      usersByUid[currentUid]?.mergedInto,
      publicUsersByUid[currentUid]?.mergedInto,
    );

    if (!nextUid || nextUid === currentUid) {
      return currentUid;
    }

    currentUid = nextUid;
  }

  return asString(uid);
}

async function getValueIfAllowed(path, fallbackValue = null) {
  try {
    const snapshot = await get(ref(database(), path));
    return snapshot.val();
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return fallbackValue;
    }

    throw error;
  }
}

async function fetchRecordsByUid(uids, usersByUid, publicUsersByUid) {
  const nextUids = unique(
    uids.filter(uid => !usersByUid[uid] && !publicUsersByUid[uid]),
  );

  if (!nextUids.length) {
    return;
  }

  const [userSnapshots, publicSnapshots] = await Promise.all([
    Promise.all(nextUids.map(uid => getValueIfAllowed(`users/${uid}`, {}))),
    Promise.all(
      nextUids.map(uid => getValueIfAllowed(`publicUsers/${uid}`, {})),
    ),
  ]);

  nextUids.forEach((uid, index) => {
    usersByUid[uid] = userSnapshots[index] || {};
    publicUsersByUid[uid] = publicSnapshots[index] || {};
  });
}

function buildSelfScopedChatProfile({
  authUid,
  email,
  phone,
  existingUser = {},
  existingPublic = {},
  existingPhoneMapping = '',
}) {
  const normalizedAuthUid = asString(authUid);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);
  const nextEmail = normalizedEmail || normalizeEmail(existingUser?.email);
  const nextPhone =
    normalizedPhone ||
    normalizePhone(pickFirstString(existingUser?.phone, existingPublic?.phone));
  const nextDisplayName = deriveDisplayName({
    canonicalPublic: existingPublic,
    canonicalUser: existingUser,
    email: nextEmail,
    sourcePublic: [],
    sourceUsers: [],
  });
  const nextAvatar = pickFirstString(existingPublic?.avatar);
  const nextCreatedAt = pickEarliestTimestamp(existingUser?.createdAt);
  const nextAuthUids = toBooleanMap(
    existingUser?.authUids,
    normalizedAuthUid ? {[normalizedAuthUid]: true} : {},
  );
  const now = Date.now();
  const updates = {};

  updates[`users/${normalizedAuthUid}/canonicalUid`] = normalizedAuthUid;
  updates[`users/${normalizedAuthUid}/mergedInto`] = null;
  updates[`users/${normalizedAuthUid}/createdAt`] = nextCreatedAt;
  updates[`users/${normalizedAuthUid}/updatedAt`] = now;
  updates[`users/${normalizedAuthUid}/lastLoginAt`] = now;
  updates[`users/${normalizedAuthUid}/online`] = true;
  updates[`users/${normalizedAuthUid}/authUids`] = nextAuthUids;

  if (nextPhone) {
    updates[`users/${normalizedAuthUid}/phone`] = nextPhone;

    if (!asString(existingPhoneMapping)) {
      updates[`phoneToUid/${nextPhone}`] = normalizedAuthUid;
    }
  }

  if (nextEmail) {
    updates[`users/${normalizedAuthUid}/email`] = nextEmail;
  }

  if (nextDisplayName) {
    updates[`users/${normalizedAuthUid}/displayName`] = nextDisplayName;
    updates[`users/${normalizedAuthUid}/name`] = nextDisplayName;
  }

  if (nextPhone) {
    updates[`publicUsers/${normalizedAuthUid}/canonicalUid`] =
      normalizedAuthUid;
    updates[`publicUsers/${normalizedAuthUid}/mergedInto`] = null;
    updates[`publicUsers/${normalizedAuthUid}/updatedAt`] = now;
    updates[`publicUsers/${normalizedAuthUid}/online`] = true;
    updates[`publicUsers/${normalizedAuthUid}/phone`] = nextPhone;

    if (nextDisplayName) {
      updates[`publicUsers/${normalizedAuthUid}/name`] = nextDisplayName;
    }

    if (nextAvatar) {
      updates[`publicUsers/${normalizedAuthUid}/avatar`] = nextAvatar;
    }
  }

  return {
    profile: {
      avatar: nextAvatar,
      email: nextEmail,
      hasPhone: Boolean(nextPhone),
      mergedAliasUids: [],
      name: nextDisplayName,
      phone: nextPhone,
      uid: normalizedAuthUid,
    },
    updates,
  };
}

function buildAliasScopedChatProfile({
  authUid,
  canonicalUid,
  email,
  phone,
  canonicalPublic = {},
  canonicalUser = {},
  existingPublic = {},
  existingUser = {},
}) {
  const normalizedAuthUid = asString(authUid);
  const normalizedCanonicalUid = asString(canonicalUid) || normalizedAuthUid;
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);
  const nextEmail =
    normalizedEmail ||
    normalizeEmail(pickFirstString(existingUser?.email, canonicalUser?.email));
  const nextPhone =
    normalizedPhone ||
    normalizePhone(
      pickFirstString(
        existingUser?.phone,
        existingPublic?.phone,
        canonicalUser?.phone,
        canonicalPublic?.phone,
      ),
    );
  const nextDisplayName = deriveDisplayName({
    canonicalPublic: Object.keys(canonicalPublic || {}).length
      ? canonicalPublic
      : existingPublic,
    canonicalUser: Object.keys(canonicalUser || {}).length
      ? canonicalUser
      : existingUser,
    email: nextEmail,
    sourcePublic: [],
    sourceUsers: [],
  });
  const nextAvatar = pickFirstString(
    existingPublic?.avatar,
    canonicalPublic?.avatar,
  );
  const nextCreatedAt = pickEarliestTimestamp(existingUser?.createdAt);
  const nextAuthUids = toBooleanMap(
    existingUser?.authUids,
    normalizedAuthUid ? {[normalizedAuthUid]: true} : {},
  );
  const mergedIntoValue =
    normalizedCanonicalUid && normalizedCanonicalUid !== normalizedAuthUid
      ? normalizedCanonicalUid
      : null;
  const now = Date.now();
  const updates = {};

  updates[`users/${normalizedAuthUid}/canonicalUid`] = normalizedCanonicalUid;
  updates[`users/${normalizedAuthUid}/mergedInto`] = mergedIntoValue;
  updates[`users/${normalizedAuthUid}/createdAt`] = nextCreatedAt;
  updates[`users/${normalizedAuthUid}/updatedAt`] = now;
  updates[`users/${normalizedAuthUid}/lastLoginAt`] = now;
  updates[`users/${normalizedAuthUid}/online`] = true;
  updates[`users/${normalizedAuthUid}/authUids`] = nextAuthUids;

  if (nextPhone) {
    updates[`users/${normalizedAuthUid}/phone`] = nextPhone;
  }

  if (nextEmail) {
    updates[`users/${normalizedAuthUid}/email`] = nextEmail;
  }

  if (nextDisplayName) {
    updates[`users/${normalizedAuthUid}/displayName`] = nextDisplayName;
    updates[`users/${normalizedAuthUid}/name`] = nextDisplayName;
  }

  if (nextPhone || asString(existingPublic?.phone)) {
    updates[`publicUsers/${normalizedAuthUid}/canonicalUid`] =
      normalizedCanonicalUid;
    updates[`publicUsers/${normalizedAuthUid}/mergedInto`] = mergedIntoValue;
    updates[`publicUsers/${normalizedAuthUid}/updatedAt`] = now;
    updates[`publicUsers/${normalizedAuthUid}/online`] = true;

    if (nextPhone) {
      updates[`publicUsers/${normalizedAuthUid}/phone`] = nextPhone;
    }

    if (nextDisplayName) {
      updates[`publicUsers/${normalizedAuthUid}/name`] = nextDisplayName;
    }

    if (nextAvatar) {
      updates[`publicUsers/${normalizedAuthUid}/avatar`] = nextAvatar;
    }
  }

  return {
    profile: {
      avatar: nextAvatar,
      email: nextEmail,
      hasPhone: Boolean(nextPhone),
      mergedAliasUids:
        normalizedCanonicalUid && normalizedCanonicalUid !== normalizedAuthUid
          ? [normalizedAuthUid]
          : [],
      name: nextDisplayName,
      phone: nextPhone,
      uid: normalizedCanonicalUid,
    },
    updates,
  };
}

export function normalizePhone(value = '') {
  let phone = String(value || '').replace(/\D/g, '');

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

export function normalizeEmail(value = '') {
  return asString(value).toLowerCase();
}

export async function persistChatSession({profileUid, phone = ''}) {
  if (!profileUid) {
    return;
  }

  const writes = [[CHAT_STORAGE_KEYS.currentUserId, profileUid]];

  if (phone) {
    writes.push([CHAT_STORAGE_KEYS.phone, phone]);
  }

  await AsyncStorage.multiSet(writes);
}

export async function clearChatSession() {
  await AsyncStorage.multiRemove([
    CHAT_STORAGE_KEYS.currentUserId,
    CHAT_STORAGE_KEYS.phone,
  ]);
}

export async function signOutChatSession() {
  try {
    await auth().signOut();
  } catch {
    // Ignore sign-out failures and still clear the local session markers.
  }

  await clearChatSession();
}

export async function resolveCanonicalProfileId(authUid) {
  const normalizedAuthUid = asString(authUid);

  if (!normalizedAuthUid) {
    return null;
  }

  const [mappedUid, userRecord, publicUser] = await Promise.all([
    getValueIfAllowed(`authUidToProfileUid/${normalizedAuthUid}`, ''),
    getValueIfAllowed(`users/${normalizedAuthUid}`, {}),
    getValueIfAllowed(`publicUsers/${normalizedAuthUid}`, {}),
  ]);

  return (
    pickFirstString(
      mappedUid,
      userRecord?.canonicalUid,
      userRecord?.mergedInto,
      publicUser?.canonicalUid,
      publicUser?.mergedInto,
    ) || normalizedAuthUid
  );
}

export async function loadChatProfile(uid) {
  const canonicalUid = asString(uid);

  if (!canonicalUid) {
    return null;
  }

  const [userRecord, publicUser] = await Promise.all([
    getValueIfAllowed(`users/${canonicalUid}`, {}),
    getValueIfAllowed(`publicUsers/${canonicalUid}`, {}),
  ]);
  const resolvedUid = pickFirstString(
    canonicalUid,
    userRecord?.canonicalUid,
    publicUser?.canonicalUid,
  );

  return {
    avatar: pickFirstString(publicUser?.avatar),
    email: normalizeEmail(userRecord?.email),
    mergedAliasUids: unique([
      ...Object.keys(userRecord?.mergedAliases || {}),
      ...Object.keys(publicUser?.mergedAliases || {}),
    ]),
    name: pickFirstString(
      publicUser?.name,
      userRecord?.displayName,
      userRecord?.name,
    ),
    phone: normalizePhone(
      pickFirstString(publicUser?.phone, userRecord?.phone),
    ),
    uid: resolvedUid,
  };
}

export async function loadChatIdentityTargets(uid) {
  const normalizedUid = asString(uid);

  if (!normalizedUid) {
    return [];
  }

  const [userRecord, publicUser] = await Promise.all([
    getValueIfAllowed(`users/${normalizedUid}`, {}),
    getValueIfAllowed(`publicUsers/${normalizedUid}`, {}),
  ]);

  const canonicalUid = pickFirstString(
    userRecord?.canonicalUid,
    userRecord?.mergedInto,
    publicUser?.canonicalUid,
    publicUser?.mergedInto,
    normalizedUid,
  );

  const canonicalUser =
    canonicalUid === normalizedUid
      ? userRecord
      : await getValueIfAllowed(`users/${canonicalUid}`, {});
  const canonicalPublicUser =
    canonicalUid === normalizedUid
      ? publicUser
      : await getValueIfAllowed(`publicUsers/${canonicalUid}`, {});

  return unique([
    normalizedUid,
    canonicalUid,
    ...Object.keys(canonicalUser?.mergedAliases || {}),
    ...Object.keys(canonicalPublicUser?.mergedAliases || {}),
  ]);
}

export async function resolveActiveChatSession(authUid) {
  const normalizedAuthUid = asString(authUid);

  if (!normalizedAuthUid) {
    return null;
  }

  const [storedProfileUid, resolvedProfileUid] = await Promise.all([
    AsyncStorage.getItem(CHAT_STORAGE_KEYS.currentUserId),
    resolveCanonicalProfileId(normalizedAuthUid),
  ]);

  const candidateUid =
    asString(resolvedProfileUid) || asString(storedProfileUid);

  if (!candidateUid) {
    return null;
  }

  const profile = await loadChatProfile(candidateUid);

  if (!profile?.uid || !profile?.phone) {
    return null;
  }

  await persistChatSession({
    phone: profile.phone,
    profileUid: profile.uid,
  });

  return profile;
}

export async function ensureChatIdentityProfile({
  authUid,
  email = '',
  phone = '',
  preferredProfileUid = '',
}) {
  const normalizedAuthUid = asString(authUid);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);
  const emailKey = buildEmailLookupKey(normalizedEmail);

  if (!normalizedAuthUid && !normalizedEmail && !normalizedPhone) {
    throw new Error(
      'Identity details are required to create the chat profile.',
    );
  }

  const [authMappedUid, phoneMappedUid, emailMappedUid] = await Promise.all([
    normalizedAuthUid
      ? getValueIfAllowed(`authUidToProfileUid/${normalizedAuthUid}`, '')
      : Promise.resolve(''),
    normalizedPhone
      ? getValueIfAllowed(`phoneToUid/${normalizedPhone}`, '')
      : Promise.resolve(''),
    emailKey
      ? getValueIfAllowed(`emailToUid/${emailKey}`, '')
      : Promise.resolve(''),
  ]);

  const usersByUid = {};
  const publicUsersByUid = {};

  let candidateUids = unique([
    preferredProfileUid,
    authMappedUid,
    emailMappedUid,
    phoneMappedUid,
    normalizedAuthUid,
  ]);

  await fetchRecordsByUid(candidateUids, usersByUid, publicUsersByUid);

  let aliasTargets = unique(
    candidateUids.map(uid =>
      pickFirstString(
        usersByUid[uid]?.mergedInto,
        publicUsersByUid[uid]?.mergedInto,
      ),
    ),
  );

  if (aliasTargets.length) {
    await fetchRecordsByUid(aliasTargets, usersByUid, publicUsersByUid);
    candidateUids = unique([...candidateUids, ...aliasTargets]);
  }

  aliasTargets = unique(
    candidateUids.map(uid =>
      pickFirstString(
        usersByUid[uid]?.mergedInto,
        publicUsersByUid[uid]?.mergedInto,
      ),
    ),
  );

  if (aliasTargets.length) {
    await fetchRecordsByUid(aliasTargets, usersByUid, publicUsersByUid);
    candidateUids = unique([...candidateUids, ...aliasTargets]);
  }

  const preferredCandidates = unique([
    preferredProfileUid,
    authMappedUid,
    emailMappedUid,
    phoneMappedUid,
    normalizedAuthUid,
  ]);

  const canonicalUid =
    resolveAlias(
      preferredCandidates.find(uid => asString(uid)),
      usersByUid,
      publicUsersByUid,
    ) || normalizedAuthUid;

  const mergedAliasUids = unique(
    candidateUids.filter(
      uid =>
        uid &&
        resolveAlias(uid, usersByUid, publicUsersByUid) === canonicalUid &&
        uid !== canonicalUid,
    ),
  );

  const canonicalUser = usersByUid[canonicalUid] || {};
  const canonicalPublic = publicUsersByUid[canonicalUid] || {};
  const sourceUsers = mergedAliasUids.map(uid => usersByUid[uid] || {});
  const sourcePublicUsers = mergedAliasUids.map(
    uid => publicUsersByUid[uid] || {},
  );

  const nextPhone =
    normalizedPhone ||
    pickFirstString(
      canonicalUser?.phone,
      canonicalPublic?.phone,
      ...sourceUsers.map(item => item?.phone),
      ...sourcePublicUsers.map(item => item?.phone),
    );
  const nextEmail =
    normalizedEmail ||
    pickFirstString(
      canonicalUser?.email,
      ...sourceUsers.map(item => item?.email),
    );
  const nextDisplayName = deriveDisplayName({
    canonicalPublic,
    canonicalUser,
    email: nextEmail,
    sourcePublic: sourcePublicUsers,
    sourceUsers,
  });
  const nextAvatar = pickFirstString(
    canonicalPublic?.avatar,
    ...sourcePublicUsers.map(item => item?.avatar),
  );
  const nextCreatedAt = pickEarliestTimestamp(
    canonicalUser?.createdAt,
    ...sourceUsers.map(item => item?.createdAt),
  );
  const nextAuthUids = toBooleanMap(
    canonicalUser?.authUids,
    ...sourceUsers.map(item => item?.authUids),
    normalizedAuthUid ? {[normalizedAuthUid]: true} : {},
  );
  const nextMergedAliases = toBooleanMap(
    canonicalUser?.mergedAliases,
    ...sourceUsers.map(item => item?.mergedAliases),
    Object.fromEntries(mergedAliasUids.map(uid => [uid, true])),
  );

  const updates = {};
  const now = Date.now();

  updates[`users/${canonicalUid}/canonicalUid`] = canonicalUid;
  updates[`users/${canonicalUid}/mergedInto`] = null;
  updates[`users/${canonicalUid}/createdAt`] = nextCreatedAt;
  updates[`users/${canonicalUid}/updatedAt`] = now;
  updates[`users/${canonicalUid}/lastLoginAt`] = now;
  updates[`users/${canonicalUid}/online`] = true;
  updates[`users/${canonicalUid}/authUids`] = nextAuthUids;

  if (nextMergedAliases && Object.keys(nextMergedAliases).length) {
    updates[`users/${canonicalUid}/mergedAliases`] = nextMergedAliases;
  }

  if (nextPhone) {
    updates[`users/${canonicalUid}/phone`] = nextPhone;
    updates[`phoneToUid/${nextPhone}`] = canonicalUid;
  }

  if (nextEmail) {
    const nextEmailKey = buildEmailLookupKey(nextEmail);
    updates[`users/${canonicalUid}/email`] = nextEmail;
    updates[`emailToUid/${nextEmailKey}`] = canonicalUid;
  }

  if (nextDisplayName) {
    updates[`users/${canonicalUid}/displayName`] = nextDisplayName;
    updates[`users/${canonicalUid}/name`] = nextDisplayName;
  }

  if (nextPhone) {
    updates[`publicUsers/${canonicalUid}/canonicalUid`] = canonicalUid;
    updates[`publicUsers/${canonicalUid}/mergedInto`] = null;
    updates[`publicUsers/${canonicalUid}/updatedAt`] = now;
    updates[`publicUsers/${canonicalUid}/online`] = true;
    updates[`publicUsers/${canonicalUid}/phone`] = nextPhone;

    if (nextDisplayName) {
      updates[`publicUsers/${canonicalUid}/name`] = nextDisplayName;
    }

    if (nextAvatar) {
      updates[`publicUsers/${canonicalUid}/avatar`] = nextAvatar;
    }
  }

  Object.keys(nextAuthUids).forEach(nextAuthUid => {
    updates[`authUidToProfileUid/${nextAuthUid}`] = canonicalUid;
  });

  mergedAliasUids.forEach(aliasUid => {
    const aliasUser = usersByUid[aliasUid] || {};
    const aliasPublic = publicUsersByUid[aliasUid] || {};

    updates[`users/${aliasUid}/canonicalUid`] = canonicalUid;
    updates[`users/${aliasUid}/mergedInto`] = canonicalUid;
    updates[`users/${aliasUid}/updatedAt`] = now;
    updates[`users/${aliasUid}/online`] = false;

    if (nextPhone && !asString(aliasUser?.phone)) {
      updates[`users/${aliasUid}/phone`] = nextPhone;
    }

    if (nextEmail && !asString(aliasUser?.email)) {
      updates[`users/${aliasUid}/email`] = nextEmail;
    }

    if (nextPhone || asString(aliasPublic?.phone)) {
      updates[`publicUsers/${aliasUid}/canonicalUid`] = canonicalUid;
      updates[`publicUsers/${aliasUid}/mergedInto`] = canonicalUid;
      updates[`publicUsers/${aliasUid}/updatedAt`] = now;

      if (nextPhone && !asString(aliasPublic?.phone)) {
        updates[`publicUsers/${aliasUid}/phone`] = nextPhone;
      }

      if (nextDisplayName && !asString(aliasPublic?.name)) {
        updates[`publicUsers/${aliasUid}/name`] = nextDisplayName;
      }

      if (nextAvatar && !asString(aliasPublic?.avatar)) {
        updates[`publicUsers/${aliasUid}/avatar`] = nextAvatar;
      }
    }

    const aliasPhone = normalizePhone(aliasUser?.phone);
    const aliasEmail = normalizeEmail(aliasUser?.email);

    if (aliasPhone) {
      updates[`phoneToUid/${aliasPhone}`] = canonicalUid;
    }

    if (aliasEmail) {
      updates[`emailToUid/${buildEmailLookupKey(aliasEmail)}`] = canonicalUid;
    }

    Object.keys(aliasUser?.authUids || {}).forEach(nextAuthUid => {
      updates[`authUidToProfileUid/${nextAuthUid}`] = canonicalUid;
    });

    Object.entries(aliasUser?.fcmTokens || {}).forEach(
      ([installationId, payload]) => {
        if (installationId && payload) {
          updates[`users/${canonicalUid}/fcmTokens/${installationId}`] =
            payload;
        }
      },
    );

    if (asString(aliasUser?.fcmToken)) {
      updates[`users/${canonicalUid}/fcmToken`] = aliasUser.fcmToken;
    }
  });

  try {
    await update(ref(database()), updates);

    return {
      avatar: nextAvatar,
      email: nextEmail,
      hasPhone: Boolean(nextPhone),
      mergedAliasUids,
      name: nextDisplayName,
      phone: nextPhone,
      uid: canonicalUid,
    };
  } catch (error) {
    if (!isPermissionDeniedError(error) || !normalizedAuthUid) {
      throw error;
    }

    if (canonicalUid && canonicalUid !== normalizedAuthUid) {
      const aliasProfile = buildAliasScopedChatProfile({
        authUid: normalizedAuthUid,
        canonicalPublic,
        canonicalUid,
        canonicalUser,
        email: normalizedEmail,
        existingPublic: publicUsersByUid[normalizedAuthUid] || {},
        existingUser: usersByUid[normalizedAuthUid] || {},
        phone: normalizedPhone || nextPhone,
      });

      await update(ref(database()), aliasProfile.updates);

      return aliasProfile.profile;
    }

    const fallbackProfile = buildSelfScopedChatProfile({
      authUid: normalizedAuthUid,
      email: normalizedEmail,
      existingPhoneMapping: phoneMappedUid,
      existingPublic: publicUsersByUid[normalizedAuthUid] || {},
      existingUser: usersByUid[normalizedAuthUid] || {},
      phone: normalizedPhone,
    });

    await update(ref(database()), fallbackProfile.updates);

    return fallbackProfile.profile;
  }
}
