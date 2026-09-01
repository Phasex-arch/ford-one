/**
 * @file EstoqueCard.tsx
 * @module estoque
 * @description Card de veículo no grid de estoque.
 * Exibe: imagem (ou placeholder SVG), badge de condição (novo/seminovo),
 * status (Disponível/Reservado), modelo, versão, specs técnicas e preço.
 *
 * Placeholder: quando item.img é null, exibe SVG inline de ícone de carro
 * com o nome do modelo abaixo — sem imagens quebradas.
 *
 * Props:
 * - item    → objeto Estoque tipado
 * - onClick → abre o modal de detalhes do veículo
 */

import React from 'react';
import type { Estoque } from '../../../../types/global.types';
import { formatCurrency, cap } from '../../../../shared/utils/formatters';

interface Props { item: Estoque; onClick: () => void; }

export const EstoqueCard: React.FC<Props> = ({ item: e, onClick }) => (
  <div className="est-card" onClick={onClick}>
    <div className="est-img">
      {e.img
        ? <img src={e.img} alt={e.modelo} loading="lazy" />
        : <div style={{color:'var(--c-dim)',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span style={{fontSize:'var(--fs0)'}}>{e.modelo}</span>
          </div>
      }
      <span className={`est-badge ${e.cond}`}>{cap(e.cond)}</span>
      <span className="est-status">{e.status}</span>
    </div>
    <div className="est-body">
      <div className="est-model">{e.modelo}</div>
      <div className="est-ver">{e.versao}</div>
      <div className="est-specs">
        <span className="esp">{e.ano}</span>
        <span className="esp">{e.motor}</span>
        <span className="esp">{e.trans}</span>
        {e.km && <span className="esp">{e.km}</span>}
      </div>
      <div className="est-price-block">
        <div className="est-price-lbl">A partir de</div>
        <div className="est-price">{formatCurrency(e.preco)}</div>
      </div>
    </div>
  </div>
);
