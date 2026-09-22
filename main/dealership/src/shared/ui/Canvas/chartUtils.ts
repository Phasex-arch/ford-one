/**
 * @file chartUtils.ts
 * @description Utilitários compartilhados pelos hooks de gráfico em canvas.
 */

import { useEffect, useState } from 'react';

/**
 * Contador que muda quando o tamanho do canvas muda — entra nas deps dos
 * hooks de gráfico pra redesenharem no tamanho novo. Sem isso o bitmap antigo
 * era só esticado/espremido pelo CSS (texto encolhia ao girar o celular,
 * estreitar a janela ou recolher a sidebar). ResizeObserver no próprio canvas
 * em vez de window.resize: mede o tamanho final, já depois das transições do
 * layout, e pega mudanças que não vêm da janela (sidebar).
 */
export function useCanvasResizeTick(canvasId: string, deps: unknown[]): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const el = document.getElementById(canvasId);
    if (!el || typeof ResizeObserver === 'undefined') return;
    let last = '';
    const ro = new ResizeObserver(() => {
      const size = `${el.offsetWidth}x${el.offsetHeight}`;
      if (last && size !== last) setTick(t => t + 1);
      last = size;
    });
    ro.observe(el);
    return () => ro.disconnect();
  // Reanexa quando as deps mudam: o canvas pode só existir depois dos dados.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, ...deps]);
  return tick;
}

/**
 * Teto do eixo Y (grid de 4 divisões): múltiplo de 4 com ~15% de folga, pros
 * ticks saírem inteiros e sem repetir — antes, com a série toda em zero, o
 * teto era 1 e o eixo mostrava "1%, 1%, 1%, 0%, 0%".
 */
export const niceMax = (max: number) => Math.max(4, Math.ceil((max * 1.15) / 4) * 4);

/**
 * De quantos em quantos rótulos do eixo X desenhar pra não se sobreporem
 * (ex.: 12 meses no celular). Usa a fonte já setada no ctx.
 */
export function labelStep(ctx: CanvasRenderingContext2D, labels: string[], slotW: number): number {
  const maxW = Math.max(0, ...labels.map(l => ctx.measureText(l).width));
  return Math.max(1, Math.ceil((maxW + 6) / slotW));
}

/** Desenha o rótulo i? Ancorado no último (mês mais recente sempre aparece). */
export const showLabel = (i: number, n: number, step: number) => (n - 1 - i) % step === 0;

/**
 * Valores fixos em cima das barras só se o maior deles couber no espaço de
 * cada barra — tudo ou nada, pra não sobrar um rótulo solto só nas barras de
 * texto curto. Quando não cabe (12 meses no celular), o valor aparece no
 * toque/hover. Usa a fonte já setada no ctx.
 */
export function valuesFit(ctx: CanvasRenderingContext2D, texts: string[], slotW: number): boolean {
  return Math.max(0, ...texts.map(t => ctx.measureText(t).width)) <= slotW;
}
