/**
 * @file AppLayout.tsx
 * @description Componente de layout raiz que une Header + Sidebar + conteúdo principal.
 * Gerencia o estado de colapso da sidebar (desktop) e abertura do drawer (mobile).
 *
 * Comportamento:
 * - onToggleSidebar: em mobile (≤768px) alterna mobileOpen, em desktop alterna collapsed
 * - Passa showToast para o AppHeader para que ele possa disparar notificações
 *
 * Props:
 * - children    → área de conteúdo principal (a tela ativa renderizada pelo App.tsx)
 * - showToast   → callback do useToast para notificações toast
 */

import React, { useState, type ReactNode } from 'react';
import { AppHeader } from '../Header/AppHeader';
import { AppSidebar } from '../Sidebar/AppSidebar';
import type { ToastType } from '../../hooks/useToast';
import type { AuthenticatedUser } from '../../api/client';

interface Props {
  children: ReactNode;
  showToast: (msg: string, type?: ToastType) => void;
  user: AuthenticatedUser | null;
}

export const AppLayout: React.FC<Props> = ({ children, showToast, user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onToggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(p => !p);
    } else {
      setCollapsed(p => !p);
    }
  };

  return (
    <>
      <AppHeader onToggleSidebar={onToggleSidebar} showToast={showToast} user={user} />
      <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`} id="appLayout">
        <AppSidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <main className={`main${collapsed ? ' expanded' : ''}`} id="mainContent">
          {children}
        </main>
      </div>
    </>
  );
};
