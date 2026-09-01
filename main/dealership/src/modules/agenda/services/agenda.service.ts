/**
 * @file agenda.service.ts
 * @module agenda
 * @description Service de gerenciamento dos slots de agenda por dia.
 * Mantém um cache em memória (CACHE) de AgendaSlot[] por offset de dia.
 *
 * Funções exportadas:
 * - getSlotsForDay(offset) → retorna ou inicializa os slots do dia (offset 0 = hoje)
 *   O dia 0 vem com agendamentos preset realistas.
 *   Dias futuros (offset > 0) começam com todos os slots livres.
 *
 * Os slots são mutáveis em memória — cancelamentos e criações persistem
 * durante a sessão. Em produção: substituir por API REST.
 */

import { SLOT_HOURS } from '../../../data/tecnicos.data';
import type { AgendaSlot } from '../../../types/global.types';

const PRESET: [number, object][] = [
  [0, {cli:'Carlos Mendes',  type:'Revisão 10.000 km',     tech:'André Souza',   cls:'service'}],
  [1, {cli:'Ana Rodrigues',  type:'Alinhamento',           tech:'Eduardo Lima',  cls:''       }],
  [3, {cli:'Fernanda Costa', type:'Revisão 30.000 km',     tech:'André Souza',   cls:'service'}],
  [6, {cli:'Juliana Cardoso',type:'OS URGENTE — Elétrico', tech:'Bruna Castro',  cls:'urgent' }],
  [9, {cli:'Beatriz Neves',  type:'Revisão 15.000 km',     tech:'Eduardo Lima',  cls:'service'}],
];

const CACHE: Record<number, AgendaSlot[]> = {};

export function getSlotsForDay(offset: number): AgendaSlot[] {
  if (!CACHE[offset]) {
    CACHE[offset] = SLOT_HOURS.slice(0,18).map((h, i) => {
      const found = offset === 0 ? PRESET.find(p => p[0] === i) : undefined;
      return { hora: h, apts: found ? [{ ...(found[1] as object), cancelled: false }] as any : [] };
    });
  }
  return CACHE[offset];
}