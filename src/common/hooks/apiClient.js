import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BlobUtil from "react-native-blob-util";
import { getBaseUrl } from '../../modules/collection/service/baseUrlManager';
// import { BASE_URL } from '../../modules/collection/service/api';

const apiClient = axios.create({
  timeout: 30_000, // 30 seconds (fintech-safe)
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-From-Mobile': 'true',
  },
});


apiClient.interceptors.request.use(async (config) => {
  const isLoginAPI =
    config.url?.includes('mobile/token') ||
    config.url?.includes('/login');

  // 🔥 Inject BASE_URL dynamically (runtime)
  const baseURL = await getBaseUrl();
  config.baseURL = baseURL;

  // 🔒 Respect explicitly provided Authorization
  if (config.headers?.Authorization) {
    return config;
  }

  // 🔐 Attach token automatically (except login)
  if (!isLoginAPI) {
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});


apiClient.upload = async (endpoint, { fieldName, file, token }) => {
  if (!file) throw new Error('Upload file missing');

  const baseURL = await getBaseUrl();

  const mime = file.type || 'application/octet-stream';
  const ext = mime.split('/')[1] || 'bin';
  const fileName = file.name || `upload_${Date.now()}.${ext}`;

  try {
    const result = await BlobUtil.fetch(
      'POST',
      `${baseURL}${endpoint}`,
      {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      [
        {
          name: fieldName,
          filename: fileName,
          type: mime,
          data: BlobUtil.wrap(file.uri),
        },
      ]
    );

    return result.json();
  } catch (e) {
    console.log('❌ [UPLOAD ERROR]:', e);
    throw e;
  }
};



/* ================================
   RESPONSE INTERCEPTOR
   - Central error normalization
================================ */
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;

    // Network / timeout
    if (!error.response) {
      return Promise.reject({
        type: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.',
      });
    }

    // Unauthorized → token expired
    if (status === 401) {
      await AsyncStorage.multiRemove([
        '@token',
        '@userId',
        '@userName',
        '@roleCode',
        '@userProfile',
      ]);

      return Promise.reject({
        type: 'UNAUTHORIZED',
        message: 'Session expired. Please login again.',
      });
    }

    // Server errors
    if (status >= 500) {
      return Promise.reject({
        type: 'SERVER_ERROR',
        message: 'Server is unavailable. Please try later.',
      });
    }

    // Backend-defined errors
    return Promise.reject({
      type: 'API_ERROR',
      message:
        error?.response?.data?.message ||
        error?.response?.data?.response ||
        'Something went wrong',
    });
  }
);

export default apiClient;
