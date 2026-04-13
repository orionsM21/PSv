import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedModule: null,
  isLoggedIn: false,
  roleCode: null,
  bootstrapped: false,
  userHydrated: false,
  uiTheme: 'current',
};

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {
    setModule: (state, action) => {
      const module = action.payload;
      if (!module) return; // 🛡️ guard
      state.selectedModule = module;
    },

    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.roleCode = action?.payload ?? null;
      state.bootstrapped = true;
    },

    setUserHydrated: (state) => {
      state.userHydrated = true;
    },

    logout: (state) => {
      state.isLoggedIn = false;
      state.selectedModule = null;
      state.roleCode = null;
      state.userHydrated = false;
      state.bootstrapped = true;
    },

    logoutOnly: (state) => {
      state.isLoggedIn = false;
      state.userHydrated = false;
      state.bootstrapped = true;
    },

    finishBootstrap: (state) => {
      state.bootstrapped = true;
    },

    setUITheme: (state, action) => {
      state.uiTheme = action.payload;
    },
  },
});

export const {
  setModule,
  loginSuccess,
  logout,
  logoutOnly,
  finishBootstrap,
  setUserHydrated,
  setUITheme
} = moduleSlice.actions;

export default moduleSlice.reducer;



// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   isLoggedIn: false,
//   bootstrapped: false,   // app initialized
//   userHydrated: false,  // user profile fetched
//   uiTheme: "current",
// };

// const moduleSlice = createSlice({
//   name: "module",
//   initialState,
//   reducers: {
//     /* -------- APP BOOTSTRAP -------- */
//     finishBootstrap: (state) => {
//       state.bootstrapped = true;
//     },

//     /* -------- AUTH -------- */
//     loginSuccess: (state) => {
//       state.isLoggedIn = true;
//     },

//     setUserHydrated: (state) => {
//       state.userHydrated = true;
//     },

//     logout: (state) => {
//       state.isLoggedIn = false;
//       state.userHydrated = false;
//     },

//     /* -------- UI -------- */
//     setUITheme: (state, action) => {
//       state.uiTheme = action.payload;
//     },
//   },
// });

// export const {
//   loginSuccess,
//   logout,
//   finishBootstrap,
//   setUserHydrated,
//   setUITheme,
// } = moduleSlice.actions;

// export default moduleSlice.reducer;
