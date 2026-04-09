// @ts-check
'use strict';
/* ============================================================
   servicos.js
   renderServicos(), switchTab(), openOSModal(),
   openOSEditModal(), salvarEdicaoOS(), moverOS(), deletarOS()
============================================================ */

// ─── SERVIÇOS ────────────────────────────────────────────────
let _activeOSTab='previstos';

// FIX: update tab badge counts dynamically
function _updateTabCounts(){
  const btns=document.querySelectorAll('.tab-btn');
  const counts={previstos:SERVICOS.previstos.length,andamento:SERVICOS.andamento.length,concluidos:SERVICOS.concluidos.length};
  const tabs=['previstos','andamento','concluidos'];
  btns.forEach((btn,i)=>{const ct=btn.querySelector('.tab-ct');if(ct&&tabs[i])ct.textContent=counts[tabs[i]];});
}

function renderServicos(tab){
  _activeOSTab=tab||_activeOSTab;
  _updateTabCounts();
  const list=SERVICOS[_activeOSTab]||[];
  if(!list.length){$('servicosContent').innerHTML=`<div style="text-align:center;padding:40px;color:var(--c-dim)"><i class="ph-bold ph-check-circle" style="font-size:36px;margin-bottom:10px;display:block;color:var(--green)"></i><div style="font-weight:600">Nenhuma OS nesta categoria</div></div>`;return;}
  // FIX: os-card layout — consistent grid columns
  $('servicosContent').innerHTML=`<div class="os-list">${list.map((s,i)=>`
    <div class="os-card" onclick="openOSModal('${_activeOSTab}',${i})">
      <div class="os-num">${s.num}</div>
      <div style="min-width:0"><div class="os-cname">${s.c}</div><div class="os-cveh">${s.v}</div></div>
      <div class="os-type">${s.t}</div>
      <div class="os-tech"><i class="ph-bold ph-wrench" style="font-size:11px;margin-right:3px"></i>${s.tech}</div>
      <div class="os-prazo ${s.pc}"><i class="ph-bold ph-clock" style="font-size:11px;margin-right:3px"></i>${s.prazo}</div>
      <div class="os-val">${s.val}</div>
      <div class="os-actions" onclick="event.stopPropagation()">
        <button class="os-act-btn" title="Editar" onclick="openOSEditModal('${_activeOSTab}',${i})"><i class="ph-bold ph-pencil-simple"></i></button>
        ${_activeOSTab!=='concluidos'?`<button class="os-act-btn" title="Avançar etapa" onclick="moverOS('${_activeOSTab}',${i})"><i class="ph-bold ph-arrow-right"></i></button>`:''}
        <button class="os-act-btn danger" title="Excluir" onclick="deletarOS('${_activeOSTab}',${i})"><i class="ph-bold ph-trash"></i></button>
      </div>
    </div>`).join('')}</div>`;
}

function switchTab(btn,tab){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderServicos(tab);}

function openOSModal(tab,idx){
  const s=SERVICOS[tab]?.[idx];if(!s)return;
  const statusLabel={previstos:'Previsto',andamento:'Em andamento',concluidos:'Concluído'};
  const badgeCls   ={previstos:'os-badge-previstos',andamento:'os-badge-andamento',concluidos:'os-badge-concluidos'};
  // FIX: header has explicit padding-right so X button doesn't overlap the value
  $('osDetailModalContent').innerHTML=`<div>
    <div class="os-modal-header" style="padding-right:52px">
      <div style="flex:1;min-width:0">
        <div class="os-modal-num">Ordem de Serviço</div>
        <div class="os-modal-title">${s.num} — ${s.c}</div>
        <span class="os-badge-status ${badgeCls[tab]}">${statusLabel[tab]}</span>
      </div>
      <div style="text-align:right;flex-shrink:0;padding-right:4px">
        <div style="font-size:var(--fs5);font-weight:700;color:#fff">${s.val}</div>
        <div style="font-size:var(--fs0);margin-top:2px;color:rgba(255,255,255,.7)"><i class="ph-bold ph-clock" style="font-size:11px;margin-right:2px"></i>${s.prazo}</div>
      </div>
    </div>
    <div class="m-body">
      <div class="m-grid" style="margin-bottom:16px">
        <div><div class="mf-lbl">Veículo</div><div class="mf-val">${s.v}</div></div>
        <div><div class="mf-lbl">Técnico</div><div class="mf-val">${s.tech}</div></div>
        <div><div class="mf-lbl">Tipo de Serviço</div><div class="mf-val">${s.t}</div></div>
        <div><div class="mf-lbl">Prazo</div><div class="mf-val">${s.prazo}</div></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${tab!=='concluidos'?`<button class="btn-prim" onclick="openOSEditModal('${tab}',${idx});closeModal('osDetailModal')"><i class="ph-bold ph-pencil-simple"></i> Editar</button>`:''}
        ${tab==='previstos' ?`<button class="btn-sec" onclick="moverOS('${tab}',${idx});closeModal('osDetailModal')"><i class="ph-bold ph-arrow-right"></i> Iniciar atendimento</button>`:''}
        ${tab==='andamento' ?`<button class="btn-sec" onclick="moverOS('${tab}',${idx});closeModal('osDetailModal')"><i class="ph-bold ph-check"></i> Concluir OS</button>`:''}
        <button class="btn-danger-out" onclick="deletarOS('${tab}',${idx});closeModal('osDetailModal')"><i class="ph-bold ph-trash"></i> Excluir</button>
      </div>
    </div>
  </div>`;
  openModal('osDetailModal');
}

function openOSEditModal(tab,idx){
  const s=SERVICOS[tab]?.[idx];if(!s)return;
  $('osEditModalContent').innerHTML=`<div style="padding:20px">
    <h3 style="font-size:var(--fs4);font-weight:700;color:var(--c-text);margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--c-border)">Editar OS ${s.num}</h3>
    <div class="m-form">
      <label>Cliente<input type="text" id="editOSCliente" value="${s.c}"/></label>
      <label>Veículo<input type="text" id="editOSVeiculo" value="${s.v}"/></label>
      <label>Tipo de serviço<input type="text" id="editOSTipo" value="${s.t}"/></label>
      <label>Técnico<select id="editOSTecnico">${TECNICOS.map(t=>`<option${t.nome===s.tech?' selected':''}>${t.nome}</option>`).join('')}</select></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>Prazo<input type="text" id="editOSPrazo" value="${s.prazo}"/></label>
        <label>Valor<input type="text" id="editOSVal" value="${s.val}"/></label>
      </div>
      <label>Prioridade<select id="editOSPc">
        <option value="ok"${s.pc==='ok'?' selected':''}>Normal</option>
        <option value="risco"${s.pc==='risco'?' selected':''}>Em risco</option>
        <option value="atrasado"${s.pc==='atrasado'?' selected':''}>Atrasado</option>
      </select></label>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn-sec" onclick="closeModal('osEditModal')">Cancelar</button>
      <button class="btn-prim" onclick="salvarEdicaoOS('${tab}',${idx})"><i class="ph-bold ph-floppy-disk"></i> Salvar</button>
    </div>
  </div>`;
  openModal('osEditModal');
}

function salvarEdicaoOS(tab,idx){
  const s=SERVICOS[tab]?.[idx];if(!s)return;
  s.c    =$('editOSCliente')?.value?.trim()||s.c;
  s.v    =$('editOSVeiculo')?.value?.trim()||s.v;
  s.t    =$('editOSTipo')?.value?.trim()   ||s.t;
  s.tech =$('editOSTecnico')?.value        ||s.tech;
  s.prazo=$('editOSPrazo')?.value?.trim()  ||s.prazo;
  s.val  =$('editOSVal')?.value?.trim()    ||s.val;
  s.pc   =$('editOSPc')?.value             ||s.pc;
  closeModal('osEditModal');renderServicos(_activeOSTab);showToast(`OS ${s.num} atualizada!`,'success');
}

function moverOS(tab,idx){
  const s=SERVICOS[tab].splice(idx,1)[0];if(!s)return;
  const prox={previstos:'andamento',andamento:'concluidos'},destino=prox[tab];
  if(destino){SERVICOS[destino].unshift(s);const labels={andamento:'Em andamento',concluidos:'Concluída'};showToast(`OS ${s.num} movida para ${labels[destino]}!`,'success');renderServicos(_activeOSTab);}
}

function deletarOS(tab,idx){
  const s=SERVICOS[tab]?.[idx];if(!s)return;
  const t=document.getElementById('osDeleteTitle'),m=document.getElementById('osDeleteMsg'),b=document.getElementById('osDeleteConfirmBtn');
  if(t)t.textContent=`Excluir OS ${s.num}`;
  if(m)m.textContent=`Deseja excluir a OS ${s.num} de ${s.c} — ${s.v}? Esta ação não pode ser desfeita.`;
  if(b)b.onclick=()=>{SERVICOS[tab].splice(idx,1);closeModal('osDeleteModal');renderServicos(_activeOSTab);showToast(`OS ${s.num} excluída.`,'info');};
  openModal('osDeleteModal');
}

