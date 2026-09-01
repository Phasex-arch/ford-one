import type { LoginCredentials } from '../types/concessionaria-login.types';

const VALID_USER = 'Ford-PhaseX';
const VALID_PASS = 'Ford';

/**
 * Redireciona para o dealership
 */
const getRedirectUrl = (): string => {
  // Em desenvolvimento, o dealership roda em outra porta
  if (import.meta.env.DEV) {
    return 'http://localhost:5174/';
  }

  // Em produção
  return '/';
};

export async function authenticate(credentials: LoginCredentials): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (credentials.username === VALID_USER && credentials.password === VALID_PASS) {
        window.location.href = getRedirectUrl();
        resolve(true);
      } else {
        resolve(false);
      }
    }, 900);
  });
}