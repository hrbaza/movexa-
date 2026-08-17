import axios from 'axios';

const TOKEN_KEY = 'movexa_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request when present.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise error messages + auto-logout on 401.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    if (status === 401 && tokenStore.get()) {
      tokenStore.clear();
      // Let the app react (AuthContext listens on storage / reload paths).
      window.dispatchEvent(new Event('movexa:unauthorized'));
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
