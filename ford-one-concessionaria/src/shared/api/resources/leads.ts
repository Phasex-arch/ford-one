/**
 * @file resources/leads.ts
 * @description Cliente HTTP para /api/v1/leads.
 */

import { http } from '../http';
import type { Lead } from '../../../types/global.types';
import {
  leadFromApi,
  leadToApiCreate,
  leadToApiUpdate,
  leadUrgToApi,
} from '../adapters/leads';
import { mapList } from '../adapters/paginated';
import type { LeadApiDto, Paginated } from '../types';

export interface LeadListParams {
  page?: number;
  limit?: number;
  urgencia?: Lead['urg'];
  search?: string;
}

export async function list(params: LeadListParams = {}): Promise<Lead[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.urgencia) query.urgencia = leadUrgToApi[params.urgencia];
  if (params.search) query.search = params.search;
  const { data } = await http.get<Paginated<LeadApiDto> | LeadApiDto[]>('/leads', {
    params: query,
  });
  return mapList<LeadApiDto, Lead>(data, leadFromApi);
}

export async function get(id: string): Promise<Lead> {
  const { data } = await http.get<LeadApiDto>(`/leads/${id}`);
  return leadFromApi(data);
}

export async function create(
  dados: Omit<Lead, 'id'>,
  codigo: string
): Promise<Lead> {
  const { data } = await http.post<LeadApiDto>(
    '/leads',
    leadToApiCreate(dados, codigo)
  );
  return leadFromApi(data);
}

export async function update(id: string, patch: Partial<Lead>): Promise<Lead> {
  const { data } = await http.patch<LeadApiDto>(
    `/leads/${id}`,
    leadToApiUpdate(patch)
  );
  return leadFromApi(data);
}

export async function remove(id: string): Promise<void> {
  await http.delete(`/leads/${id}`);
}
