/**
 * @file configuracoes.screen.tsx
 * @module configuracoes
 * @description Tela de Configurações do sistema Ford One.
 *
 * Seções:
 * 1. Dados da Concessionária  → formulário editável (nome, CNPJ, endereço, tel)
 * 2. Aparência                → seletor tema claro/escuro (persiste em localStorage)
 * 3. Integração Ford Ecosystem→ status das integrações (CRM, Financeira, Parts, Analytics)
 * 4. Segurança                → toggles (2FA, log auditoria, timeout, alertas)
 * 5. Metas Padrão             → campos configuráveis de metas base do sistema
 * 6. Documentação do Sistema  → botão para baixar o PDF de documentação técnica
 *                               Caminho: public/assets/document/ford-one-concessionaria.pdf
 *                               Exibe estado "Baixando..." durante o download simulado.
 *
 * Props:
 * - showToast → feedback de salvamento de dados e alteração de tema
 */

import React, { useState } from 'react';
import { useTheme } from '../../shared/hooks/useTheme';
import type { ToastType } from '../../shared/hooks/useToast';

interface Props { showToast: (m: string, t?: ToastType) => void; }

export const ConfiguracoesScreen: React.FC<Props> = ({ showToast }) => {
  const { theme, setTheme } = useTheme();

  // ── Metas padrão (estado local controlado) ─────────────────────────────────
  const [metaVendas,   setMetaVendas]   = useState(28);
  const [metaReceita,  setMetaReceita]  = useState(1200000);
  const [metaSla,      setMetaSla]      = useState(4);
  const [metaNps,      setMetaNps]      = useState(70);

  // ── Download de documentação ────────────────────────────────────────────────
  const [baixando, setBaixando] = useState(false);

  /**
   * Inicia o download do PDF de documentação técnica do sistema.
   * O arquivo deve estar em public/assets/document/ford-one-concessionaria.pdf.
   * Exibe estado "Baixando..." por 1,5s antes de disparar o download via <a>.
   */
  const baixarDocumentacao = () => {
    setBaixando(true);
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '/assets/document/ford-one-concessionaria.pdf';
      link.download = 'ford-one-concessionaria.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setBaixando(false);
      showToast('Documentação baixada com sucesso!', 'success');
    }, 1500);
  };

  return (
    <section className="module active" id="mod-config">
      <div className="mod-header">
        <div>
          <h1>Configurações</h1>
          <p className="mod-sub">Preferências do sistema e integrações</p>
        </div>
      </div>

      <div className="config-grid">

        {/* ── Dados da Concessionária ──────────────────────────────────────── */}
        <div className="config-card">
          <h3>Concessionária</h3>
          <div className="cfg-form">
            <label>Nome<input type="text" defaultValue="Ford SP Centro"/></label>
            <label>CNPJ<input type="text" defaultValue="12.345.678/0001-99"/></label>
            <label>Endereço<input type="text" defaultValue="Av. Paulista, 1000 — São Paulo/SP"/></label>
            <label>Telefone<input type="text" defaultValue="(11) 3000-4000"/></label>
          </div>
          <button
            className="btn-prim"
            style={{ marginTop: 12 }}
            onClick={() => showToast('Dados da concessionária salvos!', 'success')}
          >
            Salvar dados
          </button>
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

        {/* ── Integração Ford Smart Ecosystem ─────────────────────────────── */}
        <div className="config-card">
          <h3>Integração Ford Smart Ecosystem</h3>
          <div className="int-list">
            {([
              ['ok',   'Ford CRM Central'],
              ['ok',   'Ford Financeira'],
              ['ok',   'Ford Parts Online'],
              ['warn', 'Ford Analytics (sync pendente)'],
            ] as [string, string][]).map(([cls, label]) => (
              <div key={label} className={`int-row ${cls}`}>
                <i className={`ph-bold ${cls === 'ok' ? 'ph-check-circle' : 'ph-warning'}`}/>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Segurança ────────────────────────────────────────────────────── */}
        <div className="config-card">
          <h3>Segurança</h3>
          <div className="toggle-list">
            {([
              ['Autenticação em 2 fatores',    true ],
              ['Log de auditoria',              true ],
              ['Timeout de sessão (30 min)',    true ],
              ['Alertas de acesso suspeito',    false],
            ] as [string, boolean][]).map(([lbl, chk]) => (
              <label key={lbl} className="toggle-item">
                <span>{lbl}</span>
                <input
                  type="checkbox"
                  defaultChecked={chk}
                  onChange={e => showToast(`"${lbl}" ${e.target.checked ? 'ativado' : 'desativado'}.`, 'info')}
                />
                <span className="tog-slider"/>
              </label>
            ))}
          </div>
        </div>

        {/* ── Metas Padrão ─────────────────────────────────────────────────── */}
        <div className="config-card">
          <h3>Metas Padrão</h3>
          <div className="cfg-form">
            <label>
              Meta mensal de vendas (unid.)
              <input type="number" value={metaVendas}  onChange={e => setMetaVendas(+e.target.value)}/>
            </label>
            <label>
              Meta de receita (R$)
              <input type="number" value={metaReceita} onChange={e => setMetaReceita(+e.target.value)}/>
            </label>
            <label>
              SLA máximo (horas)
              <input type="number" value={metaSla}     onChange={e => setMetaSla(+e.target.value)}/>
            </label>
            <label>
              NPS mínimo
              <input type="number" value={metaNps}     onChange={e => setMetaNps(+e.target.value)}/>
            </label>
          </div>
          <button
            className="btn-prim"
            onClick={() => showToast('Metas padrão atualizadas!', 'success')}
          >
            Salvar metas
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
                  Baixando...
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
