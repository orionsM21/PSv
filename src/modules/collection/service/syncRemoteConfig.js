import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const CONFIG_URL = 'http://192.168.1.11:9092/mobile-config';

/**
 * Sync backend runtime config
 */
export const syncRemoteConfig = async () => {
    try {
        const res = await fetch(CONFIG_URL, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!res.ok) {
            console.warn('⚠️ Failed to fetch mobile config');
            return;
        }

        const remoteConfig = await res.json();

        const {
            envName,
            baseUrl,
            forceLogout,
            version,
            signature,
        } = remoteConfig;

        if (!baseUrl || !envName || !version) {
            console.warn('⚠️ Invalid config payload');
            return;
        }

        const localVersion = await AsyncStorage.getItem('@CONFIG_VERSION');

        // ⛔ Skip if already applied
        if (localVersion && Number(localVersion) >= version) {
            return;
        }

        // ✅ Save new config
        await AsyncStorage.multiSet([
            ['@BASE_URL', baseUrl],
            ['@ENV_NAME', envName],
            ['@CONFIG_VERSION', String(version)],
        ]);

        console.log(`✅ Config updated → ${envName}`);

        // 🔥 Force logout if required
        if (forceLogout) {
            await AsyncStorage.multiRemove([
                '@token',
                '@userId',
                '@userName',
                '@roleCode',
                '@userProfile',
                '@isLoggedIn',
            ]);

            Alert.alert(
                'Session Reset',
                'Environment changed. Please login again.'
            );
        }
    } catch (e) {
        console.error('❌ syncRemoteConfig error:', e.message);
    }
};
