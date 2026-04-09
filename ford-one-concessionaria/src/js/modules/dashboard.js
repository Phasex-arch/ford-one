// @ts-check
'use strict';
/* ============================================================
   dashboard.js
   initDashboard(), filterDashPeriod(), renderDashKpis(),
   openKpi(), kpiRow(), kpiModal()
============================================================ */

// ─── DASHBOARD ───────────────────────────────────────────────
function initDashboard(){
  const d=new Date();
  $('currentDate').textContent=d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^\w/,c=>c.toUpperCase());
  renderDashKpis('mes');
  setTimeout(initDashCharts,200);
}

function filterDashPeriod(){dashPeriod=$('dashPeriod').value;renderDashKpis(dashPeriod);setTimeout(initDashCharts,50);}

function renderDashKpis(period){
  const data=DASH_DATA[period];
  const kpis=[
    {ic:'ic-blue',  fa:'ph-lightning',       lbl:'Leads do Dia', val:formatNumber(data.leads),      delta:'+8%',   cls:'pos',key:'leads'       },
    {ic:'ic-teal',  fa:'ph-calendar-dots',   lbl:'Agendamentos', val:formatNumber(data.ag),         delta:'+3',    cls:'pos',key:'agendamentos'},
    {ic:'ic-green', fa:'ph-currency-dollar', lbl:'Receita',      val:formatCurrency(data.rec),      delta:'+12.4%',cls:'pos',key:'receita'     },
    {ic:'ic-orange',fa:'ph-trend-up',        lbl:'Conversão',    val:data.conv.toFixed(1)+'%',      delta:'+2.1pp',cls:'pos',key:'conversao'   },
    {ic:'ic-purple',fa:'ph-clock',           lbl:'SLA Médio',    val:data.sla.toFixed(1)+'h',       delta:'-0.4h', cls:'pos',key:'sla'         },
    {ic:'ic-gold',  fa:'ph-star',            lbl:'Avaliação',    val:data.nota.toFixed(1),          delta:'Top 5%',cls:'pos',key:'nota'        },
    {ic:'ic-navy',  fa:'ph-car',             lbl:'Estoque',      val:data.estq.toString(),          delta:'+7',    cls:'neu',key:'estoque'     },
  ];
  $('dashKpis').innerHTML=kpis.map(k=>`
    <div class="kpi-card" onclick="openKpi('${k.key}')">
      <div class="kpi-ic ${k.ic}"><i class="ph-bold ${k.fa}"></i></div>
      <div class="kpi-body"><span class="kpi-lbl">${k.lbl}</span><span class="kpi-val">${k.val}</span><span class="kpi-delta ${k.cls}">${k.delta}</span></div>
    </div>`).join('');
}

// ─── KPI MODAL ───────────────────────────────────────────────
function openKpi(key){
  const map={
    leads:        ()=>kpiModal('Leads do Dia',`<div style="display:flex;flex-direction:column;gap:8px">${[['Urgente','4','var(--red)'],['Alta','9','var(--orange)'],['Média','10','var(--ford-vivid)'],['Total hoje','23','var(--c-mid)']].map(([l,n,c])=>kpiRow(l,n,c)).join('')}</div>`),
    agendamentos: ()=>kpiModal('Agendamentos',`<div style="display:flex;flex-direction:column;gap:8px">${[['Confirmados','12','var(--green)'],['Pendentes','4','var(--orange)'],['Cancelados','2','var(--red)'],['Total','18','var(--c-mid)']].map(([l,n,c])=>kpiRow(l,n,c)).join('')}</div>`),
    receita:      ()=>kpiModal('Receita',`<div style="display:flex;flex-direction:column;gap:8px">${[['Meta mensal','R$ 1.200.000','var(--c-mid)'],['Previsto','R$ 1.248.000','var(--ford-vivid)'],['Confirmado','R$ 874.320','var(--green)'],['Ticket médio','R$ 48.600','var(--c-mid)']].map(([l,n,c])=>kpiRow(l,n,c)).join('')}</div>`),
    conversao:    ()=>kpiModal('Taxa de Conversão',`<div style="display:flex;flex-direction:column;gap:8px">${[['Walk-in','41%','var(--c-mid)'],['Online Lead','28%','var(--c-mid)'],['Indicação','52%','var(--green)'],['Retenção','67%','var(--ford-vivid)']].map(([l,n,c])=>kpiRow(l,n,c)).join('')}</div>`),
    sla:          ()=>kpiModal('SLA Médio',`<div style="display:flex;flex-direction:column;gap:8px">${[['Revisões rápidas','1.4h','var(--green)'],['Reparos gerais','2.8h','var(--orange)'],['Funilaria/Pintura','5.2h','var(--c-mid)'],['Média geral','2.3h','var(--ford-vivid)']].map(([l,n,c])=>kpiRow(l,n,c)).join('')}</div>`),
    nota:         ()=>kpiModal('Nota da Concessionária',`<div style="text-align:center;padding:10px 0 16px"><div style="font-size:56px;font-weight:900;color:var(--gold);line-height:1">4.8</div><div style="font-size:var(--fs3);color:var(--gold);margin-bottom:3px">★★★★★</div><div style="font-size:var(--fs1);color:var(--c-mid)">Top 5% — Ranking #3 regional</div></div><div style="display:flex;flex-direction:column;gap:7px">${[['NPS','72'],['Satisfação pós-serviço','4.9'],['Atendimento','4.7'],['Prazo','4.6']].map(([l,v])=>kpiRow(l,v,'var(--ford-vivid)')).join('')}</div>`),
    // FIX: "picapes" → "Picapes", "Elétricos/Hybrids" → "Elétricos/Híbridos"
    estoque:      ()=>kpiModal('Veículos em Estoque',`<div style="display:flex;flex-direction:column;gap:8px">${[['SUVs','48','var(--ford-vivid)'],['Picapes','61','var(--orange)'],['Sedans/Hatches','18','var(--purple)'],['Elétricos/Híbridos','15','var(--green)'],['Total','142','var(--c-mid)']].map(([l,n,c])=>kpiRow(l,n,c)).join('')}</div>`),
    perfil:       ()=>kpiModal('Meu Perfil',`<div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--c-bg);border-radius:var(--r);margin-bottom:14px"><div style="width:48px;height:48px;border-radius:50%;background:var(--ford-vivid);color:white;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center">RC</div><div><div style="font-weight:700;font-size:var(--fs3)">Ricardo Costa</div><div style="font-size:var(--fs1);color:var(--c-mid)">Gerente Comercial</div><div style="font-size:var(--fs0);color:var(--c-dim)">ricardo.costa@fordspcentro.com.br</div></div></div><div style="display:flex;flex-direction:column;gap:7px">${[['Concessionária','Ford SP Centro'],['Código Ford','SP-0142'],['Nível de acesso','Gerente — Total'],['Membro desde','Jan 2019']].map(([l,v])=>kpiRow(l,v,'var(--ford-vivid)')).join('')}</div>`),
    senha:        ()=>kpiModal('Alterar Senha',`<div class="m-form"><label>Senha atual<input type="password" placeholder="••••••••"></label><label>Nova senha<input type="password" placeholder="••••••••"></label><label>Confirmar nova senha<input type="password" placeholder="••••••••"></label><button class="btn-prim" onclick="closeModal('kpiModal');showToast('Senha alterada com sucesso!','success')" style="margin-top:4px">Salvar nova senha</button></div>`),
    nota_aval:    v=>kpiModal('Detalhes da Avaliação',v),
  };
  if(typeof key==='object'){map.nota_aval(key.content);}else if(map[key])map[key]();
}
function kpiRow(l,n,c){return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 11px;background:var(--c-bg);border-radius:var(--rsm);font-size:var(--fs1)"><span style="color:var(--c-mid)">${l}</span><strong style="color:${c}">${n}</strong></div>`;}
function kpiModal(title,body){$('kpiModalTitle').textContent=title;$('kpiModalBody').innerHTML=body;openModal('kpiModal');}

