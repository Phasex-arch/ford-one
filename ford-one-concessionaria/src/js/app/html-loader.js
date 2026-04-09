'use strict';
/* ============================================================
   html-loader.js
   1. Injeta os HTML parciais (header, sidebar, sections, modals)
   2. Carrega os JS modulares em sequência via loadScript()
   Dessa forma o DOM existe antes de qualquer JS rodar.
============================================================ */

const PARTIALS = [
  { id: 'header-placeholder',  url: 'src/html/partials/header.html'  },
  { id: 'sidebar-placeholder', url: 'src/html/partials/sidebar.html' },
];

const SECTIONS = [
  'dashboard','clientes','historico','estoque','leads',
  'agenda','servicos','metas','financiamentos','receita',
  'avaliacao','desempenho','relatorios','config',
];

const MODALS = [
  'vehicle-modal','estoque-modal','lead-modal','schedule-modal',
  'kpi-modal','avaliacao-modal','confirmacao-modal','finsim-modal',
  'meta-modal','nova-os-modal','novo-cliente-modal','export-modal',
  'os-delete-modal','os-detail-modal','os-edit-modal',
];

// JS modulares — ordem obrigatória de dependência
const JS_MODULES = [
  // 1. Tipos JSDoc
  'src/js/types.js',
  // 2. Utilitários (cap, formatCurrency, nowStr, etc.)
  'src/js/core/utils.js',
  // 3. Dados mockados (CLIENTES, VEICULOS, ESTOQUE, etc.)
  'src/js/data/dados.js',
  // 4. Navegação e sidebar
  'src/js/navigation.js',
  // 5. Dashboard
  'src/js/modules/dashboard.js',
  // 6. Charts (drawLine, drawBar, drawPie)
  'src/js/charts/charts.js',
  // 7. Módulos de negócio
  'src/js/modules/clientes.js',
  'src/js/modules/historico.js',
  'src/js/modules/vehicle-modal.js',
  'src/js/modules/estoque.js',
  'src/js/modules/leads.js',
  'src/js/modules/lead-schedule.js',
  'src/js/modules/agenda.js',
  'src/js/modules/servicos.js',
  'src/js/modules/avaliacao.js',
  'src/js/modules/config.js',
  'src/js/modules/metas.js',
  'src/js/modules/financiamentos.js',
  'src/js/modules/relatorios.js',
  'src/js/modules/nova-os.js',
  'src/js/modules/novo-cliente.js',
  'src/js/modules/agenda-shift.js',
  'src/js/modules/tech-conflict.js',
  'src/js/modules/search.js',
  // 8. Core: modal e toast
  'src/js/core/modal.js',
  'src/js/core/toast.js',
  // 9. Bootstrap (DOMContentLoaded + resize)
  'src/js/app/init.js',
];

async function fetchHTML(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status + ' — ' + url);
  return r.text();
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload  = resolve;
    s.onerror = () => reject(new Error('Falha: ' + src));
    document.head.appendChild(s);
  });
}

async function main() {
  try {
    // 1. Injeta header e sidebar
    for (const p of PARTIALS) {
      const el = document.getElementById(p.id);
      if (el) el.innerHTML = await fetchHTML(p.url);
    }

    // 2. Injeta todas as sections
    const sp = document.getElementById('sections-placeholder');
    if (sp) {
      const res = await Promise.allSettled(
        SECTIONS.map(s => fetchHTML('src/html/sections/' + s + '.html'))
      );
      sp.innerHTML = res.map((r, i) => {
        if (r.status === 'fulfilled') return r.value;
        console.error('[Ford One] Section faltando:', SECTIONS[i]);
        return '';
      }).join('\n');
    }

    // 3. Injeta todos os modais
    const mp = document.getElementById('modals-placeholder');
    if (mp) {
      const res = await Promise.allSettled(
        MODALS.map(m => fetchHTML('src/html/modals/' + m + '.html'))
      );
      mp.innerHTML = res.map((r, i) => {
        if (r.status === 'fulfilled') return r.value;
        console.error('[Ford One] Modal faltando:', MODALS[i]);
        return '';
      }).join('\n');
    }

    // 4. Carrega JS modulares EM SEQUÊNCIA — DOM já existe
    for (const src of JS_MODULES) {
      await loadScript(src);
    }

    console.log('[Ford One] ✅ Pronto');

  } catch (err) {
    console.error('[Ford One] Erro:', err);
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  min-height:100vh;font-family:Inter,sans-serif;gap:14px;text-align:center;
                  padding:32px;background:#f3f4f8">
        <div style="font-size:48px">⚠️</div>
        <h2 style="font-size:20px;font-weight:700">Ford One precisa de um servidor HTTP</h2>
        <p style="color:#4b5268;max-width:420px">Execute no terminal:</p>
        <code style="background:#e2e5ef;padding:10px 20px;border-radius:8px;font-size:14px;font-family:monospace">
          python3 -m http.server 8080
        </code>
        <p style="color:#9196ae;font-size:13px">Acesse <strong>http://localhost:8080</strong></p>
      </div>`;
  }
}

main();
