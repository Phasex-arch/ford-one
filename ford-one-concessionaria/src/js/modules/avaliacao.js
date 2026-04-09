// @ts-check
'use strict';
/* ============================================================
   avaliacao.js
   renderAvaliacao(), openAvalModal(), enviarRespostaAval()
============================================================ */

// ─── AVALIAÇÃO ───────────────────────────────────────────────
function renderAvaliacao(){
  const avalKpis=[
    {ic:'ic-gold', fa:'ph-star',       lbl:'Nota Geral', val:'4.8', delta:'Excelente',             cls:'pos',key:'nota'},
    {ic:'ic-blue', fa:'ph-chat-circle',lbl:'NPS',        val:'72',  delta:'Zona de excelência',    cls:'pos',key:'nota'},
    {ic:'ic-teal', fa:'ph-clock',      lbl:'SLA Médio',  val:'2.3h',delta:'Abaixo da meta',        cls:'pos',key:'sla' },
    {ic:'ic-green',fa:'ph-chart-bar',  lbl:'Ranking',    val:'#3',  delta:'de 48 concessionárias', cls:'pos',key:'nota'},
  ];
  $('avalKpis').innerHTML=avalKpis.map(k=>`<div class="kpi-card" onclick="openKpi('${k.key}')"><div class="kpi-ic ${k.ic}"><i class="ph-bold ${k.fa}"></i></div><div class="kpi-body"><span class="kpi-lbl">${k.lbl}</span><span class="kpi-val">${k.val}</span><span class="kpi-delta ${k.cls}">${k.delta}</span></div></div>`).join('');
  $('avalList').innerHTML=AVALIACOES.map((a,i)=>{
    const ini=a.c.split(' ').map(n=>n[0]).slice(0,2).join('');
    return `<div class="aval-card" onclick="openAvalModal(${i})">
      <div class="aval-head"><div style="display:flex;align-items:center;gap:9px"><div class="cli-av">${ini}</div><div><div class="aval-name">${a.c}</div><div class="aval-date">${a.data}</div></div></div>
      <div class="aval-stars">${starHtml(a.nota)}</div></div>
      <div class="aval-txt">"${a.txt}"</div>
    </div>`;
  }).join('');
}

function openAvalModal(idx){
  const a=AVALIACOES[idx];
  const ini=a.c.split(' ').map(n=>n[0]).slice(0,2).join('');
  const parts=a.detalhe.split('·').map(s=>s.trim()).filter(Boolean);
  // FIX: add padding-right to header so X doesn't overlap nota
  $('avalModalContent').innerHTML=`<div>
    <div class="aval-modal-header" style="padding-right:52px">
      <div class="aval-modal-av">${ini}</div>
      <div class="aval-modal-info"><div class="aval-modal-nome">${a.c}</div><div class="aval-modal-data">${a.data}</div><div style="margin-top:5px;font-size:15px;letter-spacing:2px">${starHtml(a.nota)}</div></div>
      <div class="aval-modal-nota"><div class="aval-modal-nota-num">${a.nota}<span style="font-size:11px;font-weight:400;opacity:.7">/5</span></div></div>
    </div>
    <div class="aval-modal-body">
      <div class="aval-modal-quote">${a.txt}</div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--c-dim);margin-bottom:8px">Detalhes do atendimento</div>
      <div class="aval-modal-meta">${parts.map(p=>{const sep=p.indexOf(':'),lbl=sep>-1?p.slice(0,sep).trim():p,val=sep>-1?p.slice(sep+1).trim():'—';return`<div class="aval-modal-row"><span class="aval-modal-lbl">${lbl}</span><span class="aval-modal-val">${val}</span></div>`;}).join('')}</div>
      <div style="margin-top:14px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--c-dim);margin-bottom:6px">Responder ao cliente</div>
        <textarea id="avalReplyText" placeholder="Escreva sua resposta..." style="width:100%;min-height:80px;padding:10px 12px;border:1px solid var(--c-border);border-radius:var(--rsm);font-size:var(--fs1);background:var(--c-input);color:var(--c-text);resize:vertical;font-family:inherit;line-height:1.5;box-sizing:border-box;display:block;transition:border-color .18s" onfocus="this.style.borderColor='var(--ford-vivid)'" onblur="this.style.borderColor='var(--c-border)'"></textarea>
        <div style="display:flex;justify-content:flex-end;margin-top:10px;gap:8px">
          <button class="btn-sec" onclick="closeModal('avalModal')">Fechar</button>
          <button class="btn-prim" onclick="enviarRespostaAval()"><i class="ph-bold ph-paper-plane-tilt"></i> Enviar Resposta</button>
        </div>
      </div>
    </div>
  </div>`;
  openModal('avalModal');
}

