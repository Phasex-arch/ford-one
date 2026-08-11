/**
 * ============================================================
 * AGENDA — Módulo de Agenda
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { cap } from '../core/utils.js';
import { TECNICOS, SLOT_HOURS, DAILY_SLOTS } from '../services/data.js';
import { openModal, closeModal } from '../components/modals.js';
import { showToast } from '../components/notifications.js';

let agOffset = 0;
let SLOTS = [];
let selectedSchedSlot = -1;

/**
 * Obtém os slots para um dia
 * @param {number} offset - Offset de dias
 * @returns {Array} Slots do dia
 */
export const getSlotsForDay = (offset) => {
    if (!DAILY_SLOTS[offset]) {
        DAILY_SLOTS[offset] = SLOT_HOURS.map(h => ({ hora: h, apts: [] }));
    }
    return DAILY_SLOTS[offset];
};

/**
 * Obtém os slots ocupados por um técnico
 * @param {number} dayOff - Offset de dias
 * @param {string} techName - Nome do técnico
 * @returns {Set} Conjunto de índices ocupados
 */
export const getTechBusySlotsForDay = (dayOff, techName) => {
    const slots = getSlotsForDay(dayOff);
    const busy = new Set();
    slots.forEach((sl, i) => {
        if (sl.apts.some(a => !a.cancelled && a.tech === techName)) {
            for (let k = 0; k < 2; k++) {
                if (i + k < slots.length) busy.add(i + k);
            }
        }
    });
    return busy;
};

/**
 * Escolhe um técnico disponível
 * @param {number} dayOff - Offset de dias
 * @param {number} slotIdx - Índice do slot
 * @returns {string|null} Nome do técnico ou null
 */
export const pickAvailableTechForDay = (dayOff, slotIdx) => {
    const free = TECNICOS.filter(t => !getTechBusySlotsForDay(dayOff, t.nome).has(slotIdx));
    return free.length ? free[Math.floor(Math.random() * free.length)].nome : null;
};

/**
 * Renderiza a agenda
 */
export const renderAgenda = () => {
    SLOTS = getSlotsForDay(agOffset);
    renderTecnicos();
    updateCapacity();
    renderAgendaDay();
};

/**
 * Renderiza a lista de técnicos
 */
const renderTecnicos = () => {
    const list = document.getElementById('tecnicosList');
    list.innerHTML = TECNICOS.map(t => `
    <div class="tec-row">
      <div class="tec-av">${t.ini}</div>
      <div style="flex:1">
        <div class="tec-name">${t.nome}</div>
        <div class="tec-esp">${t.esp}</div>
      </div>
      <div class="tec-dot ${t.status}" title="${cap(t.status)}"></div>
    </div>
  `).join('');
};

/**
 * Atualiza a capacidade do dia
 */
export const updateCapacity = () => {
    const active = SLOTS.reduce((n, sl) => n + sl.apts.filter(a => !a.cancelled).length, 0);
    const total = 18;
    const pct = Math.round((active / total) * 100);

    const fill = document.getElementById('capFill');
    if (fill) fill.style.width = pct + '%';

    const label = document.getElementById('capLabel');
    if (label) label.textContent = `${active}/${total} vagas`;

    const info = document.getElementById('capInfo');
    if (info) {
        info.textContent = `${pct}% ocupado`;
        info.style.color = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--orange)' : 'var(--green)';
    }
};

/**
 * Renderiza o dia da agenda
 */
export const renderAgendaDay = () => {
    const d = new Date();
    d.setDate(d.getDate() + agOffset);

    const title = document.getElementById('agendaDayTitle');
    if (title) {
        title.textContent = `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
    }

    const slots = document.getElementById('agendaSlots');
    slots.innerHTML = SLOTS.map((sl, si) => {
        const isEmpty = sl.apts.filter(a => !a.cancelled).length === 0;
        return `
      <div class="agenda-slot">
        <div class="slot-t">${sl.hora}</div>
        <div class="slot-c">
          ${sl.apts.map((a, ai) => {
            if (a.cancelled) {
                return `<div class="apt cancelled"><div class="apt-cli">${a.cli}</div><div class="apt-type" style="text-decoration:line-through">${a.type}</div><div class="apt-tech" style="color:var(--red)">Cancelado</div></div>`;
            }
            return `
              <div class="apt ${a.cls}">
                <div class="apt-cli">${a.cli}</div>
                <div class="apt-type">${a.type}</div>
                <div class="apt-tech">${a.tech ? 'Técnico: ' + a.tech : 'Consultor comercial'}</div>
                <button class="apt-x" onclick="event.stopPropagation();window.cancelApt(${si},${ai})">
                  <i class="ph-bold ph-x" style="font-size:9px"></i>
                </button>
              </div>
            `;
        }).join('')}
          ${isEmpty ? '<span class="slot-empty">Disponível</span>' : ''}
        </div>
      </div>
    `;
    }).join('');
};

/**
 * Cancela um agendamento
 * @param {number} si - Índice do slot
 * @param {number} ai - Índice do agendamento
 */
export const cancelApt = (si, ai) => {
    SLOTS[si].apts[ai].cancelled = true;
    renderAgendaDay();
    updateCapacity();
    showToast('Agendamento cancelado.', 'warning');
};

/**
 * Desloca o dia da agenda
 * @param {number} d - Direção do deslocamento
 */
export const shiftDay = (d) => {
    agOffset += d;
    SLOTS = getSlotsForDay(agOffset);
    const dt = new Date();
    dt.setDate(dt.getDate() + agOffset);

    const title = document.getElementById('agendaDayTitle');
    if (title) {
        title.textContent = `${DAYS[dt.getDay()]}, ${dt.getDate()} de ${MONTHS[dt.getMonth()]}`;
    }
    renderAgendaDay();
    updateCapacity();
};

/**
 * Abre o modal de agendamento
 * @param {number} slotIdx - Índice do slot (opcional)
 */
export const openScheduleModal = (slotIdx) => {
    selectedSchedSlot = slotIdx >= 0 ? slotIdx : -1;

    const slotsHtml = SLOTS.map((sl, i) => {
        const taken = sl.apts.some(a => !a.cancelled);
        const presel = i === slotIdx;
        return `
      <div class="sched-slot${taken ? ' taken' : ''}${presel ? ' sel' : ''}" onclick="${taken ? '' : "window.selectAgSlot(this," + i + ")"}" data-idx="${i}">
        <span class="sh">${sl.hora}</span>
        <span>${taken ? 'Ocupado' : 'Livre'}</span>
      </div>
    `;
    }).join('');

    const content = document.getElementById('scheduleModalContent');
    content.innerHTML = `
    <div style="padding:20px">
      <h3 style="font-size:21px;font-weight:700;color:var(--c-text);margin-bottom:5px">Novo Agendamento</h3>
      <p style="font-size:var(--fs1);color:var(--c-mid);margin-bottom:16px">Selecione o horário e preencha os dados.</p>
      <div class="m-sec-title">Horário</div>
      <div class="sched-grid" id="agSchedGrid">${slotsHtml}</div>
      <div class="m-form" style="margin-top:14px">
        <label>Cliente<input type="text" id="agSchedCli" placeholder="Nome do cliente"></label>
        <label>Serviço<input type="text" id="agSchedServ" placeholder="Tipo de serviço ou veículo"></label>
        <label>Técnico
          <select id="agSchedTech">
            <option value="">Sem técnico designado</option>
            ${TECNICOS.map(t => `<option>${t.nome}</option>`).join('')}
          </select>
        </label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn-sec" onclick="closeModal('scheduleModal')">Cancelar</button>
        <button class="btn-prim" onclick="window.confirmAgendaSchedule()">Confirmar</button>
      </div>
    </div>
  `;

    document.querySelectorAll('#agSchedGrid .sched-slot:not(.taken)').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('#agSchedGrid .sched-slot:not(.taken)').forEach(s => s.classList.remove('sel'));
            el.classList.add('sel');
            selectedSchedSlot = parseInt(el.dataset.idx);
        });
    });

    openModal('scheduleModal');
};

/**
 * Seleciona um slot de agendamento
 * @param {HTMLElement} el - Elemento do slot
 * @param {number} idx - Índice do slot
 */
export const selectAgSlot = (el, idx) => {
    document.querySelectorAll('#agSchedGrid .sched-slot:not(.taken)').forEach(s => s.classList.remove('sel'));
    el.classList.add('sel');
    selectedSchedSlot = idx;
};

/**
 * Confirma o agendamento na agenda
 */
export const confirmAgendaSchedule = () => {
    if (selectedSchedSlot < 0) {
        showToast('Selecione um horário.', 'warning');
        return;
    }

    const cli = document.getElementById('agSchedCli')?.value.trim();
    const serv = document.getElementById('agSchedServ')?.value.trim();
    let tech = document.getElementById('agSchedTech')?.value || '';

    if (!cli || !serv) {
        showToast('Preencha cliente e serviço.', 'warning');
        return;
    }

    if (!tech) {
        const assigned = pickAvailableTechForDay(agOffset, selectedSchedSlot);
        if (!assigned) {
            showToast('Sem técnico disponível neste horário.', 'warning');
            return;
        }
        tech = assigned;
    } else {
        const busy = getTechBusySlotsForDay(agOffset, tech);
        if (busy.has(selectedSchedSlot)) {
            const nf = SLOTS.findIndex((s, i) => i > selectedSchedSlot && !busy.has(i) && !s.apts.some(a => !a.cancelled));
            if (nf > -1) {
                showToast(`${tech} ocupado. Reagendado para ${SLOTS[nf].hora}.`, 'warning');
                selectedSchedSlot = nf;
            } else {
                showToast('Sem disponibilidade.', 'warning');
                closeModal('scheduleModal');
                return;
            }
        }
    }

    if (SLOTS[selectedSchedSlot].apts.filter(a => !a.cancelled).length > 0) {
        showToast('Horário já ocupado.', 'warning');
        return;
    }

    SLOTS[selectedSchedSlot].apts.push({
        cli,
        type: serv,
        tech,
        cls: '',
        cancelled: false
    });

    const hora = SLOTS[selectedSchedSlot].hora;
    selectedSchedSlot = -1;
    closeModal('scheduleModal');
    renderAgendaDay();
    updateCapacity();
    showToast(`Agendado: ${cli} às ${hora} com ${tech || 'técnico a designar'}!`, 'success');
};

// Exporta funções globais
window.shiftDay = shiftDay;
window.openScheduleModal = openScheduleModal;
window.selectAgSlot = selectAgSlot;
window.confirmAgendaSchedule = confirmAgendaSchedule;
window.cancelApt = cancelApt;
window.renderAgendaDay = renderAgendaDay;
window.updateCapacity = updateCapacity;