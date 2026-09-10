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
 * Os dados vêm de GET /estoque; a conversão do contrato fica em shared/api/mappers.ts.
 * O filtro é aplicado no cliente sobre a lista já carregada.
 */

import type { Estoque } from '../../../types/global.types';
import { fetchEstoque as fetchEstoqueApi } from '../../../shared/api/resources';

let currentEstoque: Estoque[] = [];

export interface EstoqueFilters { query: string; cond: string; seg: string; }

/** Mantém a última lista carregada para o lookup síncrono de getEstoque(). */
export async function fetchEstoque(): Promise<Estoque[]> {
  currentEstoque = await fetchEstoqueApi();
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
