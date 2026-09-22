/**
 * @file AppSidebar.tsx
 * @description Sidebar de navegação da aplicação Ford One.
 * Equivalente React do bloco <aside class="sidebar"> do index.html original.
 *
 * Comportamento:
 * - Desktop: sidebar fixa com largura 248px, colapsável para 60px (ícones apenas)
 * - Mobile (≤768px): drawer animado que desliza da esquerda com overlay escuro
 * - Item ativo determinado pelo activeModule do AppContext
 * - Navegação via handleNav() chama navigate() e fecha drawer mobile
 * - Estrutura de seções lida de shared/constants/navigation.ts
 *
 * Props:
 * - collapsed       → sidebar colapsada no desktop (somente ícones)
 * - mobileOpen      → drawer aberto no mobile
 * - onCloseMobile   → callback para fechar o drawer mobile
 */

import React from 'react';
import { NAV_SECTIONS } from '../../constants/navigation';
import { useApp } from '../../context/AppContext';
import type { ModuleId } from '../../../types/global.types';

interface Props { collapsed: boolean; mobileOpen: boolean; onCloseMobile: () => void; }

export const AppSidebar: React.FC<Props> = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const { activeModule, navigate, user } = useApp();

  const handleNav = (id: ModuleId) => {
    navigate(id);
    onCloseMobile();
  };

  const visible = (item: { roles?: string[] }) =>
    !item.roles || (user != null && item.roles.includes(user.role));

  return (
    <>
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`} id="sidebar">
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section, si) => (
            <div className="nav-section" key={si}>
              {section.label && <span className="nav-label">{section.label}</span>}
              {section.items.filter(visible).map(item => (
                <a
                  key={item.id}
                  className={`nav-item${activeModule === item.id ? ' active' : ''}`}
                  data-module={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className={`ph-bold ${item.icon}`} />
                  <span className="nav-txt">{item.label}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <i className="ph-bold ph-shield-check sf-icon" />
          <span className="nav-txt">Ford One v1.0 · 2026</span>
        </div>
      </aside>
      <div
        className={`sidebar-overlay${mobileOpen ? ' active' : ''}`}
        id="sidebarOverlay"
        onClick={onCloseMobile}
      />
    </>
  );
};
