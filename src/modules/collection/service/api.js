const enforceHTTPS = (url) => {
    if (!url.startsWith("https://")) {
        throw new Error(`Insecure URL detected: ${url}. Only HTTPS is allowed.`);
    }
    return url;
};


// // export const BASE_URL = "http://192.168.1.225:5555/collectionBE/v1/collections/");
// //  export const BASE_URL = "http://192.168.1.174:8084/v1/collections/";
// // export const BASE_URL = 'http://192.168.1.101:8083/v1/collections/';
// // export const BASE_URL = 'http://192.168.1.101:8084/v1/collections/';

// // export const BASE_URL = "http://192.168.1.17:8082/v1/collections/";
// // export const BASE_URL = "http://180.179.23.105:5050/ahfplcollectionBE/v1/collections/";

// // export const BASE_URL ='http://182.66.89.142:5555/collectionBE/v1/collections/';
// // export const BASE_URL ='http://182.66.89.142:8585/collectionBE/v1/collections/';
// // export const BASE_URL = "http://192.168.1.225:5555/collectionBE/v1/collections/";
// export const BASE_URL = "http://110.227.248.230:5555/collectionBE/v1/collections/";   //QC_CHirag
// // export const BASE_URL = "http://110.227.248.230:5566/collectionBE/v1/collections/";   //QCNewVersion(Test)_CHirag
// // export const BASE_URL = "http://180.179.23.105:5050/ahfplcollectionBE/v1/collections/";     
// // export const BASE_URL = "http://110.227.248.230:5580/ahfplcollectionBE/v1/collections/";
// // //      export const BASE_URL = "http://192.168.1.115:8081/v1/collections/";
// // export const BASE_URL = "http://192.168.1.174:8084/v1/collections/";  //Local
// // export const BASE_URL = "http://110.227.248.230:5566/collectionBE/v1/collections/";     //QC

// // export const BASE_URL ='http://110.227.248.230:5570/CollectionBE/v1/collections/'
// // export const BASE_URL = 'http://110.227.248.230:5555/collectionBE/v1/collections'

// // export const BASE_URL = 'http://110.227.248.230:5555/dpgcLosSecureBE/api/v1/'

// // SMS Email //
// //   export const SMS_EMAIL_URL ="http://192.168.1.103:3000/collection/#/");
// //      export const SMS_EMAIL_URL ="http://192.168.1.103:3001/collection/#/");
// // export const SMS_EMAIL_URL = 'http://182.66.89.142:5555/collection/#/';
// // export const SMS_EMAIL_URL = 'http://182.66.89.142:8585/collection/#/';

// export const SMS_EMAIL_URL = enforceHTTPS("https://trucollectuat.truboardpartners.com/collection/#/");
// // export const SMS_EMAIL_URL = enforceHTTPS("https://trucollect.truboardpartners.com/collection/#/");

// export const LOGIN = 'mobile/token?type=uid';


export const LOGIN = 'mobile/token?type=uid';

export const SMS_EMAIL_URL = enforceHTTPS(
  'https://trucollectuat.truboardpartners.com/collection/#/'
);
