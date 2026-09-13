/**
 * @file avaliacao.screen.tsx
 * @module avaliacao
 * @description Tela de Avaliação — satisfação de clientes, com dados reais de
 * GET /api/avaliacoes e GET /api/avaliacoes/stats.
 *
 * Composição:
 * - Header
 * - KPI Grid: Nota Média e Total de Avaliações (únicos dois valores que a API
 *   realmente agrega — NPS, SLA médio e ranking de concessionárias saíram da
 *   tela porque não existe fonte de dado real pra eles)
 * - Grid de cards: cada card exibe avatar, nome, data, estrelas e trecho do
 *   texto — clique abre o modal de detalhe
 * - Modal de detalhe: texto completo, detalhes do atendimento e ações de
 *   editar/excluir (sem campo de "responder ao cliente" — o backend não tem
 *   onde persistir uma resposta)
 * - Modal de edição: formulário com nota, texto e detalhe
 * - ConfirmModal: confirmação de exclusão
 *
 * Props:
 * - showToast → feedback de cada operação
 */

import React, { useState } from 'react';
import { useAvaliacao } from './hooks/useAvaliacao';
import { useApp } from '../../shared/context/AppContext';
import { ConfirmModal } from '../../shared/components/Modal/ConfirmModal';
import { PaginationBar } from '../../shared/components/PaginationBar/PaginationBar';
import type { ToastType } from '../../shared/hooks/useToast';
import type { UpdateAvaliacaoInput } from './services/avaliacao.service';

interface Props { showToast: (m: string, t?: ToastType) => void; }

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export const AvaliacaoScreen: React.FC<Props> = ({ showToast }) => {
  const { user } = useApp();
  const canDelete = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const {
    avaliacoes, pagination, page, setPage, loading, error, stats,
    detailId, setDetailId, detail,
    editTarget, setEditTarget, salvarEdicao,
    deleteTarget, setDeleteTarget, confirmarExclusao,
  } = useAvaliacao();
  const [editForm, setEditForm] = useState<UpdateAvaliacaoInput>({});

  const kpis = [
    { ic: 'ic-gold', fa: 'ph-star', lbl: 'Nota Média', val: stats ? stats.notaMedia.toFixed(1) : '—' },
    { ic: 'ic-blue', fa: 'ph-chat-circle', lbl: 'Total de Avaliações', val: stats ? String(stats.total) : '—' },
  ];

  return (
    <section className="module active" id="mod-avaliacao">
      <div className="mod-header"><div><h1>Avaliação</h1><p className="mod-sub">Satisfação de clientes</p></div></div>

      <div className="kpi-grid" id="avalKpis">
        {kpis.map(k => (
          <div key={k.lbl} className="kpi-card">
            <div className={`kpi-ic ${k.ic}`}><i className={`ph-bold ${k.fa}`} /></div>
            <div className="kpi-body"><span className="kpi-lbl">{k.lbl}</span><span className="kpi-val">{k.val}</span></div>
          </div>
        ))}
      </div>

      {loading && <p className="mod-sub">Carregando avaliações...</p>}
      {error && <p className="mod-sub" style={{ color: 'var(--red)' }}>{error}</p>}
      {!loading && !error && avaliacoes.length === 0 && <p className="mod-sub">Nenhuma avaliação registrada.</p>}

      <div id="avalList" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14, marginTop: 16 }}>
        {avaliacoes.map(a => {
          const ini = a.c.split(' ').map(n => n[0]).slice(0, 2).join('');
          return (
            <div key={a.id} className="aval-card" onClick={() => setDetailId(a.id)} style={{ cursor: 'pointer' }}>
              <div className="aval-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><div className="cli-av">{ini}</div><div><div className="aval-name">{a.c}</div><div className="aval-date">{a.data}</div></div></div>
                <div className="aval-stars" style={{ color: '#f59e0b', fontSize: 16 }}>{stars(a.nota)}</div>
              </div>
              <div className="aval-txt">"{a.txt}"</div>
            </div>
          );
        })}
      </div>

      {pagination && (
        <PaginationBar
          page={page} totalPages={pagination.totalPages} total={pagination.total}
          hasPrev={pagination.hasPrev} hasNext={pagination.hasNext} onChange={setPage}
        />
      )}

      {detail && (
        <div className="modal-ov open" onClick={e => { if (e.target === e.currentTarget) setDetailId(null); }}>
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={() => setDetailId(null)}><i className="ph-bold ph-x" /></button>
            <div>
              <div className="aval-modal-header" style={{ paddingRight: 52 }}>
                <div className="aval-modal-av">{detail.c.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                <div className="aval-modal-info">
                  <div className="aval-modal-nome">{detail.c}</div>
                  <div className="aval-modal-data">{detail.data}</div>
                  <div style={{ marginTop: 5, fontSize: 15, letterSpacing: 2, color: '#f59e0b' }}>{stars(detail.nota)}</div>
                </div>
                <div className="aval-modal-nota"><div className="aval-modal-nota-num">{detail.nota}<span style={{ fontSize: 11, fontWeight: 400, opacity: .7 }}>/5</span></div></div>
              </div>
              <div className="aval-modal-body">
                <div className="aval-modal-quote">{detail.txt}</div>
                {detail.detalhe && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--c-dim)', marginBottom: 8 }}>Detalhes do atendimento</div>
                    <div className="aval-modal-meta">
                      {detail.detalhe.split('·').map(p => p.trim()).filter(Boolean).map((p, i) => {
                        const sep = p.indexOf(':');
                        const lbl = sep > -1 ? p.slice(0, sep).trim() : p;
                        const val = sep > -1 ? p.slice(sep + 1).trim() : '—';
                        return (<div key={i} className="aval-modal-row"><span className="aval-modal-lbl">{lbl}</span><span className="aval-modal-val">{val}</span></div>);
                      })}
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                  {canDelete && <button className="btn-danger-out" onClick={() => { setDeleteTarget(detail); setDetailId(null); }}><i className="ph-bold ph-trash" /> Excluir</button>}
                  <button className="btn-prim" onClick={() => { setEditForm({}); setEditTarget(detail); setDetailId(null); }}><i className="ph-bold ph-pencil-simple" /> Editar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="modal-ov open" onClick={e => { if (e.target === e.currentTarget) setEditTarget(null); }}>
          <div className="modal-box modal-sm">
            <button className="modal-x" onClick={() => setEditTarget(null)}><i className="ph-bold ph-x" /></button>
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 'var(--fs4)', fontWeight: 700, color: 'var(--c-text)', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--c-border)' }}>Editar Avaliação</h3>
              <div className="m-form">
                <label>Cliente<input type="text" defaultValue={editTarget.c} onChange={e => setEditForm(p => ({ ...p, cliente: e.target.value }))} /></label>
                <label>Nota<select defaultValue={editTarget.nota} onChange={e => setEditForm(p => ({ ...p, nota: Number(e.target.value) }))}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select></label>
                <label>Texto<textarea defaultValue={editTarget.txt} onChange={e => setEditForm(p => ({ ...p, texto: e.target.value }))} style={{ minHeight: 80, fontFamily: 'inherit', resize: 'vertical' }} /></label>
                <label>Detalhe<input type="text" defaultValue={editTarget.detalhe} onChange={e => setEditForm(p => ({ ...p, detalhe: e.target.value }))} /></label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn-sec" onClick={() => setEditTarget(null)}>Cancelar</button>
                <button className="btn-prim" onClick={() => salvarEdicao(editForm, showToast)}><i className="ph-bold ph-floppy-disk" /> Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        id="avalDeleteModal" isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => confirmarExclusao(showToast)}
        title="Excluir Avaliação"
        message={deleteTarget ? `Deseja excluir a avaliação de ${deleteTarget.c}? Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
      />
    </section>
  );
};
