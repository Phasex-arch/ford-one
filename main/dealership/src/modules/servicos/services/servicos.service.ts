/**
 * @file servicos.service.ts
 * @module servicos
 * @description Service de acesso às Ordens de Serviço da oficina.
 * Busca em GET /api/servicos?status=X (paginado por aba) e expõe create/
 * update/delete reais — nenhum dado mockado, nenhum store em memória.
 */

import type { OrdemServico } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse, type PaginationMeta } from '../../../shared/api/client';
import type { OSTab } from '../hooks/useServicos';

interface ServicoApi {
  id: string;
  numero: string;
  cliente: string;
  veiculo: string;
  tipo: string;
  tecnico: string;
  prazo: string;
  prioridade: 'OK' | 'RISCO' | 'ATRASADO';
  valor: number;
  status: 'PREVISTO' | 'ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
}

const TAB_TO_STATUS: Record<OSTab, ServicoApi['status']> = {
  previstos: 'PREVISTO',
  andamento: 'ANDAMENTO',
  concluidos: 'CONCLUIDO',
};

const toOrdemServico = (item: ServicoApi): OrdemServico => ({
  id: item.id,
  num: item.numero,
  c: item.cliente,
  v: item.veiculo,
  t: item.tipo,
  tech: item.tecnico,
  prazo: item.prazo,
  pc: item.prioridade.toLowerCase() as OrdemServico['pc'],
  val: item.valor,
});

export interface FetchServicosParams { tab: OSTab; page: number; limit: number; }

export interface ServicosPage {
  data: OrdemServico[];
  pagination: PaginationMeta;
}

export async function fetchServicos(params: FetchServicosParams): Promise<ServicosPage> {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    status: TAB_TO_STATUS[params.tab],
  });
  const response = await apiRequest<PaginatedResponse<ServicoApi>>(`/servicos?${qs}`);
  return { data: response.data.map(toOrdemServico), pagination: response.pagination };
}

export interface CreateServicoInput {
  numero: string;
  cliente: string;
  veiculo: string;
  tipo: string;
  tecnico: string;
  prazo: string;
  valor: number;
  prioridade?: 'OK' | 'RISCO' | 'ATRASADO';
}

export async function createServico(input: CreateServicoInput): Promise<OrdemServico> {
  const apiResponse = await apiRequest<ServicoApi>('/servicos', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return toOrdemServico(apiResponse);
}

export interface UpdateServicoInput {
  cliente?: string;
  veiculo?: string;
  tipo?: string;
  tecnico?: string;
  prazo?: string;
  valor?: number;
  prioridade?: 'OK' | 'RISCO' | 'ATRASADO';
  status?: ServicoApi['status'];
}

export async function updateServico(id: string, dados: UpdateServicoInput): Promise<OrdemServico> {
  const apiResponse = await apiRequest<ServicoApi>(`/servicos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
  return toOrdemServico(apiResponse);
}

export async function deleteServico(id: string): Promise<void> {
  await apiRequest<void>(`/servicos/${id}`, { method: 'DELETE' });
}

/** Próxima etapa do fluxo Previsto → Em Andamento → Concluído. */
export function nextStatus(tab: OSTab): ServicoApi['status'] | null {
  if (tab === 'previstos') return 'ANDAMENTO';
  if (tab === 'andamento') return 'CONCLUIDO';
  return null;
}
