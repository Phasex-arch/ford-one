// @ts-check
'use strict';
/* ============================================================
   historico.js
   logAccess(), logVehicleAccess(), renderHistorico(),
   fecharHistoricoCliente(), vhImgHtml(),
   selectClienteHistorico(), clearHistory()
============================================================ */

// ─── HISTÓRICO ───────────────────────────────────────────────
function logAccess(cid){if(accessLog.clientes.find(x=>x.id===cid))return;const c=CLIENTES.find(x=>x.id===cid);if(!c)return;accessLog.clientes.push({id:cid,nome:c.nome,ini:c.ini,hora:nowStr()});}
function logVehicleAccess(vid,modelo,cliName,cid){if(accessLog.veiculos.find(x=>x.id===vid))return;accessLog.veiculos.push({id:vid,cid:cid||'',modelo,cli:cliName,hora:nowStr()});}

function renderHistorico(){
  const cc=$('histClientChips');
  cc.innerHTML=accessLog.clientes.length?accessLog.clientes.map(a=>`<div class="chip" onclick="goHistorico('${a.id}')"><div class="chip-av">${a.ini}</div><span>${a.nome}</span><span class="chip-t">${a.hora}</span></div>`).join(''):'<span class="chip-empty">Nenhum cliente acessado hoje.</span>';
  const cv=$('histVehicleChips');
  cv.innerHTML=accessLog.veiculos.length?accessLog.veiculos.map(a=>`<div class="chip" style="cursor:pointer" onclick="openVehicleModal('${a.cid}','${a.id}')"><i class="ph-bold ph-car" style="font-size:12px;color:var(--ford-vivid);flex-shrink:0"></i><span>${a.modelo}</span><span style="font-size:var(--fs0);color:var(--c-dim)">${a.cli}</span><span class="chip-t">${a.hora}</span></div>`).join(''):'<span class="chip-empty">Nenhum veículo acessado hoje.</span>';
  $('histClientDetail').style.display='none';
}

function fecharHistoricoCliente(){$('histClientDetail').style.display='none';navigate('clientes',document.querySelector('[data-module="clientes"]'));}

function vhImgHtml(v){if(v.img)return'<img src="'+v.img+'" alt="'+v.modelo+'" loading="lazy" style="width:100%;height:100%;object-fit:cover">';return'<div class="vh-ph"><i class="ph-bold ph-car" style="font-size:38px"></i><span>'+v.modelo+'</span></div>';}

function selectClienteHistorico(cid,scroll){
  const c=CLIENTES.find(x=>x.id===cid);if(!c)return;
  $('clientSummary').innerHTML=
    '<div class="csb-item"><div class="csb-lbl">Cliente</div><div class="csb-val" style="font-size:var(--fs3)">'+c.nome+'</div></div>'+
    '<div class="csb-item"><div class="csb-lbl">Status</div><div class="csb-val"><span class="pill '+c.status+'">'+cap(c.status)+'</span></div></div>'+
    '<div class="csb-item"><div class="csb-lbl">Segmento</div><div class="csb-val">'+c.seg+'</div></div>'+
    '<div class="csb-item"><div class="csb-lbl">Veículos</div><div class="csb-val">'+c.v+'</div></div>'+
    '<div class="csb-item"><div class="csb-lbl">LTV Total</div><div class="csb-val" style="color:var(--green)">'+formatCurrency(c.ltv)+'</div></div>'+
    '<div class="csb-item"><div class="csb-lbl">Telefone</div><div class="csb-val" style="font-size:var(--fs3)">'+c.tel+'</div></div>';
  const veics=VEICULOS[cid]||[];
  if(!veics.length){$('vehiclesGrid').innerHTML='<p style="color:var(--c-dim);font-size:var(--fs1);padding:14px 0">Nenhum veículo registrado.</p>';}
  else{
    $('vehiclesGrid').innerHTML='';
    veics.forEach(v=>{
      const card=document.createElement('div');card.className='vh-card'+(v.atual?' atual':'');
      card.innerHTML=(v.atual?'<div class="vh-banner">Veículo Atual</div>':'')+
        '<div class="vh-img">'+vhImgHtml(v)+'</div>'+
        '<div class="vh-body"><div class="vh-model">'+v.modelo+'</div><div class="vh-ver">'+v.versao+'</div>'+
        '<div class="vh-meta"><div><div class="vm-lbl">Ano</div><div class="vm-val">'+v.ano+'</div></div><div><div class="vm-lbl">KM</div><div class="vm-val">'+v.km+' km</div></div><div><div class="vm-lbl">Aquisição</div><div class="vm-val">'+v.aq+'</div></div><div><div class="vm-lbl">Status</div><div class="vm-val"><span class="pill '+(v.status==='ativo'?'ativo-v':v.status)+'">'+cap(v.status)+'</span></div></div></div></div>'+
        '<div class="vh-foot"><span class="vh-foot-txt">Último: <strong>'+v.ult+'</strong></span><button class="btn-tbl">Ver detalhes</button></div>';
      card.addEventListener('click',()=>openVehicleModal(cid,v.id));
      card.querySelector('.btn-tbl').addEventListener('click',e=>{e.stopPropagation();openVehicleModal(cid,v.id);});
      $('vehiclesGrid').appendChild(card);
    });
  }
  $('histClientDetail').style.display='block';
  if(scroll)setTimeout(()=>$('histClientDetail').scrollIntoView({behavior:'smooth',block:'start'}),80);
}

function clearHistory(){accessLog.clientes=[];accessLog.veiculos=[];closeModal('confirmModal');renderHistorico();showToast('Histórico de acessos apagado.','success');}

