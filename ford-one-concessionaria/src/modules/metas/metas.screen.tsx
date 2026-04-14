/**
 * @file metas.screen.tsx
 * @module metas
 * @description Tela de Metas — acompanhamento de indicadores e ranking de consultores.
 *
 * Composição:
 * - Header com botão Nova Meta
 * - Grid de MetaCards: cada card exibe indicador, valores (realizado vs alvo),
 *   barra de progresso colorida por status e responsável
 * - Ranking de Consultores: 4 posições com medalha (ouro/prata/bronze),
 *   vendas, receita e barra de performance
 * - Modal Nova Meta: tipo de indicador, responsável, valor alvo e período
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
import type { ToastType } from '../../shared/hooks/useToast';
import type { MetaIndicador } from '../../types/global.types';

interface Props { showToast:(m:string,t?:ToastType)=>void; }
const RANKING = [{nome:'Ricardo Costa',ini:'RC',pct:94,vendas:8,rec:'R$ 412k'},{nome:'Patrícia Oliveira',ini:'PO',pct:78,vendas:6,rec:'R$ 287k'},{nome:'Lucas Mendes',ini:'LM',pct:71,vendas:5,rec:'R$ 241k'},{nome:'Amanda Rocha',ini:'AR',pct:43,vendas:3,rec:'R$ 128k'}];
const RANK_CLS = ['gold','silver','bronze',''];

export const MetasScreen: React.FC<Props> = ({ showToast }) => {
  const { metas, modalOpen, setModalOpen, getStatus, fmtVal, addMeta } = useMetas(showToast);
  const [tipo, setTipo] = useState<MetaIndicador>('vendas');
  const [resp, setResp] = useState('');
  const [val, setVal] = useState('');
  const [per, setPer] = useState('');

  return (
    <section className="module active" id="mod-metas">
      <div className="mod-header">
        <div><h1>Metas</h1><p className="mod-sub">Acompanhamento de metas e performance</p></div>
        <div className="mod-actions">
          <button className="btn-prim" onClick={()=>setModalOpen(true)}><i className="ph-bold ph-plus"/> Nova Meta</button>
        </div>
      </div>

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

        <div className="metas-ranking" style={{marginTop:20}}>
          <div className="metas-ranking-head"><i className="ph-bold ph-medal"/> Ranking de Consultores — Abril/2026</div>
          {RANKING.map((r,i)=>(
            <div key={r.nome} className="rank-row">
              <div className={`rank-pos ${RANK_CLS[i]}`}>{i+1}</div>
              <div className="cli-av" style={{flexShrink:0}}>{r.ini}</div>
              <div style={{flex:1,minWidth:0}}><div className="rank-name">{r.nome}</div><div className="rank-sub">{r.vendas} vendas · {r.rec}</div></div>
              <div className="rank-bar-wrap"><div className="rank-bar-track"><div className="rank-bar-fill" style={{width:`${r.pct}%`}}/></div><div className="rank-pct">{r.pct}%</div></div>
            </div>
          ))}
        </div>
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