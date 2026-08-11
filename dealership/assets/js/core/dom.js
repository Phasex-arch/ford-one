/**
 * ============================================================
 * DOM — Utilitários de manipulação do DOM
 * ============================================================
 */

/**
 * Atalho para document.getElementById
 * @param {string} id - ID do elemento
 * @returns {HTMLElement|null}
 */
export const $ = (id) => document.getElementById(id);

/**
 * Cria um elemento HTML com classes e conteúdo
 * @param {string} tag - Tag do elemento
 * @param {string|string[]} classes - Classes CSS
 * @param {string|HTMLElement} content - Conteúdo
 * @param {object} attrs - Atributos adicionais
 * @returns {HTMLElement}
 */
export const createEl = (tag, classes = '', content = '', attrs = {}) => {
    const el = document.createElement(tag);
    if (classes) {
        if (Array.isArray(classes)) {
            el.classList.add(...classes);
        } else {
            el.className = classes;
        }
    }
    if (content) {
        if (typeof content === 'string') {
            el.innerHTML = content;
        } else {
            el.appendChild(content);
        }
    }
    Object.entries(attrs).forEach(([key, value]) => {
        el.setAttribute(key, value);
    });
    return el;
};

/**
 * Remove todos os filhos de um elemento
 * @param {HTMLElement} el
 */
export const clearChildren = (el) => {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
};

/**
 * Alterna classes em um elemento
 * @param {HTMLElement} el
 * @param {string} className
 */
export const toggleClass = (el, className) => {
    el.classList.toggle(className);
};

/**
 * Adiciona ou remove classes baseado em uma condição
 * @param {HTMLElement} el
 * @param {string} className
 * @param {boolean} condition
 */
export const setClass = (el, className, condition) => {
    el.classList.toggle(className, condition);
};

/**
 * Encontra o elemento pai mais próximo com um seletor
 * @param {HTMLElement} el
 * @param {string} selector
 * @returns {HTMLElement|null}
 */
export const closest = (el, selector) => el.closest(selector);

/**
 * Cria um fragmento de elementos a partir de um array
 * @param {Array} items
 * @param {Function} renderFn
 * @returns {DocumentFragment}
 */
export const renderList = (items, renderFn) => {
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
        fragment.appendChild(renderFn(item, index));
    });
    return fragment;
};