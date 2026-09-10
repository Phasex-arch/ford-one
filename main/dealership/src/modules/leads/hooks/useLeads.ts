/**
 * @file useLeads.ts
 * @module leads
 * @description Hook de estado e lógica da tela de Leads Inteligentes.
 *
 * Gerencia:
 * - urgFilter: filtro de urgência ativo ('' = todos)
 * - leads: lista filtrada (memo por urgência)
 * - modalId: ID do lead com modal aberto
 * - pipeline: KPIs do pipeline (total, urgentes, valor total, ticket médio)
 * - leadSchedule: agendamentos do AppContext
 * - loading/error: estado do GET /leads (via useAsyncList)
 *
 * Escuta o CustomEvent 'ford:openLead' para abrir modal via busca global.
 * Os agendamentos de leads são persistidos no AppContext para sobreviver
 * à troca de módulo.
 */

import { useState, useMemo, useEffect } from 'react';
import { useAsyncList } from '../../../shared/hooks/useAsyncList';
import { filterLeads, fetchLeads } from '../services/leads.service';
import { useApp } from '../../../shared/context/AppContext';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { LeadUrgencia } from '../../../types/global.types';

export function useLeads() {
  const [urgFilter, setUrgFilter] = useState<LeadUrgencia|''>('');
  const [modalId, setModalId] = useState<string|null>(null);
  const { leadSchedule } = useApp();
  const { data: source, loading, error } = useAsyncList(fetchLeads);

  const leads = useMemo(() => filterLeads(urgFilter, source), [urgFilter, source]);

  const pipeline = useMemo(() => ({
    total: source.length,
    urgentes: source.filter(l=>l.urg==='urgente').length,
    pipeline: source.reduce((s,l)=>s+l.val,0),
    ticketMedio: source.length ? Math.round(source.reduce((s,l)=>s+l.val,0)/source.length) : 0,
  }), [source]);

  useEffect(() => {
    const h = (e: Event) => setModalId((e as CustomEvent<string>).detail);
    window.addEventListener('ford:openLead', h);
    return () => window.removeEventListener('ford:openLead', h);
  }, []);

  return { leads, urgFilter, setUrgFilter, modalId, setModalId, pipeline, leadSchedule, formatCurrency, loading, error };
}
