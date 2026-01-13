export const validateAadhaar = (val) => /^\d{12}$/.test(val);
export const validatePan = (val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val);
export const validateCIN = (val) => /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(val);
