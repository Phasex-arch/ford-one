/**
 * @file ConfirmModal.tsx
 * @description Modal de confirmação para ações destrutivas (excluir, apagar histórico).
 * Exibe ícone de lixeira, título, mensagem e botões Cancelar / Confirmar.
 *
 * Props:
 * - id            → ID HTML do modal
 * - isOpen        → visibilidade
 * - onClose       → fechar sem confirmar
 * - onConfirm     → executar ação confirmada
 * - title         → título do modal (ex: "Excluir OS #4831")
 * - message       → mensagem de aviso (ex: "Esta ação não pode ser desfeita.")
 * - confirmLabel  → texto do botão de confirmação (padrão: "Confirmar")
 */

import React from 'react';

interface Props {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export const ConfirmModal: React.FC<Props> = ({ id, isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmar' }) => (
  <div className={`modal-ov${isOpen ? ' open' : ''}`} id={id} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-box modal-sm">
      <div className="confirm-wrap">
        <div className="confirm-icon"><i className="ph-bold ph-trash" /></div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-btns">
          <button className="btn-sec" onClick={onClose}>Cancelar</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  </div>
);
