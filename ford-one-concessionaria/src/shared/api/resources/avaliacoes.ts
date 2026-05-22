/**
 * @file resources/avaliacoes.ts
 * @description Cliente HTTP para /api/v1/avaliacoes e /avaliacoes/stats.
 */

import { http } from '../http';
import type { Avaliacao } from '../../../types/global.types';
import { avaliacaoFromApi, avaliacaoToApiCreate, type AvaliacaoLocal } from '../adapters/avaliacoes';
import { mapList } from '../adapters/paginated';
import type { AvaliacaoApiDto, AvaliacaoStatsDto, Paginated } from '../types';

export interface AvaliacaoListParams {
  page?: number;
  limit?: number;
  notaMin?: number;
  notaMax?: number;
}

export async function list(params: AvaliacaoListParams = {}): Promise<AvaliacaoLocal[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.notaMin !== undefined) query.notaMin = params.notaMin;
  if (params.notaMax !== undefined) query.notaMax = params.notaMax;
  const { data } = await http.get<Paginated<AvaliacaoApiDto> | AvaliacaoApiDto[]>(
    '/avaliacoes',
    { params: query }
  );
  return mapList<AvaliacaoApiDto, AvaliacaoLocal>(data, avaliacaoFromApi);
}

export async function stats(): Promise<AvaliacaoStatsDto> {
  const { data } = await http.get<AvaliacaoStatsDto>('/avaliacoes/stats');
  return data;
}

export async function create(a: Avaliacao): Promise<AvaliacaoLocal> {
  const { data } = await http.post<AvaliacaoApiDto>('/avaliacoes', avaliacaoToApiCreate(a));
  return avaliacaoFromApi(data);
}

export async function remove(id: string): Promise<void> {
  await http.delete(`/avaliacoes/${id}`);
}
