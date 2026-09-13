const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const TOKEN_KEY = 'ford_one_token';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const friendlyApiMessage = (error: unknown): string =>
  error instanceof ApiError && error.status === 403
    ? 'Você não tem permissão para esta ação. Fale com um ADMIN ou GERENTE.'
    : error instanceof Error
      ? error.message
      : 'Não foi possível concluir a solicitação.';

// A troca do código de uso único (#code=...) vindo do portal por um token
// de verdade acontece no boot do AppContext (POST /auth/exchange), não
// aqui — getToken() só lê o que já foi validado e guardado.
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  pagination: PaginationMeta;
  data: T[];
}

export interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'GERENTE' | 'FUNCIONARIO';
  telefone?: string;
  cargo?: string;
}

const extractMessage = (body: unknown): string | undefined => {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join('; ');
  return typeof message === 'string' ? message : undefined;
};

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
  if (!response.ok) throw new ApiError(response.status, extractMessage(body) || 'Não foi possível concluir a solicitação.');
  // Retorna o corpo cru (sem tentar adivinhar envelope) — cada service extrai o que
  // precisa (ex.: `.data` + `.pagination` em listas, ou o objeto direto em mutações).
  return body as T;
}
