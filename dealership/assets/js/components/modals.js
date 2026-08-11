/**
 * ============================================================
 * MODALS — Gerenciamento de modais
 * ============================================================
 */

import { $ } from '../core/dom.js';

/**
 * Abre um modal
 * @param {string} id - ID do modal
 */
export const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

/**
 * Fecha um modal
 * @param {string} id - ID do modal
 */
export const closeModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
};

/**
 * Fecha todos os modais abertos
 */
export const closeAllModals = () => {
    document.querySelectorAll('.modal-ov.open').forEach(modal => {
        modal.classList.remove('open');
    });
    document.body.style.overflow = '';
};

/**
 * Configura o fechamento de modais ao clicar no overlay
 */
export const setupModalOverlays = () => {
    document.querySelectorAll('.modal-ov').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
};

/**
 * Fecha dropdowns abertos
 * @param {string} id - ID do dropdown (opcional)
 */
export const closeDD = (id) => {
    if (id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    } else {
        document.querySelectorAll('.hdr-dropdown.open').forEach(el => {
            el.classList.remove('open');
        });
    }
};

/**
 * Fecha a sidebar em mobile
 */
export const closeMobile = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.style.display = 'none';
};

// ─── EXPORTS GLOBAIS PARA USO EM ONCLICK ──────────────────────

window.openModal = openModal;
window.closeModal = closeModal;
window.closeDD = closeDD;
window.closeMobile = closeMobile;