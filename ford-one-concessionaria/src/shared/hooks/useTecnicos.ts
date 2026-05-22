/**
 * @file useTecnicos.ts
 * @description Hook compartilhado que devolve a lista de tecnicos da API
 * (via tecnicosStore). Cai para o mock local quando o cache ainda nao foi
 * populado, para nao quebrar telas que dependem dele antes do bootstrap.
 */

import { useMemo } from 'react';
import { tecnicosStore, useStore } from '../api/cache';
import { TECNICOS as MOCK_TECNICOS } from '../../data/tecnicos.data';
import type { Tecnico } from '../../types/global.types';

export function useTecnicos(): Tecnico[] {
  const items = useStore(tecnicosStore);
  return useMemo(() => (items.length ? items : MOCK_TECNICOS), [items]);
}
