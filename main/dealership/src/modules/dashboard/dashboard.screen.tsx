/**
 * @file dashboard.screen.tsx
 * @module dashboard
 * @description Tela principal do Dashboard — visão geral operacional.
 *
 * Composição:
 * - Header da tela com seletor de período e botão Exportar
 * - Grid de KPIs (7 indicadores) gerados pelo useDashboard
 * - DashCharts: dois gráficos canvas (receita + conversão)
 * - Grade de 4 alertas operacionais com navegação direta
 *
 * Esta tela não contém lógica de negócio — toda lógica está em useDashboard.ts.
 * A navegação dos alertas usa navigate() do AppContext.
 */

import React from 'react';
import { useDashboard } from './hooks/useDashboard';
import { KpiCard } from './components/KpiCard/KpiCard';
import { AlertCard } from './components/AlertCard/AlertCard';
import { DashCharts } from './components/RevenueChart/RevenueChart';
import { useApp } from '../../shared/context/AppContext';
import { todayLabel } from '../../shared/utils/dates';
import type { DashPeriod } from '../../data/dashboard.data';

export const DashboardScreen: React.FC = () => {
  const { period, handlePeriodChange, kpis } = useDashboard();
  const { navigate } = useApp();

  return (
    <section className="module active" id="mod-dashboard">
      <div className="mod-header">
        <div>
          <h1>Dashboard</h1>
          <p className="mod-sub">Visão geral operacional · <span id="currentDate">{todayLabel()}</span></p>
        </div>
        <div className="mod-actions">
          <select
            className="sel-ctrl"
            id="dashPeriod"
            value={period}
            onChange={e => handlePeriodChange(e.target.value as DashPeriod)}
          >
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
            <option value="trimestre">Este trimestre</option>
          </select>
          <button className="btn-prim" onClick={() => navigate('relatorios')}>
            <i className="ph-bold ph-arrow-square-out" /> Exportar
          </button>
        </div>
      </div>

      <div className="kpi-grid" id="dashKpis">
        {kpis.map(k => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>

      <DashCharts period={period} />

      <h3 className="sec-title">Alertas Operacionais</h3>
      <div className="alerts-grid">
        <AlertCard cls="ac-red"    icon="ph-warning-circle" title="SLA em risco"       body="3 ordens ultrapassando prazo nas próximas 2h"    link="Ver"      onClick={() => navigate('servicos')} />
        <AlertCard cls="ac-orange" icon="ph-warning"        title="Estoque baixo"      body="Maverick Hybrid com apenas 2 unidades"           link="Ver"      onClick={() => navigate('estoque')}  />
        <AlertCard cls="ac-blue"   icon="ph-lightning"      title="Lead prioritário"   body="Carlos Silva – Ranger Storm – R$ 245.000"        link="Atender"  onClick={() => navigate('leads')}    />
        <AlertCard cls="ac-green"  icon="ph-check-circle"   title="Meta atingida"      body="Receita de abril superou 105% da meta"           link="Detalhar" onClick={() => navigate('receita')}  />
      </div>
    </section>
  );
};
