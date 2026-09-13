/**
 * @file useAgenda.ts
 * @module agenda
 * @description Hook de estado e lógica da tela de Agenda.
 *
 * Gerencia:
 * - offset: deslocamento do dia exibido (0 = hoje, 1 = amanhã, etc.)
 * - slots/loading: grade real do dia atual, de GET /api/agendamentos?data=X
 * - tecnicos: lista real de GET /api/tecnicos
 * - getDayTitle: label do dia atual ("Segunda-feira, 14 de Abril")
 * - active/total/pct: métricas de capacidade da oficina (total = nº de slots
 *   bookáveis no dia, uma constante de UI; active = agendamentos reais não
 *   cancelados no dia)
 * - shiftDay(d): navega entre dias incrementando/decrementando offset
 * - cancelApt(si, ai): PATCH status=CANCELADO no agendamento real
 * - confirmSchedule: POST novo agendamento real
 *
 * @param showToast → callback para feedback de cancelamento e confirmação
 */

import { useState, useCallback, useEffect } from 'react';
import { fetchAgendamentosDia, createAgendamento, cancelarAgendamento } from '../services/agenda.service';
import { fetchTecnicos } from '../../servicos/services/tecnico.service';
import { SLOT_HOURS } from '../../../shared/constants/agenda';
import { DAYS, MONTHS } from '../../../shared/utils/dates';
import type { AgendaSlot, Tecnico } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';
import { friendlyApiMessage } from '../../../shared/api/client';

const TOTAL_SLOTS = 18;

export function useAgenda(showToast: (m: string, t?: ToastType) => void) {
  const [offset, setOffset] = useState(0);
  const [slots, setSlots] = useState<AgendaSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [schedOpen, setSchedOpen] = useState(false);
  const [preselSlot, setPreselSlot] = useState(-1);
  const [selectedSlot, setSelectedSlot] = useState(-1);

  const diaAtual = useCallback(() => { const d = new Date(); d.setDate(d.getDate() + offset); return d; }, [offset]);

  const reload = useCallback(() => {
    setLoading(true);
    fetchAgendamentosDia(diaAtual())
      .then(setSlots)
      .catch(e => showToast(friendlyApiMessage(e), 'warning'))
      .finally(() => setLoading(false));
  }, [diaAtual, showToast]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { fetchTecnicos().then(setTecnicos).catch(() => setTecnicos([])); }, []);

  const getDayTitle = () => {
    const d = diaAtual();
    return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  };

  const active = slots.reduce((n, sl) => n + sl.apts.filter(a => !a.cancelled).length, 0);
  const total = TOTAL_SLOTS;
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;

  const shiftDay = (d: number) => { setOffset(o => Math.max(0, o + d)); };

  const cancelApt = (si: number, ai: number) => {
    const apt = slots[si]?.apts[ai]; if (!apt) return;
    cancelarAgendamento(apt.id).then(() => {
      showToast('Agendamento cancelado.', 'warning');
      reload();
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  };

  const confirmSchedule = (cli: string, serv: string, tech: string) => {
    if (selectedSlot < 0) { showToast('Selecione um horário.', 'warning'); return; }
    if (!cli || !serv) { showToast('Preencha cliente e serviço.', 'warning'); return; }
    const t = tech || tecnicos.find(x => x.status === 'livre')?.nome || tecnicos[0]?.nome || '';
    const hora = SLOT_HOURS[selectedSlot];
    const [h, m] = hora.split(':').map(Number);
    const d = diaAtual();
    const dataHora = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).toISOString();
    createAgendamento({ cliente: cli, servico: serv, tecnico: t || undefined, dataHora }).then(() => {
      setSchedOpen(false); setSelectedSlot(-1);
      showToast(`Agendado: ${cli} às ${hora}${t ? ' com ' + t : ''}!`, 'success');
      reload();
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  };

  return { slots, loading, offset, getDayTitle, active, total, pct, shiftDay, cancelApt,
           schedOpen, setSchedOpen, preselSlot, setPreselSlot, selectedSlot, setSelectedSlot,
           confirmSchedule, tecnicos };
}
