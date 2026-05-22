/**
 * @file adapters/estoque.ts
 * @description Conversoes Estoque <-> EstoqueApiDto.
 */

import type { Estoque, EstoqueCondicao, EstoqueSegmento } from '../../../types/global.types';
import type { ApiEstoqueCondicao, ApiEstoqueSegmento, EstoqueApiDto } from '../types';

const COND_FROM: Record<ApiEstoqueCondicao, EstoqueCondicao> = {
  NOVO: 'novo',
  SEMINOVO: 'seminovo',
};

const COND_TO: Record<EstoqueCondicao, ApiEstoqueCondicao> = {
  novo: 'NOVO',
  seminovo: 'SEMINOVO',
};

const FRONT_SEGMENTS: EstoqueSegmento[] = ['suv', 'picape', 'sedan'];

function segmentFromApi(seg: ApiEstoqueSegmento | string): EstoqueSegmento {
  const lower = String(seg).toLowerCase();
  if (FRONT_SEGMENTS.includes(lower as EstoqueSegmento)) {
    return lower as EstoqueSegmento;
  }
  return 'suv';
}

function segmentToApi(seg: EstoqueSegmento | string): ApiEstoqueSegmento {
  const upper = String(seg).toUpperCase();
  if (['SUV', 'PICAPE', 'SEDAN', 'HATCH', 'OUTRO'].includes(upper)) {
    return upper as ApiEstoqueSegmento;
  }
  return 'OUTRO';
}

export function estoqueFromApi(dto: EstoqueApiDto): Estoque {
  return {
    id: dto.id,
    modelo: dto.modelo,
    versao: dto.versao,
    ano: dto.ano,
    motor: dto.motor,
    trans: dto.transmissao,
    cond: COND_FROM[dto.condicao] ?? 'novo',
    status: dto.status,
    preco: dto.preco,
    seg: segmentFromApi(dto.segmento),
    cor: dto.cor,
    img: dto.imagem ?? null,
    estq: dto.quantidade ?? 1,
    km: dto.km ?? null,
    ops: dto.opcionais ?? [],
  };
}

export interface EstoqueCreatePayload {
  codigo: string;
  modelo: string;
  versao: string;
  ano: string;
  motor: string;
  transmissao: string;
  condicao: ApiEstoqueCondicao;
  status?: string;
  preco: number;
  segmento: ApiEstoqueSegmento;
  cor: string;
  imagem?: string | null;
  quantidade?: number;
  km?: string | null;
  opcionais?: string[];
}

export function estoqueToApiCreate(
  e: Omit<Estoque, 'id'> & { codigo: string }
): EstoqueCreatePayload {
  return {
    codigo: e.codigo,
    modelo: e.modelo,
    versao: e.versao,
    ano: e.ano,
    motor: e.motor,
    transmissao: e.trans,
    condicao: COND_TO[e.cond] ?? 'NOVO',
    status: e.status,
    preco: e.preco,
    segmento: segmentToApi(e.seg),
    cor: e.cor,
    imagem: e.img ?? undefined,
    quantidade: e.estq,
    km: e.km ?? undefined,
    opcionais: e.ops,
  };
}

export function estoqueToApiUpdate(patch: Partial<Estoque>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.modelo !== undefined) out.modelo = patch.modelo;
  if (patch.versao !== undefined) out.versao = patch.versao;
  if (patch.ano !== undefined) out.ano = patch.ano;
  if (patch.motor !== undefined) out.motor = patch.motor;
  if (patch.trans !== undefined) out.transmissao = patch.trans;
  if (patch.cond !== undefined) out.condicao = COND_TO[patch.cond];
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.preco !== undefined) out.preco = patch.preco;
  if (patch.seg !== undefined) out.segmento = segmentToApi(patch.seg);
  if (patch.cor !== undefined) out.cor = patch.cor;
  if (patch.img !== undefined) out.imagem = patch.img ?? undefined;
  if (patch.estq !== undefined) out.quantidade = patch.estq;
  if (patch.km !== undefined) out.km = patch.km ?? undefined;
  if (patch.ops !== undefined) out.opcionais = patch.ops;
  return out;
}

export { COND_TO as estoqueCondToApi, COND_FROM as estoqueCondFromApi, segmentToApi as estoqueSegToApi };
