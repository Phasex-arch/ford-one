/**
 * @file relatorios.screen.tsx
 * @module relatorios
 * @description Tela de Relatórios — exportação CSV real dos dados do sistema.
 *
 * Composição:
 * - Header com botão "Exportar Todos" (dispara os 6 downloads em sequência)
 * - Grid de RelCards: só os 6 relatórios com dado real e completo hoje
 *   (Clientes, Estoque, Leads, Financiamentos, Metas, Serviços) — o catálogo
 *   original tinha 10, mas DRE Gerencial, NPS e Satisfação, Giro de Estoque
 *   e Performance de Consultores não têm fonte de dado real o bastante pra
 *   virar relatório exportável ainda, então saíram da lista em vez de ficar
 *   um botão de exportar que não teria o que exportar de verdade
 * - Cada card mostra a data do último export real (guardado no navegador,
 *   local a cada usuário — não existe um registro central de exportações)
 *
 * O antigo modal de formato (PDF / Excel / Visualizar online) também saiu:
 * só CSV foi implementado de verdade, então não fazia sentido oferecer
 * opções que não geram nada.
 *
 * Props:
 * - showToast → feedback de exportação
 */

import React, { useState } from 'react';
import type { ToastType } from '../../shared/hooks/useToast';
import { exportarRelatorio, getUltimoExport, type RelatorioKey } from './services/relatorios.service';
import { friendlyApiMessage } from '../../shared/api/client';

interface Props { showToast:(m:string,t?:ToastType)=>void; }

const RELS: { key: RelatorioKey; icon:string; ph:string; titulo:string; desc:string }[] = [
  { key:'clientes',       icon:'ic-teal',   ph:'ph-users',        titulo:'Clientes',                  desc:'Base completa de clientes, LTV, segmentos e status.' },
  { key:'estoque',        icon:'ic-gold',   ph:'ph-car',          titulo:'Estoque',                   desc:'Veículos em estoque, condição, preço e quantidade.' },
  { key:'leads',          icon:'ic-orange', ph:'ph-lightning',    titulo:'Pipeline de Leads',          desc:'Leads por urgência, veículo de interesse e valor estimado.' },
  { key:'financiamentos', icon:'ic-green',  ph:'ph-credit-card',  titulo:'Carteira de Financiamentos', desc:'Contratos, status, taxas e parcelas.' },
  { key:'metas',          icon:'ic-blue',   ph:'ph-target',       titulo:'Metas',                     desc:'Metas cadastradas, realizado, alvo e responsável.' },
  { key:'servicos',       icon:'ic-navy',   ph:'ph-wrench',       titulo:'Ordens de Serviço',          desc:'Ordens de serviço, técnico, prioridade e valor.' },
];

const fmtUltimo = (iso: string | null): string => {
  if (!iso) return 'Nunca exportado';
  return 'Últ.: ' + new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
};

export const RelatoriosScreen: React.FC<Props> = ({ showToast }) => {
  const [exportando, setExportando] = useState<RelatorioKey | 'todos' | null>(null);
  const [, forceUpdate] = useState(0);

  const exportar = async (key: RelatorioKey) => {
    setExportando(key);
    try {
      await exportarRelatorio(key);
      showToast(`${RELS.find(r=>r.key===key)?.titulo} exportado!`, 'success');
      forceUpdate(n => n+1);
    } catch (e) {
      showToast(friendlyApiMessage(e), 'warning');
    } finally {
      setExportando(null);
    }
  };

  const exportarTodos = async () => {
    setExportando('todos');
    try {
      for (const r of RELS) {
        await exportarRelatorio(r.key);
        await new Promise(res => setTimeout(res, 250));
      }
      showToast('Todos os relatórios exportados!', 'success');
      forceUpdate(n => n+1);
    } catch (e) {
      showToast(friendlyApiMessage(e), 'warning');
    } finally {
      setExportando(null);
    }
  };

  return (
    <section className="module active" id="mod-relatorios">
      <div className="mod-header">
        <div><h1>Relatórios</h1><p className="mod-sub">Exportações em CSV</p></div>
        <div className="mod-actions">
          <button className="btn-prim" disabled={exportando!==null} onClick={exportarTodos}>
            <i className="ph-bold ph-arrow-square-out"/> {exportando==='todos' ? 'Exportando...' : 'Exportar Todos'}
          </button>
        </div>
      </div>
      <div style={{marginBottom:18}}><p style={{fontSize:'var(--fs1)',color:'var(--c-mid)'}}>Selecione um relatório para exportar em CSV.</p></div>
      <div className="rel-grid" id="relatoriosContent">
        {RELS.map(r=>(
          <div key={r.key} className="rel-card">
            <div className={`kpi-ic ${r.icon}`} style={{width:40,height:40,flexShrink:0}}><i className={`ph-bold ${r.ph}`} style={{fontSize:18}}/></div>
            <div style={{flex:1,minWidth:0}}><div className="rel-title">{r.titulo}</div><div className="rel-desc">{r.desc}</div></div>
            <div className="rel-footer">
              <span className="rel-last">{fmtUltimo(getUltimoExport(r.key))}</span>
              <button className="rel-btn" disabled={exportando!==null} onClick={()=>exportar(r.key)}>
                <i className="ph-bold ph-arrow-square-out" style={{fontSize:11,marginRight:4}}/>
                {exportando===r.key ? 'Exportando...' : 'Exportar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
