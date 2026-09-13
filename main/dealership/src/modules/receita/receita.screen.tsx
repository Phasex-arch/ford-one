/**
 * @file receita.screen.tsx
 * @module receita
 * @description Tela de Receita — análise financeira do mês corrente.
 * Dados reais de GET /api/dashboard/receita — nada fixo.
 *
 * Composição:
 * - Header
 * - KPI Grid: Receita Total (confirmada + pipeline), Confirmada (só o que já
 *   fechou), Ticket Médio (financiamentos aprovados), Conversão
 * - Dois gráficos canvas lado a lado:
 *   → receitaCateg: pizza com receita por categoria — Financiamentos vs.
 *     Serviços, as únicas duas fontes de receita reais no sistema (o antigo
 *     gráfico tinha 5 categorias inventadas: Vendas Novas, Seminovos, Peças,
 *     F&I — nenhuma existe no schema)
 *   → receitaTrim: linha com evolução dos últimos 6 trimestres civis, real
 *
 * Gráficos renderizados via usePieChart e useLineChart de shared/ui/Canvas.
 */

import React, { useEffect } from 'react';
import { useReceita } from './hooks/useReceita';
import { useLineChart } from '../../shared/ui/Canvas/useLineChart';
import { usePieChart } from '../../shared/ui/Canvas/usePieChart';
import { formatCurrency } from '../../shared/utils/formatters';

export const ReceitaScreen: React.FC = () => {
  const { data, loading, error } = useReceita();

  // unit:'k' só faz sentido se o valor já estiver em milhares — o eixo Y
  // apenas concatena o número com o sufixo, sem dividir nada.
  useLineChart('receitaTrim', data ? {
    labels: data.trimestral.labels,
    sets: [{ data: data.trimestral.valores.map(v => Math.round(v / 1000)), color: '#1700f4', fill: true }],
    unit: 'k',
  } : null, [data]);

  // usePieChart espera percentuais prontos em `data` (rotula cada fatia com
  // "valor%" direto, sem converter) — nunca passar os valores em reais aqui.
  const pctCategorias = data ? (() => {
    const total = data.categorias.financiamentos + data.categorias.servicos;
    const financiamentos = total > 0 ? Math.round((data.categorias.financiamentos / total) * 100) : 0;
    return { financiamentos, servicos: total > 0 ? 100 - financiamentos : 0 };
  })() : null;

  usePieChart('receitaCateg', pctCategorias ? {
    labels: ['Financiamentos', 'Serviços'],
    data: [pctCategorias.financiamentos, pctCategorias.servicos],
    colors: ['#1700f4', '#10B981'],
  } : null, [pctCategorias]);

  useEffect(() => {
    const handleResize = () => window.dispatchEvent(new Event('ford:redrawCharts'));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const kpis = data ? [
    { ic: 'ic-blue', fa: 'ph-currency-dollar', lbl: 'Receita', val: formatCurrency(data.kpis.total), delta: 'c/ pipeline', cls: 'neu' },
    { ic: 'ic-green', fa: 'ph-check-circle', lbl: 'Confirmada', val: formatCurrency(data.kpis.confirmada), delta: 'já fechado', cls: 'neu' },
    { ic: 'ic-orange', fa: 'ph-users', lbl: 'Ticket Médio', val: formatCurrency(data.kpis.ticketMedio), delta: 'aprovados', cls: 'neu' },
    { ic: 'ic-purple', fa: 'ph-trend-up', lbl: 'Conversão', val: data.kpis.conversao.toFixed(1) + '%', delta: 'no mês', cls: 'neu' },
  ] : [];

  return (
    <section className="module active" id="mod-receita">
      <div className="mod-header"><div><h1>Receita</h1><p className="mod-sub">Análise de receita e performance financeira</p></div></div>

      {loading && <p className="mod-sub">Carregando receita...</p>}
      {error && <p className="mod-sub" style={{ color: 'var(--red)' }}>{error}</p>}

      {data && (
        <>
          <div className="kpi-grid" id="receitaKpis">
            {kpis.map(k => (
              <div key={k.lbl} className="kpi-card">
                <div className={`kpi-ic ${k.ic}`}><i className={`ph-bold ${k.fa}`} /></div>
                <div className="kpi-body"><span className="kpi-lbl">{k.lbl}</span><span className="kpi-val">{k.val}</span><span className={`kpi-delta ${k.cls}`}>{k.delta}</span></div>
              </div>
            ))}
          </div>
          <div className="dash-row">
            <div className="chart-card"><div className="chart-head"><h3>Receita por Categoria</h3></div><canvas id="receitaCateg" /></div>
            <div className="chart-card"><div className="chart-head"><h3>Receita Trimestral</h3></div><canvas id="receitaTrim" /></div>
          </div>
        </>
      )}
    </section>
  );
};
