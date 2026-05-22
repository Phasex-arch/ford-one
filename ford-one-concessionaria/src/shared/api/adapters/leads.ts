/**
 * @file adapters/leads.ts
 * @description Conversoes Lead <-> LeadApiDto.
 */

import type { Lead, LeadUrgencia } from '../../../types/global.types';
import type { ApiLeadUrgencia, LeadApiDto } from '../types';

const URG_FROM: Record<ApiLeadUrgencia, LeadUrgencia> = {
  URGENTE: 'urgente',
  ALTA: 'alta',
  MEDIA: 'media',
  BAIXA: 'baixa',
};

const URG_TO: Record<LeadUrgencia, ApiLeadUrgencia> = {
  urgente: 'URGENTE',
  alta: 'ALTA',
  media: 'MEDIA',
  baixa: 'BAIXA',
};

export function leadFromApi(dto: LeadApiDto): Lead {
  return {
    id: dto.id,
    cli: dto.clienteNome,
    ini: dto.iniciais,
    v: dto.veiculoInteresse,
    nec: dto.necessidade,
    urg: URG_FROM[dto.urgencia] ?? 'media',
    val: dto.valorEstimado ?? 0,
    tel: dto.telefone,
    ins: dto.insight ?? '',
  };
}

export interface LeadCreatePayload {
  codigo: string;
  clienteNome: string;
  iniciais: string;
  veiculoInteresse: string;
  necessidade: string;
  urgencia: ApiLeadUrgencia;
  valorEstimado: number;
  telefone: string;
  insight?: string;
}

export function leadToApiCreate(
  dados: Omit<Lead, 'id'>,
  codigo: string
): LeadCreatePayload {
  return {
    codigo,
    clienteNome: dados.cli,
    iniciais: dados.ini,
    veiculoInteresse: dados.v,
    necessidade: dados.nec,
    urgencia: URG_TO[dados.urg] ?? 'MEDIA',
    valorEstimado: dados.val,
    telefone: dados.tel,
    insight: dados.ins || undefined,
  };
}

export function leadToApiUpdate(patch: Partial<Lead>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.cli !== undefined) out.clienteNome = patch.cli;
  if (patch.ini !== undefined) out.iniciais = patch.ini;
  if (patch.v !== undefined) out.veiculoInteresse = patch.v;
  if (patch.nec !== undefined) out.necessidade = patch.nec;
  if (patch.urg !== undefined) out.urgencia = URG_TO[patch.urg];
  if (patch.val !== undefined) out.valorEstimado = patch.val;
  if (patch.tel !== undefined) out.telefone = patch.tel;
  if (patch.ins !== undefined) out.insight = patch.ins;
  return out;
}

export { URG_TO as leadUrgToApi, URG_FROM as leadUrgFromApi };
