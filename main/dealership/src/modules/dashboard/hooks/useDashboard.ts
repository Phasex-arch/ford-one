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
 * Os dados por período vêm de data/dashboard.data.ts (DASH_DATA).
 * Os valores são formatados com formatCurrency e formatNumber de shared/utils.
 */

import { useState, useCallback, useEffect } from 'react';
import { type DashPeriod, type DashData } from '../../../data/dashboard.data';
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
  leads?: number;
  ag?: number;
  rec?: number;
  conv?: number;
  sla?: number;
  nota?: number;
  estq?: number;
}

function normalizeDashboard(response: DashboardApiResponse): DashData {
  const kpis = response.kpis ?? {
    leads: response.leads,
    agendamentos: response.ag,
    receita: response.rec,
    conversao: response.conv,
    sla: response.sla,
    nota: response.nota,
    estoque: response.estq,
  };
  return {
    leads: kpis.leads ?? 0,
    ag: kpis.agendamentos ?? response.ag ?? 0,
    rec: kpis.receita ?? response.rec ?? 0,
    conv: kpis.conversao ?? response.conv ?? 0,
    sla: kpis.sla ?? 0,
    nota: kpis.nota ?? 0,
    estq: kpis.estoque ?? response.estq ?? 0,
  };
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

  const getKpis = useCallback((p: DashPeriod): KpiItem[] => {
    const d = data;
    if (!d) return [];
    return [
      { ic:'ic-blue',   fa:'ph-lightning',       lbl:'Leads do Dia', val:formatNumber(d.leads ?? 0),         delta:'+8%',    cls:'pos', key:'leads'        },
      { ic:'ic-teal',   fa:'ph-calendar-dots',   lbl:'Agendamentos', val:formatNumber(d.ag ?? 0),            delta:'+3',     cls:'pos', key:'agendamentos'  },
      { ic:'ic-green',  fa:'ph-currency-dollar', lbl:'Receita',      val:formatCurrency(d.rec ?? 0),         delta:'+12.4%', cls:'pos', key:'receita'       },
      { ic:'ic-orange', fa:'ph-trend-up',        lbl:'Conversão',    val:(d.conv ?? 0).toFixed(1) + '%',       delta:'+2.1pp', cls:'pos', key:'conversao'     },
      { ic:'ic-purple', fa:'ph-star',            lbl:'NPS',           val:(d.nota ?? 0).toFixed(1),             delta:'Ótimo',  cls:'pos', key:'nota'          },
      { ic:'ic-navy',   fa:'ph-clock',           lbl:'SLA Médio',    val:(d.sla ?? 0).toFixed(1) + 'h',        delta:'Meta 4h',cls:'pos', key:'sla'           },
      { ic:'ic-gold',   fa:'ph-car',             lbl:'Estoque',      val:formatNumber(d.estq ?? 0) + ' un.', delta:'142 disp',cls:'pos',key:'estoque'        },
    ];
  }, [data]);

  const handlePeriodChange = useCallback((p: DashPeriod) => setPeriod(p), []);

  return { period, handlePeriodChange, kpis: getKpis(period), loading, error, data };
}
