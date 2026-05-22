/**
 * @file useServicos.ts
 * @module servicos
 * @description Hook de estado e logica do modulo de Servicos (Ordens de Servico).
 *
 * Substitui o antigo store mutavel em memoria por chamadas reais para
 * /api/v1/servicos. Mantem um pequeno store local com as tres abas para
 * preservar a API publica consumida pela ServicosScreen (`store[tab].length`,
 * `list = store[tab]`, indices em moverOS/deletarOS/salvarEdicao/criarOS).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  atualizarServico,
  criarServico,
  fetchAll,
  moverServico,
  removerServico,
  type ServicoLocal,
  type ServicoStoreLocal,
  type ServicoTabKey,
} from '../services/servicos.service';
import { tecnicosStore, useStore } from '../../../shared/api/cache';
import { extractErrorMessage } from '../../../shared/api/http';
import type { OrdemServico } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';

export type OSTab = ServicoTabKey;

const EMPTY_STORE: ServicoStoreLocal = { previstos: [], andamento: [], concluidos: [] };

export function useServicos(showToast: (m: string, t?: ToastType) => void) {
  const [tab, setTab] = useState<OSTab>('previstos');
  const [store, setStore] = useState<ServicoStoreLocal>(EMPTY_STORE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [novaOSOpen, setNovaOSOpen] = useState(false);

  const TECNICOS = useStore(tecnicosStore);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await fetchAll();
      setStore(snapshot);
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao carregar OS.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const list = useMemo<OrdemServico[]>(() => store[tab], [store, tab]);

  const moverOS = useCallback(
    async (idx: number) => {
      const item = store[tab][idx];
      if (!item) return;
      try {
        const updated = await moverServico(item);
        if (!updated) {
          showToast('OS ja esta no status final.', 'info');
          return;
        }
        await refresh();
        showToast(`OS ${item.num} movida!`, 'success');
      } catch (err) {
        showToast(extractErrorMessage(err, 'Falha ao mover OS.'), 'error');
      }
    },
    [store, tab, refresh, showToast]
  );

  const deletarOS = useCallback(
    async (idx: number) => {
      const item = store[tab][idx];
      if (!item) return;
      try {
        await removerServico(item);
        setDeleteIdx(null);
        await refresh();
        showToast(`OS ${item.num} excluida.`, 'info');
      } catch (err) {
        showToast(extractErrorMessage(err, 'Falha ao excluir OS.'), 'error');
      }
    },
    [store, tab, refresh, showToast]
  );

  const salvarEdicao = useCallback(
    async (idx: number, data: Partial<OrdemServico>) => {
      const item = store[tab][idx];
      if (!item) return;
      try {
        await atualizarServico(item, data);
        setEditIdx(null);
        await refresh();
        showToast('OS atualizada!', 'success');
      } catch (err) {
        showToast(extractErrorMessage(err, 'Falha ao atualizar OS.'), 'error');
      }
    },
    [store, tab, refresh, showToast]
  );

  const criarOS = useCallback(
    async (dados: Omit<OrdemServico, 'num' | 'pc'>) => {
      try {
        const novo = await criarServico(dados);
        setNovaOSOpen(false);
        await refresh();
        if (tab !== 'previstos') setTab('previstos');
        showToast(`OS ${novo.num} criada!`, 'success');
      } catch (err) {
        showToast(extractErrorMessage(err, 'Falha ao criar OS.'), 'error');
      }
    },
    [refresh, tab, showToast]
  );

  return {
    tab,
    setTab,
    list,
    detailIdx,
    setDetailIdx,
    editIdx,
    setEditIdx,
    deleteIdx,
    setDeleteIdx,
    novaOSOpen,
    setNovaOSOpen,
    moverOS,
    deletarOS,
    salvarEdicao,
    criarOS,
    TECNICOS,
    store,
    loading,
    error,
    refresh,
  };
}
