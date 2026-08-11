/* ============================================================
   FORD ONE — Canvas Background Helpers
   js/utils/canvas.js
   ============================================================ */

'use strict';

/**
 * Cria e retorna um array de partículas aleatórias.
 * @param {number} count
 * @param {number} W - largura
 * @param {number} H - altura
 * @returns {Array}
 */
function createParticles(count, W, H) {
  return Array.from({ length: count }, function () {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.8 + 0.4,
      op: Math.random() * 0.4 + 0.1,
    };
  });
}

/**
 * Desenha grid de linhas no canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} gap
 * @param {string} color
 */
function drawGrid(ctx, W, H, gap, color) {
  gap   = gap   || 65;
  color = color || 'rgba(255,255,255,0.022)';
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1;
  for (var x = 0; x < W; x += gap) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (var y = 0; y < H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

/**
 * Move e rebate partículas dentro do canvas.
 * @param {Array} particles
 * @param {number} W
 * @param {number} H
 */
function moveParticles(particles, W, H) {
  particles.forEach(function (p) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
  });
}

/**
 * Desenha partículas e linhas de conexão.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} particles
 * @param {string} color
 * @param {number} maxDist
 */
function drawParticles(ctx, particles, color, maxDist) {
  color   = color   || 'rgba(110,128,255,';
  maxDist = maxDist || 120;

  particles.forEach(function (p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = color + p.op + ')';
    ctx.fill();
  });

  for (var i = 0; i < particles.length; i++) {
    for (var j = i + 1; j < particles.length; j++) {
      var dx   = particles[i].x - particles[j].x;
      var dy   = particles[i].y - particles[j].y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.beginPath();
        ctx.strokeStyle = color + (0.12 * (1 - dist / maxDist)) + ')';
        ctx.lineWidth   = 0.6;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}
