/**
 * @file useBarChart.ts
 * @description Hook para renderização de gráfico de barras na Canvas API.
 * Implementação própria sem bibliotecas externas.
 *
 * Funcionalidades:
 * - Barras com bordas arredondadas no topo
 * - Gradiente vertical por barra
 * - Destaque (hover) com borda colorida e valor em negrito
 * - Grid horizontal com valores no eixo Y
 * - Labels no eixo X
 * - Lê variáveis CSS do tema ativo para adaptar ao tema claro/escuro
 * - Mouse events: highlight da barra e tooltip ao passar o cursor
 *
 * @param canvasId   ID do elemento <canvas> no DOM
 * @param cfg        Configuração: labels, data, color, unit
 * @param deps       Array de dependências para redesenhar o gráfico
 */

import { useEffect } from 'react';

interface BarCfg { labels: string[]; data: number[]; color: string; unit?: string; }

const ctxt  = () => getComputedStyle(document.documentElement).getPropertyValue('--c-mid').trim()    || '#9196ae';
const cgrid = () => getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#e2e5ef';
const ccard = () => getComputedStyle(document.documentElement).getPropertyValue('--c-card').trim()   || '#fff';

export function useBarChart(canvasId: string, cfg: BarCfg | null, deps: unknown[] = []) {
  useEffect(() => {
    if (!cfg) return;
    const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const W = el.offsetWidth; const H = el.offsetHeight;
    el.width = W * dpr; el.height = H * dpr;
    const ctx = el.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr);

    const P = { t:18, r:18, b:26, l:44 };
    const pw = W - P.l - P.r; const ph = H - P.t - P.b;
    const mx = Math.max(...cfg.data) * 1.15;
    const bw = (pw / cfg.data.length) * .58;
    const gap = (pw / cfg.data.length) * .21;

    const draw = (hi: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = cgrid(); ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = P.t + i / 4 * ph;
        ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(W - P.r, y); ctx.stroke();
        ctx.fillStyle = ctxt(); ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(Math.round(mx - i / 4 * mx) + (cfg.unit || ''), P.l - 6, y + 3.5);
      }
      cfg.data.forEach((v, i) => {
        const x = P.l + i * (pw / cfg.data.length) + gap;
        const bh = (v / mx) * ph; const y = P.t + ph - bh; const r = 3;
        const hov = hi === i;
        const g = ctx.createLinearGradient(0, y, 0, y + bh);
        g.addColorStop(0, hov ? cfg.color + 'EE' : cfg.color);
        g.addColorStop(1, cfg.color + '66');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + bw - r, y);
        ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
        ctx.lineTo(x + bw, y + bh); ctx.lineTo(x, y + bh); ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
        if (hov) { ctx.strokeStyle = cfg.color; ctx.lineWidth = 2; ctx.stroke(); }
        ctx.fillStyle = ctxt();
        ctx.font = `${hov ? 'bold' : 'normal'} 10px Inter,sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(v + (cfg.unit || ''), x + bw / 2, y - 5);
        ctx.fillText(cfg.labels[i], x + bw / 2, H - P.b + 13);
      });
    };
    draw(-1);

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mx2 = e.clientX - rect.left;
      let hi = -1;
      cfg.data.forEach((_, i) => {
        const x = P.l + i * (pw / cfg.data.length) + gap;
        if (mx2 >= x && mx2 <= x + bw) hi = i;
      });
      draw(hi);
    };
    const onLeave = () => draw(-1);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, ...deps]);
}

void ccard;
