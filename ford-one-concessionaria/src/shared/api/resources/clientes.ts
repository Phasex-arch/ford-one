/**
 * @file resources/clientes.ts
 * @description Cliente HTTP para /api/v1/clientes.
 */

import { http } from '../http';
import type { Cliente } from '../../../types/global.types';
import {
  clienteFromApi,
  clienteToApiCreate,
  clienteToApiUpdate,
  clienteStatusToApi,
  type ClienteCreatePayload,
} from '../adapters/clientes';
import { mapList } from '../adapters/paginated';
import type { ClienteApiDto, Paginated } from '../types';

export interface ClienteListParams {
  page?: number;
  limit?: number;
  status?: Cliente['status'];
  segmento?: string;
  search?: string;
}

export async function list(params: ClienteListParams = {}): Promise<Cliente[]> {
  const query: Record<string, unknown> = {
    page: params.page,
    limit: params.limit ?? 100,
  };
  if (params.status) query.status = clienteStatusToApi[params.status];
  if (params.segmento) query.segmento = params.segmento;
  if (params.search) query.search = params.search;
  const { data } = await http.get<Paginated<ClienteApiDto> | ClienteApiDto[]>(
    '/clientes',
    { params: query }
  );
  return mapList<ClienteApiDto, Cliente>(data, clienteFromApi);
}

export async function get(id: string): Promise<Cliente> {
  const { data } = await http.get<ClienteApiDto>(`/clientes/${id}`);
  return clienteFromApi(data);
}

export async function create(
  dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>,
  extras: { codigo: string; iniciais: string }
): Promise<Cliente> {
  const payload: ClienteCreatePayload = clienteToApiCreate(dados, extras);
  const { data } = await http.post<ClienteApiDto>('/clientes', payload);
  return clienteFromApi(data);
}

export async function update(id: string, patch: Partial<Cliente>): Promise<Cliente> {
  const { data } = await http.patch<ClienteApiDto>(
    `/clientes/${id}`,
    clienteToApiUpdate(patch)
  );
  return clienteFromApi(data);
}

export async function remove(id: string): Promise<void> {
  await http.delete(`/clientes/${id}`);
}
