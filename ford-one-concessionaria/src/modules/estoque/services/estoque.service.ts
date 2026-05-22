/**
 * @file estoque.service.ts
 * @module estoque
 * @description Service de estoque delegando para /api/v1/estoque.
 *
 * - `fetchEstoque(filters)` chama a API com filtros de condicao/segmento/search.
 * - `applyFilters` mantem busca textual no cliente.
 * - `getEstoque(id)` consulta o store em memoria preenchido pelo useEstoque
 *   (e/ou pelo bootstrap inicial) — usado pelo EstoqueModal e FinSim a partir
 *   do estoque para nao precisar refazer a chamada HTTP.
 */

import { ESTOQUE as MOCK_ESTOQUE } from '../../../data/estoque.data';
import { estoqueStore } from '../../../shared/api/cache';
import * as estoqueApi from '../../../shared/api/resources/estoque';
import type { Estoque, EstoqueCondicao, EstoqueSegmento } from '../../../types/global.types';

export interface EstoqueFilters { query: string; cond: string; seg: string; }

export function applyFilters(items: Estoque[], f: EstoqueFilters): Estoque[] {
  const q = f.query.toLowerCase();
  return items.filter(e =>
    (!q || e.modelo.toLowerCase().includes(q) || e.versao.toLowerCase().includes(q)) &&
    (!f.cond || e.cond === f.cond) &&
    (!f.seg || e.seg === f.seg)
  );
}

export async function fetchEstoque(filters: EstoqueFilters): Promise<Estoque[]> {
  const items = await estoqueApi.list({
    condicao: (filters.cond as EstoqueCondicao) || undefined,
    segmento: (filters.seg as EstoqueSegmento) || undefined,
    modelo: filters.query || undefined,
    limit: 100,
  });
  return applyFilters(items, filters);
}

export function getEstoque(id: string): Estoque | undefined {
  const cached = estoqueStore.get().find(e => e.id === id);
  if (cached) return cached;
  // fallback para mock enquanto a API ainda nao respondeu
  return MOCK_ESTOQUE.find(e => e.id === id);
}
