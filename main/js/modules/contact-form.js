/* ============================================================
   FORD ONE — Contact Form
   js/modules/contact-form.js
   ============================================================ */

'use strict';

function initContactForm() {
  var form       = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  var submitBtn  = document.getElementById('submitBtn');
  if (!form) return;

  /* Seta erro em campo */
  function setErr(id, msg) {
    var el  = document.getElementById(id);
    var err = document.getElementById(id + '-error');
    if (el)  el.classList.toggle('error', !!msg);
    if (err) err.textContent = msg || '';
  }

  /* Valida campo individual */
  function validateField(id) {
    var el  = document.getElementById(id);
    if (!el) return;
    var val = el.value.trim();

    if (id === 'nome') {
      if (!val)           return setErr('nome', 'Informe seu nome.');
      if (val.length < 3) return setErr('nome', 'Nome muito curto.');
      setErr('nome', '');
    } else if (id === 'email') {
      if (!val)                    return setErr('email', 'Informe seu e-mail.');
      if (!isValidEmail(val))      return setErr('email', 'E-mail inválido.');
      setErr('email', '');
    } else if (id === 'telefone') {
      if (!val)                    return setErr('telefone', 'Informe seu telefone.');
      if (!isValidPhone(val))      return setErr('telefone', 'Telefone inválido.');
      setErr('telefone', '');
    } else if (id === 'cidade') {
      if (!val) return setErr('cidade', 'Informe sua cidade.');
      setErr('cidade', '');
    } else if (id === 'interesse') {
      if (!val) return setErr('interesse', 'Selecione um interesse.');
      setErr('interesse', '');
    }
  }

  /* Valida todos os campos */
  function validateAll() {
    ['nome', 'email', 'telefone', 'cidade', 'interesse'].forEach(validateField);
    return !form.querySelector('.error');
  }

  /* Blur individual */
  ['nome', 'email', 'telefone', 'cidade'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('blur', function () { validateField(id); });
  });
  var interesse = document.getElementById('interesse');
  if (interesse) interesse.addEventListener('change', function () { validateField('interesse'); });

  /* Máscara telefone */
  var telEl = document.getElementById('telefone');
  if (telEl) {
    telEl.addEventListener('input', function () {
      this.value = formatPhone(this.value);
    });
  }

  /* Submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateAll()) {
      var first = form.querySelector('.error');
      if (first) scrollToElement(first, 120);
      return;
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      var txt = submitBtn.querySelector('.btn-submit-text');
      if (txt) txt.textContent = 'Enviando...';
    }
    setTimeout(function () {
      form.style.display = 'none';
      if (formSuccess) {
        formSuccess.classList.add('show');
        scrollToElement(formSuccess, 120);
      }
    }, 1400);
  });
}
