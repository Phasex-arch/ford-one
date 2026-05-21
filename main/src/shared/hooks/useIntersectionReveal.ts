import { useEffect, useRef } from 'react';

/**
 * Observa elementos com `data-delay` e adiciona a classe `.visible`
 * quando entram na viewport, disparando a animação CSS revealUp/revealRight.
 */
export function useIntersectionReveal(selectors: string[]) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const revealEl = (el: Element) => {
      const delay = parseInt((el as HTMLElement).dataset.delay ?? '0', 10);
      (el as HTMLElement).style.animationDelay = `${delay}ms`;
      el.classList.add('visible');

      if (el.classList.contains('tech-card')) {
        setTimeout(() => {
          el.querySelectorAll<HTMLElement>('.tech-bar-fill').forEach((fill) => {
            fill.style.width = `${fill.dataset.width ?? '0'}%`;
          });
        }, delay + 200);
      }
    };

    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealEl(entry.target);
            observerRef.current?.unobserve(entry.target);
          });
        },
        { threshold: 0.08 }
      );

      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          observerRef.current?.observe(el);
        });
      });
    } else {
      // Fallback: revela todos imediatamente
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach(revealEl);
      });
    }

    return () => observerRef.current?.disconnect();
  }, []);
}
