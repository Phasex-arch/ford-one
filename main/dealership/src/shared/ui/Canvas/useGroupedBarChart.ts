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
 * - Valor acima da barra e label do eixo X somem sozinhos quando não cabem
 *   sem sobrepor o rótulo anterior — com 12 categorias × 2 barras (ano
 *   atual x anterior) numa tela de celular, sem isso o texto vira uma
 *   pilha ilegível em vez de simplesmente mostrar menos rótulos.
 *
 * @param canvasId   ID do elemento <canvas> no DOM
 * @param cfg        Configuração: labels, seriesA, seriesB, unit
 * @param deps       Array de dependências para redesenhar o gráfico
 */

import { useEffect } from 'react';

interface Serie { data: number[]; color: string; }
interface GroupedBarCfg { labels: string[]; seriesA: Serie; seriesB: Serie; unit?: string; }

const ctxt  = () => getComputedStyle(document.documentElement).getPropertyValue('--c-mid').trim()    || '#9196ae';
const cgrid = () => getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#e2e5ef';

export function useGroupedBarChart(canvasId: string, cfg: GroupedBarCfg | null, deps: unknown[] = []) {
  useEffect(() => {
    if (!cfg) return;
    const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const W = el.offsetWidth; const H = el.offsetHeight;
    el.width = W * dpr; el.height = H * dpr;
    const ctx = el.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Telas estreitas (celular) ganham margens e fonte menores — é espaço
    // real a mais pro plot, o que é o que sobra pra mais rótulos
    // conseguirem caber sem colidir (ver drawBar/draw abaixo).
    const narrow = W < 400;
    const P = narrow ? { t:16, r:8, b:28, l:34 } : { t:18, r:18, b:32, l:44 };
    const fs = narrow ? 8 : 9.5;
    const pw = W - P.l - P.r; const ph = H - P.t - P.b;
    const n = cfg.labels.length;
    if (n === 0) { ctx.clearRect(0, 0, W, H); return; }

    const all = [...cfg.seriesA.data, ...cfg.seriesB.data];
    // *1.15 || 1 evita NaN quando as duas séries estão zeradas (ex.: sem
    // nenhum dado no ano anterior ainda) — mesmo guard do useBarChart.
    const mx = Math.max(...all) * 1.15 || 1;

    const catW = pw / n;
    const barW = catW * 0.3;
    const barGap = catW * 0.05;
    const sideMargin = (catW - (2 * barW + barGap)) / 2;

    const barX = (i: number, serie: 'A' | 'B') => {
      const catX = P.l + i * catW + sideMargin;
      return serie === 'A' ? catX : catX + barW + barGap;
    };

    const MIN_GAP = narrow ? 1.5 : 3;
    // Mutável, compartilhado entre as chamadas de drawBar (A0,B0,A1,B1…) —
    // é o que faz o valor da barra B não sobrepor o da A vizinha, e ambos
    // não sobreporem o da próxima categoria.
    const valTracker = { lastRight: -Infinity };

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
      ctx.font = `${hov ? 'bold' : 'normal'} ${fs}px Inter,sans-serif`;
      ctx.textAlign = 'center';
      const cx = x + barW / 2;
      const text = String(v) + (cfg.unit || '');
      const w = ctx.measureText(text).width;
      // v===0 não tem barra nenhuma embaixo (altura zero) — mostrar o
      // rótulo só criaria poeira de texto na base do gráfico, sem nada pra
      // apontar. Some sozinho, exceto quando o mouse está bem em cima.
      if ((v !== 0 || hov) && (hov || cx - w / 2 > valTracker.lastRight + MIN_GAP)) {
        ctx.fillText(text, cx, y - 5);
        valTracker.lastRight = cx + w / 2;
      }
    };

    // hi = {i, serie} da barra sob o cursor, ou null.
    const draw = (hi: { i: number; serie: 'A' | 'B' } | null) => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = cgrid(); ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const y = P.t + g / 4 * ph;
        ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(W - P.r, y); ctx.stroke();
        ctx.fillStyle = ctxt(); ctx.font = `${fs}px Inter,sans-serif`; ctx.textAlign = 'right';
        ctx.fillText(Math.round(mx - g / 4 * mx) + (cfg.unit || ''), P.l - 5, y + 3.5);
      }
      valTracker.lastRight = -Infinity;
      let lastAxisRight = -Infinity;
      for (let i = 0; i < n; i++) {
        drawBar(barX(i, 'A'), cfg.seriesA.data[i] ?? 0, cfg.seriesA.color, hi?.i === i && hi.serie === 'A');
        drawBar(barX(i, 'B'), cfg.seriesB.data[i] ?? 0, cfg.seriesB.color, hi?.i === i && hi.serie === 'B');
        ctx.fillStyle = ctxt(); ctx.font = `${fs}px Inter,sans-serif`; ctx.textAlign = 'center';
        const cx = P.l + i * catW + catW / 2;
        const axisText = cfg.labels[i];
        const axisW = ctx.measureText(axisText).width;
        if (cx - axisW / 2 > lastAxisRight + MIN_GAP) {
          ctx.fillText(axisText, cx, H - P.b + 19);
          lastAxisRight = cx + axisW / 2;
        }
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
  }, [canvasId, ...deps]);
}
