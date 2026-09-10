/**
 * @file useAsyncList.spec.ts
 * @description O hook que dá loading/erro/vazio às telas de listagem.
 *
 * Ele substituiu os `catch(() => setX([]))` que engoliam o erro e deixavam a
 * tela em branco sem explicação — então o caminho de erro é o que mais importa
 * aqui.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsyncList } from './useAsyncList';

describe('useAsyncList', () => {
  it('começa em loading e entrega os dados', async () => {
    const fetcher = vi.fn(async () => [1, 2, 3]);
    const { result } = renderHook(() => useAsyncList(fetcher));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([1, 2, 3]);
    expect(result.current.error).toBe('');
  });

  it('expõe a mensagem do erro em vez de engolir', async () => {
    const fetcher = vi.fn(async () => { throw new Error('403 negado'); });
    const { result } = renderHook(() => useAsyncList(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('403 negado');
    expect(result.current.data).toEqual([]);
  });

  it('usa mensagem padrão quando o erro não é Error', async () => {
    const fetcher = vi.fn(async () => { throw 'texto solto'; });
    const { result } = renderHook(() => useAsyncList(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Erro ao carregar dados.');
  });

  it('não seta estado depois do unmount', async () => {
    let resolver: (v: number[]) => void = () => {};
    const fetcher = vi.fn(() => new Promise<number[]>((r) => { resolver = r; }));
    const erros: unknown[] = [];
    const originalErro = console.error;
    console.error = (...args) => erros.push(args);

    const { unmount } = renderHook(() => useAsyncList(fetcher));
    unmount();
    await act(async () => { resolver([1]); await Promise.resolve(); });

    console.error = originalErro;
    expect(erros).toHaveLength(0);
  });

  it('setData permite inserção otimista após criar registro', async () => {
    const fetcher = vi.fn(async () => [1]);
    const { result } = renderHook(() => useAsyncList(fetcher));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setData((p) => [...p, 2]); });
    expect(result.current.data).toEqual([1, 2]);
  });
});
