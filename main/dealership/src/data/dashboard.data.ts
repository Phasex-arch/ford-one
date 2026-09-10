/**
 * @file dashboard.data.ts
 * @description Dados mockados dos KPIs do Dashboard por período.
 * Quatro períodos: hoje, semana, mes, trimestre.
 * Cada período contém: leads, agendamentos, receita, conversão, SLA, nota e estoque.
 * Exporta também o tipo DashPeriod e a interface DashData.
 *
 * Em produção: substituir por chamada GET /api/dashboard?periodo=mes.
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

export const DASH_DATA: Record<DashPeriod, DashData> = {
  hoje:      { leads:8,   ag:5,   rec:48200,   conv:36.4, sla:2.1, nota:4.8, estq:142 },
  semana:    { leads:61,  ag:34,  rec:287000,  conv:33.8, sla:2.4, nota:4.8, estq:142 },
  mes:       { leads:238, ag:158, rec:1248000, conv:34.2, sla:2.3, nota:4.8, estq:142 },
  trimestre: { leads:712, ag:492, rec:3780000, conv:33.1, sla:2.4, nota:4.8, estq:142 },
};
