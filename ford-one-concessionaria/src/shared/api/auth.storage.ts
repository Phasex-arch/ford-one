/**
 * @file auth.storage.ts
 * @description Persistencia simples de credenciais de autenticacao em localStorage.
 * Guarda token JWT e o usuario autenticado retornado por POST /auth/login.
 * Usado pelo AuthContext e pelo interceptor do http client.
 */

const STORAGE_KEY = 'ford-one.auth';

export interface StoredAuthUser {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'GERENTE' | 'FUNCIONARIO';
}

export interface StoredAuth {
  token: string;
  user: StoredAuthUser;
  expiresAt?: number;
}

function read(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function write(value: StoredAuth | null): void {
  try {
    if (!value) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function getToken(): string | null {
  return read()?.token ?? null;
}

export function getUser(): StoredAuthUser | null {
  return read()?.user ?? null;
}

export function getAuth(): StoredAuth | null {
  return read();
}

export function setAuth(auth: StoredAuth): void {
  write(auth);
}

export function clearAuth(): void {
  write(null);
}
