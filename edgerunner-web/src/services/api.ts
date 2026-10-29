import axios from 'axios';

export const TOKEN_KEY = 'edgerunner_token';
export const USER_KEY = 'edgerunner_user';
export const SESSION_MODE_KEY = 'afterhours_session_mode';
export const PROFILE_CACHE_KEY = 'afterhours_profile_cache';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Injeta apenas Bearer Tokens JWT reais emitidos pelo servidor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const sessionMode = localStorage.getItem(SESSION_MODE_KEY);
    if (
      token &&
      sessionMode !== 'DEMO' &&
      !token.startsWith('ah_demo_') &&
      !token.startsWith('ah_local_jwt_') &&
      config.headers
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta: Se o token JWT do servidor expirar (401 em endpoints protegidos), encerra a sessão de forma limpa
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const sessionMode = localStorage.getItem(SESSION_MODE_KEY);
    const isDemoSession =
      sessionMode === 'DEMO' ||
      Boolean(token?.startsWith('ah_demo_')) ||
      Boolean(token?.startsWith('ah_local_jwt_'));
    const isAuthEndpoint = error.config?.url?.includes('/auth/');

    if (!isDemoSession && !isAuthEndpoint && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_MODE_KEY);
      localStorage.removeItem(PROFILE_CACHE_KEY);
      window.dispatchEvent(new CustomEvent('afterhours:session-expired'));
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
