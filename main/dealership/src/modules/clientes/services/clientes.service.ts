/**
 * @file clientes.service.ts
 * @module clientes
 * @description Service responsável por operações de dados de clientes.
 *
 * Funções exportadas:
 * - fetchClientes(params) → busca uma página filtrada/paginada direto do backend
 *   (status e busca textual viram query string real; nada é filtrado em memória)
 * - sortClientes(order)   → ordena a página atual (o backend não tem parâmetro de
 *   ordenação por ltv/última visita, então isso só reordena os itens já carregados)
 * - SEGMENTOS             → array com os 5 segmentos válidos de cliente
 *
 * A interface ClienteFilters é exportada para o hook e o componente de filtros.
 */

import type { Cliente, ClienteStatus, ClienteSegmento } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse, type PaginationMeta } from '../../../shared/api/client';

export interface ClienteFilters {
  query: string;
  status: ClienteStatus | '';
  order: 'nome' | 'ltv' | 'ult';
}

interface ClienteApi {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  ultimaVisita?: string | null;
  status?: 'ATIVO' | 'INATIVO' | 'POTENCIAL';
  veiculosCount?: number;
  ltv?: number;
  iniciais: string;
  segmento: string;
}

const toCliente = (item: ClienteApi): Cliente => ({
  id: item.id,
  nome: item.nome,
  tel: item.telefone,
  email: item.email,
  ult: item.ultimaVisita ? new Date(item.ultimaVisita).toLocaleDateString('pt-BR') : '-',
  status: (item.status ?? 'ATIVO').toLowerCase() as ClienteStatus,
  v: item.veiculosCount ?? 0,
  ltv: item.ltv ?? 0,
  ini: item.iniciais,
  seg: item.segmento as ClienteSegmento,
});

export interface FetchClientesParams {
  page: number;
  limit: number;
  status?: ClienteStatus | '';
  search?: string;
}

export interface ClientesPage {
  data: Cliente[];
  pagination: PaginationMeta;
}

export async function fetchClientes(params: FetchClientesParams): Promise<ClientesPage> {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.status) qs.set('status', params.status.toUpperCase());
  if (params.search?.trim()) qs.set('search', params.search.trim());
  const response = await apiRequest<PaginatedResponse<ClienteApi>>(`/clientes?${qs}`);
  return { data: response.data.map(toCliente), pagination: response.pagination };
}

export async function fetchClienteById(id: string): Promise<Cliente> {
  const item = await apiRequest<ClienteApi>(`/clientes/${id}`);
  return toCliente(item);
}

export function sortClientes(order: ClienteFilters['order'], source: Cliente[] = []): Cliente[] {
  if (order === 'ltv') return [...source].sort((a, b) => b.ltv - a.ltv);
  if (order === 'nome') return [...source].sort((a, b) => a.nome.localeCompare(b.nome));
  return source;
}

export async function createCliente(dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>): Promise<Cliente> {
  const apiResponse = await apiRequest<ClienteApi>('/clientes', {
    method: 'POST',
    body: JSON.stringify({
      codigo: `CLI-${Date.now()}`,
      nome: dados.nome,
      telefone: dados.tel,
      email: dados.email,
      status: dados.status.toUpperCase(),
      iniciais: dados.nome.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      segmento: dados.seg,
    }),
  });
  return toCliente(apiResponse);
}

export async function updateCliente(
  id: string,
  dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>,
): Promise<Cliente> {
  const apiResponse = await apiRequest<ClienteApi>(`/clientes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      nome: dados.nome,
      telefone: dados.tel,
      email: dados.email,
      status: dados.status.toUpperCase(),
      segmento: dados.seg,
    }),
  });
  return toCliente(apiResponse);
}

export async function deleteCliente(id: string): Promise<void> {
  await apiRequest<void>(`/clientes/${id}`, { method: 'DELETE' });
}

export const SEGMENTOS: ClienteSegmento[] = ['Padrão', 'Família', 'Executivo', 'Premium', 'VIP'];
