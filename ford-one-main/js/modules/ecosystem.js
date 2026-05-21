/* ============================================================
   FORD ONE — Ecosystem SVG Lines
   js/modules/ecosystem.js
   ============================================================ */

'use strict';

function drawEcoLines() {
  var visual = document.querySelector('.ecosystem-visual');
  if (!visual) return;

  var old = visual.querySelector('.eco-svg');
  if (old) old.remove();

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('eco-svg');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';

  var W  = visual.offsetWidth;
  var H  = visual.offsetHeight;
  var cx = W / 2;
  var cy = H / 2;

  [[cx, 70], [W - 70, cy], [cx, H - 70], [70, cy]].forEach(function (pos) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', pos[0]);
    line.setAttribute('y2', pos[1]);
    line.setAttribute('stroke', 'rgba(23,0,244,0.2)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '4 6');
    svg.appendChild(line);
  });

  visual.appendChild(svg);
}

function initEcosystem() {
  var ecoSec = document.getElementById('ecossistema');
  if (!ecoSec) return;

  if ('IntersectionObserver' in window) {
    var ecoObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          setTimeout(drawEcoLines, 200);
          ecoObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    ecoObs.observe(ecoSec);
  } else {
    drawEcoLines();
  }

  window.addEventListener('resize', drawEcoLines);
}
