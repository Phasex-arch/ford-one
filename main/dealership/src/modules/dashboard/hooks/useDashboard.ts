/**
 * @file useDashboard.ts
 * @module dashboard
 * @description Hook de estado e lógica do módulo Dashboard.
 *
 * Gerencia:
 * - period: período selecionado (hoje/semana/mes/trimestre)
 * - handlePeriodChange: atualiza o período e reconstrói os KPIs
 * - getKpis: mapeia os dados do período selecionado para o formato KpiItem
 *   com ícone, label, valor formatado, delta e chave de identificação
 *
 * Os dados vêm de GET /api/dashboard?periodo=X — kpis.* alimenta os cards,
 * deltas.* alimenta os badges de variação (calculados no backend contra o
 * período anterior de mesma duração, nunca inventados no front) e series.*
 * (últimos 6 meses de receita e conversão) alimenta o RevenueChart.
 */

import { useState, useCallback, useEffect } from 'react';
import { type DashPeriod, type DashData, type DashDeltas, type DashAlertas } from '../../../data/dashboard.data';
import { apiRequest } from '../../../shared/api/client';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

export interface KpiItem {
  ic: string; fa: string; lbl: string; val: string;
  delta: string; cls: string; key: string;
}

interface DashboardApiResponse {
  kpis?: {
    leads?: number;
    agendamentos?: number;
    receita?: number;
    conversao?: number;
    sla?: number;
    nota?: number;
    estoque?: number;
  };
  deltas?: DashDeltas;
  alertas?: DashAlertas;
  series?: {
    labels: string[];
    revenue: number[];
    target: number[];
    conversion: number[];
    conversionCount: number[];
    revenuePrevYear?: number[];
  };
}

const DELTAS_VAZIOS: DashDeltas = {
  leads: null, agendamentos: null, receita: null, conversao: null, sla: null, nota: null, estoque: null,
};

const ALERTAS_VAZIOS: DashAlertas = {
  slaRisco: null, estoqueBaixo: null, leadPrioritario: null, metaAtingida: null,
};

function normalizeDashboard(response: DashboardApiResponse): DashData {
  const kpis = response.kpis ?? {};
  const series = response.series;
  return {
    leads: kpis.leads ?? 0,
    ag: kpis.agendamentos ?? 0,
    rec: kpis.receita ?? 0,
    conv: kpis.conversao ?? 0,
    sla: kpis.sla ?? 0,
    nota: kpis.nota ?? 0,
    estq: kpis.estoque ?? 0,
    deltas: response.deltas ?? DELTAS_VAZIOS,
    alertas: response.alertas ?? ALERTAS_VAZIOS,
    revenue: series ? { labels: series.labels, actual: series.revenue, target: series.target, prevYear: series.revenuePrevYear } : undefined,
    conversion: series ? { labels: series.labels, values: series.conversion, counts: series.conversionCount } : undefined,
  };
}

/**
 * Formata um delta numérico (ou `null`, quando não há período anterior pra
 * comparar) em texto de badge + classe de cor. `invert` é usado pra métricas
 * onde "menor é melhor" (SLA): uma variação negativa aí é favorável.
 */
function formatDelta(
  value: number | null,
  { suffix, invert = false, decimals = 1 }: { suffix: string; invert?: boolean; decimals?: number },
): { text: string; cls: string } {
  if (value === null) return { text: 'Sem histórico', cls: 'neu' };
  if (value === 0) return { text: `0${suffix}`, cls: 'neu' };
  const favoravel = invert ? value < 0 : value > 0;
  const sinal = value > 0 ? '+' : '';
  return { text: `${sinal}${value.toFixed(decimals)}${suffix}`, cls: favoravel ? 'pos' : 'neg' };
}

export function useDashboard() {
  const [period, setPeriod] = useState<DashPeriod>('mes');
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    setError('');
    apiRequest<DashboardApiResponse>(`/dashboard?periodo=${period}`)
      .then(response => setData(normalizeDashboard(response)))
      .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar dashboard.'))
      .finally(() => setLoading(false));
  }, [period]);

  const getKpis = useCallback((): KpiItem[] => {
    const d = data;
    if (!d) return [];
    const dl = d.deltas;
    const leads = formatDelta(dl.leads, { suffix: '%' });
    const agendamentos = formatDelta(dl.agendamentos, { suffix: '%' });
    const receita = formatDelta(dl.receita, { suffix: '%' });
    const conversao = formatDelta(dl.conversao, { suffix: 'pp' });
    const nota = formatDelta(dl.nota, { suffix: '', decimals: 1 });
    const sla = formatDelta(dl.sla, { suffix: '%', invert: true });
    const estoque = formatDelta(dl.estoque, { suffix: '%' });
    return [
      { ic:'ic-blue',   fa:'ph-lightning',       lbl:'Leads do Período', val:formatNumber(d.leads ?? 0),         delta:leads.text,        cls:leads.cls,        key:'leads'        },
      { ic:'ic-teal',   fa:'ph-calendar-dots',   lbl:'Agendamentos',     val:formatNumber(d.ag ?? 0),            delta:agendamentos.text, cls:agendamentos.cls, key:'agendamentos' },
      { ic:'ic-green',  fa:'ph-currency-dollar', lbl:'Receita',          val:formatCurrency(d.rec ?? 0),         delta:receita.text,      cls:receita.cls,      key:'receita'      },
      { ic:'ic-orange', fa:'ph-trend-up',        lbl:'Conversão',        val:(d.conv ?? 0).toFixed(1) + '%',     delta:conversao.text,    cls:conversao.cls,    key:'conversao'    },
      { ic:'ic-purple', fa:'ph-star',            lbl:'NPS',              val:(d.nota ?? 0).toFixed(1),           delta:nota.text,         cls:nota.cls,         key:'nota'         },
      { ic:'ic-navy',   fa:'ph-clock',           lbl:'SLA Médio',        val:(d.sla ?? 0).toFixed(1) + 'h',      delta:sla.text,          cls:sla.cls,          key:'sla'          },
      { ic:'ic-gold',   fa:'ph-car',             lbl:'Estoque',          val:formatNumber(d.estq ?? 0) + ' un.', delta:estoque.text,      cls:estoque.cls,      key:'estoque'      },
    ];
  }, [data]);

  const handlePeriodChange = useCallback((p: DashPeriod) => setPeriod(p), []);

  return { period, handlePeriodChange, kpis: getKpis(), loading, error, data };
}
