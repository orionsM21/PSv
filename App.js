import 'react-native-get-random-values';
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigator from "./src/app/AppNavigator";
import DrawerRoot from "./src/Drawer/DrawerRoot";
import { DrawerProvider } from "./src/Drawer/DrawerContext";
import store from "./src/redux/store";
import { syncRemoteConfig } from './src/modules/collection/service/syncRemoteConfig';

export default function App() {
  // useEffect(() => {
  //   syncRemoteConfig(); // 🔥 fetch latest BASE_URL on app start
  // }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <DrawerProvider>
          <StatusBar
            backgroundColor="#0B1220"
            barStyle="light-content"
            translucent={false}
          />

          <NavigationContainer>
            <AppNavigator />
            <DrawerRoot />
          </NavigationContainer>
        </DrawerProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
