/**
 * ============================================================
 * NOTIFICATIONS — Sistema de toast notifications
 * ============================================================
 */

import { $ } from '../core/dom.js';

/**
 * Exibe um toast de notificação
 * @param {string} msg - Mensagem da notificação
 * @param {string} type - Tipo: 'success', 'info', 'warning', 'error'
 */
export const showToast = (msg, type = 'info') => {
    const icons = {
        success: 'ph-check-circle',
        info: 'ph-info',
        warning: 'ph-warning',
        error: 'ph-x-circle'
    };

    const container = document.getElementById('toastContainer');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="ph-bold ${icons[type] || icons.info}"></i><span>${msg}</span>`;

    container.appendChild(el);

    setTimeout(() => {
        el.style.cssText += 'opacity:0;transform:translateX(16px);transition:all .3s ease';
        setTimeout(() => el.remove(), 320);
    }, 3200);
};

/**
 * Marca todas as notificações como lidas
 */
export const markAllNotifsRead = () => {
    document.querySelectorAll('#notifList .notif-row').forEach(r => {
        r.classList.remove('unread');
        const d = r.querySelector('.ndot');
        if (d) d.classList.add('read');
    });

    const badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';

    showToast('Todas as notificações marcadas como lidas', 'success');
};

// Exporta funções globais
window.showToast = showToast;
window.markAllNotifsRead = markAllNotifsRead;