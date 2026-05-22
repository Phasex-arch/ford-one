/**
 * @file bootstrap.ts
 * @description Carrega para os stores compartilhados as listas base
 * (clientes, estoque, leads, tecnicos) logo apos o login. Isso garante que
 * a busca global, o AppContext.logAccess e o historico tenham dados antes
 * mesmo do usuario abrir os modulos correspondentes.
 */

import { clientesStore, estoqueStore, leadsStore, tecnicosStore } from './cache';
import * as clientesApi from './resources/clientes';
import * as estoqueApi from './resources/estoque';
import * as leadsApi from './resources/leads';
import * as tecnicosApi from './resources/tecnicos';

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

let bootstrapped = false;

export async function bootstrapSharedData(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;
  const [clientes, estoque, leads, tecnicos] = await Promise.all([
    safe(clientesApi.list({ limit: 100 }), []),
    safe(estoqueApi.list({ limit: 100 }), []),
    safe(leadsApi.list({ limit: 100 }), []),
    safe(tecnicosApi.list({ limit: 100 }), []),
  ]);
  clientesStore.set(clientes);
  estoqueStore.set(estoque);
  leadsStore.set(leads);
  tecnicosStore.set(tecnicos);
}

export function resetBootstrap(): void {
  bootstrapped = false;
  clientesStore.set([]);
  estoqueStore.set([]);
  leadsStore.set([]);
  tecnicosStore.set([]);
}
