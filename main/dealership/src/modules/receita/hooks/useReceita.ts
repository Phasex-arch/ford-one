/**
 * @file useReceita.ts
 * @module receita
 * @description Hook de estado e lógica da tela de Receita.
 * Busca o snapshot financeiro real do mês corrente uma vez ao montar.
 */

import { useState, useEffect } from 'react';
import { fetchReceita, type ReceitaSnapshot } from '../services/receita.service';
import { friendlyApiMessage } from '../../../shared/api/client';

export function useReceita() {
  const [data, setData] = useState<ReceitaSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchReceita()
      .then(setData)
      .catch(e => setError(friendlyApiMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
