/**
 * @file metas.screen.tsx
 * @module metas
 * @description Tela de Metas — acompanhamento de indicadores comerciais.
 * Dados reais de GET /api/metas, com paginação.
 *
 * Composição:
 * - Header com botão Nova Meta (ADMIN/GERENTE, espelhando a regra do backend)
 * - Grid de MetaCards: cada card exibe indicador, valores (realizado vs alvo),
 *   barra de progresso colorida por status e responsável
 * - Modal Nova Meta: tipo de indicador, responsável, valor alvo e período
 *
 * O antigo "Ranking de Consultores" foi removido — era uma lista de 4 nomes
 * fixos sem nenhuma fonte real (não existe atribuição de venda por consultor
 * no schema atual).
 *
 * Status visual:
 * - exceeded (≥100%)  → verde
 * - on-track (≥85%)   → azul Ford
 * - at-risk (≥60%)    → laranja
 * - behind (<60%)     → vermelho
 *
 * Props:
 * - showToast → feedback de criação de meta
 */

import React, { useState } from 'react';
import { useMetas } from './hooks/useMetas';
import { useApp } from '../../shared/context/AppContext';
import { PaginationBar } from '../../shared/components/PaginationBar/PaginationBar';
import type { ToastType } from '../../shared/hooks/useToast';
import type { MetaIndicador } from '../../types/global.types';

interface Props { showToast:(m:string,t?:ToastType)=>void; }

export const MetasScreen: React.FC<Props> = ({ showToast }) => {
  const { user } = useApp();
  const canCriar = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const { metas, pagination, page, setPage, loading, error, modalOpen, setModalOpen, getStatus, fmtVal, addMeta } = useMetas(showToast);
  const [tipo, setTipo] = useState<MetaIndicador>('vendas');
  const [resp, setResp] = useState('');
  const [val, setVal] = useState('');
  const [per, setPer] = useState('');

  return (
    <section className="module active" id="mod-metas">
      <div className="mod-header">
        <div><h1>Metas</h1><p className="mod-sub">Acompanhamento de metas e performance</p></div>
        <div className="mod-actions">
          {canCriar && <button className="btn-prim" onClick={()=>setModalOpen(true)}><i className="ph-bold ph-plus"/> Nova Meta</button>}
        </div>
      </div>

      {loading && <p className="mod-sub">Carregando metas...</p>}
      {error && <p className="mod-sub" style={{color:'var(--red)'}}>{error}</p>}
      {!loading && !error && metas.length === 0 && <p className="mod-sub">Nenhuma meta cadastrada.</p>}

      <div id="metasContent">
        <div className="metas-row">
          {metas.map(m => {
            const pct = Math.min(Math.round(m.lowerIsBetter?(m.alvo/m.atual*100):(m.atual/m.alvo*100)),100);
            const st = getStatus(m);
            const clr = pct>=100?'var(--green)':pct>=85?'var(--ford-vivid)':pct>=60?'var(--orange)':'var(--red)';
            return (
              <div key={m.id} className="meta-card">
                <div className="meta-header"><div className="meta-title">{m.titulo}</div><div className="meta-period">{m.periodo}</div></div>
                <div className="meta-values">
                  <div><div style={{fontSize:10,color:'var(--c-dim)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:2}}>Realizado</div><div className="meta-atual">{fmtVal(m,m.atual)}</div></div>
                  <div className="meta-alvo">Meta<span>{fmtVal(m,m.alvo)}</span></div>
                </div>
                <div className="meta-bar-wrap"><div className="meta-bar-track"><div className={`meta-bar-fill ${st.cls}`} style={{width:`${pct}%`}}/></div></div>
                <div className="meta-footer">
                  <div className="meta-pct" style={{color:clr}}>{pct}%</div>
                  <div className={`meta-status-tag ${st.tag}`}>{st.label}</div>
                </div>
                <div style={{fontSize:10,color:'var(--c-dim)',marginTop:8,display:'flex',alignItems:'center',gap:4}}><i className="ph-bold ph-user" style={{fontSize:11}}/>{m.responsavel}</div>
              </div>
            );
          })}
        </div>

        {pagination && (
          <PaginationBar page={page} totalPages={pagination.totalPages} total={pagination.total}
            hasPrev={pagination.hasPrev} hasNext={pagination.hasNext} onChange={setPage} />
        )}
      </div>

      {modalOpen && (
        <div className="modal-ov open" onClick={e=>{if(e.target===e.currentTarget)setModalOpen(false);}}>
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={()=>setModalOpen(false)}><i className="ph-bold ph-x"/></button>
            <div style={{padding:22}}>
              <h3 style={{fontSize:20,fontWeight:700,color:'var(--c-text)',marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--c-border)'}}>Nova Meta</h3>
              <div className="m-form">
                <label>Indicador<select value={tipo} onChange={e=>setTipo(e.target.value as MetaIndicador)}>
                  <option value="vendas">Vendas (unidades)</option><option value="receita">Receita (R$)</option>
                  <option value="leads">Leads qualificados</option><option value="nps">NPS</option>
                  <option value="sla">SLA médio (h)</option><option value="conv">Conversão (%)</option>
                </select></label>
                <label>Consultor / Equipe<input type="text" placeholder="Ex: Ricardo Costa" value={resp} onChange={e=>setResp(e.target.value)}/></label>
                <label>Valor da meta<input type="number" placeholder="Ex: 30" value={val} onChange={e=>setVal(e.target.value)}/></label>
                <label>Período<input type="month" value={per} onChange={e=>setPer(e.target.value)}/></label>
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                <button className="btn-sec" onClick={()=>setModalOpen(false)}>Cancelar</button>
                <button className="btn-prim" onClick={()=>addMeta(tipo,resp,parseFloat(val),per)}>Criar Meta</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
