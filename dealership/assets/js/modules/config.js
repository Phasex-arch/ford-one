/**
 * ============================================================
 * CONFIG — Módulo de Configurações
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { showToast } from '../components/notifications.js';

/**
 * Renderiza as configurações
 */
export const renderConfig = () => {
    // Tema
    const savedTheme = localStorage.getItem('fo-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const lightBtn = document.getElementById('themeLight');
    const darkBtn = document.getElementById('themeDark');
    if (lightBtn) lightBtn.classList.toggle('active', savedTheme === 'light');
    if (darkBtn) darkBtn.classList.toggle('active', savedTheme === 'dark');

    // Configurações de notificação
    setupNotificationToggles();
};

/**
 * Configura os toggles de notificação
 */
const setupNotificationToggles = () => {
    document.querySelectorAll('#notifToggles .toggle-item input').forEach(input => {
        input.addEventListener('change', (e) => {
            const item = e.target.closest('.toggle-item');
            const lbl = item?.querySelector('span')?.textContent || '';
            const on = e.target.checked;
            showToast(`Notificação "${lbl}" ${on ? 'ativada' : 'desativada'}.`, 'info');
        });
    });
};

/**
 * Salva as configurações da concessionária
 */
export const saveCfg = () => {
    showToast('Dados da concessionária salvos!', 'success');
};

/**
 * Salva as metas padrão
 */
export const saveMetas = () => {
    showToast('Metas padrão atualizadas!', 'success');
};

/**
 * Altera o tema
 * @param {string} theme - 'light' ou 'dark'
 */
export const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fo-theme', theme);

    const lightBtn = document.getElementById('themeLight');
    const darkBtn = document.getElementById('themeDark');
    if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');
    if (darkBtn) darkBtn.classList.toggle('active', theme === 'dark');

    // Atualiza gráficos
    const mod = window.getCurrentModule?.() || '';
    if (mod === 'dashboard') {
        window.initDashboard?.();
    }
    if (mod === 'receita') {
        setTimeout(window.initReceitaCharts, 60);
    }
    if (mod === 'desempenho') {
        setTimeout(window.initDesempenhoCharts, 60);
    }

    showToast(`Tema ${theme === 'dark' ? 'escuro' : 'claro'} ativado.`, 'success');
};

// Exporta funções globais
window.saveCfg = saveCfg;
window.saveMetas = saveMetas;
window.setTheme = setTheme;