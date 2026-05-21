import { useEffect, useState } from 'react';

/**
 * Detecta scroll e retorna true quando a página passou do threshold.
 * Usado para aplicar o estilo "scrolled" no header.
 */
export function useScrollHeader(threshold = 55): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);

  return scrolled;
}
