import 'react-native-gesture-handler';
import './src/polyfills/global-shim';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppRegistry, NativeModules } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ✅ Native Firebase (DO NOT initialize manually)
import messaging from '@react-native-firebase/messaging';

/**
 * Inject ENV
 */
(function injectEnv() {
  try {
    const env =
      NativeModules?.AppEnv?.APP_ENV ||
      NativeModules?.AppEnv?.getEnv?.();
    if (env) {
      global.__APP_ENV__ = env;
      console.log('🌍 Injected APP_ENV:', env);
    }
  } catch (e) {
    console.log('ENV inject failed');
  }
})();

const Root = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
);

AppRegistry.registerComponent(appName, () => Root);
