/**
 * @file useClientes.ts
 * @module clientes
 * @description Hook de estado e lógica da tela de Clientes.
 *
 * Gerencia:
 * - filters: estado dos filtros (query, status, order) com valor padrão
 * - clientes: lista filtrada/ordenada (memo recalculado ao mudar filters)
 * - updateFilter: atualiza um campo do filtro sem resetar os demais
 * - modalOpen/setModalOpen: visibilidade do modal "Novo Cliente"
 * - salvarNovoCliente: valida campos, chama addCliente() do service,
 *   fecha modal e dispara toast de sucesso ou aviso
 *
 * A tela clientes.screen.tsx não precisa saber como os dados são filtrados
 * ou como o cliente é criado — apenas consome este hook.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Cliente } from '../../../types/global.types';
import { filterClientes, fetchClientes, createCliente, type ClienteFilters } from '../services/clientes.service';

const DEFAULT: ClienteFilters = { query: '', status: '', order: 'nome' };

export function useClientes() {
  const [filters, setFilters] = useState<ClienteFilters>(DEFAULT);
  const [modalOpen, setModalOpen] = useState(false);
  const [source, setSource] = useState<Cliente[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { fetchClientes().then(setSource).catch(e => setError(e.message)); }, []);

  const clientes = useMemo(() => filterClientes(filters, source), [filters, source]);

  const updateFilter = useCallback(
    <K extends keyof ClienteFilters>(key: K, val: ClienteFilters[K]) =>
      setFilters(p => ({ ...p, [key]: val })),
    []
  );

  const salvarNovoCliente = useCallback(
    (dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>,
     showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!dados.nome || !dados.tel || !dados.email) {
        showToast('Preencha nome, telefone e e-mail.', 'warning'); return;
      }
      createCliente(dados).then(novo => {
        setSource(prev => [...prev, novo]);
        setModalOpen(false);
        showToast(`Cliente ${novo.nome.split(' ')[0]} cadastrado!`, 'success');
      }).catch(e => showToast(e.message || 'Erro ao cadastrar cliente.', 'warning'));
    },
    []
  );

  return { clientes, filters, updateFilter, modalOpen, setModalOpen, salvarNovoCliente, error };
}
