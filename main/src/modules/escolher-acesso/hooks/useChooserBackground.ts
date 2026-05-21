import { useEffect, useRef } from 'react';

interface Orb { x: number; y: number; r: number; c: string; }
interface Particle { x: number; y: number; vx: number; vy: number; r: number; op: number; }

/**
 * Desenha background animado com orbs flutuantes e partículas conectadas.
 * Usado na página de escolha de acesso.
 */
export function useChooserBackground(canvasId: string) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const pts: Particle[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4, op: Math.random() * 0.4 + 0.1,
    }));

    const orbs: Orb[] = [
      { x: 0.15, y: 0.3,  r: 260, c: 'rgba(23,0,244,0.10)' },
      { x: 0.85, y: 0.7,  r: 320, c: 'rgba(0,9,91,0.5)'    },
      { x: 0.5,  y: 0.15, r: 200, c: 'rgba(23,0,244,0.06)' },
    ];

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 70) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      orbs.forEach((o, i) => {
        const px = o.x * W + Math.sin(t * 0.0008 + i) * 40;
        const py = o.y * H + Math.cos(t * 0.0006 + i) * 30;
        const g  = ctx.createRadialGradient(px, py, 0, px, py, o.r);
        g.addColorStop(0, o.c); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, o.r, 0, Math.PI * 2); ctx.fill();
      });

      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110,128,255,${p.op})`; ctx.fill();
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(110,128,255,${0.12 * (1 - d / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
      }
      t++; rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [canvasId]);
}
