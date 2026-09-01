/**
 * @file useServicos.ts
 * @module servicos
 * @description Hook de estado e lógica do módulo de Serviços (Ordens de Serviço).
 *
 * Gerencia:
 * - tab: aba ativa ('previstos' | 'andamento' | 'concluidos')
 * - list: array de OS da aba ativa (leitura direta do store mutável)
 * - detailIdx: índice da OS com modal de detalhe aberto
 * - editIdx: índice da OS com modal de edição aberto
 * - deleteIdx: índice da OS com modal de exclusão aberto
 * - novaOSOpen: visibilidade do modal "Nova OS"
 *
 * Operações:
 * - moverOS(idx)         → move OS da aba atual para a próxima (prev→and→conc)
 * - deletarOS(idx)       → remove OS do array e fecha modal de confirmação
 * - salvarEdicao(idx, d) → aplica os campos editados na OS via Object.assign
 * - criarOS(dados)       → cria nova OS em previstos com número sequencial
 *
 * @param showToast → callback para feedback de cada operação
 */

import { useState, useCallback } from 'react';
import { store } from '../services/servicos.service';
import { TECNICOS } from '../../../data/tecnicos.data';
import type { OrdemServico } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';

export type OSTab = 'previstos' | 'andamento' | 'concluidos';

export function useServicos(showToast: (m:string,t?:ToastType)=>void) {
  const [tab, setTab] = useState<OSTab>('previstos');
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n=>n+1);
  const [detailIdx, setDetailIdx] = useState<number|null>(null);
  const [editIdx, setEditIdx] = useState<number|null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number|null>(null);
  const [novaOSOpen, setNovaOSOpen] = useState(false);

  const list: OrdemServico[] = store[tab];

  const moverOS = useCallback((idx: number) => {
    const s = store[tab].splice(idx,1)[0]; if(!s) return;
    const prox = {previstos:'andamento',andamento:'concluidos'} as Record<string,keyof typeof store>;
    const dest = prox[tab];
    if(dest) { store[dest].unshift(s); showToast(`OS ${s.num} movida!`,'success'); refresh(); }
  },[tab]);

  const deletarOS = useCallback((idx: number) => {
    const s = store[tab][idx]; if(!s) return;
    store[tab].splice(idx,1);
    setDeleteIdx(null); refresh(); showToast(`OS ${s.num} excluída.`,'info');
  },[tab]);

  const salvarEdicao = useCallback((idx: number, data: Partial<OrdemServico>) => {
    Object.assign(store[tab][idx], data);
    setEditIdx(null); refresh(); showToast('OS atualizada!','success');
  },[tab]);

  const criarOS = useCallback((dados: Omit<OrdemServico,'num'|'pc'>) => {
    const num = '#' + (4900 + store.previstos.length + 1);
    store.previstos.unshift({num, pc:'ok', ...dados});
    setNovaOSOpen(false); if(tab==='previstos') refresh();
    showToast(`OS ${num} criada!`,'success');
  },[tab]);

  return { tab, setTab, list, detailIdx, setDetailIdx, editIdx, setEditIdx,
           deleteIdx, setDeleteIdx, novaOSOpen, setNovaOSOpen,
           moverOS, deletarOS, salvarEdicao, criarOS, TECNICOS, store };
}