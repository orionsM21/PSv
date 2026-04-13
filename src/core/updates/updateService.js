import { UPDATE_CONFIG } from './updateConfig';
import { logger } from '../logging/logger';

const defaultResult = {
  success: true,
  data: null,
  error: '',
};

export const checkForUpdates = async fetchImpl => {
  if (!UPDATE_CONFIG.manifestUrl) {
    return {
      ...defaultResult,
      data: {
        currentVersion: UPDATE_CONFIG.currentVersion,
        latestVersion: UPDATE_CONFIG.currentVersion,
        shouldUpdate: false,
        forceUpdate: false,
        otaSafe: true,
        releaseNotes: '',
      },
    };
  }

  try {
    const response = await fetchImpl(UPDATE_CONFIG.manifestUrl, {
      method: 'GET',
      cache: 'no-store',
    });
    const payload = await response.json();
    const latestVersion = payload?.latestVersion || UPDATE_CONFIG.currentVersion;
    const forceUpdate = Boolean(payload?.forceUpdate);

    return {
      success: true,
      data: {
        ...payload,
        currentVersion: UPDATE_CONFIG.currentVersion,
        latestVersion,
        shouldUpdate: latestVersion !== UPDATE_CONFIG.currentVersion,
        forceUpdate,
        otaSafe: !forceUpdate || Boolean(payload?.otaSafe),
      },
      error: '',
    };
  } catch (error) {
    logger.warn('Version check failed', { message: error?.message });
    return {
      success: false,
      data: null,
      error: error?.message || 'Unable to check for updates',
    };
  }
};
