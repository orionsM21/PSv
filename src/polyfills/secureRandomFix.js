import 'react-native-get-random-values';
import * as CryptoJSImported from 'crypto-js';

if (!global.CryptoJS) {
  Object.defineProperty(global, "CryptoJS", {
    value: CryptoJSImported,
    writable: false,
    configurable: false,
    enumerable: true,
  });
}

const CryptoJS = global.CryptoJS;

// optional patch
const WA = CryptoJS?.lib?.WordArray;

if (WA && !WA.randomWords) {
  WA.randomWords = function (nWords) {
    const u8 = new Uint8Array(nWords * 4);
    crypto.getRandomValues(u8);
    return WA.create(u8);
  };
}
