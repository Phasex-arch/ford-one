/**
 * @file resources/colaboradores.ts
 * @description Cliente HTTP para /api/v1/colaboradores.
 */

import { http } from '../http';
import { mapList } from '../adapters/paginated';
import type { ApiRole, ColaboradorApiDto, Paginated } from '../types';

export interface ColaboradorListParams {
  page?: number;
  limit?: number;
  ativo?: boolean;
  role?: ApiRole;
  search?: string;
}

export async function list(params: ColaboradorListParams = {}): Promise<ColaboradorApiDto[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.ativo !== undefined) query.ativo = params.ativo;
  if (params.role) query.role = params.role;
  if (params.search) query.search = params.search;
  const { data } = await http.get<
    Paginated<ColaboradorApiDto> | ColaboradorApiDto[]
  >('/colaboradores', { params: query });
  return mapList<ColaboradorApiDto, ColaboradorApiDto>(data, (dto) => dto);
}

export async function get(id: string): Promise<ColaboradorApiDto> {
  const { data } = await http.get<ColaboradorApiDto>(`/colaboradores/${id}`);
  return data;
}

export async function remove(id: string): Promise<void> {
  await http.delete(`/colaboradores/${id}`);
}
