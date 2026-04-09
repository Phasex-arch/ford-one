// @ts-check
'use strict';
/* ============================================================
   modal.js
   openModal(), closeModal()
============================================================ */

// ─── MODAIS ──────────────────────────────────────────────────
function openModal(id){$(id).classList.add('open');document.body.style.overflow='hidden';}
function closeModal(id){$(id).classList.remove('open');document.body.style.overflow='';}

