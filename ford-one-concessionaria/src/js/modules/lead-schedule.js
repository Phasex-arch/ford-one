// @ts-check
'use strict';
/* ============================================================
   lead-schedule.js
   openLeadSchedule(), _buildLeadSchedHTML(), _shiftSchedDay(),
   selectSchedSlot(), confirmLeadSchedule(), cancelLeadSchedule()
============================================================ */

// ─── LEAD SCHEDULE — multi-day ───────────────────────────────
let _schedLeadId='', _schedDayOffset=0;

function openLeadSchedule(leadId){
  const l=LEADS.find(x=>x.id===leadId);if(!l)return;
  _schedLeadId=leadId;_schedDayOffset=0;
  $('scheduleModalContent').innerHTML=_buildLeadSchedHTML(l,0);
  openModal('scheduleModal');
}

function _buildLeadSchedHTML(l,dayOff){
  const slotDay=getSlotsForDay(dayOff);
  const d=new Date();d.setDate(d.getDate()+dayOff);
  const dayLabel=dayOff===0?'Hoje':dayOff===1?'Amanhã':d.toLocaleDateString('pt-BR',{weekday:'short',day:'numeric',month:'short'});
  const slotsHtml=slotDay.map((sl,i)=>{
    const taken=sl.apts.some(a=>!a.cancelled);
    return `<div class="sched-slot${taken?' taken':''}" onclick="${taken?'':'selectSchedSlot(this,'+i+')'}" data-idx="${i}"><span class="sh">${sl.hora}</span><span>${taken?'Ocupado':'Livre'}</span></div>`;
  }).join('');
  return `<div style="padding:20px">
    <h3 style="font-size:21px;font-weight:700;color:var(--c-text);margin-bottom:4px">Agendar — ${l.cli}</h3>
    <p style="font-size:var(--fs1);color:var(--c-mid);margin-bottom:14px">Lead: <strong>${l.v}</strong></p>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <button class="icon-btn" onclick="_shiftSchedDay(-1)"><i class="ph-bold ph-caret-left"></i></button>
      <span style="font-size:var(--fs2);font-weight:600;color:var(--c-text);min-width:120px;text-align:center">${dayLabel}</span>
      <button class="icon-btn" onclick="_shiftSchedDay(1)"><i class="ph-bold ph-caret-right"></i></button>
    </div>
    <div class="m-sec-title">Horário</div>
    <div class="sched-grid" id="leadSchedGrid">${slotsHtml}</div>
    <div class="m-form" style="margin-top:14px">
      <label>Consultor / Técnico<select id="schedTech"><option value="">Sem técnico designado</option>${TECNICOS.map(t=>`<option>${t.nome}</option>`).join('')}</select></label>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn-sec" onclick="closeModal('scheduleModal')">Cancelar</button>
      <button class="btn-prim" onclick="confirmLeadSchedule('${l.id}')">Confirmar Agendamento</button>
    </div>
  </div>`;
}

function _shiftSchedDay(d){
  _schedDayOffset=Math.max(0,_schedDayOffset+d);
  const l=LEADS.find(x=>x.id===_schedLeadId);if(!l)return;
  const container=$('scheduleModalContent');
  if(container)container.innerHTML=_buildLeadSchedHTML(l,_schedDayOffset);
}

let selectedSchedSlot=-1;
function selectSchedSlot(el,idx){
  document.querySelectorAll('#leadSchedGrid .sched-slot:not(.taken)').forEach(s=>s.classList.remove('sel'));
  el.classList.add('sel');selectedSchedSlot=parseInt(el.dataset.idx);
}

function confirmLeadSchedule(leadId){
  if(selectedSchedSlot<0){showToast('Selecione um horário.','warning');return;}
  const l=LEADS.find(x=>x.id===leadId);if(!l)return;
  const daySlots=getSlotsForDay(_schedDayOffset);
  let tech=($('schedTech')?.value||'').trim();

  if(tech){
    const busy=getTechBusySlotsForDay(_schedDayOffset,tech);
    if(busy.has(selectedSchedSlot)){
      const nextFree=daySlots.findIndex((s,i)=>i>selectedSchedSlot&&!busy.has(i)&&!s.apts.some(a=>!a.cancelled));
      if(nextFree>-1){showToast(`${tech} ocupado. Reagendando para ${daySlots[nextFree].hora}.`,'warning');selectedSchedSlot=nextFree;}
      else{showToast('Sem disponibilidade neste dia para este técnico.','warning');selectedSchedSlot=-1;closeModal('scheduleModal');return;}
    }
  }else{
    const assigned=pickAvailableTechForDay(_schedDayOffset,selectedSchedSlot);
    if(!assigned){showToast('Todos os técnicos ocupados neste horário.','warning');selectedSchedSlot=-1;closeModal('scheduleModal');return;}
    tech=assigned;
  }

  daySlots[selectedSchedSlot].apts.push({cli:l.cli,type:l.v,tech,cls:'',cancelled:false});
  leadSchedule[leadId]={dayOffset:_schedDayOffset,slotIdx:selectedSchedSlot};
  const hora=daySlots[selectedSchedSlot].hora;
  const dayLabel=_schedDayOffset===0?'hoje':_schedDayOffset===1?'amanhã':'+'+_schedDayOffset+'d';
  selectedSchedSlot=-1;
  closeModal('scheduleModal');renderLeads();if(curMod==='agenda'){renderAgendaDay();updateCapacity();}
  showToast(`Agendado: ${l.cli} às ${hora} (${dayLabel}) com ${tech}!`,'success');
}

function cancelLeadSchedule(leadId){
  const info=leadSchedule[leadId];if(!info)return;
  const l=LEADS.find(x=>x.id===leadId);
  const daySlots=getSlotsForDay(info.dayOffset);
  const apt=daySlots[info.slotIdx]?.apts.find(a=>a.cli===l?.cli&&!a.cancelled);
  if(apt)apt.cancelled=true;
  delete leadSchedule[leadId];
  if(curMod==='agenda'){renderAgendaDay();updateCapacity();}
  renderLeads();showToast('Agendamento cancelado.','warning');
}

// ─── AGENDA ──────────────────────────────────────────────────
