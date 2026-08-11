/**
 * ============================================================
 * SERVIÇOS — Módulo de Serviços
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { cap } from '../core/utils.js';
import { SERVICOS, TECNICOS } from '../services/data.js';
import { openModal, closeModal } from '../components/modals.js';
import { showToast } from '../components/notifications.js';

let activeOSTab = 'previstos';

/**
 * Renderiza a lista de serviços
 * @param {string} tab - Aba selecionada
 */
export const renderServicos = (tab) => {
    activeOSTab = tab || activeOSTab;
    updateTabCounts();

    const list = SERVICOS[activeOSTab] || [];
    const content = document.getElementById('servicosContent');

    if (!list.length) {
        content.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--c-dim)">
        <i class="ph-bold ph-check-circle" style="font-size:36px;margin-bottom:10px;display:block;color:var(--green)"></i>
        <div style="font-weight:600">Nenhuma OS nesta categoria</div>
      </div>
    `;
        return;
    }

    content.innerHTML = `
    <div class="os-list">
      ${list.map((s, i) => `
        <div class="os-card" onclick="window.openOSModal('${activeOSTab}',${i})">
          <div class="os-num">${s.num}</div>
          <div style="min-width:0">
            <div class="os-cname">${s.c}</div>
            <div class="os-cveh">${s.v}</div>
          </div>
          <div class="os-type">${s.t}</div>
          <div class="os-tech"><i class="ph-bold ph-wrench" style="font-size:11px;margin-right:3px"></i>${s.tech}</div>
          <div class="os-prazo ${s.pc}"><i class="ph-bold ph-clock" style="font-size:11px;margin-right:3px"></i>${s.prazo}</div>
          <div class="os-val">${s.val}</div>
          <div class="os-actions" onclick="event.stopPropagation()">
            <button class="os-act-btn" title="Editar" onclick="window.openOSEditModal('${activeOSTab}',${i})">
              <i class="ph-bold ph-pencil-simple"></i>
            </button>
            ${activeOSTab !== 'concluidos' ? `
              <button class="os-act-btn" title="Avançar etapa" onclick="window.moverOS('${activeOSTab}',${i})">
                <i class="ph-bold ph-arrow-right"></i>
              </button>
            ` : ''}
            <button class="os-act-btn danger" title="Excluir" onclick="window.deletarOS('${activeOSTab}',${i})">
              <i class="ph-bold ph-trash"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

/**
 * Atualiza os contadores das abas
 */
const updateTabCounts = () => {
    const btns = document.querySelectorAll('.tab-btn');
    const counts = {
        previstos: SERVICOS.previstos.length,
        andamento: SERVICOS.andamento.length,
        concluidos: SERVICOS.concluidos.length
    };

    const tabs = ['previstos', 'andamento', 'concluidos'];
    btns.forEach((btn, i) => {
        const ct = btn.querySelector('.tab-ct');
        if (ct && tabs[i]) ct.textContent = counts[tabs[i]];
    });
};

/**
 * Alterna a aba de serviços
 * @param {HTMLElement} btn - Botão clicado
 * @param {string} tab - Nome da aba
 */
export const switchTab = (btn, tab) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderServicos(tab);
};

/**
 * Abre o modal de detalhe da OS
 * @param {string} tab - Nome da aba
 * @param {number} idx - Índice da OS
 */
export const openOSModal = (tab, idx) => {
    const s = SERVICOS[tab]?.[idx];
    if (!s) return;

    const statusLabel = { previstos: 'Previsto', andamento: 'Em andamento', concluidos: 'Concluído' };
    const badgeCls = { previstos: 'os-badge-previstos', andamento: 'os-badge-andamento', concluidos: 'os-badge-concluidos' };

    const content = document.getElementById('osDetailModalContent');
    content.innerHTML = `
    <div>
      <div class="os-modal-header" style="padding-right:52px">
        <div style="flex:1;min-width:0">
          <div class="os-modal-num">Ordem de Serviço</div>
          <div class="os-modal-title">${s.num} — ${s.c}</div>
          <span class="os-badge-status ${badgeCls[tab]}">${statusLabel[tab]}</span>
        </div>
        <div style="text-align:right;flex-shrink:0;padding-right:4px">
          <div style="font-size:var(--fs5);font-weight:700;color:#fff">${s.val}</div>
          <div style="font-size:var(--fs0);margin-top:2px;color:rgba(255,255,255,.7)">
            <i class="ph-bold ph-clock" style="font-size:11px;margin-right:2px"></i>${s.prazo}
          </div>
        </div>
      </div>
      <div class="m-body">
        <div class="m-grid" style="margin-bottom:16px">
          <div><div class="mf-lbl">Veículo</div><div class="mf-val">${s.v}</div></div>
          <div><div class="mf-lbl">Técnico</div><div class="mf-val">${s.tech}</div></div>
          <div><div class="mf-lbl">Tipo de Serviço</div><div class="mf-val">${s.t}</div></div>
          <div><div class="mf-lbl">Prazo</div><div class="mf-val">${s.prazo}</div></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${tab !== 'concluidos' ? `
            <button class="btn-prim" onclick="window.openOSEditModal('${tab}',${idx});closeModal('osDetailModal')">
              <i class="ph-bold ph-pencil-simple"></i> Editar
            </button>
          ` : ''}
          ${tab === 'previstos' ? `
            <button class="btn-sec" onclick="window.moverOS('${tab}',${idx});closeModal('osDetailModal')">
              <i class="ph-bold ph-arrow-right"></i> Iniciar atendimento
            </button>
          ` : ''}
          ${tab === 'andamento' ? `
            <button class="btn-sec" onclick="window.moverOS('${tab}',${idx});closeModal('osDetailModal')">
              <i class="ph-bold ph-check"></i> Concluir OS
            </button>
          ` : ''}
          <button class="btn-danger-out" onclick="window.deletarOS('${tab}',${idx});closeModal('osDetailModal')">
            <i class="ph-bold ph-trash"></i> Excluir
          </button>
        </div>
      </div>
    </div>
  `;

    openModal('osDetailModal');
};

/**
 * Abre o modal de edição da OS
 * @param {string} tab - Nome da aba
 * @param {number} idx - Índice da OS
 */
export const openOSEditModal = (tab, idx) => {
    const s = SERVICOS[tab]?.[idx];
    if (!s) return;

    const content = document.getElementById('osEditModalContent');
    content.innerHTML = `
    <div style="padding:20px">
      <h3 style="font-size:var(--fs4);font-weight:700;color:var(--c-text);margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--c-border)">Editar OS ${s.num}</h3>
      <div class="m-form">
        <label>Cliente<input type="text" id="editOSCliente" value="${s.c}"/></label>
        <label>Veículo<input type="text" id="editOSVeiculo" value="${s.v}"/></label>
        <label>Tipo de serviço<input type="text" id="editOSTipo" value="${s.t}"/></label>
        <label>Técnico
          <select id="editOSTecnico">
            ${TECNICOS.map(t => `<option${t.nome === s.tech ? ' selected' : ''}>${t.nome}</option>`).join('')}
          </select>
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label>Prazo<input type="text" id="editOSPrazo" value="${s.prazo}"/></label>
          <label>Valor<input type="text" id="editOSVal" value="${s.val}"/></label>
        </div>
        <label>Prioridade
          <select id="editOSPc">
            <option value="ok"${s.pc === 'ok' ? ' selected' : ''}>Normal</option>
            <option value="risco"${s.pc === 'risco' ? ' selected' : ''}>Em risco</option>
            <option value="atrasado"${s.pc === 'atrasado' ? ' selected' : ''}>Atrasado</option>
          </select>
        </label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn-sec" onclick="closeModal('osEditModal')">Cancelar</button>
        <button class="btn-prim" onclick="window.salvarEdicaoOS('${tab}',${idx})">
          <i class="ph-bold ph-floppy-disk"></i> Salvar
        </button>
      </div>
    </div>
  `;

    openModal('osEditModal');
};

/**
 * Salva a edição da OS
 * @param {string} tab - Nome da aba
 * @param {number} idx - Índice da OS
 */
export const salvarEdicaoOS = (tab, idx) => {
    const s = SERVICOS[tab]?.[idx];
    if (!s) return;

    s.c = document.getElementById('editOSCliente')?.value?.trim() || s.c;
    s.v = document.getElementById('editOSVeiculo')?.value?.trim() || s.v;
    s.t = document.getElementById('editOSTipo')?.value?.trim() || s.t;
    s.tech = document.getElementById('editOSTecnico')?.value || s.tech;
    s.prazo = document.getElementById('editOSPrazo')?.value?.trim() || s.prazo;
    s.val = document.getElementById('editOSVal')?.value?.trim() || s.val;
    s.pc = document.getElementById('editOSPc')?.value || s.pc;

    closeModal('osEditModal');
    renderServicos(activeOSTab);
    showToast(`OS ${s.num} atualizada!`, 'success');
};

/**
 * Move uma OS para o próximo estágio
 * @param {string} tab - Nome da aba atual
 * @param {number} idx - Índice da OS
 */
export const moverOS = (tab, idx) => {
    const s = SERVICOS[tab].splice(idx, 1)[0];
    if (!s) return;

    const prox = { previstos: 'andamento', andamento: 'concluidos' };
    const destino = prox[tab];
    if (destino) {
        SERVICOS[destino].unshift(s);
        const labels = { andamento: 'Em andamento', concluidos: 'Concluída' };
        showToast(`OS ${s.num} movida para ${labels[destino]}!`, 'success');
        renderServicos(activeOSTab);
    }
};

/**
 * Exclui uma OS
 * @param {string} tab - Nome da aba
 * @param {number} idx - Índice da OS
 */
export const deletarOS = (tab, idx) => {
    const s = SERVICOS[tab]?.[idx];
    if (!s) return;

    const title = document.getElementById('osDeleteTitle');
    const msg = document.getElementById('osDeleteMsg');
    const btn = document.getElementById('osDeleteConfirmBtn');

    if (title) title.textContent = `Excluir OS ${s.num}`;
    if (msg) msg.textContent = `Deseja excluir a OS ${s.num} de ${s.c} — ${s.v}? Esta ação não pode ser desfeita.`;
    if (btn) {
        btn.onclick = () => {
            SERVICOS[tab].splice(idx, 1);
            closeModal('osDeleteModal');
            renderServicos(activeOSTab);
            showToast(`OS ${s.num} excluída.`, 'info');
        };
    }

    openModal('osDeleteModal');
};

/**
 * Abre o modal de nova OS
 */
export const openNovaOSModal = () => {
    const sel = document.getElementById('osTecnico');
    if (sel) {
        sel.innerHTML = '<option value="">Selecione o técnico...</option>' + TECNICOS.map(t => `<option>${t.nome}</option>`).join('');
    }

    const di = document.getElementById('osData');
    if (di) {
        const d = new Date();
        di.value = d.toISOString().split('T')[0];
    }

    openModal('novaOSModal');
};

/**
 * Salva uma nova OS
 */
export const salvarNovaOS = () => {
    const cli = document.getElementById('osCliente')?.value.trim();
    const vei = document.getElementById('osVeiculo')?.value.trim();
    const tipo = document.getElementById('osTipoServico')?.value;
    const tech = document.getElementById('osTecnico')?.value || '';
    const data = document.getElementById('osData')?.value;
    const hora = document.getElementById('osHorario')?.value || '08:00';
    const pri = document.getElementById('osPrioridade')?.value || 'normal';

    if (!cli || !vei || !tipo || !data) {
        showToast('Preencha todos os campos obrigatórios.', 'warning');
        return;
    }

    const num = '#' + (4900 + SERVICOS.previstos.length + 1);
    const dt = new Date(data + 'T12:00:00');
    const df = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    SERVICOS.previstos.unshift({
        num,
        c: cli,
        v: vei,
        t: tipo,
        tech: tech || 'A designar',
        prazo: `${df}, ${hora}`,
        pc: pri === 'urgente' ? 'risco' : 'ok',
        val: 'A calcular'
    });

    closeModal('novaOSModal');
    ['osCliente', 'osVeiculo', 'osObs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    renderServicos('previstos');
    showToast(`OS ${num} criada com sucesso!`, 'success');
};

// Exporta funções globais
window.switchTab = switchTab;
window.openOSModal = openOSModal;
window.openOSEditModal = openOSEditModal;
window.salvarEdicaoOS = salvarEdicaoOS;
window.moverOS = moverOS;
window.deletarOS = deletarOS;
window.openNovaOSModal = openNovaOSModal;
window.salvarNovaOS = salvarNovaOS;