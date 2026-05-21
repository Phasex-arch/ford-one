/* ============================================================
   FORD ONE — Hero Parallax
   js/modules/parallax.js
   ============================================================ */

'use strict';

function initParallax() {
  if (!window.matchMedia('(min-width: 900px)').matches) return;

  var heroCar = document.querySelector('.hero-car');
  var heroSec = document.querySelector('.hero');
  if (!heroCar || !heroSec) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY < heroSec.offsetHeight) {
      heroCar.style.transform =
        'translateY(calc(-50% + ' + (window.scrollY * 0.22) + 'px))';
    }
  }, { passive: true });
}
