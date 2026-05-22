/**
 * @file resources/estoque.ts
 * @description Cliente HTTP para /api/v1/estoque.
 */

import { http } from '../http';
import type { Estoque } from '../../../types/global.types';
import {
  estoqueCondToApi,
  estoqueFromApi,
  estoqueSegToApi,
  estoqueToApiCreate,
  estoqueToApiUpdate,
} from '../adapters/estoque';
import { mapList } from '../adapters/paginated';
import type { EstoqueApiDto, Paginated } from '../types';

export interface EstoqueListParams {
  page?: number;
  limit?: number;
  condicao?: Estoque['cond'];
  segmento?: Estoque['seg'] | string;
  modelo?: string;
  status?: string;
  precoMin?: number;
  precoMax?: number;
}

export async function list(params: EstoqueListParams = {}): Promise<Estoque[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.condicao) query.condicao = estoqueCondToApi[params.condicao];
  if (params.segmento) query.segmento = estoqueSegToApi(params.segmento);
  if (params.modelo) query.modelo = params.modelo;
  if (params.status) query.status = params.status;
  if (params.precoMin !== undefined) query.precoMin = params.precoMin;
  if (params.precoMax !== undefined) query.precoMax = params.precoMax;
  const { data } = await http.get<Paginated<EstoqueApiDto> | EstoqueApiDto[]>(
    '/estoque',
    { params: query }
  );
  return mapList<EstoqueApiDto, Estoque>(data, estoqueFromApi);
}

export async function get(id: string): Promise<Estoque> {
  const { data } = await http.get<EstoqueApiDto>(`/estoque/${id}`);
  return estoqueFromApi(data);
}

export async function create(payload: Omit<Estoque, 'id'> & { codigo: string }): Promise<Estoque> {
  const { data } = await http.post<EstoqueApiDto>('/estoque', estoqueToApiCreate(payload));
  return estoqueFromApi(data);
}

export async function update(id: string, patch: Partial<Estoque>): Promise<Estoque> {
  const { data } = await http.patch<EstoqueApiDto>(
    `/estoque/${id}`,
    estoqueToApiUpdate(patch)
  );
  return estoqueFromApi(data);
}

export async function remove(id: string): Promise<void> {
  await http.delete(`/estoque/${id}`);
}
