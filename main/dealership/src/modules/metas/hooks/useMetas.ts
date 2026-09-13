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
 *
 * @param showToast → feedback de criação de meta
 */

import { useState, useCallback, useEffect } from 'react';
import { fetchMetas, createMeta } from '../services/metas.service';
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

  const getStatus = (m: Meta) => {
    const pct = m.lowerIsBetter ? (m.alvo / m.atual * 100) : (m.atual / m.alvo * 100);
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

  return { metas, pagination, page, setPage, loading, error, modalOpen, setModalOpen, getStatus, fmtVal, addMeta };
}
