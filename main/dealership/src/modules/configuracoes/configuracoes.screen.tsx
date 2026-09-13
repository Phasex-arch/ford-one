/**
 * @file configuracoes.screen.tsx
 * @module configuracoes
 * @description Tela de Configurações do sistema Ford One.
 *
 * Seções:
 * 1. Dados da Concessionária  → real, GET/PATCH /api/configuracoes/concessionaria
 *    (singleton — sempre existe uma linha, criada com valores padrão na
 *    primeira leitura). Edição restrita a ADMIN/GERENTE, espelhando o backend.
 * 2. Aparência                → seletor tema claro/escuro (persiste em localStorage) — real
 * 3. Segurança                → status real, somente leitura: log de
 *    auditoria (sempre ativo, é um interceptor global, não uma opção) e
 *    expiração de sessão (valor real de JWT_EXPIRES_IN). Não existe 2FA nem
 *    "alertas de acesso suspeito" no sistema — removidos, não fingidos.
 * 4. Metas Padrão              → removida daqui: era um formulário desconectado
 *    que não gravava nada e duplicava os mesmos valores já editáveis de
 *    verdade na tela de Metas. Ficou um atalho pra lá.
 * 5. Documentação do Sistema  → baixa o PDF só se ele realmente existir no
 *    servidor (checagem HEAD antes) — antes sempre mostrava "sucesso" mesmo
 *    com o arquivo ausente.
 *
 * A seção "Integração Ford Smart Ecosystem" (CRM, Financeira, Parts, Analytics)
 * foi removida — eram nomes de integração inventados, sem nenhuma correspondência
 * real no sistema.
 *
 * Props:
 * - showToast → feedback de salvamento de dados e alteração de tema
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/hooks/useTheme';
import { useConfiguracoes } from './hooks/useConfiguracoes';
import { useApp } from '../../shared/context/AppContext';
import type { ToastType } from '../../shared/hooks/useToast';
import type { UpdateConcessionariaInput } from './services/configuracoes.service';

interface Props { showToast: (m: string, t?: ToastType) => void; }

const PDF_URL = '/assets/document/ford-one-concessionaria.pdf';

export const ConfiguracoesScreen: React.FC<Props> = ({ showToast }) => {
  const { theme, setTheme } = useTheme();
  const { user, navigate } = useApp();
  const canEditarConcessionaria = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const { concessionaria, seguranca, loading, error, salvando, salvarConcessionaria } = useConfiguracoes(showToast);
  const [form, setForm] = useState<UpdateConcessionariaInput>({});

  useEffect(() => {
    if (concessionaria) setForm({
      nome: concessionaria.nome, cnpj: concessionaria.cnpj,
      endereco: concessionaria.endereco, telefone: concessionaria.telefone,
    });
  }, [concessionaria]);

  const [baixando, setBaixando] = useState(false);

  const baixarDocumentacao = async () => {
    setBaixando(true);
    try {
      const res = await fetch(PDF_URL, { method: 'HEAD' });
      if (!res.ok) throw new Error('not-found');
      const link = document.createElement('a');
      link.href = PDF_URL;
      link.download = 'ford-one-concessionaria.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Documentação baixada com sucesso!', 'success');
    } catch {
      showToast('Documentação ainda não disponível — arquivo não encontrado no servidor.', 'warning');
    } finally {
      setBaixando(false);
    }
  };

  return (
    <section className="module active" id="mod-config">
      <div className="mod-header">
        <div>
          <h1>Configurações</h1>
          <p className="mod-sub">Preferências do sistema e integrações</p>
        </div>
      </div>

      {loading && <p className="mod-sub">Carregando configurações...</p>}
      {error && <p className="mod-sub" style={{ color: 'var(--red)' }}>{error}</p>}

      <div className="config-grid">

        {/* ── Dados da Concessionária ──────────────────────────────────────── */}
        <div className="config-card">
          <h3>Concessionária</h3>
          {concessionaria && (
            <>
              <div className="cfg-form">
                <label>Nome<input type="text" value={form.nome ?? ''} disabled={!canEditarConcessionaria}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}/></label>
                <label>CNPJ<input type="text" value={form.cnpj ?? ''} disabled={!canEditarConcessionaria}
                  onChange={e => setForm(p => ({ ...p, cnpj: e.target.value }))}/></label>
                <label>Endereço<input type="text" value={form.endereco ?? ''} disabled={!canEditarConcessionaria}
                  onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))}/></label>
                <label>Telefone<input type="text" value={form.telefone ?? ''} disabled={!canEditarConcessionaria}
                  onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}/></label>
              </div>
              {canEditarConcessionaria ? (
                <button
                  className="btn-prim"
                  style={{ marginTop: 12 }}
                  disabled={salvando}
                  onClick={() => salvarConcessionaria(form)}
                >
                  {salvando ? 'Salvando...' : 'Salvar dados'}
                </button>
              ) : (
                <p className="cfg-desc" style={{ marginTop: 12 }}>Só ADMIN ou GERENTE podem editar os dados da concessionária.</p>
              )}
            </>
          )}
        </div>

        {/* ── Aparência ────────────────────────────────────────────────────── */}
        <div className="config-card">
          <h3>Aparência</h3>
          <p className="cfg-desc">Modo padrão: Claro. Alterne para Escuro para reduzir o cansaço visual.</p>
          <div className="theme-opts">
            <button
              className={`theme-btn${theme === 'light' ? ' active' : ''}`}
              id="themeLight"
              onClick={() => { setTheme('light'); showToast('Tema claro ativado.', 'success'); }}
            >
              <div className="theme-preview lp">
                <div className="tp-bar"/>
                <div className="tp-row"><div className="tp-side"/><div className="tp-main"><div className="tp-c"/><div className="tp-c"/></div></div>
              </div>
              <span>Claro</span>
            </button>
            <button
              className={`theme-btn${theme === 'dark' ? ' active' : ''}`}
              id="themeDark"
              onClick={() => { setTheme('dark'); showToast('Tema escuro ativado.', 'success'); }}
            >
              <div className="theme-preview dp">
                <div className="tp-bar"/>
                <div className="tp-row"><div className="tp-side"/><div className="tp-main"><div className="tp-c"/><div className="tp-c"/></div></div>
              </div>
              <span>Escuro</span>
            </button>
          </div>
        </div>

        {/* ── Segurança (status real, somente leitura) ────────────────────── */}
        <div className="config-card">
          <h3>Segurança</h3>
          {seguranca && (
            <div className="toggle-list">
              <div className="toggle-item" style={{ cursor: 'default' }}>
                <span>Log de auditoria</span>
                <span className="cfg-desc" style={{ margin: 0, color: 'var(--green)', fontWeight: 600 }}>Sempre ativo</span>
              </div>
              <div className="toggle-item" style={{ cursor: 'default' }}>
                <span>Sessão expira em</span>
                <span className="cfg-desc" style={{ margin: 0, color: 'var(--c-text)', fontWeight: 600 }}>{seguranca.jwtExpiresIn}</span>
              </div>
            </div>
          )}
          <p className="cfg-desc" style={{ marginTop: 10 }}>
            Autenticação em 2 fatores ainda não existe no sistema — não exibida aqui pra não sugerir uma proteção que não está ativa.
          </p>
        </div>

        {/* ── Atalho pra Metas ─────────────────────────────────────────────── */}
        <div className="config-card">
          <h3>Metas</h3>
          <p className="cfg-desc">As metas da concessionária (vendas, receita, SLA, NPS) são gerenciadas na tela de Metas.</p>
          <button className="btn-sec" style={{ marginTop: 12 }} onClick={() => navigate('metas')}>
            <i className="ph-bold ph-target"/> Ir para Metas
          </button>
        </div>

        {/* ── Documentação do Sistema ───────────────────────────────────────── */}
        <div className="config-card">
          <h3>Documentação do Sistema</h3>
          <p className="cfg-desc">
            Baixe a documentação técnica completa do Ford One em formato PDF,
            incluindo arquitetura, módulos, fluxos e decisões de desenvolvimento.
          </p>

          {/* Caixa do arquivo */}
          <div style={{
            marginTop: 16,
            padding: '16px 18px',
            background: 'var(--ford-light)',
            borderRadius: 'var(--r)',
            border: '1px solid var(--c-border)',
          }}>
            {/* Linha 1: ícone + informações */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 42, height: 42,
                borderRadius: 'var(--rsm)',
                background: 'var(--red-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className="ph-bold ph-file-pdf" style={{ fontSize: 20, color: 'var(--red)' }}/>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--fs2)', color: 'var(--c-text)' }}>
                  ford-one-concessionaria.pdf
                </div>
                <div style={{ fontSize: 'var(--fs0)', color: 'var(--c-mid)', marginTop: 3 }}>
                  Documentação técnica completa · Ford One v3.2 · 2026
                </div>
              </div>
            </div>

            {/* Linha 2: botão largura total */}
            <button
              className="btn-prim"
              onClick={baixarDocumentacao}
              disabled={baixando}
              style={{
                width: '100%', height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: baixando ? 0.8 : 1,
                cursor: baixando ? 'not-allowed' : 'pointer',
              }}
            >
              {baixando ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 13, height: 13,
                    border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff',
                    borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0,
                  }}/>
                  Verificando...
                </>
              ) : (
                <>
                  <i className="ph-bold ph-download-simple"/>
                  Baixar PDF
                </>
              )}
            </button>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

      </div>
    </section>
  );
};
