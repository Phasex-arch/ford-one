/**
 * @file useAgenda.ts
 * @module agenda
 * @description Hook de estado e lógica da tela de Agenda.
 *
 * Gerencia:
 * - offset: deslocamento do dia exibido (0 = hoje, 1 = amanhã, etc.)
 * - slots: array de AgendaSlot do dia atual
 * - getDayTitle: label do dia atual ("Segunda-feira, 14 de Abril")
 * - active/total/pct: métricas de capacidade da oficina
 * - shiftDay(d): navega entre dias incrementando/decrementando offset
 * - cancelApt(si, ai): marca um appointment como cancelado
 * - confirmSchedule: cria novo agendamento no slot selecionado
 * - schedOpen/setSchedOpen: visibilidade do modal de novo agendamento
 * - selectedSlot/setSelectedSlot: índice do slot selecionado no modal
 *
 * forceUpdate() dispara re-render após mutações no array de slots.
 *
 * @param showToast → callback para feedback de cancelamento e confirmação
 */

import { useState, useCallback } from 'react';
import { getSlotsForDay } from '../services/agenda.service';
import { TECNICOS } from '../../../data/tecnicos.data';
import { DAYS, MONTHS } from '../../../shared/utils/dates';
import type { ToastType } from '../../../shared/hooks/useToast';

export function useAgenda(showToast: (m:string,t?:ToastType)=>void) {
  const [offset, setOffset] = useState(0);
  const [schedOpen, setSchedOpen] = useState(false);
  const [preselSlot, setPreselSlot] = useState(-1);
  const [selectedSlot, setSelectedSlot] = useState(-1);
  const [, forceUpdate] = useState(0);

  const slots = getSlotsForDay(offset);

  const getDayTitle = () => {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  };

  const active = slots.reduce((n,sl)=>n+sl.apts.filter(a=>!a.cancelled).length,0);
  const total = 18;
  const pct = Math.round((active/total)*100);

  const shiftDay = (d: number) => { setOffset(o=>Math.max(0,o+d)); };

  const cancelApt = (si: number, ai: number) => {
    getSlotsForDay(offset)[si].apts[ai].cancelled = true;
    forceUpdate(n=>n+1);
    showToast('Agendamento cancelado.','warning');
  };

  const confirmSchedule = (cli: string, serv: string, tech: string) => {
    if (selectedSlot < 0) { showToast('Selecione um horário.','warning'); return; }
    if (!cli || !serv) { showToast('Preencha cliente e serviço.','warning'); return; }
    const t = tech || TECNICOS.find(x=>x.status==='livre')?.nome || TECNICOS[0].nome;
    getSlotsForDay(offset)[selectedSlot].apts.push({cli,type:serv,tech:t,cls:'',cancelled:false});
    setSchedOpen(false); setSelectedSlot(-1); forceUpdate(n=>n+1);
    showToast(`Agendado: ${cli} às ${slots[selectedSlot].hora} com ${t}!`,'success');
  };

  return { slots, offset, getDayTitle, active, total, pct, shiftDay, cancelApt,
           schedOpen, setSchedOpen, preselSlot, setPreselSlot, selectedSlot, setSelectedSlot,
           confirmSchedule, TECNICOS };
}