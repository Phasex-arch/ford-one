/**
 * @file NovoClienteModal.tsx
 * @module clientes
 * @description Modal de cadastro/edição de cliente.
 * Formulário controlado com: nome, telefone, e-mail, segmento e status.
 * Reseta os campos após salvar para o próximo cadastro.
 *
 * Props:
 * - isOpen   → visibilidade do modal
 * - onClose  → fechar sem salvar
 * - onSave   → callback com os dados do formulário (sem obs — campo visual apenas)
 * - cliente  → quando informado, abre em modo edição pré-preenchido com os dados dele
 *
 * Validação: feita no hook useClientes.ts (não no modal)
 * para separar regra de negócio da apresentação.
 */

import React, { useEffect, useState } from 'react';
import type { Cliente, ClienteStatus, ClienteSegmento } from '../../../../types/global.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>) => void;
  cliente?: Cliente | null;
}

const BLANK = { nome:'', tel:'', email:'', seg:'Padrão' as ClienteSegmento, status:'potencial' as ClienteStatus, obs:'' };

export const NovoClienteModal: React.FC<Props> = ({ isOpen, onClose, onSave, cliente }) => {
  const [form, setForm] = useState(BLANK);
  const isEdit = !!cliente;
  const up = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isOpen) return;
    setForm(cliente
      ? { nome: cliente.nome, tel: cliente.tel, email: cliente.email, seg: cliente.seg, status: cliente.status, obs: '' }
      : BLANK);
  }, [isOpen, cliente]);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({ nome: form.nome, tel: form.tel, email: form.email, status: form.status, seg: form.seg });
    if (!isEdit) setForm(BLANK);
  };

  return (
    <div className={`modal-ov${isOpen ? ' open' : ''}`} id="novoClienteModal"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-x" onClick={onClose}><i className="ph-bold ph-x" /></button>
        <div style={{ padding:22 }}>
          <h3 style={{ fontSize:20, fontWeight:700, color:'var(--c-text)', marginBottom:4, paddingBottom:12, borderBottom:'1px solid var(--c-border)' }}>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <form className="m-form" style={{ marginTop:14 }} onSubmit={handleSave}>
            <label>Nome completo<input required minLength={3} type="text" id="ncNome" placeholder="Nome completo do cliente" value={form.nome} onChange={e => up('nome', e.target.value)} /></label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <label>Telefone<input required minLength={8} type="tel" id="ncTel" placeholder="(11) 9xxxx-xxxx" value={form.tel} onChange={e => up('tel', e.target.value)} /></label>
              <label>E-mail<input required type="email" id="ncEmail" placeholder="email@exemplo.com" value={form.email} onChange={e => up('email', e.target.value)} /></label>
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
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:2 }}>
              <button type="button" className="btn-sec" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-prim">{isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
