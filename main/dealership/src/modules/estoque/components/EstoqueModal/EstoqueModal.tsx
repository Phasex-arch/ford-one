/**
 * @file EstoqueModal.tsx
 * @module estoque
 * @description Modal de detalhes de um veículo do estoque.
 *
 * Seções:
 * 1. Hero: imagem ou placeholder SVG + modelo, versão, ano, cor
 * 2. Especificações: motorização, transmissão, condição, status, KM, unidades
 * 3. Opcionais: tags verdes com cada opcional incluído
 * 4. Precificação: valor sugerido + botões "Simular financiamento" e "Reservar"
 * 5. Ações administrativas: Editar (ADMIN/GERENTE) e Excluir (ADMIN)
 *
 * O botão "Simular financiamento" fecha este modal e chama onFinSim(id)
 * para abrir o simulador de financiamento com o veículo pré-selecionado.
 *
 * Props:
 * - isOpen      → visibilidade
 * - onClose     → fechar modal
 * - item        → objeto Estoque ou undefined
 * - showToast   → para feedback de reserva
 * - onFinSim    → callback para abrir simulador de financiamento
 * - onEditar    → abre o modal de edição para este item (undefined = oculta o botão)
 * - onExcluir   → abre a confirmação de exclusão para este item (undefined = oculta o botão)
 * - canEdit     → se o usuário logado pode editar (ADMIN/GERENTE)
 * - canDelete   → se o usuário logado pode excluir (ADMIN)
 */

import React from 'react';
import type { Estoque } from '../../../../types/global.types';
import { formatCurrency, cap } from '../../../../shared/utils/formatters';
import type { ToastType } from '../../../../shared/hooks/useToast';

interface Props {
  isOpen:boolean; onClose:()=>void; item:Estoque|undefined; showToast:(m:string,t?:ToastType)=>void; onFinSim:(id:string)=>void;
  onEditar?: (item: Estoque) => void; onExcluir?: (item: Estoque) => void; canEdit?: boolean; canDelete?: boolean;
}

export const EstoqueModal: React.FC<Props> = ({ isOpen, onClose, item:e, showToast, onFinSim, onEditar, onExcluir, canEdit, canDelete }) => {
  if(!e) return null;
  return (
    <div className={`modal-ov${isOpen?' open':''}`} id="estoqueModal" onClick={ev=>{if(ev.target===ev.currentTarget)onClose();}}>
      <div className="modal-box">
        <button className="modal-x" onClick={onClose}><i className="ph-bold ph-x"/></button>
        <div className="m-hero">
          {e.img ? <img src={e.img} alt={e.modelo}/> : <div className="m-hero-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:52,height:52,color:'rgba(255,255,255,.25)'}}><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>}
          <div className="m-hero-ov"/><div className="m-hero-info"><h2>{e.modelo}</h2><p>{e.versao} · {e.ano} · {e.cor}</p></div>
        </div>
        <div className="m-body">
          <div className="m-sec"><div className="m-sec-title">Especificações</div>
            <div className="m-grid">
              <div><div className="mf-lbl">Motorização</div><div className="mf-val">{e.motor}</div></div>
              <div><div className="mf-lbl">Transmissão</div><div className="mf-val">{e.trans}</div></div>
              <div><div className="mf-lbl">Condição</div><div className="mf-val"><span className={`est-badge ${e.cond}`} style={{position:'static',display:'inline-block'}}>{cap(e.cond)}</span></div></div>
              <div><div className="mf-lbl">Status</div><div className="mf-val">{e.status}</div></div>
              {e.km && <div><div className="mf-lbl">KM</div><div className="mf-val">{e.km}</div></div>}
              <div><div className="mf-lbl">Em estoque</div><div className="mf-val">{e.estq} un.</div></div>
            </div>
          </div>
          <div className="m-sec"><div className="m-sec-title">Opcionais</div>
            <div>{e.ops.map((o,i)=><span key={i} className="itag green">{o}</span>)}</div>
          </div>
          <div className="m-sec"><div className="m-sec-title">Precificação</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div><div className="mf-lbl">Valor sugerido</div><div style={{fontSize:28,fontWeight:700,color:'var(--ford-blue)'}}>{formatCurrency(e.preco)}</div></div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button className="btn-sec" onClick={()=>{onClose();setTimeout(()=>onFinSim(e.id),220);}}>Simular financiamento</button>
                <button className="btn-prim" onClick={()=>showToast('Unidade reservada!','success')}>Reservar unidade</button>
              </div>
            </div>
          </div>
          {(onEditar || onExcluir) && (
            <div className="m-sec" style={{marginBottom:0}}>
              <div className="m-sec-title">Ações administrativas</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {onEditar && (
                  <button
                    className="btn-prim"
                    disabled={!canEdit}
                    title={canEdit ? undefined : 'Apenas ADMIN ou GERENTE podem editar itens do estoque.'}
                    onClick={()=>onEditar(e)}
                  >
                    <i className="ph-bold ph-pencil-simple"/> Editar
                  </button>
                )}
                {onExcluir && (
                  <button
                    className="btn-danger-out"
                    disabled={!canDelete}
                    title={canDelete ? undefined : 'Apenas ADMIN pode excluir itens do estoque.'}
                    onClick={()=>onExcluir(e)}
                  >
                    <i className="ph-bold ph-trash"/> Excluir
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
