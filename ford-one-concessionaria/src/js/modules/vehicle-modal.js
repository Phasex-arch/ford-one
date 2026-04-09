// @ts-check
'use strict';
/* ============================================================
   vehicle-modal.js
   openVehicleModal() — modal de veículo com
   histórico, dados financeiros e insights comerciais.
============================================================ */

// ─── VEHICLE MODAL ───────────────────────────────────────────
function openVehicleModal(cid,vid){
  const v=(VEICULOS[cid]||[]).find(x=>x.id===vid);if(!v){showToast('Veículo não encontrado.','warning');return;}
  const c=CLIENTES.find(x=>x.id===cid);
  if(c)logVehicleAccess(vid,v.modelo+' '+v.versao.split(' ')[0],c.nome.split(' ').slice(0,2).join(' '),cid);
  const el=$('vehicleModalContent');
  const heroImg=v.img?'<img src="'+v.img+'" alt="'+v.modelo+'" style="width:100%;height:100%;object-fit:cover">'
    :'<div class="m-hero-ph"><i class="ph-bold ph-car" style="font-size:52px;color:rgba(255,255,255,.25)"></i></div>';
  const cliSection=c?'<div class="m-sec"><div class="m-sec-title">Cliente</div><div class="m-grid"><div><div class="mf-lbl">Nome</div><div class="mf-val">'+c.nome+'</div></div><div><div class="mf-lbl">Telefone</div><div class="mf-val">'+c.tel+'</div></div><div><div class="mf-lbl">Segmento</div><div class="mf-val">'+c.seg+'</div></div><div><div class="mf-lbl">LTV Total</div><div class="mf-val" style="color:var(--green)">'+formatCurrency(c.ltv)+'</div></div></div></div>':'';
  const statusPill='<span class="pill '+(v.status==='ativo'?'ativo-v':v.status)+'">'+cap(v.status)+'</span>';
  const finHtml='<div><div class="mf-lbl">Custo Acumulado</div><div class="mf-val">'+v.fin.custo+'</div></div><div><div class="mf-lbl">Ticket Médio</div><div class="mf-val">'+v.fin.ticket+'</div></div><div><div class="mf-lbl">Valor Estimado</div><div class="mf-val" style="color:var(--ford-vivid)">'+v.fin.est+'</div></div>';
  const insHtml=v.ins.map((s,i)=>'<span class="itag '+(['blue','green','orange'][i%3])+'">'+s+'</span>').join('');
  const tlHtml=v.hist.map(h=>'<div class="tl-item"><div class="tl-date">'+h.d+'</div><div class="tl-ev">'+h.ev+'</div><div class="tl-det">'+h.det+' &middot; <strong>'+h.val+'</strong></div></div>').join('');
  el.innerHTML='<div class="m-hero">'+heroImg+'<div class="m-hero-ov"></div><div class="m-hero-info"><h2>'+v.modelo+'</h2><p>'+v.versao+' &middot; '+v.ano+' &middot; '+v.cor+'</p></div></div>'+
    '<div class="m-body">'+cliSection+
    '<div class="m-sec"><div class="m-sec-title">Dados Gerais</div><div class="m-grid"><div><div class="mf-lbl">Modelo</div><div class="mf-val">'+v.modelo+' '+v.versao+'</div></div><div><div class="mf-lbl">Ano</div><div class="mf-val">'+v.ano+'</div></div><div><div class="mf-lbl">Cor</div><div class="mf-val">'+v.cor+'</div></div><div><div class="mf-lbl">KM</div><div class="mf-val">'+v.km+' km</div></div><div><div class="mf-lbl">Aquisição</div><div class="mf-val">'+v.aq+'</div></div><div><div class="mf-lbl">Status</div><div class="mf-val">'+statusPill+'</div></div></div></div>'+
    '<div class="m-sec"><div class="m-sec-title">Dados Financeiros</div><div class="m-grid three">'+finHtml+'</div></div>'+
    '<div class="m-sec"><div class="m-sec-title">Insights Comerciais</div>'+insHtml+'</div>'+
    '<div class="m-sec"><div class="m-sec-title">Linha do Tempo</div><div class="timeline">'+tlHtml+'</div></div></div>';
  openModal('vehicleModal');
}

