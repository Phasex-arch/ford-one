import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authenticate } from './concessionaria-login.service';
import { apiRequest } from '../../../shared/api/client';

vi.mock('../../../shared/api/client', () => ({
  apiRequest: vi.fn(),
}));

describe('concessionaria-login.service — authenticate', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // jsdom não implementa navegação de verdade — trocamos location por um
    // stub gravável só pra capturar o href que o login tenta escrever.
    // @ts-expect-error — substituição deliberada só para o teste (o tipo de
    // window.location no lib.dom não permite reatribuição direta)
    delete window.location;
    // @ts-expect-error — idem
    window.location = { href: '' };
  });

  afterEach(() => {
    // @ts-expect-error — idem
    window.location = originalLocation;
  });

  it('logs in, exchanges the token for a single-use code, and redirects with it in the URL fragment — never the raw JWT', async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ accessToken: 'jwt-de-verdade' })
      .mockResolvedValueOnce({ code: 'abc-123', expiresIn: 30 });

    const result = await authenticate({ username: 'admin@ford.com.br', password: 'Senha@Forte123' });

    expect(result).toBe(true);
    expect(apiRequest).toHaveBeenNthCalledWith(
      1,
      '/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'admin@ford.com.br', senha: 'Senha@Forte123' }),
      }),
    );
    expect(apiRequest).toHaveBeenNthCalledWith(
      2,
      '/auth/exchange-code',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer jwt-de-verdade' },
      }),
    );
    expect(window.location.href).toContain('#code=abc-123');
    expect(window.location.href).not.toContain('jwt-de-verdade');
  });

  it('propagates a login failure without ever reaching the exchange step', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Credenciais invalidas'));

    await expect(
      authenticate({ username: 'admin@ford.com.br', password: 'errada' }),
    ).rejects.toThrow('Credenciais invalidas');
    expect(apiRequest).toHaveBeenCalledTimes(1);
  });
});
