// @ts-check
'use strict';
/* ============================================================
   FORD ONE – utils.js
   Biblioteca central de utilitários. Deve ser carregada ANTES
   de script.js. Todas as funções ficam no escopo global para
   que script.js as consuma sem módulos ES.
   ============================================================ */

// ─── STRINGS ─────────────────────────────────────────────────

/**
 * Capitaliza o primeiro caractere de uma string.
 * @param {string} s
 * @returns {string}
 */
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// ─── MOEDA ───────────────────────────────────────────────────

/**
 * Formata um número como moeda BRL sem casas decimais.
 * @param {number} n           - Valor numérico puro (ex: 299900)
 * @param {boolean} [compact]  - Se true e n >= 1000, retorna "R$ Xk"
 * @returns {string}           Ex: "R$ 299.900" ou "R$ 300k"
 */
const formatCurrency = (n, compact = false) => {
  const num = Number(n) || 0;
  if (compact && num >= 1000) return 'R$ ' + Math.round(num / 1000) + 'k';
  return 'R$ ' + num.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Extrai um valor numérico de uma string monetária.
 * Útil para strings legadas que ainda estejam no formato "R$ 299.900".
 * @param {string|number} str
 * @returns {number}
 */
const parseCurrency = str =>
  parseFloat(String(str).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

/**
 * Formata um número com separador de milhar pt-BR.
 * @param {number} n
 * @returns {string}
 */
const formatNumber = n => Number(n).toLocaleString('pt-BR');

// ─── ESTRELAS ────────────────────────────────────────────────

/**
 * Retorna HTML de estrelas (★★★★☆) para notas de 0–5.
 * Substitui as antigas `starStr` e `starHtml` (eram idênticas).
 * @param {number} n - Nota de 0 a 5
 * @returns {string} HTML string
 */
const starHtml = n => {
  const filled = '&#9733;'.repeat(Math.max(0, n));
  const empty  = '&#9734;'.repeat(Math.max(0, 5 - n));
  return `<span style="color:#f59e0b">${filled}</span><span style="color:#9ca3af">${empty}</span>`;
};

// ─── TEMPO ───────────────────────────────────────────────────

/**
 * Retorna a hora atual formatada como "HH:MM".
 * @returns {string}
 */
const nowStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
