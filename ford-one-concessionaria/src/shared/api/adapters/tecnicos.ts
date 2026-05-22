/**
 * @file adapters/tecnicos.ts
 * @description Conversoes Tecnico <-> TecnicoApiDto.
 *
 * Obs: o tipo Tecnico do front (global.types.ts) so cobre tres status
 * (livre/ocupado/pausa). A API pode retornar 'AUSENTE' tambem; nesse caso
 * mapeamos para 'pausa' como melhor aproximacao.
 */

import type { Tecnico, TecnicoStatus } from '../../../types/global.types';
import type { ApiTecnicoStatus, TecnicoApiDto } from '../types';

const STATUS_FROM: Record<ApiTecnicoStatus, TecnicoStatus> = {
  LIVRE: 'livre',
  OCUPADO: 'ocupado',
  PAUSA: 'pausa',
  AUSENTE: 'pausa',
};

const STATUS_TO: Record<TecnicoStatus, ApiTecnicoStatus> = {
  livre: 'LIVRE',
  ocupado: 'OCUPADO',
  pausa: 'PAUSA',
};

export interface TecnicoLocal extends Tecnico {
  _apiId: string;
}

export function tecnicoFromApi(dto: TecnicoApiDto): TecnicoLocal {
  return {
    nome: dto.nome,
    ini: dto.iniciais,
    esp: dto.especialidade,
    status: STATUS_FROM[dto.status] ?? 'livre',
    _apiId: dto.id,
  };
}

export function tecnicoToApiCreate(t: Tecnico): {
  nome: string;
  iniciais: string;
  especialidade: string;
  status?: ApiTecnicoStatus;
} {
  return {
    nome: t.nome,
    iniciais: t.ini,
    especialidade: t.esp,
    status: STATUS_TO[t.status] ?? 'LIVRE',
  };
}
