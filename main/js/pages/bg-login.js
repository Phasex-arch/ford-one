/* ============================================================
   FORD ONE — Login Background (rings + particles)
   js/pages/bg-login.js
   ============================================================ */

'use strict';

function initLoginBackground(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var raf;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  var rings = Array.from({ length: 5 }, function (_, i) {
    return { phase: (i / 5) * Math.PI * 2, baseR: 90 + i * 80 };
  });
  var pts = createParticles(50, canvas.width, canvas.height);
  var t   = 0;

  function draw() {
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, W, H, 65, 'rgba(255,255,255,0.02)');

    var cx = W / 2, cy = H / 2;
    rings.forEach(function (ring) {
      var rad = ring.baseR + Math.sin(t * 0.011 + ring.phase) * 20;
      var a   = 0.055 + Math.sin(t * 0.009 + ring.phase) * 0.035;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(23,0,244,' + a + ')';
      ctx.lineWidth   = 1.2; ctx.stroke();
    });

    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
    g.addColorStop(0, 'rgba(23,0,244,0.06)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 260, 0, Math.PI * 2); ctx.fill();

    moveParticles(pts, W, H);
    drawParticles(ctx, pts, 'rgba(100,118,255,', 110);
    t++;
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
}
