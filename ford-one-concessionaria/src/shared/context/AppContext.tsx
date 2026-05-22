/**
 * @file AppContext.tsx
 * @description Contexto global da aplicação Ford One.
 * Gerencia estado compartilhado entre todos os módulos sem Redux ou Zustand.
 *
 * Estado centralizado:
 * - activeModule    → ID do módulo atualmente visível na área principal
 * - accessLog       → Registro de clientes e veículos acessados no dia corrente
 * - leadSchedule    → Agendamentos de leads indexados por ID de lead
 *
 * Ações expostas:
 * - navigate(mod)           → Troca o módulo ativo e rola para o topo
 * - logAccess(cid)          → Registra acesso a um cliente (sem duplicatas)
 * - logVehicleAccess(...)   → Registra acesso a um veículo específico
 * - clearHistory()          → Limpa todo o log de acessos do dia
 * - setLeadSchedule(...)    → Atualiza o mapa de agendamentos de leads
 *
 * Uso: envolver a árvore com <AppProvider> e consumir com useApp() nos filhos.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AccessLogItem, VehicleLogItem, ModuleId } from '../../types/global.types';
import { nowStr } from '../utils/dates';
import { clientesStore } from '../api/cache';

interface LeadScheduleEntry { dayOffset: number; slotIdx: number; }

interface AppState {
  activeModule: ModuleId;
  accessLog: { clientes: AccessLogItem[]; veiculos: VehicleLogItem[] };
  leadSchedule: Record<string, LeadScheduleEntry>;
  navigate: (mod: ModuleId) => void;
  logAccess: (cid: string) => void;
  logVehicleAccess: (vid: string, modelo: string, cliName: string, cid: string) => void;
  clearHistory: () => void;
  setLeadSchedule: React.Dispatch<React.SetStateAction<Record<string, LeadScheduleEntry>>>;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [accessLog, setAccessLog] = useState({
    clientes: [
      { id:'C001', nome:'Carlos Eduardo Mendes', ini:'CM', hora:'09:14' },
      { id:'C007', nome:'Paulo Ricardo Almeida', ini:'PA', hora:'10:32' },
      { id:'C002', nome:'Ana Paula Rodrigues',   ini:'AR', hora:'11:05' },
    ] as AccessLogItem[],
    veiculos: [
      { id:'VC001A', cid:'C001', modelo:'Ford Bronco Sport Badlands', cli:'Carlos Mendes',  hora:'09:16' },
      { id:'VC007A', cid:'C007', modelo:'Ford Bronco Sport Wildtrak', cli:'Paulo Almeida',  hora:'10:35' },
      { id:'VC002A', cid:'C002', modelo:'Ford Territory Titanium',    cli:'Ana Rodrigues',  hora:'11:07' },
    ] as VehicleLogItem[],
  });
  const [leadSchedule, setLeadSchedule] = useState<Record<string, LeadScheduleEntry>>({});

  const navigate = useCallback((mod: ModuleId) => {
    setActiveModule(mod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const logAccess = useCallback((cid: string) => {
    setAccessLog(prev => {
      if (prev.clientes.find(x => x.id === cid)) return prev;
      const c = clientesStore.get().find(x => x.id === cid);
      if (!c) return prev;
      return { ...prev, clientes: [...prev.clientes, { id: cid, nome: c.nome, ini: c.ini, hora: nowStr() }] };
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
    <AppContext.Provider value={{ activeModule, accessLog, leadSchedule, navigate, logAccess, logVehicleAccess, clearHistory, setLeadSchedule }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
