/**
 * @file resources/servicos.ts
 * @description Cliente HTTP para /api/v1/servicos (Ordens de Servico).
 */

import { http } from '../http';
import type { OrdemServico } from '../../../types/global.types';
import {
  servicoFromApi,
  servicoToApiCreate,
  servicoToApiUpdate,
  type ServicoLocal,
} from '../adapters/servicos';
import { mapList } from '../adapters/paginated';
import type {
  ApiServicoPrioridade,
  ApiServicoStatus,
  Paginated,
  ServicoApiDto,
} from '../types';

export interface ServicoListParams {
  page?: number;
  limit?: number;
  status?: ApiServicoStatus;
  prioridade?: ApiServicoPrioridade;
  tecnico?: string;
  search?: string;
}

export async function list(params: ServicoListParams = {}): Promise<ServicoLocal[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.status) query.status = params.status;
  if (params.prioridade) query.prioridade = params.prioridade;
  if (params.tecnico) query.tecnico = params.tecnico;
  if (params.search) query.search = params.search;
  const { data } = await http.get<Paginated<ServicoApiDto> | ServicoApiDto[]>(
    '/servicos',
    { params: query }
  );
  return mapList<ServicoApiDto, ServicoLocal>(data, servicoFromApi);
}

export async function get(id: string): Promise<ServicoLocal> {
  const { data } = await http.get<ServicoApiDto>(`/servicos/${id}`);
  return servicoFromApi(data);
}

export async function create(
  dados: Omit<OrdemServico, 'num' | 'pc'>,
  numero: string
): Promise<ServicoLocal> {
  const { data } = await http.post<ServicoApiDto>(
    '/servicos',
    servicoToApiCreate(dados, numero)
  );
  return servicoFromApi(data);
}

export async function update(
  id: string,
  patch: Partial<OrdemServico> & { status?: ApiServicoStatus }
): Promise<ServicoLocal> {
  const { data } = await http.patch<ServicoApiDto>(
    `/servicos/${id}`,
    servicoToApiUpdate(patch)
  );
  return servicoFromApi(data);
}

export async function remove(id: string): Promise<void> {
  await http.delete(`/servicos/${id}`);
}
