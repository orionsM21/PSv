import axios from 'axios';
import { BASE_URL } from '../api/Endpoints';

export const createLosApiHeaders = token => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const withLosUrl = path => `${BASE_URL}${path}`;

export const createLosApiClient = token => {
  const defaultHeaders = createLosApiHeaders(token);

  return {
    get: (path, config = {}) =>
      axios.get(withLosUrl(path), {
        ...config,
        headers: { ...defaultHeaders, ...(config.headers || {}) },
      }),
    post: (path, payload, config = {}) =>
      axios.post(withLosUrl(path), payload, {
        ...config,
        headers: { ...defaultHeaders, ...(config.headers || {}) },
      }),
    put: (path, payload, config = {}) =>
      axios.put(withLosUrl(path), payload, {
        ...config,
        headers: { ...defaultHeaders, ...(config.headers || {}) },
      }),
    delete: (path, config = {}) =>
      axios.delete(withLosUrl(path), {
        ...config,
        headers: { ...defaultHeaders, ...(config.headers || {}) },
      }),
  };
};
