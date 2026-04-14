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

import { LEADS } from '../../../data/leads.data';
import type { Lead, LeadUrgencia } from '../../../types/global.types';

export function filterLeads(urg: LeadUrgencia | ''): Lead[] {
  return !urg ? LEADS : LEADS.filter(l => l.urg === urg);
}
export function getLead(id: string) { return LEADS.find(l => l.id === id); }
