/**
 * @file resources/dashboard.ts
 * @description Cliente HTTP para /api/v1/dashboard.
 */

import { http } from '../http';
import type { DashboardSnapshotDto } from '../types';

export type DashboardPeriodo = 'hoje' | 'semana' | 'mes' | 'trimestre';

export async function snapshot(periodo: DashboardPeriodo = 'mes'): Promise<DashboardSnapshotDto> {
  const { data } = await http.get<DashboardSnapshotDto>('/dashboard', {
    params: { periodo },
  });
  return data;
}
