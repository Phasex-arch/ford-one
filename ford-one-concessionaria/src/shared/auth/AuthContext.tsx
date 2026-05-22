/**
 * @file AuthContext.tsx
 * @description Contexto de autenticacao da aplicacao Ford One.
 *
 * Responsabilidades:
 * - Gerenciar o token JWT e o usuario autenticado (persistencia em localStorage)
 * - Expor login(email, senha) e logout()
 * - No boot, validar o token via GET /auth/me; se invalido, limpar a sessao
 * - Reagir ao evento global 'ford:auth-logout' disparado pelo http client em 401
 * - Suportar auto-login em dev via VITE_DEV_AUTOLOGIN / VITE_DEV_EMAIL / VITE_DEV_SENHA
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  clearAuth,
  getAuth,
  setAuth,
  type StoredAuthUser,
} from '../api/auth.storage';
import * as authApi from '../api/resources/auth';
import { extractErrorMessage } from '../api/http';
import { bootstrapSharedData, resetBootstrap } from '../api/bootstrap';

interface AuthState {
  user: StoredAuthUser | null;
  token: string | null;
  ready: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initial = getAuth();
  const [user, setUser] = useState<StoredAuthUser | null>(initial?.user ?? null);
  const [token, setToken] = useState<string | null>(initial?.token ?? null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearAuth();
    resetBootstrap();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await authApi.login({ email, senha });
      const expiresAt = Date.now() + (resp.expiresIn ?? 0) * 1000;
      setAuth({ token: resp.accessToken, user: resp.user, expiresAt });
      setUser(resp.user);
      setToken(resp.accessToken);
      void bootstrapSharedData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao autenticar'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      const stored = getAuth();
      if (stored?.token) {
        try {
          const fresh = await authApi.me();
          if (cancelled) return;
          setAuth({ ...stored, user: fresh });
          setUser(fresh);
          setToken(stored.token);
          void bootstrapSharedData();
        } catch {
          if (cancelled) return;
          clearAuth();
          setUser(null);
          setToken(null);
        }
      } else if (
        import.meta.env.VITE_DEV_AUTOLOGIN === 'true' &&
        import.meta.env.VITE_DEV_EMAIL &&
        import.meta.env.VITE_DEV_SENHA
      ) {
        try {
          await login(
            import.meta.env.VITE_DEV_EMAIL as string,
            import.meta.env.VITE_DEV_SENHA as string
          );
        } catch {
          /* manter usuario deslogado */
        }
      }
      if (!cancelled) setReady(true);
    };
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [login]);

  useEffect(() => {
    const handler = () => {
      resetBootstrap();
      setUser(null);
      setToken(null);
    };
    window.addEventListener('ford:auth-logout', handler);
    return () => window.removeEventListener('ford:auth-logout', handler);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, ready, loading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
