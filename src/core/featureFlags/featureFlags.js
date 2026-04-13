const DEFAULT_FLAGS = {
  unifiedDesignSystem: true,
  otaSoftUpdate: true,
  offlineQueue: true,
  newLosDashboards: true,
};

let currentFlags = { ...DEFAULT_FLAGS };

export const getFeatureFlags = () => ({ ...currentFlags });

export const isFeatureEnabled = flagName => Boolean(currentFlags[flagName]);

export const applyFeatureFlags = remoteFlags => {
  currentFlags = {
    ...DEFAULT_FLAGS,
    ...(remoteFlags || {}),
  };

  return getFeatureFlags();
};
