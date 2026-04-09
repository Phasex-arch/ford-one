// @ts-check
'use strict';
/* ============================================================
   init.js — inicialização do app e resize handler.
   Executado pelo html-loader.js DEPOIS que todo o HTML e
   todos os módulos JS foram carregados.
   Por isso NÃO usa DOMContentLoaded — o DOM já existe.
============================================================ */

// ─── RESIZE ─────────────────────────────────────────────────
let resizeTm;
window.addEventListener('resize', () => {
  clearTimeout(resizeTm);
  resizeTm = setTimeout(() => {
    if (curMod === 'dashboard')  initDashCharts();
    if (curMod === 'receita')    initReceitaCharts();
    if (curMod === 'desempenho') initDesempenhoCharts();
  }, 280);
});

// ─── INIT ───────────────────────────────────────────────────
// Executa diretamente — DOM e todos os módulos já estão prontos
(function init() {
  const saved = localStorage.getItem('fo-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  $('themeLight').classList.toggle('active', saved === 'light');
  $('themeDark').classList.toggle('active', saved === 'dark');
  initDashboard();
  renderClientes();
  $('estoqueGrid').innerHTML = '';
  renderEstoque();
})();
