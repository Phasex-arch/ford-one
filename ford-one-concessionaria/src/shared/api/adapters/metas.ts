/**
 * @file adapters/metas.ts
 * @description Conversoes Meta <-> MetaApiDto.
 *
 * Os nomes batem entre front e API; o adapter so coage o `indicador`
 * para o union type do front e preserva campos extras.
 */

import type { Meta, MetaIndicador } from '../../../types/global.types';
import type { MetaApiDto } from '../types';

const VALID_INDICADORES: MetaIndicador[] = [
  'vendas',
  'receita',
  'leads',
  'nps',
  'sla',
  'conv',
];

function coerceIndicador(value: string): MetaIndicador {
  return (VALID_INDICADORES as string[]).includes(value)
    ? (value as MetaIndicador)
    : 'vendas';
}

export function metaFromApi(dto: MetaApiDto): Meta {
  return {
    id: dto.id,
    titulo: dto.titulo,
    periodo: dto.periodo,
    indicador: coerceIndicador(dto.indicador),
    atual: dto.atual,
    alvo: dto.alvo,
    unidade: dto.unidade,
    responsavel: dto.responsavel,
    lowerIsBetter: !!dto.lowerIsBetter,
  };
}

export interface MetaCreatePayload {
  codigo: string;
  titulo: string;
  periodo: string;
  indicador: string;
  atual: number;
  alvo: number;
  unidade: string;
  responsavel: string;
  lowerIsBetter?: boolean;
}

export function metaToApiCreate(meta: Omit<Meta, 'id'>, codigo: string): MetaCreatePayload {
  return {
    codigo,
    titulo: meta.titulo,
    periodo: meta.periodo,
    indicador: meta.indicador,
    atual: meta.atual,
    alvo: meta.alvo,
    unidade: meta.unidade,
    responsavel: meta.responsavel,
    lowerIsBetter: meta.lowerIsBetter,
  };
}

export function metaToApiUpdate(patch: Partial<Meta>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.titulo !== undefined) out.titulo = patch.titulo;
  if (patch.periodo !== undefined) out.periodo = patch.periodo;
  if (patch.indicador !== undefined) out.indicador = patch.indicador;
  if (patch.atual !== undefined) out.atual = patch.atual;
  if (patch.alvo !== undefined) out.alvo = patch.alvo;
  if (patch.unidade !== undefined) out.unidade = patch.unidade;
  if (patch.responsavel !== undefined) out.responsavel = patch.responsavel;
  if (patch.lowerIsBetter !== undefined) out.lowerIsBetter = patch.lowerIsBetter;
  return out;
}
