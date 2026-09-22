/**
 * @file RevenueChart.tsx
 * @module dashboard
 * @description Componente que renderiza os dois gráficos canvas do Dashboard:
 * 1. revenueChart  → receita: linha (realizado vs meta) na maioria dos
 *    períodos; quando period='ano', vira colunas PAREADAS (mês atual x
 *    mesmo mês do ano anterior lado a lado) — comparação direta de valor
 *    é mais fácil de ler em barras do que em duas linhas sobrepostas.
 *    Título do card muda com o período (ver TITULO_RECEITA).
 * 2. conversionChart → Gráfico de barras: Conversão de Leads por período
 *
 * Utiliza os hooks useLineChart, useGroupedBarChart e useBarChart de
 * shared/ui/Canvas. O parâmetro `period` é passado como dependência para
 * redesenhar os gráficos quando o período do Dashboard muda.
 *
 * Também registra listener de resize para redesenho automático quando
 * a janela é redimensionada.
 */

import React, { useEffect } from 'react';
import { useLineChart } from '../../../../shared/ui/Canvas/useLineChart';
import { useBarChart } from '../../../../shared/ui/Canvas/useBarChart';
import { useGroupedBarChart } from '../../../../shared/ui/Canvas/useGroupedBarChart';
import type { DashData } from '../../../../data/dashboard.data';

interface Props { period: string; data: DashData | null; }

// Título do card de receita muda com o período — antes ficava fixo em
// "Receita Mensal" mesmo quando o gráfico virava horário (Hoje) ou
// semanal (Semana), o que não batia com o que estava desenhado.
const TITULO_RECEITA: Record<string, string> = {
  hoje: 'Receita de Hoje',
  semana: 'Receita da Semana',
  mes: 'Receita do Mês',
  trimestre: 'Receita Trimestral',
  ano: 'Receita Anual',
};

export const DashCharts: React.FC<Props> = ({ period, data }) => {
  const revenue = data?.revenue;
  const conversion = data?.conversion;
  // No período "ano" a linha de referência vira "Ano anterior" (comparação
  // real ano-a-ano) no lugar da Meta — as duas juntas ficariam cheias
  // demais pro mesmo gráfico, e a Meta mensal ×12 não diria nada de novo
  // que a tela de Metas já não mostra.
  const comparandoAno = period === 'ano' && !!revenue?.prevYear;
  // unit:'k' só faz sentido se o valor já estiver em milhares — o eixo Y
  // apenas concatena o número com o sufixo, sem dividir nada (ver mesmo
  // comentário em receita.screen.tsx).
  useLineChart('revenueChart', comparandoAno ? null : {
    labels: revenue?.labels || [],
    sets: [
      { data: (revenue?.actual || []).map(v => Math.round(v / 1000)), color:'#1700f4', fill:true },
      { data: (revenue?.target || []).map(v => Math.round(v / 1000)), color:'#F59E0B', dashed:true },
    ],
    unit: 'k',
  }, [period, data]);

  // Mesmo canvas do gráfico de linha — só um dos dois hooks desenha de cada
  // vez (o outro recebe cfg=null e não toca o canvas), e redefinir
  // width/height ao ativar já limpa o desenho anterior sozinho.
  useGroupedBarChart('revenueChart', !comparandoAno ? null : {
    labels: revenue?.labels || [],
    seriesA: { data: (revenue?.actual || []).map(v => Math.round(v / 1000)), color: '#1700f4' },
    seriesB: { data: (revenue?.prevYear || []).map(v => Math.round(v / 1000)), color: '#9196ae' },
    unit: 'k',
  }, [period, data]);

  useBarChart('conversionChart', {
    labels: conversion?.labels || [],
    data: conversion?.values || [],
    counts: conversion?.counts || [],
    color: '#1700f4',
    unit: '%',
  }, [period, data]);

  useEffect(() => {
    const handleResize = () => {
      window.dispatchEvent(new Event('ford:redrawCharts'));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dash-row">
      <div className="chart-card">
        <div className="chart-head">
          <h3>{TITULO_RECEITA[period] || 'Receita Mensal'}</h3>
          <div className="chart-legend">
            <span className="leg"><i className="dot blue" />Realizado</span>
            {comparandoAno
              ? <span className="leg"><i className="dot gray" />Ano anterior</span>
              : <span className="leg"><i className="dot dashed" />Meta</span>}
          </div>
        </div>
        <canvas id="revenueChart" />
      </div>
      <div className="chart-card">
        <div className="chart-head"><h3>Conversão de Leads</h3></div>
        <canvas id="conversionChart" />
      </div>
    </div>
  );
};
