/**
 * @file colaboradores.service.ts
 * @module configuracoes
 * @description CRUD real de colaboradores (GET/POST/PATCH/DELETE /api/colaboradores).
 *
 * Regras de acesso espelham o backend exatamente (RolesGuard):
 * - Listar/editar: ADMIN ou GERENTE
 * - Criar/desativar: somente ADMIN
 *
 * O CPF retorna sempre mascarado do backend (***.***.###-##) — nunca é
 * reenviado em updates (o backend nem aceita CPF em PATCH, é imutável
 * após o cadastro).
 */

import { apiRequest, type PaginatedResponse, type PaginationMeta } from '../../../shared/api/client';

export type ColaboradorRole = 'ADMIN' | 'GERENTE' | 'FUNCIONARIO';

export interface Colaborador {
  id: string;
  nome: string;
  cpfMascarado: string;
  telefone: string;
  email: string;
  endereco: string;
  registro: string;
  cargo: string;
  role: ColaboradorRole;
  ativo: boolean;
  createdAt: string;
}

interface ColaboradorApi {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  registro: string;
  cargo: string;
  role: ColaboradorRole;
  ativo: boolean;
  createdAt: string;
}

const toColaborador = (c: ColaboradorApi): Colaborador => ({
  id: c.id,
  nome: c.nome,
  cpfMascarado: c.cpf,
  telefone: c.telefone,
  email: c.email,
  endereco: c.endereco,
  registro: c.registro,
  cargo: c.cargo,
  role: c.role,
  ativo: c.ativo,
  createdAt: c.createdAt,
});

export interface FetchColaboradoresParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ColaboradoresPage {
  data: Colaborador[];
  pagination: PaginationMeta;
}

export async function fetchColaboradores(params: FetchColaboradoresParams): Promise<ColaboradoresPage> {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.search?.trim()) qs.set('search', params.search.trim());
  const response = await apiRequest<PaginatedResponse<ColaboradorApi>>(`/colaboradores?${qs}`);
  return { data: response.data.map(toColaborador), pagination: response.pagination };
}

export interface CreateColaboradorInput {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  registro: string;
  cargo: string;
  role: ColaboradorRole;
  senha: string;
  ativo: boolean;
}

export async function createColaborador(dados: CreateColaboradorInput): Promise<Colaborador> {
  const apiResponse = await apiRequest<ColaboradorApi>('/colaboradores', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return toColaborador(apiResponse);
}

export interface UpdateColaboradorInput {
  nome?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cargo?: string;
  role?: ColaboradorRole;
  ativo?: boolean;
  senha?: string;
}

export async function updateColaborador(id: string, dados: UpdateColaboradorInput): Promise<Colaborador> {
  const apiResponse = await apiRequest<ColaboradorApi>(`/colaboradores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
  return toColaborador(apiResponse);
}

/** Desativa o acesso (soft-delete real no backend — não some da lista, fica ativo:false). */
export async function desativarColaborador(id: string): Promise<void> {
  await apiRequest<void>(`/colaboradores/${id}`, { method: 'DELETE' });
}
