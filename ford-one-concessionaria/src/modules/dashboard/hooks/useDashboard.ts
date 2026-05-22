/**
 * @file useDashboard.ts
 * @module dashboard
 * @description Hook de estado e logica do modulo Dashboard.
 *
 * Busca KPIs em /api/v1/dashboard?periodo=<p>. Como o payload exato da API
 * pode variar, fazemos coercao defensiva e cobrimos os campos esperados
 * (leads, agendamentos, receita, conversao, sla, nota, estoque), com
 * fallback para o mock local em caso de erro.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  DASH_DATA,
  type DashData,
  type DashPeriod,
} from '../../../data/dashboard.data';
import { snapshot } from '../../../shared/api/resources/dashboard';
import { extractErrorMessage } from '../../../shared/api/http';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

export interface KpiItem {
  ic: string;
  fa: string;
  lbl: string;
  val: string;
  delta: string;
  cls: string;
  key: string;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && !Number.isNaN(Number(value))) return Number(value);
  return fallback;
}

function pick<T extends Record<string, unknown>>(obj: T, keys: string[]): unknown {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function coerceDashData(payload: unknown, period: DashPeriod): DashData {
  const fallback = DASH_DATA[period];
  if (!payload || typeof payload !== 'object') return fallback;
  const p = payload as Record<string, unknown>;
  return {
    leads: asNumber(pick(p, ['leads', 'leadsDia', 'totalLeads']), fallback.leads),
    ag: asNumber(pick(p, ['agendamentos', 'ag']), fallback.ag),
    rec: asNumber(pick(p, ['receita', 'rec']), fallback.rec),
    conv: asNumber(pick(p, ['conversao', 'conv']), fallback.conv),
    sla: asNumber(pick(p, ['sla', 'slaMedio']), fallback.sla),
    nota: asNumber(pick(p, ['nota', 'nps', 'nota_nps']), fallback.nota),
    estq: asNumber(pick(p, ['estoque', 'estq']), fallback.estq),
  };
}

function buildKpis(d: DashData): KpiItem[] {
  return [
    { ic: 'ic-blue',   fa: 'ph-lightning',       lbl: 'Leads do Dia', val: formatNumber(d.leads),         delta: '+8%',     cls: 'pos', key: 'leads'        },
    { ic: 'ic-teal',   fa: 'ph-calendar-dots',   lbl: 'Agendamentos', val: formatNumber(d.ag),            delta: '+3',      cls: 'pos', key: 'agendamentos' },
    { ic: 'ic-green',  fa: 'ph-currency-dollar', lbl: 'Receita',      val: formatCurrency(d.rec),         delta: '+12.4%',  cls: 'pos', key: 'receita'      },
    { ic: 'ic-orange', fa: 'ph-trend-up',        lbl: 'Conversão',    val: d.conv.toFixed(1) + '%',       delta: '+2.1pp',  cls: 'pos', key: 'conversao'    },
    { ic: 'ic-purple', fa: 'ph-star',            lbl: 'NPS',          val: d.nota.toFixed(1),             delta: 'Ótimo',   cls: 'pos', key: 'nota'         },
    { ic: 'ic-navy',   fa: 'ph-clock',           lbl: 'SLA Médio',    val: d.sla.toFixed(1) + 'h',        delta: 'Meta 4h', cls: 'pos', key: 'sla'          },
    { ic: 'ic-gold',   fa: 'ph-car',             lbl: 'Estoque',      val: formatNumber(d.estq) + ' un.', delta: '142 disp',cls: 'pos', key: 'estoque'      },
  ];
}

export function useDashboard() {
  const [period, setPeriod] = useState<DashPeriod>('mes');
  const [data, setData] = useState<DashData>(() => DASH_DATA.mes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (p: DashPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await snapshot(p);
      setData(coerceDashData(payload, p));
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao carregar dashboard.'));
      setData(DASH_DATA[p]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(period); }, [period, refresh]);

  const handlePeriodChange = useCallback((p: DashPeriod) => setPeriod(p), []);

  return {
    period,
    handlePeriodChange,
    kpis: buildKpis(data),
    loading,
    error,
    refresh: () => refresh(period),
  };
}
