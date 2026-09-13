/**
 * @file useEstoque.ts
 * @module estoque
 * @description Hook de estado e lógica da tela de Estoque.
 *
 * Gerencia:
 * - filters: estado dos filtros (query, cond, seg) — mandados como query string
 *   real pro backend (busca com debounce de 300ms), nada filtrado em memória
 * - page/pagination/loading/error: paginação real e estado de carregamento
 * - modalId/modalItem: item cujo modal está aberto — resolvido primeiro na
 *   página atual (síncrono) e, se não encontrado (ex.: aberto via busca
 *   global apontando pra um item fora da página carregada), buscado por ID
 *
 * Também escuta o CustomEvent 'ford:openEstoque' disparado pelo GlobalSearch
 * para abrir o modal de um veículo específico via busca global.
 */

import { useState, useCallback, useEffect } from 'react';
import type { Estoque } from '../../../types/global.types';
import { friendlyApiMessage, type PaginationMeta } from '../../../shared/api/client';
import {
  fetchEstoque,
  fetchEstoqueById,
  updateEstoque,
  deleteEstoque,
  type EstoqueFilters,
  type UpdateEstoqueInput,
} from '../services/estoque.service';

const DEFAULT: EstoqueFilters = { query:'', cond:'', seg:'' };
const PAGE_SIZE = 20;

export function useEstoque() {
  const [filters, setFilters] = useState<EstoqueFilters>(DEFAULT);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modalId, setModalId] = useState<string|null>(null);
  const [modalItem, setModalItem] = useState<Estoque | undefined>(undefined);
  const [editingEstoque, setEditingEstoque] = useState<Estoque | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Estoque | null>(null);
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(filters.query), 300);
    return () => clearTimeout(t);
  }, [filters.query]);

  useEffect(() => { setPage(1); }, [debouncedQuery, filters.cond, filters.seg]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchEstoque({ page, limit: PAGE_SIZE, cond: filters.cond, seg: filters.seg, search: debouncedQuery });
      setEstoque(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(friendlyApiMessage(e));
      setEstoque([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, filters.cond, filters.seg, debouncedQuery]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    const h = (e: Event) => setModalId((e as CustomEvent<string>).detail);
    window.addEventListener('ford:openEstoque', h);
    return () => window.removeEventListener('ford:openEstoque', h);
  }, []);

  useEffect(() => {
    if (!modalId) { setModalItem(undefined); return; }
    const found = estoque.find(e => e.id === modalId);
    if (found) { setModalItem(found); return; }
    fetchEstoqueById(modalId).then(setModalItem).catch(() => setModalItem(undefined));
  }, [modalId, estoque]);

  const updateFilter = useCallback(<K extends keyof EstoqueFilters>(k:K,v:EstoqueFilters[K]) => setFilters(p=>({...p,[k]:v})),[]);

  const salvarEdicaoEstoque = useCallback(
    (dados: UpdateEstoqueInput, showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!editingEstoque) return;
      updateEstoque(editingEstoque.id, dados).then(atualizado => {
        setEditingEstoque(null);
        reload();
        showToast(`${atualizado.modelo} atualizado!`, 'success');
      }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
    },
    [editingEstoque, reload]
  );

  const confirmarExclusaoEstoque = useCallback(
    (showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!deleteTarget) return;
      const modelo = deleteTarget.modelo;
      deleteEstoque(deleteTarget.id).then(() => {
        setDeleteTarget(null);
        setModalId(null);
        reload();
        showToast(`${modelo} removido do estoque.`, 'success');
      }).catch(e => {
        setDeleteTarget(null);
        showToast(friendlyApiMessage(e), 'warning');
      });
    },
    [deleteTarget, reload]
  );

  return {
    estoque, filters, updateFilter, modalId, setModalId, modalItem, reload,
    page, setPage, pagination, loading, error,
    editingEstoque, setEditingEstoque, salvarEdicaoEstoque,
    deleteTarget, setDeleteTarget, confirmarExclusaoEstoque,
  };
}
