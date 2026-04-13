// polyfills/global-shim.js
// 🚀 This file loads BEFORE ANY React Native module.
// 🚀 Absolutely guarantees RNG + CryptoJS patch is applied
// 🚀 Metro injects this before bundling your app
import 'react-native-get-random-values';
import './secureRandomFix';

console.log("🔥 global-shim loaded BEFORE app bundle");
