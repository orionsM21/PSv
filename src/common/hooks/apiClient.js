import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BlobUtil from "react-native-blob-util";
import { BASE_URL } from '../../modules/collection/service/api';
/**
 * Base API client for mobile
 * - Handles auth token
 * - Handles timeout
 * - Centralized error handling
 */
const apiClient = axios.create({
  timeout: 30_000, // 30 seconds (fintech-safe)
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-From-Mobile': 'true',
  },
});

/* ================================
   REQUEST INTERCEPTOR
   - Attach token automatically
================================ */
// apiClient.interceptors.request.use(
//   async (config) => {
//     try {
//       const token = await AsyncStorage.getItem('@token');

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     } catch (err) {
//       // Silent fail (never block request)
//       console.warn('Token read failed', err);
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );
// apiClient.interceptors.request.use(async (config) => {
//   const isLoginAPI =
//     config.url?.includes('mobile/token') ||
//     config.url?.includes('/login');

//   if (!isLoginAPI) {
//     const token = await AsyncStorage.getItem('@token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }

//   return config;
// });
apiClient.interceptors.request.use(async (config) => {
  const isLoginAPI =
    config.url?.includes('mobile/token') ||
    config.url?.includes('/login');

  // 🔒 If caller already passed Authorization → DO NOTHING
  if (config.headers?.Authorization) {
    return config;
  }

  // 🔐 Auto-attach token only if:
  // - Not a login API
  // - Authorization not already provided
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
  if (!file) throw new Error("Upload file missing");

  const mime = file.type || "application/octet-stream";
  const ext = mime.split("/")[1] || "bin";
  const fileName = file.name || `upload_${Date.now()}.${ext}`;

  console.log("⬆️ Uploading:", fileName);

  try {
    const result = await BlobUtil.fetch(
      "POST",
      `${BASE_URL}${endpoint}`,
      {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
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
    console.log("❌ [UPLOAD ERROR]:", e);
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
