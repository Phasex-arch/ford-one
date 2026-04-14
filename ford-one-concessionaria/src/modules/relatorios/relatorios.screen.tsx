/**
 * @file relatorios.screen.tsx
 * @module relatorios
 * @description Tela de Relatórios — catálogo de exportações gerenciais.
 *
 * Composição:
 * - Header com botão "Exportar Todos"
 * - Grid de RelCards: 10 relatórios disponíveis (Vendas, Clientes, DRE,
 *   Pipeline, NPS, Serviços, Giro de Estoque, Performance, Financiamentos, Metas)
 *   Cada card exibe: ícone colorido, título, descrição, data da última geração
 *   e botão de exportação individual
 * - Modal de exportação: 3 formatos disponíveis (PDF, Excel/CSV, Online)
 *   — ao clicar, dispara toast com nome do relatório e formato selecionado
 *
 * Props:
 * - showToast → feedback de exportação
 */

import React, { useState } from 'react';
import type { ToastType } from '../../shared/hooks/useToast';

interface Props { showToast:(m:string,t?:ToastType)=>void; }

const RELS = [
  {icon:'ic-blue',  ph:'ph-chart-bar',    titulo:'Relatório de Vendas',       desc:'Resumo mensal de vendas, ticket médio, metas e comparativo.',      ult:'21/04/2026'},
  {icon:'ic-teal',  ph:'ph-users',        titulo:'Clientes',                  desc:'Base completa de clientes, LTV, segmentos e histórico.',             ult:'22/04/2026'},
  {icon:'ic-green', ph:'ph-money',        titulo:'DRE Gerencial',             desc:'Demonstração de resultado com receita, custo e margem.',             ult:'01/04/2026'},
  {icon:'ic-orange',ph:'ph-lightning',    titulo:'Pipeline de Leads',         desc:'Evolução dos leads por status, canal e consultor.',                  ult:'22/04/2026'},
  {icon:'ic-purple',ph:'ph-star',         titulo:'NPS e Satisfação',          desc:'Análise de avaliações, NPS por consultor e período.',               ult:'15/04/2026'},
  {icon:'ic-navy',  ph:'ph-wrench',       titulo:'Relatório de Serviços',     desc:'Ordens de serviço, SLA, técnicos e faturamento.',                   ult:'20/04/2026'},
  {icon:'ic-gold',  ph:'ph-car',          titulo:'Giro de Estoque',           desc:'Tempo médio de permanência, modelos parados e reposição.',           ult:'18/04/2026'},
  {icon:'ic-navy',  ph:'ph-ranking',      titulo:'Performance de Consultores',desc:'Ranking individual, metas, conversão e receita.',                   ult:'01/04/2026'},
  {icon:'ic-green', ph:'ph-credit-card',  titulo:'Carteira de Financiamentos',desc:'Contratos ativos, taxas médias, parcelas e inadimplência.',         ult:'10/04/2026'},
  {icon:'ic-gold',  ph:'ph-target',       titulo:'Metas e Performance',       desc:'Acompanhamento de metas mensais, anuais e ranking.',                ult:'21/04/2026'},
];

export const RelatoriosScreen: React.FC<Props> = ({ showToast }) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTitle, setExportTitle] = useState('');

  const openExport = (titulo: string) => { setExportTitle(titulo); setExportOpen(true); };

  return (
    <section className="module active" id="mod-relatorios">
      <div className="mod-header">
        <div><h1>Relatórios</h1><p className="mod-sub">Exportações gerenciais</p></div>
        <div className="mod-actions"><button className="btn-prim" onClick={()=>openExport('Todos')}><i className="ph-bold ph-arrow-square-out"/> Exportar Todos</button></div>
      </div>
      <div style={{marginBottom:18}}><p style={{fontSize:'var(--fs1)',color:'var(--c-mid)'}}>Selecione um relatório para exportar.</p></div>
      <div className="rel-grid" id="relatoriosContent">
        {RELS.map(r=>(
          <div key={r.titulo} className="rel-card">
            <div className={`kpi-ic ${r.icon}`} style={{width:40,height:40,flexShrink:0}}><i className={`ph-bold ${r.ph}`} style={{fontSize:18}}/></div>
            <div style={{flex:1,minWidth:0}}><div className="rel-title">{r.titulo}</div><div className="rel-desc">{r.desc}</div></div>
            <div className="rel-footer">
              <span className="rel-last">Ult.: {r.ult}</span>
              <button className="rel-btn" onClick={()=>openExport(r.titulo)}><i className="ph-bold ph-arrow-square-out" style={{fontSize:11,marginRight:4}}/>Exportar</button>
            </div>
          </div>
        ))}
      </div>

      {exportOpen && (
        <div className="modal-ov open" onClick={e=>{if(e.target===e.currentTarget)setExportOpen(false);}}>
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={()=>setExportOpen(false)}><i className="ph-bold ph-x"/></button>
            <div style={{padding:24}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18,paddingBottom:14,borderBottom:'1px solid var(--c-border)'}}>
                <div className="kpi-ic ic-blue" style={{width:40,height:40,flexShrink:0}}><i className="ph-bold ph-file-text" style={{fontSize:18}}/></div>
                <div><div style={{fontSize:16,fontWeight:700,color:'var(--c-text)'}}>Exportar — {exportTitle}</div><div style={{fontSize:'var(--fs0)',color:'var(--c-mid)'}}>Selecione o formato de exportação</div></div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[{icon:'ph-file-pdf',bg:'var(--red-bg)',c:'var(--red)',lbl:'PDF',sub:'Documento formatado para impressão'},
                  {icon:'ph-microsoft-excel-logo',bg:'var(--green-bg)',c:'var(--green)',lbl:'Excel / CSV',sub:'Dados em planilha editável'},
                  {icon:'ph-eye',bg:'var(--ford-light)',c:'var(--ford-vivid)',lbl:'Visualizar online',sub:'Abrir no navegador'}
                ].map(opt=>(
                  <button key={opt.lbl} className="export-opt-btn" onClick={()=>{setExportOpen(false);showToast(`Exportando ${exportTitle} em ${opt.lbl}...`,'info');}}>
                    <div className="export-opt-icon" style={{background:opt.bg}}><i className={`ph-bold ${opt.icon}`} style={{color:opt.c}}/></div>
                    <div><div style={{fontWeight:600,fontSize:'var(--fs2)'}}>{opt.lbl}</div><div style={{fontSize:'var(--fs0)',color:'var(--c-mid)'}}>{opt.sub}</div></div>
                    <i className="ph-bold ph-arrow-right" style={{marginLeft:'auto',color:'var(--c-dim)'}}/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};