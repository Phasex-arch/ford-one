// @ts-check
'use strict';
/* ============================================================
   search.js
   SIDX[], doSearch(), evento input da busca global
============================================================ */

// ─── BUSCA GLOBAL ────────────────────────────────────────────
const SIDX=[
  ...CLIENTES.map(c=>({type:'Cliente',label:c.nome,sub:c.email,action:()=>{logAccess(c.id);navigate('historico',document.querySelector('[data-module=historico]'));setTimeout(()=>selectClienteHistorico(c.id),120);}})),
  ...ESTOQUE.map(e=>({type:'Estoque',label:`${e.modelo} ${e.versao}`,sub:formatCurrency(e.preco),action:()=>{navigate('estoque',document.querySelector('[data-module=estoque]'));setTimeout(()=>openEstoqueModal(e.id),180);}})),
  ...LEADS.map(l=>({type:'Lead',label:l.cli,sub:l.nec,action:()=>{navigate('leads',document.querySelector('[data-module=leads]'));setTimeout(()=>openLeadModal(l.id),180);}})),
  {type:'Módulo',label:'Metas',sub:'Acompanhamento de metas',action:()=>navigate('metas',document.querySelector('[data-module=metas]'))},
  {type:'Módulo',label:'Financiamentos',sub:'Simulações e contratos',action:()=>navigate('financiamentos',document.querySelector('[data-module=financiamentos]'))},
  {type:'Módulo',label:'Relatórios',sub:'Exportações gerenciais',action:()=>navigate('relatorios',document.querySelector('[data-module=relatorios]'))},
];
$('globalSearch').addEventListener('input',function(){
  const q=this.value.trim().toLowerCase(),box=$('searchResults');
  if(q.length<2){box.classList.remove('active');return;}
  const hits=SIDX.filter(x=>x.label.toLowerCase().includes(q)||x.sub.toLowerCase().includes(q)).slice(0,7);
  if(!hits.length){box.classList.remove('active');return;}
  box.__hits=hits;
  box.innerHTML=hits.map((h,i)=>`<div class="sri" onclick="doSearch(${i})"><span class="sri-tag">${h.type}</span><div><strong>${h.label.replace(new RegExp(q,'gi'),m=>`<mark style="background:var(--ford-light);color:var(--ford-vivid);border-radius:2px">${m}</mark>`)}</strong><small>${h.sub}</small></div></div>`).join('');
  box.classList.add('active');
});
function doSearch(i){const box=$('searchResults');$('globalSearch').value='';box.classList.remove('active');if(box.__hits?.[i])box.__hits[i].action();}
$('globalSearch').addEventListener('blur',()=>setTimeout(()=>$('searchResults').classList.remove('active'),200));

