// @ts-check
'use strict';
/* ============================================================
   agenda-shift.js
   shiftDay() — navega entre dias na agenda
============================================================ */

// ─── AGENDA — troca de dia ────────────────────────────────────
function shiftDay(d){
  agOffset+=d;SLOTS=getSlotsForDay(agOffset);
  const dt=new Date();dt.setDate(dt.getDate()+agOffset);
  $('agendaDayTitle').textContent=`${DAYS[dt.getDay()]}, ${dt.getDate()} de ${MONTHS[dt.getMonth()]}`;
  renderAgendaDay();updateCapacity();
}

