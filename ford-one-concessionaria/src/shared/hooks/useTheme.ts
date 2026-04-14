/**
 * @file useTheme.ts
 * @description Hook de controle do tema claro/escuro.
 * Equivalente React da função setTheme() do script.js original.
 *
 * Comportamento:
 * - Lê o tema salvo no localStorage ('fo-theme') na inicialização
 * - Aplica o atributo data-theme no <html> sempre que o tema muda
 * - Persiste a preferência no localStorage entre sessões
 *
 * Retorna:
 * - theme     → 'light' | 'dark'
 * - setTheme  → Função para trocar o tema
 *
 * As variáveis CSS do tema ficam em styles/themes/_theme.scss e são
 * sobrescritas automaticamente pelo seletor [data-theme="dark"].
 */

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('fo-theme') as Theme) || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('fo-theme', t);
  };

  return { theme, setTheme };
}
