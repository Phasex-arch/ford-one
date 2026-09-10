/**
 * @file dashboard.data.ts
 * @description Contrato de tela do Dashboard: DashPeriod (hoje/semana/mes/trimestre)
 * e DashData (forma normalizada dos KPIs).
 *
 * Os valores vêm de GET /dashboard?periodo=… — useDashboard.ts normaliza a
 * resposta para DashData. Os mocks que moravam aqui foram removidos.
 */

export type DashPeriod = 'hoje' | 'semana' | 'mes' | 'trimestre';

export interface DashData {
  leads: number;
  ag: number;
  rec: number;
  conv: number;
  sla: number;
  nota: number;
  estq: number;
  revenue?: { labels: string[]; actual: number[]; target?: number[] };
  conversion?: { labels: string[]; values: number[] };
}
