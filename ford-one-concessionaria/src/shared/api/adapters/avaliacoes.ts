/**
 * @file adapters/avaliacoes.ts
 * @description Conversoes Avaliacao <-> AvaliacaoApiDto.
 */

import type { Avaliacao } from '../../../types/global.types';
import type { AvaliacaoApiDto } from '../types';

export interface AvaliacaoLocal extends Avaliacao {
  _apiId: string;
}

export function avaliacaoFromApi(dto: AvaliacaoApiDto): AvaliacaoLocal {
  return {
    c: dto.cliente,
    nota: dto.nota,
    data: dto.data,
    txt: dto.texto,
    detalhe: dto.detalhe ?? '',
    _apiId: dto.id,
  };
}

export interface AvaliacaoCreatePayload {
  cliente: string;
  nota: number;
  data: string;
  texto: string;
  detalhe?: string;
}

export function avaliacaoToApiCreate(a: Avaliacao): AvaliacaoCreatePayload {
  return {
    cliente: a.c,
    nota: a.nota,
    data: a.data,
    texto: a.txt,
    detalhe: a.detalhe || undefined,
  };
}
