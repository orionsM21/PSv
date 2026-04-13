export const LOS_API_BASE_URLS = {
  DPGC: 'http://110.227.248.230:5577/dpgcLosSecureBE/api/v1/',
  AHFPL: 'http://110.227.248.230:5565/ahfplLosSecureBE/api/v1/',
  AFPL: 'http://110.227.248.230:5576/afplLosSecureBE/api/v1/',
  LOCAL: 'http://192.168.1.174:9090/api/v1/',
};

export const ACTIVE_LOS_ENV = 'DPGC';
export const BASE_URL = LOS_API_BASE_URLS[ACTIVE_LOS_ENV];
export const LOGIN = 'mobile/token?type=uid';
