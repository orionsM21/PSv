// import { createStore, combineReducers } from 'redux';
// import authReducer from './reducer';

// const rootReducer = combineReducers({
//   auth: authReducer,
// });

// const store = createStore(rootReducer);

// export default store;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducer';      // legacy auth reducer
import moduleReducer from './moduleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    module: moduleReducer,
  },
  devTools: __DEV__,
});

export default store;

