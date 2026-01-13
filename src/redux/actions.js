// ACTION TYPES

//Collection
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SAVE_USER_DETAILS = 'SAVE_USER_DETAILS';
export const SAVE_TOKEN = 'SAVE_TOKEN';

export const SAVE_ROLE_CODE = "SAVE_ROLE_CODE";
export const SAVE_TOKEN_AND_ID = "SAVE_TOKEN_AND_ID";
export const SAVE_USER_PROFILE = "SAVE_USER_PROFILE";

//LOS
// export const SAVE_TOKEN_AND_ID = 'SAVE_TOKEN_AND_ID';
// export const SAVE_USER_PROFILE = 'SAVE_USER_PROFILE';
// export const SAVE_ROLE_CODE = 'SAVE_ROLE_CODE';
export const SHOW_DRAWER = 'SHOW_DRAWER';
export const SHOWDRAWER = 'SHOWDRAWER';
export const CURRENTSCREEN = 'CURRENTSCREEN';

// export const SAVE_USER_DETAILS = 'SAVE_USER_DETAILS';
// export const SAVE_TOKEN = 'SAVE_TOKEN';
// ACTION CREATORS
export const loginUser = (userData) => ({
  type: LOGIN,
  payload: userData,
});

export const logoutUser = () => ({
  type: LOGOUT,
});


export const saveUserDetails = (userDetails) => ({
    type: SAVE_USER_DETAILS,
    payload: userDetails,
});

export const saveToken = (token) => ({
  type: SAVE_TOKEN,
  payload: token,
});


export const saveRoleCode = (roleCode) => ({
  type: SAVE_ROLE_CODE,
  payload: roleCode,
});

export const saveTokenAndID = (data) => ({
  type: SAVE_TOKEN_AND_ID,
  payload: data,       // { token, userId }
});

export const saveUserProfile = (profile) => ({
  type: SAVE_USER_PROFILE,
  payload: profile,    // full user profile object
});

export const saveSearchDetail = data => ({ type: SEARCHDETAIL, payload: data });
// Selected Filters
export const saveSearchParams = data => ({ type: SAVE_SEARCH_PARAMS, payload: data });
export const saveSelectedPortfolio = data => ({ type: SAVE_SELECTED_PORTFOLIO, payload: data });
export const saveSelectedState = data => ({ type: SAVE_SELECTED_STATE, payload: data });
export const saveSelectedCity = data => ({ type: SAVE_SELECTED_CITY, payload: data });
export const saveSelectedUserType = data => ({ type: SAVE_SELECTED_USERTYPE, payload: data });
export const saveAgencyId = data => ({ type: SAVE_AGENCY_ID, payload: data });

// Admin Roles
export const saveAdminRoles = data => ({ type: SAVE_ADMIN_ROLES, payload: data });
export const saveAdminRoleAgency = data => ({ type: SAVE_ADMIN_ROLES_AGENCY, payload: data });
export const saveAdminRoleAgencySettings = data => ({ type: SAVE_ADMIN_ROLES_AGENCY_SETTINGS, payload: data });

// Reset Store
export const resetStore = () => ({ type: RESET });