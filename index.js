/**
 * @format
 */

import 'react-native-gesture-handler';
import './src/polyfills/global-shim';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppRegistry, NativeModules } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

/**
 * Load APP_ENV from Android BuildConfig
 * and inject into JS global scope BEFORE the app mounts
 */
(function injectEnv() {
  try {
    const env = NativeModules?.AppEnv?.APP_ENV || NativeModules?.AppEnv?.getEnv?.();
    if (env) {
      global.__APP_ENV__ = env;
      console.log("🌍 Injected APP_ENV:", env);
    } else {
      console.log("⚠️ APP_ENV missing → fallback to default logic");
    }
  } catch (err) {
    console.log("⚠️ ENV inject failed:", err);
  }
})();

const Root = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
);

AppRegistry.registerComponent(appName, () => Root);
