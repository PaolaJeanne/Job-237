import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  // Envoie le cookie de session (déduplication des vues, etc.) en cross-origin
  withCredentials: true,
});

export function getTokens() {
  const raw = localStorage.getItem('job237_tokens');
  return raw ? JSON.parse(raw) : null;
}

export function setTokens(tokens) {
  if (tokens) {
    localStorage.setItem('job237_tokens', JSON.stringify(tokens));
  } else {
    localStorage.removeItem('job237_tokens');
  }
}

client.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

function resolveQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && getTokens()?.refresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const tokens = getTokens();
        const { data } = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: tokens.refresh,
        });
        setTokens({ access: data.access, refresh: tokens.refresh });
        resolveQueue(null, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch (err) {
        resolveQueue(err, null);
        setTokens(null);
        window.location.href = '/connexion';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
