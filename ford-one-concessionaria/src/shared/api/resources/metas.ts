/**
 * @file resources/metas.ts
 * @description Cliente HTTP para /api/v1/metas.
 */

import { http } from '../http';
import type { Meta } from '../../../types/global.types';
import { metaFromApi, metaToApiCreate, metaToApiUpdate } from '../adapters/metas';
import { mapList } from '../adapters/paginated';
import type { MetaApiDto, Paginated } from '../types';

export interface MetaListParams {
  page?: number;
  limit?: number;
  periodo?: string;
  indicador?: string;
}

export async function list(params: MetaListParams = {}): Promise<Meta[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.periodo) query.periodo = params.periodo;
  if (params.indicador) query.indicador = params.indicador;
  const { data } = await http.get<Paginated<MetaApiDto> | MetaApiDto[]>('/metas', {
    params: query,
  });
  return mapList<MetaApiDto, Meta>(data, metaFromApi);
}

export async function create(meta: Omit<Meta, 'id'>, codigo: string): Promise<Meta> {
  const { data } = await http.post<MetaApiDto>('/metas', metaToApiCreate(meta, codigo));
  return metaFromApi(data);
}

export async function update(id: string, patch: Partial<Meta>): Promise<Meta> {
  const { data } = await http.patch<MetaApiDto>(`/metas/${id}`, metaToApiUpdate(patch));
  return metaFromApi(data);
}

export async function remove(id: string): Promise<void> {
  await http.delete(`/metas/${id}`);
}
