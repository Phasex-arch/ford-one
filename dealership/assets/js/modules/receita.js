/**
 * ============================================================
 * RECEITA — Módulo de Receita
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { formatCurrency } from '../core/utils.js';
import { drawPie, drawLine } from '../components/charts.js';
import { openKpi } from './dashboard.js';

/**
 * Inicializa o módulo de Receita
 */
export const initReceitaCharts = () => {
    renderReceitaKpis();
    setTimeout(() => {
        drawPie('receitaCateg', {
            labels: ['Vendas Novas', 'Seminovos', 'Serviços', 'Peças', 'F&I'],
            data: [52, 18, 16, 9, 5],
            colors: ['#1700f4', '#0a0f7a', '#10B981', '#F59E0B', '#8B5CF6']
        });

        drawLine('receitaTrim', {
            labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
            sets: [{ data: [2100, 2450, 2280, 2900, 3100], color: '#1700f4', fill: true }],
            unit: 'k'
        });
    }, 100);
};

/**
 * Renderiza os KPIs de Receita
 */
const renderReceitaKpis = () => {
    const container = document.getElementById('receitaKpis');

    const kpis = [
        { ic: 'ic-blue', fa: 'ph-currency-dollar', lbl: 'Receita', val: 'R$ 1.248.000', delta: 'este mês', cls: 'pos' },
        { ic: 'ic-green', fa: 'ph-check-circle', lbl: 'Confirmada', val: 'R$ 874.320', delta: '+8.3%', cls: 'pos' },
        { ic: 'ic-orange', fa: 'ph-users', lbl: 'Ticket Médio', val: 'R$ 48.600', delta: '+4.1%', cls: 'pos' },
        { ic: 'ic-purple', fa: 'ph-trend-up', lbl: 'Conversão', val: '34.2%', delta: '+2.1pp', cls: 'pos' }
    ];

    container.innerHTML = kpis.map(k => `
    <div class="kpi-card" onclick="window.openKpi('receita')">
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
window.initReceitaCharts = initReceitaCharts;