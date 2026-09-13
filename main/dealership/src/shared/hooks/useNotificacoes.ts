/**
 * @file useNotificacoes.ts
 * @description Hook do sino de notificações do cabeçalho. Reaproveita os
 * mesmos 4 alertas operacionais reais já calculados pelo backend pro
 * Dashboard (GET /api/dashboard → alertas: slaRisco, estoqueBaixo,
 * leadPrioritario, metaAtingida) — não inventa nada novo, é a mesma fonte.
 *
 * Cada notificação tem uma "key" derivada do conteúdo real (ex: cliente +
 * veículo do lead prioritário). O estado de lido/não-lido é guardado no
 * localStorage por key: se o conteúdo mudar (outro lead virou prioritário,
 * por exemplo), a notificação volta a aparecer como não lida — não existe
 * timestamp real de "quando isso aconteceu" no backend, então não é
 * mostrado (nenhum "há 5 min" inventado).
 */

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';
import type { ModuleId } from '../../types/global.types';

interface DashboardAlertas {
  slaRisco: { quantidade: number } | null;
  estoqueBaixo: { modelo: string; versao: string; quantidade: number } | null;
  leadPrioritario: { cliente: string; veiculo: string; valor: number } | null;
  metaAtingida: { titulo: string; atual: number; alvo: number; unidade: string } | null;
}

interface DashboardResponse { alertas?: DashboardAlertas; }

export interface Notificacao {
  key: string;
  title: string;
  body: string;
  mod: ModuleId;
  unread: boolean;
}

const READ_PREFIX = 'ford_notif_read_';

function isRead(key: string): boolean {
  try { return localStorage.getItem(READ_PREFIX + key) === '1'; } catch { return false; }
}
function markReadLocal(key: string): void {
  try { localStorage.setItem(READ_PREFIX + key, '1'); } catch { /* localStorage indisponível — sem persistência local, sem problema */ }
}

export function useNotificacoes() {
  const [notifs, setNotifs] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    apiRequest<DashboardResponse>('/dashboard?periodo=mes')
      .then(res => {
        const a = res.alertas;
        const items: Omit<Notificacao, 'unread'>[] = [];
        if (a?.leadPrioritario) {
          const v = a.leadPrioritario;
          items.push({ key: `lead:${v.cliente}:${v.veiculo}`, title: 'Lead prioritário', body: `${v.cliente} — ${v.veiculo}`, mod: 'leads' });
        }
        if (a?.slaRisco) {
          const v = a.slaRisco;
          items.push({ key: `sla:${v.quantidade}`, title: 'SLA em risco', body: `${v.quantidade} ${v.quantidade === 1 ? 'ordem' : 'ordens'} em risco ou atrasada`, mod: 'servicos' });
        }
        if (a?.estoqueBaixo) {
          const v = a.estoqueBaixo;
          items.push({ key: `estoque:${v.modelo}:${v.versao}:${v.quantidade}`, title: 'Estoque baixo', body: `${v.modelo} ${v.versao} — ${v.quantidade} ${v.quantidade === 1 ? 'unidade' : 'unidades'}`, mod: 'estoque' });
        }
        if (a?.metaAtingida) {
          const v = a.metaAtingida;
          items.push({ key: `meta:${v.titulo}:${v.atual}`, title: 'Meta atingida', body: v.titulo, mod: 'receita' });
        }
        setNotifs(items.map(i => ({ ...i, unread: !isRead(i.key) })));
      })
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const markAllRead = useCallback(() => {
    setNotifs(prev => {
      prev.forEach(n => markReadLocal(n.key));
      return prev.map(n => ({ ...n, unread: false }));
    });
  }, []);

  const unreadCount = notifs.filter(n => n.unread).length;

  return { notifs, unreadCount, markAllRead, reload, loading };
}
