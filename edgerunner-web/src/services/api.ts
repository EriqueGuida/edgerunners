import axios from 'axios';

export const TOKEN_KEY = 'edgerunner_token';
export const USER_KEY = 'edgerunner_user';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Injeta o Bearer Token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !token.startsWith('ah_local_jwt_') && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta: Se o token JWT do servidor expirar (401/403 fora de /auth), limpa a sessão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const isLocalVaultToken = token?.startsWith('ah_local_jwt_');
    const isAuthEndpoint = error.config?.url?.includes('/auth/');

    if (
      !isLocalVaultToken &&
      !isAuthEndpoint &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
