/**
 * @file useAsyncList.ts
 * @description Carrega uma lista da API expondo os três estados que toda tela
 * precisa: dados, loading e erro.
 *
 * Substitui os `useEffect(... .then(setX).catch(() => setX([])))` espalhados
 * pelos módulos, que engoliam o erro e nunca mostravam loading.
 *
 * `fetcher` precisa ser estável (função de módulo ou useCallback) — é a
 * dependência que dispara o recarregamento.
 */

import { useState, useEffect } from 'react';

export function useAsyncList<T>(fetcher: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    fetcher()
      .then(r => { if (alive) setData(r); })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Erro ao carregar dados.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [fetcher]);

  return { data, setData, loading, error };
}
