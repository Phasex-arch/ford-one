/**
 * @file estoque.service.ts
 * @module estoque
 * @description Service de acesso ao estoque de veículos.
 *
 * Funções exportadas:
 * - fetchEstoque(params)     → busca uma página filtrada/paginada direto do backend
 *   (busca textual, condição e segmento viram query string real, com debounce
 *   aplicado no hook — nada é filtrado em memória)
 * - fetchEstoqueById(id)     → busca um item específico (usado quando o modal abre
 *   via busca global e o item pode não estar na página atualmente carregada)
 *
 * A interface EstoqueFilters é exportada para o useEstoque e a barra de filtros.
 */

import type { Estoque } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse, type PaginationMeta } from '../../../shared/api/client';

interface EstoqueApi {
  id: string;
  modelo: string;
  versao: string;
  ano: string;
  motor: string;
  transmissao: string;
  condicao: 'NOVO' | 'SEMINOVO';
  status: string;
  preco: number;
  segmento: string;
  cor: string;
  imagem?: string | null;
  quantidade?: number;
  km?: string | null;
  opcionais?: string[];
}

export interface CatalogVehicle {
  id: string;
  modelo: string;
  versao: string;
  ano_modelo: number;
  categoria_principal: string;
  preco_inicial: number | null;
  motorizacao: {
    descricao: string;
    transmissao: string;
    combustivel: string;
    potencia_cv: number;
  };
  cores: { nome: string }[];
  imagens: { tipo: string; url: string }[];
}

interface CatalogResponse {
  vehicles?: CatalogVehicle[];
}

const toEstoque = (item: EstoqueApi): Estoque => ({
  id: item.id,
  modelo: item.modelo,
  versao: item.versao,
  ano: item.ano,
  motor: item.motor,
  trans: item.transmissao,
  cond: item.condicao.toLowerCase() as Estoque['cond'],
  status: item.status,
  preco: item.preco,
  seg: item.segmento.toLowerCase() as Estoque['seg'],
  cor: item.cor,
  img: item.imagem ?? null,
  estq: item.quantidade ?? 0,
  km: item.km ?? null,
  ops: item.opcionais ?? [],
});

export interface EstoqueFilters { query: string; cond: string; seg: string; }

export interface FetchEstoqueParams {
  page: number;
  limit: number;
  cond?: string;
  seg?: string;
  search?: string;
}

export interface EstoquePage {
  data: Estoque[];
  pagination: PaginationMeta;
}

export async function fetchEstoque(params: FetchEstoqueParams): Promise<EstoquePage> {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.cond) qs.set('condicao', params.cond.toUpperCase());
  if (params.seg) qs.set('segmento', params.seg.toUpperCase());
  if (params.search?.trim()) qs.set('search', params.search.trim());
  const response = await apiRequest<PaginatedResponse<EstoqueApi>>(`/estoque?${qs}`);
  return { data: response.data.map(toEstoque), pagination: response.pagination };
}

export async function fetchEstoqueById(id: string): Promise<Estoque> {
  const item = await apiRequest<EstoqueApi>(`/estoque/${id}`);
  return toEstoque(item);
}

export async function fetchCatalogVehicles(): Promise<CatalogVehicle[]> {
  const result = await apiRequest<CatalogResponse | CatalogVehicle[]>(
    '/vehicles?page=1&limit=100',
  );
  return Array.isArray(result) ? result : result.vehicles ?? [];
}

export interface CreateEstoqueInput {
  codigo: string;
  modelo: string;
  versao: string;
  ano: string;
  motor: string;
  transmissao: string;
  condicao: 'NOVO' | 'SEMINOVO';
  status: string;
  preco: number;
  segmento: 'SUV' | 'PICAPE' | 'SEDAN' | 'HATCH' | 'OUTRO';
  cor: string;
  imagem?: string;
  quantidade: number;
  km?: string;
  opcionais: string[];
}

export async function createEstoque(input: CreateEstoqueInput): Promise<EstoqueApi> {
  return apiRequest<EstoqueApi>('/estoque', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface UpdateEstoqueInput {
  condicao?: 'NOVO' | 'SEMINOVO';
  status?: string;
  preco?: number;
  cor?: string;
  quantidade?: number;
  km?: string;
  opcionais?: string[];
}

export async function updateEstoque(id: string, dados: UpdateEstoqueInput): Promise<Estoque> {
  const apiResponse = await apiRequest<EstoqueApi>(`/estoque/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
  return toEstoque(apiResponse);
}

export async function deleteEstoque(id: string): Promise<void> {
  await apiRequest<void>(`/estoque/${id}`, { method: 'DELETE' });
}
