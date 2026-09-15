/**
 * @file metas.screen.tsx
 * @module metas
 * @description Tela de Metas — acompanhamento de indicadores comerciais.
 * Dados reais de GET /api/metas, com paginação.
 *
 * Composição:
 * - Header com botão Nova Meta (ADMIN/GERENTE, espelhando a regra do backend)
 * - Grid uniforme de MetaCards: ícone do indicador, responsável, valores
 *   (realizado vs alvo), barra de progresso colorida por status — clicável
 *   só pra quem pode editar (ADMIN/GERENTE), abrindo o modal de edição
 * - Modal Nova Meta: tipo de indicador, responsável (colaborador real ou
 *   equipe/loja em texto livre), valor alvo e período
 * - Modal Editar Meta: atualiza alvo/responsável/período via PATCH
 *   /api/metas/:id. O "Realizado" só é editável pra indicadores sem fonte
 *   real no sistema (hoje, só NPS) — leads/receita/conversão/SLA/vendas são
 *   calculados ao vivo pelo backend a cada leitura (ver meta.service.ts),
 *   então editar esse campo manualmente seria sobrescrito na próxima vez que
 *   a tela recarregar.
 *
 * Responsável: pode ser um colaborador real (responsavelId setado — o
 * "Realizado" então é calculado só com os leads/financiamentos daquela
 * pessoa) ou uma equipe/loja inteira em texto livre (responsavelId null — o
 * "Realizado" reflete a concessionária inteira no período). Ver comentário
 * em meta.service.ts (computeAtual) pro detalhe de cada indicador.
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
 * - showToast → feedback de criação/edição de meta
 */

import React, { useState } from 'react';
import { useMetas } from './hooks/useMetas';
import { useApp } from '../../shared/context/AppContext';
import { PaginationBar } from '../../shared/components/PaginationBar/PaginationBar';
import type { ToastType } from '../../shared/hooks/useToast';
import type { Meta, MetaIndicador } from '../../types/global.types';
import type { UpdateMetaInput } from './services/metas.service';

interface Props { showToast:(m:string,t?:ToastType)=>void; }

/** Mesmo conjunto de meta.service.ts — indicadores com fonte real calculada ao vivo. */
const INDICADORES_COMPUTAVEIS = new Set(['leads', 'receita', 'conv', 'sla', 'vendas']);

/** Mesma linguagem visual dos ícones do Dashboard (.kpi-ic + cor por indicador). */
const INDICADOR_ICON: Record<MetaIndicador, { ic: string; ph: string }> = {
  vendas:  { ic: 'ic-blue',   ph: 'ph-car' },
  receita: { ic: 'ic-green',  ph: 'ph-currency-dollar' },
  leads:   { ic: 'ic-teal',   ph: 'ph-lightning' },
  nps:     { ic: 'ic-purple', ph: 'ph-star' },
  sla:     { ic: 'ic-navy',   ph: 'ph-clock' },
  conv:    { ic: 'ic-orange', ph: 'ph-trend-up' },
};

const LOJA_EQUIPE = '__loja_equipe__';

export const MetasScreen: React.FC<Props> = ({ showToast }) => {
  const { user } = useApp();
  const canGerenciar = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const {
    metas, pagination, page, setPage, loading, error, modalOpen, setModalOpen,
    editTarget, setEditTarget, salvarEdicao,
    getStatus, computePct, fmtVal, addMeta, colaboradores,
  } = useMetas(showToast);
  const [tipo, setTipo] = useState<MetaIndicador>('vendas');
  // '' = ainda não escolheu, LOJA_EQUIPE = equipe/loja (texto livre abaixo),
  // qualquer outro valor = id de um colaborador real.
  const [respSel, setRespSel] = useState<string>(LOJA_EQUIPE);
  const [respLivre, setRespLivre] = useState('');
  const [val, setVal] = useState('');
  const [per, setPer] = useState('');
  const [editForm, setEditForm] = useState<UpdateMetaInput>({});
  const [editRespSel, setEditRespSel] = useState<string>(LOJA_EQUIPE);
  const [editRespLivre, setEditRespLivre] = useState('');

  const abrirEdicao = (m: Meta) => {
    setEditForm({});
    setEditTarget(m);
    setEditRespSel(m.responsavelId ?? LOJA_EQUIPE);
    setEditRespLivre(m.responsavel);
  };

  const criarMeta = () => {
    const respId = respSel === LOJA_EQUIPE ? null : respSel;
    const nome = respId ? colaboradores.find(c => c.id === respId)?.nome ?? '' : respLivre;
    addMeta(tipo, nome, parseFloat(val), per, respId);
  };

  return (
    <section className="module active" id="mod-metas">
      <div className="mod-header">
        <div><h1>Metas</h1><p className="mod-sub">Acompanhamento de metas e performance</p></div>
        <div className="mod-actions">
          {canGerenciar && <button className="btn-prim" onClick={()=>setModalOpen(true)}><i className="ph-bold ph-plus"/> Nova Meta</button>}
        </div>
      </div>

      {loading && <p className="mod-sub">Carregando metas...</p>}
      {error && <p className="mod-sub" style={{color:'var(--red)'}}>{error}</p>}
      {!loading && !error && metas.length === 0 && <p className="mod-sub">Nenhuma meta cadastrada.</p>}

      <div id="metasContent">
        <div className="metas-row">
          {metas.map(m => {
            const pct = computePct(m);
            const st = getStatus(m);
            const clr = pct>=100?'var(--green)':pct>=85?'var(--ford-vivid)':pct>=60?'var(--orange)':'var(--red)';
            const icon = INDICADOR_ICON[m.indicador] ?? INDICADOR_ICON.vendas;
            return (
              <div key={m.id} className="meta-card"
                onClick={canGerenciar ? () => abrirEdicao(m) : undefined}
                style={canGerenciar ? { cursor: 'pointer' } : undefined}
              >
                <div className="meta-header">
                  <div className={`kpi-ic ${icon.ic}`}><i className={`ph-bold ${icon.ph}`} style={{fontSize:16}}/></div>
                  <div className="meta-header-body">
                    <div className="meta-title">{m.titulo}</div>
                    <div className="meta-resp"><i className={`ph-bold ${m.responsavelId ? 'ph-user' : 'ph-users-three'}`}/>{m.responsavel}</div>
                  </div>
                  <div className="meta-period">{m.periodo}</div>
                </div>
                <div className="meta-values">
                  <div><div style={{fontSize:10,color:'var(--c-dim)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:2}}>Realizado</div><div className="meta-atual">{fmtVal(m,m.atual)}</div></div>
                  <div className="meta-alvo">Meta<span>{fmtVal(m,m.alvo)}</span></div>
                </div>
                <div className="meta-bar-track"><div className={`meta-bar-fill ${st.cls}`} style={{width:`${pct}%`}}/></div>
                <div className="meta-footer">
                  <div className="meta-pct" style={{color:clr}}>{pct}%</div>
                  <div className={`meta-status-tag ${st.tag}`}>{st.label}</div>
                </div>
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
                <label>Responsável
                  <select value={respSel} onChange={e=>setRespSel(e.target.value)}>
                    <option value={LOJA_EQUIPE}>Equipe / Loja inteira</option>
                    {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </label>
                {respSel === LOJA_EQUIPE && (
                  <label>Nome da equipe<input type="text" placeholder="Ex: Equipe Comercial" value={respLivre} onChange={e=>setRespLivre(e.target.value)}/></label>
                )}
                <label>Valor da meta<input type="number" placeholder="Ex: 30" value={val} onChange={e=>setVal(e.target.value)}/></label>
                <label>Período<input type="month" value={per} onChange={e=>setPer(e.target.value)}/></label>
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                <button className="btn-sec" onClick={()=>setModalOpen(false)}>Cancelar</button>
                <button className="btn-prim" onClick={criarMeta}>Criar Meta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="modal-ov open" onClick={e=>{if(e.target===e.currentTarget)setEditTarget(null);}}>
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={()=>setEditTarget(null)}><i className="ph-bold ph-x"/></button>
            <div style={{padding:22}}>
              <h3 style={{fontSize:20,fontWeight:700,color:'var(--c-text)',marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--c-border)'}}>Editar Meta</h3>
              <div className="m-form">
                <label>Título<input type="text" defaultValue={editTarget.titulo} onChange={e=>setEditForm(p=>({...p,titulo:e.target.value}))}/></label>
                <label>Responsável
                  <select value={editRespSel} onChange={e=>setEditRespSel(e.target.value)}>
                    <option value={LOJA_EQUIPE}>Equipe / Loja inteira</option>
                    {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </label>
                {editRespSel === LOJA_EQUIPE && (
                  <label>Nome da equipe<input type="text" value={editRespLivre} onChange={e=>setEditRespLivre(e.target.value)}/></label>
                )}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,minWidth:0}}>
                  {INDICADORES_COMPUTAVEIS.has(editTarget.indicador)
                    ? <label style={{minWidth:0}}>Realizado ({editTarget.unidade})
                        <div title="Calculado automaticamente a partir dos dados reais do período — não é editável."
                          style={{height:34,padding:'0 10px',border:'1px solid var(--c-border)',borderRadius:'var(--rsm)',fontSize:'var(--fs1)',background:'var(--c-bg)',color:'var(--c-dim)',display:'flex',alignItems:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}
                        >{fmtVal(editTarget,editTarget.atual)}</div>
                      </label>
                    : <label style={{minWidth:0}}>Realizado ({editTarget.unidade})<input type="number" defaultValue={editTarget.atual} onChange={e=>setEditForm(p=>({...p,atual:Number(e.target.value)}))}/></label>
                  }
                  <label style={{minWidth:0}}>Meta ({editTarget.unidade})<input type="number" defaultValue={editTarget.alvo} onChange={e=>setEditForm(p=>({...p,alvo:Number(e.target.value)}))}/></label>
                </div>
                {INDICADORES_COMPUTAVEIS.has(editTarget.indicador) && (
                  <p style={{fontSize:'var(--fs0)',color:'var(--c-dim)',marginTop:-6,lineHeight:1.4}}>
                    "Realizado" é calculado automaticamente a partir dos dados reais do período informado.
                  </p>
                )}
                <label style={{minWidth:0}}>Período<input type="text" defaultValue={editTarget.periodo} onChange={e=>setEditForm(p=>({...p,periodo:e.target.value}))}/></label>
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                <button className="btn-sec" onClick={()=>setEditTarget(null)}>Cancelar</button>
                <button className="btn-prim" onClick={()=>{
                  const respId = editRespSel === LOJA_EQUIPE ? null : editRespSel;
                  const nome = respId ? colaboradores.find(c => c.id === respId)?.nome ?? '' : editRespLivre;
                  salvarEdicao({ ...editForm, responsavel: nome, responsavelId: respId });
                }}><i className="ph-bold ph-floppy-disk"/> Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
