/**
 * @file useLineChart.ts
 * @description Hook para renderização de gráfico de linha na Canvas API.
 * Implementação própria sem bibliotecas externas (Chart.js, Recharts etc.).
 *
 * Funcionalidades:
 * - Múltiplas séries de dados com cores independentes
 * - Preenchimento de área (fill) com gradiente
 * - Linhas tracejadas (dashed) para série de meta/referência
 * - Pontos interativos nas séries contínuas
 * - Grid horizontal com valores no eixo Y
 * - Labels no eixo X
 * - Lê variáveis CSS do tema ativo (--c-mid, --c-border, --c-card)
 *   para adaptar cores ao tema claro/escuro automaticamente
 * - Mouse events: tooltip ao passar sobre os pontos
 *
 * @param canvasId   ID do elemento <canvas> no DOM
 * @param cfg        Configuração: labels, sets (séries), unit (sufixo Y)
 * @param deps       Array de dependências para redesenhar o gráfico
 */

import { useEffect } from 'react';

interface DataSet { data: number[]; color: string; fill?: boolean; dashed?: boolean; }
interface LineCfg { labels: string[]; sets: DataSet[]; unit?: string; }

const ctxt = () => getComputedStyle(document.documentElement).getPropertyValue('--c-mid').trim() || '#9196ae';
const cgrid = () => getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#e2e5ef';
const ccard = () => getComputedStyle(document.documentElement).getPropertyValue('--c-card').trim() || '#fff';

export function useLineChart(canvasId: string, cfg: LineCfg | null, deps: unknown[] = []) {
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
    const all = cfg.sets.flatMap(s => s.data);
    if (cfg.labels.length === 0 || all.length === 0) {
      ctx.clearRect(0, 0, W, H);
      return;
    }
    const mn = Math.min(...all) * .88; const mx = Math.max(...all) * 1.1;
    // Quando todos os pontos são iguais (ex.: toda a série em zero), mx-mn
    // vira 0 e (v-mn)/(mx-mn) dá NaN — usa 1 como divisor nesse caso, o que
    // desenha uma linha reta em vez de quebrar o createLinearGradient.
    const range = (mx - mn) || 1;
    const tx = (i: number) => P.l + i / (cfg.labels.length - 1) * pw;
    const ty = (v: number) => P.t + ph - (v - mn) / range * ph;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = cgrid(); ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = P.t + i / 4 * ph;
      ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(W - P.r, y); ctx.stroke();
      ctx.fillStyle = ctxt(); ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(mx - i / 4 * (mx - mn)) + (cfg.unit || ''), P.l - 6, y + 3.5);
    }
    ctx.fillStyle = ctxt(); ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'center';
    cfg.labels.forEach((l, i) => ctx.fillText(l, tx(i), H - P.b + 13));

    cfg.sets.forEach(ds => {
      const pts = ds.data.map((v, i) => [tx(i), ty(v)] as [number, number]);
      if (pts.length === 0) return;
      if (ds.fill) {
        ctx.beginPath(); ctx.moveTo(pts[0][0], ty(mn));
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(pts[pts.length - 1][0], ty(mn)); ctx.closePath();
        const g = ctx.createLinearGradient(0, P.t, 0, P.t + ph);
        g.addColorStop(0, ds.color + '24'); g.addColorStop(1, ds.color + '03');
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.beginPath();
      pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.strokeStyle = ds.color; ctx.lineWidth = 2.5;
      ctx.setLineDash(ds.dashed ? [6, 4] : []); ctx.stroke(); ctx.setLineDash([]);
      if (!ds.dashed) pts.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = ds.color; ctx.fill();
        ctx.strokeStyle = ccard(); ctx.lineWidth = 2; ctx.stroke();
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, ...deps]);
}
