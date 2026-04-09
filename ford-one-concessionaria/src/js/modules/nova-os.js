// @ts-check
'use strict';
/* ============================================================
   nova-os.js
   openNovaOSModal(), salvarNovaOS()
============================================================ */

// ─── NOVA OS ─────────────────────────────────────────────────
function openNovaOSModal(){
  const sel=$('osTecnico');if(sel)sel.innerHTML='<option value="">Selecione o técnico...</option>'+TECNICOS.map(t=>`<option>${t.nome}</option>`).join('');
  const di=$('osData');if(di){const d=new Date();di.value=d.toISOString().split('T')[0];}
  openModal('novaOSModal');
}
function salvarNovaOS(){
  const cli=$('osCliente')?.value.trim(),vei=$('osVeiculo')?.value.trim(),tipo=$('osTipoServico')?.value,tech=$('osTecnico')?.value||'',data=$('osData')?.value,hora=$('osHorario')?.value||'08:00',pri=$('osPrioridade')?.value||'normal';
  if(!cli||!vei||!tipo||!data){showToast('Preencha todos os campos obrigatórios.','warning');return;}
  const num='#'+(4900+SERVICOS.previstos.length+1),dt=new Date(data+'T12:00:00'),df=dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
  SERVICOS.previstos.unshift({num,c:cli,v:vei,t:tipo,tech:tech||'A designar',prazo:`${df}, ${hora}`,pc:pri==='urgente'?'risco':'ok',val:'A calcular'});
  closeModal('novaOSModal');['osCliente','osVeiculo','osObs'].forEach(id=>{const el=$(id);if(el)el.value='';});
  if(curMod==='servicos')renderServicos('previstos');
  showToast(`OS ${num} criada com sucesso!`,'success');
}

