/**
 * @file useAvaliacao.ts
 * @module avaliacao
 * @description Hook de estado e lógica da tela de Avaliação.
 *
 * Gerencia:
 * - avaliacoes/pagination/loading/error: página atual real, buscada de
 *   GET /api/avaliacoes
 * - stats: nota média e total, de GET /api/avaliacoes/stats
 * - detailId/editTarget/deleteTarget: itens com modal aberto
 * - salvarEdicao/confirmarExclusao: chamam PATCH/DELETE reais e recarregam a página
 */

import { useState, useCallback, useEffect } from 'react';
import type { Avaliacao } from '../../../types/global.types';
import { friendlyApiMessage, type PaginationMeta } from '../../../shared/api/client';
import {
  fetchAvaliacoes,
  fetchAvaliacaoStats,
  updateAvaliacao,
  deleteAvaliacao,
  moderarAvaliacao,
  type AvaliacaoStats,
  type UpdateAvaliacaoInput,
} from '../services/avaliacao.service';

const PAGE_SIZE = 12;

export function useAvaliacao() {
  const [page, setPage] = useState(1);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<AvaliacaoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Avaliacao | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Avaliacao | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAvaliacoes({ page, limit: PAGE_SIZE });
      setAvaliacoes(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(friendlyApiMessage(e));
      setAvaliacoes([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { fetchAvaliacaoStats().then(setStats).catch(() => setStats(null)); }, [avaliacoes]);

  const detail = detailId ? avaliacoes.find(a => a.id === detailId) ?? null : null;

  const salvarEdicao = useCallback(
    (dados: UpdateAvaliacaoInput, showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!editTarget) return;
      updateAvaliacao(editTarget.id, dados).then(() => {
        setEditTarget(null);
        reload();
        showToast('Avaliação atualizada!', 'success');
      }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
    },
    [editTarget, reload],
  );

  const confirmarExclusao = useCallback(
    (showToast: (m: string, t?: 'success' | 'warning' | 'info') => void) => {
      if (!deleteTarget) return;
      deleteAvaliacao(deleteTarget.id).then(() => {
        setDeleteTarget(null);
        setDetailId(null);
        reload();
        showToast('Avaliação removida.', 'info');
      }).catch(e => {
        setDeleteTarget(null);
        showToast(friendlyApiMessage(e), 'warning');
      });
    },
    [deleteTarget, reload],
  );

  const moderar = useCallback(
    (id: string, status: 'aprovada' | 'rejeitada', showToast: (m: string, t?: 'success' | 'warning') => void) => {
      moderarAvaliacao(id, status).then(() => {
        setDetailId(null);
        reload();
        showToast(status === 'aprovada' ? 'Avaliação aprovada — já aparece publicamente.' : 'Avaliação rejeitada.', 'success');
      }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
    },
    [reload],
  );

  // Pendentes primeiro (é o que precisa de ação), depois aprovadas, com
  // rejeitadas recolhidas — mesmo padrão de seções já usado em Financiamentos.
  const pendentes = avaliacoes.filter(a => a.status === 'pendente');
  const aprovadas = avaliacoes.filter(a => a.status === 'aprovada');
  const rejeitadas = avaliacoes.filter(a => a.status === 'rejeitada');

  return {
    avaliacoes, pagination, page, setPage, loading, error, stats,
    detailId, setDetailId, detail,
    editTarget, setEditTarget, salvarEdicao,
    deleteTarget, setDeleteTarget, confirmarExclusao,
    moderar, pendentes, aprovadas, rejeitadas,
  };
}
