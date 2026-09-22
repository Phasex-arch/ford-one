/**
 * @file useGroupedBarChart.ts
 * @description Hook para gráfico de barras PAREADAS (2 barras por categoria)
 * na Canvas API — usado pro comparativo Ano atual x Ano anterior do
 * Dashboard, onde ver os dois valores lado a lado é mais direto que duas
 * linhas sobrepostas (mesma ideia do useBarChart, só com duas séries por
 * rótulo em vez de uma).
 *
 * Funcionalidades:
 * - Duas barras por categoria, cores/gradiente próprios de cada série
 * - Destaque (hover) na barra sob o cursor, com valor em negrito acima dela
 * - Grid horizontal com valores no eixo Y, labels no eixo X
 * - Lê variáveis CSS do tema ativo para adaptar ao tema claro/escuro
 *
 * @param canvasId   ID do elemento <canvas> no DOM
 * @param cfg        Configuração: labels, seriesA, seriesB, unit
 * @param deps       Array de dependências para redesenhar o gráfico
 */

import { useEffect } from 'react';
import { useCanvasResizeTick, niceMax, labelStep, showLabel, valuesFit } from './chartUtils';

interface Serie { data: number[]; color: string; }
interface GroupedBarCfg { labels: string[]; seriesA: Serie; seriesB: Serie; unit?: string; }

const ctxt  = () => getComputedStyle(document.documentElement).getPropertyValue('--c-mid').trim()    || '#9196ae';
const cgrid = () => getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#e2e5ef';

export function useGroupedBarChart(canvasId: string, cfg: GroupedBarCfg | null, deps: unknown[] = []) {
  const resizeTick = useCanvasResizeTick(canvasId, deps);
  useEffect(() => {
    if (!cfg) return;
    const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const W = el.offsetWidth; const H = el.offsetHeight;
    el.width = W * dpr; el.height = H * dpr;
    const ctx = el.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr);

    const P = { t:18, r:18, b:32, l:44 };
    const pw = W - P.l - P.r; const ph = H - P.t - P.b;
    const n = cfg.labels.length;
    if (n === 0) { ctx.clearRect(0, 0, W, H); return; }

    const all = [...cfg.seriesA.data, ...cfg.seriesB.data];
    // niceMax nunca devolve 0 — evita NaN com as duas séries zeradas (ex.:
    // sem nenhum dado no ano anterior ainda).
    const mx = niceMax(Math.max(...all));

    const catW = pw / n;
    const barW = catW * 0.3;
    const barGap = catW * 0.05;
    const sideMargin = (catW - (2 * barW + barGap)) / 2;
    ctx.font = '10px Inter,sans-serif';
    const step = labelStep(ctx, cfg.labels, catW);
    const showValues = valuesFit(ctx, all.map(v => String(v) + (cfg.unit || '')), catW / 2);

    const barX = (i: number, serie: 'A' | 'B') => {
      const catX = P.l + i * catW + sideMargin;
      return serie === 'A' ? catX : catX + barW + barGap;
    };

    const drawBar = (x: number, v: number, color: string, hov: boolean) => {
      const bh = (v / mx) * ph; const y = P.t + ph - bh; const r = 3;
      const g = ctx.createLinearGradient(0, y, 0, y + bh);
      g.addColorStop(0, hov ? color + 'EE' : color);
      g.addColorStop(1, color + '66');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + bh); ctx.lineTo(x, y + bh); ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
      if (hov) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.fillStyle = ctxt();
      ctx.font = `${hov ? 'bold' : 'normal'} 9.5px Inter,sans-serif`;
      ctx.textAlign = 'center';
      // Cada barra tem meia categoria de espaço pro valor — ver valuesFit.
      // Zero não tem barra pra rotular.
      if (hov || (showValues && v !== 0)) ctx.fillText(String(v) + (cfg.unit || ''), x + barW / 2, y - 5);
    };

    // hi = {i, serie} da barra sob o cursor, ou null.
    const draw = (hi: { i: number; serie: 'A' | 'B' } | null) => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = cgrid(); ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const y = P.t + g / 4 * ph;
        ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(W - P.r, y); ctx.stroke();
        ctx.fillStyle = ctxt(); ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(Math.round(mx - g / 4 * mx) + (cfg.unit || ''), P.l - 6, y + 3.5);
      }
      for (let i = 0; i < n; i++) {
        drawBar(barX(i, 'A'), cfg.seriesA.data[i] ?? 0, cfg.seriesA.color, hi?.i === i && hi.serie === 'A');
        drawBar(barX(i, 'B'), cfg.seriesB.data[i] ?? 0, cfg.seriesB.color, hi?.i === i && hi.serie === 'B');
        ctx.fillStyle = ctxt(); ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'center';
        if (showLabel(i, n, step)) ctx.fillText(cfg.labels[i], P.l + i * catW + catW / 2, H - P.b + 19);
      }
    };
    draw(null);

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mx2 = e.clientX - rect.left;
      let hi: { i: number; serie: 'A' | 'B' } | null = null;
      for (let i = 0; i < n; i++) {
        const xa = barX(i, 'A'); const xb = barX(i, 'B');
        if (mx2 >= xa && mx2 <= xa + barW) hi = { i, serie: 'A' };
        else if (mx2 >= xb && mx2 <= xb + barW) hi = { i, serie: 'B' };
      }
      draw(hi);
    };
    const onLeave = () => draw(null);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, resizeTick, ...deps]);
}
