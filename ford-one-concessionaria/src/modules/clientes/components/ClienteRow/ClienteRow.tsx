/**
 * @file ClienteRow.tsx
 * @module clientes
 * @description Linha da tabela de clientes.
 * Renderiza as 8 colunas: avatar+nome, telefone, e-mail, último atendimento,
 * status (pill colorida), quantidade de veículos, LTV e botão de acesso.
 *
 * Comportamento:
 * - Clicar na linha inteira navega para o histórico do cliente
 * - Clicar no e-mail abre mailto sem propagar o clique para a linha
 * - O botão "Acessar" também navega para o histórico
 *
 * Props:
 * - cliente   → objeto Cliente tipado
 * - onAcessar → callback chamado com o ID do cliente ao clicar
 */

import React from 'react';
import type { Cliente } from '../../../../types/global.types';
import { formatCurrency, cap } from '../../../../shared/utils/formatters';

interface Props { cliente: Cliente; onAcessar: (id: string) => void; }

export const ClienteRow: React.FC<Props> = ({ cliente: c, onAcessar }) => (
  <tr onClick={() => onAcessar(c.id)} style={{ cursor:'pointer' }}>
    <td>
      <div className="cli-cell">
        <div className="cli-av">{c.ini}</div>
        <div>
          <div className="cli-name">{c.nome}</div>
          <div className="cli-id">{c.id} · {c.seg}</div>
        </div>
      </div>
    </td>
    <td>{c.tel}</td>
    <td>
      <a href={`mailto:${c.email}`} style={{ color:'var(--ford-vivid)' }}
        onClick={e => e.stopPropagation()}>{c.email}</a>
    </td>
    <td>{c.ult}</td>
    <td><span className={`pill ${c.status}`}>{cap(c.status)}</span></td>
    <td style={{ textAlign:'center', fontWeight:700 }}>{c.v}</td>
    <td className="ltv-v">{formatCurrency(c.ltv)}</td>
    <td>
      <button className="btn-tbl" onClick={e => { e.stopPropagation(); onAcessar(c.id); }}>
        Acessar
      </button>
    </td>
  </tr>
);
