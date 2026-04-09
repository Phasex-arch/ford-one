// @ts-check
'use strict';
/* ============================================================
   relatorios.js
   exportarRelatorio(), abrirPDF(), renderRelatorios()
============================================================ */

// ─── RELATÓRIOS ──────────────────────────────────────────────
function exportarRelatorio(source){
  const titles={clientes:'Clientes',leads:'Leads Inteligentes',metas:'Metas',dashboard:'Dashboard',vendas:'Vendas',servicos:'Serviços',estoque:'Estoque',financiamentos:'Financiamentos'};
  navigate('relatorios',document.querySelector('[data-module="relatorios"]'));
  requestAnimationFrame(()=>{const t=document.getElementById('exportModalTitle'),s=document.getElementById('exportModalSubtitle');if(t)t.textContent='Exportar — '+(titles[source]||source);if(s)s.textContent='Selecione o formato de exportação';openModal('exportModal');});
}
function abrirPDF(){closeModal('exportModal');window.open('assets/documentation/Ford One.pdf','_blank');}

function renderRelatorios(){
  const rc=$('relatoriosContent');if(!rc)return;
  const rels=[
    {icon:'ic-blue',  ph:'ph-chart-bar',  titulo:'Relatório de Vendas',        desc:'Resumo mensal de vendas, ticket médio, metas e comparativo com período anterior.',     ult:'21/04/2025',src:'vendas'        },
    {icon:'ic-teal',  ph:'ph-users',      titulo:'Clientes',                   desc:'Base completa de clientes, LTV, segmentos, status e histórico de atendimento.',        ult:'22/04/2025',src:'clientes'      },
    {icon:'ic-green', ph:'ph-money',      titulo:'DRE Gerencial',              desc:'Demonstração de resultado simplificada com receita, custo e margem operacional.',      ult:'01/04/2025',src:'dre'           },
    {icon:'ic-orange',ph:'ph-lightning',  titulo:'Pipeline de Leads',          desc:'Evolução dos leads por status, canal e consultor responsável.',                        ult:'22/04/2025',src:'leads'         },
    {icon:'ic-purple',ph:'ph-star',       titulo:'NPS e Satisfação',           desc:'Análise de avaliações, NPS por consultor e período, e comparativo de estrelas.',       ult:'15/04/2025',src:'nps'           },
    {icon:'ic-navy',  ph:'ph-wrench',     titulo:'Relatório de Serviços',      desc:'Ordens de serviço, SLA, técnicos e faturamento da área de pós-venda.',                ult:'20/04/2025',src:'servicos'      },
    {icon:'ic-gold',  ph:'ph-car',        titulo:'Giro de Estoque',            desc:'Tempo médio de permanência, modelos parados e projeção de reposição.',                 ult:'18/04/2025',src:'estoque'       },
    {icon:'ic-navy',  ph:'ph-ranking',    titulo:'Performance de Consultores', desc:'Ranking individual, metas, conversão e receita gerada por consultor.',                 ult:'01/04/2025',src:'consultores'   },
    {icon:'ic-green', ph:'ph-credit-card',titulo:'Carteira de Financiamentos', desc:'Contratos ativos, taxas médias, parcelas e inadimplência do período.',                 ult:'10/04/2025',src:'financiamentos'},
    {icon:'ic-gold',  ph:'ph-target',     titulo:'Metas e Performance',        desc:'Acompanhamento de metas mensais, anuais, ranking e desvios por consultor.',             ult:'21/04/2025',src:'metas'         },
  ];
  rc.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px">
    <p style="font-size:var(--fs1);color:var(--c-mid)">Selecione um relatório para exportar.</p>
    <button class="btn-prim" onclick="abrirPDF()"><i class="ph-bold ph-arrow-square-out"></i> Exportar Todos</button>
  </div>
  <div class="rel-grid">${rels.map(r=>`
    <div class="rel-card">
      <div class="kpi-ic ${r.icon}" style="width:40px;height:40px;flex-shrink:0"><i class="ph-bold ${r.ph}" style="font-size:18px"></i></div>
      <div style="flex:1;min-width:0"><div class="rel-title">${r.titulo}</div><div class="rel-desc">${r.desc}</div></div>
      <div class="rel-footer"><span class="rel-last">Ult.: ${r.ult}</span>
        <button class="rel-btn" onclick="event.stopPropagation();_exportSource='${r.src}';openModal('exportModal')"><i class="ph-bold ph-arrow-square-out" style="font-size:11px;margin-right:4px"></i>Exportar</button>
      </div>
    </div>`).join('')}</div>`;
}

