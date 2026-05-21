/**
 * @file receita.screen.tsx
 * @module receita
 * @description Tela de Receita — análise financeira do período.
 *
 * Composição:
 * - Header
 * - KPI Grid: Receita Total, Confirmada, Ticket Médio, Conversão
 * - Dois gráficos canvas lado a lado:
 *   → receitaCateg: pizza com receita por categoria (Vendas Novas, Seminovos,
 *     Serviços, Peças, F&I)
 *   → receitaTrim: linha com evolução trimestral (Q1/2024 → Q1/2026)
 *
 * Gráficos renderizados via usePieChart e useLineChart de shared/ui/Canvas.
 * As dependências [] garantem renderização única ao montar o componente.
 */

import React from 'react';
import { useLineChart } from '../../shared/ui/Canvas/useLineChart';
import { usePieChart } from '../../shared/ui/Canvas/usePieChart';
import { formatCurrency } from '../../shared/utils/formatters';

export const ReceitaScreen: React.FC = () => {
  useLineChart('receitaTrim',{labels:['Q1 2024','Q2 2024','Q3 2024','Q4 2024','Q1 2026'],sets:[{data:[2100,2450,2280,2900,3100],color:'#1700f4',fill:true}],unit:'k'},[]);
  usePieChart('receitaCateg',{labels:['Vendas Novas','Seminovos','Serviços','Peças','F&I'],data:[52,18,16,9,5],colors:['#1700f4','#0a0f7a','#10B981','#F59E0B','#8B5CF6']},[]);
  const kpis=[{ic:'ic-blue',fa:'ph-currency-dollar',lbl:'Receita',val:'R$ 1.248.000',delta:'este mês',cls:'pos'},{ic:'ic-green',fa:'ph-check-circle',lbl:'Confirmada',val:'R$ 874.320',delta:'+8.3%',cls:'pos'},{ic:'ic-orange',fa:'ph-users',lbl:'Ticket Médio',val:'R$ 48.600',delta:'+4.1%',cls:'pos'},{ic:'ic-purple',fa:'ph-trend-up',lbl:'Conversão',val:'34.2%',delta:'+2.1pp',cls:'pos'}];
  return (
    <section className="module active" id="mod-receita">
      <div className="mod-header"><div><h1>Receita</h1><p className="mod-sub">Análise de receita e performance financeira</p></div></div>
      <div className="kpi-grid" id="receitaKpis">
        {kpis.map(k=><div key={k.lbl} className="kpi-card"><div className={`kpi-ic ${k.ic}`}><i className={`ph-bold ${k.fa}`}/></div><div className="kpi-body"><span className="kpi-lbl">{k.lbl}</span><span className="kpi-val">{k.val}</span><span className={`kpi-delta ${k.cls}`}>{k.delta}</span></div></div>)}
      </div>
      <div className="dash-row">
        <div className="chart-card"><div className="chart-head"><h3>Receita por Categoria</h3></div><canvas id="receitaCateg"/></div>
        <div className="chart-card"><div className="chart-head"><h3>Receita Trimestral</h3></div><canvas id="receitaTrim"/></div>
      </div>
    </section>
  );
};