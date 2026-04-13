import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {
  LOS_AUTH_SCREENS,
  LOS_ROLE_ENTRY_SCREENS,
  LOS_WORKFLOW_SCREENS,
} from '../modules/los/config/losScreenRegistry.js';
import {losColors} from '../modules/los/theme/losTheme.js';
import {defaultStackScreenOptions} from '../core/navigation/navigationTheme';

const Stack = createNativeStackNavigator();

const LOSNavigator = () => {
  const {isLoggedIn, roleCode, userHydrated} = useSelector(
    state => state.module,
  );

  const roleEntryScreen =
    roleCode === 'Sales'
      ? LOS_ROLE_ENTRY_SCREENS.sales
      : LOS_ROLE_ENTRY_SCREENS.credit;

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackScreenOptions,
        contentStyle: {backgroundColor: losColors.surface.canvas},
      }}>
      {!isLoggedIn &&
        LOS_AUTH_SCREENS.map(screen => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={screen.options}
          />
        ))}

      {isLoggedIn && userHydrated ? (
        <Stack.Screen
          name={roleEntryScreen.name}
          component={roleEntryScreen.component}
        />
      ) : null}

      {isLoggedIn && !userHydrated ? (
        <Stack.Screen
          name={LOS_AUTH_SCREENS[0].name}
          component={LOS_AUTH_SCREENS[0].component}
        />
      ) : null}

      {isLoggedIn &&
        LOS_WORKFLOW_SCREENS.map(screen => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={screen.options}
          />
        ))}
    </Stack.Navigator>
  );
};

export default LOSNavigator;
