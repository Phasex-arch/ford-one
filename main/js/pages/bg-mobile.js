/* ============================================================
   FORD ONE — Mobile Background (diagonals + particles)
   js/pages/bg-mobile.js
   ============================================================ */

'use strict';

function initMobileBackground(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var raf;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  var pts   = createParticles(55, canvas.width, canvas.height);
  var diags = Array.from({ length: 8 }, function (_, i) {
    return { off: i * (canvas.width / 8), spd: 0.3 + Math.random() * 0.3 };
  });
  var t = 0;

  function draw() {
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, W, H, 65, 'rgba(255,255,255,0.022)');

    diags.forEach(function (d, i) {
      d.off += d.spd;
      if (d.off > W + H) d.off = -H;
      var a = 0.04 + Math.sin(t * 0.02 + i) * 0.02;
      ctx.beginPath();
      ctx.moveTo(d.off - H, 0); ctx.lineTo(d.off, H);
      ctx.strokeStyle = 'rgba(23,0,244,' + a + ')';
      ctx.lineWidth   = 1.5; ctx.stroke();
    });

    [[0, 0, 200, 'rgba(23,0,244,0.08)'], [W, H, 240, 'rgba(0,9,91,0.6)'], [W, 0, 160, 'rgba(23,0,244,0.05)']].forEach(function (o) {
      var g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], o[2]);
      g.addColorStop(0, o[3]); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o[0], o[1], o[2], 0, Math.PI * 2); ctx.fill();
    });

    moveParticles(pts, W, H);
    drawParticles(ctx, pts, 'rgba(100,120,255,', 110);
    t++;
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
}
