/**
 * ============================================================
 * STORAGE — Gerenciamento de localStorage
 * ============================================================
 */

// ─── UTILITÁRIOS ──────────────────────────────────────────────

/**
 * Salva dados no localStorage
 * @param {string} key - Chave do item
 * @param {*} value - Valor a ser salvo
 * @returns {boolean} Se foi salvo com sucesso
 */
export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        return false;
    }
};

/**
 * Carrega dados do localStorage
 * @param {string} key - Chave do item
 * @param {*} defaultValue - Valor padrão se não existir
 * @returns {*} Valor carregado ou defaultValue
 */
export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const data = localStorage.getItem(key);
        if (data === null) return defaultValue;
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return defaultValue;
    }
};

/**
 * Remove um item do localStorage
 * @param {string} key - Chave do item
 * @returns {boolean} Se foi removido com sucesso
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
        return false;
    }
};

/**
 * Limpa todos os dados do localStorage
 * @returns {boolean} Se foi limpo com sucesso
 */
export const clearStorage = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
        return false;
    }
};

/**
 * Verifica se um item existe no localStorage
 * @param {string} key - Chave do item
 * @returns {boolean} Se o item existe
 */
export const hasStorage = (key) => {
    try {
        return localStorage.getItem(key) !== null;
    } catch (error) {
        return false;
    }
};

/**
 * Obtém todas as chaves do localStorage
 * @returns {string[]} Lista de chaves
 */
export const getStorageKeys = () => {
    try {
        return Object.keys(localStorage);
    } catch (error) {
        return [];
    }
};

/**
 * Obtém o tamanho aproximado do localStorage em bytes
 * @returns {number} Tamanho em bytes
 */
export const getStorageSize = () => {
    try {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    } catch (error) {
        return 0;
    }
};

// ─── CHAVES PADRÃO ────────────────────────────────────────────

export const STORAGE_KEYS = {
    THEME: 'fo-theme',
    CONFIG: 'app_config',
    USER: 'fo_user',
    TOKEN: 'fo_token',
    SESSION: 'fo_session',
    CACHE: 'fo_cache_'
};

// ─── FUNÇÕES ESPECÍFICAS ─────────────────────────────────────

/**
 * Salva o tema do usuário
 * @param {string} theme - 'light' ou 'dark'
 * @returns {boolean}
 */
export const saveTheme = (theme) => {
    return saveToStorage(STORAGE_KEYS.THEME, theme);
};

/**
 * Carrega o tema do usuário
 * @returns {string} 'light' ou 'dark'
 */
export const loadTheme = () => {
    return loadFromStorage(STORAGE_KEYS.THEME, 'light');
};

/**
 * Salva o usuário atual
 * @param {Object} user - Dados do usuário
 * @returns {boolean}
 */
export const saveUser = (user) => {
    return saveToStorage(STORAGE_KEYS.USER, user);
};

/**
 * Carrega o usuário atual
 * @returns {Object|null} Dados do usuário
 */
export const loadUser = () => {
    return loadFromStorage(STORAGE_KEYS.USER, null);
};

/**
 * Remove o usuário atual (logout)
 * @returns {boolean}
 */
export const clearUser = () => {
    return removeFromStorage(STORAGE_KEYS.USER);
};

/**
 * Salva o token de autenticação
 * @param {string} token - Token JWT
 * @returns {boolean}
 */
export const saveToken = (token) => {
    return saveToStorage(STORAGE_KEYS.TOKEN, token);
};

/**
 * Carrega o token de autenticação
 * @returns {string|null} Token JWT
 */
export const loadToken = () => {
    return loadFromStorage(STORAGE_KEYS.TOKEN, null);
};

/**
 * Remove o token de autenticação
 * @returns {boolean}
 */
export const clearToken = () => {
    return removeFromStorage(STORAGE_KEYS.TOKEN);
};

/**
 * Salva dados em cache
 * @param {string} key - Chave do cache
 * @param {*} value - Valor a ser cacheado
 * @param {number} ttl - Tempo de vida em milissegundos
 * @returns {boolean}
 */
export const saveCache = (key, value, ttl = 60000) => {
    const cacheKey = STORAGE_KEYS.CACHE + key;
    const data = {
        value,
        expires: Date.now() + ttl
    };
    return saveToStorage(cacheKey, data);
};

/**
 * Carrega dados do cache
 * @param {string} key - Chave do cache
 * @returns {*} Dados cacheados ou null se expirado
 */
export const loadCache = (key) => {
    const cacheKey = STORAGE_KEYS.CACHE + key;
    const data = loadFromStorage(cacheKey, null);

    if (!data) return null;

    // Verifica se expirou
    if (data.expires && Date.now() > data.expires) {
        removeFromStorage(cacheKey);
        return null;
    }

    return data.value;
};

/**
 * Remove um item do cache
 * @param {string} key - Chave do cache
 * @returns {boolean}
 */
export const clearCache = (key) => {
    return removeFromStorage(STORAGE_KEYS.CACHE + key);
};

/**
 * Limpa todo o cache
 * @returns {boolean}
 */
export const clearAllCache = () => {
    let success = true;
    const keys = getStorageKeys();
    keys.forEach(key => {
        if (key.startsWith(STORAGE_KEYS.CACHE)) {
            const result = removeFromStorage(key);
            if (!result) success = false;
        }
    });
    return success;
};

// ─── EXPOSIÇÃO GLOBAL ─────────────────────────────────────────

window.Storage = {
    save: saveToStorage,
    load: loadFromStorage,
    remove: removeFromStorage,
    clear: clearStorage,
    has: hasStorage,
    keys: getStorageKeys,
    size: getStorageSize,
    saveTheme,
    loadTheme,
    saveUser,
    loadUser,
    clearUser,
    saveToken,
    loadToken,
    clearToken,
    saveCache,
    loadCache,
    clearCache,
    clearAllCache,
    KEYS: STORAGE_KEYS
};