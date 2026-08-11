/**
 * ============================================================
 * DASHBOARD — Módulo do Dashboard
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { formatCurrency, formatNumber, todayStr } from '../core/utils.js';
import { drawLine, drawBar, drawPie } from '../components/charts.js';
import { DASH_DATA } from '../services/data.js';

let dashPeriod = 'mes';

/**
 * Inicializa o Dashboard
 */
export const initDashboard = () => {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = todayStr();

    renderDashKpis('mes');
    setTimeout(initDashCharts, 200);
};

/**
 * Filtra o período do Dashboard
 */
export const filterDashPeriod = () => {
    dashPeriod = document.getElementById('dashPeriod').value;
    renderDashKpis(dashPeriod);
    setTimeout(initDashCharts, 50);
};

/**
 * Renderiza os KPIs do Dashboard
 * @param {string} period - Período selecionado
 */
export const renderDashKpis = (period) => {
    const data = DASH_DATA[period] || DASH_DATA.mes;
    const container = document.getElementById('dashKpis');

    const kpis = [
        { ic: 'ic-blue', fa: 'ph-lightning', lbl: 'Leads do Dia', val: formatNumber(data.leads), delta: '+8%', cls: 'pos', key: 'leads' },
        { ic: 'ic-teal', fa: 'ph-calendar-dots', lbl: 'Agendamentos', val: formatNumber(data.ag), delta: '+3', cls: 'pos', key: 'agendamentos' },
        { ic: 'ic-green', fa: 'ph-currency-dollar', lbl: 'Receita', val: formatCurrency(data.rec), delta: '+12.4%', cls: 'pos', key: 'receita' },
        { ic: 'ic-orange', fa: 'ph-trend-up', lbl: 'Conversão', val: data.conv.toFixed(1) + '%', delta: '+2.1pp', cls: 'pos', key: 'conversao' },
        { ic: 'ic-purple', fa: 'ph-clock', lbl: 'SLA Médio', val: data.sla.toFixed(1) + 'h', delta: '-0.4h', cls: 'pos', key: 'sla' },
        { ic: 'ic-gold', fa: 'ph-star', lbl: 'Avaliação', val: data.nota.toFixed(1), delta: 'Top 5%', cls: 'pos', key: 'nota' },
        { ic: 'ic-navy', fa: 'ph-car', lbl: 'Estoque', val: data.estq.toString(), delta: '+7', cls: 'neu', key: 'estoque' }
    ];

    container.innerHTML = kpis.map(k => `
    <div class="kpi-card" onclick="window.openKpi('${k.key}')">
      <div class="kpi-ic ${k.ic}"><i class="ph-bold ${k.fa}"></i></div>
      <div class="kpi-body">
        <span class="kpi-lbl">${k.lbl}</span>
        <span class="kpi-val">${k.val}</span>
        <span class="kpi-delta ${k.cls}">${k.delta}</span>
      </div>
    </div>
  `).join('');
};

/**
 * Inicializa os gráficos do Dashboard
 */
const initDashCharts = () => {
    // Gráfico de Receita Mensal
    drawLine('revenueChart', {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        sets: [
            {
                data: [820, 910, 870, 1050, 980, 1120, 1080, 1200, 1150, 1320, 1280, 1400],
                color: '#1700f4',
                fill: true
            },
            {
                data: [900, 900, 900, 1000, 1000, 1000, 1100, 1100, 1100, 1200, 1200, 1200],
                color: '#F59E0B',
                dashed: true
            }
        ],
        unit: 'k'
    });

    // Gráfico de Conversão de Leads
    drawBar('conversionChart', {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        data: [28, 31, 29, 34, 32, 34],
        color: '#1700f4',
        unit: '%'
    });
};

/**
 * Abre um KPI em modal
 * @param {string} key - Chave do KPI
 */
export const openKpi = (key) => {
    const map = {
        leads: () => kpiModal('Leads do Dia', [
            ['Urgente', '4', 'var(--red)'],
            ['Alta', '9', 'var(--orange)'],
            ['Média', '10', 'var(--ford-vivid)'],
            ['Total hoje', '23', 'var(--c-mid)']
        ]),
        agendamentos: () => kpiModal('Agendamentos', [
            ['Confirmados', '12', 'var(--green)'],
            ['Pendentes', '4', 'var(--orange)'],
            ['Cancelados', '2', 'var(--red)'],
            ['Total', '18', 'var(--c-mid)']
        ]),
        receita: () => kpiModal('Receita', [
            ['Meta mensal', 'R$ 1.200.000', 'var(--c-mid)'],
            ['Previsto', 'R$ 1.248.000', 'var(--ford-vivid)'],
            ['Confirmado', 'R$ 874.320', 'var(--green)'],
            ['Ticket médio', 'R$ 48.600', 'var(--c-mid)']
        ]),
        conversao: () => kpiModal('Taxa de Conversão', [
            ['Walk-in', '41%', 'var(--c-mid)'],
            ['Online Lead', '28%', 'var(--c-mid)'],
            ['Indicação', '52%', 'var(--green)'],
            ['Retenção', '67%', 'var(--ford-vivid)']
        ]),
        sla: () => kpiModal('SLA Médio', [
            ['Revisões rápidas', '1.4h', 'var(--green)'],
            ['Reparos gerais', '2.8h', 'var(--orange)'],
            ['Funilaria/Pintura', '5.2h', 'var(--c-mid)'],
            ['Média geral', '2.3h', 'var(--ford-vivid)']
        ]),
        nota: () => kpiModal('Nota da Concessionária', [
            ['NPS', '72', 'var(--ford-vivid)'],
            ['Satisfação pós-serviço', '4.9', 'var(--ford-vivid)'],
            ['Atendimento', '4.7', 'var(--ford-vivid)'],
            ['Prazo', '4.6', 'var(--ford-vivid)']
        ]),
        estoque: () => kpiModal('Veículos em Estoque', [
            ['SUVs', '48', 'var(--ford-vivid)'],
            ['Picapes', '61', 'var(--orange)'],
            ['Sedans/Hatches', '18', 'var(--purple)'],
            ['Elétricos/Híbridos', '15', 'var(--green)'],
            ['Total', '142', 'var(--c-mid)']
        ])
    };

    if (map[key]) map[key]();
};

/**
 * Renderiza um modal de KPI
 * @param {string} title - Título do modal
 * @param {Array} items - Itens do KPI
 */
const kpiModal = (title, items) => {
    const modalTitle = document.getElementById('kpiModalTitle');
    const modalBody = document.getElementById('kpiModalBody');

    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) {
        modalBody.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${items.map(([l, n, c]) => kpiRow(l, n, c)).join('')}
      </div>
    `;
    }

    openModal('kpiModal');
};

/**
 * Renderiza uma linha de KPI
 * @param {string} label - Label do item
 * @param {string} value - Valor do item
 * @param {string} color - Cor do valor
 * @returns {string} HTML da linha
 */
const kpiRow = (label, value, color) => `
  <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 11px;background:var(--c-bg);border-radius:var(--rsm);font-size:var(--fs1)">
    <span style="color:var(--c-mid)">${label}</span>
    <strong style="color:${color}">${value}</strong>
  </div>
`;

// Exporta funções globais para uso em onclick
window.openKpi = openKpi;
window.filterDashPeriod = filterDashPeriod;