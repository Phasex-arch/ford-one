/* ============================================================
   FORD ONE — Image Fade-in
   js/modules/image-fade.js
   ============================================================ */

'use strict';

function initImageFade() {
  document.querySelectorAll('img').forEach(function (img) {
    img.style.opacity    = '0';
    img.style.transition = 'opacity 0.45s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load',  function () { img.style.opacity = '1'; });
      img.addEventListener('error', function () { img.style.opacity = '1'; });
    }
  });
}
