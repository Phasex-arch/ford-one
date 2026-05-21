/**
 * Rola suavemente para um elemento, descontando a altura do header.
 */
export function scrollToElement(el: HTMLElement, headerHeight = 72): void {
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Rola suavemente para um elemento pelo seletor CSS.
 */
export function scrollToSelector(selector: string, headerHeight = 72): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (el) scrollToElement(el, headerHeight);
}
