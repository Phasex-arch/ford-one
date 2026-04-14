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

import React, { useState, useEffect } from 'react';
import { useEstoque } from './hooks/useEstoque';
import { EstoqueCard } from './components/EstoqueCard/EstoqueCard';
import { EstoqueModal } from './components/EstoqueModal/EstoqueModal';
import { getEstoque } from './services/estoque.service';
import type { ToastType } from '../../shared/hooks/useToast';
import { useApp } from '../../shared/context/AppContext';

interface Props { showToast:(m:string,t?:ToastType)=>void; onFinSimFromEstoque:(id:string)=>void; }

export const EstoqueScreen: React.FC<Props> = ({ showToast, onFinSimFromEstoque }) => {
  const { estoque, filters, updateFilter, modalId, setModalId } = useEstoque();
  const { navigate } = useApp();

  useEffect(() => {
    const h = (e: Event) => setModalId((e as CustomEvent<string>).detail);
    window.addEventListener('ford:openEstoque', h);
    return () => window.removeEventListener('ford:openEstoque', h);
  }, [setModalId]);

  const subtitle = `${estoque.length} veículos encontrados`;

  return (
    <section className="module active" id="mod-estoque">
      <div className="mod-header">
        <div><h1>Estoque</h1><p className="mod-sub" id="estoqueSubtitle">{subtitle}</p></div>
        <div className="mod-actions">
          <button className="btn-sec" onClick={()=>showToast('Importando planilha...','info')}>
            <i className="ph-bold ph-arrow-square-in"/> Importar planilha
          </button>
          <button className="btn-prim" onClick={()=>showToast('Funcionalidade em breve','info')}>
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

      <div className="estoque-grid" id="estoqueGrid">
        {estoque.map(e=><EstoqueCard key={e.id} item={e} onClick={()=>setModalId(e.id)}/>)}
      </div>

      <EstoqueModal
        isOpen={!!modalId}
        onClose={()=>setModalId(null)}
        item={modalId ? getEstoque(modalId) : undefined}
        showToast={showToast}
        onFinSim={onFinSimFromEstoque}
      />
    </section>
  );
};
