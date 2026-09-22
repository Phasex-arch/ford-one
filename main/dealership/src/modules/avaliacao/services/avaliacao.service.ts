/**
 * @file avaliacao.service.ts
 * @module avaliacao
 * @description Service de acesso às avaliações de satisfação de clientes.
 * Busca em GET /api/avaliacoes/todas (staff, todos os status — a tela é onde
 * a moderação acontece) e GET /api/avaliacoes/stats (só aprovadas, é o que o
 * público de fato vê). Sem nenhum dado mockado: nota média e total vêm
 * sempre da API. NPS, SLA médio e ranking foram removidos da tela porque não
 * existe fonte de dado real pra eles (o backend só agrega nota média e
 * contagem).
 */

import type { Avaliacao, AvaliacaoStatus } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse, type PaginationMeta } from '../../../shared/api/client';

interface AvaliacaoApi {
  id: string;
  cliente: string;
  nota: number;
  data: string;
  texto: string;
  detalhe?: string | null;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
}

export interface AvaliacaoStats {
  total: number;
  notaMedia: number;
}

const toAvaliacao = (item: AvaliacaoApi): Avaliacao => ({
  id: item.id,
  c: item.cliente,
  nota: item.nota,
  data: item.data,
  txt: item.texto,
  detalhe: item.detalhe ?? '',
  status: item.status.toLowerCase() as AvaliacaoStatus,
});

export interface FetchAvaliacoesParams { page: number; limit: number; }

export interface AvaliacoesPage {
  data: Avaliacao[];
  pagination: PaginationMeta;
}

export async function fetchAvaliacoes(params: FetchAvaliacoesParams): Promise<AvaliacoesPage> {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  const response = await apiRequest<PaginatedResponse<AvaliacaoApi>>(`/avaliacoes/todas?${qs}`);
  return { data: response.data.map(toAvaliacao), pagination: response.pagination };
}

/** PATCH status — aprova ou rejeita uma avaliação pendente (moderação). */
export async function moderarAvaliacao(id: string, status: Extract<AvaliacaoStatus, 'aprovada' | 'rejeitada'>): Promise<Avaliacao> {
  const apiResponse = await apiRequest<AvaliacaoApi>(`/avaliacoes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: status.toUpperCase() }),
  });
  return toAvaliacao(apiResponse);
}

export async function fetchAvaliacaoStats(): Promise<AvaliacaoStats> {
  return apiRequest<AvaliacaoStats>('/avaliacoes/stats');
}

export interface UpdateAvaliacaoInput {
  cliente?: string;
  nota?: number;
  detalhe?: string;
  texto?: string;
}

export async function updateAvaliacao(id: string, dados: UpdateAvaliacaoInput): Promise<Avaliacao> {
  const apiResponse = await apiRequest<AvaliacaoApi>(`/avaliacoes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
  return toAvaliacao(apiResponse);
}

export async function deleteAvaliacao(id: string): Promise<void> {
  await apiRequest<void>(`/avaliacoes/${id}`, { method: 'DELETE' });
}
