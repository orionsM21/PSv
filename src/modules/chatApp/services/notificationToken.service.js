import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

const INSTALLATION_ID_STORAGE_KEY = 'chat.installationId';

function createRandomKey(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getOrCreateInstallationId() {
  const existingValue = await AsyncStorage.getItem(INSTALLATION_ID_STORAGE_KEY);

  if (existingValue) {
    return existingValue;
  }

  const installationId = createRandomKey('inst');

  await AsyncStorage.setItem(INSTALLATION_ID_STORAGE_KEY, installationId);

  return installationId;
}

export function buildInstallationPayload(token) {
  return {
    platform: Platform.OS,
    token,
    updatedAt: Date.now(),
  };
}
