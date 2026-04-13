import {
  LOGIN, LOGOUT,
  SAVE_ROLE_CODE,
  SAVE_TOKEN_AND_ID,
  SAVE_USER_PROFILE,
  SAVE_SELECTED_PORTFOLIO,
  SAVE_SELECTED_STATE,
  SAVE_SELECTED_CITY,
  SAVE_SELECTED_USERTYPE,
  SAVE_AGENCY_ID,
  RESET,
  SAVE_ADMIN_ROLES,
  SAVE_ADMIN_ROLES_AGENCY_SETTINGS,
  SAVE_ADMIN_ROLES_AGENCY,
  SAVE_USER_DETAILS,
  SAVE_TOKEN
} from "./actions";

const initialState = {
  isLoggedIn: false,
  user: null,
  token: null,
  userId: null,
  userName: null,
  roleCode: null,
  userProfile: null,

  selectedPortfolio: null,
  selectedState: null,
  selectedCity: null,
  selecteduserType: null,
  usersagencyId: null,
  usersrolecode: null,
  adminroles: [],
  agencyTrackingConfigs: [],
  agencysetting: null,
  userDetails: null,
  lostoken: null
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload,
      };
    case SAVE_USER_DETAILS:
      return {
        ...state,
        losuserDetails: action.payload,   // or userDetails if you want separate key
      };
    case SAVE_TOKEN:
      return {
        ...state,
        lostoken: action.payload,   // or userDetails if you want separate key
      };
    // case LOGOUT:
    //   return {
    //     ...state,
    //     isLoggedIn: false,
    //     user: null,
    //   };
    case LOGOUT:
      return initialState;


    case SAVE_ROLE_CODE:
      return {
        ...state,
        roleCode: action.payload,
      };

    case SAVE_TOKEN_AND_ID:
      return {
        ...state,
        token: action.payload?.token || null,
        userId: action.payload?.user?.userId || null,
        userName: action.payload?.user?.name || null,
      };


    case SAVE_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
      };

    case SAVE_SELECTED_PORTFOLIO:
      return { ...state, selectedPortfolio: action.payload };

    case SAVE_SELECTED_STATE:
      return { ...state, selectedState: action.payload };

    case SAVE_SELECTED_CITY:
      return { ...state, selectedCity: action.payload };

    case SAVE_SELECTED_USERTYPE:
      return { ...state, selecteduserType: action.payload };

    case SAVE_AGENCY_ID:
      return { ...state, usersagencyId: action.payload };

    case SAVE_ROLE_CODE:
      return { ...state, usersrolecode: action.payload };

    case SAVE_ADMIN_ROLES_AGENCY_SETTINGS:
      return { ...state, agencysetting: action.payload };

    case SAVE_ADMIN_ROLES:
      return { ...state, adminroles: action.payload };

    case SAVE_ADMIN_ROLES_AGENCY:
      return { ...state, agencyTrackingConfigs: action.payload };

    case RESET:
      return initialState;

    default:
      return state;
  }
}
