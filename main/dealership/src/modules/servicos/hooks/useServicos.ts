/**
 * @file useServicos.ts
 * @module servicos
 * @description Hook de estado e lógica do módulo de Serviços (Ordens de Serviço).
 *
 * Gerencia:
 * - tab: aba ativa ('previstos' | 'andamento' | 'concluidos') — cada aba é
 *   uma página real filtrada por status no backend (GET /api/servicos?status=X)
 * - list/pagination/loading/error: página atual da aba ativa
 * - tecnicos: lista real de GET /api/tecnicos, usada nos formulários
 * - detailIdx/editIdx/deleteIdx/novaOSOpen: modais
 *
 * Operações (todas via API real, recarregando a página após sucesso):
 * - moverOS(idx)         → PATCH status pra próxima etapa do fluxo
 * - deletarOS(idx)       → DELETE
 * - salvarEdicao(idx, d) → PATCH com os campos editados
 * - criarOS(dados)       → POST em previstos
 *
 * @param showToast → callback para feedback de cada operação
 */

import { useState, useCallback, useEffect } from 'react';
import {
  fetchServicos, createServico, updateServico, deleteServico, nextStatus,
  type CreateServicoInput, type UpdateServicoInput,
} from '../services/servicos.service';
import { fetchTecnicos } from '../services/tecnico.service';
import { fetchClientes } from '../../clientes/services/clientes.service';
import type { OrdemServico, Tecnico, Cliente } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';
import { friendlyApiMessage, type PaginationMeta } from '../../../shared/api/client';

export type OSTab = 'previstos' | 'andamento' | 'concluidos';

const PAGE_SIZE = 20;

export function useServicos(showToast: (m: string, t?: ToastType) => void) {
  const [tab, setTabState] = useState<OSTab>('previstos');
  const [page, setPage] = useState(1);
  const [list, setList] = useState<OrdemServico[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [counts, setCounts] = useState<Record<OSTab, number>>({ previstos: 0, andamento: 0, concluidos: 0 });
  const [loading, setLoading] = useState(true);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [novaOSOpen, setNovaOSOpen] = useState(false);

  const setTab = useCallback((t: OSTab) => { setTabState(t); setPage(1); }, []);

  const reload = useCallback(() => {
    setLoading(true);
    fetchServicos({ tab, page, limit: PAGE_SIZE })
      .then(res => {
        setList(res.data);
        setPagination(res.pagination);
        setCounts(p => ({ ...p, [tab]: res.pagination.total }));
      })
      .catch(e => showToast(friendlyApiMessage(e), 'warning'))
      .finally(() => setLoading(false));
  }, [tab, page, showToast]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { fetchTecnicos().then(setTecnicos).catch(() => setTecnicos([])); }, []);
  useEffect(() => { fetchClientes({ page: 1, limit: 100 }).then(res => setClientes(res.data)).catch(() => setClientes([])); }, []);
  // Mantém as contagens das outras abas atualizadas pra exibir nos botões de aba.
  useEffect(() => {
    (['previstos', 'andamento', 'concluidos'] as OSTab[])
      .filter(t => t !== tab)
      .forEach(t => fetchServicos({ tab: t, page: 1, limit: 1 })
        .then(res => setCounts(p => ({ ...p, [t]: res.pagination.total })))
        .catch(() => {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  const moverOS = useCallback((idx: number) => {
    const s = list[idx]; if (!s) return;
    const dest = nextStatus(tab);
    if (!dest) return;
    updateServico(s.id, { status: dest }).then(() => {
      showToast(`OS ${s.num} movida!`, 'success');
      reload();
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  }, [list, tab, showToast, reload]);

  const deletarOS = useCallback((idx: number) => {
    const s = list[idx]; if (!s) return;
    deleteServico(s.id).then(() => {
      setDeleteIdx(null);
      showToast(`OS ${s.num} excluída.`, 'info');
      reload();
    }).catch(e => { setDeleteIdx(null); showToast(friendlyApiMessage(e), 'warning'); });
  }, [list, showToast, reload]);

  const salvarEdicao = useCallback((idx: number, data: UpdateServicoInput) => {
    const s = list[idx]; if (!s) return;
    updateServico(s.id, data).then(() => {
      setEditIdx(null);
      showToast('OS atualizada!', 'success');
      reload();
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  }, [list, showToast, reload]);

  const criarOS = useCallback((dados: CreateServicoInput) => {
    createServico(dados).then(novo => {
      setNovaOSOpen(false);
      showToast(`OS ${novo.num} criada!`, 'success');
      if (tab === 'previstos') reload();
      else setCounts(p => ({ ...p, previstos: p.previstos + 1 }));
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  }, [tab, showToast, reload]);

  return {
    tab, setTab, list, pagination, page, setPage, loading, counts, tecnicos, clientes,
    detailIdx, setDetailIdx, editIdx, setEditIdx,
    deleteIdx, setDeleteIdx, novaOSOpen, setNovaOSOpen,
    moverOS, deletarOS, salvarEdicao, criarOS,
  };
}
