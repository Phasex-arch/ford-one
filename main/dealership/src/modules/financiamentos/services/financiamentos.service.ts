/**
 * @file financiamentos.service.ts
 * @module financiamentos
 * @description Service de acesso à carteira de financiamentos.
 * Busca em GET /api/financiamentos (paginado) e expõe create real — sem
 * dado mockado.
 */

import type { Financiamento, FinanciamentoStatus } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse, type PaginationMeta } from '../../../shared/api/client';

interface FinanciamentoApi {
  id: string;
  codigo: string;
  clienteNome: string;
  iniciais: string;
  veiculo: string;
  valor: number;
  entrada: number;
  prazo: number;
  taxa: number;
  parcela: number;
  status: 'APROVADO' | 'ANALISE' | 'PENDENTE' | 'REPROVADO';
  data: string;
}

const toFinanciamento = (item: FinanciamentoApi): Financiamento => ({
  id: item.id,
  codigo: item.codigo,
  cli: item.clienteNome,
  ini: item.iniciais,
  veiculo: item.veiculo,
  valor: item.valor,
  entrada: item.entrada,
  prazo: item.prazo,
  taxa: item.taxa,
  parcela: item.parcela,
  status: item.status.toLowerCase() as FinanciamentoStatus,
  data: item.data,
});

export interface FetchFinanciamentosParams { page: number; limit: number; }

export interface FinanciamentosPage {
  data: Financiamento[];
  pagination: PaginationMeta;
}

export async function fetchFinanciamentos(params: FetchFinanciamentosParams): Promise<FinanciamentosPage> {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  const response = await apiRequest<PaginatedResponse<FinanciamentoApi>>(`/financiamentos?${qs}`);
  return { data: response.data.map(toFinanciamento), pagination: response.pagination };
}

export interface CreateFinanciamentoInput {
  codigo: string;
  clienteNome: string;
  iniciais: string;
  veiculo: string;
  valor: number;
  entrada: number;
  prazo: number;
  taxa: number;
  parcela: number;
  data: string;
  responsavelId?: string;
}

export async function createFinanciamento(input: CreateFinanciamentoInput): Promise<Financiamento> {
  const apiResponse = await apiRequest<FinanciamentoApi>('/financiamentos', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return toFinanciamento(apiResponse);
}

/** DELETE /financiamentos/:uuid — restrito a ADMIN no backend. */
export async function deleteFinanciamento(id: string): Promise<void> {
  await apiRequest<void>(`/financiamentos/${id}`, { method: 'DELETE' });
}

/**
 * PATCH /financiamentos/:uuid — restrito a ADMIN/GERENTE no backend. Move a
 * simulação pra Aprovado (vira contrato ativo) ou Reprovado (encerra sem
 * sucesso), espelhando a decisão do banco/financeira no mundo real.
 */
export async function updateFinanciamentoStatus(
  id: string,
  status: Extract<FinanciamentoStatus, 'aprovado' | 'reprovado'>,
): Promise<Financiamento> {
  const apiResponse = await apiRequest<FinanciamentoApi>(`/financiamentos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: status.toUpperCase() }),
  });
  return toFinanciamento(apiResponse);
}
