/**
 * @file VehicleModal.tsx
 * @module historico
 * @description Modal de detalhes completos de um veículo.
 * Exibe todas as informações do veículo selecionado no histórico do cliente.
 *
 * Seções exibidas:
 * 1. Hero: imagem (ou placeholder SVG) + nome, versão, ano, cor
 * 2. Cliente: dados resumidos do proprietário (quando disponível)
 * 3. Dados Gerais: modelo, ano, cor, KM, aquisição, status
 * 4. Dados Financeiros: custo acumulado, ticket médio, valor estimado
 * 5. Insights Comerciais: tags coloridas geradas por IA
 * 6. Linha do Tempo: histórico de serviços e aquisições em ordem cronológica
 *
 * Props:
 * - isOpen    → visibilidade do modal
 * - onClose   → fechar modal
 * - veiculo   → objeto Veiculo ou undefined (modal não renderiza se undefined)
 * - cliente   → objeto Cliente ou undefined (seção Cliente omitida se undefined)
 */

import React from 'react';
import type { Veiculo, Cliente } from '../../../../types/global.types';
import { formatCurrency, cap } from '../../../../shared/utils/formatters';

interface Props { isOpen: boolean; onClose: () => void; veiculo: Veiculo | undefined; cliente: Cliente | undefined; }

export const VehicleModal: React.FC<Props> = ({ isOpen, onClose, veiculo: v, cliente: c }) => {
  if (!v) return null;
  const statusCls = v.status === 'ativo' ? 'ativo-v' : v.status;
  return (
    <div className={`modal-ov${isOpen ? ' open' : ''}`} id="vehicleModal"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box modal-lg">
        <button className="modal-x" onClick={onClose}><i className="ph-bold ph-x"/></button>
        <div className="m-hero">
          {v.img ? <img src={v.img} alt={v.modelo} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            : <div className="m-hero-ph"><i className="ph-bold ph-car" style={{fontSize:52,color:'rgba(255,255,255,.25)'}}/></div>}
          <div className="m-hero-ov"/>
          <div className="m-hero-info"><h2>{v.modelo}</h2><p>{v.versao} · {v.ano} · {v.cor}</p></div>
        </div>
        <div className="m-body">
          {c && <div className="m-sec"><div className="m-sec-title">Cliente</div>
            <div className="m-grid">
              <div><div className="mf-lbl">Nome</div><div className="mf-val">{c.nome}</div></div>
              <div><div className="mf-lbl">Telefone</div><div className="mf-val">{c.tel}</div></div>
              <div><div className="mf-lbl">Segmento</div><div className="mf-val">{c.seg}</div></div>
              <div><div className="mf-lbl">LTV Total</div><div className="mf-val" style={{color:'var(--green)'}}>{formatCurrency(c.ltv)}</div></div>
            </div></div>}
          <div className="m-sec"><div className="m-sec-title">Dados Gerais</div>
            <div className="m-grid">
              <div><div className="mf-lbl">Modelo</div><div className="mf-val">{v.modelo} {v.versao}</div></div>
              <div><div className="mf-lbl">Ano</div><div className="mf-val">{v.ano}</div></div>
              <div><div className="mf-lbl">Cor</div><div className="mf-val">{v.cor}</div></div>
              <div><div className="mf-lbl">KM</div><div className="mf-val">{v.km} km</div></div>
              <div><div className="mf-lbl">Aquisição</div><div className="mf-val">{v.aq}</div></div>
              <div><div className="mf-lbl">Status</div><div className="mf-val"><span className={`pill ${statusCls}`}>{cap(v.status)}</span></div></div>
            </div></div>
          <div className="m-sec"><div className="m-sec-title">Dados Financeiros</div>
            <div className="m-grid three">
              <div><div className="mf-lbl">Custo Acumulado</div><div className="mf-val">{v.fin.custo}</div></div>
              <div><div className="mf-lbl">Ticket Médio</div><div className="mf-val">{v.fin.ticket}</div></div>
              <div><div className="mf-lbl">Valor Estimado</div><div className="mf-val" style={{color:'var(--ford-vivid)'}}>{v.fin.est}</div></div>
            </div></div>
          <div className="m-sec"><div className="m-sec-title">Insights Comerciais</div>
            {v.ins.map((s,i)=><span key={i} className={`itag ${['blue','green','orange'][i%3]}`}>{s}</span>)}</div>
          <div className="m-sec"><div className="m-sec-title">Linha do Tempo</div>
            <div className="timeline">
              {v.hist.map((h,i)=><div key={i} className="tl-item">
                <div className="tl-date">{h.d}</div><div className="tl-ev">{h.ev}</div>
                <div className="tl-det">{h.det} · <strong>{h.val}</strong></div>
              </div>)}
            </div></div>
        </div>
      </div>
    </div>
  );
};
