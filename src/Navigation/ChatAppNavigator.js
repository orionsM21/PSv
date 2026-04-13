import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {defaultStackScreenOptions} from '../core/navigation/navigationTheme';
import AddContact from '../modules/chatApp/screen/AddContact';
import ChatDashboard from '../modules/chatApp/screen/ChatDashboard';
import ChatLogin from '../modules/chatApp/screen/ChatLogin';
import ChatScreen from '../modules/chatApp/screen/ChatScreen';

const Stack = createNativeStackNavigator();

export default function ChatAppNavigator() {
  const {isLoggedIn} = useSelector(state => state.module);

  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      {!isLoggedIn ? (
        <Stack.Screen name="ChatLogin" component={ChatLogin} />
      ) : (
        <>
          <Stack.Screen name="ChatDashboard" component={ChatDashboard} />
          <Stack.Screen name="chat" component={ChatScreen} />
          <Stack.Screen name="AddContact" component={AddContact} />
        </>
      )}
    </Stack.Navigator>
  );
}
