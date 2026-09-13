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
import { ConfirmModal } from '../../shared/components/Modal/ConfirmModal';
import { PaginationBar } from '../../shared/components/PaginationBar/PaginationBar';
import { useApp } from '../../shared/context/AppContext';
import type { ToastType } from '../../shared/hooks/useToast';
import type { Cliente } from '../../types/global.types';

interface Props { showToast: (m: string, t?: ToastType) => void; }

export const ClientesScreen: React.FC<Props> = ({ showToast }) => {
  const {
    clientes, filters, updateFilter, modalOpen, setModalOpen, salvarNovoCliente, error, loading,
    setPage, pagination,
    editingCliente, setEditingCliente, salvarEdicaoCliente,
    deleteTarget, setDeleteTarget, confirmarExclusaoCliente,
  } = useClientes();
  const { navigate, logAccess, user } = useApp();
  const canDelete = user?.role === 'ADMIN' || user?.role === 'GERENTE';

  const goHistorico = (cliente: Cliente) => {
    logAccess({ id: cliente.id, nome: cliente.nome, ini: cliente.ini });
    navigate('historico');
    setTimeout(() => window.dispatchEvent(new CustomEvent('ford:selectCliente', { detail: cliente.id })), 120);
  };

  return (
    <section className="module active" id="mod-clientes">
      <div className="mod-header">
        <div><h1>Clientes</h1><p className="mod-sub">{pagination ? `${pagination.total} cliente${pagination.total === 1 ? '' : 's'} na base` : 'Gestão completa da base de clientes'}</p></div>
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
      {error && <p className="mod-sub" style={{ color: 'var(--red)' }}>{error}</p>}
      {loading ? (
        <p className="mod-sub">Carregando clientes...</p>
      ) : clientes.length === 0 ? (
        <p className="mod-sub">Nenhum cliente encontrado{filters.query || filters.status ? ' para esse filtro.' : '.'}</p>
      ) : (
        <div className="tbl-wrap">
          <table className="data-tbl">
            <thead>
              <tr>
                <th>Cliente</th><th>Telefone</th><th>E-mail</th>
                <th>Último Atendimento</th><th>Status</th><th>Veículos</th><th>LTV</th><th />
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <ClienteRow
                  key={c.id}
                  cliente={c}
                  onAcessar={goHistorico}
                  onEditar={setEditingCliente}
                  onExcluir={setDeleteTarget}
                  canDelete={canDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && (
        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          hasPrev={pagination.hasPrev}
          hasNext={pagination.hasNext}
          onChange={setPage}
        />
      )}
      <NovoClienteModal
        isOpen={modalOpen || !!editingCliente}
        cliente={editingCliente}
        onClose={() => { setModalOpen(false); setEditingCliente(null); }}
        onSave={d => editingCliente ? salvarEdicaoCliente(d, showToast) : salvarNovoCliente(d, showToast)}
      />
      <ConfirmModal
        id="clienteDeleteModal"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => confirmarExclusaoCliente(showToast)}
        title={`Excluir ${deleteTarget?.nome ?? 'cliente'}`}
        message="Esta ação não pode ser desfeita. O cliente será removido permanentemente."
        confirmLabel="Excluir"
      />
    </section>
  );
};
