/**
 * @file clientes.service.ts
 * @module clientes
 * @description Service responsável por operações de dados de clientes.
 *
 * Funções exportadas:
 * - fetchClientes()         → GET /clientes já convertido para o tipo Cliente
 * - filterClientes(filters) → filtra e ordena a lista por query, status e ordem
 * - createCliente(dados)    → POST /clientes
 * - SEGMENTOS               → array com os 5 segmentos válidos de cliente
 *
 * Os dados vêm de GET /clientes; a tradução do contrato do backend fica em
 * shared/api/mappers.ts. Aqui ficam apenas filtro e ordenação (client-side).
 * A interface ClienteFilters é exportada para o hook e o componente de filtros.
 */

import type { Cliente, ClienteStatus, ClienteSegmento } from '../../../types/global.types';

export { fetchClientes, createCliente } from '../../../shared/api/resources';

export interface ClienteFilters {
  query: string;
  status: ClienteStatus | '';
  order: 'nome' | 'ltv' | 'ult';
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

export const SEGMENTOS: ClienteSegmento[] = ['Padrão', 'Família', 'Executivo', 'Premium', 'VIP'];
