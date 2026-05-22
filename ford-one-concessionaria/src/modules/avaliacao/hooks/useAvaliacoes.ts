/**
 * @file useAvaliacoes.ts
 * @module avaliacao
 * @description Hook de carregamento das avaliacoes e estatisticas (NPS).
 *
 * Chama GET /api/v1/avaliacoes (lista) e GET /api/v1/avaliacoes/stats.
 * Em caso de falha, mantem o mock local para a tela continuar renderizando.
 */

import { useCallback, useEffect, useState } from 'react';
import * as avaliacoesApi from '../../../shared/api/resources/avaliacoes';
import type { AvaliacaoLocal } from '../../../shared/api/adapters/avaliacoes';
import type { AvaliacaoStatsDto } from '../../../shared/api/types';
import { extractErrorMessage } from '../../../shared/api/http';
import { AVALIACOES as MOCK_AVALIACOES } from '../../../data/avaliacoes.data';
import type { Avaliacao } from '../../../types/global.types';

export function useAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(MOCK_AVALIACOES);
  const [stats, setStats] = useState<AvaliacaoStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, statsRes] = await Promise.all([
        avaliacoesApi.list({ limit: 100 }),
        avaliacoesApi.stats().catch(() => null),
      ]);
      const sanitized: AvaliacaoLocal[] = list;
      setAvaliacoes(sanitized);
      setStats(statsRes);
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao carregar avaliacoes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { avaliacoes, stats, loading, error, refresh };
}
