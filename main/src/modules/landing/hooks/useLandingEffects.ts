import { useEffect } from 'react';
import { useIntersectionReveal } from '../../../shared/hooks/useIntersectionReveal';
import { useSmoothScroll } from '../../../shared/hooks/useSmoothScroll';

const REVEAL_SELECTORS = [
  '.concept-card',
  '.tech-card',
  '.benefit-card',
  '.step',
  '.eco-node',
  '.vehicle-card',
  '.diff-item',
];

/**
 * Agrupa todos os efeitos visuais da landing page:
 * reveal por scroll, smooth scroll e linhas SVG do ecossistema.
 */
export function useLandingEffects() {
  useIntersectionReveal(REVEAL_SELECTORS);
  useSmoothScroll(72);

  // Linhas SVG do ecossistema
  useEffect(() => {
    const drawEcoLines = () => {
      const visual = document.querySelector<HTMLElement>('.ecosystem-visual');
      if (!visual) return;
      const old = visual.querySelector('.eco-svg');
      if (old) old.remove();

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('eco-svg');
      svg.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';

      const W = visual.offsetWidth, H = visual.offsetHeight;
      const cx = W / 2, cy = H / 2;

      ([[cx, 70], [W - 70, cy], [cx, H - 70], [70, cy]] as [number, number][]).forEach(
        ([x2, y2]) => {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(cx));
          line.setAttribute('y1', String(cy));
          line.setAttribute('x2', String(x2));
          line.setAttribute('y2', String(y2));
          line.setAttribute('stroke', 'rgba(23,0,244,0.2)');
          line.setAttribute('stroke-width', '1.5');
          line.setAttribute('stroke-dasharray', '4 6');
          svg.appendChild(line);
        }
      );
      visual.appendChild(svg);
    };

    const ecoSec = document.getElementById('ecossistema');
    let ecoObs: IntersectionObserver | null = null;

    if (ecoSec && 'IntersectionObserver' in window) {
      ecoObs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(drawEcoLines, 200);
            ecoObs?.unobserve(entry.target);
          }
        },
        { threshold: 0.2 }
      );
      ecoObs.observe(ecoSec);
    }

    window.addEventListener('resize', drawEcoLines);
    return () => {
      ecoObs?.disconnect();
      window.removeEventListener('resize', drawEcoLines);
    };
  }, []);

  // Parallax hero car
  useEffect(() => {
    if (!window.matchMedia('(min-width: 900px)').matches) return;

    const heroCar = document.querySelector<HTMLElement>('.hero-car');
    const heroSec = document.querySelector<HTMLElement>('.hero');
    if (!heroCar || !heroSec) return;

    const handler = () => {
      if (window.scrollY < heroSec.offsetHeight) {
        heroCar.style.transform = `translateY(calc(-50% + ${window.scrollY * 0.22}px))`;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
}
