// @ts-check
'use strict';
/* ============================================================
   tech-conflict.js
   getTechBusySlotsForDay(), getTechBusySlots(),
   pickAvailableTechForDay(), pickAvailableTech()
   Regras de conflito e auto-assign de técnicos.
============================================================ */

// ─── CONFLITO DE TÉCNICO ──────────────────────────────────────
function getTechBusySlotsForDay(dayOff,techName){
  const slots=getSlotsForDay(dayOff),busy=new Set();
  slots.forEach((sl,i)=>{if(sl.apts.some(a=>!a.cancelled&&a.tech===techName)){for(let k=0;k<2;k++){if(i+k<slots.length)busy.add(i+k);}}});
  return busy;
}
function getTechBusySlots(techName){return getTechBusySlotsForDay(agOffset,techName);}
function pickAvailableTechForDay(dayOff,slotIdx){
  const free=TECNICOS.filter(t=>!getTechBusySlotsForDay(dayOff,t.nome).has(slotIdx));
  return free.length?free[Math.floor(Math.random()*free.length)].nome:null;
}
function pickAvailableTech(slotIdx){return pickAvailableTechForDay(agOffset,slotIdx);}

