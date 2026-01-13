export const detectDocumentType = (text = '') => {
  const upper = text.toUpperCase();

  if (upper.includes('INCOME TAX DEPARTMENT')) return 'PAN';
  if (upper.includes('GOVERNMENT OF INDIA')) return 'AADHAAR';
  if (upper.includes('BANK STATEMENT')) return 'BANK';

  return 'UNKNOWN';
};
