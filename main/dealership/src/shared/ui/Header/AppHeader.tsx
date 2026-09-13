/**
 * @file AppHeader.tsx
 * @description Cabeçalho fixo da aplicação Ford One.
 * Equivalente React do bloco <header> do index.html original.
 *
 * Componentes internos:
 * - Logo Ford com fallback gracioso (onError oculta imagem quebrada)
 * - GlobalSearch → busca global com dropdown de resultados
 * - Status do sistema (ponto verde animado)
 * - Identificação da concessionária (nome real, GET /api/configuracoes/concessionaria)
 * - Botão de notificações com badge de contagem e dropdown — reaproveita os
 *   4 alertas operacionais reais do Dashboard (useNotificacoes), sem dado fixo
 * - Botão de usuário com dropdown de ações
 *
 * Dropdowns (estado local via useState):
 * - notifDropdown: lista de notificações reais, com marcar todas como lidas
 *   (lido/não-lido guardado em localStorage por conteúdo — ver useNotificacoes)
 * - userDropdown: menu do usuário com ações de perfil e logout
 *
 * Modais internos (ativados pelo userDropdown):
 * - profileOpen  → Modal "Meu Perfil" com formulário editável
 * - senhaOpen    → Modal "Alterar Senha" com campos de senha
 *
 * Props:
 * - onToggleSidebar → callback para colapsar/expandir a sidebar
 * - showToast       → callback para disparar notificações toast
 */

import React, { useState, useEffect } from "react";
import { GlobalSearch } from "../GlobalSearch/GlobalSearch";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../hooks/useTheme";
import { useNotificacoes } from "../../hooks/useNotificacoes";
import type { ToastType } from "../../hooks/useToast";
import { apiRequest, clearToken, friendlyApiMessage } from "../../api/client";
import type { AuthenticatedUser } from "../../api/client";
import { fetchConcessionaria } from "../../../modules/configuracoes/services/configuracoes.service";

interface Props {
  onToggleSidebar: () => void;
  showToast: (msg: string, type?: ToastType) => void;
  user: AuthenticatedUser | null;
}

const roleLabel = (role: AuthenticatedUser['role']): string =>
  role === 'ADMIN' ? 'Administrador' : role === 'GERENTE' ? 'Gerente' : 'Funcionário';

export const AppHeader: React.FC<Props> = ({ onToggleSidebar, showToast, user }) => {
  const { navigate, refreshUser } = useApp();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [senhaOpen, setSenhaOpen] = useState(false);
  const { notifs, unreadCount, markAllRead: markAllReadReal, reload: reloadNotifs } = useNotificacoes();
  const [dealershipName, setDealershipName] = useState('Concessionária');

  const [profileNome, setProfileNome] = useState('');
  const [profileCargo, setProfileCargo] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaSaving, setSenhaSaving] = useState(false);

  useEffect(() => {
    fetchConcessionaria().then(c => setDealershipName(c.nome)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (profileOpen) {
      setProfileNome(user?.nome ?? '');
      setProfileCargo(user?.cargo ?? '');
      setProfileEmail(user?.email ?? '');
    }
  }, [profileOpen, user]);

  useEffect(() => {
    if (senhaOpen) {
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    }
  }, [senhaOpen]);

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      await apiRequest('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ nome: profileNome, cargo: profileCargo, email: profileEmail }),
      });
      refreshUser();
      setProfileOpen(false);
      showToast('Perfil atualizado!', 'success');
    } catch (err) {
      showToast(friendlyApiMessage(err), 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async () => {
    if (novaSenha.length < 8) {
      showToast('A nova senha precisa ter pelo menos 8 caracteres.', 'error');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      showToast('A confirmação não confere com a nova senha.', 'error');
      return;
    }
    setSenhaSaving(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      setSenhaOpen(false);
      showToast('Senha alterada com sucesso!', 'success');
    } catch (err) {
      showToast(friendlyApiMessage(err), 'error');
    } finally {
      setSenhaSaving(false);
    }
  };

  void theme;
  void setTheme;
  const userName = user?.nome ?? 'Usuário';
  const userRole = user ? roleLabel(user.role) : 'Carregando...';
  const userInitials = userName.split(' ').map(part => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  const markAllRead = () => {
    markAllReadReal();
    showToast("Todas as notificações marcadas como lidas", "success");
  };

  const closeAll = () => {
    setNotifOpen(false);
    setUserOpen(false);
  };

  const handleUdAction = (a: string) => {
    setUserOpen(false);
    if (a === "perfil") {
      setProfileOpen(true);
    } else if (a === "senha") {
      setSenhaOpen(true);
    } else if (a === "config") {
      navigate("config");
    } else if (a === "sair") {
      showToast("Sessão encerrada. Até logo!", "info");
      clearToken();
      const portalUrl = import.meta.env.VITE_PORTAL_URL
        || (import.meta.env.DEV ? "http://localhost:5173" : "http://localhost:8080");
      window.location.href = `${portalUrl.replace(/\/$/, "")}/concessionaria`;
    }
  };

  return (
    <>
      <header className="header" id="header" onClick={closeAll}>
        <div className="header-left">
          <button
            className="sidebar-toggle"
            id="sidebarToggle"
            aria-label="Menu"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSidebar();
            }}
          >
            <span />
            <span />
            <span />
          </button>
          <div
            className="brand"
            onClick={() => navigate("dashboard")}
            style={{ cursor: "pointer" }}
          >
            <div className="icon_ford_one-wrap">
              <img
                src="/assets/images/logo/icon_ford_one.png"
                alt="Ford"
                className="icon_ford_one-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="brand-divider" />
            <div className="brand-text">
              <span className="brand-name">Ford One</span>
              <span className="brand-sub">Portal da Concessionária</span>
            </div>
          </div>
        </div>

        <GlobalSearch />

        <div className="header-right">
          <div className="sys-status" title="Sistema operacional">
            <span className="sys-dot" />
            <span className="sys-label">Online</span>
          </div>
          <div className="header-dealership">
            <i className="ph-bold ph-buildings" />
            <span className="dealer-label">{dealershipName}</span>
          </div>
          <button
            className="hdr-icon-btn"
            aria-label="Notificações"
            onClick={(e) => {
              e.stopPropagation();
              setNotifOpen((p) => {
                if (!p) reloadNotifs();
                return !p;
              });
              setUserOpen(false);
            }}
          >
            <i className="ph-bold ph-bell" />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>
          <button
            className="hdr-user-btn"
            aria-label="Perfil"
            onClick={(e) => {
              e.stopPropagation();
              setUserOpen((p) => !p);
              setNotifOpen(false);
            }}
          >
            <div className="user-av">{userInitials}</div>
            <div className="user-info-hdr">
              <span className="user-nm">{userName}</span>
              <span className="user-rl">{userRole}</span>
            </div>
            <i className="ph-bold ph-caret-down user-chev" />
          </button>
        </div>

        {/* Notif Dropdown */}
        <div
          className={`hdr-dropdown notif-dropdown${notifOpen ? " open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="hdr-dd-head">
            <span>Notificações</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="notif-mark-all" onClick={markAllRead}>
                Marcar todas
              </button>
              <button onClick={() => setNotifOpen(false)}>
                <i className="ph-bold ph-x" />
              </button>
            </div>
          </div>
          <div id="notifList">
            {notifs.length === 0 && (
              <div style={{ padding: "18px 16px", fontSize: "var(--fs1)", color: "var(--c-mid)", textAlign: "center" }}>
                Nenhum alerta no momento.
              </div>
            )}
            {notifs.map((n) => (
              <div
                key={n.key}
                className={`notif-row${n.unread ? " unread" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setNotifOpen(false);
                  navigate(n.mod);
                }}
              >
                <div className={`ndot${n.unread ? "" : " read"}`} />
                <div className="ncnt">
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Dropdown */}
        <div
          className={`hdr-dropdown user-dd${userOpen ? " open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ud-top">
            <div className="ud-av">{userInitials}</div>
            <div>
              <div className="ud-name">{userName}</div>
              <div className="ud-role">{userRole} · {dealershipName}</div>
            </div>
          </div>
          <button className="ud-row" onClick={() => handleUdAction("perfil")}>
            <i className="ph-bold ph-user" />
            Meu Perfil
          </button>
          <button className="ud-row" onClick={() => handleUdAction("senha")}>
            <i className="ph-bold ph-lock" />
            Alterar Senha
          </button>
          <button className="ud-row" onClick={() => handleUdAction("config")}>
            <i className="ph-bold ph-gear" />
            Configurações
          </button>
          <button
            className="ud-row ud-danger"
            onClick={() => handleUdAction("sair")}
          >
            <i className="ph-bold ph-sign-out" />
            Sair
          </button>
        </div>
      </header>

      {/* Perfil Modal */}
      {profileOpen && (
        <div
          className="modal-ov open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setProfileOpen(false);
          }}
        >
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={() => setProfileOpen(false)}>
              <i className="ph-bold ph-x" />
            </button>
            <div style={{ padding: 22 }}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--c-text)",
                  marginBottom: 4,
                  paddingBottom: 12,
                  borderBottom: "1px solid var(--c-border)",
                }}
              >
                Meu Perfil
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "var(--ford-vivid)",
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {userInitials}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--fs4)",
                      fontWeight: 700,
                      color: "var(--c-text)",
                    }}
                  >
                    {userName}
                  </div>
                  <div
                    style={{ fontSize: "var(--fs1)", color: "var(--c-mid)" }}
                  >
                    {userRole} · {dealershipName}
                  </div>
                </div>
              </div>
              <div className="m-form">
                <label>
                  Nome completo
                  <input
                    type="text"
                    value={profileNome}
                    onChange={(e) => setProfileNome(e.target.value)}
                  />
                </label>
                <label>
                  Cargo
                  <input
                    type="text"
                    value={profileCargo}
                    onChange={(e) => setProfileCargo(e.target.value)}
                  />
                </label>
                <label>
                  E-mail
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 16,
                }}
              >
                <button
                  className="btn-sec"
                  onClick={() => setProfileOpen(false)}
                  disabled={profileSaving}
                >
                  Cancelar
                </button>
                <button
                  className="btn-prim"
                  onClick={saveProfile}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alterar Senha Modal */}
      {senhaOpen && (
        <div
          className="modal-ov open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSenhaOpen(false);
          }}
        >
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={() => setSenhaOpen(false)}>
              <i className="ph-bold ph-x" />
            </button>
            <div style={{ padding: 22 }}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--c-text)",
                  marginBottom: 4,
                  paddingBottom: 12,
                  borderBottom: "1px solid var(--c-border)",
                }}
              >
                Alterar Senha
              </h3>
              <div className="m-form" style={{ marginTop: 14 }}>
                <label>
                  Senha atual
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                  />
                </label>
                <label>
                  Nova senha
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                  />
                </label>
                <label>
                  Confirmar nova senha
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 16,
                }}
              >
                <button className="btn-sec" onClick={() => setSenhaOpen(false)} disabled={senhaSaving}>
                  Cancelar
                </button>
                <button className="btn-prim" onClick={savePassword} disabled={senhaSaving}>
                  {senhaSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
