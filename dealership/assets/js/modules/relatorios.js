/**
 * ============================================================
 * RELATÓRIOS — Módulo de Relatórios
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { openModal } from '../components/modals.js';

/**
 * Renderiza a lista de relatórios
 */
export const renderRelatorios = () => {
    const container = document.getElementById('relatoriosContent');
    if (!container) return;

    const rels = [
        { icon: 'ic-blue', ph: 'ph-chart-bar', titulo: 'Relatório de Vendas', desc: 'Resumo mensal de vendas, ticket médio, metas e comparativo com período anterior.', ult: '21/04/2025', src: 'vendas' },
        { icon: 'ic-teal', ph: 'ph-users', titulo: 'Clientes', desc: 'Base completa de clientes, LTV, segmentos, status e histórico de atendimento.', ult: '22/04/2025', src: 'clientes' },
        { icon: 'ic-green', ph: 'ph-money', titulo: 'DRE Gerencial', desc: 'Demonstração de resultado simplificada com receita, custo e margem operacional.', ult: '01/04/2025', src: 'dre' },
        { icon: 'ic-orange', ph: 'ph-lightning', titulo: 'Pipeline de Leads', desc: 'Evolução dos leads por status, canal e consultor responsável.', ult: '22/04/2025', src: 'leads' },
        { icon: 'ic-purple', ph: 'ph-star', titulo: 'NPS e Satisfação', desc: 'Análise de avaliações, NPS por consultor e período, e comparativo de estrelas.', ult: '15/04/2025', src: 'nps' },
        { icon: 'ic-navy', ph: 'ph-wrench', titulo: 'Relatório de Serviços', desc: 'Ordens de serviço, SLA, técnicos e faturamento da área de pós-venda.', ult: '20/04/2025', src: 'servicos' },
        { icon: 'ic-gold', ph: 'ph-car', titulo: 'Giro de Estoque', desc: 'Tempo médio de permanência, modelos parados e projeção de reposição.', ult: '18/04/2025', src: 'estoque' },
        { icon: 'ic-navy', ph: 'ph-ranking', titulo: 'Performance de Consultores', desc: 'Ranking individual, metas, conversão e receita gerada por consultor.', ult: '01/04/2025', src: 'consultores' },
        { icon: 'ic-green', ph: 'ph-credit-card', titulo: 'Carteira de Financiamentos', desc: 'Contratos ativos, taxas médias, parcelas e inadimplência do período.', ult: '10/04/2025', src: 'financiamentos' },
        { icon: 'ic-gold', ph: 'ph-target', titulo: 'Metas e Performance', desc: 'Acompanhamento de metas mensais, anuais, ranking e desvios por consultor.', ult: '21/04/2025', src: 'metas' }
    ];

    container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <p style="font-size:var(--fs1);color:var(--c-mid)">Selecione um relatório para exportar.</p>
      <button class="btn-prim" onclick="window.abrirPDF()"><i class="ph-bold ph-arrow-square-out"></i> Exportar Todos</button>
    </div>
    <div class="rel-grid">
      ${rels.map(r => `
        <div class="rel-card" onclick="window.exportarRelatorio('${r.src}')">
          <div class="kpi-ic ${r.icon}" style="width:40px;height:40px;flex-shrink:0"><i class="ph-bold ${r.ph}" style="font-size:18px"></i></div>
          <div style="flex:1;min-width:0">
            <div class="rel-title">${r.titulo}</div>
            <div class="rel-desc">${r.desc}</div>
          </div>
          <div class="rel-footer">
            <span class="rel-last">Ult.: ${r.ult}</span>
            <button class="rel-btn" onclick="event.stopPropagation();window.exportarRelatorio('${r.src}')">
              <i class="ph-bold ph-arrow-square-out" style="font-size:11px;margin-right:4px"></i>Exportar
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

/**
 * Abre o modal de exportação
 * @param {string} source - Fonte do relatório
 */
export const exportarRelatorio = (source) => {
    const titles = {
        clientes: 'Clientes',
        leads: 'Leads Inteligentes',
        metas: 'Metas',
        dashboard: 'Dashboard',
        vendas: 'Vendas',
        servicos: 'Serviços',
        estoque: 'Estoque',
        financiamentos: 'Financiamentos'
    };

    const title = document.getElementById('exportModalTitle');
    const subtitle = document.getElementById('exportModalSubtitle');

    if (title) title.textContent = 'Exportar — ' + (titles[source] || source);
    if (subtitle) subtitle.textContent = 'Selecione o formato de exportação';

    openModal('exportModal');
};

/**
 * Abre o PDF (simulação)
 */
export const abrirPDF = () => {
    closeModal('exportModal');
    window.open('assets/documentation/Ford One.pdf', '_blank');
};

// Exporta funções globais
window.exportarRelatorio = exportarRelatorio;
window.abrirPDF = abrirPDF;