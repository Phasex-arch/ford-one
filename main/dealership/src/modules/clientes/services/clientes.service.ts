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
import { CLIENTES } from '../../../data/clientes.data';

export interface ClienteFilters {
  query: string;
  status: ClienteStatus | '';
  order: 'nome' | 'ltv' | 'ult';
}

export function filterClientes(filters: ClienteFilters): Cliente[] {
  const q = filters.query.toLowerCase();
  let list = CLIENTES.filter(c =>
    (!q || c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
    (!filters.status || c.status === filters.status)
  );
  if (filters.order === 'ltv') list = [...list].sort((a, b) => b.ltv - a.ltv);
  return list;
}

export function addCliente(dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>): Cliente {
  const ini = dados.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const newId = 'C' + String(100 + CLIENTES.length + 1);
  const novo: Cliente = { id: newId, ini, v: 0, ltv: 0, ult: new Date().toLocaleDateString('pt-BR'), ...dados };
  CLIENTES.push(novo);
  return novo;
}

export const SEGMENTOS: ClienteSegmento[] = ['Padrão', 'Família', 'Executivo', 'Premium', 'VIP'];
