/**
 * @file useLeads.ts
 * @module leads
 * @description Hook de estado e lógica da tela de Leads Inteligentes.
 *
 * - Busca leads na API quando o filtro de urgencia muda
 * - Mantem `leadsStore` (cache global) sincronizado
 * - Pipeline KPIs derivados do snapshot atual (cache completo)
 * - Escuta CustomEvent 'ford:openLead' para abrir modal via busca global
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  applyFilters,
  fetchLeads,
} from '../services/leads.service';
import { leadsStore, useStore } from '../../../shared/api/cache';
import { extractErrorMessage } from '../../../shared/api/http';
import { useApp } from '../../../shared/context/AppContext';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { Lead, LeadUrgencia } from '../../../types/global.types';

export function useLeads() {
  const [urgFilter, setUrgFilter] = useState<LeadUrgencia | ''>('');
  const [modalId, setModalId] = useState<string | null>(null);
  const allLeads = useStore(leadsStore);
  const [leads, setLeads] = useState<Lead[]>(() =>
    applyFilters(leadsStore.get(), '')
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { leadSchedule } = useApp();
  const reqId = useRef(0);

  const refresh = useCallback(async (next: LeadUrgencia | '') => {
    const myReq = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchLeads(next);
      if (myReq !== reqId.current) return;
      // Atualiza o cache global apenas quando carregando sem filtro
      // (para nao sobrescrever a lista completa com uma fatia).
      if (!next) leadsStore.set(list);
      setLeads(list);
    } catch (err) {
      if (myReq !== reqId.current) return;
      setError(extractErrorMessage(err, 'Falha ao carregar leads.'));
      setLeads(applyFilters(leadsStore.get(), next));
    } finally {
      if (myReq === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(urgFilter);
  }, [refresh, urgFilter]);

  const pipeline = useMemo(() => {
    const source = allLeads.length ? allLeads : leads;
    const total = source.length || 1;
    return {
      total: source.length,
      urgentes: source.filter((l) => l.urg === 'urgente').length,
      pipeline: source.reduce((s, l) => s + l.val, 0),
      ticketMedio: Math.round(source.reduce((s, l) => s + l.val, 0) / total),
    };
  }, [allLeads, leads]);

  useEffect(() => {
    const h = (e: Event) => setModalId((e as CustomEvent<string>).detail);
    window.addEventListener('ford:openLead', h);
    return () => window.removeEventListener('ford:openLead', h);
  }, []);

  return {
    leads,
    urgFilter,
    setUrgFilter,
    modalId,
    setModalId,
    pipeline,
    leadSchedule,
    formatCurrency,
    loading,
    error,
    refresh: () => refresh(urgFilter),
  };
}
