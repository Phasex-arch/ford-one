/**
 * ============================================================
 * ROUTER — Navegação entre módulos
 * ============================================================
 */

let currentModule = 'dashboard';
let moduleHandlers = {};

/**
 * Registra um handler para um módulo
 * @param {string} moduleName - Nome do módulo
 * @param {Function} handler - Função a ser executada ao navegar
 */
export const registerModule = (moduleName, handler) => {
    moduleHandlers[moduleName] = handler;
};

/**
 * Navega para um módulo
 * @param {string} mod - Nome do módulo
 * @param {HTMLElement} el - Elemento do nav item
 */
export const navigate = (mod, el) => {
    // Atualiza a UI
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const section = document.getElementById('mod-' + mod);
    if (section) section.classList.add('active');
    if (el) el.classList.add('active');

    currentModule = mod;

    // Fecha menus mobile/dropdown
    if (window.innerWidth <= 768) closeMobile();
    closeDropdowns();

    // Executa o handler do módulo
    if (moduleHandlers[mod]) {
        moduleHandlers[mod]();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

/**
 * Fecha dropdowns abertos
 */
export const closeDropdowns = () => {
    ['notifDropdown', 'userDropdown'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
};

/**
 * Retorna o módulo atual
 * @returns {string}
 */
export const getCurrentModule = () => currentModule;

/**
 * Configura a navegação por links
 */
export const initRouter = () => {
    document.querySelectorAll('[data-module]').forEach(el => {
        el.addEventListener('click', (e) => {
            const mod = el.dataset.module;
            navigate(mod, el);
        });
    });
};