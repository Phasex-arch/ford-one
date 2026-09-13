import { describe, it, expect, vi } from 'vitest';
import { createColaborador, fetchColaboradores, type CreateColaboradorInput } from './colaboradores.service';
import { apiRequest } from '../../../shared/api/client';

vi.mock('../../../shared/api/client', () => ({
  apiRequest: vi.fn(),
}));

describe('colaboradores.service — createColaborador', () => {
  const input: CreateColaboradorInput = {
    nome: 'Maria Consultora',
    cpf: '12345678900',
    telefone: '(11) 98888-7777',
    email: 'maria@ford.com.br',
    endereco: 'Av. Paulista, 1000',
    registro: 'FRD-VEN-010',
    cargo: 'Vendedora',
    role: 'FUNCIONARIO',
    senha: 'Senha@Forte123',
    ativo: true,
  };

  it('envia POST /colaboradores com o payload completo e mapeia o CPF mascarado de volta', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      id: 'colab-1',
      nome: 'Maria Consultora',
      cpf: '***.***.789-00',
      telefone: input.telefone,
      email: input.email,
      endereco: input.endereco,
      registro: input.registro,
      cargo: input.cargo,
      role: input.role,
      ativo: true,
      createdAt: '2026-09-13T00:00:00.000Z',
    });

    const result = await createColaborador(input);

    expect(apiRequest).toHaveBeenCalledWith('/colaboradores', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    expect(result.cpfMascarado).toBe('***.***.789-00');
    expect(result.id).toBe('colab-1');
  });

  it('propaga o erro de conflito do backend (email/CPF/registro duplicado) sem mascarar a mensagem', async () => {
    vi.mocked(apiRequest).mockImplementation(() => Promise.reject(new Error('Email ja cadastrado')));

    await expect(createColaborador(input)).rejects.toThrow('Email ja cadastrado');
  });
});

describe('colaboradores.service — fetchColaboradores', () => {
  it('monta a query string com página e limite, e só inclui "search" quando preenchido', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false },
    });

    await fetchColaboradores({ page: 2, limit: 10 });
    expect(apiRequest).toHaveBeenCalledWith('/colaboradores?page=2&limit=10');

    await fetchColaboradores({ page: 1, limit: 10, search: '  maria  ' });
    expect(apiRequest).toHaveBeenCalledWith('/colaboradores?page=1&limit=10&search=maria');
  });
});
