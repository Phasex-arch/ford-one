/**
 * @file useMetas.ts
 * @module metas
 * @description Hook de estado e lógica do módulo de Metas.
 *
 * Gerencia:
 * - metas/pagination/loading/error: página real de GET /api/metas
 * - modalOpen: visibilidade do modal "Nova Meta"
 *
 * Funções auxiliares:
 * - getStatus(m) → determina status visual da meta (exceeded/on-track/at-risk/behind)
 *   baseado no percentual atingido, respeitando lowerIsBetter (ex: SLA)
 * - fmtVal(m, v) → formata o valor conforme o tipo de indicador
 *   (receita → moeda, % → sufixo, h → horas, demais → número)
 * - addMeta(tipo, resp, val, per) → valida e persiste via POST /api/metas
 * - editTarget/setEditTarget/salvarEdicao → edição real via PATCH /api/metas/:id,
 *   pra atualizar o "Realizado" (e demais campos) de uma meta já criada — sem
 *   isso o valor ficava congelado no que foi definido na criação
 *
 * @param showToast → feedback de criação/edição de meta
 */

import { useState, useCallback, useEffect } from 'react';
import { fetchMetas, createMeta, updateMeta, type UpdateMetaInput } from '../services/metas.service';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';
import type { Meta, MetaIndicador } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';
import { friendlyApiMessage, type PaginationMeta } from '../../../shared/api/client';

const PAGE_SIZE = 12;

const LABELS: Record<string, string> = { vendas: 'Vendas', receita: 'Receita', leads: 'Leads', nps: 'NPS', sla: 'SLA', conv: 'Conversão' };
const UNIDADES: Record<string, string> = { vendas: 'un.', receita: 'R$', leads: 'leads', nps: 'pts', sla: 'h', conv: '%' };

export function useMetas(showToast: (m: string, t?: ToastType) => void) {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Meta | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchMetas({ page, limit: PAGE_SIZE });
      setMetas(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(friendlyApiMessage(e));
      setMetas([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { reload(); }, [reload]);

  /**
   * Percentual de progresso, 0–100. Metas "lowerIsBetter" (ex: SLA) ainda sem
   * nenhuma medição real (atual=0) não têm progresso calculável — tratar
   * como "não iniciada" (0%) em vez de dividir por zero, que daria Infinity
   * e mostraria a meta como "atingida" sem nenhum dado real por trás.
   */
  const computePct = (m: Meta): number => {
    if (m.lowerIsBetter && m.atual === 0) return 0;
    const raw = m.lowerIsBetter ? (m.alvo / m.atual * 100) : (m.atual / m.alvo * 100);
    return Math.min(Math.round(raw), 100);
  };

  const getStatus = (m: Meta) => {
    const pct = computePct(m);
    if (pct >= 100) return { cls: 'exceeded', tag: 'tag-exceeded', label: 'Meta atingida' };
    if (pct >= 85) return { cls: 'on-track', tag: 'tag-on-track', label: 'No caminho' };
    if (pct >= 60) return { cls: 'at-risk', tag: 'tag-at-risk', label: 'Em risco' };
    return { cls: 'behind', tag: 'tag-behind', label: 'Abaixo' };
  };

  const fmtVal = (m: Meta, v: number) => {
    if (m.indicador === 'receita') return formatCurrency(v);
    if (m.unidade === '%') return v + '%';
    if (m.unidade === 'h') return v + 'h';
    return formatNumber(v) + ' ' + m.unidade;
  };

  const addMeta = useCallback((tipo: MetaIndicador, resp: string, val: number, per: string) => {
    if (!resp || !val || !per) { showToast('Preencha todos os campos.', 'warning'); return; }
    createMeta({
      codigo: 'M' + Date.now().toString().slice(-8),
      titulo: LABELS[tipo] || tipo,
      periodo: per,
      indicador: tipo,
      atual: 0,
      alvo: val,
      unidade: UNIDADES[tipo] || '',
      responsavel: resp,
      lowerIsBetter: tipo === 'sla',
    }).then(() => {
      setModalOpen(false);
      setPage(1);
      reload();
      showToast('Meta criada!', 'success');
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  }, [showToast, reload]);

  const salvarEdicao = useCallback((dados: UpdateMetaInput) => {
    if (!editTarget) return;
    updateMeta(editTarget.id, dados).then(() => {
      setEditTarget(null);
      reload();
      showToast('Meta atualizada!', 'success');
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  }, [editTarget, showToast, reload]);

  return {
    metas, pagination, page, setPage, loading, error, modalOpen, setModalOpen,
    editTarget, setEditTarget, salvarEdicao,
    getStatus, computePct, fmtVal, addMeta,
  };
}
