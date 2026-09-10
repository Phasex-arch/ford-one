/**
 * @file useServicos.ts
 * @module servicos
 * @description Hook de estado e lógica do módulo de Serviços (Ordens de Serviço).
 *
 * Gerencia:
 * - tab: aba ativa ('previstos' | 'andamento' | 'concluidos')
 * - store: as OS de GET /servicos agrupadas por situação (contadores das abas)
 * - list: array de OS da aba ativa
 * - detailIdx / editIdx / deleteIdx: índice da OS com cada modal aberto
 * - novaOSOpen: visibilidade do modal "Nova OS"
 * - loading / error: estado da carga
 *
 * Operações (todas na API, com recarga da lista ao final):
 * - moverOS(idx)         → PATCH status para a próxima aba (prev→and→conc)
 * - deletarOS(idx)       → DELETE /servicos/:id
 * - salvarEdicao(idx, d) → PATCH dos campos editados
 * - criarOS(dados)       → POST /servicos em PREVISTO
 *
 * A tela endereça as OS por índice dentro da aba; o hook resolve índice → uuid
 * antes de chamar a API, então servicos.screen.tsx não precisa conhecer ids.
 *
 * @param showToast → callback para feedback de cada operação
 */

import { useState, useCallback, useMemo } from 'react';
import {
  fetchServicos, createServico, updateServico, moveServico, deleteServico,
  agruparPorSituacao, proximaSituacao,
} from '../services/servicos.service';
import { useAsyncList } from '../../../shared/hooks/useAsyncList';
import { useTecnicos } from '../../../shared/hooks/useTecnicos';
import type { OrdemServico } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';

export type OSTab = 'previstos' | 'andamento' | 'concluidos';

export function useServicos(showToast: (m:string,t?:ToastType)=>void) {
  const [tab, setTab] = useState<OSTab>('previstos');
  const [detailIdx, setDetailIdx] = useState<number|null>(null);
  const [editIdx, setEditIdx] = useState<number|null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number|null>(null);
  const [novaOSOpen, setNovaOSOpen] = useState(false);

  const { data: servicos, setData: setServicos, loading, error } = useAsyncList(fetchServicos);
  const { tecnicos } = useTecnicos();

  const store = useMemo(() => agruparPorSituacao(servicos), [servicos]);
  const list: OrdemServico[] = store[tab];

  const recarregar = useCallback(
    () => fetchServicos().then(setServicos).catch(() => undefined),
    [setServicos],
  );
  const falhou = useCallback(
    (e: unknown, padrao: string) =>
      showToast(e instanceof Error ? e.message : padrao, 'warning'),
    [showToast],
  );

  const moverOS = useCallback((idx: number) => {
    const s = store[tab][idx]; if (!s?.uuid) return;
    const dest = proximaSituacao(tab); if (!dest) return;
    moveServico(s.uuid, dest)
      .then(() => recarregar())
      .then(() => showToast(`OS ${s.num} movida!`,'success'))
      .catch(e => falhou(e, 'Erro ao mover OS.'));
  },[store, tab, recarregar, showToast, falhou]);

  const deletarOS = useCallback((idx: number) => {
    const s = store[tab][idx]; if (!s?.uuid) return;
    deleteServico(s.uuid)
      .then(() => recarregar())
      .then(() => { setDeleteIdx(null); showToast(`OS ${s.num} excluída.`,'info'); })
      .catch(e => { setDeleteIdx(null); falhou(e, 'Erro ao excluir OS.'); });
  },[store, tab, recarregar, showToast, falhou]);

  const salvarEdicao = useCallback((idx: number, data: Partial<OrdemServico>) => {
    const s = store[tab][idx]; if (!s?.uuid) return;
    updateServico(s.uuid, data)
      .then(() => recarregar())
      .then(() => { setEditIdx(null); showToast('OS atualizada!','success'); })
      .catch(e => falhou(e, 'Erro ao atualizar OS.'));
  },[store, tab, recarregar, showToast, falhou]);

  const criarOS = useCallback((dados: Omit<OrdemServico,'num'|'pc'>) => {
    // O `numero` é gerado pelo servidor, numa sequência protegida pelo @unique —
    // antes saía daqui como `#' + (4900 + servicos.length + 1)`, que colidia com
    // duas abas abertas. O toast cita o número que voltou, não um palpite.
    createServico(dados)
      .then(async (criada) => { await recarregar(); return criada; })
      .then((criada) => { setNovaOSOpen(false); showToast(`OS ${criada.num} criada!`,'success'); })
      .catch(e => falhou(e, 'Erro ao criar OS.'));
  },[recarregar, showToast, falhou]);

  return { tab, setTab, list, detailIdx, setDetailIdx, editIdx, setEditIdx,
           deleteIdx, setDeleteIdx, novaOSOpen, setNovaOSOpen,
           moverOS, deletarOS, salvarEdicao, criarOS, TECNICOS: tecnicos, store,
           loading, error };
}
