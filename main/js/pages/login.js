/* ============================================================
   FORD ONE — Concessionaria Login
   js/pages/login.js
   ============================================================ */

'use strict';

function initLogin() {
  var passInput = document.getElementById('password');
  var toggleBtn = document.getElementById('togglePass');
  var eyeIcon   = document.getElementById('eyeIcon');
  var btnLogin  = document.getElementById('btnLogin');
  var errorMsg  = document.getElementById('errorMsg');
  var userInput = document.getElementById('username');

  if (!btnLogin) return;

  var VALID_USER = 'Ford-PhaseX';
  var VALID_PASS = 'Ford';

  /* Redireciona para a pasta irmã concessionaria dentro de frontend/ */
  function getRedirectUrl() {
    var parts  = window.location.pathname.split('/').filter(Boolean);
    var base   = parts[0]; // 'frontend'
    return window.location.origin + '/' + base + '/concessionaria/';
  }

  /* Toggle senha */
  if (toggleBtn && passInput && eyeIcon) {
    toggleBtn.addEventListener('click', function () {
      var show = passInput.type === 'password';
      passInput.type    = show ? 'text' : 'password';
      eyeIcon.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
  }

  /* Limpar erros ao digitar */
  [userInput, passInput].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', function () {
      el.classList.remove('error');
      if (errorMsg) errorMsg.classList.remove('show');
    });
  });

  /* Login */
  function doLogin() {
    var u = userInput ? userInput.value.trim() : '';
    var p = passInput ? passInput.value         : '';

    if (userInput) userInput.classList.remove('error');
    if (passInput) passInput.classList.remove('error');
    if (errorMsg)  errorMsg.classList.remove('show');

    if (!u || !p) {
      if (!u && userInput) userInput.classList.add('error');
      if (!p && passInput) passInput.classList.add('error');
      return;
    }

    btnLogin.disabled = true;
    btnLogin.classList.add('loading');

    setTimeout(function () {
      if (u === VALID_USER && p === VALID_PASS) {
        window.location.href = getRedirectUrl();
      } else {
        btnLogin.disabled = false;
        btnLogin.classList.remove('loading');
        if (userInput) userInput.classList.add('error');
        if (passInput) { passInput.classList.add('error'); passInput.value = ''; passInput.focus(); }
        if (errorMsg)  errorMsg.classList.add('show');
      }
    }, 900);
  }

  btnLogin.addEventListener('click', doLogin);

  [userInput, passInput].forEach(function (el) {
    if (!el) return;
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
  });
}
