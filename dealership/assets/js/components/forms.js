/**
 * ============================================================
 * FORMS — Utilitários para formulários
 * ============================================================
 */

import { $ } from '../core/dom.js';
import { showToast } from './notifications.js';

/**
 * Valida um campo de formulário
 * @param {string} id - ID do campo
 * @param {string} label - Label para mensagem de erro
 * @param {boolean} required - Se é obrigatório
 * @param {RegExp} pattern - Padrão de validação
 * @returns {boolean} Se é válido
 */
export const validateField = (id, label, required = true, pattern = null) => {
    const el = document.getElementById(id);
    if (!el) return false;

    const value = el.value.trim();
    if (required && !value) {
        showToast(`O campo "${label}" é obrigatório.`, 'warning');
        el.focus();
        return false;
    }

    if (pattern && value && !pattern.test(value)) {
        showToast(`O campo "${label}" está inválido.`, 'warning');
        el.focus();
        return false;
    }

    return true;
};

/**
 * Valida múltiplos campos de um formulário
 * @param {Array<{id:string,label:string,required?:boolean,pattern?:RegExp}>} fields
 * @returns {boolean} Se todos são válidos
 */
export const validateFields = (fields) => {
    for (const field of fields) {
        const valid = validateField(field.id, field.label, field.required, field.pattern);
        if (!valid) return false;
    }
    return true;
};

/**
 * Coleta dados de um formulário
 * @param {string[]} ids - IDs dos campos
 * @param {boolean} trim - Se deve remover espaços
 * @returns {Object} Dados coletados
 */
export const collectFormData = (ids, trim = true) => {
    const data = {};
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const value = el.value;
            data[id] = trim ? value.trim() : value;
        }
    });
    return data;
};

/**
 * Limpa um formulário
 * @param {string[]} ids - IDs dos campos
 */
export const clearForm = (ids) => {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT') {
                el.selectedIndex = 0;
            } else {
                el.value = '';
            }
        }
    });
};

/**
 * Preenche um formulário com dados
 * @param {Object} data - Dados para preencher { id: value }
 */
export const populateForm = (data) => {
    Object.entries(data).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });
};

/**
 * Obtém o valor de um campo de formulário com fallback
 * @param {string} id - ID do campo
 * @param {*} defaultValue - Valor padrão
 * @returns {*} Valor do campo ou defaultValue
 */
export const getFieldValue = (id, defaultValue = '') => {
    const el = document.getElementById(id);
    return el ? el.value : defaultValue;
};

/**
 * Define o valor de um campo de formulário
 * @param {string} id - ID do campo
 * @param {*} value - Valor a ser definido
 */
export const setFieldValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
};

/**
 * Marca um campo como válido ou inválido visualmente
 * @param {string} id - ID do campo
 * @param {boolean} valid - Se é válido
 */
export const markFieldValidity = (id, valid) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (valid) {
        el.classList.remove('invalid');
        el.classList.add('valid');
    } else {
        el.classList.remove('valid');
        el.classList.add('invalid');
    }
};

/**
 * Verifica se todos os campos de um formulário estão preenchidos
 * @param {string[]} ids - IDs dos campos
 * @returns {boolean} Se todos estão preenchidos
 */
export const isFormComplete = (ids) => {
    return ids.every(id => {
        const el = document.getElementById(id);
        return el && el.value.trim() !== '';
    });
};

// ─── EXPORTS GLOBAIS PARA USO EM ONCLICK ──────────────────────

window.validateField = validateField;
window.validateFields = validateFields;
window.collectFormData = collectFormData;
window.clearForm = clearForm;
window.populateForm = populateForm;
window.getFieldValue = getFieldValue;
window.setFieldValue = setFieldValue;
window.isFormComplete = isFormComplete;