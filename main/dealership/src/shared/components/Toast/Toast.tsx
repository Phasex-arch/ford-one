/**
 * @file Toast.tsx
 * @description Componente de container para notificações toast.
 * Renderiza a lista de toasts ativos fornecida pelo useToast.
 * Cada toast recebe uma classe CSS correspondente ao tipo:
 * 'success' | 'info' | 'warning' | 'error'
 * e um ícone Phosphor específico por tipo.
 *
 * O posicionamento fixo e as animações de entrada/saída são definidos
 * nas classes .toast-ct e .toast no _globals.scss.
 *
 * Props:
 * - toasts → array de ToastItem vindos do useToast
 */

import React from 'react';
import type { ToastItem } from '../../hooks/useToast';

const ICONS: Record<string, string> = {
  success: 'ph-check-circle',
  info: 'ph-info',
  warning: 'ph-warning',
  error: 'ph-x-circle',
};

interface Props { toasts: ToastItem[]; }

export const ToastContainer: React.FC<Props> = ({ toasts }) => (
  <div className="toast-ct" id="toastContainer">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type}`}>
        <i className={`ph-bold ${ICONS[t.type]}`} />
        <span>{t.msg}</span>
      </div>
    ))}
  </div>
);
