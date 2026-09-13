/**
 * @file metas.service.ts
 * @module metas
 * @description Service de acesso às metas comerciais.
 * Busca em GET /api/metas (paginado) e expõe create real — sem dado mockado.
 */

import type { Meta, MetaIndicador } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse, type PaginationMeta } from '../../../shared/api/client';

interface MetaApi {
  id: string;
  codigo: string;
  titulo: string;
  periodo: string;
  indicador: string;
  atual: number;
  alvo: number;
  unidade: string;
  responsavel: string;
  lowerIsBetter: boolean;
}

const toMeta = (item: MetaApi): Meta => ({
  id: item.id,
  codigo: item.codigo,
  titulo: item.titulo,
  periodo: item.periodo,
  indicador: item.indicador as MetaIndicador,
  atual: item.atual,
  alvo: item.alvo,
  unidade: item.unidade,
  responsavel: item.responsavel,
  lowerIsBetter: item.lowerIsBetter,
});

export interface FetchMetasParams { page: number; limit: number; }

export interface MetasPage {
  data: Meta[];
  pagination: PaginationMeta;
}

export async function fetchMetas(params: FetchMetasParams): Promise<MetasPage> {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  const response = await apiRequest<PaginatedResponse<MetaApi>>(`/metas?${qs}`);
  return { data: response.data.map(toMeta), pagination: response.pagination };
}

export interface CreateMetaInput {
  codigo: string;
  titulo: string;
  periodo: string;
  indicador: string;
  atual: number;
  alvo: number;
  unidade: string;
  responsavel: string;
  lowerIsBetter?: boolean;
}

export async function createMeta(input: CreateMetaInput): Promise<Meta> {
  const apiResponse = await apiRequest<MetaApi>('/metas', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return toMeta(apiResponse);
}

export interface UpdateMetaInput {
  titulo?: string;
  periodo?: string;
  atual?: number;
  alvo?: number;
  responsavel?: string;
}

export async function updateMeta(id: string, dados: UpdateMetaInput): Promise<Meta> {
  const apiResponse = await apiRequest<MetaApi>(`/metas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
  return toMeta(apiResponse);
}
