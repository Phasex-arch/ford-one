import { useEffect } from 'react';
import { scrollToElement } from '../utils/scroll';

/**
 * Intercepta cliques em âncoras internas (#) e aplica scroll suave
 * descontando a altura do header fixo.
 */
export function useSmoothScroll(headerHeight = 72) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.querySelector<HTMLElement>(href);
      if (el) {
        e.preventDefault();
        scrollToElement(el, headerHeight);
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [headerHeight]);
}
