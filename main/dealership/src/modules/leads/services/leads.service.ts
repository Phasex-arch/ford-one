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
  convertido?: boolean;
  responsavelId?: string | null;
  responsavel?: { nome: string } | null;
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
  convertido: item.convertido ?? false,
  responsavel: item.responsavel?.nome ?? null,
  responsavelId: item.responsavelId ?? null,
});

export interface FetchLeadsParams {
  page: number;
  limit: number;
  urgencia?: LeadUrgencia | '';
  search?: string;
  /** Sem informar, traz todos (convertidos e não). */
  convertido?: boolean;
}

export interface LeadsPage {
  data: Lead[];
  pagination: PaginationMeta;
}

export async function fetchLeads(params: FetchLeadsParams): Promise<LeadsPage> {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.urgencia) qs.set('urgencia', params.urgencia.toUpperCase());
  if (params.search?.trim()) qs.set('search', params.search.trim());
  if (params.convertido !== undefined) qs.set('convertido', String(params.convertido));
  const response = await apiRequest<PaginatedResponse<LeadApi>>(`/leads?${qs}`);
  return { data: response.data.map(toLead), pagination: response.pagination };
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const item = await apiRequest<LeadApi>(`/leads/${id}`);
  return toLead(item);
}

export async function assumirLead(id: string, responsavelId: string): Promise<Lead> {
  const item = await apiRequest<LeadApi>(`/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ responsavelId }),
  });
  return toLead(item);
}

/**
 * POST /leads/:id/contato — registra o momento do contato real (ex.: "Ligar
 * agora"). É o sinal que o job de reavaliação de urgência usa pra saber que
 * alguém falou com o lead recentemente e não precisa escalar por
 * negligência ainda.
 */
export async function registrarContatoLead(id: string): Promise<Lead> {
  const item = await apiRequest<LeadApi>(`/leads/${id}/contato`, { method: 'POST' });
  return toLead(item);
}

/** Vincula o lead a um item real do estoque — o texto "Veículo" passa a
 * vir do cadastro real, não do que foi digitado no formulário público. */
export async function associarVeiculoLead(id: string, estoqueVeiculoId: string): Promise<Lead> {
  const item = await apiRequest<LeadApi>(`/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estoqueVeiculoId }),
  });
  return toLead(item);
}

export interface LeadsStats {
  total: number;
  urgentes: number;
  pipeline: number;
  ticketMedio: number;
}

export async function fetchLeadsStats(): Promise<LeadsStats> {
  // Convertido já é cliente — não conta mais como pipeline em aberto.
  const { data, pagination } = await fetchLeads({ page: 1, limit: 100, convertido: false });
  return {
    total: pagination.total,
    urgentes: data.filter(l => l.urg === 'urgente').length,
    pipeline: data.reduce((s, l) => s + l.val, 0),
    ticketMedio: data.length ? Math.round(data.reduce((s, l) => s + l.val, 0) / data.length) : 0,
  };
}
