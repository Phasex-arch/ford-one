// @ts-check
'use strict';
/* ============================================================
   leads.js
   renderPipelineBar(), renderLeads(), filterLeads(), openLeadModal()
============================================================ */

// ─── LEADS ───────────────────────────────────────────────────
function renderPipelineBar(){
  const pb=$('pipelineBar');if(!pb)return;
  const total=LEADS.length,urgentes=LEADS.filter(l=>l.urg==='urgente').length;
  const pipeline=LEADS.reduce((s,l)=>s+l.val,0);
  pb.innerHTML=`
    <div class="pipeline-item"><div class="pipeline-val">${total}</div><div class="pipeline-lbl">Total de Leads</div></div>
    <div class="pipeline-item"><div class="pipeline-val" style="color:var(--red)">${urgentes}</div><div class="pipeline-lbl">Urgentes</div><div class="pipeline-sub" style="color:var(--red)">Ação imediata</div></div>
    <div class="pipeline-item"><div class="pipeline-val" style="color:var(--ford-vivid)">${formatCurrency(pipeline,true)}</div><div class="pipeline-lbl">Pipeline Total</div></div>
    <div class="pipeline-item"><div class="pipeline-val" style="color:var(--green)">${formatCurrency(Math.round(pipeline/total),true)}</div><div class="pipeline-lbl">Ticket Médio</div></div>`;
}

function renderLeads(data){
  $('leadsGrid').innerHTML=(data||LEADS).map(l=>{
    const booked=leadSchedule[l.id]!==undefined;
    const bookInfo=booked?leadSchedule[l.id]:null;
    const bookLabel=bookInfo?`${getSlotsForDay(bookInfo.dayOffset)[bookInfo.slotIdx]?.hora||'–'} (${bookInfo.dayOffset===0?'Hoje':bookInfo.dayOffset===1?'Amanhã':'+'+bookInfo.dayOffset+'d'})`:'';
    return `<div class="lead-card ${l.urg}" onclick="openLeadModal('${l.id}')">
      <div class="lead-head"><div class="lead-cli"><div class="cli-av">${l.ini}</div><div><div class="cli-name">${l.cli}</div><div class="cli-id">${l.id}</div></div></div><span class="urg-tag ${l.urg}">${cap(l.urg)}</span></div>
      <div class="lead-vbox"><div class="lead-vlbl">Interesse em</div><div class="lead-vname">${l.v}</div><div class="lead-nec">${l.nec}</div></div>
      <div class="lead-insight"><strong>Insight da IA</strong>${l.ins}</div>
      <div class="lead-foot">
        <div><div class="lead-val-lbl">Valor estimado</div><div class="lead-val">${formatCurrency(l.val)}</div></div>
        <div class="lead-acts">${booked
          ?`<div style="font-size:var(--fs0);color:var(--green);font-weight:600;display:flex;align-items:center;gap:4px;margin-bottom:4px"><i class="ph-bold ph-check-circle" style="font-size:12px"></i>${bookLabel}</div>
             <button class="btn-danger" style="height:28px;padding:0 11px;font-size:var(--fs0)" onclick="event.stopPropagation();cancelLeadSchedule('${l.id}')">Cancelar</button>`
          :`<button class="btn-sec" onclick="event.stopPropagation();openLeadSchedule('${l.id}')">Agendar</button>
             <button class="btn-prim" onclick="event.stopPropagation();openLeadModal('${l.id}')">Atender lead</button>`
        }</div>
      </div>
    </div>`;
  }).join('');
}

function filterLeads(){const u=$('leadsFilter').value;renderLeads(!u?LEADS:LEADS.filter(l=>l.urg===u));}

function openLeadModal(id){
  const l=LEADS.find(x=>x.id===id);if(!l)return;
  const booked=leadSchedule[l.id]!==undefined;
  const bookInfo=booked?leadSchedule[l.id]:null;
  const slotInfo=bookInfo?getSlotsForDay(bookInfo.dayOffset)[bookInfo.slotIdx]:null;
  const dayLabel=bookInfo?(bookInfo.dayOffset===0?'Hoje':bookInfo.dayOffset===1?'Amanhã':'+'+bookInfo.dayOffset+' dias'):'';
  $('leadModalContent').innerHTML=`
    <div style="padding:24px 24px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:11px"><div class="cli-av" style="width:40px;height:40px;font-size:var(--fs3)">${l.ini}</div><div><div style="font-size:20px;font-weight:700;color:var(--c-text)">${l.cli}</div><div style="font-size:var(--fs0);color:var(--c-mid)">${l.tel}</div></div></div>
        <span class="urg-tag ${l.urg}" style="font-size:var(--fs1);padding:4px 12px">${cap(l.urg)}</span>
      </div>
      ${booked?`<div style="padding:10px 13px;background:var(--green-bg);border-radius:var(--rsm);border-left:3px solid var(--green);font-size:var(--fs1);margin-bottom:14px;color:var(--green);font-weight:600">Agendado — ${slotInfo?slotInfo.hora:'–'} · ${dayLabel}</div>`:''}
    </div>
    <div class="m-body" style="padding-top:0">
      <div class="m-sec"><div class="m-sec-title">Oportunidade</div>
        <div class="m-grid"><div><div class="mf-lbl">Veículo</div><div class="mf-val">${l.v}</div></div><div><div class="mf-lbl">Necessidade</div><div class="mf-val">${l.nec}</div></div><div><div class="mf-lbl">Valor Estimado</div><div class="mf-val" style="font-size:22px;font-weight:700;color:var(--ford-blue)">${formatCurrency(l.val)}</div></div><div><div class="mf-lbl">Lead</div><div class="mf-val">${l.id}</div></div></div>
      </div>
      <div class="m-sec"><div class="m-sec-title">Insight IA</div>
        <div style="background:var(--ford-light);border-left:4px solid var(--ford-vivid);border-radius:var(--rsm);padding:12px 14px;font-size:var(--fs1);color:var(--c-mid);line-height:1.6">${l.ins}</div>
      </div>
      <div class="m-sec" style="margin-bottom:0"><div class="m-sec-title">Ações</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-sec" onclick="showToast('Ligação registrada!','info');closeModal('leadModal')">Ligar agora</button>
          ${booked?`<button class="btn-danger" onclick="cancelLeadSchedule('${l.id}');closeModal('leadModal')">Cancelar agendamento</button>`
                  :`<button class="btn-sec" onclick="closeModal('leadModal');openLeadSchedule('${l.id}')">Agendar visita</button>`}
          <button class="btn-prim" onclick="showToast('Lead assumido!','success');closeModal('leadModal')">Assumir lead</button>
        </div>
      </div>
    </div>`;
  openModal('leadModal');
}

