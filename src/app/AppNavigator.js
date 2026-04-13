import React, {useMemo} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {defaultStackScreenOptions} from '../core/navigation/navigationTheme';
import {resolveActiveScreen} from './moduleFlows';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const moduleState = useSelector(state => state.module);
  const activeScreen = useMemo(
    () => resolveActiveScreen(moduleState),
    [moduleState],
  );

  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name={activeScreen.name}
        component={activeScreen.component}
        navigationKey={activeScreen.navigationKey}
      />
    </Stack.Navigator>
  );
}
