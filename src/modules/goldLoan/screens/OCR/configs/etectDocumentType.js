export const detectDocumentType = (input = '') => {
  const text = Array.isArray(input)
    ? input.join(' ')
    : String(input);

  const upper = text.toUpperCase();
console.log(text,upper, 'texttext')
  if (upper.includes('INCOME TAX DEPARTMENT')) return 'PAN';
  if (upper.includes('GOVERNMENT OF INDIA')) return 'AADHAAR';
  if (upper.includes('BANK STATEMENT')) return 'BANK';

  return 'UNKNOWN';
};
