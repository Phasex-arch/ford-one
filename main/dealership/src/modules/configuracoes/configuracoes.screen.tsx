/**
 * @file configuracoes.screen.tsx
 * @module configuracoes
 * @description Tela de Configurações do sistema Ford One, organizada em 4 abas
 * (agrupadas por tema pra não deixar aba nenhuma com pouco conteúdo/muito
 * espaço vazio).
 *
 * Abas:
 * 1. Concessionária  → real, GET/PATCH /api/configuracoes/concessionaria
 *    (singleton — sempre existe uma linha, criada com valores padrão na
 *    primeira leitura). Edição restrita a ADMIN/GERENTE, espelhando o backend.
 *    Traz um preview de identidade (nome/endereço/telefone + data da última
 *    atualização real) acima do formulário.
 * 2. Equipe          → gestão de acesso de colaboradores (ver hooks/useColaboradores.ts).
 *    Só aparece pra ADMIN/GERENTE. Chips de estatística (total/ativos/admins)
 *    calculados a partir da própria lista carregada.
 * 3. Metas           → mini-resumo real (quantas metas batidas vs. em
 *    progresso, GET /api/metas) + atalho pra tela de Metas completa.
 * 4. Sistema         → junta 3 seções que sozinhas eram curtas demais pra
 *    ter aba própria:
 *    - Aparência: seletor tema claro/escuro (persiste em localStorage) — real
 *    - Segurança: status real (log de auditoria sempre ativo — é um
 *      interceptor global, não uma opção — e expiração de sessão real via
 *      JWT_EXPIRES_IN) + últimas atividades reais do log de auditoria
 *      (GET /api/audit-log, somente ADMIN). Não existe 2FA nem "alertas de
 *      acesso suspeito" no sistema — removidos, não fingidos.
 *    - Documentação: baixa o PDF só se ele realmente existir no servidor
 *      (checagem HEAD antes) — antes sempre mostrava "sucesso" mesmo com o
 *      arquivo ausente.
 *
 * A seção "Integração Ford Smart Ecosystem" (CRM, Financeira, Parts, Analytics)
 * foi removida — eram nomes de integração inventados, sem nenhuma correspondência
 * real no sistema.
 *
 * Troca de aba anima (fade + leve subida) via CSS puro: como cada painel é
 * montado/desmontado por renderização condicional, a keyframe em
 * .config-panel-anim (styles/base/_globals.scss) reinicia sozinha a cada
 * troca, sem precisar de estado extra em JS.
 *
 * Props:
 * - showToast → feedback de salvamento de dados e alteração de tema
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/hooks/useTheme';
import { useConfiguracoes } from './hooks/useConfiguracoes';
import { useColaboradores } from './hooks/useColaboradores';
import { ColaboradorModal } from './components/ColaboradorModal/ColaboradorModal';
import { ConfirmModal } from '../../shared/components/Modal/ConfirmModal';
import { useApp } from '../../shared/context/AppContext';
import { friendlyApiMessage } from '../../shared/api/client';
import { fetchMetas } from '../metas/services/metas.service';
import type { Meta } from '../../types/global.types';
import type { ToastType } from '../../shared/hooks/useToast';
import type { UpdateConcessionariaInput } from './services/configuracoes.service';
import type { ColaboradorRole } from './services/colaboradores.service';

interface Props { showToast: (m: string, t?: ToastType) => void; }

const PDF_URL = '/assets/document/ford-one-concessionaria.pdf';

const ROLE_LABEL: Record<ColaboradorRole, string> = {
  ADMIN: 'Administrador', GERENTE: 'Gerente', FUNCIONARIO: 'Funcionário',
};
const ROLE_PILL: Record<ColaboradorRole, string> = {
  ADMIN: 'role-admin', GERENTE: 'role-gerente', FUNCIONARIO: 'role-func',
};

const metaAtingida = (m: Meta): boolean => (m.lowerIsBetter ? m.atual <= m.alvo : m.atual >= m.alvo);

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

type ConfigTab = 'concessionaria' | 'equipe' | 'metas' | 'sistema';

export const ConfiguracoesScreen: React.FC<Props> = ({ showToast }) => {
  const { theme, setTheme } = useTheme();
  const { user, navigate } = useApp();
  const canEditarConcessionaria = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const canVerEquipe = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const canCriarOuDesativar = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<ConfigTab>('concessionaria');
  const { concessionaria, seguranca, auditLog, loading, error, salvando, salvarConcessionaria } = useConfiguracoes(showToast);
  const [form, setForm] = useState<UpdateConcessionariaInput>({});

  const {
    colaboradores, loading: loadingEquipe, modalOpen: colabModalOpen, setModalOpen: setColabModalOpen,
    editing: editingColaborador, setEditing: setEditingColaborador,
    salvarNovo: salvarNovoColaborador, salvarEdicao: salvarEdicaoColaborador,
    deactivateTarget, setDeactivateTarget, confirmarDesativacao, reativar,
  } = useColaboradores(canVerEquipe);

  useEffect(() => {
    if (concessionaria) setForm({
      nome: concessionaria.nome, cnpj: concessionaria.cnpj,
      endereco: concessionaria.endereco, telefone: concessionaria.telefone,
    });
  }, [concessionaria]);

  // Mini-resumo real de Metas (só carrega os dados, sem duplicar a tela de Metas).
  const [metas, setMetas] = useState<Meta[] | null>(null);
  useEffect(() => {
    fetchMetas({ page: 1, limit: 10 })
      .then(res => setMetas(res.data))
      .catch(e => { showToast(friendlyApiMessage(e), 'warning'); setMetas([]); });
  }, [showToast]);

  const [baixando, setBaixando] = useState(false);

  const baixarDocumentacao = async () => {
    setBaixando(true);
    try {
      const res = await fetch(PDF_URL, { method: 'HEAD' });
      // O nginx do container serve qualquer rota desconhecida com o index.html
      // do app (fallback de SPA) e devolve 200 — então `res.ok` sozinho não
      // basta pra saber se o PDF existe de verdade. Content-Type é o sinal real.
      if (!res.ok || !(res.headers.get('content-type') ?? '').includes('pdf')) {
        throw new Error('not-found');
      }
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

  const totalColaboradores = colaboradores.length;
  const ativosColaboradores = colaboradores.filter(c => c.ativo).length;
  const adminsColaboradores = colaboradores.filter(c => c.role === 'ADMIN').length;

  const metasAtingidas = metas?.filter(metaAtingida).length ?? 0;
  const metasEmProgresso = (metas?.length ?? 0) - metasAtingidas;

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

      <div className="cfg-tabs">
        <div className={`cfg-tab${activeTab === 'concessionaria' ? ' active' : ''}`} onClick={() => setActiveTab('concessionaria')}>
          <i className="ph-bold ph-buildings" /> Concessionária
        </div>
        {canVerEquipe && (
          <div className={`cfg-tab${activeTab === 'equipe' ? ' active' : ''}`} onClick={() => setActiveTab('equipe')}>
            <i className="ph-bold ph-users" /> Equipe
            {canCriarOuDesativar && <span className="cfg-tab-dot" title="Você pode gerenciar acessos" />}
          </div>
        )}
        <div className={`cfg-tab${activeTab === 'metas' ? ' active' : ''}`} onClick={() => setActiveTab('metas')}>
          <i className="ph-bold ph-target" /> Metas
        </div>
        <div className={`cfg-tab${activeTab === 'sistema' ? ' active' : ''}`} onClick={() => setActiveTab('sistema')}>
          <i className="ph-bold ph-sliders" /> Sistema
        </div>
      </div>

      {/* ── Concessionária ───────────────────────────────────────────────── */}
      {activeTab === 'concessionaria' && (
        <div className="config-panel config-panel-anim">
          <div className="panel-head">
            <div className="panel-head-icon"><i className="ph-bold ph-buildings" /></div>
            <div>
              <h3>Dados da Concessionária</h3>
              <p>Informações exibidas no cabeçalho do sistema e nas telas públicas</p>
            </div>
          </div>
          {concessionaria && (
            <>
              <div className="settings-row">
                <div className="settings-row-label">
                  <h4>Identidade</h4>
                  <p>Como a concessionária aparece no sistema</p>
                </div>
                <div className="settings-row-control">
                  <div className="cfg-identity">
                    <div className="cfg-identity-icon"><i className="ph-bold ph-storefront" /></div>
                    <div>
                      <div className="cfg-identity-name">{concessionaria.nome || 'Concessionária'}</div>
                      <div className="cfg-identity-meta">{concessionaria.endereco || 'Endereço não informado'} · {concessionaria.telefone || 'Telefone não informado'}</div>
                      <div className="cfg-identity-updated">Atualizado em {formatDateTime(concessionaria.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="settings-row">
                <div className="settings-row-label">
                  <h4>Dados cadastrais</h4>
                  <p>Nome, CNPJ, endereço e telefone exibidos publicamente</p>
                </div>
                <div className="settings-row-control">
                  <div className="cfg-form">
                    <div className="m-grid">
                      <label>Nome<input type="text" value={form.nome ?? ''} disabled={!canEditarConcessionaria}
                        onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}/></label>
                      <label>CNPJ<input type="text" value={form.cnpj ?? ''} disabled={!canEditarConcessionaria}
                        onChange={e => setForm(p => ({ ...p, cnpj: e.target.value }))}/></label>
                    </div>
                    <div className="m-grid">
                      <label>Endereço<input type="text" value={form.endereco ?? ''} disabled={!canEditarConcessionaria}
                        onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))}/></label>
                      <label>Telefone<input type="text" value={form.telefone ?? ''} disabled={!canEditarConcessionaria}
                        onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}/></label>
                    </div>
                  </div>
                  {canEditarConcessionaria ? (
                    <button className="btn-prim" style={{ alignSelf: 'flex-start' }} disabled={salvando} onClick={() => salvarConcessionaria(form)}>
                      {salvando ? 'Salvando...' : 'Salvar dados'}
                    </button>
                  ) : (
                    <p className="cfg-desc" style={{ margin: 0 }}>Só ADMIN ou GERENTE podem editar os dados da concessionária.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Equipe (acesso de colaboradores — somente ADMIN/GERENTE veem) ── */}
      {activeTab === 'equipe' && canVerEquipe && (
        <div className="config-panel config-panel-anim">
          <div className="config-card-head">
            <div className="panel-head" style={{ margin: 0, padding: 0, border: 'none' }}>
              <div className="panel-head-icon"><i className="ph-bold ph-users" /></div>
              <div>
                <h3>Equipe</h3>
                <p>Quem tem acesso ao painel Ford One</p>
              </div>
            </div>
            {canCriarOuDesativar && (
              <button className="btn-prim" onClick={() => setColabModalOpen(true)}>
                <i className="ph-bold ph-plus" /> Novo colaborador
              </button>
            )}
          </div>

          {loadingEquipe ? (
            <p className="cfg-desc">Carregando equipe...</p>
          ) : (
            <>
              <div className="settings-row">
                <div className="settings-row-label">
                  <h4>Visão geral</h4>
                  <p>{canCriarOuDesativar ? 'Apenas administradores podem criar ou desativar acessos.' : 'Distribuição de acessos por papel e status'}</p>
                </div>
                <div className="settings-row-control">
                  <div className="cfg-stat-row">
                    <div className="cfg-stat accent-navy">
                      <div className="cfg-stat-icon"><i className="ph-bold ph-users" /></div>
                      <div><div className="cfg-stat-num">{totalColaboradores}</div><div className="cfg-stat-label">No total</div></div>
                    </div>
                    <div className="cfg-stat accent-green">
                      <div className="cfg-stat-icon"><i className="ph-bold ph-check-circle" /></div>
                      <div><div className="cfg-stat-num">{ativosColaboradores}</div><div className="cfg-stat-label">Ativos</div></div>
                    </div>
                    <div className="cfg-stat accent-purple">
                      <div className="cfg-stat-icon"><i className="ph-bold ph-shield-star" /></div>
                      <div><div className="cfg-stat-num">{adminsColaboradores}</div><div className="cfg-stat-label">Administradores</div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="team-list settings-full">
                {colaboradores.map(c => (
                  <div key={c.id} className={`team-card${c.ativo ? '' : ' inativo'}`}>
                    <div className="cli-av">{c.nome.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}</div>
                    <div>
                      <div className="team-name">{c.nome}</div>
                      <div className="team-role">{c.cargo} · {c.registro}</div>
                    </div>
                    <div className="team-meta">
                      <span className="team-email">{c.email}</span>
                      <span className={`pill ${ROLE_PILL[c.role]}`}>{ROLE_LABEL[c.role]}</span>
                      <span className={`pill ${c.ativo ? 'ativo' : 'inativo'}`}>{c.ativo ? 'Ativo' : 'Inativo'}</span>
                      {(canCriarOuDesativar || user?.role === 'GERENTE') && (
                        <button className="icon-btn" title="Editar colaborador" onClick={() => setEditingColaborador(c)}>
                          <i className="ph-bold ph-pencil-simple" />
                        </button>
                      )}
                      {canCriarOuDesativar && (
                        c.ativo ? (
                          <button className="icon-btn" title="Desativar acesso" onClick={() => setDeactivateTarget(c)}>
                            <i className="ph-bold ph-power" />
                          </button>
                        ) : (
                          <button className="icon-btn" title="Reativar acesso" onClick={() => reativar(c, showToast)}>
                            <i className="ph-bold ph-arrow-clockwise" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Metas ────────────────────────────────────────────────────────── */}
      {activeTab === 'metas' && (
        <div className="config-panel config-panel-anim">
          <div className="panel-head">
            <div className="panel-head-icon"><i className="ph-bold ph-target" /></div>
            <div>
              <h3>Metas</h3>
              <p>As metas da concessionária são gerenciadas na tela de Metas</p>
            </div>
          </div>
          {metas === null ? (
            <p className="cfg-desc">Carregando metas...</p>
          ) : metas.length === 0 ? (
            <p className="cfg-desc">Nenhuma meta cadastrada ainda.</p>
          ) : (
            <>
              <div className="settings-row">
                <div className="settings-row-label">
                  <h4>Progresso do mês</h4>
                  <p>Quantas metas foram batidas até agora</p>
                </div>
                <div className="settings-row-control">
                  <div className="cfg-stat-row">
                    <div className="cfg-stat accent-green">
                      <div className="cfg-stat-icon"><i className="ph-bold ph-trophy" /></div>
                      <div><div className="cfg-stat-num">{metasAtingidas}</div><div className="cfg-stat-label">Atingidas</div></div>
                    </div>
                    <div className="cfg-stat accent-gold">
                      <div className="cfg-stat-icon"><i className="ph-bold ph-hourglass-medium" /></div>
                      <div><div className="cfg-stat-num">{metasEmProgresso}</div><div className="cfg-stat-label">Em progresso</div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="settings-full">
                {metas.slice(0, 5).map(m => (
                  <div key={m.id} className="cfg-meta-row">
                    <span className="cfg-meta-title">{m.titulo}</span>
                    <span className={`cfg-meta-progress ${metaAtingida(m) ? 'hit' : 'miss'}`}>
                      <i className={`ph-bold ${metaAtingida(m) ? 'ph-check-circle' : 'ph-arrow-up-right'}`} /> {metaAtingida(m) ? 'Atingida' : 'Em progresso'}
                    </span>
                  </div>
                ))}
                <button className="btn-sec" style={{ marginTop: 14 }} onClick={() => navigate('metas')}>
                  <i className="ph-bold ph-arrow-square-out"/> Ver todas as metas
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Sistema (Aparência + Segurança + Documentação) ──────────────── */}
      {activeTab === 'sistema' && (
        <div className="config-panel config-panel-anim">
          <div className="panel-head">
            <div className="panel-head-icon"><i className="ph-bold ph-sliders" /></div>
            <div>
              <h3>Sistema</h3>
              <p>Aparência, segurança e documentação técnica</p>
            </div>
          </div>

          {/* Aparência */}
          <div className="settings-row">
            <div className="settings-row-label">
              <h4>Aparência</h4>
              <p>Modo padrão: Claro. Alterne para Escuro para reduzir o cansaço visual em ambientes com pouca luz.</p>
            </div>
            <div className="settings-row-control">
              <div className="theme-opts">
                <button
                  className={`theme-btn${theme === 'light' ? ' active' : ''}`}
                  id="themeLight"
                  onClick={() => { setTheme('light'); showToast('Tema claro ativado.', 'success'); }}
                >
                  {theme === 'light' && <span className="theme-badge">Ativo</span>}
                  <div className="theme-preview lp">
                    <div className="tp-bar"><div className="tp-dot"/><div className="tp-dot"/><div className="tp-dot"/></div>
                    <div className="tp-row">
                      <div className="tp-side"><div className="tp-side-bar"/><div className="tp-side-bar"/><div className="tp-side-bar short"/></div>
                      <div className="tp-main"><div className="tp-c"/><div className="tp-c"/><div className="tp-c wide"/></div>
                    </div>
                  </div>
                  <span className="theme-name">Claro</span>
                  <span className="theme-desc">Fundo claro, ideal para ambientes bem iluminados</span>
                </button>
                <button
                  className={`theme-btn${theme === 'dark' ? ' active' : ''}`}
                  id="themeDark"
                  onClick={() => { setTheme('dark'); showToast('Tema escuro ativado.', 'success'); }}
                >
                  {theme === 'dark' && <span className="theme-badge">Ativo</span>}
                  <div className="theme-preview dp">
                    <div className="tp-bar"><div className="tp-dot"/><div className="tp-dot"/><div className="tp-dot"/></div>
                    <div className="tp-row">
                      <div className="tp-side"><div className="tp-side-bar"/><div className="tp-side-bar"/><div className="tp-side-bar short"/></div>
                      <div className="tp-main"><div className="tp-c"/><div className="tp-c"/><div className="tp-c wide"/></div>
                    </div>
                  </div>
                  <span className="theme-name">Escuro</span>
                  <span className="theme-desc">Fundo escuro, reduz o cansaço visual à noite</span>
                </button>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="settings-row">
            <div className="settings-row-label">
              <h4>Segurança</h4>
              <p>Status real dos mecanismos de proteção. Não existe 2FA no sistema ainda.</p>
            </div>
            <div className="settings-row-control">
              {seguranca && (
                <div className="cfg-stat-row">
                  <div className="cfg-stat accent-green">
                    <div className="cfg-stat-icon"><i className="ph-bold ph-check-circle" /></div>
                    <div><div className="cfg-stat-num" style={{ fontSize: 13 }}>Sempre ativo</div><div className="cfg-stat-label">Log de auditoria</div></div>
                  </div>
                  <div className="cfg-stat accent-navy">
                    <div className="cfg-stat-icon"><i className="ph-bold ph-clock" /></div>
                    <div><div className="cfg-stat-num" style={{ fontSize: 13 }}>{seguranca.jwtExpiresIn}</div><div className="cfg-stat-label">Sessão expira</div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {auditLog && (
            <div className="settings-full">
              <div className="m-sec-title" style={{ marginTop: 0 }}>Atividade recente</div>
              {auditLog.length === 0 ? (
                <p className="cfg-desc">Nenhuma atividade registrada ainda.</p>
              ) : (
                <div className="audit-list">
                  {auditLog.map(entry => (
                    <div key={entry.id} className="audit-row">
                      <span className={`audit-dot${(entry.statusCode ?? 200) >= 400 ? ' warn' : ' ok'}`} />
                      <span className="audit-action">{entry.action}</span>
                      <span className="cfg-desc" style={{ margin: 0 }}>{entry.resource}</span>
                      <span className="audit-meta">{entry.userEmail ?? 'sistema'} · {formatDateTime(entry.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documentação */}
          <div className="settings-row">
            <div className="settings-row-label">
              <h4>Documentação</h4>
              <p>Arquitetura, módulos, fluxos e decisões de desenvolvimento em PDF.</p>
            </div>
            <div className="settings-row-control">
              <div className="doc-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div className="doc-icon"><i className="ph-bold ph-file-pdf" /></div>
                  <div>
                    <div className="doc-name">ford-one-concessionaria.pdf</div>
                    <div className="doc-meta">Documentação técnica completa · Ford One v3.2 · 2026</div>
                  </div>
                </div>
                <button className="btn-prim" onClick={baixarDocumentacao} disabled={baixando} style={{ width: '100%', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: baixando ? 0.8 : 1 }}>
                  {baixando ? (
                    <><span className="doc-spinner" />Verificando...</>
                  ) : (
                    <><i className="ph-bold ph-download-simple"/>Baixar PDF</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <ColaboradorModal
        isOpen={colabModalOpen || !!editingColaborador}
        colaborador={editingColaborador}
        onClose={() => { setColabModalOpen(false); setEditingColaborador(null); }}
        onSave={dados => {
          if (editingColaborador) {
            salvarEdicaoColaborador({
              nome: dados.nome, telefone: dados.telefone, email: dados.email,
              endereco: dados.endereco, cargo: dados.cargo, role: dados.role,
              ...(dados.senha ? { senha: dados.senha } : {}),
            }, showToast);
          } else {
            salvarNovoColaborador({
              nome: dados.nome, cpf: dados.cpf, telefone: dados.telefone, email: dados.email,
              endereco: dados.endereco, registro: dados.registro, cargo: dados.cargo,
              role: dados.role, senha: dados.senha, ativo: true,
            }, showToast);
          }
        }}
      />
      <ConfirmModal
        id="colaboradorDeactivateModal"
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => confirmarDesativacao(showToast)}
        title={`Desativar acesso de ${deactivateTarget?.nome ?? ''}`}
        message="A pessoa não conseguirá mais entrar no painel até que o acesso seja reativado."
        confirmLabel="Desativar"
      />
    </section>
  );
};
