/**
 * @file KpiCard.tsx
 * @module dashboard
 * @description Card de KPI (Key Performance Indicator) do Dashboard.
 * Exibe ícone colorido, label, valor principal e delta (variação percentual).
 *
 * Props:
 * - kpi      → objeto KpiItem com ic (cor do ícone), fa (classe Phosphor),
 *              lbl (label), val (valor formatado), delta (variação), cls (pos/neg)
 * - onClick  → callback opcional — exibe cursor pointer quando definido
 */

import React from 'react';
import type { KpiItem } from '../../hooks/useDashboard';

interface Props { kpi: KpiItem; onClick?: () => void; }

export const KpiCard: React.FC<Props> = ({ kpi: k, onClick }) => (
  <div className="kpi-card" onClick={onClick} style={onClick ? { cursor:'pointer' } : undefined}>
    <div className={`kpi-ic ${k.ic}`}>
      <i className={`ph-bold ${k.fa}`} />
    </div>
    <div className="kpi-body">
      <span className="kpi-lbl">{k.lbl}</span>
      <span className="kpi-val">{k.val}</span>
      <span className={`kpi-delta ${k.cls}`}>{k.delta}</span>
    </div>
  </div>
);
