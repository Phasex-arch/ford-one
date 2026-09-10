/**
 * @file clientes.service.ts
 * @module clientes
 * @description Service responsável por operações de dados de clientes.
 *
 * Funções exportadas:
 * - filterClientes(filters) → filtra e ordena a lista por query, status e ordem
 * - addCliente(dados)       → cria novo cliente, gera ID e iniciais, insere no array
 * - SEGMENTOS               → array com os 5 segmentos válidos de cliente
 *
 * Em produção: substituir os acessos ao array CLIENTES por chamadas à API REST.
 * A interface ClienteFilters é exportada para o hook e o componente de filtros.
 */

import type { Cliente, ClienteStatus, ClienteSegmento } from '../../../types/global.types';
import { apiRequest } from '../../../shared/api/client';

export interface ClienteFilters {
  query: string;
  status: ClienteStatus | '';
  order: 'nome' | 'ltv' | 'ult';
}

const list = (value: Cliente[] | { items?: Cliente[]; clientes?: Cliente[] }) =>
  Array.isArray(value) ? value : value.items || value.clientes || [];

export async function fetchClientes(): Promise<Cliente[]> {
  return list(await apiRequest<Cliente[] | { items?: Cliente[]; clientes?: Cliente[] }>('/clientes'));
}

export function filterClientes(filters: ClienteFilters, source: Cliente[] = []): Cliente[] {
  const q = filters.query.toLowerCase();
  let list = source.filter(c =>
    (!q || c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
    (!filters.status || c.status === filters.status)
  );
  if (filters.order === 'ltv') list = [...list].sort((a, b) => b.ltv - a.ltv);
  return list;
}

export async function createCliente(dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>): Promise<Cliente> {
  return apiRequest<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(dados) });
}

export const SEGMENTOS: ClienteSegmento[] = ['Padrão', 'Família', 'Executivo', 'Premium', 'VIP'];
