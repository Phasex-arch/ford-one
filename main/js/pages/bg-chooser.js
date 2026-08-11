/* ============================================================
   FORD ONE — Chooser Background (orbs + particles)
   js/pages/bg-chooser.js
   ============================================================ */

'use strict';

function initChooserBackground(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var raf;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var pts  = createParticles(55, canvas.width, canvas.height);
  var orbs = [
    { x: 0.15, y: 0.3,  r: 260, c: 'rgba(23,0,244,0.10)' },
    { x: 0.85, y: 0.7,  r: 320, c: 'rgba(0,9,91,0.5)'    },
    { x: 0.5,  y: 0.15, r: 200, c: 'rgba(23,0,244,0.06)' },
  ];
  var t = 0;

  function draw() {
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, W, H, 70, 'rgba(255,255,255,0.025)');

    orbs.forEach(function (o, i) {
      var px = o.x * W + Math.sin(t * 0.0008 + i) * 40;
      var py = o.y * H + Math.cos(t * 0.0006 + i) * 30;
      var g  = ctx.createRadialGradient(px, py, 0, px, py, o.r);
      g.addColorStop(0, o.c); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, o.r, 0, Math.PI * 2); ctx.fill();
    });

    moveParticles(pts, W, H);
    drawParticles(ctx, pts, 'rgba(110,128,255,', 120);
    t++;
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
}
