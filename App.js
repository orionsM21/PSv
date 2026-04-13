import 'react-native-get-random-values';
import React from 'react';

import AppProviders from './src/core/providers/AppProviders';
import {initializeRealtimeDatabase} from './src/core/firebase/realtimeDatabase';

initializeRealtimeDatabase();

export default function App() {
  return <AppProviders />;
}
