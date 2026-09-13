/**
 * @file useClientes.ts
 * @module clientes
 * @description Hook de estado e lógica da tela de Clientes.
 *
 * Gerencia:
 * - filters: estado dos filtros (query, status, order) com valor padrão
 * - page/pagination: paginação real vinda do backend (status e busca textual
 *   são mandados como query string; a busca tem debounce de 300ms)
 * - loading/error: estado de carregamento e falha da busca
 * - clientes: página atual já ordenada (a ordenação por ltv é só da página
 *   carregada — o backend não expõe parâmetro de ordenação)
 * - modalOpen/setModalOpen: visibilidade do modal "Novo Cliente"
 * - salvarNovoCliente/salvarEdicaoCliente/confirmarExclusaoCliente: chamam o
 *   service e recarregam a página atual (não editam o array em memória —
 *   com paginação real, o item pode não pertencer mais à página/filtro atual)
 *
 * A tela clientes.screen.tsx não precisa saber como os dados são buscados
 * ou filtrados — apenas consome este hook.
 */

import { useState, useCallback, useEffect } from 'react';
import type { Cliente } from '../../../types/global.types';
import { friendlyApiMessage, type PaginationMeta } from '../../../shared/api/client';
import {
  sortClientes,
  fetchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type ClienteFilters,
} from '../services/clientes.service';

const DEFAULT: ClienteFilters = { query: '', status: '', order: 'nome' };
const PAGE_SIZE = 20;

export function useClientes() {
  const [filters, setFilters] = useState<ClienteFilters>(DEFAULT);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [source, setSource] = useState<Cliente[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(filters.query), 300);
    return () => clearTimeout(t);
  }, [filters.query]);

  useEffect(() => { setPage(1); }, [debouncedQuery, filters.status]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchClientes({ page, limit: PAGE_SIZE, status: filters.status, search: debouncedQuery })
      .then(res => { setSource(res.data); setPagination(res.pagination); })
      .catch(e => { setError(friendlyApiMessage(e)); setSource([]); setPagination(null); })
      .finally(() => setLoading(false));
  }, [page, filters.status, debouncedQuery]);

  useEffect(() => { load(); }, [load]);

  const clientes = sortClientes(filters.order, source);

  const updateFilter = useCallback(
    <K extends keyof ClienteFilters>(key: K, val: ClienteFilters[K]) =>
      setFilters(p => ({ ...p, [key]: val })),
    []
  );

  const validar = (dados: Pick<Cliente, 'nome' | 'tel' | 'email'>, showToast: (m: string, t?: 'warning') => void) => {
    if (!dados.nome || !dados.tel || !dados.email) {
      showToast('Preencha nome, telefone e e-mail.', 'warning'); return false;
    }
    if (dados.nome.trim().length < 3) {
      showToast('Nome precisa ter pelo menos 3 caracteres.', 'warning'); return false;
    }
    if (dados.tel.trim().length < 8) {
      showToast('Telefone precisa ter pelo menos 8 caracteres.', 'warning'); return false;
    }
    return true;
  };

  const salvarNovoCliente = useCallback(
    (dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>,
     showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!validar(dados, showToast)) return;
      createCliente(dados).then(novo => {
        setModalOpen(false);
        load();
        showToast(`Cliente ${novo.nome.split(' ')[0]} cadastrado!`, 'success');
      }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
    },
    [load]
  );

  const salvarEdicaoCliente = useCallback(
    (dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>,
     showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!editingCliente) return;
      if (!validar(dados, showToast)) return;
      updateCliente(editingCliente.id, dados).then(atualizado => {
        setEditingCliente(null);
        load();
        showToast(`Cliente ${atualizado.nome.split(' ')[0]} atualizado!`, 'success');
      }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
    },
    [editingCliente, load]
  );

  const confirmarExclusaoCliente = useCallback(
    (showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!deleteTarget) return;
      const nome = deleteTarget.nome;
      deleteCliente(deleteTarget.id).then(() => {
        setDeleteTarget(null);
        load();
        showToast(`Cliente ${nome.split(' ')[0]} removido.`, 'success');
      }).catch(e => {
        setDeleteTarget(null);
        showToast(friendlyApiMessage(e), 'warning');
      });
    },
    [deleteTarget, load]
  );

  return {
    clientes, filters, updateFilter, modalOpen, setModalOpen, salvarNovoCliente, error, loading,
    page, setPage, pagination,
    editingCliente, setEditingCliente, salvarEdicaoCliente,
    deleteTarget, setDeleteTarget, confirmarExclusaoCliente,
  };
}
