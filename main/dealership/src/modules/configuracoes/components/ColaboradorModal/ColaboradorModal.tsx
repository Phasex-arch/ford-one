/**
 * @file ColaboradorModal.tsx
 * @module configuracoes
 * @description Modal de criação/edição de acesso de colaborador.
 *
 * Modo criação: todos os campos, incluindo CPF, registro e senha (obrigatória).
 * Modo edição: CPF e registro ficam ocultos (imutáveis no backend — a
 * matrícula e o CPF de um colaborador não podem ser trocados depois do
 * cadastro); a senha vira opcional ("deixe em branco para manter a atual").
 *
 * Props:
 * - isOpen       → visibilidade do modal
 * - onClose      → fechar sem salvar
 * - onSave       → callback com os dados do formulário (create ou update, a
 *   tela decide qual chamar com base em `colaborador` estar presente)
 * - colaborador  → quando informado, abre em modo edição pré-preenchido
 */

import React, { useEffect, useState } from 'react';
import type { Colaborador, ColaboradorRole } from '../../services/colaboradores.service';
import { formatTelefone } from '../../../../shared/utils/formatters';

interface FormState {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  registro: string;
  cargo: string;
  role: ColaboradorRole;
  senha: string;
}

const BLANK: FormState = {
  nome: '', cpf: '', telefone: '', email: '', endereco: '', registro: '', cargo: '',
  role: 'FUNCIONARIO', senha: '',
};

/** Formata CPF conforme o usuário digita: 000.000.000-00. */
const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  if (digits.length > 6) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  return digits;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: FormState) => void;
  colaborador?: Colaborador | null;
}

export const ColaboradorModal: React.FC<Props> = ({ isOpen, onClose, onSave, colaborador }) => {
  const [form, setForm] = useState<FormState>(BLANK);
  const isEdit = !!colaborador;
  const up = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isOpen) return;
    setForm(colaborador
      ? {
          nome: colaborador.nome, cpf: '', telefone: colaborador.telefone, email: colaborador.email,
          endereco: colaborador.endereco, registro: colaborador.registro, cargo: colaborador.cargo,
          role: colaborador.role, senha: '',
        }
      : BLANK);
  }, [isOpen, colaborador]);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <div className={`modal-ov${isOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-x" onClick={onClose}><i className="ph-bold ph-x" /></button>
        <div style={{ padding: 22 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4, paddingBottom: 12, borderBottom: '1px solid var(--c-border)' }}>
            {isEdit ? `Editar ${colaborador!.nome.split(' ')[0]}` : 'Novo colaborador'}
          </h3>
          <p style={{ fontSize: 'var(--fs1)', color: 'var(--c-mid)', marginTop: 10 }}>
            {isEdit ? 'Altera os dados e o acesso deste colaborador.' : 'Cria um acesso real ao painel — a pessoa recebe login e senha imediatamente.'}
          </p>

          <form onSubmit={handleSave}>
            <div className="m-sec" style={{ marginTop: 14 }}>
              <div className="m-sec-title">Dados pessoais</div>
              <div className="m-form">
                <label>Nome completo
                  <input required minLength={3} type="text" placeholder="Ex.: Mariana Souza Lima" value={form.nome} onChange={e => up('nome', e.target.value)} />
                </label>
                <div className="m-grid">
                  {!isEdit && (
                    <label>CPF
                      <input required placeholder="000.000.000-00" value={form.cpf} onChange={e => up('cpf', formatCpf(e.target.value))} />
                    </label>
                  )}
                  <label>Telefone
                    <input required minLength={14} maxLength={15} type="tel" placeholder="(11) 90000-0000" value={form.telefone} onChange={e => up('telefone', formatTelefone(e.target.value))} />
                  </label>
                </div>
                <label>E-mail
                  <input required type="email" placeholder="mariana.lima@ford.com.br" value={form.email} onChange={e => up('email', e.target.value)} />
                </label>
                <label>Endereço
                  <input required minLength={5} placeholder="Rua, número — Bairro/Cidade" value={form.endereco} onChange={e => up('endereco', e.target.value)} />
                </label>
              </div>
            </div>

            <div className="m-sec">
              <div className="m-sec-title">Acesso ao sistema</div>
              <div className="m-form">
                <div className="m-grid">
                  {!isEdit && (
                    <label>Registro / Matrícula
                      <input required minLength={3} placeholder="FRD-FUN-005" value={form.registro} onChange={e => up('registro', e.target.value)} />
                    </label>
                  )}
                  <label>Cargo
                    <input required minLength={2} placeholder="Consultora de Vendas" value={form.cargo} onChange={e => up('cargo', e.target.value)} />
                  </label>
                </div>
                <label>Papel de acesso
                  <select value={form.role} onChange={e => up('role', e.target.value as ColaboradorRole)}>
                    <option value="ADMIN">Administrador</option>
                    <option value="GERENTE">Gerente</option>
                    <option value="FUNCIONARIO">Funcionário</option>
                  </select>
                </label>
                <label>{isEdit ? 'Nova senha' : 'Senha'}
                  <input
                    required={!isEdit} minLength={8} type="password"
                    placeholder={isEdit ? 'Deixe em branco para manter a atual' : 'Mínimo 8 caracteres'}
                    value={form.senha}
                    onChange={e => up('senha', e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--c-border)' }}>
              <button type="button" className="btn-sec" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-prim">{isEdit ? 'Salvar alterações' : 'Criar acesso'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
