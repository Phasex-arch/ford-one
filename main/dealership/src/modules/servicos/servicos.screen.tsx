/**
 * @file servicos.screen.tsx
 * @module servicos
 * @description Tela de Serviços — gestão de Ordens de Serviço da oficina.
 * Dados reais de GET /api/servicos?status=X, um por aba, com paginação.
 *
 * Composição:
 * - Header com botão Nova OS
 * - Barra de abas: Previstos (N) | Em Andamento (N) | Concluídos (N)
 * - Lista de OS: cards com num, cliente, veículo, tipo, técnico, prazo, valor e ações
 * - Modal de detalhe: informações completas + ações (editar, iniciar/concluir, excluir)
 * - Modal de edição: formulário pré-preenchido com os dados da OS
 * - Modal "Nova OS": formulário de criação com tipo, técnico e valor
 * - ConfirmModal: confirmação de exclusão com nome da OS
 *
 * Fluxo de status: Previsto → Em Andamento → Concluído (via botão "Iniciar"/"Concluir")
 * Excluir é restrito a ADMIN/GERENTE, espelhando a regra do backend.
 *
 * Props:
 * - showToast → feedback de criação, edição, movimentação e exclusão
 */

import React, { useState } from 'react';
import { useServicos, type OSTab } from './hooks/useServicos';
import { useApp } from '../../shared/context/AppContext';
import { formatCurrency } from '../../shared/utils/formatters';
import type { ToastType } from '../../shared/hooks/useToast';
import type { UpdateServicoInput } from './services/servicos.service';
import { ConfirmModal } from '../../shared/components/Modal/ConfirmModal';
import { PaginationBar } from '../../shared/components/PaginationBar/PaginationBar';

interface Props { showToast: (m: string, t?: ToastType) => void; }

const TABS: OSTab[] = ['previstos', 'andamento', 'concluidos'];
const TAB_LABELS = { previstos: 'Previstos', andamento: 'Em Andamento', concluidos: 'Concluídos' };
const STATUS_LABEL: Record<OSTab, string> = { previstos: 'Previsto', andamento: 'Em andamento', concluidos: 'Concluído' };
const BADGE_CLS: Record<OSTab, string> = { previstos: 'os-badge-previstos', andamento: 'os-badge-andamento', concluidos: 'os-badge-concluidos' };
const PRIORIDADE_LABEL: Record<'OK'|'RISCO'|'ATRASADO', string> = { OK: 'No prazo', RISCO: 'Em risco', ATRASADO: 'Atrasado' };

/** value de <input type="datetime-local"> ("2026-09-25T14:00") é sempre
 * hora local — sem timezone. new Date(iso) já converte pra local aqui, e
 * new Date(valorLocal).toISOString() faz o caminho de volta pra UTC, mesmo
 * padrão já usado no agendamento da Agenda. */
const isoParaInputLocal = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const ServicosScreen: React.FC<Props> = ({ showToast }) => {
  const { user } = useApp();
  const canDelete = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const {
    tab, setTab, list, pagination, page, setPage, loading, counts, tecnicos, clientes,
    detailIdx, setDetailIdx, editIdx, setEditIdx,
    deleteIdx, setDeleteIdx, novaOSOpen, setNovaOSOpen,
    moverOS, deletarOS, salvarEdicao, criarOS,
  } = useServicos(showToast);

  const [editForm, setEditForm] = useState<UpdateServicoInput>({});
  const [novaForm, setNovaForm] = useState<{ cId: string; v: string; t: string; tech: string; prazoData: string; valor: number }>(
    { cId: '', v: '', t: '', tech: '', prazoData: '', valor: 0 }
  );

  const detail = detailIdx !== null ? list[detailIdx] : null;
  const editItem = editIdx !== null ? list[editIdx] : null;
  const deleteItem = deleteIdx !== null ? list[deleteIdx] : null;

  return (
    <section className="module active" id="mod-servicos">
      <div className="mod-header">
        <div><h1>Serviços</h1><p className="mod-sub">Ordens de serviço e gestão da oficina</p></div>
        <div className="mod-actions">
          <button className="btn-prim" onClick={() => setNovaOSOpen(true)}><i className="ph-bold ph-plus" /> Nova OS</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--c-card)', borderRadius: 'var(--r)', padding: 6, border: '1px solid var(--c-border)', boxShadow: 'var(--sh0)', width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]} <span className="tab-ct">{counts[t]}</span>
          </button>
        ))}
      </div>

      <div id="servicosContent">
        {loading && <p className="mod-sub">Carregando ordens de serviço...</p>}
        {!loading && list.length === 0
          ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--c-dim)' }}>
              <i className="ph-bold ph-check-circle" style={{ fontSize: 36, marginBottom: 10, display: 'block', color: 'var(--green)' }} />
              <div style={{ fontWeight: 600 }}>Nenhuma OS nesta categoria</div>
            </div>
          : <div className="os-list">
              {list.map((s, i) => (
                <div key={s.id} className="os-card" onClick={() => setDetailIdx(i)} style={{ cursor: 'pointer' }}>
                  <div className="os-num">{s.num}</div>
                  <div style={{ minWidth: 0 }}><div className="os-cname">{s.c}</div><div className="os-cveh">{s.v}</div></div>
                  <div className="os-type">{s.t}</div>
                  <div className="os-tech"><i className="ph-bold ph-wrench" style={{ fontSize: 11, marginRight: 3 }} />{s.tech}</div>
                  <div className={`os-prazo ${s.pc}`}><i className="ph-bold ph-clock" style={{ fontSize: 11, marginRight: 3 }} />{s.prazo}</div>
                  <div className="os-val">{formatCurrency(s.val)}</div>
                  <div className="os-actions" onClick={e => e.stopPropagation()}>
                    {tab !== 'concluidos' && <button className="btn-tbl" onClick={() => setEditIdx(i)}>Editar</button>}
                    {canDelete && <button className="btn-tbl" style={{ color: 'var(--red)' }} onClick={() => setDeleteIdx(i)}>Excluir</button>}
                  </div>
                </div>
              ))}
            </div>
        }
        {pagination && (
          <PaginationBar page={page} totalPages={pagination.totalPages} total={pagination.total}
            hasPrev={pagination.hasPrev} hasNext={pagination.hasNext} onChange={setPage} />
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className={`modal-ov${detailIdx !== null ? ' open' : ''}`} id="osDetailModal" onClick={e => { if (e.target === e.currentTarget) setDetailIdx(null); }}>
          <div className="modal-box">
            <button className="modal-x" onClick={() => setDetailIdx(null)}><i className="ph-bold ph-x" /></button>
            <div>
              <div className="os-modal-header" style={{ paddingRight: 52 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="os-modal-num">Ordem de Serviço</div>
                  <div className="os-modal-title">{detail.num} — {detail.c}</div>
                  <span className={`os-badge-status ${BADGE_CLS[tab]}`}>{STATUS_LABEL[tab]}</span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 4 }}>
                  <div style={{ fontSize: 'var(--fs5)', fontWeight: 700, color: '#fff' }}>{formatCurrency(detail.val)}</div>
                  <div style={{ fontSize: 'var(--fs0)', marginTop: 2, color: 'rgba(255,255,255,.7)' }}><i className="ph-bold ph-clock" style={{ fontSize: 11, marginRight: 2 }} />{detail.prazo}</div>
                </div>
              </div>
              <div className="m-body">
                <div className="m-grid" style={{ marginBottom: 16 }}>
                  <div><div className="mf-lbl">Veículo</div><div className="mf-val">{detail.v}</div></div>
                  <div><div className="mf-lbl">Técnico</div><div className="mf-val">{detail.tech}</div></div>
                  <div><div className="mf-lbl">Tipo</div><div className="mf-val">{detail.t}</div></div>
                  <div><div className="mf-lbl">Prazo</div><div className="mf-val">{detail.prazo}</div></div>
                  <div><div className="mf-lbl">Prioridade</div><div className={`mf-val os-prazo ${detail.pc}`} style={{display:'inline-flex',width:'fit-content'}}>{PRIORIDADE_LABEL[detail.pc.toUpperCase() as 'OK'|'RISCO'|'ATRASADO']}</div></div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {tab !== 'concluidos' && <button className="btn-prim" onClick={() => { if (detailIdx !== null) setEditIdx(detailIdx); setDetailIdx(null); }}><i className="ph-bold ph-pencil-simple" /> Editar</button>}
                  {tab === 'previstos' && <button className="btn-sec" onClick={() => { if (detailIdx !== null) moverOS(detailIdx); setDetailIdx(null); }}><i className="ph-bold ph-arrow-right" /> Iniciar</button>}
                  {tab === 'andamento' && <button className="btn-sec" onClick={() => { if (detailIdx !== null) moverOS(detailIdx); setDetailIdx(null); }}><i className="ph-bold ph-check" /> Concluir OS</button>}
                  {canDelete && <button className="btn-danger-out" onClick={() => { if (detailIdx !== null) setDeleteIdx(detailIdx); setDetailIdx(null); }}><i className="ph-bold ph-trash" /> Excluir</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-ov open" id="osEditModal" onClick={e => { if (e.target === e.currentTarget) setEditIdx(null); }}>
          <div className="modal-box">
            <button className="modal-x" onClick={() => setEditIdx(null)}><i className="ph-bold ph-x" /></button>
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 'var(--fs4)', fontWeight: 700, color: 'var(--c-text)', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--c-border)' }}>Editar OS {editItem.num}</h3>
              <div className="m-form">
                <label>Cliente<input type="text" defaultValue={editItem.c} onChange={e => setEditForm(p => ({ ...p, cliente: e.target.value }))} /></label>
                <label>Veículo<input type="text" defaultValue={editItem.v} onChange={e => setEditForm(p => ({ ...p, veiculo: e.target.value }))} /></label>
                <label>Tipo<input type="text" defaultValue={editItem.t} onChange={e => setEditForm(p => ({ ...p, tipo: e.target.value }))} /></label>
                <label>Técnico<select defaultValue={editItem.tech} onChange={e => setEditForm(p => ({ ...p, tecnico: e.target.value }))}>
                  {tecnicos.map(t => <option key={t.id}>{t.nome}</option>)}
                </select></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label>Prazo<input type="datetime-local" defaultValue={isoParaInputLocal(editItem.prazoData)}
                    onChange={e => setEditForm(p => ({ ...p, prazoData: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} /></label>
                  <label>Valor (R$)<input type="number" defaultValue={editItem.val} onChange={e => setEditForm(p => ({ ...p, valor: Number(e.target.value) }))} /></label>
                </div>
                <label>Prioridade do prazo (calculada automaticamente)
                  <div className={`mf-val os-prazo ${editItem.pc}`} style={{ display: 'inline-flex', width: 'fit-content', marginTop: 4 }}>
                    {PRIORIDADE_LABEL[editItem.pc.toUpperCase() as 'OK'|'RISCO'|'ATRASADO']}
                  </div>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn-sec" onClick={() => setEditIdx(null)}>Cancelar</button>
                <button className="btn-prim" onClick={() => { if (editIdx !== null) salvarEdicao(editIdx, editForm); setEditForm({}); }}><i className="ph-bold ph-floppy-disk" /> Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nova OS Modal */}
      {novaOSOpen && (
        <div className="modal-ov open" id="novaOSModal" onClick={e => { if (e.target === e.currentTarget) setNovaOSOpen(false); }}>
          <div className="modal-box">
            <button className="modal-x" onClick={() => setNovaOSOpen(false)}><i className="ph-bold ph-x" /></button>
            <div style={{ padding: 22 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4, paddingBottom: 12, borderBottom: '1px solid var(--c-border)' }}>Nova Ordem de Serviço</h3>
              <div className="m-form" style={{ marginTop: 14 }}>
                <label>Cliente<select value={novaForm.cId} onChange={e => setNovaForm(p => ({ ...p, cId: e.target.value }))}>
                  <option value="">Selecione o cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select></label>
                <label>Veículo<input type="text" placeholder="Modelo, versão e ano" value={novaForm.v} onChange={e => setNovaForm(p => ({ ...p, v: e.target.value }))} /></label>
                <label>Tipo de serviço<select value={novaForm.t} onChange={e => setNovaForm(p => ({ ...p, t: e.target.value }))}>
                  <option value="">Selecione...</option>
                  <option>Revisão programada</option><option>Reparo mecânico</option>
                  <option>Funilaria e Pintura</option><option>Elétrica e Eletrônica</option>
                  <option>Suspensão e Freios</option><option>Troca de peças</option>
                  <option>Higienização</option><option>Outro</option>
                </select></label>
                <label>Técnico<select value={novaForm.tech} onChange={e => setNovaForm(p => ({ ...p, tech: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label>Prazo<input type="datetime-local" value={novaForm.prazoData} onChange={e => setNovaForm(p => ({ ...p, prazoData: e.target.value }))} /></label>
                  <label>Valor (R$)<input type="number" value={novaForm.valor} onChange={e => setNovaForm(p => ({ ...p, valor: Number(e.target.value) }))} /></label>
                </div>
                <p className="mod-sub" style={{ fontSize: 'var(--fs0)' }}>A prioridade (No prazo / Em risco / Atrasado) é calculada automaticamente a partir do prazo.</p>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn-sec" onClick={() => setNovaOSOpen(false)}>Cancelar</button>
                <button className="btn-prim" onClick={() => {
                  if (!novaForm.cId || !novaForm.v.trim() || !novaForm.t || !novaForm.prazoData) { showToast('Preencha cliente, veículo, tipo e prazo.', 'warning'); return; }
                  criarOS({
                    clienteId: novaForm.cId, veiculo: novaForm.v, tipo: novaForm.t,
                    tecnicoId: novaForm.tech || undefined, tecnico: novaForm.tech ? undefined : 'A designar',
                    prazoData: new Date(novaForm.prazoData).toISOString(), valor: novaForm.valor,
                  });
                  setNovaForm({ cId: '', v: '', t: '', tech: '', prazoData: '', valor: 0 });
                }}>Criar OS</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal id="osDeleteModal" isOpen={deleteIdx !== null}
        onClose={() => setDeleteIdx(null)}
        onConfirm={() => { if (deleteIdx !== null) deletarOS(deleteIdx); }}
        title={deleteItem ? `Excluir OS ${deleteItem.num}` : 'Excluir OS'}
        message={deleteItem ? `Deseja excluir a OS ${deleteItem.num} de ${deleteItem.c}? Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
      />
    </section>
  );
};
