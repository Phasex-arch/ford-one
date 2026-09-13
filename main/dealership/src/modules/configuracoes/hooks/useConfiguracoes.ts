/**
 * @file useConfiguracoes.ts
 * @module configuracoes
 * @description Hook de estado e lógica da tela de Configurações.
 * Busca concessionária + status de segurança reais ao montar; salvarConcessionaria
 * grava via PATCH real e recarrega.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchConcessionaria, updateConcessionaria, fetchSeguranca,
  type Concessionaria, type UpdateConcessionariaInput, type SegurancaStatus,
} from '../services/configuracoes.service';
import { friendlyApiMessage } from '../../../shared/api/client';
import type { ToastType } from '../../../shared/hooks/useToast';

export function useConfiguracoes(showToast: (m: string, t?: ToastType) => void) {
  const [concessionaria, setConcessionaria] = useState<Concessionaria | null>(null);
  const [seguranca, setSeguranca] = useState<SegurancaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [salvando, setSalvando] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([fetchConcessionaria(), fetchSeguranca()])
      .then(([c, s]) => { setConcessionaria(c); setSeguranca(s); })
      .catch(e => setError(friendlyApiMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const salvarConcessionaria = useCallback((dados: UpdateConcessionariaInput) => {
    setSalvando(true);
    updateConcessionaria(dados).then(c => {
      setConcessionaria(c);
      showToast('Dados da concessionária salvos!', 'success');
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'))
      .finally(() => setSalvando(false));
  }, [showToast]);

  return { concessionaria, seguranca, loading, error, salvando, salvarConcessionaria };
}
