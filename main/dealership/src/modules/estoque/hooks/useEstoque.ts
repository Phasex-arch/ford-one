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
 * - loading/error: estado do GET /estoque (via useAsyncList)
 *
 * Também escuta o CustomEvent 'ford:openEstoque' disparado pelo GlobalSearch
 * para abrir o modal de um veículo específico via busca global.
 */

import { useState, useMemo, useCallback } from 'react';
import { useAsyncList } from '../../../shared/hooks/useAsyncList';
import { filterEstoque, fetchEstoque, type EstoqueFilters } from '../services/estoque.service';

const DEFAULT: EstoqueFilters = { query:'', cond:'', seg:'' };
export function useEstoque() {
  const [filters, setFilters] = useState<EstoqueFilters>(DEFAULT);
  const [modalId, setModalId] = useState<string|null>(null);
  const { data: source, loading, error } = useAsyncList(fetchEstoque);

  const estoque = useMemo(() => filterEstoque(filters, source), [filters, source]);
  const updateFilter = useCallback(<K extends keyof EstoqueFilters>(k:K,v:EstoqueFilters[K]) => setFilters(p=>({...p,[k]:v})),[]);

  return { estoque, filters, updateFilter, modalId, setModalId, loading, error };
}
