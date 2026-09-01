/**
 * @file AlertCard.tsx
 * @module dashboard
 * @description Card de alerta operacional do Dashboard.
 * Quatro alertas fixos (SLA em risco, Estoque baixo, Lead prioritário, Meta atingida),
 * cada um com classe de cor (ac-red, ac-orange, ac-blue, ac-green), ícone, texto
 * e link de ação que navega para o módulo relacionado.
 *
 * Props:
 * - cls      → classe CSS de cor do card (ex: 'ac-red')
 * - icon     → classe do ícone Phosphor (ex: 'ph-warning-circle')
 * - title    → título em negrito
 * - body     → descrição do alerta
 * - link     → texto do link de ação (ex: "Ver", "Atender")
 * - onClick  → callback de navegação para o módulo relacionado
 */

import React from 'react';

interface Props { cls: string; icon: string; title: string; body: string; link: string; onClick?: () => void; }

export const AlertCard: React.FC<Props> = ({ cls, icon, title, body, link, onClick }) => (
  <div className={`alert-card ${cls}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
    <i className={`ph-bold ${icon}`} />
    <div className="al-body"><strong>{title}</strong><p>{body}</p></div>
    <span className="al-link">{link}</span>
  </div>
);
