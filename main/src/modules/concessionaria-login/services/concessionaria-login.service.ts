import type { LoginCredentials } from '../types/concessionaria-login.types';
import { apiRequest } from '../../../shared/api/client';

/**
 * Redireciona para o dealership levando só um código de uso único (30s),
 * nunca o JWT completo — o dealership troca o código pelo token de verdade
 * via POST /auth/exchange assim que carrega. Isso evita o JWT de 8h
 * ficando exposto no fragmento da URL (histórico do navegador, extensões,
 * etc.) — antes ele ia direto ali.
 */
const getRedirectUrl = (code: string): string => {
  const dealershipUrl = import.meta.env.VITE_DEALERSHIP_URL
    || (import.meta.env.DEV ? 'http://localhost:5174' : 'http://localhost:8081');
  return `${dealershipUrl.replace(/\/$/, '')}/#code=${encodeURIComponent(code)}`;
};

export async function authenticate(credentials: LoginCredentials): Promise<boolean> {
  const result = await apiRequest<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: credentials.username, senha: credentials.password }),
  });
  const { code } = await apiRequest<{ code: string; expiresIn: number }>('/auth/exchange-code', {
    method: 'POST',
    headers: { Authorization: `Bearer ${result.accessToken}` },
  });
  window.location.href = getRedirectUrl(code);
  return true;
}