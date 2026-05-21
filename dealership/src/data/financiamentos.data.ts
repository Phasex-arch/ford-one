/**
 * @file financiamentos.data.ts
 * @description Dados mockados da carteira de financiamentos.
 * 5 contratos com cliente, veículo, valor, entrada, prazo, taxa mensal,
 * parcela calculada e status (aprovado/analise/pendente/reprovado).
 *
 * Em produção: substituir por chamada GET /api/financiamentos.
 */

import type { Financiamento } from '../types/global.types';

export const FINANCIAMENTOS_INICIAL: Financiamento[] = [
  { id:'F001', cli:'Carlos Eduardo Mendes',  ini:'CM', veiculo:'Bronco Sport Badlands 2024', valor:189900, entrada:38000, prazo:48, taxa:1.49, parcela:3842, status:'aprovado', data:'Mar 2024' },
  { id:'F002', cli:'Ana Paula Rodrigues',    ini:'AR', veiculo:'Territory Titanium 2026',    valor:179900, entrada:30000, prazo:60, taxa:1.52, parcela:3104, status:'aprovado', data:'Jan 2026' },
  { id:'F003', cli:'Juliana Cardoso Santos', ini:'JC', veiculo:'Maverick Hybrid 2026',       valor:189900, entrada:20000, prazo:60, taxa:1.55, parcela:3598, status:'analise',  data:'Abr 2026' },
  { id:'F004', cli:'Roberto Figueiredo',     ini:'RF', veiculo:'Mustang GT 2024',            valor:389900, entrada:80000, prazo:48, taxa:1.65, parcela:8294, status:'pendente', data:'Abr 2026' },
  { id:'F005', cli:'Alexandre Torres',       ini:'AT', veiculo:'Ranger XLS 2026',            valor:219900, entrada:44000, prazo:36, taxa:1.49, parcela:6218, status:'aprovado', data:'Mar 2026' },
];
