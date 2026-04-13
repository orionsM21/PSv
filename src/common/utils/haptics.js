// utils/haptics.js
import HapticFeedback from 'react-native-haptic-feedback';

export const triggerHaptic = (type = 'impactLight') => {
    HapticFeedback.trigger(type, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
};
