/**
 * @file useTecnicos.ts
 * @description Equipe técnica vinda de GET /tecnicos.
 *
 * Vive em shared/ porque três módulos precisam da mesma lista: serviços (designar
 * técnico na OS), agenda (colunas da grade) e leads (técnico do agendamento).
 */

import { useAsyncList } from './useAsyncList';
import { fetchTecnicos } from '../api/resources';
import type { Tecnico } from '../../types/global.types';

export function useTecnicos() {
  const { data: tecnicos, loading, error } = useAsyncList<Tecnico>(fetchTecnicos);
  return { tecnicos, loading, error };
}
