/* ============================================================
   FORD ONE — Scroll Utilities
   js/utils/scroll.js
   ============================================================ */

'use strict';

/**
 * Rola suavemente para um elemento descontando a altura do header.
 * @param {HTMLElement} el
 * @param {number} headerHeight
 */
function scrollToElement(el, headerHeight) {
  headerHeight = headerHeight || 72;
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top: top, behavior: 'smooth' });
}

/**
 * Rola para um seletor CSS.
 * @param {string} selector
 * @param {number} headerHeight
 */
function scrollToSelector(selector, headerHeight) {
  const el = document.querySelector(selector);
  if (el) scrollToElement(el, headerHeight);
}
