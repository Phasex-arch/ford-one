/**
 * ============================================================
 * ESTOQUE — Módulo de Estoque
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { cap, formatCurrency } from '../core/utils.js';
import { ESTOQUE, VEICULOS, CLIENTES } from '../services/data.js';
import { openModal, closeModal } from '../components/modals.js';
import { showToast } from '../components/notifications.js';
import { logVehicleAccess } from './historico.js';

/**
 * Renderiza a lista de estoque
 * @param {Array} data - Lista de veículos (opcional)
 */
export const renderEstoque = (data) => {
    const grid = document.getElementById('estoqueGrid');
    if (!grid) {
        console.warn('Elemento #estoqueGrid não encontrado');
        return;
    }

    const list = data || ESTOQUE;
    grid.innerHTML = '';

    list.forEach(e => {
        const card = document.createElement('div');
        card.className = 'est-card';
        card.onclick = () => openEstoqueModal(e.id);

        // Imagem ou placeholder
        let imgHtml = '';
        if (e.img) {
            imgHtml = `<img src="${e.img}" alt="${e.modelo}" loading="lazy">`;
        } else {
            imgHtml = `
        <div style="color:var(--c-dim);display:flex;flex-direction:column;align-items:center;gap:4px">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span style="font-size:var(--fs0)">${e.modelo}</span>
        </div>
      `;
        }

        card.innerHTML = `
      <div class="est-img">
        ${imgHtml}
        <span class="est-badge ${e.cond}">${cap(e.cond)}</span>
        <span class="est-status">${e.status}</span>
      </div>
      <div class="est-body">
        <div class="est-model">${e.modelo}</div>
        <div class="est-ver">${e.versao}</div>
        <div class="est-specs">
          <span class="esp">${e.ano}</span>
          <span class="esp">${e.motor}</span>
          <span class="esp">${e.trans}</span>
          ${e.km ? `<span class="esp">${e.km}</span>` : ''}
        </div>
        <div class="est-price-block">
          <div class="est-price-lbl">A partir de</div>
          <div class="est-price">${formatCurrency(e.preco)}</div>
        </div>
      </div>
    `;
        grid.appendChild(card);
    });

    // Atualiza o subtítulo
    const subtitle = document.getElementById('estoqueSubtitle');
    if (subtitle) {
        const count = grid.children.length;
        subtitle.textContent = `${count} veículos encontrados`;
    }
};

/**
 * Filtra o estoque
 */
export const filterEstoque = () => {
    const searchInput = document.getElementById('estSearch');
    const condSelect = document.getElementById('estCond');
    const segSelect = document.getElementById('estSeg');

    if (!searchInput || !condSelect || !segSelect) {
        console.warn('Elementos de filtro não encontrados');
        return;
    }

    const q = searchInput.value.toLowerCase();
    const cond = condSelect.value;
    const seg = segSelect.value;

    const filtered = ESTOQUE.filter(e => {
        const matchModel = e.modelo.toLowerCase().includes(q);
        const matchVersao = e.versao.toLowerCase().includes(q);
        const matchCond = !cond || e.cond === cond;
        const matchSeg = !seg || e.seg === seg;
        return (matchModel || matchVersao) && matchCond && matchSeg;
    });

    renderEstoque(filtered);
};

/**
 * Abre o modal de detalhe do veículo
 * @param {string} id - ID do veículo
 */
export const openEstoqueModal = (id) => {
    const e = ESTOQUE.find(x => x.id === id);
    if (!e) {
        showToast('Veículo não encontrado.', 'warning');
        return;
    }

    const content = document.getElementById('estoqueModalContent');
    if (!content) {
        console.warn('Elemento #estoqueModalContent não encontrado');
        return;
    }

    // Imagem do hero
    const heroImg = e.img
        ? `<img src="${e.img}" alt="${e.modelo}">`
        : `
      <div class="m-hero-ph">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      </div>
    `;

    // Opcionais como tags
    const opsHtml = e.ops.map(o => `<span class="itag green">${o}</span>`).join('');

    content.innerHTML = `
    <div class="m-hero">
      ${heroImg}
      <div class="m-hero-ov"></div>
      <div class="m-hero-info">
        <h2>${e.modelo}</h2>
        <p>${e.versao} · ${e.ano} · ${e.cor}</p>
      </div>
    </div>
    <div class="m-body">
      <div class="m-sec">
        <div class="m-sec-title">Especificações</div>
        <div class="m-grid">
          <div><div class="mf-lbl">Motorização</div><div class="mf-val">${e.motor}</div></div>
          <div><div class="mf-lbl">Transmissão</div><div class="mf-val">${e.trans}</div></div>
          <div><div class="mf-lbl">Condição</div><div class="mf-val"><span class="est-badge ${e.cond}" style="position:static;display:inline-block">${cap(e.cond)}</span></div></div>
          <div><div class="mf-lbl">Status</div><div class="mf-val">${e.status}</div></div>
          ${e.km ? `<div><div class="mf-lbl">KM</div><div class="mf-val">${e.km}</div></div>` : ''}
          <div><div class="mf-lbl">Em estoque</div><div class="mf-val">${e.estq} un.</div></div>
        </div>
      </div>
      <div class="m-sec">
        <div class="m-sec-title">Opcionais</div>
        <div>${opsHtml}</div>
      </div>
      <div class="m-sec">
        <div class="m-sec-title">Precificação</div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <div class="mf-lbl">Valor sugerido</div>
            <div style="font-size:28px;font-weight:700;color:var(--ford-blue)">${formatCurrency(e.preco)}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn-sec" onclick="window.openFinSimFromEstoque('${e.id}')">Simular financiamento</button>
            <button class="btn-prim" onclick="window.reservarUnidade('${e.id}')">Reservar unidade</button>
          </div>
        </div>
      </div>
    </div>
  `;

    openModal('estoqueModal');
};

/**
 * Abre o modal de veículo (histórico)
 * @param {string} cid - ID do cliente
 * @param {string} vid - ID do veículo
 */
export const openVehicleModal = (cid, vid) => {
    const v = (VEICULOS[cid] || []).find(x => x.id === vid);
    if (!v) {
        showToast('Veículo não encontrado.', 'warning');
        return;
    }

    const c = CLIENTES.find(x => x.id === cid);
    if (c) {
        logVehicleAccess(vid, `${v.modelo} ${v.versao.split(' ')[0]}`, c.nome.split(' ').slice(0, 2).join(' '), cid);
    }

    const content = document.getElementById('vehicleModalContent');
    if (!content) {
        console.warn('Elemento #vehicleModalContent não encontrado');
        return;
    }

    const heroImg = v.img
        ? `<img src="${v.img}" alt="${v.modelo}" style="width:100%;height:100%;object-fit:cover">`
        : `<div class="m-hero-ph"><i class="ph-bold ph-car" style="font-size:52px;color:rgba(255,255,255,.25)"></i></div>`;

    const cliSection = c ? `
    <div class="m-sec">
      <div class="m-sec-title">Cliente</div>
      <div class="m-grid">
        <div><div class="mf-lbl">Nome</div><div class="mf-val">${c.nome}</div></div>
        <div><div class="mf-lbl">Telefone</div><div class="mf-val">${c.tel}</div></div>
        <div><div class="mf-lbl">Segmento</div><div class="mf-val">${c.seg}</div></div>
        <div><div class="mf-lbl">LTV Total</div><div class="mf-val" style="color:var(--green)">${formatCurrency(c.ltv)}</div></div>
      </div>
    </div>
  ` : '';

    const statusPill = `<span class="pill ${v.status === 'ativo' ? 'ativo-v' : v.status}">${cap(v.status)}</span>`;
    const insHtml = v.ins.map((s, i) => `
    <span class="itag ${['blue', 'green', 'orange'][i % 3]}">${s}</span>
  `).join('');

    const tlHtml = v.hist.map(h => `
    <div class="tl-item">
      <div class="tl-date">${h.d}</div>
      <div class="tl-ev">${h.ev}</div>
      <div class="tl-det">${h.det} · <strong>${h.val}</strong></div>
    </div>
  `).join('');

    content.innerHTML = `
    <div class="m-hero">
      ${heroImg}
      <div class="m-hero-ov"></div>
      <div class="m-hero-info">
        <h2>${v.modelo}</h2>
        <p>${v.versao} · ${v.ano} · ${v.cor}</p>
      </div>
    </div>
    <div class="m-body">
      ${cliSection}
      <div class="m-sec">
        <div class="m-sec-title">Dados Gerais</div>
        <div class="m-grid">
          <div><div class="mf-lbl">Modelo</div><div class="mf-val">${v.modelo} ${v.versao}</div></div>
          <div><div class="mf-lbl">Ano</div><div class="mf-val">${v.ano}</div></div>
          <div><div class="mf-lbl">Cor</div><div class="mf-val">${v.cor}</div></div>
          <div><div class="mf-lbl">KM</div><div class="mf-val">${v.km} km</div></div>
          <div><div class="mf-lbl">Aquisição</div><div class="mf-val">${v.aq}</div></div>
          <div><div class="mf-lbl">Status</div><div class="mf-val">${statusPill}</div></div>
        </div>
      </div>
      <div class="m-sec">
        <div class="m-sec-title">Dados Financeiros</div>
        <div class="m-grid three">
          <div><div class="mf-lbl">Custo Acumulado</div><div class="mf-val">${v.fin.custo}</div></div>
          <div><div class="mf-lbl">Ticket Médio</div><div class="mf-val">${v.fin.ticket}</div></div>
          <div><div class="mf-lbl">Valor Estimado</div><div class="mf-val" style="color:var(--ford-vivid)">${v.fin.est}</div></div>
        </div>
      </div>
      <div class="m-sec">
        <div class="m-sec-title">Insights Comerciais</div>
        ${insHtml}
      </div>
      <div class="m-sec">
        <div class="m-sec-title">Linha do Tempo</div>
        <div class="timeline">${tlHtml}</div>
      </div>
    </div>
  `;

    openModal('vehicleModal');
};

/**
 * Reserva uma unidade
 * @param {string} id - ID do veículo
 */
export const reservarUnidade = (id) => {
    showToast('Unidade reservada!', 'success');
};

// ─── EXPOSIÇÃO GLOBAL ─────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.renderEstoque = renderEstoque;
    window.filterEstoque = filterEstoque;
    window.openEstoqueModal = openEstoqueModal;
    window.openVehicleModal = openVehicleModal;
    window.reservarUnidade = reservarUnidade;

    // Importa dinamicamente a função do financiamentos para evitar circular dependency
    window.openFinSimFromEstoque = (eid) => {
        import('./financiamentos.js').then(module => {
            module.openFinSimFromEstoque(eid);
        });
    };
}