const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const TOKEN_KEY = 'ford_one_token';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const getToken = () => {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const fragmentToken = params.get('access_token');
  if (fragmentToken) {
    localStorage.setItem(TOKEN_KEY, fragmentToken);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  return localStorage.getItem(TOKEN_KEY);
};
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'GERENTE' | 'FUNCIONARIO';
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('ford:unauthorized'));
  }
  if (response.status === 403) {
    window.dispatchEvent(new CustomEvent('ford:forbidden', {
      detail: 'Seu perfil não tem permissão para esta ação.',
    }));
  }
  if (!response.ok) throw new ApiError(response.status, body?.message || 'Não foi possível concluir a solicitação.');
  return body?.data ?? body;
}
