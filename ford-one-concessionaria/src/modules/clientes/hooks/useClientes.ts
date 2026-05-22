/**
 * @file useClientes.ts
 * @module clientes
 * @description Hook de estado e lógica da tela de Clientes.
 *
 * Carrega clientes da API quando os filtros (query/status) mudam e mantem
 * `clientes` como um array ja filtrado/ordenado. Publica o snapshot atual
 * no clientesStore para que GlobalSearch, AppContext.logAccess e historico
 * possam consumir sem refazer chamadas HTTP.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Cliente } from '../../../types/global.types';
import {
  applyFilters,
  createCliente,
  fetchClientes,
  type ClienteFilters,
} from '../services/clientes.service';
import { clientesStore } from '../../../shared/api/cache';
import { extractErrorMessage } from '../../../shared/api/http';

const DEFAULT: ClienteFilters = { query: '', status: '', order: 'nome' };

export function useClientes() {
  const [filters, setFilters] = useState<ClienteFilters>(DEFAULT);
  const [clientes, setClientes] = useState<Cliente[]>(() =>
    applyFilters(clientesStore.get(), DEFAULT)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const reqId = useRef(0);

  const refresh = useCallback(
    async (next: ClienteFilters) => {
      const myReq = ++reqId.current;
      setLoading(true);
      setError(null);
      try {
        const list = await fetchClientes(next);
        if (myReq !== reqId.current) return;
        clientesStore.set(list);
        setClientes(list);
      } catch (err) {
        if (myReq !== reqId.current) return;
        setError(extractErrorMessage(err, 'Falha ao carregar clientes.'));
        setClientes(applyFilters(clientesStore.get(), next));
      } finally {
        if (myReq === reqId.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void refresh(filters);
  }, [refresh, filters]);

  const updateFilter = useCallback(
    <K extends keyof ClienteFilters>(key: K, val: ClienteFilters[K]) =>
      setFilters((p) => ({ ...p, [key]: val })),
    []
  );

  const salvarNovoCliente = useCallback(
    async (
      dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>,
      showToast: (m: string, t?: 'success' | 'warning' | 'error') => void
    ) => {
      if (!dados.nome || !dados.tel || !dados.email) {
        showToast('Preencha nome, telefone e e-mail.', 'warning');
        return;
      }
      try {
        const novo = await createCliente(dados);
        clientesStore.update((cur) => [novo, ...cur]);
        await refresh(filters);
        setModalOpen(false);
        showToast(`Cliente ${novo.nome.split(' ')[0]} cadastrado!`, 'success');
      } catch (err) {
        showToast(extractErrorMessage(err, 'Falha ao salvar cliente.'), 'error');
      }
    },
    [refresh, filters]
  );

  return {
    clientes,
    filters,
    updateFilter,
    modalOpen,
    setModalOpen,
    salvarNovoCliente,
    loading,
    error,
    refresh: () => refresh(filters),
  };
}
