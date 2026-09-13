/**
 * @file AppContext.tsx
 * @description Contexto global da aplicação Ford One.
 * Gerencia estado compartilhado entre todos os módulos sem Redux ou Zustand.
 *
 * Estado centralizado:
 * - activeModule    → ID do módulo atualmente visível na área principal
 * - accessLog       → Registro de clientes e veículos acessados no dia corrente
 *
 * Ações expostas:
 * - navigate(mod)           → Troca o módulo ativo e rola para o topo
 * - logAccess(cliente)      → Registra acesso a um cliente (sem duplicatas)
 * - logVehicleAccess(...)   → Registra acesso a um veículo específico
 * - clearHistory()          → Limpa todo o log de acessos do dia
 *
 * Agendamentos de lead (Leads → "Agendar") são dados reais de
 * GET/POST /api/agendamentos, buscados no próprio módulo de leads — não
 * vivem mais neste contexto (eram um mapa local em memória, nunca persistido).
 *
 * logAccess recebe os dados de exibição (id/nome/iniciais) de quem chama, em vez de
 * resolvê-los internamente — o cliente já foi carregado da API por quem disparou o
 * acesso, então o contexto não precisa (e não deve) depender de nenhum catálogo estático.
 *
 * Uso: envolver a árvore com <AppProvider> e consumir com useApp() nos filhos.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AccessLogItem, VehicleLogItem, ModuleId } from '../../types/global.types';
import { nowStr } from '../utils/dates';
import { apiRequest, clearToken, getToken, setToken, type AuthenticatedUser } from '../api/client';

interface AppState {
  activeModule: ModuleId;
  accessLog: { clientes: AccessLogItem[]; veiculos: VehicleLogItem[] };
  user: AuthenticatedUser | null;
  navigate: (mod: ModuleId) => void;
  logAccess: (cliente: Pick<AccessLogItem, 'id' | 'nome' | 'ini'>) => void;
  logVehicleAccess: (vid: string, modelo: string, cliName: string, cid: string) => void;
  clearHistory: () => void;
  refreshUser: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [accessLog, setAccessLog] = useState<{ clientes: AccessLogItem[]; veiculos: VehicleLogItem[] }>({
    clientes: [],
    veiculos: [],
  });
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  // Enquanto true, nenhuma tela filha é montada — evita que Dashboard/Estoque/etc.
  // disparem suas próprias chamadas de API (e tomem 401) antes da troca do
  // código (#code=...) por um token de verdade terminar.
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const portalUrl = import.meta.env.VITE_PORTAL_URL
      || (import.meta.env.DEV ? 'http://localhost:5173' : 'http://localhost:8080');
    const redirect = () => {
      clearToken();
      window.location.href = `${portalUrl.replace(/\/$/, '')}/concessionaria`;
    };
    window.addEventListener('ford:unauthorized', redirect);

    const boot = async () => {
      // O portal manda um código de uso único (#code=...) em vez do JWT direto.
      // Trocamos aqui pelo token de verdade e limpamos o hash da URL antes de
      // qualquer outra coisa, pra ele nunca ficar exposto no histórico.
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const code = hashParams.get('code');
      if (code) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        try {
          const { accessToken } = await apiRequest<{ accessToken: string }>('/auth/exchange', {
            method: 'POST',
            body: JSON.stringify({ code }),
          });
          setToken(accessToken);
        } catch {
          redirect();
          return;
        }
      }

      if (!getToken()) {
        redirect();
        return;
      }
      try {
        setUser(await apiRequest<AuthenticatedUser>('/auth/me'));
      } catch {
        // 401 aqui já dispara 'ford:unauthorized' (tratado no client) e redireciona.
      } finally {
        setBooting(false);
      }
    };
    boot();

    return () => window.removeEventListener('ford:unauthorized', redirect);
  }, []);

  const refreshUser = useCallback(() => {
    apiRequest<AuthenticatedUser>('/auth/me').then(setUser).catch(() => undefined);
  }, []);

  const navigate = useCallback((mod: ModuleId) => {
    setActiveModule(mod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const logAccess = useCallback((cliente: Pick<AccessLogItem, 'id' | 'nome' | 'ini'>) => {
    setAccessLog(prev => {
      if (prev.clientes.find(x => x.id === cliente.id)) return prev;
      return { ...prev, clientes: [...prev.clientes, { ...cliente, hora: nowStr() }] };
    });
  }, []);

  const logVehicleAccess = useCallback((vid: string, modelo: string, cliName: string, cid: string) => {
    setAccessLog(prev => {
      if (prev.veiculos.find(x => x.id === vid)) return prev;
      return { ...prev, veiculos: [...prev.veiculos, { id: vid, cid, modelo, cli: cliName, hora: nowStr() }] };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setAccessLog({ clientes: [], veiculos: [] });
  }, []);

  return (
    <AppContext.Provider value={{ activeModule, accessLog, user, navigate, logAccess, logVehicleAccess, clearHistory, refreshUser }}>
      {booting ? <div className="app-boot-loading" aria-label="Carregando" /> : children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
