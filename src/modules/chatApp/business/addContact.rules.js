export function validateContactForm({name, phone}) {
  const trimmedName = String(name || '').trim();
  const trimmedPhone = String(phone || '').trim();

  if (!trimmedName) {
    return {
      valid: false,
      error: 'Enter a contact name.',
    };
  }

  if (trimmedPhone && !/^\+?\d{6,15}$/.test(trimmedPhone)) {
    return {
      valid: false,
      error: 'Enter a valid phone number.',
    };
  }

  return {
    valid: true,
    value: {
      givenName: trimmedName,
      familyName: '',
      phoneNumbers: trimmedPhone
        ? [{label: 'mobile', number: trimmedPhone}]
        : [],
    },
  };
}
