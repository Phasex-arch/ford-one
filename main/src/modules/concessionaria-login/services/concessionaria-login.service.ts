import type { LoginCredentials } from '../types/concessionaria-login.types';
import { apiRequest } from '../../../shared/api/client';

/**
 * Redireciona para o dealership
 */
const getRedirectUrl = (token: string): string => {
  const dealershipUrl = import.meta.env.VITE_DEALERSHIP_URL
    || (import.meta.env.DEV ? 'http://localhost:5174' : 'http://localhost:8081');
  return `${dealershipUrl.replace(/\/$/, '')}/#access_token=${encodeURIComponent(token)}`;
};

export async function authenticate(credentials: LoginCredentials): Promise<boolean> {
  const result = await apiRequest<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: credentials.username, senha: credentials.password }),
  });
  localStorage.setItem('ford_one_token', result.accessToken);
  window.location.href = getRedirectUrl(result.accessToken);
  return true;
}