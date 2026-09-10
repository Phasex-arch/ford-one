/**
 * @file agenda.screen.tsx
 * @module agenda
 * @description Tela de Agenda — gestão de agendamentos e capacidade da oficina.
 *
 * Composição (layout em duas colunas):
 * - Coluna esquerda (agenda-side):
 *   → cap-wrap: barra de capacidade do dia com percentual ocupado
 *   → Lista de técnicos com status (livre/ocupado/pausa)
 * - Coluna direita (agenda-main):
 *   → Navegador de dia com setas e título dinâmico
 *   → Grade de slots: cada slot exibe appointments ou "Disponível"
 *   → Botão X em cada appointment para cancelar
 * - Modal de Novo Agendamento:
 *   → Grade de slots (livre/ocupado)
 *   → Campos: cliente, serviço, técnico
 *
 * Props:
 * - showToast → feedback de cancelamento e confirmação de agendamento
 */

import React, { useState } from 'react';
import { useAgenda } from './hooks/useAgenda';
import { cap } from '../../shared/utils/formatters';
import type { ToastType } from '../../shared/hooks/useToast';

interface Props { showToast:(m:string,t?:ToastType)=>void; }

export const AgendaScreen: React.FC<Props> = ({ showToast }) => {
  const { tecnicos, slots, getDayTitle, active, total, pct, shiftDay, cancelApt,
          schedOpen, setSchedOpen, selectedSlot, setSelectedSlot, confirmSchedule } = useAgenda(showToast);
  const [schedCli, setSchedCli] = useState('');
  const [schedServ, setSchedServ] = useState('');
  const [schedTech, setSchedTech] = useState('');

  return (
    <section className="module active" id="mod-agenda">
      <div className="mod-header">
        <div><h1>Agenda</h1><p className="mod-sub">Gestão de agendamentos e capacidade da oficina</p></div>
        <div className="mod-actions">
          <button className="btn-prim" onClick={()=>setSchedOpen(true)}><i className="ph-bold ph-plus"/> Novo Agendamento</button>
        </div>
      </div>
      <div className="agenda-layout">
        <div className="agenda-side">
          <div className="cap-wrap">
            <div className="cap-row"><span className="panel-lbl">Capacidade do Dia</span><span id="capLabel" style={{fontSize:'var(--fs0)',fontWeight:600,color:'var(--c-mid)'}}>{active}/{total} vagas</span></div>
            <div className="cap-bar"><div id="capFill" className="cap-fill" style={{width:`${pct}%`}}/></div>
            <div id="capInfo" className="cap-info" style={{color:pct>=90?'var(--red)':pct>=70?'var(--orange)':'var(--green)'}}>{pct}% ocupado</div>
          </div>
          <div style={{marginTop:16}}>
            <div className="panel-lbl">Técnicos</div>
            <div id="tecnicosList">
              {tecnicos.map(t=>(
                <div key={t.nome} className="tec-row">
                  <div className="tec-av">{t.ini}</div>
                  <div style={{flex:1}}><div className="tec-name">{t.nome}</div><div className="tec-esp">{t.esp}</div></div>
                  <div className={`tec-dot ${t.status}`} title={cap(t.status)}/>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="agenda-main">
          <div className="agenda-day-row">
            <button className="icon-btn" onClick={()=>shiftDay(-1)}><i className="ph-bold ph-caret-left"/></button>
            <span id="agendaDayTitle" style={{fontSize:"var(--fs3)",fontWeight:600,color:"var(--c-text)",flex:1,textAlign:"center"}}>{getDayTitle()}</span>
            <button className="icon-btn" onClick={()=>shiftDay(1)}><i className="ph-bold ph-caret-right"/></button>
          </div>
          <div id="agendaSlots">
            {slots.map((sl,si)=>{
              const isEmpty = sl.apts.filter(a=>!a.cancelled).length === 0;
              return (
                <div key={si} className="agenda-slot">
                  <div className="slot-t">{sl.hora}</div>
                  <div className="slot-c">
                    {sl.apts.map((a,ai)=>a.cancelled
                      ? <div key={ai} className="apt cancelled"><div className="apt-cli">{a.cli}</div><div className="apt-type" style={{textDecoration:'line-through'}}>{a.type}</div><div className="apt-tech" style={{color:'var(--red)'}}>Cancelado</div></div>
                      : <div key={ai} className={`apt ${a.cls}`}><div className="apt-cli">{a.cli}</div><div className="apt-type">{a.type}</div><div className="apt-tech">{a.tech?'Técnico: '+a.tech:'Consultor comercial'}</div>
                          <button className="apt-x" onClick={e=>{e.stopPropagation();cancelApt(si,ai);}}><i className="ph-bold ph-x" style={{fontSize:9}}/></button>
                        </div>
                    )}
                    {isEmpty && <span className="slot-empty">Disponível</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {schedOpen && (
        <div className="modal-ov open" id="scheduleModal" onClick={e=>{if(e.target===e.currentTarget){setSchedOpen(false);setSelectedSlot(-1);}}}>
          <div className="modal-box">
            <button className="modal-x" onClick={()=>{setSchedOpen(false);setSelectedSlot(-1);}}><i className="ph-bold ph-x"/></button>
            <div style={{padding:20}}>
              <h3 style={{fontSize:21,fontWeight:700,color:'var(--c-text)',marginBottom:5}}>Novo Agendamento</h3>
              <p style={{fontSize:'var(--fs1)',color:'var(--c-mid)',marginBottom:16}}>Selecione o horário e preencha os dados.</p>
              <div className="m-sec-title">Horário</div>
              <div className="sched-grid">
                {slots.map((sl,i)=>{
                  const taken = sl.apts.some(a=>!a.cancelled);
                  return <div key={i} className={`sched-slot${taken?' taken':''}${selectedSlot===i?' sel':''}`} onClick={()=>!taken&&setSelectedSlot(i)}>
                    <span className="sh">{sl.hora}</span><span>{taken?'Ocupado':'Livre'}</span>
                  </div>;
                })}
              </div>
              <div className="m-form" style={{marginTop:14}}>
                <label>Cliente<input type="text" placeholder="Nome do cliente" value={schedCli} onChange={e=>setSchedCli(e.target.value)}/></label>
                <label>Serviço<input type="text" placeholder="Tipo de serviço ou veículo" value={schedServ} onChange={e=>setSchedServ(e.target.value)}/></label>
                <label>Técnico<select value={schedTech} onChange={e=>setSchedTech(e.target.value)}>
                  <option value="">Sem técnico designado</option>
                  {tecnicos.map(t=><option key={t.nome}>{t.nome}</option>)}
                </select></label>
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                <button className="btn-sec" onClick={()=>{setSchedOpen(false);setSelectedSlot(-1);}}>Cancelar</button>
                <button className="btn-prim" onClick={()=>confirmSchedule(schedCli,schedServ,schedTech)}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};