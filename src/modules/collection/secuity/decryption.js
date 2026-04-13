import CryptoJS from "crypto-js";

export function decrypt(base64Text) {
  const SECRET_KEY = "mySuperSecretKey1234567890123456";
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

  const combined = CryptoJS.enc.Base64.parse(base64Text);

  const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);

  const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4), combined.sigBytes - 16);

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphertext },
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}