export function normalizeChatPhone(value = '') {
  return String(value).replace(/\D/g, '').replace(/^91/, '');
}

export function validateChatPhone(value) {
  const phone = normalizeChatPhone(value);

  if (!phone) {
    return {
      valid: false,
      error: 'Enter your mobile number to continue.',
    };
  }

  if (phone.length < 10) {
    return {
      valid: false,
      error: 'Enter a valid 10 digit mobile number.',
    };
  }

  return {
    valid: true,
    value: phone,
  };
}
