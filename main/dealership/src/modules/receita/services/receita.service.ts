/**
 * @file receita.service.ts
 * @module receita
 * @description Service de acesso ao snapshot financeiro do mês corrente.
 * Busca em GET /api/dashboard/receita — sem dado mockado. A mesma definição
 * de receita usada no Dashboard (financiamento aprovado + serviço concluído),
 * só que separada em confirmada vs. total (com pipeline em aberto) e por
 * categoria (financiamentos vs. serviços — as únicas duas fontes reais).
 */

import { apiRequest } from '../../../shared/api/client';

export interface ReceitaSnapshot {
  kpis: {
    total: number;
    confirmada: number;
    ticketMedio: number;
    conversao: number;
  };
  categorias: { financiamentos: number; servicos: number };
  trimestral: { labels: string[]; valores: number[] };
  geradoEm: string;
}

export async function fetchReceita(): Promise<ReceitaSnapshot> {
  return apiRequest<ReceitaSnapshot>('/dashboard/receita');
}
