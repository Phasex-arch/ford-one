/**
 * @file NovoClienteModal.tsx
 * @module clientes
 * @description Modal de cadastro de novo cliente.
 * Formulário controlado com: nome, telefone, e-mail, segmento e status.
 * Reseta os campos após salvar para o próximo cadastro.
 *
 * Props:
 * - isOpen   → visibilidade do modal
 * - onClose  → fechar sem salvar
 * - onSave   → callback com os dados do formulário (sem obs — campo visual apenas)
 *
 * Validação: feita no hook useClientes.ts (não no modal)
 * para separar regra de negócio da apresentação.
 */

import React, { useState } from 'react';
import type { Cliente, ClienteStatus, ClienteSegmento } from '../../../../types/global.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>) => void;
}

export const NovoClienteModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ nome:'', tel:'', email:'', seg:'Padrão' as ClienteSegmento, status:'potencial' as ClienteStatus, obs:'' });
  const up = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave({ nome: form.nome, tel: form.tel, email: form.email, status: form.status, seg: form.seg });
    setForm({ nome:'', tel:'', email:'', seg:'Padrão', status:'potencial', obs:'' });
  };

  return (
    <div className={`modal-ov${isOpen ? ' open' : ''}`} id="novoClienteModal"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-x" onClick={onClose}><i className="ph-bold ph-x" /></button>
        <div style={{ padding:22 }}>
          <h3 style={{ fontSize:20, fontWeight:700, color:'var(--c-text)', marginBottom:4, paddingBottom:12, borderBottom:'1px solid var(--c-border)' }}>Novo Cliente</h3>
          <div className="m-form" style={{ marginTop:14 }}>
            <label>Nome completo<input type="text" id="ncNome" placeholder="Nome completo do cliente" value={form.nome} onChange={e => up('nome', e.target.value)} /></label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <label>Telefone<input type="tel" id="ncTel" placeholder="(11) 9xxxx-xxxx" value={form.tel} onChange={e => up('tel', e.target.value)} /></label>
              <label>E-mail<input type="email" id="ncEmail" placeholder="email@exemplo.com" value={form.email} onChange={e => up('email', e.target.value)} /></label>
            </div>
            <label>Segmento
              <select id="ncSegmento" value={form.seg} onChange={e => up('seg', e.target.value as ClienteSegmento)}>
                <option value="Padrão">Padrão</option>
                <option value="Família">Família</option>
                <option value="Executivo">Executivo</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </label>
            <label>Status
              <select id="ncStatus" value={form.status} onChange={e => up('status', e.target.value as ClienteStatus)}>
                <option value="potencial">Potencial</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
            <button className="btn-sec" onClick={onClose}>Cancelar</button>
            <button className="btn-prim" onClick={handleSave}>Cadastrar Cliente</button>
          </div>
        </div>
      </div>
    </div>
  );
};
