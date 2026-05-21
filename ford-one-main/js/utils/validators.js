/* ============================================================
   FORD ONE — Validators
   js/utils/validators.js
   ============================================================ */

'use strict';

/**
 * Valida e-mail com regex padrão.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida telefone brasileiro (mínimo 8 dígitos).
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  return /^[\d\s()\-+]{8,}$/.test(phone);
}

/**
 * Formata número para padrão telefone BR: (XX) XXXXX-XXXX
 * @param {string} raw
 * @returns {string}
 */
function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 6) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  if (digits.length > 2) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return digits;
}
