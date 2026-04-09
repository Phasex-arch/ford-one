// @ts-check
'use strict';
/* ============================================================
   config.js
   setTheme(), saveCfg(), saveMetas(), toggle change handler
============================================================ */

// ─── CONFIGURAÇÕES ───────────────────────────────────────────
function setTheme(t){
  document.documentElement.setAttribute('data-theme',t);localStorage.setItem('fo-theme',t);
  $('themeLight').classList.toggle('active',t==='light');$('themeDark').classList.toggle('active',t==='dark');
  setTimeout(()=>{if(curMod==='dashboard')initDashCharts();if(curMod==='receita')initReceitaCharts();if(curMod==='desempenho')initDesempenhoCharts();},60);
  showToast(`Tema ${t==='dark'?'escuro':'claro'} ativado.`,'success');
}
function saveCfg()  {showToast('Dados da concessionária salvos!','success');}
function saveMetas(){showToast('Metas padrão atualizadas!','success');}
document.addEventListener('change',e=>{const item=e.target.closest('.toggle-item');if(item&&item.closest('#notifToggles')){const lbl=item.querySelector('span').textContent,on=item.querySelector('input').checked;showToast(`Notificação "${lbl}" ${on?'ativada':'desativada'}.`,'info');}});

