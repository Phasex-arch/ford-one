/**
 * @file adapters/paginated.ts
 * @description Helpers para envelopes paginados da API.
 *
 * A API NestJS retorna listas no formato { data, total, page, limit }.
 * Algumas rotas (avaliacoes, dashboard, vehicles) retornam payloads diferentes,
 * por isso tambem expomos `coerceList` que extrai um array de varios formatos.
 */

import type { Paginated } from '../types';

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
}

export function isPaginated<T>(value: unknown): value is Paginated<T> {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as Paginated<T>).data) &&
    typeof (value as Paginated<T>).total === 'number'
  );
}

export function coerceList<TApi>(payload: unknown): TApi[] {
  if (Array.isArray(payload)) return payload as TApi[];
  if (isPaginated<TApi>(payload)) return payload.data;
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: TApi[] }).items;
  }
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { results?: unknown }).results)
  ) {
    return (payload as { results: TApi[] }).results;
  }
  return [];
}

export function mapList<TApi, TLocal>(
  payload: unknown,
  fromApi: (dto: TApi) => TLocal
): TLocal[] {
  return coerceList<TApi>(payload).map(fromApi);
}

export function coerceMeta(payload: unknown): PageMeta | null {
  if (isPaginated(payload)) {
    return { total: payload.total, page: payload.page, limit: payload.limit };
  }
  return null;
}
