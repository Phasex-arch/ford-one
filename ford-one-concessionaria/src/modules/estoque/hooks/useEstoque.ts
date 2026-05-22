/**
 * @file useEstoque.ts
 * @module estoque
 * @description Hook de estado e lógica da tela de Estoque.
 *
 * - Carrega o estoque da API quando os filtros mudam.
 * - Mantem o snapshot atual no estoqueStore (cache global compartilhado).
 * - Escuta o CustomEvent 'ford:openEstoque' para abrir o modal vindo da
 *   busca global.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  applyFilters,
  fetchEstoque,
  type EstoqueFilters,
} from '../services/estoque.service';
import { estoqueStore } from '../../../shared/api/cache';
import { extractErrorMessage } from '../../../shared/api/http';
import type { Estoque } from '../../../types/global.types';

const DEFAULT: EstoqueFilters = { query: '', cond: '', seg: '' };

export function useEstoque() {
  const [filters, setFilters] = useState<EstoqueFilters>(DEFAULT);
  const [estoque, setEstoque] = useState<Estoque[]>(() =>
    applyFilters(estoqueStore.get(), DEFAULT)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const reqId = useRef(0);

  const refresh = useCallback(async (next: EstoqueFilters) => {
    const myReq = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchEstoque(next);
      if (myReq !== reqId.current) return;
      estoqueStore.set(list);
      setEstoque(list);
    } catch (err) {
      if (myReq !== reqId.current) return;
      setError(extractErrorMessage(err, 'Falha ao carregar estoque.'));
      setEstoque(applyFilters(estoqueStore.get(), next));
    } finally {
      if (myReq === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(filters);
  }, [refresh, filters]);

  const updateFilter = useCallback(
    <K extends keyof EstoqueFilters>(k: K, v: EstoqueFilters[K]) =>
      setFilters((p) => ({ ...p, [k]: v })),
    []
  );

  useEffect(() => {
    const h = (e: Event) => setModalId((e as CustomEvent<string>).detail);
    window.addEventListener('ford:openEstoque', h);
    return () => window.removeEventListener('ford:openEstoque', h);
  }, []);

  return {
    estoque,
    filters,
    updateFilter,
    modalId,
    setModalId,
    loading,
    error,
    refresh: () => refresh(filters),
  };
}
