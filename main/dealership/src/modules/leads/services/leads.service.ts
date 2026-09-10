/**
 * @file leads.service.ts
 * @module leads
 * @description Service de acesso ao pipeline de leads inteligentes.
 *
 * Funções exportadas:
 * - filterLeads(urg) → retorna todos os leads ou filtra por urgência
 * - getLead(id)      → retorna um lead específico pelo ID
 *
 * Os dados vêm de GET /leads; a conversão do contrato fica em shared/api/mappers.ts.
 */

import type { Lead, LeadUrgencia } from '../../../types/global.types';
import { fetchLeads as fetchLeadsApi } from '../../../shared/api/resources';

let currentLeads: Lead[] = [];

/** Mantém a última lista carregada para o lookup síncrono de getLead(). */
export async function fetchLeads(): Promise<Lead[]> {
  currentLeads = await fetchLeadsApi();
  return currentLeads;
}

export function filterLeads(urg: LeadUrgencia | '', source: Lead[] = []): Lead[] {
  return !urg ? source : source.filter(l => l.urg === urg);
}
export function getLead(id: string) { return currentLeads.find(l => l.id === id); }
