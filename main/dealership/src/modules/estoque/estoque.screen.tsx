/**
 * @file estoque.screen.tsx
 * @module estoque
 * @description Tela de gestão do estoque de veículos.
 *
 * Composição:
 * - Header com contador de resultados e botões de ação
 * - Barra de filtros: busca textual, condição (novo/seminovo) e segmento
 * - Grid de cards (EstoqueCard) com todos os veículos filtrados
 * - EstoqueModal: detalhes + precificação do veículo selecionado
 *
 * O subtítulo do header atualiza dinamicamente com a contagem de veículos filtrados.
 * Escuta CustomEvent 'ford:openEstoque' para abrir modal via busca global.
 *
 * Props:
 * - showToast           → feedback de ações (reserva, importação)
 * - onFinSimFromEstoque → abre simulador de financiamento com veículo pré-preenchido
 */

import React, { useState } from 'react';
import { useEstoque } from './hooks/useEstoque';
import { EstoqueCard } from './components/EstoqueCard/EstoqueCard';
import { EstoqueModal } from './components/EstoqueModal/EstoqueModal';
import { EditEstoqueModal } from './components/EditEstoqueModal/EditEstoqueModal';
import { ConfirmModal } from '../../shared/components/Modal/ConfirmModal';
import { PaginationBar } from '../../shared/components/PaginationBar/PaginationBar';
import type { ToastType } from '../../shared/hooks/useToast';
import { useApp } from '../../shared/context/AppContext';
import { AddEstoqueModal } from './components/AddEstoqueModal/AddEstoqueModal';

interface Props { showToast:(m:string,t?:ToastType)=>void; onFinSimFromEstoque:(id:string)=>void; }

export const EstoqueScreen: React.FC<Props> = ({ showToast, onFinSimFromEstoque }) => {
  const {
    estoque, filters, updateFilter, modalId, setModalId, modalItem, reload,
    setPage, pagination, loading, error,
    editingEstoque, setEditingEstoque, salvarEdicaoEstoque,
    deleteTarget, setDeleteTarget, confirmarExclusaoEstoque,
  } = useEstoque();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { navigate, user } = useApp();
  const canAddEstoque = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const canEditEstoque = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const canDeleteEstoque = user?.role === 'ADMIN';

  const subtitle = pagination ? `${pagination.total} veículo${pagination.total === 1 ? '' : 's'} encontrado${pagination.total === 1 ? '' : 's'}` : 'Carregando...';

  return (
    <section className="module active" id="mod-estoque">
      <div className="mod-header">
        <div><h1>Estoque</h1><p className="mod-sub" id="estoqueSubtitle">{subtitle}</p></div>
        <div className="mod-actions">
          <button className="btn-sec" onClick={()=>showToast('Importando planilha...','info')}>
            <i className="ph-bold ph-arrow-square-in"/> Importar planilha
          </button>
          <button
            className="btn-prim"
            onClick={()=>setAddModalOpen(true)}
            disabled={!canAddEstoque}
            title={canAddEstoque ? undefined : 'Apenas ADMIN ou GERENTE podem adicionar veículos ao estoque.'}
          >
            <i className="ph-bold ph-plus"/> Adicionar veículo
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="srch-field">
          <i className="ph-bold ph-magnifying-glass"/>
          <input type="text" placeholder="Buscar modelo ou versão..." id="estSearch"
            value={filters.query} onChange={e=>updateFilter('query',e.target.value)}/>
        </div>
        <select id="estCond" value={filters.cond} onChange={e=>updateFilter('cond',e.target.value)}>
          <option value="">Todas as condições</option>
          <option value="novo">Novo</option>
          <option value="seminovo">Seminovo</option>
        </select>
        <select id="estSeg" value={filters.seg} onChange={e=>updateFilter('seg',e.target.value)}>
          <option value="">Todos os segmentos</option>
          <option value="suv">SUV</option>
          <option value="picape">Picape</option>
          <option value="sedan">Sedan</option>
        </select>
        <button className="btn-sec" onClick={()=>{ navigate('relatorios'); }}>
          <i className="ph-bold ph-arrow-square-out"/> Exportar
        </button>
      </div>

      {error && <p className="mod-sub" style={{ color: 'var(--red)' }}>{error}</p>}
      {loading ? (
        <p className="mod-sub">Carregando estoque...</p>
      ) : estoque.length === 0 ? (
        <p className="mod-sub">Nenhum veículo encontrado{filters.query || filters.cond || filters.seg ? ' para esse filtro.' : '.'}</p>
      ) : (
        <div className="estoque-grid" id="estoqueGrid">
          {estoque.map(e=><EstoqueCard key={e.id} item={e} onClick={()=>setModalId(e.id)}/>)}
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

      <EstoqueModal
        isOpen={!!modalId}
        onClose={()=>setModalId(null)}
        item={modalItem}
        showToast={showToast}
        onFinSim={onFinSimFromEstoque}
        onEditar={item => { setModalId(null); setEditingEstoque(item); }}
        onExcluir={item => { setModalId(null); setDeleteTarget(item); }}
        canEdit={canEditEstoque}
        canDelete={canDeleteEstoque}
      />
      <AddEstoqueModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={reload}
        showToast={showToast}
      />
      <EditEstoqueModal
        isOpen={!!editingEstoque}
        item={editingEstoque}
        onClose={() => setEditingEstoque(null)}
        onSave={dados => salvarEdicaoEstoque(dados, showToast)}
      />
      <ConfirmModal
        id="estoqueDeleteModal"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => confirmarExclusaoEstoque(showToast)}
        title={`Excluir ${deleteTarget?.modelo ?? 'item'}`}
        message="Esta ação não pode ser desfeita. A unidade será removida permanentemente do estoque."
        confirmLabel="Excluir"
      />
    </section>
  );
};
