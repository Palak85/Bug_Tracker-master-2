import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ── Request: attach Bearer token ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: handle 401 / 403 globally ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token is expired or invalid — clear storage and force re-login
      localStorage.removeItem('auth_token');
      // Only redirect if not already on an auth page to avoid loops
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      // Forbidden — the user's role doesn't allow this action.
      // We re-throw so individual components can still show specific messages.
      console.warn('[API] 403 Forbidden:', error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

export default api;
