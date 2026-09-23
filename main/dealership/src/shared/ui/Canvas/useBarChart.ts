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
 * - Mouse events: highlight da barra e, quando `counts` é informado, o
 *   próprio número já desenhado acima da barra troca pra contagem bruta
 *   (ex.: "25%" vira "1") enquanto o mouse está em cima — o % sozinho não
 *   diz se foi 1 de 1 ou 10 de 10.
 * - Rótulos (valor acima da barra e label do eixo X) somem sozinhos quando
 *   não cabem sem sobrepor o anterior — em telas estreitas com muitas
 *   categorias (ex.: 12 meses no período Ano), sem isso o texto vira uma
 *   pilha ilegível em vez de simplesmente mostrar menos rótulos.
 *
 * @param canvasId   ID do elemento <canvas> no DOM
 * @param cfg        Configuração: labels, data, color, unit, counts (opcional)
 * @param deps       Array de dependências para redesenhar o gráfico
 */

import { useEffect } from 'react';

interface BarCfg {
  labels: string[]; data: number[]; color: string; unit?: string;
  /** Contagem bruta por trás de cada barra, mesmo índice de `data`. */
  counts?: number[];
}

const ctxt  = () => getComputedStyle(document.documentElement).getPropertyValue('--c-mid').trim()    || '#9196ae';
const cgrid = () => getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#e2e5ef';

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

    // Telas estreitas (celular) ganham margens e fonte menores — é espaço
    // real a mais pro plot em si, o que é o que sobra pra mais rótulos
    // conseguirem caber sem colidir (ver draw() abaixo).
    const narrow = W < 400;
    const P = narrow ? { t:16, r:8, b:28, l:34 } : { t:18, r:18, b:32, l:44 };
    const fs = narrow ? 8.5 : 10;
    const pw = W - P.l - P.r; const ph = H - P.t - P.b;
    if (cfg.data.length === 0 || cfg.labels.length === 0) {
      ctx.clearRect(0, 0, W, H);
      return;
    }
    // Math.max(...cfg.data) pode ser 0 quando toda a série é zero (ex.: nenhum
    // lead convertido ainda) — sem o guard, v/mx vira 0/0 = NaN e quebra o
    // createLinearGradient mais abaixo.
    const mx = Math.max(...cfg.data) * 1.15 || 1;
    const bw = (pw / cfg.data.length) * .58;
    const gap = (pw / cfg.data.length) * .21;

    const draw = (hi: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = cgrid(); ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = P.t + i / 4 * ph;
        ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(W - P.r, y); ctx.stroke();
        ctx.fillStyle = ctxt(); ctx.font = `${fs}px Inter,sans-serif`; ctx.textAlign = 'right';
        ctx.fillText(Math.round(mx - i / 4 * mx) + (cfg.unit || ''), P.l - 5, y + 3.5);
      }
      // Só desenha um rótulo se ele não colidir com o último já desenhado
      // NA MESMA linha (valor ou eixo X são rastreados separado) — em vez
      // de um breakpoint fixo, se adapta a qualquer largura de tela e
      // qualquer quantidade de categorias sozinho.
      const MIN_GAP = narrow ? 2 : 4;
      let lastValRight = -Infinity;
      let lastAxisRight = -Infinity;
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
        ctx.textAlign = 'center';
        const cx = x + bw / 2;

        ctx.font = `${hov ? 'bold' : 'normal'} ${fs}px Inter,sans-serif`;
        const inlineCount = hov ? cfg.counts?.[i] : undefined;
        const valText = inlineCount !== undefined ? String(inlineCount) : v + (cfg.unit || '');
        const valW = ctx.measureText(valText).width;
        // v===0 não desenha barra nenhuma (altura zero) — o rótulo ficaria
        // flutuando sem nada embaixo, só poluindo a base do gráfico. Some
        // sozinho, exceto quando o mouse está bem em cima daquela barra.
        if ((v !== 0 || hov) && (hov || cx - valW / 2 > lastValRight + MIN_GAP)) {
          ctx.fillText(valText, cx, y - 5);
          lastValRight = cx + valW / 2;
        }

        ctx.font = `${fs}px Inter,sans-serif`;
        const axisText = cfg.labels[i];
        const axisW = ctx.measureText(axisText).width;
        if (cx - axisW / 2 > lastAxisRight + MIN_GAP) {
          ctx.fillText(axisText, cx, H - P.b + 19);
          lastAxisRight = cx + axisW / 2;
        }
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
