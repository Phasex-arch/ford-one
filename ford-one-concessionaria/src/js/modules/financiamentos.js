// @ts-check
'use strict';
/* ============================================================
   financiamentos.js
   renderFinanciamentos(), openContratoModal(),
   calcFin(), saveFinSim()
============================================================ */

// ─── FINANCIAMENTOS ──────────────────────────────────────────
function renderFinanciamentos(){
  const fc=$('finContent');if(!fc)return;
  const statusMap={
    aprovado: {bg:'var(--green-bg)',  c:'var(--green)',     lbl:'Aprovado'  },
    analise:  {bg:'var(--orange-bg)', c:'var(--gold)',      lbl:'Em Análise'},
    pendente: {bg:'var(--ford-light)',c:'var(--ford-vivid)',lbl:'Pendente'  },
    reprovado:{bg:'var(--red-bg)',    c:'var(--red)',       lbl:'Reprovado' },
  };
  const totalCarteira=FINANCIAMENTOS.filter(f=>f.status==='aprovado').reduce((s,f)=>s+f.valor,0);
  const aprovados=FINANCIAMENTOS.filter(f=>f.status==='aprovado').length;
  const kpisHtml=`<div class="kpi-grid" style="margin-bottom:18px">${[
    {lbl:'Carteira Total',  val:formatCurrency(totalCarteira),                                              ic:'ic-green', ph:'ph-money'    },
    {lbl:'Contratos Ativos',val:String(aprovados),                                                          ic:'ic-blue',  ph:'ph-file-text'},
    {lbl:'Em Análise',      val:String(FINANCIAMENTOS.filter(f=>f.status==='analise').length),              ic:'ic-orange',ph:'ph-clock'    },
    {lbl:'Taxa Média',      val:'1.54% a.m.',                                                               ic:'ic-purple',ph:'ph-percent'  },
  ].map(k=>`<div class="kpi-card"><div class="kpi-ic ${k.ic}"><i class="ph-bold ${k.ph}" style="font-size:17px"></i></div><div class="kpi-body"><span class="kpi-lbl">${k.lbl}</span><span class="kpi-val sm">${k.val}</span></div></div>`).join('')}</div>`;

  // FIX: "Ver contrato" now opens a real modal
  const cardsHtml=FINANCIAMENTOS.map(f=>{
    const st=statusMap[f.status]||statusMap.pendente;
    return `<div class="fin-card">
      <div class="fin-card-head">
        <div><div class="fin-client">${f.cli}</div><div class="fin-veiculo">${f.veiculo}</div></div>
        <div class="fin-status-tag ${f.status}" style="background:${st.bg};color:${st.c}">${st.lbl}</div>
      </div>
      <div class="fin-values">
        <div><div class="fin-val-lbl">Valor</div><div class="fin-val-num highlight">${formatCurrency(f.valor)}</div></div>
        <div><div class="fin-val-lbl">Entrada</div><div class="fin-val-num">${formatCurrency(f.entrada)}</div></div>
        <div><div class="fin-val-lbl">Parcela / Prazo</div><div class="fin-val-num">${formatCurrency(f.parcela)}<span style="font-size:10px;font-weight:500;color:var(--c-dim);margin-left:3px">${f.prazo}x</span></div></div>
      </div>
      <div class="fin-footer">
        <span>Taxa: ${f.taxa}% a.m. · ${f.data}</span>
        <button class="btn-tbl" onclick="openContratoModal('${f.id}')">Ver contrato</button>
      </div>
    </div>`;
  }).join('');

  fc.innerHTML=`${kpisHtml}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <h3 class="sec-title" style="margin-bottom:0">Contratos e Simulações</h3>
      <button class="btn-prim" onclick="openModal('finSimModal');calcFin()">+ Nova Simulação</button>
    </div>
    <div class="fin-grid">${cardsHtml}</div>`;
}

// FIX: real contract modal
function openContratoModal(id){
  const f=FINANCIAMENTOS.find(x=>x.id===id);if(!f)return;
  const statusMap={aprovado:'Aprovado',analise:'Em Análise',pendente:'Pendente',reprovado:'Reprovado'};
  const financiado=f.valor-f.entrada;
  const totalPago=f.entrada+(f.parcela*f.prazo);
  kpiModal('Contrato '+f.id,`
    <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px">
      ${[
        ['Cliente',          f.cli                            ],
        ['Veículo',          f.veiculo                        ],
        ['Status',           statusMap[f.status]||f.status    ],
        ['Valor do veículo', formatCurrency(f.valor)          ],
        ['Entrada',          formatCurrency(f.entrada)        ],
        ['Valor financiado', formatCurrency(financiado)       ],
        ['Prazo',            f.prazo+'x de '+formatCurrency(f.parcela)],
        ['Taxa mensal',      f.taxa+'% a.m.'                  ],
        ['Total pago',       formatCurrency(Math.round(totalPago))],
        ['Data',             f.data                           ],
      ].map(([l,v])=>kpiRow(l,v,'var(--ford-vivid)')).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-prim" onclick="closeModal('kpiModal');showToast('Contrato enviado por e-mail.','success')" style="flex:1">Enviar por e-mail</button>
    </div>`);
}

function calcFin(){
  const valor=parseFloat($('finValor')?.value||0),entrada=parseFloat($('finEntrada')?.value||0);
  const prazo=parseInt($('finPrazo')?.value||48),taxa=parseFloat($('finTaxa')?.value||1.49)/100;
  const res=$('finResult');if(!res)return;
  if(!valor||valor<=entrada){res.innerHTML='<span style="color:var(--red)">Valor inválido.</span>';return;}
  const financiado=valor-entrada,parcela=financiado*(taxa*Math.pow(1+taxa,prazo))/(Math.pow(1+taxa,prazo)-1);
  const totalPago=entrada+(parcela*prazo),juros=totalPago-valor;
  res.innerHTML=`<strong>${formatCurrency(Math.round(parcela))}/mês</strong>${[
    ['Valor financiado',  formatCurrency(financiado)],
    ['Total de parcelas', prazo+'x de '+formatCurrency(Math.round(parcela))],
    ['Total pago',        formatCurrency(Math.round(totalPago))],
    ['Total em juros',    formatCurrency(Math.round(juros))],
  ].map(([l,v])=>`<div style="display:flex;justify-content:space-between;font-size:var(--fs1);margin-top:6px"><span style="color:var(--c-mid)">${l}</span><strong>${v}</strong></div>`).join('')}`;
}

function saveFinSim(){
  const cli=$('finCli')?.value.trim()||'(sem nome)',vei=$('finVei')?.value.trim()||'(sem veículo)';
  const valor=parseFloat($('finValor')?.value||0),entrada=parseFloat($('finEntrada')?.value||0);
  const prazo=parseInt($('finPrazo')?.value||48),taxa=parseFloat($('finTaxa')?.value||1.49);
  const financiado=valor-entrada,t=taxa/100;
  const parcela=Math.round(financiado*(t*Math.pow(1+t,prazo))/(Math.pow(1+t,prazo)-1));
  FINANCIAMENTOS.unshift({id:'F'+Date.now(),cli,ini:cli.split(' ').map(n=>n[0]).slice(0,2).join(''),veiculo:vei,valor,entrada,prazo,taxa,parcela,status:'pendente',data:'Agora'});
  closeModal('finSimModal');if(curMod==='financiamentos')renderFinanciamentos();
  showToast(`Simulação salva: ${cli} · ${formatCurrency(parcela)}/mês`,'success');
}

