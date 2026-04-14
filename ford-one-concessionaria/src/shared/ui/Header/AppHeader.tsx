/**
 * @file AppHeader.tsx
 * @description Cabeçalho fixo da aplicação Ford One.
 * Equivalente React do bloco <header> do index.html original.
 *
 * Componentes internos:
 * - Logo Ford com fallback gracioso (onError oculta imagem quebrada)
 * - GlobalSearch → busca global com dropdown de resultados
 * - Status do sistema (ponto verde animado)
 * - Identificação da concessionária (Ford SP Centro)
 * - Botão de notificações com badge de contagem e dropdown
 * - Botão de usuário com dropdown de ações
 *
 * Dropdowns (estado local via useState):
 * - notifDropdown: lista de notificações com marcar todas como lidas
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

import React, { useState } from 'react';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import type { ToastType } from '../../hooks/useToast';

interface Props { onToggleSidebar: () => void; showToast: (msg: string, type?: ToastType) => void; }

export const AppHeader: React.FC<Props> = ({ onToggleSidebar, showToast }) => {
  const { navigate } = useApp();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifBadge, setNotifBadge] = useState(4);
  const [profileOpen, setProfileOpen] = useState(false);
  const [senhaOpen, setSenhaOpen] = useState(false);
  const [notifs, setNotifs] = useState([
    { id:1, unread:true,  title:'Lead urgente',           body:'Carlos Silva – interesse em Ranger Storm', time:'há 5 min',  mod:'leads'     },
    { id:2, unread:true,  title:'Agendamento confirmado', body:'Ana Rodrigues – revisão 50.000 km',        time:'há 22 min', mod:'agenda'    },
    { id:3, unread:true,  title:'SLA em risco',           body:'OS #4821 – prazo em 2h',                  time:'há 1h',     mod:'servicos'  },
    { id:4, unread:false, title:'Meta atingida',          body:'Receita de abril superou 105%',            time:'há 3h',     mod:'metas'     },
  ]);

  void theme; void setTheme;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
    setNotifBadge(0);
    showToast('Todas as notificações marcadas como lidas', 'success');
  };

  const closeAll = () => { setNotifOpen(false); setUserOpen(false); };

  const handleUdAction = (a: string) => {
    setUserOpen(false);
    if (a === 'perfil') { setProfileOpen(true); }
    else if (a === 'senha') { setSenhaOpen(true); }
    else if (a === 'config') { navigate('config'); }
    else if (a === 'sair') {
      showToast('Sessão encerrada. Até logo!', 'info');
      setTimeout(() => {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#00095b;color:white;font-family:Inter,sans-serif;font-size:18px;letter-spacing:2px;font-weight:600">FORD ONE — SESSÃO ENCERRADA</div>';
      }, 1200);
    }
  };

  return (
    <>
    <header className="header" id="header" onClick={closeAll}>
      <div className="header-left">
        <button className="sidebar-toggle" id="sidebarToggle" aria-label="Menu" onClick={e => { e.stopPropagation(); onToggleSidebar(); }}>
          <span /><span /><span />
        </button>
        <div className="brand" onClick={() => navigate('dashboard')} style={{ cursor:'pointer' }}>
          <div className="ford-logo-wrap">
            <img src="/assets/images/logo/ford-logo.png" alt="Ford" className="ford-logo-img"
              onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
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
          <span className="sys-dot" /><span className="sys-label">Online</span>
        </div>
        <div className="header-dealership">
          <i className="ph-bold ph-buildings" />
          <span className="dealer-label">Ford SP Centro</span>
        </div>
        <button className="hdr-icon-btn" aria-label="Notificações"
          onClick={e => { e.stopPropagation(); setNotifOpen(p => !p); setUserOpen(false); }}>
          <i className="ph-bold ph-bell" />
          {notifBadge > 0 && <span className="notif-badge">{notifBadge}</span>}
        </button>
        <button className="hdr-user-btn" aria-label="Perfil"
          onClick={e => { e.stopPropagation(); setUserOpen(p => !p); setNotifOpen(false); }}>
          <div className="user-av">RC</div>
          <div className="user-info-hdr">
            <span className="user-nm">Ricardo Costa</span>
            <span className="user-rl">Gerente Comercial</span>
          </div>
          <i className="ph-bold ph-caret-down user-chev" />
        </button>
      </div>

      {/* Notif Dropdown */}
      <div className={`hdr-dropdown notif-dropdown${notifOpen ? ' open' : ''}`}
        onClick={e => e.stopPropagation()}>
        <div className="hdr-dd-head">
          <span>Notificações</span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button className="notif-mark-all" onClick={markAllRead}>Marcar todas</button>
            <button onClick={() => setNotifOpen(false)}><i className="ph-bold ph-x" /></button>
          </div>
        </div>
        <div id="notifList">
          {notifs.map(n => (
            <div key={n.id} className={`notif-row${n.unread ? ' unread' : ''}`} style={{ cursor:'pointer' }}
              onClick={() => { setNotifOpen(false); navigate(n.mod as any); }}>
              <div className={`ndot${n.unread ? '' : ' read'}`} />
              <div className="ncnt">
                <strong>{n.title}</strong><p>{n.body}</p><span>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Dropdown */}
      <div className={`hdr-dropdown user-dd${userOpen ? ' open' : ''}`}
        onClick={e => e.stopPropagation()}>
        <div className="ud-top">
          <div className="ud-av">RC</div>
          <div>
            <div className="ud-name">Ricardo Costa</div>
            <div className="ud-role">Gerente Comercial · Ford SP Centro</div>
          </div>
        </div>
        <button className="ud-row" onClick={() => handleUdAction('perfil')}><i className="ph-bold ph-user" />Meu Perfil</button>
        <button className="ud-row" onClick={() => handleUdAction('senha')}><i className="ph-bold ph-lock" />Alterar Senha</button>
        <button className="ud-row" onClick={() => handleUdAction('config')}><i className="ph-bold ph-gear" />Configurações</button>
        <button className="ud-row ud-danger" onClick={() => handleUdAction('sair')}><i className="ph-bold ph-sign-out" />Sair</button>
      </div>
    </header>

    {/* Perfil Modal */}
    {profileOpen && (
      <div className="modal-ov open" onClick={e=>{if(e.target===e.currentTarget)setProfileOpen(false);}}>
        <div className="modal-box modal-sm">
          <button className="modal-x" onClick={()=>setProfileOpen(false)}><i className="ph-bold ph-x"/></button>
          <div style={{padding:22}}>
            <h3 style={{fontSize:20,fontWeight:700,color:'var(--c-text)',marginBottom:4,paddingBottom:12,borderBottom:'1px solid var(--c-border)'}}>Meu Perfil</h3>
            <div style={{display:'flex',alignItems:'center',gap:14,marginTop:16,marginBottom:20}}>
              <div style={{width:60,height:60,borderRadius:'50%',background:'var(--ford-vivid)',color:'#fff',fontSize:22,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>RC</div>
              <div>
                <div style={{fontSize:'var(--fs4)',fontWeight:700,color:'var(--c-text)'}}>Ricardo Costa</div>
                <div style={{fontSize:'var(--fs1)',color:'var(--c-mid)'}}>Gerente Comercial · Ford SP Centro</div>
              </div>
            </div>
            <div className="m-form">
              <label>Nome completo<input type="text" defaultValue="Ricardo Costa"/></label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <label>Cargo<input type="text" defaultValue="Gerente Comercial"/></label>
                <label>Ramal<input type="text" defaultValue="(11) 3000-4001"/></label>
              </div>
              <label>E-mail<input type="email" defaultValue="ricardo.costa@fordspcentro.com.br"/></label>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
              <button className="btn-sec" onClick={()=>setProfileOpen(false)}>Cancelar</button>
              <button className="btn-prim" onClick={()=>{setProfileOpen(false);showToast('Perfil atualizado!','success');}}>Salvar</button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Alterar Senha Modal */}
    {senhaOpen && (
      <div className="modal-ov open" onClick={e=>{if(e.target===e.currentTarget)setSenhaOpen(false);}}>
        <div className="modal-box modal-sm">
          <button className="modal-x" onClick={()=>setSenhaOpen(false)}><i className="ph-bold ph-x"/></button>
          <div style={{padding:22}}>
            <h3 style={{fontSize:20,fontWeight:700,color:'var(--c-text)',marginBottom:4,paddingBottom:12,borderBottom:'1px solid var(--c-border)'}}>Alterar Senha</h3>
            <div className="m-form" style={{marginTop:14}}>
              <label>Senha atual<input type="password" placeholder="••••••••"/></label>
              <label>Nova senha<input type="password" placeholder="••••••••"/></label>
              <label>Confirmar nova senha<input type="password" placeholder="••••••••"/></label>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
              <button className="btn-sec" onClick={()=>setSenhaOpen(false)}>Cancelar</button>
              <button className="btn-prim" onClick={()=>{setSenhaOpen(false);showToast('Senha alterada com sucesso!','success');}}>Salvar</button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
