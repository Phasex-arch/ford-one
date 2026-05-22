/**
 * @file adapters/financiamentos.ts
 * @description Conversoes Financiamento <-> FinanciamentoApiDto.
 */

import type { Financiamento, FinanciamentoStatus } from '../../../types/global.types';
import type { ApiFinanciamentoStatus, FinanciamentoApiDto } from '../types';

const STATUS_FROM: Record<ApiFinanciamentoStatus, FinanciamentoStatus> = {
  APROVADO: 'aprovado',
  ANALISE: 'analise',
  PENDENTE: 'pendente',
  REPROVADO: 'reprovado',
};

const STATUS_TO: Record<FinanciamentoStatus, ApiFinanciamentoStatus> = {
  aprovado: 'APROVADO',
  analise: 'ANALISE',
  pendente: 'PENDENTE',
  reprovado: 'REPROVADO',
};

export function financiamentoFromApi(dto: FinanciamentoApiDto): Financiamento {
  return {
    id: dto.id,
    cli: dto.clienteNome,
    ini: dto.iniciais,
    veiculo: dto.veiculo,
    valor: dto.valor,
    entrada: dto.entrada,
    prazo: dto.prazo,
    taxa: dto.taxa,
    parcela: dto.parcela,
    status: STATUS_FROM[dto.status] ?? 'pendente',
    data: dto.data,
  };
}

export interface FinanciamentoCreatePayload {
  codigo: string;
  clienteNome: string;
  iniciais: string;
  veiculo: string;
  valor: number;
  entrada: number;
  prazo: number;
  taxa: number;
  parcela: number;
  status?: ApiFinanciamentoStatus;
  data: string;
}

export function financiamentoToApiCreate(
  fin: Omit<Financiamento, 'id'>,
  codigo: string
): FinanciamentoCreatePayload {
  return {
    codigo,
    clienteNome: fin.cli,
    iniciais: fin.ini,
    veiculo: fin.veiculo,
    valor: fin.valor,
    entrada: fin.entrada,
    prazo: fin.prazo,
    taxa: fin.taxa,
    parcela: fin.parcela,
    status: STATUS_TO[fin.status] ?? 'PENDENTE',
    data: fin.data,
  };
}

export function financiamentoToApiUpdate(
  patch: Partial<Financiamento>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.cli !== undefined) out.clienteNome = patch.cli;
  if (patch.ini !== undefined) out.iniciais = patch.ini;
  if (patch.veiculo !== undefined) out.veiculo = patch.veiculo;
  if (patch.valor !== undefined) out.valor = patch.valor;
  if (patch.entrada !== undefined) out.entrada = patch.entrada;
  if (patch.prazo !== undefined) out.prazo = patch.prazo;
  if (patch.taxa !== undefined) out.taxa = patch.taxa;
  if (patch.parcela !== undefined) out.parcela = patch.parcela;
  if (patch.status !== undefined) out.status = STATUS_TO[patch.status];
  if (patch.data !== undefined) out.data = patch.data;
  return out;
}

export { STATUS_TO as financiamentoStatusToApi, STATUS_FROM as financiamentoStatusFromApi };
