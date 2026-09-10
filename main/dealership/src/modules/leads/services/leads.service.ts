/**
 * @file leads.service.ts
 * @module leads
 * @description Service de acesso ao pipeline de leads inteligentes.
 *
 * Funções exportadas:
 * - filterLeads(urg) → retorna todos os leads ou filtra por urgência
 * - getLead(id)      → retorna um lead específico pelo ID
 *
 * Em produção: substituir por chamada GET /api/leads?urg=urgente.
 */

import type { Lead, LeadUrgencia } from '../../../types/global.types';
import { apiRequest } from '../../../shared/api/client';
let currentLeads: Lead[] = [];

export async function fetchLeads(): Promise<Lead[]> {
  const result = await apiRequest<Lead[] | { items?: Lead[]; leads?: Lead[] }>('/leads');
  currentLeads = Array.isArray(result) ? result : result.items || result.leads || [];
  return currentLeads;
}

export function filterLeads(urg: LeadUrgencia | '', source: Lead[] = []): Lead[] {
  return !urg ? source : source.filter(l => l.urg === urg);
}
export function getLead(id: string) { return currentLeads.find(l => l.id === id); }
