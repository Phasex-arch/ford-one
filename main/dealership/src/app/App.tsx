/**
 * @file App.tsx
 * @description Componente raiz da aplicação Ford One.
 *
 * Responsabilidades:
 * - Envolver toda a árvore de componentes com o AppProvider (estado global)
 * - Instanciar o AppLayout (Header + Sidebar + área principal)
 * - Renderizar a tela correta com base no módulo ativo (activeModule)
 * - Montar o ToastContainer para exibir notificações globais
 * - Carregar o usuário autenticado (/auth/me) no AppContext e tratar 401/403
 * - Fornecer o callback showToast a todas as telas que precisam disparar toasts
 *
 * Padrão de roteamento: sem React Router — o módulo ativo é controlado pelo
 * AppContext via navigate(ModuleId), mantendo tudo em SPA sem URLs por rota.
 */
import React from 'react';
import { useEffect } from 'react';
import { apiRequest, clearToken, getToken, type AuthenticatedUser } from '../shared/api/client';
import { AppProvider, useApp } from '../shared/context/AppContext';
import { AppLayout } from '../shared/ui/Layout/AppLayout';
import { ToastContainer } from '../shared/components/Toast/Toast';
import { useToast } from '../shared/hooks/useToast';
import { DashboardScreen }      from '../modules/dashboard/dashboard.screen';
import { ClientesScreen }       from '../modules/clientes/clientes.screen';
import { HistoricoScreen }      from '../modules/historico/historico.screen';
import { EstoqueScreen }        from '../modules/estoque/estoque.screen';
import { LeadsScreen }          from '../modules/leads/leads.screen';
import { AgendaScreen }         from '../modules/agenda/agenda.screen';
import { ServicosScreen }       from '../modules/servicos/servicos.screen';
import { MetasScreen }          from '../modules/metas/metas.screen';
import { FinanciamentosScreen } from '../modules/financiamentos/financiamentos.screen';
import { ReceitaScreen }        from '../modules/receita/receita.screen';
import { AvaliacaoScreen }      from '../modules/avaliacao/avaliacao.screen';
import { DesempenhoScreen }     from '../modules/desempenho/desempenho.screen';
import { RelatoriosScreen }     from '../modules/relatorios/relatorios.screen';
import { ConfiguracoesScreen }  from '../modules/configuracoes/configuracoes.screen';
// TypeScript may complain about missing .scss module declarations for
// side-effect style imports. Suppress that error here.
// @ts-ignore
import '../styles/globals.scss';

const AppInner: React.FC = () => {
  const { activeModule, setUser } = useApp();
  const { toasts, showToast } = useToast();
  useEffect(() => {
    const portalUrl = import.meta.env.VITE_PORTAL_URL
      || (import.meta.env.DEV ? 'http://localhost:5173' : 'http://localhost:8080');
    const redirect = () => {
      clearToken();
      window.location.href = `${portalUrl.replace(/\/$/, '')}/concessionaria`;
    };
    window.addEventListener('ford:unauthorized', redirect);
    if (!getToken()) {
      redirect();
      return () => window.removeEventListener('ford:unauthorized', redirect);
    }
    apiRequest<AuthenticatedUser>('/auth/me').then(setUser).catch(() => undefined);
    return () => window.removeEventListener('ford:unauthorized', redirect);
  }, [setUser]);

  // 403 do backend vira aviso amigável em vez de falha silenciosa.
  useEffect(() => {
    const onForbidden = (e: Event) =>
      showToast((e as CustomEvent<string>).detail || 'Acesso negado.', 'warning');
    window.addEventListener('ford:forbidden', onForbidden);
    return () => window.removeEventListener('ford:forbidden', onForbidden);
  }, [showToast]);
  const p = { showToast };
  const screen = () => {
    switch(activeModule) {
      case 'dashboard':      return <DashboardScreen />;
      case 'clientes':       return <ClientesScreen {...p} />;
      case 'historico':      return <HistoricoScreen {...p} />;
      case 'estoque':        return <EstoqueScreen {...p} onFinSimFromEstoque={()=>{}} />;
      case 'leads':          return <LeadsScreen {...p} />;
      case 'agenda':         return <AgendaScreen {...p} />;
      case 'servicos':       return <ServicosScreen {...p} />;
      case 'metas':          return <MetasScreen {...p} />;
      case 'financiamentos': return <FinanciamentosScreen {...p} />;
      case 'receita':        return <ReceitaScreen />;
      case 'avaliacao':      return <AvaliacaoScreen {...p} />;
      case 'desempenho':     return <DesempenhoScreen />;
      case 'relatorios':     return <RelatoriosScreen {...p} />;
      case 'config':         return <ConfiguracoesScreen {...p} />;
      default:               return <DashboardScreen />;
    }
  };
  return (
    <>
      <AppLayout showToast={showToast}>{screen()}</AppLayout>
      <ToastContainer toasts={toasts} />
    </>
  );
};

const App: React.FC = () => (
  <AppProvider><AppInner /></AppProvider>
);

export default App;
