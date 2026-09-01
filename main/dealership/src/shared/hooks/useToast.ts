/**
 * @file useToast.ts
 * @description Hook de sistema de notificações toast.
 * Equivalente React da função showToast() do script.js original.
 *
 * Retorna:
 * - toasts      → Array de toasts ativos para o ToastContainer renderizar
 * - showToast   → Dispara um toast com mensagem e tipo (info/success/warning/error)
 * - removeToast → Remove um toast pelo ID antes do auto-dismiss
 *
 * Auto-dismiss: cada toast é removido automaticamente após 3500ms.
 * O ID é gerado por um contador incremental global (_id) para evitar colisões.
 */

import { useState, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export interface ToastItem { id: number; msg: string; type: ToastType; }

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}
