import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { apiRequest, getToken, clearToken } from '../api/client';

vi.mock('../api/client', async () => {
  const actual = await vi.importActual<typeof import('../api/client')>('../api/client');
  return { ...actual, apiRequest: vi.fn() };
});

/**
 * Simula uma tela real (Dashboard, Estoque...) que dispara sua própria
 * chamada de API assim que monta — exatamente o padrão que expôs o bug: o
 * boot troca o #code=... por um token de forma assíncrona, e telas que
 * montam cedo demais chamavam a API sem token, tomavam 401 e derrubavam a
 * sessão de volta pro portal.
 */
function ChildScreen() {
  useEffect(() => {
    apiRequest('/dashboard');
  }, []);
  return <div data-testid="child-screen">tela carregada</div>;
}

describe('AppProvider — boot com código de troca (#code=...)', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    // @ts-expect-error — substituição deliberada só para o teste (o tipo de
    // window.location no lib.dom não permite reatribuição direta)
    delete window.location;
    // @ts-expect-error — idem
    window.location = { href: '', hash: '', pathname: '/', search: '' };
  });

  afterEach(() => {
    // @ts-expect-error — idem
    window.location = originalLocation;
  });

  it('não monta as telas filhas (nem deixa elas chamarem API) antes da troca do código terminar', async () => {
    window.location.hash = '#code=codigo-de-uso-unico';
    let resolveExchange!: (v: { accessToken: string }) => void;
    vi.mocked(apiRequest).mockImplementation((path: string) => {
      if (path === '/auth/exchange') {
        return new Promise((resolve) => { resolveExchange = resolve; });
      }
      if (path === '/auth/me') {
        return Promise.resolve({ id: '1', nome: 'Admin', email: 'a@a.com', role: 'ADMIN' });
      }
      return Promise.resolve({});
    });

    render(
      <AppProvider>
        <ChildScreen />
      </AppProvider>,
    );

    // Enquanto a troca não resolve, a tela filha não deve existir — e
    // portanto não pode ter chamado /dashboard sem token.
    expect(screen.queryByTestId('child-screen')).not.toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith('/dashboard');

    resolveExchange({ accessToken: 'jwt-real' });

    await waitFor(() => expect(screen.getByTestId('child-screen')).toBeInTheDocument());
    expect(getToken()).toBe('jwt-real');
    expect(apiRequest).toHaveBeenCalledWith('/dashboard');
  });

  it('limpa o hash da URL antes mesmo da troca terminar, pra nunca deixar o código exposto no histórico', async () => {
    window.location.hash = '#code=codigo-de-uso-unico';
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    vi.mocked(apiRequest).mockImplementation((path: string) =>
      path === '/auth/exchange'
        ? Promise.resolve({ accessToken: 'jwt-real' })
        : Promise.resolve({ id: '1', nome: 'Admin', email: 'a@a.com', role: 'ADMIN' }),
    );

    render(<AppProvider><ChildScreen /></AppProvider>);

    // A limpeza do hash (via history.replaceState) acontece de forma síncrona,
    // antes de qualquer await — tem que já ter rolado mesmo sem esperar nada.
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
    expect(replaceStateSpy.mock.calls[0][2]).not.toContain('code=');

    await waitFor(() =>
      expect(apiRequest).toHaveBeenCalledWith(
        '/auth/exchange',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ code: 'codigo-de-uso-unico' }) }),
      ),
    );
  });

  it('redireciona pro portal (e limpa o token) quando a troca do código falha', async () => {
    window.location.hash = '#code=codigo-expirado';
    vi.mocked(apiRequest).mockImplementation(() =>
      Promise.reject(new Error('Código de acesso inválido ou expirado')),
    );

    render(<AppProvider><ChildScreen /></AppProvider>);

    await waitFor(() => expect(window.location.href).toContain('/concessionaria'));
    expect(getToken()).toBeNull();
  });

  it('sem código na URL e sem token salvo, redireciona direto pro portal', async () => {
    clearToken();

    render(<AppProvider><ChildScreen /></AppProvider>);

    await waitFor(() => expect(window.location.href).toContain('/concessionaria'));
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('useApp', () => {
  it('lança um erro claro quando usado fora do AppProvider', () => {
    const Rogue = () => { useApp(); return null; };
    expect(() => render(<Rogue />)).toThrow('useApp must be used within AppProvider');
  });
});
