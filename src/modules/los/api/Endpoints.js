// export const BASE_URL = 'http://192.168.1.174:9090/api/v1/';

// export const BASE_URL = 'https://164fbfbfde1e.ngrok-free.app/api/v1/';

// export const BASE_URL ='http://110.227.248.230:8585/goFinLosSecureBE/api/v1/';
// export const BASE_URL ='http://182.66.89.142:5555/goFinLosSecureBE/api/v1/';

// export const BASE_URL ='http://192.168.1.81:8585/goFinLosSecureBE/api/v1/'

// export const BASE_URL ='http://192.168.1.225:8888/goFinLosSecureBE/api/v1/'

// export const BASE_URL ='http://192.168.1.225:8585/gofinleadBE/api/v1/'

// export const BASE_URL = 'http://110.227.248.230:5580/ahfplLosSecureBE/api/v1/' 
// 
// export const BASE_URL = 'http://110.227.248.230:5576/afplLosSecureBE/api/v1/'
export const BASE_URL = 'http://110.227.248.230:5567/afplLosSecureBE/api/v1/'

// export const BASE_URL = 'http://192.168.1.174:9095/api/v1/';

// export const BASE_URL = 'http://110.227.248.230:5565/ahfplLosSecureBE/api/v1/'

// export const BASE_URL = "http://192.168.1.177:8086/api/v1/"

// export const BASE_URL = 'http://180.179.23.105:5050/ahfplLosSecureBE/api/v1/'


export const LOGIN = 'mobile/token?type=uid';





// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useSelector } from 'react-redux';
// const token = useSelector((state) => state.auth.token);
// // Base URL Configuration
// export const BASE_URL = 'http://192.168.1.174:8081/api/v1/';
// // Uncomment and use as needed
// // export const BASE_URL = 'http://182.66.89.142:8585/goFinLosSecureBE/api/v1/';
// // export const BASE_URL = 'http://182.66.89.142:5555/goFinLosSecureBE/api/v1/';
// // export const BASE_URL = 'http://192.168.1.81:8585/goFinLosSecureBE/api/v1/';
// // export const BASE_URL = 'http://192.168.1.225:8888/goFinLosSecureBE/api/v1/';
// // export const BASE_URL = 'http://192.168.1.225:8585/gofinleadBE/api/v1/';
// // export const BASE_URL = 'http://110.227.248.230:5570/goFinLosSecureBE/api/v1/';
// // export const BASE_URL = 'http://110.227.248.230:8585/goFinLosSecureBE/api/v1/';

// // Endpoint Definitions
// export const LOGIN = 'mobile/token?type=uid';
// export const GET_USER_DETAIL_BY_USERNAME = (username) =>
//     `getUserDetailByUserName/${username}`;
// // Add other endpoints as needed

// // Create a centralized Axios instance
// const apiClient = axios.create({
//     baseURL: BASE_URL,
//     headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer ' + token,
//     },
// });

// // Interceptor to add token automatically
// apiClient.interceptors.request.use(
//     async (config) => {
//         const token = await AsyncStorage.getItem('@token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// export default apiClient;
