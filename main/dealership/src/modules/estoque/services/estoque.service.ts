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

import { ESTOQUE } from '../../../data/estoque.data';
import type { Estoque } from '../../../types/global.types';

export interface EstoqueFilters { query: string; cond: string; seg: string; }

export function filterEstoque(f: EstoqueFilters): Estoque[] {
  const q = f.query.toLowerCase();
  return ESTOQUE.filter(e =>
    (!q || e.modelo.toLowerCase().includes(q) || e.versao.toLowerCase().includes(q)) &&
    (!f.cond || e.cond === f.cond) &&
    (!f.seg  || e.seg  === f.seg)
  );
}
export function getEstoque(id: string) { return ESTOQUE.find(e => e.id === id); }
