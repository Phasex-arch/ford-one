/**
 * @file historico.screen.tsx
 * @module historico
 * @description Tela de Histórico — acessos do dia e detalhamento de clientes/veículos.
 *
 * Composição:
 * - Bloco "Clientes Acessados Hoje": chips clicáveis do accessLog
 * - Bloco "Veículos Acessados Hoje": chips clicáveis do accessLog
 * - Seção de detalhe do cliente selecionado:
 *   → Botão voltar para Clientes
 *   → ClienteSummary: 6 campos resumidos do cliente
 *   → VehiclesGrid: cards de veículos do cliente com thumbnail e dados
 * - VehicleModal: detalhe completo de um veículo selecionado
 * - ConfirmModal: confirmação de apagar histórico do dia
 *
 * Comunicação: escuta CustomEvent 'ford:selectCliente' via useHistorico.
 * O accessLog vem do AppContext (logAccess / logVehicleAccess).
 */

import React from 'react';
import { useHistorico } from './hooks/useHistorico';
import { VehicleModal } from './components/VehicleModal/VehicleModal';
import { useApp } from '../../shared/context/AppContext';
import { ConfirmModal } from '../../shared/components/Modal/ConfirmModal';
import { cap } from '../../shared/utils/formatters';
import { formatCurrency } from '../../shared/utils/formatters';
import type { ToastType } from '../../shared/hooks/useToast';
import { useState } from 'react';

interface Props { showToast: (m: string, t?: ToastType) => void; }

export const HistoricoScreen: React.FC<Props> = ({ showToast }) => {
  const { navigate, accessLog, clearHistory, logAccess, logVehicleAccess } = useApp();
  const { clientes, selectedId, selectedCliente, veiculos, openVehicleModal, selectedVeiculo, vehicleModalOpen, setVehicleModalOpen, voltar } = useHistorico();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const goHistorico = (cliente: { id: string; nome: string; ini: string }) => {
    logAccess(cliente);
    window.dispatchEvent(new CustomEvent('ford:selectCliente', { detail: cliente.id }));
  };

  const handleOpenVehicle = (cid: string, vid: string) => {
    const c = clientes.find(x => x.id === cid);
    const v = veiculos.find(x => x.id === vid);
    if (c && v) {
      logVehicleAccess(vid, `${v.modelo} ${v.versao.split(' ')[0]}`, c.nome.split(' ').slice(0, 2).join(' '), cid);
    }
    openVehicleModal(cid, vid);
  };

  return (
    <section className="module active" id="mod-historico">
      <div className="mod-header">
        <div><h1>Histórico</h1><p className="mod-sub">Acessos do dia e histórico completo de veículos</p></div>
        <div className="mod-actions">
          <button className="btn-danger-out" onClick={() => setConfirmOpen(true)}>
            <i className="ph-bold ph-trash"/> Apagar Histórico
          </button>
        </div>
      </div>

      <div className="hist-block">
        <div className="hist-block-head">
          <div className="hist-icon"><i className="ph-bold ph-users"/></div>
          <div><h3>Clientes Acessados Hoje</h3><p>Perfis consultados durante o dia</p></div>
        </div>
        <div className="chips-row" id="histClientChips">
          {accessLog.clientes.length === 0
            ? <span className="chip-empty">Nenhum cliente acessado hoje.</span>
            : accessLog.clientes.map(a => (
              <div key={a.id} className="chip" onClick={() => goHistorico(a)} style={{cursor:'pointer'}}>
                <div className="chip-av">{a.ini}</div>
                <span>{a.nome}</span>
                <span className="chip-t">{a.hora}</span>
              </div>
            ))
          }
        </div>
      </div>

      <div className="hist-block">
        <div className="hist-block-head">
          <div className="hist-icon"><i className="ph-bold ph-car"/></div>
          <div><h3>Veículos Acessados Hoje</h3><p>Fichas de veículos consultadas durante o dia</p></div>
        </div>
        <div className="chips-row" id="histVehicleChips">
          {accessLog.veiculos.length === 0
            ? <span className="chip-empty">Nenhum veículo acessado hoje.</span>
            : accessLog.veiculos.map(a => (
              <div key={a.id} className="chip" onClick={() => openVehicleModal(a.cid, a.id)} style={{cursor:'pointer'}}>
                <i className="ph-bold ph-car" style={{fontSize:12,color:'var(--ford-vivid)',flexShrink:0}}/>
                <span>{a.modelo}</span>
                <span style={{fontSize:'var(--fs0)',color:'var(--c-dim)'}}>{a.cli}</span>
                <span className="chip-t">{a.hora}</span>
              </div>
            ))
          }
        </div>
      </div>

      {selectedId && selectedCliente && (
        <div id="histClientDetail">
          <div id="histBackBar" style={{marginBottom:16}}>
            <button className="btn-sec" onClick={() => { voltar(); navigate('clientes'); }} style={{gap:6}}>
              <i className="ph-bold ph-arrow-left"/> Voltar para Clientes
            </button>
          </div>
          <div className="client-summary" id="clientSummary">
            <div className="csb-item"><div className="csb-lbl">Cliente</div><div className="csb-val" style={{fontSize:'var(--fs3)'}}>{selectedCliente.nome}</div></div>
            <div className="csb-item"><div className="csb-lbl">Status</div><div className="csb-val"><span className={`pill ${selectedCliente.status}`}>{cap(selectedCliente.status)}</span></div></div>
            <div className="csb-item"><div className="csb-lbl">Segmento</div><div className="csb-val">{selectedCliente.seg}</div></div>
            <div className="csb-item"><div className="csb-lbl">Veículos</div><div className="csb-val">{selectedCliente.v}</div></div>
            <div className="csb-item"><div className="csb-lbl">LTV Total</div><div className="csb-val" style={{color:'var(--green)'}}>{formatCurrency(selectedCliente.ltv)}</div></div>
            <div className="csb-item"><div className="csb-lbl">Telefone</div><div className="csb-val" style={{fontSize:'var(--fs3)'}}>{selectedCliente.tel}</div></div>
          </div>
          <div className="vehicles-grid" id="vehiclesGrid">
            {veiculos.length === 0
              ? <p style={{color:'var(--c-dim)',fontSize:'var(--fs1)',padding:'14px 0'}}>Nenhum veículo registrado.</p>
              : veiculos.map(v => (
                <div key={v.id} className={`vh-card${v.atual ? ' atual' : ''}`} onClick={() => handleOpenVehicle(selectedId, v.id)} style={{cursor:'pointer'}}>
                  {v.atual && <div className="vh-banner">Veículo Atual</div>}
                  <div className="vh-img">
                    {v.img
                      ? <img src={v.img} alt={v.modelo} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      : <div className="vh-ph"><i className="ph-bold ph-car" style={{fontSize:38}}/><span>{v.modelo}</span></div>}
                  </div>
                  <div className="vh-body">
                    <div className="vh-model">{v.modelo}</div>
                    <div className="vh-ver">{v.versao}</div>
                    <div className="vh-meta">
                      <div><div className="vm-lbl">Ano</div><div className="vm-val">{v.ano}</div></div>
                      <div><div className="vm-lbl">KM</div><div className="vm-val">{v.km} km</div></div>
                      <div><div className="vm-lbl">Aquisição</div><div className="vm-val">{v.aq}</div></div>
                      <div><div className="vm-lbl">Status</div><div className="vm-val">
                        <span className={`pill ${v.status === 'ativo' ? 'ativo-v' : v.status}`}>{cap(v.status)}</span>
                      </div></div>
                    </div>
                  </div>
                  <div className="vh-foot">
                    <span className="vh-foot-txt">Último: <strong>{v.ult}</strong></span>
                    <button className="btn-tbl" onClick={e => { e.stopPropagation(); handleOpenVehicle(selectedId, v.id); }}>Ver detalhes</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      <VehicleModal
        isOpen={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        veiculo={selectedVeiculo}
        cliente={selectedCliente}
      />

      <ConfirmModal
        id="confirmModal"
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { clearHistory(); setConfirmOpen(false); showToast('Histórico de acessos apagado.', 'success'); }}
        title="Apagar Histórico"
        message="Deseja apagar todo o histórico de acessos de hoje? Esta ação não pode ser desfeita."
        confirmLabel="Apagar tudo"
      />
    </section>
  );
};
