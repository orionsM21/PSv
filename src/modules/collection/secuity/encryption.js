import CryptoJS from "crypto-js";

const SECRET_KEY = CryptoJS.enc.Utf8.parse("mySuperSecretKey1234567890123456");

export function encrypt(text) {
  const ivArr = new Uint8Array(16);
  global.crypto.getRandomValues(ivArr);

  const iv = CryptoJS.lib.WordArray.create(ivArr);

  const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const combined = iv.concat(encrypted.ciphertext);
  return CryptoJS.enc.Base64.stringify(combined);
}
