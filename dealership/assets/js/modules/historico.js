/**
 * ============================================================
 * HISTÓRICO — Módulo de Histórico
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { cap, formatCurrency, nowStr } from '../core/utils.js';
import { CLIENTES, VEICULOS, accessLog } from '../services/data.js';
import { openVehicleModal } from './estoque.js';
import { renderClientes } from './clientes.js';
import { navigate } from '../core/router.js';
import { openModal, closeModal } from '../components/modals.js';
import { showToast } from '../components/notifications.js';

/**
 * Registra acesso a um cliente
 * @param {string} cid - ID do cliente
 */
export const logAccess = (cid) => {
    if (accessLog.clientes.find(x => x.id === cid)) return;
    const c = CLIENTES.find(x => x.id === cid);
    if (!c) return;

    accessLog.clientes.push({
        id: cid,
        nome: c.nome,
        ini: c.ini,
        hora: nowStr()
    });
};

/**
 * Registra acesso a um veículo
 * @param {string} vid - ID do veículo
 * @param {string} modelo - Modelo do veículo
 * @param {string} cliName - Nome do cliente
 * @param {string} cid - ID do cliente
 */
export const logVehicleAccess = (vid, modelo, cliName, cid) => {
    if (accessLog.veiculos.find(x => x.id === vid)) return;

    accessLog.veiculos.push({
        id: vid,
        cid: cid || '',
        modelo,
        cli: cliName,
        hora: nowStr()
    });
};

/**
 * Renderiza o histórico
 */
export const renderHistorico = () => {
    // Clientes acessados
    const cc = document.getElementById('histClientChips');
    if (cc) {
        cc.innerHTML = accessLog.clientes.length
            ? accessLog.clientes.map(a => `
        <div class="chip" onclick="window.goHistorico('${a.id}')">
          <div class="chip-av">${a.ini}</div>
          <span>${a.nome}</span>
          <span class="chip-t">${a.hora}</span>
        </div>
      `).join('')
            : '<span class="chip-empty">Nenhum cliente acessado hoje.</span>';
    }

    // Veículos acessados
    const cv = document.getElementById('histVehicleChips');
    if (cv) {
        cv.innerHTML = accessLog.veiculos.length
            ? accessLog.veiculos.map(a => `
        <div class="chip" style="cursor:pointer" onclick="window.openVehicleModal('${a.cid}','${a.id}')">
          <i class="ph-bold ph-car" style="font-size:12px;color:var(--ford-vivid);flex-shrink:0"></i>
          <span>${a.modelo}</span>
          <span style="font-size:var(--fs0);color:var(--c-dim)">${a.cli}</span>
          <span class="chip-t">${a.hora}</span>
        </div>
      `).join('')
            : '<span class="chip-empty">Nenhum veículo acessado hoje.</span>';
    }

    const detail = document.getElementById('histClientDetail');
    if (detail) detail.style.display = 'none';
};

/**
 * Navega para o histórico de um cliente
 * @param {string} cid - ID do cliente
 */
export const goHistorico = (cid) => {
    logAccess(cid);
    navigate('historico', document.querySelector('[data-module=historico]'));
    setTimeout(() => selectClienteHistorico(cid), 120);
};

/**
 * Seleciona um cliente no histórico
 * @param {string} cid - ID do cliente
 * @param {boolean} scroll - Se deve rolar para o cliente
 */
export const selectClienteHistorico = (cid, scroll) => {
    const c = CLIENTES.find(x => x.id === cid);
    if (!c) return;

    const summary = document.getElementById('clientSummary');
    if (summary) {
        summary.innerHTML = `
      <div class="csb-item"><div class="csb-lbl">Cliente</div><div class="csb-val" style="font-size:var(--fs3)">${c.nome}</div></div>
      <div class="csb-item"><div class="csb-lbl">Status</div><div class="csb-val"><span class="pill ${c.status}">${cap(c.status)}</span></div></div>
      <div class="csb-item"><div class="csb-lbl">Segmento</div><div class="csb-val">${c.seg}</div></div>
      <div class="csb-item"><div class="csb-lbl">Veículos</div><div class="csb-val">${c.v}</div></div>
      <div class="csb-item"><div class="csb-lbl">LTV Total</div><div class="csb-val" style="color:var(--green)">${formatCurrency(c.ltv)}</div></div>
      <div class="csb-item"><div class="csb-lbl">Telefone</div><div class="csb-val" style="font-size:var(--fs3)">${c.tel}</div></div>
    `;
    }

    const veics = VEICULOS[cid] || [];
    const grid = document.getElementById('vehiclesGrid');
    if (!grid) return;

    if (!veics.length) {
        grid.innerHTML = '<p style="color:var(--c-dim);font-size:var(--fs1);padding:14px 0">Nenhum veículo registrado.</p>';
    } else {
        grid.innerHTML = '';
        veics.forEach(v => {
            const card = document.createElement('div');
            card.className = `vh-card${v.atual ? ' atual' : ''}`;

            // Imagem do veículo
            let imgHtml = '';
            if (v.img) {
                imgHtml = `<img src="${v.img}" alt="${v.modelo}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`;
            } else {
                imgHtml = `
          <div class="vh-ph">
            <i class="ph-bold ph-car" style="font-size:38px"></i>
            <span>${v.modelo}</span>
          </div>
        `;
            }

            card.innerHTML = `
        ${v.atual ? '<div class="vh-banner">Veículo Atual</div>' : ''}
        <div class="vh-img">${imgHtml}</div>
        <div class="vh-body">
          <div class="vh-model">${v.modelo}</div>
          <div class="vh-ver">${v.versao}</div>
          <div class="vh-meta">
            <div><div class="vm-lbl">Ano</div><div class="vm-val">${v.ano}</div></div>
            <div><div class="vm-lbl">KM</div><div class="vm-val">${v.km} km</div></div>
            <div><div class="vm-lbl">Aquisição</div><div class="vm-val">${v.aq}</div></div>
            <div><div class="vm-lbl">Status</div><div class="vm-val"><span class="pill ${v.status === 'ativo' ? 'ativo-v' : v.status}">${cap(v.status)}</span></div></div>
          </div>
        </div>
        <div class="vh-foot">
          <span class="vh-foot-txt">Último: <strong>${v.ult}</strong></span>
          <button class="btn-tbl">Ver detalhes</button>
        </div>
      `;

            card.addEventListener('click', () => openVehicleModal(cid, v.id));
            const btn = card.querySelector('.btn-tbl');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openVehicleModal(cid, v.id);
                });
            }
            grid.appendChild(card);
        });
    }

    const detail = document.getElementById('histClientDetail');
    if (detail) detail.style.display = 'block';

    if (scroll) {
        setTimeout(() => {
            detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    }
};

/**
 * Fecha o detalhe do cliente
 */
export const fecharHistoricoCliente = () => {
    const detail = document.getElementById('histClientDetail');
    if (detail) detail.style.display = 'none';
    renderClientes();
};

/**
 * Limpa o histórico
 */
export const clearHistory = () => {
    accessLog.clientes = [];
    accessLog.veiculos = [];
    closeModal('confirmModal');
    renderHistorico();
    showToast('Histórico de acessos apagado.', 'success');
};

// ─── EXPOSIÇÃO GLOBAL ─────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.goHistorico = goHistorico;
    window.fecharHistoricoCliente = fecharHistoricoCliente;
    window.clearHistory = clearHistory;
    window.openVehicleModal = openVehicleModal;
}