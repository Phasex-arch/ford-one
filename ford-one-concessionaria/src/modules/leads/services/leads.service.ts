/**
 * @file leads.service.ts
 * @module leads
 * @description Service de leads delegando para /api/v1/leads.
 *
 * - `fetchLeads(urg)` busca da API filtrando por urgencia opcional.
 * - `getLead(id)` consulta o store em memoria (cache global), com fallback
 *   para a lista mockada quando o cache ainda nao foi populado.
 */

import { LEADS as MOCK_LEADS } from '../../../data/leads.data';
import { leadsStore } from '../../../shared/api/cache';
import * as leadsApi from '../../../shared/api/resources/leads';
import type { Lead, LeadUrgencia } from '../../../types/global.types';

export async function fetchLeads(urg: LeadUrgencia | ''): Promise<Lead[]> {
  return leadsApi.list({ urgencia: urg || undefined, limit: 100 });
}

export function applyFilters(items: Lead[], urg: LeadUrgencia | ''): Lead[] {
  if (!urg) return items;
  return items.filter((l) => l.urg === urg);
}

export function getLead(id: string): Lead | undefined {
  return leadsStore.get().find((l) => l.id === id) ?? MOCK_LEADS.find((l) => l.id === id);
}

export async function createLead(dados: Omit<Lead, 'id'>): Promise<Lead> {
  const codigo = `L${Date.now().toString().slice(-6)}`;
  return leadsApi.create(dados, codigo);
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<Lead> {
  return leadsApi.update(id, patch);
}

export async function removeLead(id: string): Promise<void> {
  return leadsApi.remove(id);
}
