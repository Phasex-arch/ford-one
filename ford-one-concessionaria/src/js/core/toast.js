// @ts-check
'use strict';
/* ============================================================
   toast.js
   showToast(msg, type) — feedback visual via toast
============================================================ */

// ─── TOAST ───────────────────────────────────────────────────
function showToast(msg,type='info'){
  const icons={success:'ph-check-circle',info:'ph-info',warning:'ph-warning',error:'ph-x-circle'};
  const el=document.createElement('div');el.className=`toast ${type}`;
  el.innerHTML=`<i class="ph-bold ${icons[type]}"></i><span>${msg}</span>`;
  $('toastContainer').appendChild(el);
  setTimeout(()=>{el.style.cssText+='opacity:0;transform:translateX(16px);transition:all .3s ease';setTimeout(()=>el.remove(),320);},3200);
}

