/**
 * @file useConfiguracoes.ts
 * @module configuracoes
 * @description Hook de estado e lógica da tela de Configurações.
 * Busca concessionária + status de segurança reais ao montar; salvarConcessionaria
 * grava via PATCH real e recarrega.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchConcessionaria, updateConcessionaria, fetchSeguranca, fetchAuditLogRecente,
  type Concessionaria, type UpdateConcessionariaInput, type SegurancaStatus, type AuditLogEntry,
} from '../services/configuracoes.service';
import { friendlyApiMessage } from '../../../shared/api/client';
import type { ToastType } from '../../../shared/hooks/useToast';

export function useConfiguracoes(showToast: (m: string, t?: ToastType) => void) {
  const [concessionaria, setConcessionaria] = useState<Concessionaria | null>(null);
  const [seguranca, setSeguranca] = useState<SegurancaStatus | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[] | null>(null);
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
    // Auditoria é só ADMIN (403 pros outros papéis) — falha silenciosa vira "sem dado", não erro de tela.
    fetchAuditLogRecente().then(setAuditLog).catch(() => setAuditLog(null));
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

  return { concessionaria, seguranca, auditLog, loading, error, salvando, salvarConcessionaria };
}
