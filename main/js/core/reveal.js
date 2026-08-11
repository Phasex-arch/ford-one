/* ============================================================
   FORD ONE — Intersection Reveal
   js/core/reveal.js
   ============================================================ */

'use strict';

var REVEAL_SELECTORS = [
  '.concept-card',
  '.tech-card',
  '.benefit-card',
  '.step',
  '.eco-node',
  '.vehicle-card',
  '.diff-item',
];

function revealElement(el) {
  var delay = parseInt(el.dataset.delay || '0', 10);
  el.style.animationDelay = delay + 'ms';
  el.classList.add('visible');

  /* Anima barras de tecnologia */
  if (el.classList.contains('tech-card')) {
    setTimeout(function () {
      el.querySelectorAll('.tech-bar-fill').forEach(function (fill) {
        fill.style.width = (fill.dataset.width || '0') + '%';
      });
    }, delay + 200);
  }
}

function initReveal() {
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    REVEAL_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        obs.observe(el);
      });
    });
  } else {
    /* Fallback: revela tudo imediatamente */
    REVEAL_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(revealElement);
    });
  }
}
