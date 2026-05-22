/**
 * @file App.tsx
 * @description Componente raiz da aplicação Ford One.
 *
 * Responsabilidades:
 * - Envolver toda a árvore de componentes com AuthProvider + AppProvider
 * - Gatear a renderização: mostrar LoginScreen quando não há sessão
 * - Instanciar o AppLayout (Header + Sidebar + área principal)
 * - Renderizar a tela correta com base no módulo ativo (activeModule)
 * - Montar o ToastContainer para exibir notificações globais
 * - Fornecer o callback showToast a todas as telas que precisam disparar toasts
 *
 * Padrão de roteamento: sem React Router — o módulo ativo é controlado pelo
 * AppContext via navigate(ModuleId), mantendo tudo em SPA sem URLs por rota.
 */
import React from 'react';
import { AppProvider, useApp } from '../shared/context/AppContext';
import { AuthProvider, useAuth } from '../shared/auth/AuthContext';
import { AppLayout } from '../shared/ui/Layout/AppLayout';
import { ToastContainer } from '../shared/components/Toast/Toast';
import { useToast } from '../shared/hooks/useToast';
import { LoginScreen } from '../modules/auth/login.screen';
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
import '../styles/globals.scss';

const BootSpinner: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050a36',
      color: '#fff',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          width: 22,
          height: 22,
          border: '3px solid rgba(255,255,255,0.25)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'fordBootSpin 0.8s linear infinite',
          display: 'inline-block',
        }}
      />
      <span style={{ letterSpacing: 1, fontWeight: 600 }}>Ford One</span>
    </div>
    <style>{`@keyframes fordBootSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppInner: React.FC = () => {
  const { activeModule } = useApp();
  const { toasts, showToast } = useToast();
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

const AppShell: React.FC = () => {
  const { user, ready } = useAuth();
  if (!ready) return <BootSpinner />;
  if (!user) return <LoginScreen />;
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppShell />
  </AuthProvider>
);

export default App;
