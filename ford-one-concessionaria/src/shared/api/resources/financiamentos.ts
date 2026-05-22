/**
 * @file resources/financiamentos.ts
 * @description Cliente HTTP para /api/v1/financiamentos.
 */

import { http } from '../http';
import type { Financiamento } from '../../../types/global.types';
import {
  financiamentoFromApi,
  financiamentoStatusToApi,
  financiamentoToApiCreate,
  financiamentoToApiUpdate,
} from '../adapters/financiamentos';
import { mapList } from '../adapters/paginated';
import type { FinanciamentoApiDto, Paginated } from '../types';

export interface FinanciamentoListParams {
  page?: number;
  limit?: number;
  status?: Financiamento['status'];
  search?: string;
}

export async function list(
  params: FinanciamentoListParams = {}
): Promise<Financiamento[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.status) query.status = financiamentoStatusToApi[params.status];
  if (params.search) query.search = params.search;
  const { data } = await http.get<
    Paginated<FinanciamentoApiDto> | FinanciamentoApiDto[]
  >('/financiamentos', { params: query });
  return mapList<FinanciamentoApiDto, Financiamento>(data, financiamentoFromApi);
}

export async function get(id: string): Promise<Financiamento> {
  const { data } = await http.get<FinanciamentoApiDto>(`/financiamentos/${id}`);
  return financiamentoFromApi(data);
}

export async function create(
  fin: Omit<Financiamento, 'id'>,
  codigo: string
): Promise<Financiamento> {
  const { data } = await http.post<FinanciamentoApiDto>(
    '/financiamentos',
    financiamentoToApiCreate(fin, codigo)
  );
  return financiamentoFromApi(data);
}

export async function update(
  id: string,
  patch: Partial<Financiamento>
): Promise<Financiamento> {
  const { data } = await http.patch<FinanciamentoApiDto>(
    `/financiamentos/${id}`,
    financiamentoToApiUpdate(patch)
  );
  return financiamentoFromApi(data);
}

export async function remove(id: string): Promise<void> {
  await http.delete(`/financiamentos/${id}`);
}
