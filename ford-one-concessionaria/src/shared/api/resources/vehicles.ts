/**
 * @file resources/vehicles.ts
 * @description Cliente HTTP para o catalogo Ford (/api/v1/vehicles).
 * Mantido enxuto: list, search, categories e stats.
 */

import { http } from '../http';

export async function list<T = unknown>(params: Record<string, unknown> = {}): Promise<T> {
  const { data } = await http.get<T>('/vehicles', { params });
  return data;
}

export async function search<T = unknown>(q: string, page = 1, limit = 20): Promise<T> {
  const { data } = await http.get<T>('/vehicles/search', { params: { q, page, limit } });
  return data;
}

export async function categories<T = unknown>(): Promise<T> {
  const { data } = await http.get<T>('/vehicles/categories');
  return data;
}

export async function stats<T = unknown>(): Promise<T> {
  const { data } = await http.get<T>('/vehicles/stats');
  return data;
}
