/**
 * @file avaliacao.screen.tsx
 * @module avaliacao
 * @description Tela de Avaliação — NPS e satisfação de clientes.
 *
 * Composição:
 * - Header
 * - KPI Grid: Nota Geral (4.8), NPS (72), SLA Médio (2.3h), Ranking (#3)
 * - Grid de AvaliacaoCards: cada card exibe avatar, nome, data, estrelas e
 *   trecho do texto — clique abre o modal de detalhe
 * - Modal de detalhe: texto completo, detalhes do atendimento (serviço,
 *   veículo, consultor) e campo para resposta ao cliente
 *
 * As estrelas são renderizadas como caracteres Unicode (★☆) em laranja/cinza.
 *
 * Props:
 * - showToast → feedback de envio de resposta
 */

import React, { useState } from 'react';
import { useAvaliacoes } from './hooks/useAvaliacoes';
import type { ToastType } from '../../shared/hooks/useToast';

interface Props { showToast:(m:string,t?:ToastType)=>void; }

const stars = (n:number) => '★'.repeat(n)+'☆'.repeat(5-n);

export const AvaliacaoScreen: React.FC<Props> = ({ showToast }) => {
  const { avaliacoes: AVALIACOES, stats } = useAvaliacoes();
  const [modalIdx, setModalIdx] = useState<number|null>(null);
  const [reply, setReply] = useState('');
  const aval = modalIdx !== null ? AVALIACOES[modalIdx] : null;

  const notaGeral = (() => {
    const fromStats = typeof stats?.media === 'number' ? stats.media : null;
    if (fromStats !== null) return fromStats.toFixed(1);
    if (AVALIACOES.length === 0) return '0.0';
    const avg = AVALIACOES.reduce((s, a) => s + a.nota, 0) / AVALIACOES.length;
    return avg.toFixed(1);
  })();

  const kpis=[{ic:'ic-gold',fa:'ph-star',lbl:'Nota Geral',val:notaGeral,delta:'Excelente',cls:'pos'},{ic:'ic-blue',fa:'ph-chat-circle',lbl:'NPS',val:'72',delta:'Zona de excelência',cls:'pos'},{ic:'ic-teal',fa:'ph-clock',lbl:'SLA Médio',val:'2.3h',delta:'Abaixo da meta',cls:'pos'},{ic:'ic-green',fa:'ph-chart-bar',lbl:'Ranking',val:'#3',delta:'de 48 concessionárias',cls:'pos'}];

  return (
    <section className="module active" id="mod-avaliacao">
      <div className="mod-header"><div><h1>Avaliação</h1><p className="mod-sub">NPS e satisfação de clientes</p></div></div>
      <div className="kpi-grid" id="avalKpis">
        {kpis.map(k=><div key={k.lbl} className="kpi-card"><div className={`kpi-ic ${k.ic}`}><i className={`ph-bold ${k.fa}`}/></div><div className="kpi-body"><span className="kpi-lbl">{k.lbl}</span><span className="kpi-val">{k.val}</span><span className={`kpi-delta ${k.cls}`}>{k.delta}</span></div></div>)}
      </div>
      <div id="avalList" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14,marginTop:16}}>
        {AVALIACOES.map((a,i)=>{
          const ini=a.c.split(' ').map(n=>n[0]).slice(0,2).join('');
          return (
            <div key={i} className="aval-card" onClick={()=>setModalIdx(i)} style={{cursor:'pointer'}}>
              <div className="aval-head">
                <div style={{display:'flex',alignItems:'center',gap:9}}><div className="cli-av">{ini}</div><div><div className="aval-name">{a.c}</div><div className="aval-date">{a.data}</div></div></div>
                <div className="aval-stars" style={{color:'#f59e0b',fontSize:16}}>{stars(a.nota)}</div>
              </div>
              <div className="aval-txt">"{a.txt}"</div>
            </div>
          );
        })}
      </div>

      {aval && (
        <div className="modal-ov open" onClick={e=>{if(e.target===e.currentTarget)setModalIdx(null);}}>
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={()=>setModalIdx(null)}><i className="ph-bold ph-x"/></button>
            <div>
              <div className="aval-modal-header" style={{paddingRight:52}}>
                <div className="aval-modal-av">{aval.c.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                <div className="aval-modal-info">
                  <div className="aval-modal-nome">{aval.c}</div>
                  <div className="aval-modal-data">{aval.data}</div>
                  <div style={{marginTop:5,fontSize:15,letterSpacing:2,color:'#f59e0b'}}>{stars(aval.nota)}</div>
                </div>
                <div className="aval-modal-nota"><div className="aval-modal-nota-num">{aval.nota}<span style={{fontSize:11,fontWeight:400,opacity:.7}}>/5</span></div></div>
              </div>
              <div className="aval-modal-body">
                <div className="aval-modal-quote">{aval.txt}</div>
                <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.8px',color:'var(--c-dim)',marginBottom:8}}>Detalhes do atendimento</div>
                <div className="aval-modal-meta">
                  {aval.detalhe.split('·').map(p=>p.trim()).filter(Boolean).map((p,i)=>{const sep=p.indexOf(':');const lbl=sep>-1?p.slice(0,sep).trim():p;const val=sep>-1?p.slice(sep+1).trim():'—';return(<div key={i} className="aval-modal-row"><span className="aval-modal-lbl">{lbl}</span><span className="aval-modal-val">{val}</span></div>);})}
                </div>
                <div style={{marginTop:14}}>
                  <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.8px',color:'var(--c-dim)',marginBottom:6}}>Responder ao cliente</div>
                  <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Escreva sua resposta..." style={{width:'100%',minHeight:80,padding:'10px 12px',border:'1px solid var(--c-border)',borderRadius:'var(--rsm)',fontSize:'var(--fs1)',background:'var(--c-input)',color:'var(--c-text)',resize:'vertical',fontFamily:'inherit',lineHeight:1.5,boxSizing:'border-box',display:'block'}}/>
                  <div style={{display:'flex',justifyContent:'flex-end',marginTop:10,gap:8}}>
                    <button className="btn-sec" onClick={()=>setModalIdx(null)}>Fechar</button>
                    <button className="btn-prim" onClick={()=>{if(!reply.trim()){showToast('Escreva uma resposta.','warning');return;}setModalIdx(null);setReply('');showToast('Resposta enviada!','success');}}><i className="ph-bold ph-paper-plane-tilt"/> Enviar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};