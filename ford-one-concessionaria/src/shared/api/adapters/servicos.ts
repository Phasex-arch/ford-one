/**
 * @file adapters/servicos.ts
 * @description Conversoes OrdemServico <-> ServicoApiDto. O `id` da API e
 * preservado em um campo nao tipado para permitir mutacoes (PATCH/DELETE).
 */

import type { OSStatus, OrdemServico } from '../../../types/global.types';
import type {
  ApiServicoPrioridade,
  ApiServicoStatus,
  ServicoApiDto,
} from '../types';

const PRI_FROM: Record<ApiServicoPrioridade, OSStatus> = {
  OK: 'ok',
  RISCO: 'risco',
  ATRASADO: 'atrasado',
};

const PRI_TO: Record<OSStatus, ApiServicoPrioridade> = {
  ok: 'OK',
  risco: 'RISCO',
  atrasado: 'ATRASADO',
};

export type ServicoTabKey = 'previstos' | 'andamento' | 'concluidos';

export const TAB_STATUS: Record<ServicoTabKey, ApiServicoStatus> = {
  previstos: 'PREVISTO',
  andamento: 'ANDAMENTO',
  concluidos: 'CONCLUIDO',
};

export const NEXT_STATUS: Record<ApiServicoStatus, ApiServicoStatus | null> = {
  PREVISTO: 'ANDAMENTO',
  ANDAMENTO: 'CONCLUIDO',
  CONCLUIDO: null,
  CANCELADO: null,
};

/**
 * OrdemServico estendida com o id da API e status original.
 * O front mantem o tipo OrdemServico (sem id) intacto, mas o hook precisa
 * desses dois campos para fazer PATCH/DELETE.
 */
export interface ServicoLocal extends OrdemServico {
  _apiId: string;
  _apiStatus: ApiServicoStatus;
}

export function servicoFromApi(dto: ServicoApiDto): ServicoLocal {
  return {
    num: dto.numero,
    c: dto.cliente,
    v: dto.veiculo,
    t: dto.tipo,
    tech: dto.tecnico,
    prazo: dto.prazo,
    pc: PRI_FROM[dto.prioridade] ?? 'ok',
    val: dto.valor,
    _apiId: dto.id,
    _apiStatus: dto.status,
  };
}

export interface ServicoCreatePayload {
  numero: string;
  cliente: string;
  veiculo: string;
  tipo: string;
  tecnico: string;
  prazo: string;
  prioridade?: ApiServicoPrioridade;
  valor: string;
  status?: ApiServicoStatus;
}

export function servicoToApiCreate(
  dados: Omit<OrdemServico, 'num' | 'pc'>,
  numero: string
): ServicoCreatePayload {
  return {
    numero,
    cliente: dados.c,
    veiculo: dados.v,
    tipo: dados.t,
    tecnico: dados.tech,
    prazo: dados.prazo,
    prioridade: 'OK',
    valor: dados.val,
    status: 'PREVISTO',
  };
}

export function servicoToApiUpdate(
  patch: Partial<OrdemServico> & { status?: ApiServicoStatus }
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.c !== undefined) out.cliente = patch.c;
  if (patch.v !== undefined) out.veiculo = patch.v;
  if (patch.t !== undefined) out.tipo = patch.t;
  if (patch.tech !== undefined) out.tecnico = patch.tech;
  if (patch.prazo !== undefined) out.prazo = patch.prazo;
  if (patch.pc !== undefined) out.prioridade = PRI_TO[patch.pc];
  if (patch.val !== undefined) out.valor = patch.val;
  if (patch.status !== undefined) out.status = patch.status;
  return out;
}
