/**
 * ============================================================
 * DESEMPENHO — Módulo de Desempenho
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { drawBar, drawLine } from '../components/charts.js';
import { openKpi } from './dashboard.js';

/**
 * Inicializa o módulo de Desempenho
 */
export const initDesempenhoCharts = () => {
    renderDesempenhoKpis();
    setTimeout(() => {
        drawBar('consultorChart', {
            labels: ['Ricardo C.', 'Patrícia O.', 'Lucas M.', 'Amanda R.', 'Fernando B.'],
            data: [94, 87, 91, 78, 85],
            color: '#1700f4',
            unit: '%'
        });

        drawLine('retencaoChart', {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            sets: [{ data: [79, 81, 80, 83, 84, 84], color: '#10B981', fill: true }],
            unit: '%'
        });
    }, 100);
};

/**
 * Renderiza os KPIs de Desempenho
 */
const renderDesempenhoKpis = () => {
    const container = document.getElementById('desempKpis');

    const kpis = [
        { ic: 'ic-blue', fa: 'ph-users', lbl: 'Retenção', val: '84%', delta: '+3pp', cls: 'pos' },
        { ic: 'ic-orange', fa: 'ph-car', lbl: 'Giro', val: '28 dias', delta: '-4 dias', cls: 'pos' },
        { ic: 'ic-green', fa: 'ph-wrench', lbl: 'Produtividade', val: '91%', delta: 'Meta: 85%', cls: 'pos' },
        { ic: 'ic-purple', fa: 'ph-phone', lbl: 'Follow-up', val: '67%', delta: '-2pp vs meta', cls: 'neg' }
    ];

    container.innerHTML = kpis.map(k => `
    <div class="kpi-card" onclick="window.openKpi('${k.lbl.toLowerCase()}')">
      <div class="kpi-ic ${k.ic}"><i class="ph-bold ${k.fa}"></i></div>
      <div class="kpi-body">
        <span class="kpi-lbl">${k.lbl}</span>
        <span class="kpi-val">${k.val}</span>
        <span class="kpi-delta ${k.cls}">${k.delta}</span>
      </div>
    </div>
  `).join('');
};

// Exporta funções globais
window.initDesempenhoCharts = initDesempenhoCharts;