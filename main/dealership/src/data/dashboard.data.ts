/**
 * @file dashboard.data.ts
 * @description Tipos do módulo Dashboard: período selecionável e o formato
 * normalizado que useDashboard.ts monta a partir da resposta real de
 * GET /api/dashboard?periodo=X (kpis.* + series.* para os gráficos de
 * receita mensal e conversão de leads). Não há dado mockado aqui — os
 * valores vêm sempre da API.
 */

export type DashPeriod = 'hoje' | 'semana' | 'mes' | 'trimestre';

export interface DashDeltas {
  leads: number | null;
  agendamentos: number | null;
  receita: number | null;
  conversao: number | null;
  sla: number | null;
  nota: number | null;
  estoque: number | null;
}

export interface DashAlertas {
  slaRisco: { quantidade: number } | null;
  estoqueBaixo: { modelo: string; versao: string; quantidade: number } | null;
  leadPrioritario: { cliente: string; veiculo: string; valor: number } | null;
  metaAtingida: { titulo: string; atual: number; alvo: number; unidade: string } | null;
}

export interface DashData {
  leads: number;
  ag: number;
  rec: number;
  conv: number;
  sla: number;
  nota: number;
  estq: number;
  deltas: DashDeltas;
  alertas: DashAlertas;
  revenue?: { labels: string[]; actual: number[]; target?: number[] };
  conversion?: { labels: string[]; values: number[] };
}
