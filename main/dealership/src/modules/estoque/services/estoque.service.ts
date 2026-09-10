/**
 * @file estoque.service.ts
 * @module estoque
 * @description Service de acesso e filtragem do estoque de veículos.
 *
 * Funções exportadas:
 * - filterEstoque(filters) → filtra por query de texto, condição e segmento
 * - getEstoque(id)         → retorna um veículo específico pelo ID
 *
 * A interface EstoqueFilters é exportada para o useEstoque e a barra de filtros.
 * Em produção: substituir por chamada GET /api/estoque?cond=&seg=&q=.
 */

import type { Estoque } from '../../../types/global.types';
import { apiRequest } from '../../../shared/api/client';
let currentEstoque: Estoque[] = [];

export interface EstoqueFilters { query: string; cond: string; seg: string; }
export async function fetchEstoque(): Promise<Estoque[]> {
  const result = await apiRequest<Estoque[] | { items?: Estoque[]; estoque?: Estoque[] }>('/estoque');
  currentEstoque = Array.isArray(result) ? result : result.items || result.estoque || [];
  return currentEstoque;
}

export function filterEstoque(f: EstoqueFilters, source: Estoque[] = []): Estoque[] {
  const q = f.query.toLowerCase();
  return source.filter(e =>
    (!q || e.modelo.toLowerCase().includes(q) || e.versao.toLowerCase().includes(q)) &&
    (!f.cond || e.cond === f.cond) &&
    (!f.seg  || e.seg  === f.seg)
  );
}
export function getEstoque(id: string) { return currentEstoque.find(e => e.id === id); }
