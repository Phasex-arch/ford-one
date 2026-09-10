/**
 * @file GlobalSearch.spec.tsx
 * @description Regressão de P0-2, o lado do frontend.
 *
 * A busca global renderiza o nome do cliente/lead com `dangerouslySetInnerHTML`
 * para realçar o termo buscado. O `highlight()` escapa metacaracteres de *regex*
 * na query — não HTML no texto —, então um nome vindo da API com tags é injetado
 * no DOM.
 *
 * O nome de um lead pode ser definido por qualquer pessoa, sem autenticação, via
 * `POST /api/public/leads`. O alvo é a sessão de um atendente, e o JWT mora em
 * localStorage. Daí a gravidade.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppProvider } from '../../context/AppContext';
import { GlobalSearch } from './GlobalSearch';

const PAYLOAD = '<img src=x onerror="window.__xss=1">';

vi.mock('../../api/resources', () => ({
  fetchClientes: vi.fn(async () => [
    { uuid: 'u1', id: 'C001', nome: `Carlos ${PAYLOAD}`, tel: '1', email: 'c@e.com',
      ult: '01/01/2026', status: 'ativo', v: 1, ltv: 1, ini: 'CA', seg: 'Premium' },
  ]),
  fetchEstoque: vi.fn(async () => []),
  fetchLeads: vi.fn(async () => [
    { uuid: 'u2', id: 'L001', cli: `Carla ${PAYLOAD}`, ini: 'CA', v: 'Ranger',
      nec: 'troca', urg: 'media', val: 1, tel: '1', ins: '' },
  ]),
}));

/**
 * Renderiza e espera o useAsyncList resolver. Sem isso o índice está vazio na
 * hora de digitar, o dropdown não abre, e o teste passaria sem exercitar nada.
 */
const renderizarCarregado = async () => {
  const utils = render(
    <AppProvider>
      <GlobalSearch />
    </AppProvider>,
  );
  await act(async () => { await Promise.resolve(); });
  return utils;
};

/** Digita o termo e espera o dropdown com resultados. */
const buscar = async (container: HTMLElement, termo: string) => {
  fireEvent.change(screen.getByPlaceholderText(/Pesquisar cliente/i), {
    target: { value: termo },
  });
  await waitFor(() => {
    expect(container.querySelectorAll('.sri').length).toBeGreaterThan(0);
  });
};

describe('GlobalSearch', () => {
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).__xss;
  });

  it('P0-2: nome vindo da API não pode injetar HTML no DOM', async () => {
    const { container } = await renderizarCarregado();
    // "ca" casa com "Carlos" e "Carla" — cliente e lead, dois caminhos.
    await buscar(container, 'ca');

    expect(container.querySelector('img')).toBeNull();
    expect((window as unknown as Record<string, unknown>).__xss).toBeUndefined();
  });

  it('o nome aparece como texto literal, tags inclusive', async () => {
    const { container } = await renderizarCarregado();
    await buscar(container, 'ca');
    // Escapado, o payload fica visível para o atendente em vez de executar —
    // que é o comportamento correto.
    expect(container.textContent).toContain('<img');
  });

  it('ainda realça o termo buscado', async () => {
    const { container } = await renderizarCarregado();
    await buscar(container, 'carlos');
    expect(container.querySelector('mark')).not.toBeNull();
  });
});
