/**
 * ============================================================
 * UTILS — Funções utilitárias globais
 * ============================================================
 */

/**
 * Capitaliza o primeiro caractere de uma string
 * @param {string} s
 * @returns {string}
 */
export const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

/**
 * Formata um número como moeda BRL
 * @param {number} n - Valor numérico
 * @param {boolean} [compact] - Se true e n >= 1000, retorna "R$ Xk"
 * @returns {string}
 */
export const formatCurrency = (n, compact = false) => {
    const num = Number(n) || 0;
    if (compact && num >= 1000) {
        return 'R$ ' + Math.round(num / 1000) + 'k';
    }
    return 'R$ ' + num.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

/**
 * Extrai valor numérico de string monetária
 * @param {string|number} str
 * @returns {number}
 */
export const parseCurrency = (str) => {
    return parseFloat(String(str).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
};

/**
 * Formata número com separador de milhar
 * @param {number} n
 * @returns {string}
 */
export const formatNumber = (n) => Number(n).toLocaleString('pt-BR');

/**
 * Retorna HTML de estrelas para nota 0-5
 * @param {number} n - Nota de 0 a 5
 * @returns {string}
 */
export const starHtml = (n) => {
    const filled = '&#9733;'.repeat(Math.max(0, n));
    const empty = '&#9734;'.repeat(Math.max(0, 5 - n));
    return `<span style="color:#f59e0b">${filled}</span><span style="color:#9ca3af">${empty}</span>`;
};

/**
 * Retorna a hora atual formatada como HH:MM
 * @returns {string}
 */
export const nowStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Retorna a data atual formatada
 * @returns {string}
 */
export const todayStr = () => {
    const d = new Date();
    return d.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
};

/**
 * Gera um ID único
 * @param {string} prefix - Prefixo do ID
 * @returns {string}
 */
export const generateId = (prefix = '') => {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
};

/**
 * Debounce para funções de eventos
 * @param {Function} fn - Função a ser executada
 * @param {number} delay - Delay em ms
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Ações do usuário (perfil, senha, sair)
 * @param {string} action - Ação a ser executada
 */
export const udAction = (action) => {
    // Fecha dropdown
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.remove('open');

    if (action === 'perfil') {
        // Abre modal de perfil via KPI
        if (window.openKpi) {
            window.openKpi('perfil');
        } else {
            console.warn('openKpi não disponível');
        }
    } else if (action === 'senha') {
        if (window.openKpi) {
            window.openKpi('senha');
        } else {
            console.warn('openKpi não disponível');
        }
    } else if (action === 'sair') {
        if (window.showToast) {
            window.showToast('Sessão encerrada. Até logo!', 'info');
        }
        setTimeout(() => {
            document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#00095b;color:white;font-family:Inter,sans-serif;font-size:18px;letter-spacing:2px;font-weight:600">
          FORD ONE — SESSÃO ENCERRADA
        </div>
      `;
        }, 1200);
    }
};

// ─── EXPOSIÇÃO GLOBAL ─────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.cap = cap;
    window.formatCurrency = formatCurrency;
    window.formatNumber = formatNumber;
    window.starHtml = starHtml;
    window.nowStr = nowStr;
    window.todayStr = todayStr;
    window.udAction = udAction;
}