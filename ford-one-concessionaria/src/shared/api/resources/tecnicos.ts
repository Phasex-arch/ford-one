/**
 * @file resources/tecnicos.ts
 * @description Cliente HTTP para /api/v1/tecnicos.
 */

import { http } from '../http';
import { tecnicoFromApi, tecnicoToApiCreate, type TecnicoLocal } from '../adapters/tecnicos';
import { mapList } from '../adapters/paginated';
import type { ApiTecnicoStatus, Paginated, TecnicoApiDto } from '../types';
import type { Tecnico } from '../../../types/global.types';

export interface TecnicoListParams {
  page?: number;
  limit?: number;
  status?: ApiTecnicoStatus;
  especialidade?: string;
}

export async function list(params: TecnicoListParams = {}): Promise<TecnicoLocal[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.status) query.status = params.status;
  if (params.especialidade) query.especialidade = params.especialidade;
  const { data } = await http.get<Paginated<TecnicoApiDto> | TecnicoApiDto[]>(
    '/tecnicos',
    { params: query }
  );
  return mapList<TecnicoApiDto, TecnicoLocal>(data, tecnicoFromApi);
}

export async function create(t: Tecnico): Promise<TecnicoLocal> {
  const { data } = await http.post<TecnicoApiDto>('/tecnicos', tecnicoToApiCreate(t));
  return tecnicoFromApi(data);
}
