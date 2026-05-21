/**
 * @file usePieChart.ts
 * @description Hook para renderização de gráfico de pizza (donut) na Canvas API.
 * Implementação própria sem bibliotecas externas.
 *
 * Funcionalidades:
 * - Formato donut com anel central exibindo percentual
 * - Slice expandido ao passar o cursor (efeito de destaque)
 * - Legenda lateral com cor, label e percentual
 * - Lê variáveis CSS do tema ativo para adaptar ao tema claro/escuro
 * - Mouse events: detecta hover por ângulo e distância do centro
 *
 * @param canvasId   ID do elemento <canvas> no DOM
 * @param cfg        Configuração: labels, data (percentuais), colors
 * @param deps       Array de dependências para redesenhar o gráfico
 */

import { useEffect } from 'react';

interface PieCfg { labels: string[]; data: number[]; colors: string[]; }

const ctxt = () => getComputedStyle(document.documentElement).getPropertyValue('--c-mid').trim()  || '#9196ae';
const ccard = () => getComputedStyle(document.documentElement).getPropertyValue('--c-card').trim() || '#fff';

export function usePieChart(canvasId: string, cfg: PieCfg | null, deps: unknown[] = []) {
  useEffect(() => {
    if (!cfg) return;
    const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const W = el.offsetWidth; const H = el.offsetHeight;
    el.width = W * dpr; el.height = H * dpr;
    const ctx = el.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = W * .31; const cy = H / 2;
    const r = Math.min(cx, cy) - 13; const ir = r * .54;
    const tot = cfg.data.reduce((a, b) => a + b, 0);
    let ang = -Math.PI / 2;
    const slices = cfg.data.map((v, i) => {
      const sl = (v / tot) * Math.PI * 2;
      const s = { start: ang, end: ang + sl, c: cfg.colors[i], v };
      ang += sl; return s;
    });

    const draw = (hi: number) => {
      ctx.clearRect(0, 0, W, H);
      slices.forEach((sl, i) => {
        const exp = hi === i ? 5 : 0;
        const mid = (sl.start + sl.end) / 2;
        const ox = Math.cos(mid) * exp; const oy = Math.sin(mid) * exp;
        ctx.beginPath(); ctx.moveTo(cx + ox, cy + oy);
        ctx.arc(cx + ox, cy + oy, r, sl.start, sl.end); ctx.closePath();
        ctx.fillStyle = sl.c; ctx.fill();
        ctx.strokeStyle = ccard(); ctx.lineWidth = 2; ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(cx, cy, ir, 0, Math.PI * 2);
      ctx.fillStyle = ccard(); ctx.fill();
      ctx.fillStyle = ctxt(); ctx.font = 'bold 13px Inter,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(hi >= 0 ? cfg.data[hi] + '%' : '100%', cx, cy + 4);
      const lx = W * .6; let ly = cy - (cfg.labels.length * 21) / 2 + 8;
      cfg.labels.forEach((l, i) => {
        ctx.fillStyle = cfg.colors[i]; ctx.fillRect(lx, ly - 7, 10, 10);
        ctx.fillStyle = ctxt();
        ctx.font = hi === i ? 'bold 10.5px Inter,sans-serif' : '10.5px Inter,sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${l} (${cfg.data[i]}%)`, lx + 14, ly + 2);
        ly += 22;
      });
    };
    draw(-1);

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
      const dx = mx - cx; const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let hi = -1;
      if (dist < r && dist > ir) {
        let a = Math.atan2(dy, dx);
        if (a < -Math.PI / 2) a += Math.PI * 2;
        slices.forEach((sl, i) => { if (a >= sl.start && a < sl.end) hi = i; });
      }
      draw(hi);
    };
    const onLeave = () => draw(-1);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, ...deps]);
}
