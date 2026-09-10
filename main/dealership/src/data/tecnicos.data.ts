/**
 * @file tecnicos.data.ts
 * @description Grade de horários da oficina: SLOT_HOURS, de 07:30 a 17:00 em
 * intervalos de 30 min.
 *
 * Não é dado de API — é a configuração de funcionamento da oficina. A lista de
 * técnicos saiu daqui e vem de GET /tecnicos (shared/hooks/useTecnicos.ts).
 */

export const SLOT_HOURS = [
  '07:30','08:00','08:30','09:00','09:30','10:00',
  '10:30','11:00','11:30','12:00','12:30','13:00',
  '13:30','14:00','14:30','15:00','15:30','16:00',
  '16:30','17:00',
];
