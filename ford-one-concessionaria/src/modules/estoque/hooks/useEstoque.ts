/**
 * @file useEstoque.ts
 * @module estoque
 * @description Hook de estado e lógica da tela de Estoque.
 *
 * Gerencia:
 * - filters: estado dos filtros (query, cond, seg) — padrão: tudo vazio
 * - estoque: lista filtrada (memo recalculado ao mudar filters)
 * - updateFilter: atualiza um campo sem resetar os demais
 * - modalId/setModalId: ID do veículo cujo modal está aberto (null = fechado)
 *
 * Também escuta o CustomEvent 'ford:openEstoque' disparado pelo GlobalSearch
 * para abrir o modal de um veículo específico via busca global.
 */

import { useState, useMemo, useCallback } from 'react';
import { filterEstoque, type EstoqueFilters } from '../services/estoque.service';

const DEFAULT: EstoqueFilters = { query:'', cond:'', seg:'' };
export function useEstoque() {
  const [filters, setFilters] = useState<EstoqueFilters>(DEFAULT);
  const [modalId, setModalId] = useState<string|null>(null);

  const estoque = useMemo(() => filterEstoque(filters), [filters]);
  const updateFilter = useCallback(<K extends keyof EstoqueFilters>(k:K,v:EstoqueFilters[K]) => setFilters(p=>({...p,[k]:v})),[]);

  return { estoque, filters, updateFilter, modalId, setModalId };
}
