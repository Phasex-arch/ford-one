/**
 * @file useMetas.ts
 * @module metas
 * @description Hook de estado e logica do modulo de Metas.
 *
 * Carrega metas via GET /api/v1/metas, cria via POST com campos
 * codigo/titulo/indicador/alvo/etc. Helpers de formatacao e status visual
 * permanecem identicos para a tela renderizar sem alteracao.
 */

import { useCallback, useEffect, useState } from 'react';
import * as metasApi from '../../../shared/api/resources/metas';
import { extractErrorMessage } from '../../../shared/api/http';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';
import type { Meta, MetaIndicador } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';

const LABELS: Record<string, string> = {
  vendas: 'Vendas',
  receita: 'Receita',
  leads: 'Leads',
  nps: 'NPS',
  sla: 'SLA',
  conv: 'Conversão',
};

export function useMetas(showToast: (m: string, t?: ToastType) => void) {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await metasApi.list({ limit: 100 });
      setMetas(list);
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao carregar metas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const getStatus = (m: Meta) => {
    const pct = m.lowerIsBetter ? (m.alvo / m.atual) * 100 : (m.atual / m.alvo) * 100;
    if (pct >= 100) return { cls: 'exceeded', tag: 'tag-exceeded', label: 'Meta atingida' };
    if (pct >= 85)  return { cls: 'on-track', tag: 'tag-on-track', label: 'No caminho' };
    if (pct >= 60)  return { cls: 'at-risk',  tag: 'tag-at-risk',  label: 'Em risco' };
    return { cls: 'behind', tag: 'tag-behind', label: 'Abaixo' };
  };

  const fmtVal = (m: Meta, v: number) => {
    if (m.indicador === 'receita') return formatCurrency(v);
    if (m.unidade === '%') return v + '%';
    if (m.unidade === 'h') return v + 'h';
    return formatNumber(v) + ' ' + m.unidade;
  };

  const addMeta = useCallback(
    async (tipo: MetaIndicador, resp: string, val: number, per: string) => {
      if (!resp || !val || !per) {
        showToast('Preencha todos os campos.', 'warning');
        return;
      }
      try {
        const novo = await metasApi.create(
          {
            titulo: LABELS[tipo] || tipo,
            periodo: per,
            indicador: tipo,
            atual: 0,
            alvo: val,
            unidade: tipo === 'receita' ? 'R$' : tipo === 'sla' ? 'h' : '',
            responsavel: resp,
            lowerIsBetter: tipo === 'sla',
          },
          `M${Date.now().toString().slice(-6)}`
        );
        setMetas((p) => [...p, novo]);
        setModalOpen(false);
        showToast('Meta criada!', 'success');
      } catch (err) {
        showToast(extractErrorMessage(err, 'Falha ao salvar meta.'), 'error');
      }
    },
    [showToast]
  );

  return { metas, modalOpen, setModalOpen, getStatus, fmtVal, addMeta, loading, error, refresh };
}
