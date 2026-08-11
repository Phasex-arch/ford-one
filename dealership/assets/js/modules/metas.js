/**
 * ============================================================
 * METAS — Módulo de Metas
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { formatCurrency, formatNumber } from '../core/utils.js';
import { METAS } from '../services/data.js';
import { openModal, closeModal } from '../components/modals.js';
import { showToast } from '../components/notifications.js';

/**
 * Renderiza as metas
 */
export const renderMetas = () => {
    const container = document.getElementById('metasContent');
    if (!container) return;

    const cardsHtml = METAS.map(m => {
        const pct = Math.min(Math.round(m.lowerIsBetter ? (m.alvo / m.atual) * 100 : (m.atual / m.alvo) * 100), 100);
        const st = getMetaStatus(m);

        return `
      <div class="meta-card">
        <div class="meta-header">
          <div class="meta-title">${m.titulo}</div>
          <div class="meta-period">${m.periodo}</div>
        </div>
        <div class="meta-values">
          <div>
            <div style="font-size:10px;color:var(--c-dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">Realizado</div>
            <div class="meta-atual">${fmtMetaVal(m, m.atual)}</div>
          </div>
          <div class="meta-alvo">Meta<span>${fmtMetaVal(m, m.alvo)}</span></div>
        </div>
        <div class="meta-bar-wrap">
          <div class="meta-bar-track">
            <div class="meta-bar-fill ${st.cls}" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="meta-footer">
          <div class="meta-pct" style="color:${pct >= 100 ? 'var(--green)' : pct >= 85 ? 'var(--ford-vivid)' : pct >= 60 ? 'var(--orange)' : 'var(--red)'}">${pct}%</div>
          <div class="meta-status-tag ${st.tag}">${st.label}</div>
        </div>
        <div style="font-size:10px;color:var(--c-dim);margin-top:8px;display:flex;align-items:center;gap:4px">
          <i class="ph-bold ph-user" style="font-size:11px"></i>${m.responsavel}
        </div>
      </div>
    `;
    }).join('');

    const rankHtml = `
    <div class="metas-ranking" style="margin-top:20px">
      <div class="metas-ranking-head"><i class="ph-bold ph-medal"></i> Ranking de Consultores — Abril/2025</div>
      ${[
            { nome: 'Ricardo Costa', ini: 'RC', pct: 94, vendas: 8, rec: 'R$ 412k' },
            { nome: 'Patrícia Oliveira', ini: 'PO', pct: 78, vendas: 6, rec: 'R$ 287k' },
            { nome: 'Lucas Mendes', ini: 'LM', pct: 71, vendas: 5, rec: 'R$ 241k' },
            { nome: 'Amanda Rocha', ini: 'AR', pct: 43, vendas: 3, rec: 'R$ 128k' }
        ].map((r, i) => `
        <div class="rank-row">
          <div class="rank-pos ${['gold', 'silver', 'bronze', ''][i]}">${i + 1}</div>
          <div class="cli-av" style="flex-shrink:0">${r.ini}</div>
          <div style="flex:1;min-width:0">
            <div class="rank-name">${r.nome}</div>
            <div class="rank-sub">${r.vendas} vendas · ${r.rec}</div>
          </div>
          <div class="rank-bar-wrap">
            <div class="rank-bar-track">
              <div class="rank-bar-fill" style="width:${r.pct}%"></div>
            </div>
            <div class="rank-pct">${r.pct}%</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

    container.innerHTML = `<div class="metas-row">${cardsHtml}</div>${rankHtml}`;
};

/**
 * Retorna o status da meta
 * @param {Object} m - Meta
 * @returns {Object} Status com classe e label
 */
const getMetaStatus = (m) => {
    const pct = m.lowerIsBetter ? (m.alvo / m.atual) * 100 : (m.atual / m.alvo) * 100;
    if (pct >= 100) return { cls: 'exceeded', tag: 'tag-exceeded', label: 'Meta atingida' };
    if (pct >= 85) return { cls: 'on-track', tag: 'tag-on-track', label: 'No caminho' };
    if (pct >= 60) return { cls: 'at-risk', tag: 'tag-at-risk', label: 'Em risco' };
    return { cls: 'behind', tag: 'tag-behind', label: 'Abaixo' };
};

/**
 * Formata o valor da meta
 * @param {Object} m - Meta
 * @param {number} v - Valor
 * @returns {string} Valor formatado
 */
const fmtMetaVal = (m, v) => {
    if (m.indicador === 'receita') return formatCurrency(v);
    if (m.unidade === '%') return v + '%';
    if (m.unidade === 'h') return v + 'h';
    return formatNumber(v) + ' ' + m.unidade;
};

/**
 * Abre o modal de nova meta
 */
export const openMetaModal = () => {
    openModal('metaModal');
};

/**
 * Adiciona uma nova meta
 */
export const addMeta = () => {
    const tipo = document.getElementById('metaTipo').value;
    const resp = document.getElementById('metaResponsavel').value.trim();
    const val = parseFloat(document.getElementById('metaValor').value);
    const per = document.getElementById('metaPeriodo').value;

    if (!resp || !val || !per) {
        showToast('Preencha todos os campos.', 'warning');
        return;
    }

    const labels = { vendas: 'Vendas', receita: 'Receita', leads: 'Leads', nps: 'NPS', sla: 'SLA' };

    METAS.push({
        id: 'M' + Date.now(),
        titulo: labels[tipo] || tipo,
        periodo: per,
        indicador: tipo,
        atual: 0,
        alvo: val,
        unidade: tipo === 'receita' ? 'R$' : tipo === 'sla' ? 'h' : '',
        responsavel: resp,
        lowerIsBetter: tipo === 'sla'
    });

    closeModal('metaModal');
    renderMetas();
    showToast('Meta criada com sucesso!', 'success');
};

// Exporta funções globais
window.openMetaModal = openMetaModal;
window.addMeta = addMeta;