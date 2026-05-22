/**
 * @file clientes.service.ts
 * @module clientes
 * @description Service de clientes. Agora delega para a API NestJS
 * (`/api/v1/clientes`) via src/shared/api/resources/clientes.ts, mantendo
 * a mesma assinatura publica usada pelo useClientes (filtros + criacao).
 *
 * A filtragem por texto + ordenacao continua acontecendo no cliente
 * porque a UI permite alternar entre nome / LTV / ultimo atendimento e a
 * API so expoe filtros por status/segmento/search.
 */

import type { Cliente, ClienteStatus, ClienteSegmento } from '../../../types/global.types';
import * as clientesApi from '../../../shared/api/resources/clientes';

export interface ClienteFilters {
  query: string;
  status: ClienteStatus | '';
  order: 'nome' | 'ltv' | 'ult';
}

const DATE_BR_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function parseDateBr(value: string): number {
  const m = DATE_BR_REGEX.exec(value);
  if (!m) return 0;
  const [, dd, mm, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
}

export function applyFilters(items: Cliente[], filters: ClienteFilters): Cliente[] {
  const q = filters.query.toLowerCase();
  let list = items.filter(
    (c) =>
      (!q || c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
      (!filters.status || c.status === filters.status)
  );
  if (filters.order === 'ltv') list = [...list].sort((a, b) => b.ltv - a.ltv);
  else if (filters.order === 'ult')
    list = [...list].sort((a, b) => parseDateBr(b.ult) - parseDateBr(a.ult));
  else if (filters.order === 'nome')
    list = [...list].sort((a, b) => a.nome.localeCompare(b.nome));
  return list;
}

export async function fetchClientes(filters: ClienteFilters): Promise<Cliente[]> {
  const items = await clientesApi.list({
    status: filters.status || undefined,
    search: filters.query || undefined,
    limit: 100,
  });
  return applyFilters(items, filters);
}

export async function createCliente(
  dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>
): Promise<Cliente> {
  const iniciais = dados.nome
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CL';
  const codigo = `C${Date.now().toString().slice(-6)}`;
  return clientesApi.create(dados, { codigo, iniciais });
}

export async function updateCliente(id: string, patch: Partial<Cliente>): Promise<Cliente> {
  return clientesApi.update(id, patch);
}

export async function removeCliente(id: string): Promise<void> {
  return clientesApi.remove(id);
}

export const SEGMENTOS: ClienteSegmento[] = ['Padrão', 'Família', 'Executivo', 'Premium', 'VIP'];
