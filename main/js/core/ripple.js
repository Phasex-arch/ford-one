/* ============================================================
   FORD ONE — Ripple Effect
   js/core/ripple.js
   ============================================================ */

'use strict';

function initRipple() {
  /* Injeta keyframe */
  var style = document.createElement('style');
  style.textContent = '@keyframes rpl { to { transform: scale(1); opacity: 0; } }';
  document.head.appendChild(style);

  var btns = document.querySelectorAll(
    '.btn-primary, .btn-submit, .btn-cta-final, .btn-cta-header, .btn-login'
  );

  btns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var r    = document.createElement('span');
      var rect = this.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.4;

      r.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'background:rgba(255,255,255,0.2)',
        'width:'  + size + 'px',
        'height:' + size + 'px',
        'left:'   + (e.clientX - rect.left - size / 2) + 'px',
        'top:'    + (e.clientY - rect.top  - size / 2) + 'px',
        'transform:scale(0)',
        'animation:rpl 0.55s ease-out',
        'pointer-events:none',
      ].join(';');

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(r);
      setTimeout(function () { r.remove(); }, 560);
    });
  });
}
