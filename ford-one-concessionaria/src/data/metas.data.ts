/**
 * @file metas.data.ts
 * @description Dados mockados das metas comerciais do período Abril/2026.
 * 6 metas cobrindo: vendas, receita, NPS, SLA, leads qualificados e conversão.
 * Cada meta tem valor atual, alvo, unidade, responsável e flag lowerIsBetter
 * (true para SLA: quanto menor, melhor).
 *
 * Em produção: substituir por chamada GET /api/metas.
 */

import type { Meta } from '../types/global.types';

export const METAS_INICIAL: Meta[] = [
  { id:'M001', titulo:'Vendas Mensais',     periodo:'Abril/2026', indicador:'vendas',  atual:22,      alvo:28,      unidade:'un.',   responsavel:'Equipe Comercial',      lowerIsBetter:false },
  { id:'M002', titulo:'Receita Mensal',     periodo:'Abril/2026', indicador:'receita', atual:1248000, alvo:1200000, unidade:'R$',    responsavel:'Toda a Concessionária', lowerIsBetter:false },
  { id:'M003', titulo:'NPS',                periodo:'Abril/2026', indicador:'nps',     atual:72,      alvo:70,      unidade:'pts',   responsavel:'Atendimento',           lowerIsBetter:false },
  { id:'M004', titulo:'SLA Médio',          periodo:'Abril/2026', indicador:'sla',     atual:2.3,     alvo:4,       unidade:'h',     responsavel:'Equipe Técnica',        lowerIsBetter:true  },
  { id:'M005', titulo:'Leads Qualificados', periodo:'Abril/2026', indicador:'leads',   atual:61,      alvo:80,      unidade:'leads', responsavel:'Marketing',             lowerIsBetter:false },
  { id:'M006', titulo:'Taxa de Conversão',  periodo:'Abril/2026', indicador:'conv',    atual:34.2,    alvo:32,      unidade:'%',     responsavel:'Ricardo Costa',         lowerIsBetter:false },
];
