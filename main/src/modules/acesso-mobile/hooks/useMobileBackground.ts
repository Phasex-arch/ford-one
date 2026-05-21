import { useEffect, useRef } from 'react';

/**
 * Desenha background animado com linhas diagonais varrendo a tela.
 * Usado na página de acesso mobile.
 */
export function useMobileBackground(canvasId: string) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.3, op: Math.random() * 0.35 + 0.08,
    }));

    const diags = Array.from({ length: 8 }, (_, i) => ({
      off: i * (window.innerWidth / 8),
      spd: 0.3 + Math.random() * 0.3,
    }));

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.022)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 65) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 65) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      diags.forEach((d, i) => {
        d.off += d.spd; if (d.off > W + H) d.off = -H;
        const a = 0.04 + Math.sin(t * 0.02 + i) * 0.02;
        ctx.beginPath(); ctx.moveTo(d.off - H, 0); ctx.lineTo(d.off, H);
        ctx.strokeStyle = `rgba(23,0,244,${a})`; ctx.lineWidth = 1.5; ctx.stroke();
      });

      [[0, 0, 200, 'rgba(23,0,244,0.08)'], [W, H, 240, 'rgba(0,9,91,0.6)'], [W, 0, 160, 'rgba(23,0,244,0.05)']].forEach(
        ([rx, ry, r, c]) => {
          const g = ctx.createRadialGradient(Number(rx), Number(ry), 0, Number(rx), Number(ry), Number(r));
          g.addColorStop(0, String(c)); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(Number(rx), Number(ry), Number(r), 0, Math.PI * 2); ctx.fill();
        }
      );

      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,120,255,${p.op})`; ctx.fill();
      });

      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath(); ctx.strokeStyle = `rgba(100,120,255,${0.1 * (1 - d / 110)})`;
          ctx.lineWidth = 0.5; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }

      t++; rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [canvasId]);
}
