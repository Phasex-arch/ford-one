/**
 * ============================================================
 * CLIENTES — Módulo de Clientes
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { cap, formatCurrency } from '../core/utils.js';
import { CLIENTES } from '../services/data.js';
import { goHistorico } from './historico.js';
import { openModal, closeModal } from '../components/modals.js';
import { showToast } from '../components/notifications.js';

/**
 * Renderiza a lista de clientes
 * @param {Array} data - Lista de clientes (opcional)
 */
export const renderClientes = (data) => {
    const tbody = document.getElementById('clientTbody');
    if (!tbody) {
        console.warn('Elemento #clientTbody não encontrado');
        return;
    }

    const list = data || CLIENTES;

    tbody.innerHTML = list.map(c => `
    <tr onclick="window.goHistorico('${c.id}')">
      <td>
        <div class="cli-cell">
          <div class="cli-av">${c.ini}</div>
          <div>
            <div class="cli-name">${c.nome}</div>
            <div class="cli-id">${c.id} · ${c.seg}</div>
          </div>
        </div>
      </td>
      <td>${c.tel}</td>
      <td><a href="mailto:${c.email}" style="color:var(--ford-vivid)" onclick="event.stopPropagation()">${c.email}</a></td>
      <td>${c.ult}</td>
      <td><span class="pill ${c.status}">${cap(c.status)}</span></td>
      <td style="text-align:center;font-weight:700">${c.v}</td>
      <td class="ltv-v">${formatCurrency(c.ltv)}</td>
      <td><button class="btn-tbl" onclick="event.stopPropagation();window.goHistorico('${c.id}')">Acessar</button></td>
    </tr>
  `).join('');
};

/**
 * Filtra a lista de clientes
 */
export const filterClients = () => {
    const q = document.getElementById('clientSearch')?.value?.toLowerCase() || '';
    const status = document.getElementById('clientStatus')?.value || '';
    const order = document.getElementById('clientOrder')?.value || '';

    let list = CLIENTES.filter(c => {
        const matchName = c.nome.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchStatus = !status || c.status === status;
        return (matchName || matchEmail) && matchStatus;
    });

    if (order === 'ltv') {
        list = [...list].sort((a, b) => b.ltv - a.ltv);
    } else if (order === 'ult') {
        list = [...list].sort((a, b) => {
            const da = new Date(a.ult.split('/').reverse().join('/'));
            const db = new Date(b.ult.split('/').reverse().join('/'));
            return db - da;
        });
    }

    renderClientes(list);
};

/**
 * Abre o modal de novo cliente
 */
export const openNovoClienteModal = () => {
    openModal('novoClienteModal');
};

/**
 * Salva um novo cliente
 */
export const salvarNovoCliente = () => {
    const nome = document.getElementById('ncNome')?.value?.trim();
    const tel = document.getElementById('ncTel')?.value?.trim();
    const email = document.getElementById('ncEmail')?.value?.trim();
    const seg = document.getElementById('ncSegmento')?.value || 'Padrao';
    const status = document.getElementById('ncStatus')?.value || 'potencial';

    if (!nome || !tel || !email) {
        showToast('Preencha nome, telefone e e-mail.', 'warning');
        return;
    }

    const ini = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const newId = 'C' + (100 + CLIENTES.length + 1);

    CLIENTES.push({
        id: newId,
        nome,
        tel,
        email,
        ult: new Date().toLocaleDateString('pt-BR'),
        status,
        v: 0,
        ltv: 0,
        ini,
        seg
    });

    closeModal('novoClienteModal');
    ['ncNome', 'ncTel', 'ncEmail', 'ncObs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    renderClientes();
    showToast(`Cliente ${nome.split(' ')[0]} cadastrado!`, 'success');
};

// ─── EXPOSIÇÃO GLOBAL ─────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.renderClientes = renderClientes;
    window.filterClients = filterClients;
    window.openNovoClienteModal = openNovoClienteModal;
    window.salvarNovoCliente = salvarNovoCliente;
}