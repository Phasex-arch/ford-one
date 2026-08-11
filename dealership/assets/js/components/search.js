/**
 * ============================================================
 * SEARCH — Busca global
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { formatCurrency } from '../core/utils.js';
import { CLIENTES, ESTOQUE, LEADS } from '../services/data.js';
import { goHistorico } from '../modules/historico.js';
import { openEstoqueModal } from '../modules/estoque.js';
import { openLeadModal } from '../modules/leads.js';
import { navigate } from '../core/router.js';

/**
 * Índice de busca global
 */
const searchIndex = [
    ...CLIENTES.map(c => ({
        type: 'Cliente',
        label: c.nome,
        sub: c.email,
        action: () => {
            goHistorico(c.id);
        }
    })),
    ...ESTOQUE.map(e => ({
        type: 'Estoque',
        label: `${e.modelo} ${e.versao}`,
        sub: formatCurrency(e.preco),
        action: () => {
            navigate('estoque', document.querySelector('[data-module=estoque]'));
            setTimeout(() => openEstoqueModal(e.id), 180);
        }
    })),
    ...LEADS.map(l => ({
        type: 'Lead',
        label: l.cli,
        sub: l.nec,
        action: () => {
            navigate('leads', document.querySelector('[data-module=leads]'));
            setTimeout(() => openLeadModal(l.id), 180);
        }
    })),
    {
        type: 'Módulo',
        label: 'Metas',
        sub: 'Acompanhamento de metas',
        action: () => navigate('metas', document.querySelector('[data-module=metas]'))
    },
    {
        type: 'Módulo',
        label: 'Financiamentos',
        sub: 'Simulações e contratos',
        action: () => navigate('financiamentos', document.querySelector('[data-module=financiamentos]'))
    },
    {
        type: 'Módulo',
        label: 'Relatórios',
        sub: 'Exportações gerenciais',
        action: () => navigate('relatorios', document.querySelector('[data-module=relatorios]'))
    }
];

/**
 * Manipula a busca global
 * @param {Event} e - Evento de input
 */
export const handleSearch = (e) => {
    const input = e.target;
    const query = input.value.trim().toLowerCase();
    const box = document.getElementById('searchResults');

    if (query.length < 2) {
        box.classList.remove('active');
        return;
    }

    const hits = searchIndex.filter(x =>
        x.label.toLowerCase().includes(query) ||
        x.sub.toLowerCase().includes(query)
    ).slice(0, 7);

    if (!hits.length) {
        box.classList.remove('active');
        return;
    }

    box.__hits = hits;
    box.innerHTML = hits.map((h, i) => `
    <div class="sri" onclick="window.doSearch(${i})">
      <span class="sri-tag">${h.type}</span>
      <div>
        <strong>${h.label.replace(new RegExp(query, 'gi'), m => `<mark style="background:var(--ford-light);color:var(--ford-vivid);border-radius:2px">${m}</mark>`)}</strong>
        <small>${h.sub}</small>
      </div>
    </div>
  `).join('');

    box.classList.add('active');
};

/**
 * Executa uma ação de busca
 * @param {number} i - Índice do resultado
 */
export const doSearch = (i) => {
    const box = document.getElementById('searchResults');
    const input = document.getElementById('globalSearch');

    if (input) input.value = '';
    box.classList.remove('active');

    if (box.__hits?.[i]) {
        box.__hits[i].action();
    }
};

/**
 * Fecha os resultados da busca
 */
export const closeSearch = () => {
    setTimeout(() => {
        const box = document.getElementById('searchResults');
        if (box) box.classList.remove('active');
    }, 200);
};

// Exporta funções globais
window.doSearch = doSearch;