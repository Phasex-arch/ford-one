/**
 * @file desempenho.screen.tsx
 * @module desempenho
 * @description Tela de Desempenho — performance da equipe e indicadores
 * operacionais. Dados reais de GET /api/dashboard/desempenho — nada fixo.
 *
 * Composição:
 * - Header
 * - KPI Grid: só os 2 indicadores com fonte real no sistema hoje —
 *   Retenção (% de clientes com status ATIVO) e Produtividade (% de ordens
 *   de serviço concluídas no mês). O mock antigo também tinha "Giro de
 *   Estoque" e "Follow-up", removidos: não existe registro de data de venda
 *   no estoque nem de tentativa de follow-up em lugar nenhum do sistema.
 * - Dois gráficos canvas:
 *   → consultorChart: barras com % de conversão real por colaborador
 *     (GERENTE/FUNCIONARIO), calculado a partir de Lead.responsavelId — um
 *     colaborador sem lead atribuído aparece com 0%, honestamente
 *   → retencaoChart: linha com % real de retenção por mês de aquisição do
 *     cliente (últimos 6 meses)
 *
 * Gráficos renderizados via useBarChart e useLineChart de shared/ui/Canvas.
 */

import React from 'react';
import { useDesempenho } from './hooks/useDesempenho';
import { useBarChart } from '../../shared/ui/Canvas/useBarChart';
import { useLineChart } from '../../shared/ui/Canvas/useLineChart';

export const DesempenhoScreen: React.FC = () => {
  const { data, loading, error } = useDesempenho();

  useBarChart('consultorChart', data ? {
    labels: data.consultores.map(c => c.nome),
    data: data.consultores.map(c => c.conversao),
    color: '#1700f4',
    unit: '%',
  } : null, [data]);

  useLineChart('retencaoChart', data ? {
    labels: data.retencaoMensal.labels,
    sets: [{ data: data.retencaoMensal.valores, color: '#10B981', fill: true }],
    unit: '%',
  } : null, [data]);

  const kpis = data ? [
    { ic: 'ic-blue', fa: 'ph-users', lbl: 'Retenção', val: data.kpis.retencao.toFixed(1) + '%', delta: 'clientes ativos', cls: 'neu' },
    { ic: 'ic-green', fa: 'ph-wrench', lbl: 'Produtividade', val: data.kpis.produtividade.toFixed(1) + '%', delta: 'OS concluídas no mês', cls: 'neu' },
  ] : [];

  return (
    <section className="module active" id="mod-desempenho">
      <div className="mod-header"><div><h1>Desempenho</h1><p className="mod-sub">Performance da equipe e indicadores operacionais</p></div></div>

      {loading && <p className="mod-sub">Carregando desempenho...</p>}
      {error && <p className="mod-sub" style={{ color: 'var(--red)' }}>{error}</p>}

      {data && (
        <>
          <div className="kpi-grid" id="desempKpis">
            {kpis.map(k => (
              <div key={k.lbl} className="kpi-card">
                <div className={`kpi-ic ${k.ic}`}><i className={`ph-bold ${k.fa}`} /></div>
                <div className="kpi-body"><span className="kpi-lbl">{k.lbl}</span><span className="kpi-val">{k.val}</span><span className={`kpi-delta ${k.cls}`}>{k.delta}</span></div>
              </div>
            ))}
          </div>

          {data.consultores.length === 0 && (
            <p className="mod-sub">Nenhum colaborador com papel de venda cadastrado ainda.</p>
          )}

          <div className="dash-row">
            <div className="chart-card"><div className="chart-head"><h3>Performance por Consultor</h3></div><canvas id="consultorChart" /></div>
            <div className="chart-card"><div className="chart-head"><h3>Retenção de Clientes</h3></div><canvas id="retencaoChart" /></div>
          </div>
        </>
      )}
    </section>
  );
};
