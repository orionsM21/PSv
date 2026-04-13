import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL_KEY = '@BASE_URL';

export const DEFAULT_BASE_URL = 'http://110.227.248.230:5555/collectionBE/v1/collections/';
// export const DEFAULT_BASE_URL = 'http://110.227.248.230:5580/ahfplcollectionBE/v1/collections/';
export const enforceHTTPS = (url) => {
    if (!url.startsWith('https://')) {
        throw new Error(`🚫 Insecure URL blocked: ${url}`);
    }
    return url;
};

export const getBaseUrl = async () => {
    const storedUrl = await AsyncStorage.getItem(BASE_URL_KEY);
    return (storedUrl || DEFAULT_BASE_URL);
};

export const setBaseUrl = async (url) => {
    await AsyncStorage.setItem(BASE_URL_KEY, (url));
};
