/**
 * @file financiamentos.screen.tsx
 * @module financiamentos
 * @description Tela de Financiamentos — carteira de contratos e simulador.
 *
 * Composição:
 * - Header com botão Nova Simulação
 * - KPI Grid: Carteira Total, Contratos Ativos, Em Análise, Taxa Média
 * - Grid de FinCards: cada card exibe cliente, veículo, valores, status e
 *   botão "Ver contrato" que abre o modal de detalhes
 * - Modal Simulação: formulário completo com cálculo automático em tempo real
 *   (exibe parcela, financiado, total pago e total em juros)
 * - Modal Contrato: todos os detalhes do contrato selecionado com opção de
 *   enviar por e-mail (simulado via toast)
 *
 * Status visual dos contratos:
 * aprovado → verde | analise → laranja | pendente → azul Ford | reprovado → vermelho
 *
 * Props:
 * - showToast → feedback de simulação salva e envio de contrato
 */

import React from 'react';
import { useFinanciamentos } from './hooks/useFinanciamentos';
import { formatCurrency } from '../../shared/utils/formatters';
import type { ToastType } from '../../shared/hooks/useToast';
import type { FinanciamentoStatus } from '../../types/global.types';

interface Props { showToast:(m:string,t?:ToastType)=>void; }

const STATUS_MAP: Record<FinanciamentoStatus,{bg:string;c:string;lbl:string}> = {
  aprovado:{bg:'var(--green-bg)',  c:'var(--green)',      lbl:'Aprovado'   },
  analise: {bg:'var(--orange-bg)', c:'var(--gold)',       lbl:'Em Análise' },
  pendente:{bg:'var(--ford-light)',c:'var(--ford-vivid)', lbl:'Pendente'   },
  reprovado:{bg:'var(--red-bg)',   c:'var(--red)',        lbl:'Reprovado'  },
};

export const FinanciamentosScreen: React.FC<Props> = ({ showToast }) => {
  const { financiamentos, simOpen, setSimOpen, contratoId, setContratoId, contrato,
          simVei, setSimVei, simCli, setSimCli, simValor, setSimValor, simEntrada, setSimEntrada,
          simPrazo, setSimPrazo, simTaxa, setSimTaxa, calcParcela, saveFinSim } = useFinanciamentos(showToast);

  const totalCarteira = financiamentos.filter(f=>f.status==='aprovado').reduce((s,f)=>s+f.valor,0);
  const aprovados = financiamentos.filter(f=>f.status==='aprovado').length;
  const emAnalise = financiamentos.filter(f=>f.status==='analise').length;
  const parcela = calcParcela();
  const financiado = simValor-simEntrada;
  const totalPago = simEntrada+(parcela*simPrazo);

  return (
    <section className="module active" id="mod-financiamentos">
      <div className="mod-header">
        <div><h1>Financiamentos</h1><p className="mod-sub">Simulações e contratos ativos</p></div>
        <div className="mod-actions">
          <button className="btn-prim" onClick={()=>setSimOpen(true)}><i className="ph-bold ph-plus"/> Nova Simulação</button>
        </div>
      </div>

      <div id="finContent">
        <div className="kpi-grid" style={{marginBottom:18}}>
          {[
            {lbl:'Carteira Total',val:formatCurrency(totalCarteira),ic:'ic-green',ph:'ph-money'},
            {lbl:'Contratos Ativos',val:String(aprovados),ic:'ic-blue',ph:'ph-file-text'},
            {lbl:'Em Análise',val:String(emAnalise),ic:'ic-orange',ph:'ph-clock'},
            {lbl:'Taxa Média',val:'1.54% a.m.',ic:'ic-purple',ph:'ph-percent'},
          ].map(k=>(
            <div key={k.lbl} className="kpi-card">
              <div className={`kpi-ic ${k.ic}`}><i className={`ph-bold ${k.ph}`} style={{fontSize:17}}/></div>
              <div className="kpi-body"><span className="kpi-lbl">{k.lbl}</span><span className="kpi-val sm">{k.val}</span></div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <h3 className="sec-title" style={{marginBottom:0}}>Contratos e Simulações</h3>
        </div>

        <div className="fin-grid">
          {financiamentos.map(f=>{
            const st=STATUS_MAP[f.status]||STATUS_MAP.pendente;
            return (
              <div key={f.id} className="fin-card">
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
                  <button className="btn-tbl" onClick={()=>setContratoId(f.id)}>Ver contrato</button>
                </div>
              </div>
            );
          })}
        </div>
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
                <button className="btn-prim" onClick={saveFinSim}>Salvar Simulação</button>
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
              <h3 style={{fontSize:20,fontWeight:700,color:'var(--c-text)',marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--c-border)'}}>Contrato {contrato.id}</h3>
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
                <button className="btn-prim" style={{flex:1}} onClick={()=>{setContratoId(null);showToast('Contrato enviado por e-mail.','success');}}>Enviar por e-mail</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};