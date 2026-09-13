/**
 * @file desempenho.service.ts
 * @module desempenho
 * @description Service de acesso ao snapshot de performance da equipe.
 * Busca em GET /api/dashboard/desempenho — sem dado mockado.
 */

import { apiRequest } from '../../../shared/api/client';

export interface DesempenhoSnapshot {
  kpis: {
    retencao: number;
    produtividade: number;
  };
  consultores: { nome: string; conversao: number }[];
  retencaoMensal: { labels: string[]; valores: number[] };
  geradoEm: string;
}

export async function fetchDesempenho(): Promise<DesempenhoSnapshot> {
  return apiRequest<DesempenhoSnapshot>('/dashboard/desempenho');
}
