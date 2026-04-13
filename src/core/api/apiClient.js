import axios from 'axios';
import { store } from '../../redux/store';
import { enqueueOfflineAction } from '../offline/offlineQueue';
import { logger } from '../logging/logger';

const API_TIMEOUT = 15000;
const MAX_RETRIES = 2;

const shouldRetry = error => {
  const status = error?.response?.status;

  if (!status) {
    return true;
  }

  return status >= 500;
};

const getAuthToken = () => {
  const state = store.getState();
  return state?.auth?.lostoken || state?.auth?.token || null;
};

const normalizeSuccess = response => ({
  success: true,
  data: response?.data?.data ?? response?.data ?? null,
  error: '',
  meta: {
    status: response?.status,
    raw: response?.data,
  },
});

const normalizeFailure = error => ({
  success: false,
  data: null,
  error:
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Unexpected API error',
  meta: {
    status: error?.response?.status,
    raw: error?.response?.data,
  },
});

export const apiClient = axios.create({
  timeout: API_TIMEOUT,
});

apiClient.interceptors.request.use(
  config => {
    const token = getAuthToken();
    const nextConfig = {
      ...config,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
    };

    if (token) {
      nextConfig.headers.Authorization = `Bearer ${token}`;
    }

    nextConfig.metadata = {
      retryCount: nextConfig.metadata?.retryCount || 0,
    };

    return nextConfig;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error?.config;

    if (config && shouldRetry(error)) {
      const retryCount = config.metadata?.retryCount || 0;

      if (retryCount < MAX_RETRIES) {
        config.metadata = {
          ...(config.metadata || {}),
          retryCount: retryCount + 1,
        };
        return apiClient(config);
      }
    }

    if (
      config &&
      config.method &&
      config.method.toLowerCase() !== 'get' &&
      !error?.response
    ) {
      await enqueueOfflineAction({
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers,
      });
      logger.warn('Queued offline mutation', { url: config.url });
    }

    return Promise.reject(error);
  },
);

export const request = async config => {
  try {
    const response = await apiClient(config);
    return normalizeSuccess(response);
  } catch (error) {
    return normalizeFailure(error);
  }
};
