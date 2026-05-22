/**
 * @file cache.ts
 * @description Pequenos stores em memoria para entidades buscadas da API.
 *
 * Os hooks de modulo (useClientes, useEstoque, useLeads, useTecnicos)
 * publicam aqui o ultimo snapshot que tem da API; outros consumidores
 * (GlobalSearch, AppContext.logAccess, historico) leem via useStore() sem
 * ter que duplicar a chamada HTTP nem depender dos arrays mockados.
 */

import { useEffect, useState } from 'react';
import type { Cliente, Estoque, Lead } from '../../types/global.types';
import type { TecnicoLocal } from './adapters/tecnicos';

type Listener<T> = (items: T[]) => void;

export interface Store<T> {
  get: () => T[];
  set: (next: T[]) => void;
  update: (fn: (cur: T[]) => T[]) => void;
  subscribe: (fn: Listener<T>) => () => void;
}

function createStore<T>(): Store<T> {
  let items: T[] = [];
  const listeners = new Set<Listener<T>>();
  return {
    get: () => items,
    set: (next) => {
      items = next;
      listeners.forEach((l) => l(items));
    },
    update: (fn) => {
      items = fn(items);
      listeners.forEach((l) => l(items));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

export const clientesStore = createStore<Cliente>();
export const estoqueStore = createStore<Estoque>();
export const leadsStore = createStore<Lead>();
export const tecnicosStore = createStore<TecnicoLocal>();

export function useStore<T>(store: Store<T>): T[] {
  const [snapshot, setSnapshot] = useState<T[]>(() => store.get());
  useEffect(() => store.subscribe(setSnapshot), [store]);
  return snapshot;
}
