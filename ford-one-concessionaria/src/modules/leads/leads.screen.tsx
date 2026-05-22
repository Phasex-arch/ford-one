/**
 * @file leads.screen.tsx
 * @module leads
 * @description Tela de Leads Inteligentes — pipeline de oportunidades com IA.
 *
 * Composição:
 * - Header com botão Exportar
 * - Pipeline Bar: 4 KPIs (total, urgentes, pipeline total, ticket médio)
 * - Seletor de filtro por urgência
 * - Grid de LeadCards com urgência, insight de IA, valor e ações
 * - Modal de detalhe do lead com oportunidade, insight e ações
 * - Modal de agendamento: seleção de dia, horário e técnico
 *
 * Fluxo de agendamento:
 * 1. Clicar "Agendar" no card → abre modal de horários
 * 2. Selecionar slot → confirmar → salva em leadSchedule no AppContext
 * 3. Card exibe status agendado com horário + botão cancelar
 *
 * Props:
 * - showToast → feedback de ações (ligar, assumir, agendar, cancelar)
 */

import React, { useState } from 'react';
import { useLeads } from './hooks/useLeads';
import { getLead } from './services/leads.service';
import { formatCurrency, cap } from '../../shared/utils/formatters';
import { useApp } from '../../shared/context/AppContext';
import { SLOT_HOURS } from '../../data/tecnicos.data';
import { useTecnicos } from '../../shared/hooks/useTecnicos';
import type { LeadUrgencia } from '../../types/global.types';
import type { ToastType } from '../../shared/hooks/useToast';

interface Props { showToast: (m: string, t?: ToastType) => void; }

export const LeadsScreen: React.FC<Props> = ({ showToast }) => {
  const { leads, urgFilter, setUrgFilter, modalId, setModalId, pipeline } = useLeads();
  const { leadSchedule, setLeadSchedule, navigate } = useApp();
  const TECNICOS = useTecnicos();
  const [schedLeadId, setSchedLeadId] = useState<string|null>(null);
  const [schedDay, setSchedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(-1);

  const slots = SLOT_HOURS.slice(0,18).map((h,i) => ({
    hora: h, taken: [0,1,3,4,6,7,9,10,12,15,16].includes(i),
  }));

  const lead = modalId ? getLead(modalId) : null;
  const schedLead = schedLeadId ? getLead(schedLeadId) : null;
  const isBooked = (id: string) => !!leadSchedule[id];

  const cancelSchedule = (id: string) => {
    setLeadSchedule(p => { const n={...p}; delete n[id]; return n; });
    showToast('Agendamento cancelado.','warning');
  };

  const confirmSchedule = () => {
    if (selectedSlot < 0) { showToast('Selecione um horário.','warning'); return; }
    if (!schedLeadId) return;
    const l = getLead(schedLeadId); if (!l) return;
    const tech = TECNICOS.find(t=>t.status==='livre')?.nome || TECNICOS[0].nome;
    setLeadSchedule(p => ({...p, [schedLeadId]: { dayOffset: schedDay, slotIdx: selectedSlot }}));
    showToast(`Agendado: ${l.cli} às ${slots[selectedSlot]?.hora} com ${tech}!`, 'success');
    setSchedLeadId(null); setSelectedSlot(-1);
  };

  return (
    <section className="module active" id="mod-leads">
      <div className="mod-header">
        <div><h1>Leads Inteligentes</h1><p className="mod-sub">Pipeline de oportunidades com IA</p></div>
        <div className="mod-actions">
          <button className="btn-sec" onClick={()=>navigate('relatorios')}><i className="ph-bold ph-arrow-square-out"/> Exportar</button>
        </div>
      </div>

      <div className="pipeline-bar" id="pipelineBar">
        <div className="pipeline-item"><div className="pipeline-val">{pipeline.total}</div><div className="pipeline-lbl">Total de Leads</div></div>
        <div className="pipeline-item"><div className="pipeline-val" style={{color:'var(--red)'}}>{pipeline.urgentes}</div><div className="pipeline-lbl">Urgentes</div><div className="pipeline-sub" style={{color:'var(--red)'}}>Ação imediata</div></div>
        <div className="pipeline-item"><div className="pipeline-val" style={{color:'var(--ford-vivid)'}}>{formatCurrency(pipeline.pipeline,true)}</div><div className="pipeline-lbl">Pipeline Total</div></div>
        <div className="pipeline-item"><div className="pipeline-val" style={{color:'var(--green)'}}>{formatCurrency(pipeline.ticketMedio,true)}</div><div className="pipeline-lbl">Ticket Médio</div></div>
      </div>

      <div className="filter-bar" style={{marginBottom:16}}>
        <select value={urgFilter} onChange={e=>setUrgFilter(e.target.value as LeadUrgencia|'')}>
          <option value="">Todos os leads</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      <div className="leads-grid" id="leadsGrid">
        {leads.map(l => {
          const bk = leadSchedule[l.id];
          const bookLabel = bk ? `${slots[bk.slotIdx]?.hora||'–'} (${bk.dayOffset===0?'Hoje':bk.dayOffset===1?'Amanhã':'+'+bk.dayOffset+'d'})` : '';
          return (
            <div key={l.id} className={`lead-card ${l.urg}`} onClick={()=>setModalId(l.id)} style={{cursor:'pointer'}}>
              <div className="lead-head">
                <div className="lead-cli"><div className="cli-av">{l.ini}</div><div><div className="cli-name">{l.cli}</div><div className="cli-id">{l.id}</div></div></div>
                <span className={`urg-tag ${l.urg}`}>{cap(l.urg)}</span>
              </div>
              <div className="lead-vbox"><div className="lead-vlbl">Interesse em</div><div className="lead-vname">{l.v}</div><div className="lead-nec">{l.nec}</div></div>
              <div className="lead-insight"><strong>Insight da IA</strong>{l.ins}</div>
              <div className="lead-foot">
                <div><div className="lead-val-lbl">Valor estimado</div><div className="lead-val">{formatCurrency(l.val)}</div></div>
                <div className="lead-acts">
                  {isBooked(l.id) ? <>
                    <div style={{fontSize:'var(--fs0)',color:'var(--green)',fontWeight:600,display:'flex',alignItems:'center',gap:4,marginBottom:4}}><i className="ph-bold ph-check-circle" style={{fontSize:12}}/>{bookLabel}</div>
                    <button className="btn-danger" style={{height:28,padding:'0 11px',fontSize:'var(--fs0)'}} onClick={e=>{e.stopPropagation();cancelSchedule(l.id);}}>Cancelar</button>
                  </> : <>
                    <button className="btn-sec" onClick={e=>{e.stopPropagation();setSchedLeadId(l.id);setSchedDay(0);setSelectedSlot(-1);}}>Agendar</button>
                    <button className="btn-prim" onClick={e=>{e.stopPropagation();setModalId(l.id);}}>Atender lead</button>
                  </>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lead && (
        <div className={`modal-ov${modalId?' open':''}`} id="leadModal" onClick={e=>{if(e.target===e.currentTarget)setModalId(null);}}>
          <div className="modal-box">
            <button className="modal-x" onClick={()=>setModalId(null)}><i className="ph-bold ph-x"/></button>
            <div style={{padding:'24px 24px 0'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10,marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:11}}>
                  <div className="cli-av" style={{width:40,height:40,fontSize:'var(--fs3)'}}>{lead.ini}</div>
                  <div><div style={{fontSize:20,fontWeight:700,color:'var(--c-text)'}}>{lead.cli}</div><div style={{fontSize:'var(--fs0)',color:'var(--c-mid)'}}>{lead.tel}</div></div>
                </div>
                <span className={`urg-tag ${lead.urg}`} style={{fontSize:'var(--fs1)',padding:'4px 12px'}}>{cap(lead.urg)}</span>
              </div>
              {leadSchedule[lead.id] && (() => { const bk=leadSchedule[lead.id]; const hl=slots[bk.slotIdx]?.hora||'–'; const dl=bk.dayOffset===0?'Hoje':bk.dayOffset===1?'Amanhã':'+'+bk.dayOffset+' dias'; return (
                <div style={{padding:'10px 13px',background:'var(--green-bg)',borderRadius:'var(--rsm)',borderLeft:'3px solid var(--green)',fontSize:'var(--fs1)',marginBottom:14,color:'var(--green)',fontWeight:600}}>Agendado — {hl} · {dl}</div>
              );})()}
            </div>
            <div className="m-body" style={{paddingTop:0}}>
              <div className="m-sec"><div className="m-sec-title">Oportunidade</div>
                <div className="m-grid">
                  <div><div className="mf-lbl">Veículo</div><div className="mf-val">{lead.v}</div></div>
                  <div><div className="mf-lbl">Necessidade</div><div className="mf-val">{lead.nec}</div></div>
                  <div><div className="mf-lbl">Valor Estimado</div><div className="mf-val" style={{fontSize:22,fontWeight:700,color:'var(--ford-blue)'}}>{formatCurrency(lead.val)}</div></div>
                </div>
              </div>
              <div className="m-sec"><div className="m-sec-title">Insight IA</div>
                <div style={{background:'var(--ford-light)',borderLeft:'4px solid var(--ford-vivid)',borderRadius:'var(--rsm)',padding:'12px 14px',fontSize:'var(--fs1)',color:'var(--c-mid)',lineHeight:1.6}}>{lead.ins}</div>
              </div>
              <div className="m-sec" style={{marginBottom:0}}><div className="m-sec-title">Ações</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button className="btn-sec" onClick={()=>{showToast('Ligação registrada!','info');setModalId(null);}}>Ligar agora</button>
                  {isBooked(lead.id)
                    ? <button className="btn-danger" onClick={()=>{cancelSchedule(lead.id);setModalId(null);}}>Cancelar agendamento</button>
                    : <button className="btn-sec" onClick={()=>{setModalId(null);setSchedLeadId(lead.id);setSchedDay(0);setSelectedSlot(-1);}}>Agendar visita</button>}
                  <button className="btn-prim" onClick={()=>{showToast('Lead assumido!','success');setModalId(null);}}>Assumir lead</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {schedLead && (
        <div className="modal-ov open" id="scheduleModal" onClick={e=>{if(e.target===e.currentTarget){setSchedLeadId(null);setSelectedSlot(-1);}}}>
          <div className="modal-box">
            <button className="modal-x" onClick={()=>{setSchedLeadId(null);setSelectedSlot(-1);}}><i className="ph-bold ph-x"/></button>
            <div style={{padding:20}}>
              <h3 style={{fontSize:21,fontWeight:700,color:'var(--c-text)',marginBottom:4}}>Agendar — {schedLead.cli}</h3>
              <p style={{fontSize:'var(--fs1)',color:'var(--c-mid)',marginBottom:14}}>Lead: <strong>{schedLead.v}</strong></p>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                <button className="icon-btn" onClick={()=>setSchedDay(d=>Math.max(0,d-1))}><i className="ph-bold ph-caret-left"/></button>
                <span style={{fontSize:'var(--fs2)',fontWeight:600,color:'var(--c-text)',minWidth:120,textAlign:'center'}}>{schedDay===0?'Hoje':schedDay===1?'Amanhã':'+'+schedDay+' dias'}</span>
                <button className="icon-btn" onClick={()=>setSchedDay(d=>d+1)}><i className="ph-bold ph-caret-right"/></button>
              </div>
              <div className="m-sec-title">Horário</div>
              <div className="sched-grid">
                {slots.map((sl,i)=>(
                  <div key={i} className={`sched-slot${sl.taken?' taken':''}${selectedSlot===i?' sel':''}`}
                    onClick={()=>!sl.taken&&setSelectedSlot(i)}>
                    <span className="sh">{sl.hora}</span><span>{sl.taken?'Ocupado':'Livre'}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                <button className="btn-sec" onClick={()=>{setSchedLeadId(null);setSelectedSlot(-1);}}>Cancelar</button>
                <button className="btn-prim" onClick={confirmSchedule}>Confirmar Agendamento</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};