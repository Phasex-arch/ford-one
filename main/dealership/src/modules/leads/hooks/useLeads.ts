/**
 * @file useLeads.ts
 * @module leads
 * @description Hook de estado e lógica da tela de Leads Inteligentes.
 *
 * Gerencia:
 * - urgFilter: filtro de urgência ativo ('' = todos) — mandado como query
 *   string real pro backend, com paginação de verdade (sem filtrar em memória)
 * - page/pagination/loading/error: paginação real e estado de carregamento
 * - pipeline: KPIs do pipeline, vindos de um snapshot separado (fetchLeadsStats)
 * - modalId/lead: lead com modal aberto — resolvido na página atual e, se não
 *   encontrado (aberto via busca global), buscado por ID
 * - leadAgendamentos: mapa leadId → agendamento ativo, de GET /api/agendamentos
 *   (status=AGENDADO) — substitui o antigo leadSchedule local do AppContext,
 *   que nunca persistia de verdade
 * - reloadAgendamentos(): recarrega o mapa após agendar/cancelar
 * - assumirLead(id, showToast): PATCH responsavelId = usuário logado — a
 *   gravação já era real, mas antes nada na tela mostrava quem assumiu (só
 *   o toast); agora o card e o modal exibem "Responsável" de verdade e o
 *   botão vira "Reassumir de X" / "Você é responsável" conforme o estado
 *
 * Escuta o CustomEvent 'ford:openLead' para abrir modal via busca global.
 */

import { useState, useCallback, useEffect } from 'react';
import { fetchLeads, fetchLeadById, fetchLeadsStats, assumirLead as assumirLeadApi, registrarContatoLead, associarVeiculoLead, type LeadsStats } from '../services/leads.service';
import { fetchAgendamentosDeLeads, type LeadAgendamento } from '../../agenda/services/agenda.service';
import { fetchEstoque } from '../../estoque/services/estoque.service';
import { friendlyApiMessage, type PaginationMeta } from '../../../shared/api/client';
import type { Lead, LeadUrgencia, Estoque } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';

const PAGE_SIZE = 20;
const EMPTY_STATS: LeadsStats = { total: 0, urgentes: 0, pipeline: 0, ticketMedio: 0 };

export function useLeads() {
  const [urgFilter, setUrgFilter] = useState<LeadUrgencia|''>('');
  const [page, setPage] = useState(1);
  const [modalId, setModalId] = useState<string|null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [leadAgendamentos, setLeadAgendamentos] = useState<Record<string, LeadAgendamento>>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pipeline, setPipeline] = useState<LeadsStats>(EMPTY_STATS);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState<Estoque[]>([]);

  useEffect(() => {
    fetchEstoque({ page: 1, limit: 100 })
      .then(res => setEstoqueDisponivel(res.data.filter(e => e.estq > 0)))
      .catch(() => setEstoqueDisponivel([]));
  }, []);

  useEffect(() => { setPage(1); }, [urgFilter]);

  // Lead convertido já virou Cliente de verdade (ver auditoria, seção 0) —
  // some do pipeline ativo, já que não é mais um lead em aberto (o alerta
  // do momento da conversão acontece em Financiamentos, que é onde ela
  // realmente é disparada).
  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    fetchLeads({ page, limit: PAGE_SIZE, urgencia: urgFilter, convertido: false })
      .then(res => { setLeads(res.data); setPagination(res.pagination); })
      .catch(e => { setError(friendlyApiMessage(e)); setLeads([]); setPagination(null); })
      .finally(() => setLoading(false));
  }, [page, urgFilter]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    fetchLeadsStats().then(setPipeline).catch(() => setPipeline(EMPTY_STATS));
  }, [leads]);

  const reloadAgendamentos = useCallback(() => {
    fetchAgendamentosDeLeads()
      .then(list => setLeadAgendamentos(Object.fromEntries(list.map(a => [a.leadId, a]))))
      .catch(() => setLeadAgendamentos({}));
  }, []);

  useEffect(() => { reloadAgendamentos(); }, [reloadAgendamentos, leads]);

  useEffect(() => {
    const h = (e: Event) => setModalId((e as CustomEvent<string>).detail);
    window.addEventListener('ford:openLead', h);
    return () => window.removeEventListener('ford:openLead', h);
  }, []);

  useEffect(() => {
    if (!modalId) { setLead(null); return; }
    const found = leads.find(l => l.id === modalId);
    if (found) { setLead(found); return; }
    fetchLeadById(modalId).then(setLead).catch(() => setLead(null));
  }, [modalId, leads]);

  const assumirLead = useCallback((id: string, responsavelId: string, showToast: (m: string, t?: ToastType) => void) => {
    assumirLeadApi(id, responsavelId).then(() => {
      showToast('Lead assumido!', 'success');
      reload();
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  }, [reload]);

  /**
   * Liga de verdade (tel:) e registra o contato — antes era só um toast
   * fixo sem nenhuma chamada real (ver auditoria, seção 3).
   */
  const ligarAgora = useCallback((id: string, telefone: string, showToast: (m: string, t?: ToastType) => void) => {
    window.location.href = `tel:${telefone.replace(/\D/g, '')}`;
    registrarContatoLead(id).then(() => {
      showToast('Ligação iniciada — contato registrado.', 'info');
      reload();
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  }, [reload]);

  /** Vincula o lead a um item real do estoque (ver auditoria, seção 4 —
   * antes "Veículo" era só o que o visitante digitou no formulário). */
  const associarVeiculo = useCallback((id: string, estoqueVeiculoId: string, showToast: (m: string, t?: ToastType) => void) => {
    associarVeiculoLead(id, estoqueVeiculoId).then(atualizado => {
      setLead(atualizado);
      showToast('Veículo associado ao lead!', 'success');
      reload();
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  }, [reload]);

  return {
    leads, urgFilter, setUrgFilter, modalId, setModalId, lead, pipeline,
    leadAgendamentos, reloadAgendamentos, assumirLead, ligarAgora,
    page, setPage, pagination, loading, error,
    estoqueDisponivel, associarVeiculo,
  };
}
