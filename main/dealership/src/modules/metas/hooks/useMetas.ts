/**
 * @file useMetas.ts
 * @module metas
 * @description Hook de estado e lógica do módulo de Metas.
 *
 * Gerencia:
 * - metas: array de Meta vindo de GET /metas
 * - loading/error: estado da carga (via useAsyncList)
 * - modalOpen: visibilidade do modal "Nova Meta"
 *
 * Funções auxiliares:
 * - getStatus(m) → determina status visual da meta (exceeded/on-track/at-risk/behind)
 *   baseado no percentual atingido, respeitando lowerIsBetter (ex: SLA)
 * - fmtVal(m, v) → formata o valor conforme o tipo de indicador
 *   (receita → moeda, % → sufixo, h → horas, demais → número)
 * - addMeta(tipo, resp, val, per) → valida e cria a meta via POST /metas
 *
 * @param showToast → feedback de criação de meta
 */

import { useState, useCallback } from 'react';
import { useAsyncList } from '../../../shared/hooks/useAsyncList';
import { fetchMetas, createMeta } from '../../../shared/api/resources';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';
import type { Meta, MetaIndicador } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';

export function useMetas(showToast:(m:string,t?:ToastType)=>void) {
  const { data: metas, setData: setMetas, loading, error } = useAsyncList(fetchMetas);
  const [modalOpen, setModalOpen] = useState(false);

  const getStatus = (m: Meta) => {
    const pct = m.lowerIsBetter?(m.alvo/m.atual*100):(m.atual/m.alvo*100);
    if(pct>=100) return{cls:'exceeded',tag:'tag-exceeded',label:'Meta atingida'};
    if(pct>=85)  return{cls:'on-track', tag:'tag-on-track', label:'No caminho'};
    if(pct>=60)  return{cls:'at-risk',  tag:'tag-at-risk',  label:'Em risco'};
    return{cls:'behind',tag:'tag-behind',label:'Abaixo'};
  };

  const fmtVal = (m: Meta, v: number) => {
    if(m.indicador==='receita') return formatCurrency(v);
    if(m.unidade==='%') return v+'%';
    if(m.unidade==='h') return v+'h';
    return formatNumber(v)+' '+m.unidade;
  };

  const addMeta = useCallback((tipo: MetaIndicador, resp: string, val: number, per: string) => {
    if(!resp||!val||!per){showToast('Preencha todos os campos.','warning');return;}
    const labels: Record<string,string> = {vendas:'Vendas',receita:'Receita',leads:'Leads',nps:'NPS',sla:'SLA',conv:'Conversão'};
    createMeta({
      titulo: labels[tipo]||tipo,
      periodo: per,
      indicador: tipo,
      alvo: val,
      unidade: tipo==='receita'?'R$':tipo==='sla'?'h':'',
      responsavel: resp,
      lowerIsBetter: tipo==='sla',
    })
      .then(nova => { setMetas(p=>[...p,nova]); setModalOpen(false); showToast('Meta criada!','success'); })
      .catch(e => showToast(e?.message||'Erro ao criar meta.','warning'));
  },[showToast,setMetas]);

  return { metas, modalOpen, setModalOpen, getStatus, fmtVal, addMeta, loading, error };
}