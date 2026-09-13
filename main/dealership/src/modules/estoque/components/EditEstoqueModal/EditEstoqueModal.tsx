/**
 * @file EditEstoqueModal.tsx
 * @module estoque
 * @description Modal de edição dos dados comerciais de um item já cadastrado no estoque.
 * Diferente do AddEstoqueModal (que parte do catálogo do scraper), aqui só os campos
 * comerciais são editáveis — modelo/versão/motor vêm do catálogo no momento da criação
 * e não são re-selecionáveis aqui.
 *
 * Props:
 * - isOpen  → visibilidade
 * - onClose → fechar sem salvar
 * - item    → item de estoque sendo editado (null = modal fechado)
 * - onSave  → callback com os campos alterados (PATCH parcial)
 */

import React, { useEffect, useState } from 'react';
import type { Estoque } from '../../../../types/global.types';
import type { UpdateEstoqueInput } from '../../services/estoque.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Estoque | null;
  onSave: (dados: UpdateEstoqueInput) => void;
}

const BLANK = { condicao: 'NOVO' as 'NOVO' | 'SEMINOVO', status: '', preco: '', cor: '', quantidade: '1', km: '', opcionais: '' };

export const EditEstoqueModal: React.FC<Props> = ({ isOpen, onClose, item, onSave }) => {
  const [form, setForm] = useState(BLANK);
  const up = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isOpen || !item) return;
    setForm({
      condicao: item.cond === 'seminovo' ? 'SEMINOVO' : 'NOVO',
      status: item.status,
      preco: String(item.preco),
      cor: item.cor,
      quantidade: String(item.estq),
      km: item.km ?? '',
      opcionais: item.ops.join(', '),
    });
  }, [isOpen, item]);

  if (!item) return null;

  const handleSave = () => {
    onSave({
      condicao: form.condicao,
      status: form.status.trim() || 'Disponivel',
      preco: Number(form.preco),
      cor: form.cor.trim(),
      quantidade: Number(form.quantidade),
      km: form.km.trim() || undefined,
      opcionais: form.opcionais.split(',').map(o => o.trim()).filter(Boolean),
    });
  };

  return (
    <div className={`modal-ov${isOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-x" onClick={onClose}><i className="ph-bold ph-x" /></button>
        <div className="m-body">
          <h2>Editar estoque</h2>
          <p className="mod-sub">{item.modelo} {item.versao} · {item.ano}</p>
          <form className="m-form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="m-grid">
              <label>Condição
                <select value={form.condicao} onChange={e => up('condicao', e.target.value as 'NOVO' | 'SEMINOVO')}>
                  <option value="NOVO">Novo</option>
                  <option value="SEMINOVO">Seminovo</option>
                </select>
              </label>
              <label>Preço de venda<input required min="0" type="number" step="0.01" value={form.preco} onChange={e => up('preco', e.target.value)} /></label>
              <label>Cor<input required value={form.cor} onChange={e => up('cor', e.target.value)} /></label>
              <label>Quantidade<input required min="0" type="number" value={form.quantidade} onChange={e => up('quantidade', e.target.value)} /></label>
              <label>Quilometragem<input value={form.km} onChange={e => up('km', e.target.value)} placeholder="Ex.: 0 km" /></label>
            </div>
            <label>Status<input value={form.status} onChange={e => up('status', e.target.value)} /></label>
            <label>Opcionais <span>(separados por vírgula)</span><textarea value={form.opcionais} onChange={e => up('opcionais', e.target.value)} /></label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-sec" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-prim">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
