/**
 * @file BaseModal.tsx
 * @description Componente base para todos os modais do sistema.
 * Renderiza overlay + caixa modal + botão de fechar (X).
 * Fecha ao clicar no overlay (fora da caixa).
 *
 * Props:
 * - id        → ID HTML do elemento modal (para referência legada se necessário)
 * - isOpen    → controla visibilidade via classe CSS 'open'
 * - onClose   → callback chamado ao fechar
 * - size      → 'sm' | 'lg' | '' — aplica modal-sm ou modal-lg ao box
 * - children  → conteúdo interno do modal
 */

import React, { type ReactNode } from 'react';

interface Props {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'lg' | '';
  children: ReactNode;
}

export const BaseModal: React.FC<Props> = ({ id, isOpen, onClose, size = '', children }) => (
  <div
    className={`modal-ov${isOpen ? ' open' : ''}`}
    id={id}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className={`modal-box${size ? ` modal-${size}` : ''}`}>
      <button className="modal-x" onClick={onClose}>
        <i className="ph-bold ph-x" />
      </button>
      {children}
    </div>
  </div>
);
