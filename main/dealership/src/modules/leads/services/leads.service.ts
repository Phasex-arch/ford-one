/**
 * @file leads.service.ts
 * @module leads
 * @description Service de acesso ao pipeline de leads inteligentes.
 *
 * Funções exportadas:
 * - fetchLeads(params)   → busca uma página filtrada/paginada direto do backend
 *   (urgência e busca textual viram query string real)
 * - fetchLeadById(id)    → busca um lead específico (usado quando o modal abre
 *   via busca global e o lead pode não estar na página atualmente carregada)
 * - fetchLeadsStats()    → snapshot agregado (até 100 leads, limite do backend)
 *   usado só pro Pipeline Bar — soma/média não são exatas acima de 100 leads
 *   porque o backend não expõe um endpoint de estatísticas dedicado; o total
 *   de leads em si vem de `pagination.total`, esse sim sempre exato.
 */

import type { Lead, LeadUrgencia } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse, type PaginationMeta } from '../../../shared/api/client';

interface LeadApi {
  id: string;
  clienteNome: string;
  iniciais: string;
  veiculoInteresse: string;
  necessidade: string;
  urgencia: 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAIXA';
  valorEstimado: number;
  telefone: string;
  email?: string | null;
  insight?: string | null;
}

const toLead = (item: LeadApi): Lead => ({
  id: item.id,
  cli: item.clienteNome,
  ini: item.iniciais,
  v: item.veiculoInteresse,
  nec: item.necessidade,
  urg: item.urgencia.toLowerCase() as LeadUrgencia,
  val: item.valorEstimado,
  tel: item.telefone,
  email: item.email ?? null,
  ins: item.insight ?? 'Sem insight adicional.',
});

export interface FetchLeadsParams {
  page: number;
  limit: number;
  urgencia?: LeadUrgencia | '';
  search?: string;
}

export interface LeadsPage {
  data: Lead[];
  pagination: PaginationMeta;
}

export async function fetchLeads(params: FetchLeadsParams): Promise<LeadsPage> {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.urgencia) qs.set('urgencia', params.urgencia.toUpperCase());
  if (params.search?.trim()) qs.set('search', params.search.trim());
  const response = await apiRequest<PaginatedResponse<LeadApi>>(`/leads?${qs}`);
  return { data: response.data.map(toLead), pagination: response.pagination };
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const item = await apiRequest<LeadApi>(`/leads/${id}`);
  return toLead(item);
}

export interface LeadsStats {
  total: number;
  urgentes: number;
  pipeline: number;
  ticketMedio: number;
}

export async function fetchLeadsStats(): Promise<LeadsStats> {
  const { data, pagination } = await fetchLeads({ page: 1, limit: 100 });
  return {
    total: pagination.total,
    urgentes: data.filter(l => l.urg === 'urgente').length,
    pipeline: data.reduce((s, l) => s + l.val, 0),
    ticketMedio: data.length ? Math.round(data.reduce((s, l) => s + l.val, 0) / data.length) : 0,
  };
}
