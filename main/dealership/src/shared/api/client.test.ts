import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, ApiError, getToken, setToken, clearToken } from './client';

const TOKEN_KEY = 'ford_one_token';

function mockFetchOnce(status: number, body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

describe('client — armazenamento de token', () => {
  beforeEach(() => localStorage.clear());

  it('persiste e limpa o token via localStorage', () => {
    expect(getToken()).toBeNull();
    setToken('meu-jwt');
    expect(getToken()).toBe('meu-jwt');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('meu-jwt');
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe('client — apiRequest', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent = vi.fn(window.dispatchEvent.bind(window));
  });

  it('anexa o Authorization header quando há token salvo', async () => {
    setToken('token-valido');
    mockFetchOnce(200, { ok: true });

    await apiRequest('/estoque');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/estoque'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-valido' }),
      }),
    );
  });

  it('não envia Authorization quando não há token (evita "Bearer null")', async () => {
    mockFetchOnce(200, { ok: true });

    await apiRequest('/dashboard');

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('em um 401, limpa o token e dispara ford:unauthorized (é o que a sessão precisa pra saber que expirou)', async () => {
    setToken('token-expirado');
    mockFetchOnce(401, { message: 'jwt expired' });

    await expect(apiRequest('/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBeNull();
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ford:unauthorized' }),
    );
  });

  it('propaga a mensagem de erro do backend em falhas != 401', async () => {
    setToken('token-valido');
    mockFetchOnce(403, { message: 'Você não tem permissão para esta ação.' });

    await expect(apiRequest('/colaboradores')).rejects.toMatchObject({
      status: 403,
      message: 'Você não tem permissão para esta ação.',
    });
  });
});
