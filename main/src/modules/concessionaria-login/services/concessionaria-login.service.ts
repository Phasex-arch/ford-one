import type { LoginCredentials } from '../types/concessionaria-login.types';

const VALID_USER = 'Ford-PhaseX';
const VALID_PASS = 'Ford';

/**
 * Redireciona para a pasta concessionaria, irmã de main, dentro de frontend/.
 * Usa pathname para subir dois níveis: /frontend/main/ → /frontend/concessionaria/
 */
const getRedirectUrl = (): string => {
  const { origin, pathname } = window.location;
  // pathname ex: /frontend/main/ ou /frontend/main/concessionaria
  // Pega os dois primeiros segmentos: ['', 'frontend', 'main'] → /frontend
  const parts = pathname.split('/').filter(Boolean); // ['frontend', 'main', ...]
  const base  = parts[0]; // 'frontend'
  return `${origin}/${base}/concessionaria/`;
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
