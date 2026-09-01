/**
 * @file dates.ts
 * @description Utilitários de data e hora — migrado de utils.js original.
 * Todas as funções são puras e não dependem de bibliotecas externas.
 *
 * Funções e constantes exportadas:
 * - nowStr()    → Hora atual no formato "HH:MM" (ex: "14:32")
 * - todayLabel()→ Data atual por extenso em pt-BR (ex: "Segunda-feira, 14 de abril de 2026")
 * - DAYS        → Array com nomes dos dias da semana em português
 * - MONTHS      → Array com nomes dos meses em português
 */

export const nowStr = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

export const todayLabel = (): string =>
  new Date()
    .toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

export const DAYS   = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
export const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
