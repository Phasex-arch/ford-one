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

import { useState, useCallback } from 'react';
import { DASH_DATA, type DashPeriod } from '../../../data/dashboard.data';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

export interface KpiItem {
  ic: string; fa: string; lbl: string; val: string;
  delta: string; cls: string; key: string;
}

export function useDashboard() {
  const [period, setPeriod] = useState<DashPeriod>('mes');

  const getKpis = useCallback((p: DashPeriod): KpiItem[] => {
    const d = DASH_DATA[p];
    return [
      { ic:'ic-blue',   fa:'ph-lightning',       lbl:'Leads do Dia', val:formatNumber(d.leads),         delta:'+8%',    cls:'pos', key:'leads'        },
      { ic:'ic-teal',   fa:'ph-calendar-dots',   lbl:'Agendamentos', val:formatNumber(d.ag),            delta:'+3',     cls:'pos', key:'agendamentos'  },
      { ic:'ic-green',  fa:'ph-currency-dollar', lbl:'Receita',      val:formatCurrency(d.rec),         delta:'+12.4%', cls:'pos', key:'receita'       },
      { ic:'ic-orange', fa:'ph-trend-up',        lbl:'Conversão',    val:d.conv.toFixed(1) + '%',       delta:'+2.1pp', cls:'pos', key:'conversao'     },
      { ic:'ic-purple', fa:'ph-star',            lbl:'NPS',          val:d.nota.toFixed(1),             delta:'Ótimo',  cls:'pos', key:'nota'          },
      { ic:'ic-navy',   fa:'ph-clock',           lbl:'SLA Médio',    val:d.sla.toFixed(1) + 'h',        delta:'Meta 4h',cls:'pos', key:'sla'           },
      { ic:'ic-gold',   fa:'ph-car',             lbl:'Estoque',      val:formatNumber(d.estq) + ' un.', delta:'142 disp',cls:'pos',key:'estoque'       },
    ];
  }, []);

  const handlePeriodChange = useCallback((p: DashPeriod) => setPeriod(p), []);

  return { period, handlePeriodChange, kpis: getKpis(period) };
}
