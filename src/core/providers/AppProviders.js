// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { Provider } from 'react-redux';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import DrawerRoot from '../../Drawer/DrawerRoot';
// import { DrawerProvider } from '../../Drawer/DrawerContext';
// import AppNavigator from '../../app/AppNavigator';
// import { store } from '../../redux/store';
// import AppErrorBoundary from '../errors/AppErrorBoundary';
// import { appNavigationTheme } from '../navigation/navigationTheme';
// import UpdateGate from '../updates/UpdateGate';
// import AppRuntime from './AppRuntime';

// export default function AppProviders() {
//   return (
//     <AppErrorBoundary>
//       <SafeAreaProvider>
//         <Provider store={store}>
//           <DrawerProvider>
//             <NavigationContainer theme={appNavigationTheme}>
//               <SafeAreaView>
//                 <AppRuntime>
//                   <AppNavigator />
//                   <DrawerRoot />
//                   <UpdateGate />
//                 </AppRuntime>
//               </SafeAreaView>
//             </NavigationContainer>
//           </DrawerProvider>
//         </Provider>
//       </SafeAreaProvider>
//     </AppErrorBoundary>
//   );
// }
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import DrawerRoot from '../../Drawer/DrawerRoot';
import {DrawerProvider} from '../../Drawer/DrawerContext';
import AppNavigator from '../../app/AppNavigator';
import {store} from '../../redux/store';
import AppErrorBoundary from '../errors/AppErrorBoundary';
import {appNavigationTheme} from '../navigation/navigationTheme';
import UpdateGate from '../updates/UpdateGate';
import AppRuntime from './AppRuntime';
import {navigationRef} from '../../navigationRef';

export default function AppProviders() {
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <DrawerProvider>
            <NavigationContainer ref={navigationRef} theme={appNavigationTheme}>
              <AppRuntime>
                <AppNavigator />
                <DrawerRoot />
                <UpdateGate />
              </AppRuntime>
            </NavigationContainer>
          </DrawerProvider>
        </Provider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
