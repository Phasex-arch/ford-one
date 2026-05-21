/**
 * @file tecnicos.data.ts
 * @description Dados mockados dos técnicos da oficina e horários disponíveis.
 * Exporta TECNICOS (lista de técnicos com especialidade e status)
 * e SLOT_HOURS (array de horários de 07:30 a 17:00 em intervalos de 30min).
 *
 * Em produção: substituir por chamada GET /api/tecnicos.
 */

import type { Tecnico } from '../types/global.types';

export const TECNICOS: Tecnico[] = [
  { nome:'André Souza',    ini:'AS', esp:'Revisões programadas',    status:'ocupado' },
  { nome:'Eduardo Lima',   ini:'EL', esp:'Elétrica e Eletrônica',   status:'livre'   },
  { nome:'Marcos Vieira',  ini:'MV', esp:'Mecânica geral',          status:'livre'   },
  { nome:'Bruna Castro',   ini:'BC', esp:'Funilaria e Pintura',     status:'pausa'   },
  { nome:'Diego Ferreira', ini:'DF', esp:'Suspensão e Freios',      status:'ocupado' },
  { nome:'Flávia Mendes',  ini:'FM', esp:'Revisões programadas',    status:'livre'   },
];

export const SLOT_HOURS = [
  '07:30','08:00','08:30','09:00','09:30','10:00',
  '10:30','11:00','11:30','12:00','12:30','13:00',
  '13:30','14:00','14:30','15:00','15:30','16:00',
  '16:30','17:00',
];
