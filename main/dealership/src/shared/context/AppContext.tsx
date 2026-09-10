/**
 * @file AppContext.tsx
 * @description Contexto global da aplicação Ford One.
 * Gerencia estado compartilhado entre todos os módulos sem Redux ou Zustand.
 *
 * Estado centralizado:
 * - user            → Colaborador autenticado (GET /auth/me), usado para permissões
 * - activeModule    → ID do módulo atualmente visível na área principal
 * - accessLog       → Registro de clientes e veículos acessados no dia corrente
 * - leadSchedule    → Agendamentos de leads indexados por ID de lead
 *
 * Ações expostas:
 * - navigate(mod)           → Troca o módulo ativo e rola para o topo
 * - logAccess(cliente)      → Registra acesso a um cliente (sem duplicatas)
 * - logVehicleAccess(...)   → Registra acesso a um veículo específico
 * - clearHistory()          → Limpa todo o log de acessos do dia
 * - setLeadSchedule(...)    → Atualiza o mapa de agendamentos de leads
 *
 * Uso: envolver a árvore com <AppProvider> e consumir com useApp() nos filhos.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AccessLogItem, VehicleLogItem, ModuleId } from '../../types/global.types';
import { nowStr } from '../utils/dates';
import type { AuthenticatedUser } from '../api/client';

interface LeadScheduleEntry { dayOffset: number; slotIdx: number; }

/** Mínimo necessário para registrar um acesso — evita depender da lista completa. */
type AccessLogSource = { id: string; nome: string; ini: string };

interface AppState {
  user: AuthenticatedUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthenticatedUser | null>>;
  activeModule: ModuleId;
  accessLog: { clientes: AccessLogItem[]; veiculos: VehicleLogItem[] };
  leadSchedule: Record<string, LeadScheduleEntry>;
  navigate: (mod: ModuleId) => void;
  logAccess: (cliente: AccessLogSource) => void;
  logVehicleAccess: (vid: string, modelo: string, cliName: string, cid: string) => void;
  clearHistory: () => void;
  setLeadSchedule: React.Dispatch<React.SetStateAction<Record<string, LeadScheduleEntry>>>;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [accessLog, setAccessLog] = useState<{ clientes: AccessLogItem[]; veiculos: VehicleLogItem[] }>({
    clientes: [],
    veiculos: [],
  });
  const [leadSchedule, setLeadSchedule] = useState<Record<string, LeadScheduleEntry>>({});

  const navigate = useCallback((mod: ModuleId) => {
    setActiveModule(mod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const logAccess = useCallback((c: AccessLogSource) => {
    setAccessLog(prev => {
      if (prev.clientes.find(x => x.id === c.id)) return prev;
      return { ...prev, clientes: [...prev.clientes, { id: c.id, nome: c.nome, ini: c.ini, hora: nowStr() }] };
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
    <AppContext.Provider value={{ user, setUser, activeModule, accessLog, leadSchedule, navigate, logAccess, logVehicleAccess, clearHistory, setLeadSchedule }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
