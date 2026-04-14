/**
 * @file formatters.ts
 * @description Utilitários de formatação de dados — migrado de utils.js original.
 * Todas as funções são puras (sem efeitos colaterais) e sem dependências externas.
 *
 * Funções exportadas:
 * - cap(s)              → Capitaliza o primeiro caractere de uma string
 * - formatCurrency(n)   → Formata número como moeda BRL (ex: "R$ 299.900")
 *                         Aceita flag compact para formato abreviado ("R$ 300k")
 * - parseCurrency(str)  → Extrai número de string monetária formatada
 * - formatNumber(n)     → Formata número com separador de milhar pt-BR
 * - getIniciais(nome)   → Retorna as duas primeiras iniciais de um nome completo
 */

/** Capitaliza o primeiro caractere. */
export const cap = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

/** Formata número como moeda BRL. */
export const formatCurrency = (n: number, compact = false): string => {
  const num = Number(n) || 0;
  if (compact && num >= 1000) return 'R$ ' + Math.round(num / 1000) + 'k';
  return 'R$ ' + num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

/** Extrai número de string monetária. */
export const parseCurrency = (str: string | number): number =>
  parseFloat(String(str).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

/** Formata número com separador pt-BR. */
export const formatNumber = (n: number): string =>
  Number(n).toLocaleString('pt-BR');

/** Retorna as iniciais de um nome (máx. 2 letras). */
export const getIniciais = (nome: string): string =>
  nome.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
