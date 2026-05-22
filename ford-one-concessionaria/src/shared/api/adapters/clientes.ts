/**
 * @file adapters/clientes.ts
 * @description Conversoes Cliente <-> ClienteApiDto.
 */

import type { Cliente, ClienteSegmento, ClienteStatus } from '../../../types/global.types';
import type { ApiClienteStatus, ClienteApiDto } from '../types';

const STATUS_FROM: Record<ApiClienteStatus, ClienteStatus> = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  POTENCIAL: 'potencial',
};

const STATUS_TO: Record<ClienteStatus, ApiClienteStatus> = {
  ativo: 'ATIVO',
  inativo: 'INATIVO',
  potencial: 'POTENCIAL',
};

export function clienteFromApi(dto: ClienteApiDto): Cliente {
  return {
    id: dto.id,
    nome: dto.nome,
    tel: dto.telefone,
    email: dto.email,
    ult: dto.ultimaVisita ?? '',
    status: STATUS_FROM[dto.status] ?? 'ativo',
    v: dto.veiculosCount ?? 0,
    ltv: dto.ltv ?? 0,
    ini: dto.iniciais,
    seg: (dto.segmento as ClienteSegmento) ?? 'Padrão',
  };
}

export interface ClienteCreatePayload {
  codigo: string;
  nome: string;
  telefone: string;
  email: string;
  status?: ApiClienteStatus;
  iniciais: string;
  segmento: string;
  ultimaVisita?: string;
  veiculosCount?: number;
  ltv?: number;
}

export function clienteToApiCreate(
  dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>,
  extras: { codigo: string; iniciais: string }
): ClienteCreatePayload {
  return {
    codigo: extras.codigo,
    nome: dados.nome,
    telefone: dados.tel,
    email: dados.email,
    status: STATUS_TO[dados.status] ?? 'ATIVO',
    iniciais: extras.iniciais,
    segmento: dados.seg,
    ultimaVisita: new Date().toLocaleDateString('pt-BR'),
    veiculosCount: 0,
    ltv: 0,
  };
}

export function clienteToApiUpdate(patch: Partial<Cliente>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.nome !== undefined) out.nome = patch.nome;
  if (patch.tel !== undefined) out.telefone = patch.tel;
  if (patch.email !== undefined) out.email = patch.email;
  if (patch.ult !== undefined) out.ultimaVisita = patch.ult;
  if (patch.status !== undefined) out.status = STATUS_TO[patch.status];
  if (patch.v !== undefined) out.veiculosCount = patch.v;
  if (patch.ltv !== undefined) out.ltv = patch.ltv;
  if (patch.ini !== undefined) out.iniciais = patch.ini;
  if (patch.seg !== undefined) out.segmento = patch.seg;
  return out;
}

export { STATUS_TO as clienteStatusToApi, STATUS_FROM as clienteStatusFromApi };
