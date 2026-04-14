/**
 * @file desempenho.screen.tsx
 * @module desempenho
 * @description Tela de Desempenho — performance da equipe e indicadores operacionais.
 *
 * Composição:
 * - Header
 * - KPI Grid: Retenção (84%), Giro de Estoque (28 dias),
 *   Produtividade (91%), Follow-up (67%)
 * - Dois gráficos canvas:
 *   → consultorChart: barras com % de performance por consultor (5 consultores)
 *   → retencaoChart: linha com evolução da taxa de retenção (Jan–Jun/2026)
 *
 * Gráficos renderizados via useBarChart e useLineChart de shared/ui/Canvas.
 */

import React from 'react';
import { useBarChart } from '../../shared/ui/Canvas/useBarChart';
import { useLineChart } from '../../shared/ui/Canvas/useLineChart';

export const DesempenhoScreen: React.FC = () => {
  useBarChart('consultorChart',{labels:['Ricardo C.','Patrícia O.','Lucas M.','Amanda R.','Fernando B.'],data:[94,87,91,78,85],color:'#1700f4',unit:'%'},[]);
  useLineChart('retencaoChart',{labels:['Jan','Fev','Mar','Abr','Mai','Jun'],sets:[{data:[79,81,80,83,84,84],color:'#10B981',fill:true}],unit:'%'},[]);
  const kpis=[{ic:'ic-blue',fa:'ph-users',lbl:'Retenção',val:'84%',delta:'+3pp',cls:'pos'},{ic:'ic-orange',fa:'ph-car',lbl:'Giro',val:'28 dias',delta:'-4 dias',cls:'pos'},{ic:'ic-green',fa:'ph-wrench',lbl:'Produtividade',val:'91%',delta:'Meta: 85%',cls:'pos'},{ic:'ic-purple',fa:'ph-phone',lbl:'Follow-up',val:'67%',delta:'-2pp vs meta',cls:'neg'}];
  return (
    <section className="module active" id="mod-desempenho">
      <div className="mod-header"><div><h1>Desempenho</h1><p className="mod-sub">Performance da equipe e indicadores operacionais</p></div></div>
      <div className="kpi-grid" id="desempKpis">
        {kpis.map(k=><div key={k.lbl} className="kpi-card"><div className={`kpi-ic ${k.ic}`}><i className={`ph-bold ${k.fa}`}/></div><div className="kpi-body"><span className="kpi-lbl">{k.lbl}</span><span className="kpi-val">{k.val}</span><span className={`kpi-delta ${k.cls}`}>{k.delta}</span></div></div>)}
      </div>
      <div className="dash-row">
        <div className="chart-card"><div className="chart-head"><h3>Performance por Consultor</h3></div><canvas id="consultorChart"/></div>
        <div className="chart-card"><div className="chart-head"><h3>Retenção de Clientes</h3></div><canvas id="retencaoChart"/></div>
      </div>
    </section>
  );
};