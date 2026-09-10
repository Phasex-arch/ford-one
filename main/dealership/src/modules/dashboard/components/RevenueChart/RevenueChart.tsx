/**
 * @file RevenueChart.tsx
 * @module dashboard
 * @description Componente que renderiza os dois gráficos canvas do Dashboard:
 * 1. revenueChart  → Gráfico de linha: Receita Mensal (realizado vs meta)
 * 2. conversionChart → Gráfico de barras: Conversão de Leads por mês
 *
 * Utiliza os hooks useLineChart e useBarChart de shared/ui/Canvas.
 * O parâmetro `period` é passado como dependência para redesenhar os gráficos
 * quando o período do Dashboard muda.
 *
 * Também registra listener de resize para redesenho automático quando
 * a janela é redimensionada.
 */

import React, { useEffect } from 'react';
import { useLineChart } from '../../../../shared/ui/Canvas/useLineChart';
import { useBarChart } from '../../../../shared/ui/Canvas/useBarChart';
import type { DashData } from '../../../../data/dashboard.data';

interface Props { period: string; data: DashData | null; }

export const DashCharts: React.FC<Props> = ({ period, data }) => {
  const revenue = data?.revenue;
  const conversion = data?.conversion;
  useLineChart('revenueChart', {
    labels: revenue?.labels || [],
    sets: [
      { data:revenue?.actual || [], color:'#1700f4', fill:true },
      { data:revenue?.target || [], color:'#F59E0B', dashed:true },
    ],
    unit: 'k',
  }, [period, data]);

  useBarChart('conversionChart', {
    labels: conversion?.labels || [],
    data: conversion?.values || [],
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
          <h3>Receita Mensal</h3>
          <div className="chart-legend">
            <span className="leg"><i className="dot blue" />Realizado</span>
            <span className="leg"><i className="dot dashed" />Meta</span>
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
