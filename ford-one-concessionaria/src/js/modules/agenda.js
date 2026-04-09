// @ts-check
'use strict';
/* ============================================================
   agenda.js
   renderAgenda(), updateCapacity(), renderAgendaDay(),
   cancelApt(), openScheduleModal(), selectAgSlot(),
   confirmAgendaSchedule()
============================================================ */

function renderAgenda(){
  $('tecnicosList').innerHTML=TECNICOS.map(t=>`<div class="tec-row"><div class="tec-av">${t.ini}</div><div style="flex:1"><div class="tec-name">${t.nome}</div><div class="tec-esp">${t.esp}</div></div><div class="tec-dot ${t.status}" title="${cap(t.status)}"></div></div>`).join('');
  updateCapacity();renderAgendaDay();
}

function updateCapacity(){
  const active=SLOTS.reduce((n,sl)=>n+sl.apts.filter(a=>!a.cancelled).length,0);
  const total=18,pct=Math.round((active/total)*100);
  $('capFill').style.width=pct+'%';$('capLabel').textContent=`${active}/${total} vagas`;
  const ci=$('capInfo');ci.textContent=`${pct}% ocupado`;ci.style.color=pct>=90?'var(--red)':pct>=70?'var(--orange)':'var(--green)';
}

function renderAgendaDay(){
  const d=new Date();d.setDate(d.getDate()+agOffset);
  $('agendaDayTitle').textContent=`${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  $('agendaSlots').innerHTML=SLOTS.map((sl,si)=>{
    const isEmpty=sl.apts.filter(a=>!a.cancelled).length===0;
    return `<div class="agenda-slot"><div class="slot-t">${sl.hora}</div><div class="slot-c">
      ${sl.apts.map((a,ai)=>a.cancelled
        ?`<div class="apt cancelled"><div class="apt-cli">${a.cli}</div><div class="apt-type" style="text-decoration:line-through">${a.type}</div><div class="apt-tech" style="color:var(--red)">Cancelado</div></div>`
        :`<div class="apt ${a.cls}"><div class="apt-cli">${a.cli}</div><div class="apt-type">${a.type}</div><div class="apt-tech">${a.tech?'Técnico: '+a.tech:'Consultor comercial'}</div><button class="apt-x" onclick="event.stopPropagation();cancelApt(${si},${ai})"><i class="ph-bold ph-x" style="font-size:9px"></i></button></div>`
      ).join('')}
      ${isEmpty?'<span class="slot-empty">Disponível</span>':''}
    </div></div>`;
  }).join('');
}

function cancelApt(si,ai){SLOTS[si].apts[ai].cancelled=true;renderAgendaDay();updateCapacity();showToast('Agendamento cancelado.','warning');}

function openScheduleModal(slotIdx){
  selectedSchedSlot=slotIdx>=0?slotIdx:-1;
  const slotsHtml=SLOTS.map((sl,i)=>{const taken=sl.apts.some(a=>!a.cancelled),presel=i===slotIdx;return `<div class="sched-slot${taken?' taken':''}${presel?' sel':''}" onclick="${taken?'':'selectAgSlot(this,'+i+')'}" data-idx="${i}"><span class="sh">${sl.hora}</span><span>${taken?'Ocupado':'Livre'}</span></div>`;}).join('');
  $('scheduleModalContent').innerHTML=`<div style="padding:20px">
    <h3 style="font-size:21px;font-weight:700;color:var(--c-text);margin-bottom:5px">Novo Agendamento</h3>
    <p style="font-size:var(--fs1);color:var(--c-mid);margin-bottom:16px">Selecione o horário e preencha os dados.</p>
    <div class="m-sec-title">Horário</div>
    <div class="sched-grid" id="agSchedGrid">${slotsHtml}</div>
    <div class="m-form" style="margin-top:14px">
      <label>Cliente<input type="text" id="agSchedCli" placeholder="Nome do cliente"></label>
      <label>Serviço<input type="text" id="agSchedServ" placeholder="Tipo de serviço ou veículo"></label>
      <label>Técnico<select id="agSchedTech"><option value="">Sem técnico designado</option>${TECNICOS.map(t=>`<option>${t.nome}</option>`).join('')}</select></label>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn-sec" onclick="closeModal('scheduleModal')">Cancelar</button>
      <button class="btn-prim" onclick="confirmAgendaSchedule()">Confirmar</button>
    </div>
  </div>`;
  document.querySelectorAll('#agSchedGrid .sched-slot:not(.taken)').forEach(el=>{
    el.addEventListener('click',()=>{document.querySelectorAll('#agSchedGrid .sched-slot:not(.taken)').forEach(s=>s.classList.remove('sel'));el.classList.add('sel');selectedSchedSlot=parseInt(el.dataset.idx);});
  });
  openModal('scheduleModal');
}
function selectAgSlot(el,idx){document.querySelectorAll('#agSchedGrid .sched-slot:not(.taken)').forEach(s=>s.classList.remove('sel'));el.classList.add('sel');selectedSchedSlot=idx;}

function confirmAgendaSchedule(){
  if(selectedSchedSlot<0){showToast('Selecione um horário.','warning');return;}
  const cli=$('agSchedCli')?.value.trim(),serv=$('agSchedServ')?.value.trim();
  let tech=$('agSchedTech')?.value||'';
  if(!cli||!serv){showToast('Preencha cliente e serviço.','warning');return;}
  if(!tech){const a=pickAvailableTechForDay(agOffset,selectedSchedSlot);if(!a){showToast('Sem técnico disponível neste horário.','warning');return;}tech=a;}
  else{const busy=getTechBusySlotsForDay(agOffset,tech);if(busy.has(selectedSchedSlot)){const nf=SLOTS.findIndex((s,i)=>i>selectedSchedSlot&&!busy.has(i)&&!s.apts.some(a=>!a.cancelled));if(nf>-1){showToast(`${tech} ocupado. Reagendado para ${SLOTS[nf].hora}.`,'warning');selectedSchedSlot=nf;}else{showToast('Sem disponibilidade.','warning');closeModal('scheduleModal');return;}}}
  if(SLOTS[selectedSchedSlot].apts.filter(a=>!a.cancelled).length>0){showToast('Horário já ocupado.','warning');return;}
  SLOTS[selectedSchedSlot].apts.push({cli,type:serv,tech,cls:'',cancelled:false});
  const hora=SLOTS[selectedSchedSlot].hora;selectedSchedSlot=-1;
  closeModal('scheduleModal');renderAgendaDay();updateCapacity();
  showToast(`Agendado: ${cli} às ${hora} com ${tech||'técnico a designar'}!`,'success');
}

