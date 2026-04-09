// @ts-check
'use strict';
/* ============================================================
   estoque.js
   renderEstoque(), filterEstoque(),
   openEstoqueModal(), openFinSimFromEstoque()
============================================================ */

// ─── ESTOQUE ─────────────────────────────────────────────────
function renderEstoque(data){
  const g=$('estoqueGrid');
  (data||ESTOQUE).forEach(e=>{
    const d=document.createElement('div');d.className='est-card';d.onclick=()=>openEstoqueModal(e.id);
    d.innerHTML=`<div class="est-img">${e.img?`<img src="${e.img}" alt="${e.modelo}" loading="lazy">`:`<div style="color:var(--c-dim);display:flex;flex-direction:column;align-items:center;gap:4px"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg><span style="font-size:var(--fs0)">${e.modelo}</span></div>`}
      <span class="est-badge ${e.cond}">${cap(e.cond)}</span><span class="est-status">${e.status}</span></div>
      <div class="est-body"><div class="est-model">${e.modelo}</div><div class="est-ver">${e.versao}</div>
      <div class="est-specs"><span class="esp">${e.ano}</span><span class="esp">${e.motor}</span><span class="esp">${e.trans}</span>${e.km?`<span class="esp">${e.km}</span>`:''}</div>
      <div class="est-price-block"><div class="est-price-lbl">A partir de</div><div class="est-price">${formatCurrency(e.preco)}</div></div></div>`;
    g.appendChild(d);
  });
}
function filterEstoque(){
  const q=$('estSearch').value.toLowerCase(),co=$('estCond').value,se=$('estSeg').value;
  $('estoqueGrid').innerHTML='';
  renderEstoque(ESTOQUE.filter(e=>(!q||e.modelo.toLowerCase().includes(q)||e.versao.toLowerCase().includes(q))&&(!co||e.cond===co)&&(!se||e.seg===se)));
  $('estoqueSubtitle').textContent=`${$('estoqueGrid').children.length} veículos encontrados`;
}
function openEstoqueModal(id){
  const e=ESTOQUE.find(x=>x.id===id);if(!e)return;
  $('estoqueModalContent').innerHTML=`<div class="m-hero">${e.img?`<img src="${e.img}" alt="${e.modelo}">`:`<div class="m-hero-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>`}
    <div class="m-hero-ov"></div><div class="m-hero-info"><h2>${e.modelo}</h2><p>${e.versao} · ${e.ano} · ${e.cor}</p></div></div>
    <div class="m-body"><div class="m-sec"><div class="m-sec-title">Especificações</div><div class="m-grid"><div><div class="mf-lbl">Motorização</div><div class="mf-val">${e.motor}</div></div><div><div class="mf-lbl">Transmissão</div><div class="mf-val">${e.trans}</div></div><div><div class="mf-lbl">Condição</div><div class="mf-val"><span class="est-badge ${e.cond}" style="position:static;display:inline-block">${cap(e.cond)}</span></div></div><div><div class="mf-lbl">Status</div><div class="mf-val">${e.status}</div></div>${e.km?`<div><div class="mf-lbl">KM</div><div class="mf-val">${e.km}</div></div>`:''}<div><div class="mf-lbl">Em estoque</div><div class="mf-val">${e.estq} un.</div></div></div></div>
    <div class="m-sec"><div class="m-sec-title">Opcionais</div><div>${e.ops.map(o=>`<span class="itag green">${o}</span>`).join('')}</div></div>
    <div class="m-sec"><div class="m-sec-title">Precificação</div><div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px"><div><div class="mf-lbl">Valor sugerido</div><div style="font-size:28px;font-weight:700;color:var(--ford-blue)">${formatCurrency(e.preco)}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-sec" onclick="openFinSimFromEstoque('${e.id}')">Simular financiamento</button><button class="btn-prim" onclick="showToast('Unidade reservada!','success')">Reservar unidade</button></div></div></div></div>`;
  openModal('estoqueModal');
}
function openFinSimFromEstoque(eid){
  const e=ESTOQUE.find(x=>x.id===eid);if(!e)return;
  closeModal('estoqueModal');
  setTimeout(()=>{$('finVei').value=`${e.modelo} ${e.versao}`;$('finValor').value=e.preco;calcFin();openModal('finSimModal');},220);
}

