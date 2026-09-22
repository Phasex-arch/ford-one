/**
 * @file agenda.service.ts
 * @module agenda
 * @description Service de acesso aos agendamentos da oficina.
 * Busca em GET /api/agendamentos?data=YYYY-MM-DD (todos os agendamentos de um
 * dia, cancelados inclusos — o cancelamento é visual/riscado, não some da
 * grade) e expõe create/cancel reais. Sem dado mockado, sem cache local.
 *
 * A grade de horários (SLOT_HOURS) é uma constante de UI (os slots bookáveis
 * da oficina, 07:30–17:00), não dado de negócio — fica em shared/constants.
 */

import type { Appointment, AgendaSlot } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse } from '../../../shared/api/client';
import { SLOT_HOURS } from '../../../shared/constants/agenda';

interface AgendamentoApi {
  id: string;
  cliente: string;
  servico: string;
  tecnico?: string | null;
  dataHora: string;
  status: 'AGENDADO' | 'CANCELADO' | 'CONCLUIDO';
  leadId?: string | null;
}

export const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const horaKey = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const isUrgente = (servico: string): boolean => /urgente/i.test(servico);

const toAppointment = (item: AgendamentoApi): Appointment => ({
  id: item.id,
  cli: item.cliente,
  type: item.servico,
  tech: item.tecnico ?? '',
  cls: item.status === 'CANCELADO' ? '' : isUrgente(item.servico) ? 'urgent' : 'service',
  cancelled: item.status === 'CANCELADO',
});

export async function fetchAgendamentosDia(dia: Date): Promise<AgendaSlot[]> {
  const qs = new URLSearchParams({ data: dateKey(dia), limit: '50' });
  const response = await apiRequest<PaginatedResponse<AgendamentoApi>>(`/agendamentos?${qs}`);
  const porHora = new Map<string, Appointment[]>();
  for (const item of response.data) {
    const key = horaKey(item.dataHora);
    const list = porHora.get(key) ?? [];
    list.push(toAppointment(item));
    porHora.set(key, list);
  }
  return SLOT_HOURS.slice(0, 18).map(hora => ({ hora, apts: porHora.get(hora) ?? [] }));
}

export interface CreateAgendamentoInput {
  cliente?: string;
  clienteId?: string;
  servico: string;
  tecnico?: string;
  tecnicoId?: string;
  dataHora: string;
  leadId?: string;
}

export async function createAgendamento(input: CreateAgendamentoInput): Promise<Appointment> {
  const apiResponse = await apiRequest<AgendamentoApi>('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return toAppointment(apiResponse);
}

export async function cancelarAgendamento(id: string): Promise<void> {
  await apiRequest<AgendamentoApi>(`/agendamentos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'CANCELADO' }),
  });
}

export interface LeadAgendamento { id: string; leadId: string; dataHora: string; }

/** Agendamentos ativos vinculados a um lead (usado pelo módulo de Leads). */
export async function fetchAgendamentosDeLeads(): Promise<LeadAgendamento[]> {
  const qs = new URLSearchParams({ status: 'AGENDADO', limit: '100' });
  const response = await apiRequest<PaginatedResponse<AgendamentoApi>>(`/agendamentos?${qs}`);
  return response.data
    .filter((item): item is AgendamentoApi & { leadId: string } => !!item.leadId)
    .map(item => ({ id: item.id, leadId: item.leadId, dataHora: item.dataHora }));
}
