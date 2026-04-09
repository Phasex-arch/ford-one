// @ts-check
'use strict';
/* ============================================================
   novo-cliente.js
   openNovoClienteModal(), salvarNovoCliente()
============================================================ */

// ─── NOVO CLIENTE ────────────────────────────────────────────
function openNovoClienteModal(){openModal('novoClienteModal');}
function salvarNovoCliente(){
  const nome=$('ncNome')?.value.trim(),tel=$('ncTel')?.value.trim(),email=$('ncEmail')?.value.trim(),seg=$('ncSegmento')?.value||'Padrao',status=$('ncStatus')?.value||'potencial';
  if(!nome||!tel||!email){showToast('Preencha nome, telefone e e-mail.','warning');return;}
  const ini=nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase(),newId='C'+(100+CLIENTES.length+1);
  CLIENTES.push({id:newId,nome,tel,email,ult:new Date().toLocaleDateString('pt-BR'),status,v:0,ltv:0,ini,seg});
  closeModal('novoClienteModal');['ncNome','ncTel','ncEmail','ncObs'].forEach(id=>{const el=$(id);if(el)el.value='';});
  if(curMod==='clientes')renderClientes();
  showToast(`Cliente ${nome.split(' ')[0]} cadastrado!`,'success');
}

