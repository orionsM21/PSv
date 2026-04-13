// src/ocr/configs/pan.config.js

export const PAN_OCR_CONFIG = {
  documentType: 'PAN',

  keywords: [
    'INCOME TAX DEPARTMENT',
    'GOVERNMENT OF INDIA',
    'PERMANENT ACCOUNT NUMBER',
  ],

  fields: {
    pan: {
      regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
      confidence: 0.95,
      required: true,
    },

    dob: {
      regex: /^(0[1-9]|[12][0-9]|3[01])[\/\-](0[1-9]|1[0-2])[\/\-]\d{4}$/,
      confidence: 0.7,
      required: true,
    },

    name: {
      regex: /^[A-Z ]{3,}$/,
      confidence: 0.6,
      required: false,
      exclude: /FATHER|GOVT|INCOME|TAX|DEPARTMENT|ACCOUNT|NUMBER|CARD/,
    },
  },
};
