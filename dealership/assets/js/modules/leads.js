/**
 * ============================================================
 * LEADS — Módulo de Leads Inteligentes
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { cap, formatCurrency } from '../core/utils.js';
import { LEADS, leadSchedule, SLOT_HOURS } from '../services/data.js';
import { openModal, closeModal } from '../components/modals.js';
import { showToast } from '../components/notifications.js';
import { getSlotsForDay } from './agenda.js';

let selectedSchedSlot = -1;
let schedLeadId = '';
let schedDayOffset = 0;

/**
 * Renderiza a barra de pipeline
 */
export const renderPipelineBar = () => {
    const pb = document.getElementById('pipelineBar');
    if (!pb) return;

    const total = LEADS.length;
    const urgentes = LEADS.filter(l => l.urg === 'urgente').length;
    const pipeline = LEADS.reduce((s, l) => s + l.val, 0);

    pb.innerHTML = `
    <div class="pipeline-item">
      <div class="pipeline-val">${total}</div>
      <div class="pipeline-lbl">Total de Leads</div>
    </div>
    <div class="pipeline-item">
      <div class="pipeline-val" style="color:var(--red)">${urgentes}</div>
      <div class="pipeline-lbl">Urgentes</div>
      <div class="pipeline-sub" style="color:var(--red)">Ação imediata</div>
    </div>
    <div class="pipeline-item">
      <div class="pipeline-val" style="color:var(--ford-vivid)">${formatCurrency(pipeline, true)}</div>
      <div class="pipeline-lbl">Pipeline Total</div>
    </div>
    <div class="pipeline-item">
      <div class="pipeline-val" style="color:var(--green)">${formatCurrency(Math.round(pipeline / total), true)}</div>
      <div class="pipeline-lbl">Ticket Médio</div>
    </div>
  `;
};

/**
 * Renderiza a lista de leads
 * @param {Array} data - Lista de leads (opcional)
 */
export const renderLeads = (data) => {
    const grid = document.getElementById('leadsGrid');
    const list = data || LEADS;

    grid.innerHTML = list.map(l => {
        const booked = leadSchedule[l.id] !== undefined;
        const bookInfo = booked ? leadSchedule[l.id] : null;
        const bookLabel = bookInfo
            ? `${getSlotsForDay(bookInfo.dayOffset)[bookInfo.slotIdx]?.hora || '–'} (${bookInfo.dayOffset === 0 ? 'Hoje' : bookInfo.dayOffset === 1 ? 'Amanhã' : '+' + bookInfo.dayOffset + 'd'})`
            : '';

        return `
      <div class="lead-card ${l.urg}" onclick="window.openLeadModal('${l.id}')">
        <div class="lead-head">
          <div class="lead-cli">
            <div class="cli-av">${l.ini}</div>
            <div>
              <div class="cli-name">${l.cli}</div>
              <div class="cli-id">${l.id}</div>
            </div>
          </div>
          <span class="urg-tag ${l.urg}">${cap(l.urg)}</span>
        </div>
        <div class="lead-vbox">
          <div class="lead-vlbl">Interesse em</div>
          <div class="lead-vname">${l.v}</div>
          <div class="lead-nec">${l.nec}</div>
        </div>
        <div class="lead-insight">
          <strong>Insight da IA</strong>${l.ins}
        </div>
        <div class="lead-foot">
          <div>
            <div class="lead-val-lbl">Valor estimado</div>
            <div class="lead-val">${formatCurrency(l.val)}</div>
          </div>
          <div class="lead-acts">
            ${booked ? `
              <div style="font-size:var(--fs0);color:var(--green);font-weight:600;display:flex;align-items:center;gap:4px;margin-bottom:4px">
                <i class="ph-bold ph-check-circle" style="font-size:12px"></i>${bookLabel}
              </div>
              <button class="btn-danger" style="height:28px;padding:0 11px;font-size:var(--fs0)" onclick="event.stopPropagation();window.cancelLeadSchedule('${l.id}')">Cancelar</button>
            ` : `
              <button class="btn-sec" onclick="event.stopPropagation();window.openLeadSchedule('${l.id}')">Agendar</button>
              <button class="btn-prim" onclick="event.stopPropagation();window.openLeadModal('${l.id}')">Atender lead</button>
            `}
          </div>
        </div>
      </div>
    `;
    }).join('');
};

/**
 * Filtra os leads
 */
export const filterLeads = () => {
    const urgency = document.getElementById('leadsFilter').value;
    const filtered = !urgency ? LEADS : LEADS.filter(l => l.urg === urgency);
    renderLeads(filtered);
};

/**
 * Abre o modal de lead
 * @param {string} id - ID do lead
 */
export const openLeadModal = (id) => {
    const l = LEADS.find(x => x.id === id);
    if (!l) return;

    const booked = leadSchedule[l.id] !== undefined;
    const bookInfo = booked ? leadSchedule[l.id] : null;
    const slotInfo = bookInfo ? getSlotsForDay(bookInfo.dayOffset)[bookInfo.slotIdx] : null;
    const dayLabel = bookInfo
        ? bookInfo.dayOffset === 0 ? 'Hoje' : bookInfo.dayOffset === 1 ? 'Amanhã' : '+' + bookInfo.dayOffset + ' dias'
        : '';

    const content = document.getElementById('leadModalContent');
    content.innerHTML = `
    <div style="padding:24px 24px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:11px">
          <div class="cli-av" style="width:40px;height:40px;font-size:var(--fs3)">${l.ini}</div>
          <div>
            <div style="font-size:20px;font-weight:700;color:var(--c-text)">${l.cli}</div>
            <div style="font-size:var(--fs0);color:var(--c-mid)">${l.tel}</div>
          </div>
        </div>
        <span class="urg-tag ${l.urg}" style="font-size:var(--fs1);padding:4px 12px">${cap(l.urg)}</span>
      </div>
      ${booked ? `
        <div style="padding:10px 13px;background:var(--green-bg);border-radius:var(--rsm);border-left:3px solid var(--green);font-size:var(--fs1);margin-bottom:14px;color:var(--green);font-weight:600">
          Agendado — ${slotInfo ? slotInfo.hora : '–'} · ${dayLabel}
        </div>
      ` : ''}
    </div>
    <div class="m-body" style="padding-top:0">
      <div class="m-sec">
        <div class="m-sec-title">Oportunidade</div>
        <div class="m-grid">
          <div><div class="mf-lbl">Veículo</div><div class="mf-val">${l.v}</div></div>
          <div><div class="mf-lbl">Necessidade</div><div class="mf-val">${l.nec}</div></div>
          <div><div class="mf-lbl">Valor Estimado</div><div class="mf-val" style="font-size:22px;font-weight:700;color:var(--ford-blue)">${formatCurrency(l.val)}</div></div>
          <div><div class="mf-lbl">Lead</div><div class="mf-val">${l.id}</div></div>
        </div>
      </div>
      <div class="m-sec">
        <div class="m-sec-title">Insight IA</div>
        <div style="background:var(--ford-light);border-left:4px solid var(--ford-vivid);border-radius:var(--rsm);padding:12px 14px;font-size:var(--fs1);color:var(--c-mid);line-height:1.6">${l.ins}</div>
      </div>
      <div class="m-sec" style="margin-bottom:0">
        <div class="m-sec-title">Ações</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-sec" onclick="window.atenderLead('${l.id}')">Ligar agora</button>
          ${booked ? `
            <button class="btn-danger" onclick="window.cancelLeadSchedule('${l.id}');closeModal('leadModal')">Cancelar agendamento</button>
          ` : `
            <button class="btn-sec" onclick="closeModal('leadModal');window.openLeadSchedule('${l.id}')">Agendar visita</button>
          `}
          <button class="btn-prim" onclick="window.assumirLead('${l.id}')">Assumir lead</button>
        </div>
      </div>
    </div>
  `;

    openModal('leadModal');
};

/**
 * Abre o agendamento de lead
 * @param {string} leadId - ID do lead
 */
export const openLeadSchedule = (leadId) => {
    const l = LEADS.find(x => x.id === leadId);
    if (!l) return;

    schedLeadId = leadId;
    schedDayOffset = 0;

    const content = document.getElementById('scheduleModalContent');
    content.innerHTML = buildLeadSchedHTML(l, 0);
    openModal('scheduleModal');
};

/**
 * Constrói o HTML de agendamento de lead
 * @param {Object} l - Lead
 * @param {number} dayOff - Offset de dias
 * @returns {string} HTML
 */
const buildLeadSchedHTML = (l, dayOff) => {
    const slotDay = getSlotsForDay(dayOff);
    const d = new Date();
    d.setDate(d.getDate() + dayOff);
    const dayLabel = dayOff === 0 ? 'Hoje' : dayOff === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

    const slotsHtml = slotDay.map((sl, i) => {
        const taken = sl.apts.some(a => !a.cancelled);
        return `
      <div class="sched-slot${taken ? ' taken' : ''}" onclick="${taken ? '' : "window.selectSchedSlot(this," + i + ")"}" data-idx="${i}">
        <span class="sh">${sl.hora}</span>
        <span>${taken ? 'Ocupado' : 'Livre'}</span>
      </div>
    `;
    }).join('');

    return `
    <div style="padding:20px">
      <h3 style="font-size:21px;font-weight:700;color:var(--c-text);margin-bottom:4px">Agendar — ${l.cli}</h3>
      <p style="font-size:var(--fs1);color:var(--c-mid);margin-bottom:14px">Lead: <strong>${l.v}</strong></p>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <button class="icon-btn" onclick="window.shiftSchedDay(-1)"><i class="ph-bold ph-caret-left"></i></button>
        <span style="font-size:var(--fs2);font-weight:600;color:var(--c-text);min-width:120px;text-align:center">${dayLabel}</span>
        <button class="icon-btn" onclick="window.shiftSchedDay(1)"><i class="ph-bold ph-caret-right"></i></button>
      </div>
      <div class="m-sec-title">Horário</div>
      <div class="sched-grid" id="leadSchedGrid">${slotsHtml}</div>
      <div class="m-form" style="margin-top:14px">
        <label>Consultor / Técnico
          <select id="schedTech">
            <option value="">Sem técnico designado</option>
            ${TECNICOS.map(t => `<option>${t.nome}</option>`).join('')}
          </select>
        </label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn-sec" onclick="closeModal('scheduleModal')">Cancelar</button>
        <button class="btn-prim" onclick="window.confirmLeadSchedule('${l.id}')">Confirmar Agendamento</button>
      </div>
    </div>
  `;
};

/**
 * Seleciona um slot de agendamento
 * @param {HTMLElement} el - Elemento do slot
 * @param {number} idx - Índice do slot
 */
export const selectSchedSlot = (el, idx) => {
    document.querySelectorAll('#leadSchedGrid .sched-slot:not(.taken)').forEach(s => s.classList.remove('sel'));
    el.classList.add('sel');
    selectedSchedSlot = parseInt(el.dataset.idx);
};

/**
 * Desloca o dia do agendamento
 * @param {number} d - Direção do deslocamento
 */
export const shiftSchedDay = (d) => {
    schedDayOffset = Math.max(0, schedDayOffset + d);
    const l = LEADS.find(x => x.id === schedLeadId);
    if (!l) return;

    const container = document.getElementById('scheduleModalContent');
    if (container) container.innerHTML = buildLeadSchedHTML(l, schedDayOffset);
};

/**
 * Confirma o agendamento do lead
 * @param {string} leadId - ID do lead
 */
export const confirmLeadSchedule = (leadId) => {
    if (selectedSchedSlot < 0) {
        showToast('Selecione um horário.', 'warning');
        return;
    }

    const l = LEADS.find(x => x.id === leadId);
    if (!l) return;

    const daySlots = getSlotsForDay(schedDayOffset);
    let tech = document.getElementById('schedTech')?.value?.trim() || '';

    if (tech) {
        const busy = getTechBusySlotsForDay(schedDayOffset, tech);
        if (busy.has(selectedSchedSlot)) {
            const nextFree = daySlots.findIndex((s, i) => i > selectedSchedSlot && !busy.has(i) && !s.apts.some(a => !a.cancelled));
            if (nextFree > -1) {
                showToast(`${tech} ocupado. Reagendando para ${daySlots[nextFree].hora}.`, 'warning');
                selectedSchedSlot = nextFree;
            } else {
                showToast('Sem disponibilidade neste dia para este técnico.', 'warning');
                selectedSchedSlot = -1;
                closeModal('scheduleModal');
                return;
            }
        }
    } else {
        const assigned = pickAvailableTechForDay(schedDayOffset, selectedSchedSlot);
        if (!assigned) {
            showToast('Todos os técnicos ocupados neste horário.', 'warning');
            selectedSchedSlot = -1;
            closeModal('scheduleModal');
            return;
        }
        tech = assigned;
    }

    daySlots[selectedSchedSlot].apts.push({
        cli: l.cli,
        type: l.v,
        tech,
        cls: '',
        cancelled: false
    });

    leadSchedule[leadId] = {
        dayOffset: schedDayOffset,
        slotIdx: selectedSchedSlot
    };

    const hora = daySlots[selectedSchedSlot].hora;
    const dayLabel = schedDayOffset === 0 ? 'hoje' : schedDayOffset === 1 ? 'amanhã' : '+' + schedDayOffset + 'd';
    selectedSchedSlot = -1;
    closeModal('scheduleModal');
    renderLeads();

    const mod = window.getCurrentModule ? window.getCurrentModule() : '';
    if (mod === 'agenda') {
        window.renderAgendaDay?.();
        window.updateCapacity?.();
    }

    showToast(`Agendado: ${l.cli} às ${hora} (${dayLabel}) com ${tech}!`, 'success');
};

/**
 * Cancela o agendamento do lead
 * @param {string} leadId - ID do lead
 */
export const cancelLeadSchedule = (leadId) => {
    const info = leadSchedule[leadId];
    if (!info) return;

    const l = LEADS.find(x => x.id === leadId);
    const daySlots = getSlotsForDay(info.dayOffset);
    const apt = daySlots[info.slotIdx]?.apts.find(a => a.cli === l?.cli && !a.cancelled);
    if (apt) apt.cancelled = true;

    delete leadSchedule[leadId];

    if (window.getCurrentModule?.() === 'agenda') {
        window.renderAgendaDay?.();
        window.updateCapacity?.();
    }
    renderLeads();
    showToast('Agendamento cancelado.', 'warning');
};

/**
 * Atende um lead (liga agora)
 * @param {string} leadId - ID do lead
 */
export const atenderLead = (leadId) => {
    showToast('Ligação registrada!', 'info');
    closeModal('leadModal');
};

/**
 * Assume um lead
 * @param {string} leadId - ID do lead
 */
export const assumirLead = (leadId) => {
    showToast('Lead assumido!', 'success');
    closeModal('leadModal');
};

// Exporta funções globais
window.filterLeads = filterLeads;
window.openLeadModal = openLeadModal;
window.openLeadSchedule = openLeadSchedule;
window.selectSchedSlot = selectSchedSlot;
window.shiftSchedDay = shiftSchedDay;
window.confirmLeadSchedule = confirmLeadSchedule;
window.cancelLeadSchedule = cancelLeadSchedule;
window.atenderLead = atenderLead;
window.assumirLead = assumirLead;