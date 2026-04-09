// @ts-check
'use strict';
/* ============================================================
   navigation.js
   navigate(), sidebar toggle e eventos: closeMobile(), closeDD(),
   udAction(), markAllNotifsRead()
============================================================ */

// ─── NAVIGATION ──────────────────────────────────────────────
function navigate(mod,el){
  document.querySelectorAll('.module').forEach(m=>m.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const s=$('mod-'+mod);if(s)s.classList.add('active');
  if(el)el.classList.add('active');
  curMod=mod;
  if(window.innerWidth<=768)closeMobile();
  closeDD('notifDropdown');closeDD('userDropdown');
  ({
    clientes:      renderClientes,
    historico:     renderHistorico,
    estoque:       ()=>{$('estoqueGrid').innerHTML='';renderEstoque();},
    leads:         ()=>{renderPipelineBar();renderLeads();},
    agenda:        renderAgenda,
    servicos:      ()=>renderServicos('previstos'),
    avaliacao:     renderAvaliacao,
    receita:       ()=>setTimeout(initReceitaCharts,90),
    desempenho:    ()=>setTimeout(initDesempenhoCharts,90),
    metas:         renderMetas,
    financiamentos:renderFinanciamentos,
    relatorios:    renderRelatorios,
  })[mod]?.();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ─── SIDEBAR ─────────────────────────────────────────────────
$('sidebarToggle').addEventListener('click',()=>{
  const sb=$('sidebar'),mc=$('mainContent');
  if(window.innerWidth<=768){sb.classList.toggle('mobile-open');$('sidebarOverlay').style.display=sb.classList.contains('mobile-open')?'block':'none';}
  else{sb.classList.toggle('collapsed');mc.classList.toggle('expanded');}
});
function closeMobile(){$('sidebar').classList.remove('mobile-open');$('sidebarOverlay').style.display='none';}

function closeDD(id){$(id)?.classList.remove('open');}
$('notifBtn').addEventListener('click',e=>{e.stopPropagation();$('notifDropdown').classList.toggle('open');closeDD('userDropdown');});
$('userMenuBtn').addEventListener('click',e=>{e.stopPropagation();$('userDropdown').classList.toggle('open');closeDD('notifDropdown');});
document.addEventListener('click',()=>{closeDD('notifDropdown');closeDD('userDropdown');});

function udAction(a){
  closeDD('userDropdown');
  if(a==='perfil')openKpi('perfil');
  else if(a==='senha')openKpi('senha');
  else if(a==='sair'){showToast('Sessão encerrada. Até logo!','info');setTimeout(()=>{document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#00095b;color:white;font-family:Inter,sans-serif;font-size:18px;letter-spacing:2px;font-weight:600">FORD ONE — SESSÃO ENCERRADA</div>';},1200);}
}

function markAllNotifsRead(){
  document.querySelectorAll('#notifList .notif-row').forEach(r=>{r.classList.remove('unread');const d=r.querySelector('.ndot');if(d)d.classList.add('read');});
  const b=$('notifBadge');if(b)b.style.display='none';
  showToast('Todas as notificações marcadas como lidas','success');
}

