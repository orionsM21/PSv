export const AUTO_HIGHLIGHT_RULES = {
  pan: {
    regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    color: 'rgba(52, 152, 219, 0.35)', // blue
    border: '#3498db',
  },
  dob: {
    regex: /^(0[1-9]|[12][0-9]|3[01])[\/\-](0[1-9]|1[0-2])[\/\-]\d{4}$/,
    color: 'rgba(230, 126, 34, 0.35)', // orange
    border: '#e67e22',
  },
};
