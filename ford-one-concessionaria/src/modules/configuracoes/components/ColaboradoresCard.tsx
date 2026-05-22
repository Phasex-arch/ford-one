/**
 * @file ColaboradoresCard.tsx
 * @module configuracoes
 * @description Bloco de gestao de colaboradores dentro da tela de
 * Configuracoes. Lista colaboradores via GET /api/v1/colaboradores e permite
 * cadastrar um novo via POST /api/v1/auth/register (ADMIN only).
 */

import React, { useCallback, useEffect, useState } from 'react';
import * as colaboradoresApi from '../../../shared/api/resources/colaboradores';
import * as authApi from '../../../shared/api/resources/auth';
import type { ColaboradorApiDto, ApiRole } from '../../../shared/api/types';
import { extractErrorMessage } from '../../../shared/api/http';
import { useAuth } from '../../../shared/auth/AuthContext';
import type { ToastType } from '../../../shared/hooks/useToast';

interface Props {
  showToast: (m: string, t?: ToastType) => void;
}

const ROLE_LABEL: Record<ApiRole, string> = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  FUNCIONARIO: 'Colaborador',
};

const EMPTY_FORM = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  endereco: '',
  registro: '',
  cargo: '',
  role: 'FUNCIONARIO' as ApiRole,
  senha: '',
};

export const ColaboradoresCard: React.FC<Props> = ({ showToast }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [items, setItems] = useState<ColaboradorApiDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await colaboradoresApi.list({ limit: 100 });
      setItems(list);
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao carregar colaboradores.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const onSubmit = async () => {
    if (!form.nome || !form.email || !form.senha) {
      showToast('Preencha nome, e-mail e senha.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await authApi.register(form);
      showToast('Colaborador cadastrado!', 'success');
      setForm(EMPTY_FORM);
      setModalOpen(false);
      await refresh();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Falha ao cadastrar colaborador.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="config-card" style={{ gridColumn: '1 / -1' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <h3 style={{ margin: 0 }}>Colaboradores</h3>
        {isAdmin && (
          <button className="btn-prim" onClick={() => setModalOpen(true)}>
            <i className="ph-bold ph-plus" /> Cadastrar colaborador
          </button>
        )}
      </div>
      <p className="cfg-desc" style={{ marginTop: 6 }}>
        Equipe com acesso ao Ford One. Apenas administradores podem cadastrar
        novos usuarios.
      </p>

      {loading ? (
        <div style={{ padding: 14, color: 'var(--c-mid)', fontSize: 'var(--fs1)' }}>
          Carregando...
        </div>
      ) : error ? (
        <div style={{ padding: 14, color: 'var(--red)', fontSize: 'var(--fs1)' }}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: 14, color: 'var(--c-mid)', fontSize: 'var(--fs1)' }}>
          Nenhum colaborador cadastrado.
        </div>
      ) : (
        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 10,
          }}
        >
          {items.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '12px 14px',
                background: 'var(--ford-light)',
                borderRadius: 'var(--rsm)',
                border: '1px solid var(--c-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--ford-vivid)',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {c.nome
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase() ?? '')
                  .join('')}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--c-text)',
                    fontSize: 'var(--fs1)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.nome}
                </div>
                <div style={{ fontSize: 'var(--fs0)', color: 'var(--c-mid)' }}>
                  {ROLE_LABEL[c.role]} · {c.cargo}
                </div>
                <div
                  style={{
                    fontSize: 'var(--fs0)',
                    color: 'var(--c-dim)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.email}
                </div>
              </div>
              {!c.ativo && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    background: 'var(--red-bg)',
                    color: 'var(--red)',
                    borderRadius: 6,
                    fontWeight: 700,
                  }}
                >
                  inativo
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="modal-ov open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={() => setModalOpen(false)}>
              <i className="ph-bold ph-x" />
            </button>
            <div style={{ padding: 22 }}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--c-text)',
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--c-border)',
                }}
              >
                Novo Colaborador
              </h3>
              <div className="m-form">
                <label>
                  Nome completo
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label>
                    CPF
                    <input
                      type="text"
                      value={form.cpf}
                      onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                    />
                  </label>
                  <label>
                    Telefone
                    <input
                      type="tel"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    />
                  </label>
                </div>
                <label>
                  E-mail
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <label>
                  Endereco
                  <input
                    type="text"
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label>
                    Registro
                    <input
                      type="text"
                      value={form.registro}
                      onChange={(e) => setForm({ ...form, registro: e.target.value })}
                    />
                  </label>
                  <label>
                    Cargo
                    <input
                      type="text"
                      value={form.cargo}
                      onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    />
                  </label>
                </div>
                <label>
                  Papel
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as ApiRole })}
                  >
                    <option value="FUNCIONARIO">Colaborador</option>
                    <option value="GERENTE">Gerente</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn-sec" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button className="btn-prim" onClick={onSubmit} disabled={saving}>
                  {saving ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
