export const detectDocumentType = (input) => {
  if (!input) return null;

  const text = Array.isArray(input)
    ? input.join(' ')
    : String(input);

  const upperText = text.toUpperCase();

  if (upperText.includes('INCOME TAX DEPARTMENT')) return 'PAN';
  if (upperText.includes('AADHAAR')) return 'AADHAAR';

  return 'UNKNOWN';
};
