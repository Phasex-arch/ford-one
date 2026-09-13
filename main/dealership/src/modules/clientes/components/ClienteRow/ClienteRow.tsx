/**
 * @file ClienteRow.tsx
 * @module clientes
 * @description Linha da tabela de clientes.
 * Renderiza as 8 colunas: avatar+nome, telefone, e-mail, último atendimento,
 * status (pill colorida), quantidade de veículos, LTV e ações.
 *
 * Comportamento:
 * - Clicar na linha inteira navega para o histórico do cliente
 * - Clicar no e-mail abre mailto sem propagar o clique para a linha
 * - Botões de ação (editar/excluir/acessar) não propagam o clique pra linha
 * - Excluir fica desabilitado para quem não é ADMIN/GERENTE (regra do backend)
 *
 * Props:
 * - cliente    → objeto Cliente tipado
 * - onAcessar  → callback chamado com o cliente ao clicar
 * - onEditar   → abre o modal de edição pré-preenchido com este cliente
 * - onExcluir  → abre a confirmação de exclusão para este cliente
 * - canDelete  → se o usuário logado pode excluir (ADMIN/GERENTE)
 */

import React from 'react';
import type { Cliente } from '../../../../types/global.types';
import { formatCurrency, cap } from '../../../../shared/utils/formatters';

interface Props {
  cliente: Cliente;
  onAcessar: (cliente: Cliente) => void;
  onEditar: (cliente: Cliente) => void;
  onExcluir: (cliente: Cliente) => void;
  canDelete: boolean;
}

export const ClienteRow: React.FC<Props> = ({ cliente: c, onAcessar, onEditar, onExcluir, canDelete }) => (
  <tr onClick={() => onAcessar(c)} style={{ cursor:'pointer' }}>
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
      <div style={{ display:'flex', gap:5, justifyContent:'flex-end' }}>
        <button className="icon-btn" title="Editar cliente" onClick={e => { e.stopPropagation(); onEditar(c); }}>
          <i className="ph-bold ph-pencil-simple" />
        </button>
        <button
          className="icon-btn"
          title={canDelete ? 'Excluir cliente' : 'Apenas ADMIN ou GERENTE podem excluir clientes.'}
          disabled={!canDelete}
          onClick={e => { e.stopPropagation(); onExcluir(c); }}
        >
          <i className="ph-bold ph-trash" />
        </button>
        <button className="btn-tbl" onClick={e => { e.stopPropagation(); onAcessar(c); }}>
          Acessar
        </button>
      </div>
    </td>
  </tr>
);
