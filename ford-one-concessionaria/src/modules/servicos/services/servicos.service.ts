/**
 * @file servicos.service.ts
 * @module servicos
 * @description Service de Ordens de Servico delegando para /api/v1/servicos.
 *
 * Exporta wrappers tipados que retornam ServicoLocal (OrdemServico + _apiId/_apiStatus)
 * para o hook poder fazer PATCH/DELETE pelo id real.
 */

import * as servicosApi from '../../../shared/api/resources/servicos';
import {
  NEXT_STATUS,
  TAB_STATUS,
  type ServicoLocal,
  type ServicoTabKey,
} from '../../../shared/api/adapters/servicos';
import type { OrdemServico } from '../../../types/global.types';

export type { ServicoLocal, ServicoTabKey };
export { TAB_STATUS, NEXT_STATUS };

export interface ServicoStoreLocal {
  previstos: ServicoLocal[];
  andamento: ServicoLocal[];
  concluidos: ServicoLocal[];
}

export async function fetchTab(tab: ServicoTabKey): Promise<ServicoLocal[]> {
  return servicosApi.list({ status: TAB_STATUS[tab], limit: 100 });
}

export async function fetchAll(): Promise<ServicoStoreLocal> {
  const [previstos, andamento, concluidos] = await Promise.all([
    fetchTab('previstos'),
    fetchTab('andamento'),
    fetchTab('concluidos'),
  ]);
  return { previstos, andamento, concluidos };
}

export async function moverServico(item: ServicoLocal): Promise<ServicoLocal | null> {
  const next = NEXT_STATUS[item._apiStatus];
  if (!next) return null;
  return servicosApi.update(item._apiId, { status: next });
}

export async function atualizarServico(
  item: ServicoLocal,
  patch: Partial<OrdemServico>
): Promise<ServicoLocal> {
  return servicosApi.update(item._apiId, patch);
}

export async function criarServico(dados: Omit<OrdemServico, 'num' | 'pc'>): Promise<ServicoLocal> {
  const numero = '#' + (4900 + Math.floor(Math.random() * 9000));
  return servicosApi.create(dados, numero);
}

export async function removerServico(item: ServicoLocal): Promise<void> {
  return servicosApi.remove(item._apiId);
}
