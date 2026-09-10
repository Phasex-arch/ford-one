/**
 * @file clientes.screen.tsx
 * @module clientes
 * @description Tela de gestão da base de clientes.
 *
 * Composição:
 * - Header com contagem e botões Exportar / Novo Cliente
 * - ClienteFiltersBar: filtros de busca, status e ordenação
 * - Tabela data-tbl com ClienteRow para cada cliente filtrado
 * - NovoClienteModal: cadastro de cliente
 *
 * Navegação: ao clicar em um cliente, logAccess() registra o acesso
 * e navigate('historico') + CustomEvent abre o histórico do cliente.
 *
 * Esta tela não contém lógica — toda lógica está em useClientes.ts.
 */

import React from 'react';
import { useClientes } from './hooks/useClientes';
import { ClienteRow } from './components/ClienteRow/ClienteRow';
import { ClienteFiltersBar } from './components/ClienteFilters/ClienteFilters';
import { NovoClienteModal } from './components/NovoClienteModal/NovoClienteModal';
import { useApp } from '../../shared/context/AppContext';
import type { Cliente } from '../../types/global.types';
import type { ToastType } from '../../shared/hooks/useToast';

interface Props { showToast: (m: string, t?: ToastType) => void; }

export const ClientesScreen: React.FC<Props> = ({ showToast }) => {
  const { clientes, filters, updateFilter, modalOpen, setModalOpen, salvarNovoCliente, loading, error } = useClientes();
  const { navigate, logAccess } = useApp();

  const goHistorico = (cliente: Cliente) => {
    logAccess(cliente);
    navigate('historico');
    setTimeout(() => window.dispatchEvent(new CustomEvent('ford:selectCliente', { detail: cliente.id })), 120);
  };

  return (
    <section className="module active" id="mod-clientes">
      <div className="mod-header">
        <div><h1>Clientes</h1><p className="mod-sub">Gestão completa da base de clientes</p></div>
        <div className="mod-actions">
          <button className="btn-sec" onClick={() => navigate('relatorios')}>
            <i className="ph-bold ph-arrow-square-out" /> Exportar
          </button>
          <button className="btn-prim" onClick={() => setModalOpen(true)}>
            <i className="ph-bold ph-plus" /> Novo Cliente
          </button>
        </div>
      </div>
      <ClienteFiltersBar filters={filters} onChange={updateFilter} />
      {error && <p className="mod-sub" role="alert">{error}</p>}
      <div className="tbl-wrap">
        <table className="data-tbl">
          <thead>
            <tr>
              <th>Cliente</th><th>Telefone</th><th>E-mail</th>
              <th>Último Atendimento</th><th>Status</th><th>Veículos</th><th>LTV</th><th />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="mod-sub">Carregando clientes...</td></tr>}
            {!loading && !error && clientes.length === 0 &&
              <tr><td colSpan={8} className="mod-sub">Nenhum cliente encontrado.</td></tr>}
            {clientes.map(c => <ClienteRow key={c.id} cliente={c} onAcessar={goHistorico} />)}
          </tbody>
        </table>
      </div>
      <NovoClienteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={d => salvarNovoCliente(d, showToast)}
      />
    </section>
  );
};
