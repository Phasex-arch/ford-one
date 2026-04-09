// @ts-check
'use strict';
/* ============================================================
   clientes.js
   renderClientes(), filterClients(), goHistorico()
============================================================ */

// ─── CLIENTES ────────────────────────────────────────────────
function renderClientes(data){
  $('clientTbody').innerHTML=(data||CLIENTES).map(c=>`
    <tr onclick="goHistorico('${c.id}')">
      <td><div class="cli-cell"><div class="cli-av">${c.ini}</div><div><div class="cli-name">${c.nome}</div><div class="cli-id">${c.id} · ${c.seg}</div></div></div></td>
      <td>${c.tel}</td>
      <td><a href="mailto:${c.email}" style="color:var(--ford-vivid)" onclick="event.stopPropagation()">${c.email}</a></td>
      <td>${c.ult}</td>
      <td><span class="pill ${c.status}">${cap(c.status)}</span></td>
      <td style="text-align:center;font-weight:700">${c.v}</td>
      <td class="ltv-v">${formatCurrency(c.ltv)}</td>
      <td><button class="btn-tbl" onclick="event.stopPropagation();goHistorico('${c.id}')">Acessar</button></td>
    </tr>`).join('');
}

function filterClients(){
  const q=$('clientSearch').value.toLowerCase(),s=$('clientStatus').value,o=$('clientOrder').value;
  let list=CLIENTES.filter(c=>(!q||c.nome.toLowerCase().includes(q)||c.email.toLowerCase().includes(q))&&(!s||c.status===s));
  if(o==='ltv')list=[...list].sort((a,b)=>b.ltv-a.ltv);
  renderClientes(list);
}

function goHistorico(id){logAccess(id);navigate('historico',document.querySelector('[data-module=historico]'));setTimeout(()=>selectClienteHistorico(id),120);}

