/**
 * ============================================================
 * FINANCIAMENTOS — Módulo de Financiamentos
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { formatCurrency } from '../core/utils.js';
import { FINANCIAMENTOS } from '../services/data.js';
import { openModal, closeModal } from '../components/modals.js';
import { showToast } from '../components/notifications.js';
import { openKpi } from './dashboard.js';

/**
 * Renderiza a lista de financiamentos
 */
export const renderFinanciamentos = () => {
    const container = document.getElementById('finContent');
    if (!container) return;

    const statusMap = {
        aprovado: { bg: 'var(--green-bg)', c: 'var(--green)', lbl: 'Aprovado' },
        analise: { bg: 'var(--orange-bg)', c: 'var(--gold)', lbl: 'Em Análise' },
        pendente: { bg: 'var(--ford-light)', c: 'var(--ford-vivid)', lbl: 'Pendente' },
        reprovado: { bg: 'var(--red-bg)', c: 'var(--red)', lbl: 'Reprovado' }
    };

    const totalCarteira = FINANCIAMENTOS.filter(f => f.status === 'aprovado').reduce((s, f) => s + f.valor, 0);
    const aprovados = FINANCIAMENTOS.filter(f => f.status === 'aprovado').length;

    const kpisHtml = `
    <div class="kpi-grid" style="margin-bottom:18px">
      ${[
            { lbl: 'Carteira Total', val: formatCurrency(totalCarteira), ic: 'ic-green', ph: 'ph-money' },
            { lbl: 'Contratos Ativos', val: String(aprovados), ic: 'ic-blue', ph: 'ph-file-text' },
            { lbl: 'Em Análise', val: String(FINANCIAMENTOS.filter(f => f.status === 'analise').length), ic: 'ic-orange', ph: 'ph-clock' },
            { lbl: 'Taxa Média', val: '1.54% a.m.', ic: 'ic-purple', ph: 'ph-percent' }
        ].map(k => `
        <div class="kpi-card" onclick="window.openKpi('receita')">
          <div class="kpi-ic ${k.ic}"><i class="ph-bold ${k.ph}" style="font-size:17px"></i></div>
          <div class="kpi-body">
            <span class="kpi-lbl">${k.lbl}</span>
            <span class="kpi-val sm">${k.val}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

    const cardsHtml = FINANCIAMENTOS.map(f => {
        const st = statusMap[f.status] || statusMap.pendente;
        return `
      <div class="fin-card" onclick="window.openContratoModal('${f.id}')">
        <div class="fin-card-head">
          <div>
            <div class="fin-client">${f.cli}</div>
            <div class="fin-veiculo">${f.veiculo}</div>
          </div>
          <div class="fin-status-tag ${f.status}" style="background:${st.bg};color:${st.c}">${st.lbl}</div>
        </div>
        <div class="fin-values">
          <div>
            <div class="fin-val-lbl">Valor</div>
            <div class="fin-val-num highlight">${formatCurrency(f.valor)}</div>
          </div>
          <div>
            <div class="fin-val-lbl">Entrada</div>
            <div class="fin-val-num">${formatCurrency(f.entrada)}</div>
          </div>
          <div>
            <div class="fin-val-lbl">Parcela / Prazo</div>
            <div class="fin-val-num">${formatCurrency(f.parcela)}<span style="font-size:10px;font-weight:500;color:var(--c-dim);margin-left:3px">${f.prazo}x</span></div>
          </div>
        </div>
        <div class="fin-footer">
          <span>Taxa: ${f.taxa}% a.m. · ${f.data}</span>
          <button class="btn-tbl" onclick="event.stopPropagation();window.openContratoModal('${f.id}')">Ver contrato</button>
        </div>
      </div>
    `;
    }).join('');

    container.innerHTML = `
    ${kpisHtml}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <h3 class="sec-title" style="margin-bottom:0">Contratos e Simulações</h3>
      <button class="btn-prim" onclick="window.openFinSimModal()">+ Nova Simulação</button>
    </div>
    <div class="fin-grid">${cardsHtml}</div>
  `;
};

/**
 * Abre o modal de contrato
 * @param {string} id - ID do financiamento
 */
export const openContratoModal = (id) => {
    const f = FINANCIAMENTOS.find(x => x.id === id);
    if (!f) return;

    const statusMap = { aprovado: 'Aprovado', analise: 'Em Análise', pendente: 'Pendente', reprovado: 'Reprovado' };
    const financiado = f.valor - f.entrada;
    const totalPago = f.entrada + f.parcela * f.prazo;

    const items = [
        ['Cliente', f.cli],
        ['Veículo', f.veiculo],
        ['Status', statusMap[f.status] || f.status],
        ['Valor do veículo', formatCurrency(f.valor)],
        ['Entrada', formatCurrency(f.entrada)],
        ['Valor financiado', formatCurrency(financiado)],
        ['Prazo', f.prazo + 'x de ' + formatCurrency(f.parcela)],
        ['Taxa mensal', f.taxa + '% a.m.'],
        ['Total pago', formatCurrency(Math.round(totalPago))],
        ['Data', f.data]
    ];

    const bodyHtml = `
    <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px">
      ${items.map(([l, v]) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 11px;background:var(--c-bg);border-radius:var(--rsm);font-size:var(--fs1)">
          <span style="color:var(--c-mid)">${l}</span>
          <strong style="color:var(--ford-vivid)">${v}</strong>
        </div>
      `).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-prim" onclick="closeModal('kpiModal');showToast('Contrato enviado por e-mail.','success')" style="flex:1">Enviar por e-mail</button>
    </div>
  `;

    openKpi('contrato_' + id);
    // Usa o modal de KPI para exibir
    const modalTitle = document.getElementById('kpiModalTitle');
    const modalBody = document.getElementById('kpiModalBody');
    if (modalTitle) modalTitle.textContent = 'Contrato ' + f.id;
    if (modalBody) modalBody.innerHTML = bodyHtml;
    openModal('kpiModal');
};

/**
 * Abre o modal de simulação de financiamento
 */
export const openFinSimModal = () => {
    openModal('finSimModal');
    calcFin();
};

/**
 * Abre simulação a partir do estoque
 * @param {string} eid - ID do veículo
 */
export const openFinSimFromEstoque = (eid) => {
    const e = ESTOQUE.find(x => x.id === eid);
    if (!e) return;

    closeModal('estoqueModal');
    setTimeout(() => {
        document.getElementById('finVei').value = `${e.modelo} ${e.versao}`;
        document.getElementById('finValor').value = e.preco;
        calcFin();
        openModal('finSimModal');
    }, 220);
};

/**
 * Calcula a simulação de financiamento
 */
export const calcFin = () => {
    const valor = parseFloat(document.getElementById('finValor')?.value || 0);
    const entrada = parseFloat(document.getElementById('finEntrada')?.value || 0);
    const prazo = parseInt(document.getElementById('finPrazo')?.value || 48);
    const taxa = parseFloat(document.getElementById('finTaxa')?.value || 1.49) / 100;
    const res = document.getElementById('finResult');

    if (!res) return;
    if (!valor || valor <= entrada) {
        res.innerHTML = '<span style="color:var(--red)">Valor inválido.</span>';
        return;
    }

    const financiado = valor - entrada;
    const parcela = (financiado * (taxa * Math.pow(1 + taxa, prazo))) / (Math.pow(1 + taxa, prazo) - 1);
    const totalPago = entrada + parcela * prazo;
    const juros = totalPago - valor;

    res.innerHTML = `
    <strong>${formatCurrency(Math.round(parcela))}/mês</strong>
    ${[
            ['Valor financiado', formatCurrency(financiado)],
            ['Total de parcelas', prazo + 'x de ' + formatCurrency(Math.round(parcela))],
            ['Total pago', formatCurrency(Math.round(totalPago))],
            ['Total em juros', formatCurrency(Math.round(juros))]
        ].map(([l, v]) => `
      <div style="display:flex;justify-content:space-between;font-size:var(--fs1);margin-top:6px">
        <span style="color:var(--c-mid)">${l}</span>
        <strong>${v}</strong>
      </div>
    `).join('')}
  `;
};

/**
 * Salva uma simulação de financiamento
 */
export const saveFinSim = () => {
    const cli = document.getElementById('finCli')?.value.trim() || '(sem nome)';
    const vei = document.getElementById('finVei')?.value.trim() || '(sem veículo)';
    const valor = parseFloat(document.getElementById('finValor')?.value || 0);
    const entrada = parseFloat(document.getElementById('finEntrada')?.value || 0);
    const prazo = parseInt(document.getElementById('finPrazo')?.value || 48);
    const taxa = parseFloat(document.getElementById('finTaxa')?.value || 1.49);

    const financiado = valor - entrada;
    const t = taxa / 100;
    const parcela = Math.round((financiado * (t * Math.pow(1 + t, prazo))) / (Math.pow(1 + t, prazo) - 1));

    FINANCIAMENTOS.unshift({
        id: 'F' + Date.now(),
        cli,
        ini: cli.split(' ').map(n => n[0]).slice(0, 2).join(''),
        veiculo: vei,
        valor,
        entrada,
        prazo,
        taxa,
        parcela,
        status: 'pendente',
        data: 'Agora'
    });

    closeModal('finSimModal');
    renderFinanciamentos();
    showToast(`Simulação salva: ${cli} · ${formatCurrency(parcela)}/mês`, 'success');
};

// Exporta funções globais
window.openContratoModal = openContratoModal;
window.openFinSimModal = openFinSimModal;
window.openFinSimFromEstoque = openFinSimFromEstoque;
window.calcFin = calcFin;
window.saveFinSim = saveFinSim;