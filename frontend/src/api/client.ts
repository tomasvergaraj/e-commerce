import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { normalizeApiUrl } from '@/lib/utils';

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Intercept to add token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add session ID for guest cart
  const sessionId = getSessionId();
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

// Intercept response errors
api.interceptors.response.use(
  (res) => res.data?.data !== undefined ? res.data : res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    const message = err.response?.data?.message || 'Error de conexión';
    return Promise.reject({ message, status: err.response?.status });
  }
);

function getSessionId(): string {
  let id = sessionStorage.getItem('nexo_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('nexo_session', id);
  }
  return id;
}

export default api;
