/**
 * @file useDesempenho.ts
 * @module desempenho
 * @description Hook de estado e lógica da tela de Desempenho.
 * Busca o snapshot de performance real uma vez ao montar.
 */

import { useState, useEffect } from 'react';
import { fetchDesempenho, type DesempenhoSnapshot } from '../services/desempenho.service';
import { friendlyApiMessage } from '../../../shared/api/client';

export function useDesempenho() {
  const [data, setData] = useState<DesempenhoSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchDesempenho()
      .then(setData)
      .catch(e => setError(friendlyApiMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
