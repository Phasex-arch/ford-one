/**
 * @file dashboard.screen.tsx
 * @module dashboard
 * @description Tela principal do Dashboard — visão geral operacional.
 *
 * Composição:
 * - Header da tela com seletor de período e botão Exportar
 * - Grid de KPIs (7 indicadores) gerados pelo useDashboard
 * - DashCharts: dois gráficos canvas (receita + conversão)
 * - Grade de alertas operacionais montada a partir de GET /dashboard.alertas
 *   (backend) — cada alerta só aparece se houver dado real por trás (ordem em
 *   risco/atrasada, item de estoque baixo, lead urgente, meta batida); sem
 *   nenhum alerta real, mostra estado vazio em vez de conteúdo fixo.
 *
 * A navegação dos alertas usa navigate() do AppContext.
 */

import React from 'react';
import { useDashboard } from './hooks/useDashboard';
import { KpiCard } from './components/KpiCard/KpiCard';
import { AlertCard } from './components/AlertCard/AlertCard';
import { DashCharts } from './components/RevenueChart/RevenueChart';
import { useApp } from '../../shared/context/AppContext';
import { todayLabel } from '../../shared/utils/dates';
import { formatCurrency, formatNumber } from '../../shared/utils/formatters';
import type { DashPeriod } from '../../data/dashboard.data';

const formatMetaValor = (valor: number, unidade: string): string =>
  unidade === 'R$' ? formatCurrency(valor) : `${formatNumber(valor)} ${unidade}`;

export const DashboardScreen: React.FC = () => {
  const { period, handlePeriodChange, kpis, loading, error, data } = useDashboard();
  const { navigate } = useApp();
  const alertas = data?.alertas;

  const alertCards = [
    alertas?.slaRisco && {
      cls: 'ac-red', icon: 'ph-warning-circle', title: 'SLA em risco',
      body: `${alertas.slaRisco.quantidade} ${alertas.slaRisco.quantidade === 1 ? 'ordem' : 'ordens'} de serviço em risco ou atrasada`,
      link: 'Ver', onClick: () => navigate('servicos'),
    },
    alertas?.estoqueBaixo && {
      cls: 'ac-orange', icon: 'ph-warning', title: 'Estoque baixo',
      body: `${alertas.estoqueBaixo.modelo} ${alertas.estoqueBaixo.versao} com apenas ${alertas.estoqueBaixo.quantidade} ${alertas.estoqueBaixo.quantidade === 1 ? 'unidade' : 'unidades'}`,
      link: 'Ver', onClick: () => navigate('estoque'),
    },
    alertas?.leadPrioritario && {
      cls: 'ac-blue', icon: 'ph-lightning', title: 'Lead prioritário',
      body: `${alertas.leadPrioritario.cliente} – ${alertas.leadPrioritario.veiculo} – ${formatCurrency(alertas.leadPrioritario.valor)}`,
      link: 'Atender', onClick: () => navigate('leads'),
    },
    alertas?.metaAtingida && {
      cls: 'ac-green', icon: 'ph-check-circle', title: 'Meta atingida',
      body: `${alertas.metaAtingida.titulo}: ${formatMetaValor(alertas.metaAtingida.atual, alertas.metaAtingida.unidade)} de ${formatMetaValor(alertas.metaAtingida.alvo, alertas.metaAtingida.unidade)}`,
      link: 'Detalhar', onClick: () => navigate('receita'),
    },
  ].filter((a): a is Exclude<typeof a, false | null | undefined> => Boolean(a));

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
      {loading && <p className="mod-sub">Carregando dados...</p>}
      {error && <p className="mod-sub">{error}</p>}

      <DashCharts period={period} data={data} />

      <h3 className="sec-title">Alertas Operacionais</h3>
      {alertCards.length === 0
        ? <p className="mod-sub">Nenhum alerta no momento.</p>
        : (
          <div className="alerts-grid">
            {alertCards.map(a => (
              <AlertCard key={a.title} cls={a.cls} icon={a.icon} title={a.title} body={a.body} link={a.link} onClick={a.onClick} />
            ))}
          </div>
        )}
    </section>
  );
};
