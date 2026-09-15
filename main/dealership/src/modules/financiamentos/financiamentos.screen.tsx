/**
 * @file financiamentos.screen.tsx
 * @module financiamentos
 * @description Tela de Financiamentos — carteira de contratos e simulador.
 *
 * Composição:
 * - Header com botão Nova Simulação
 * - KPI Grid: Carteira Total, Contratos Ativos, Em Análise, Taxa Média
 * - Três seções, espelhando o processo real de financiamento de veículo:
 *   "Simulações em Andamento" (Pendente/Em Análise, com Aprovar/Reprovar pra
 *   ADMIN/GERENTE), "Contratos Ativos" (Aprovado — a carteira de verdade) e
 *   "Reprovados" (histórico, recolhido por padrão).
 * - Modal Simulação: formulário completo com cálculo automático em tempo real
 *   (exibe parcela, financiado, total pago e total em juros)
 * - Modal Contrato: todos os detalhes do contrato selecionado, com Excluir
 *   pra ADMIN
 *
 * Status visual dos contratos:
 * aprovado → verde | analise → laranja | pendente → azul Ford | reprovado → vermelho
 *
 * Props:
 * - showToast → feedback de simulação salva, decisão e exclusão
 */

import React, { useState } from 'react';
import { useFinanciamentos } from './hooks/useFinanciamentos';
import { formatCurrency } from '../../shared/utils/formatters';
import { useApp } from '../../shared/context/AppContext';
import { PaginationBar } from '../../shared/components/PaginationBar/PaginationBar';
import { ConfirmModal } from '../../shared/components/Modal/ConfirmModal';
import type { ToastType } from '../../shared/hooks/useToast';
import type { Financiamento, FinanciamentoStatus } from '../../types/global.types';

interface Props { showToast:(m:string,t?:ToastType)=>void; }

const STATUS_MAP: Record<FinanciamentoStatus,{bg:string;c:string;lbl:string}> = {
  aprovado:{bg:'var(--green-bg)',  c:'var(--green)',      lbl:'Aprovado'   },
  analise: {bg:'var(--orange-bg)', c:'var(--gold)',       lbl:'Em Análise' },
  pendente:{bg:'var(--ford-light)',c:'var(--ford-vivid)', lbl:'Pendente'   },
  reprovado:{bg:'var(--red-bg)',   c:'var(--red)',        lbl:'Reprovado'  },
};

export const FinanciamentosScreen: React.FC<Props> = ({ showToast }) => {
  const { user } = useApp();
  const canSimular = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  // Mesma regra do backend pro PATCH de status — só quem pode simular pode decidir.
  const canDecidir = canSimular;
  const { financiamentos, pagination, page, setPage, loading, error,
          simOpen, setSimOpen, contratoId, setContratoId, contrato,
          simVei, setSimVei, simCli, setSimCli, simValor, setSimValor, simEntrada, setSimEntrada,
          simPrazo, setSimPrazo, simTaxa, setSimTaxa, calcParcela, saveFinSim,
          deleteTarget, setDeleteTarget, confirmarExclusao, decidir,
          emAndamento, contratosAtivos, reprovados } = useFinanciamentos(showToast);
  const canExcluir = user?.role === 'ADMIN';
  const [showReprovados, setShowReprovados] = useState(false);

  const totalCarteira = contratosAtivos.reduce((s,f)=>s+f.valor,0);
  const parcela = calcParcela();
  const financiado = simValor-simEntrada;
  const totalPago = simEntrada+(parcela*simPrazo);

  const FinCard = ({ f }: { f: Financiamento }) => {
    const st = STATUS_MAP[f.status] || STATUS_MAP.pendente;
    const emDecisao = f.status === 'pendente' || f.status === 'analise';
    return (
      <div className="fin-card">
        <div className="fin-card-head">
          <div><div className="fin-client">{f.cli}</div><div className="fin-veiculo">{f.veiculo}</div></div>
          <div className={`fin-status-tag ${f.status}`} style={{background:st.bg,color:st.c}}>{st.lbl}</div>
        </div>
        <div className="fin-values">
          <div><div className="fin-val-lbl">Valor</div><div className="fin-val-num highlight">{formatCurrency(f.valor)}</div></div>
          <div><div className="fin-val-lbl">Entrada</div><div className="fin-val-num">{formatCurrency(f.entrada)}</div></div>
          <div><div className="fin-val-lbl">Parcela / Prazo</div><div className="fin-val-num">{formatCurrency(f.parcela)}<span style={{fontSize:10,fontWeight:500,color:'var(--c-dim)',marginLeft:3}}>{f.prazo}x</span></div></div>
        </div>
        <div className="fin-footer">
          <span>Taxa: {f.taxa}% a.m. · {f.data}</span>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {emDecisao && canDecidir && (
              <>
                <button className="icon-btn" title="Aprovar" style={{color:'var(--green)'}} onClick={()=>decidir(f.id,'aprovado',f.cli)}>
                  <i className="ph-bold ph-check"/>
                </button>
                <button className="icon-btn" title="Reprovar" style={{color:'var(--red)'}} onClick={()=>decidir(f.id,'reprovado',f.cli)}>
                  <i className="ph-bold ph-x"/>
                </button>
              </>
            )}
            <button className="btn-tbl" onClick={()=>setContratoId(f.id)}>Ver contrato</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="module active" id="mod-financiamentos">
      <div className="mod-header">
        <div><h1>Financiamentos</h1><p className="mod-sub">Simulações e contratos ativos</p></div>
        <div className="mod-actions">
          {canSimular && <button className="btn-prim" onClick={()=>setSimOpen(true)}><i className="ph-bold ph-plus"/> Nova Simulação</button>}
        </div>
      </div>

      {loading && <p className="mod-sub">Carregando financiamentos...</p>}
      {error && <p className="mod-sub" style={{color:'var(--red)'}}>{error}</p>}

      <div id="finContent">
        <div className="kpi-grid" style={{marginBottom:18}}>
          {[
            {lbl:'Carteira Total (página)',val:formatCurrency(totalCarteira),ic:'ic-green',ph:'ph-money'},
            {lbl:'Contratos Ativos (página)',val:String(contratosAtivos.length),ic:'ic-blue',ph:'ph-file-text'},
            {lbl:'Em Análise (página)',val:String(emAndamento.length),ic:'ic-orange',ph:'ph-clock'},
          ].map(k=>(
            <div key={k.lbl} className="kpi-card">
              <div className={`kpi-ic ${k.ic}`}><i className={`ph-bold ${k.ph}`} style={{fontSize:17}}/></div>
              <div className="kpi-body"><span className="kpi-lbl">{k.lbl}</span><span className="kpi-val sm">{k.val}</span></div>
            </div>
          ))}
        </div>

        <h3 className="sec-title">Simulações em Andamento</h3>
        {emAndamento.length === 0 ? (
          <p className="mod-sub" style={{marginBottom:20}}>Nenhuma simulação aguardando decisão nesta página.</p>
        ) : (
          <div className="fin-grid" style={{marginBottom:28}}>
            {emAndamento.map(f => <FinCard key={f.id} f={f} />)}
          </div>
        )}

        <h3 className="sec-title">Contratos Ativos</h3>
        {contratosAtivos.length === 0 ? (
          <p className="mod-sub" style={{marginBottom:20}}>Nenhum contrato aprovado nesta página.</p>
        ) : (
          <div className="fin-grid" style={{marginBottom:28}}>
            {contratosAtivos.map(f => <FinCard key={f.id} f={f} />)}
          </div>
        )}

        {reprovados.length > 0 && (
          <>
            <button
              className="btn-sec"
              style={{marginBottom:12}}
              onClick={()=>setShowReprovados(v=>!v)}
            >
              <i className={`ph-bold ${showReprovados ? 'ph-caret-up' : 'ph-caret-down'}`}/> Reprovados ({reprovados.length})
            </button>
            {showReprovados && (
              <div className="fin-grid" style={{marginBottom:20}}>
                {reprovados.map(f => <FinCard key={f.id} f={f} />)}
              </div>
            )}
          </>
        )}

        {pagination && (
          <PaginationBar page={page} totalPages={pagination.totalPages} total={pagination.total}
            hasPrev={pagination.hasPrev} hasNext={pagination.hasNext} onChange={setPage} />
        )}
      </div>

      {/* Simulação Modal */}
      {simOpen && (
        <div className="modal-ov open" onClick={e=>{if(e.target===e.currentTarget)setSimOpen(false);}}>
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={()=>setSimOpen(false)}><i className="ph-bold ph-x"/></button>
            <div style={{padding:22}}>
              <h3 style={{fontSize:20,fontWeight:700,color:'var(--c-text)',marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--c-border)'}}>Simulação de Financiamento</h3>
              <div className="m-form">
                <label>Cliente<input type="text" value={simCli} onChange={e=>setSimCli(e.target.value)} placeholder="Nome do cliente"/></label>
                <label>Veículo<input type="text" value={simVei} onChange={e=>setSimVei(e.target.value)} placeholder="Modelo e versão"/></label>
                <label>Valor (R$)<input type="number" value={simValor} onChange={e=>setSimValor(+e.target.value)}/></label>
                <label>Entrada (R$)<input type="number" value={simEntrada} onChange={e=>setSimEntrada(+e.target.value)}/></label>
                <label>Prazo<select value={simPrazo} onChange={e=>setSimPrazo(+e.target.value)}>
                  {[24,36,48,60,72].map(p=><option key={p} value={p}>{p}x</option>)}
                </select></label>
                <label>Taxa mensal (%)<input type="number" step="0.01" value={simTaxa} onChange={e=>setSimTaxa(+e.target.value)}/></label>
              </div>
              {simValor > simEntrada && (
                <div className="fin-result" style={{marginTop:16,padding:14,background:'var(--ford-light)',borderRadius:'var(--r)',borderLeft:'4px solid var(--ford-vivid)'}}>
                  <strong>{formatCurrency(parcela)}/mês</strong>
                  {[['Valor financiado',formatCurrency(financiado)],['Total de parcelas',`${simPrazo}x de ${formatCurrency(parcela)}`],['Total pago',formatCurrency(totalPago)],['Total em juros',formatCurrency(totalPago-simValor)]].map(([l,v])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:'var(--fs1)',marginTop:6}}>
                      <span style={{color:'var(--c-mid)'}}>{l}</span><strong>{v}</strong>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                <button className="btn-sec" onClick={()=>setSimOpen(false)}>Cancelar</button>
                <button className="btn-prim" onClick={()=>saveFinSim(user?.id)}>Salvar Simulação</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contrato Modal */}
      {contrato && (
        <div className="modal-ov open" onClick={e=>{if(e.target===e.currentTarget)setContratoId(null);}}>
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={()=>setContratoId(null)}><i className="ph-bold ph-x"/></button>
            <div style={{padding:22}}>
              <h3 style={{fontSize:20,fontWeight:700,color:'var(--c-text)',marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--c-border)'}}>Contrato {contrato.codigo}</h3>
              <div style={{display:'flex',flexDirection:'column',gap:7}}>
                {[['Cliente',contrato.cli],['Veículo',contrato.veiculo],['Status',STATUS_MAP[contrato.status]?.lbl],
                  ['Valor',formatCurrency(contrato.valor)],['Entrada',formatCurrency(contrato.entrada)],
                  ['Financiado',formatCurrency(contrato.valor-contrato.entrada)],
                  ['Parcela',`${contrato.prazo}x de ${formatCurrency(contrato.parcela)}`],
                  ['Taxa',contrato.taxa+'% a.m.'],['Data',contrato.data]].map(([l,v])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:'var(--fs1)',padding:'6px 0',borderBottom:'1px solid var(--c-border)'}}>
                      <span style={{color:'var(--c-mid)'}}>{l}</span><strong style={{color:'var(--ford-vivid)'}}>{v}</strong>
                    </div>
                ))}
              </div>
              <div style={{display:'flex',gap:8,marginTop:16}}>
                <button className="btn-sec" style={{flex:1}} onClick={()=>setContratoId(null)}>Fechar</button>
                {canExcluir && (
                  <button className="btn-danger" onClick={()=>setDeleteTarget(contrato)}>
                    <i className="ph-bold ph-trash"/> Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        id="finSimDeleteModal"
        isOpen={!!deleteTarget}
        onClose={()=>setDeleteTarget(null)}
        onConfirm={confirmarExclusao}
        title={`Excluir simulação de ${deleteTarget?.cli ?? ''}`}
        message="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
      />
    </section>
  );
};