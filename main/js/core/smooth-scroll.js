/* ============================================================
   FORD ONE — Smooth Scroll
   js/core/smooth-scroll.js
   ============================================================ */

'use strict';

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var hh = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-h')
        ) || 72;
        scrollToElement(target, hh);
      }
    });
  });
}
