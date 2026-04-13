const redactValue = value => {
  if (typeof value !== 'string') {
    return value;
  }

  if (value.length > 64) {
    return `${value.slice(0, 6)}***${value.slice(-4)}`;
  }

  return value;
};

const sanitizeMeta = meta => {
  if (!meta || typeof meta !== 'object') {
    return meta;
  }

  return Object.keys(meta).reduce((accumulator, key) => {
    const lowerKey = key.toLowerCase();
    const shouldRedact =
      lowerKey.includes('token') ||
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('authorization');

    accumulator[key] = shouldRedact ? '[REDACTED]' : redactValue(meta[key]);
    return accumulator;
  }, {});
};

const log = (level, message, meta) => {
  const payload = sanitizeMeta(meta);

  if (__DEV__) {
    const writer = level === 'error' ? console.error : console.log;
    writer(`[${level.toUpperCase()}] ${message}`, payload || '');
  }
};

export const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
