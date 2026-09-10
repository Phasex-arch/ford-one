/**
 * @file historico.service.ts
 * @module historico
 * @description Service de acesso ao histórico de veículos por cliente.
 *
 * Funções exportadas:
 * - getVeiculosCliente(cid) → retorna o array de veículos de um cliente pelo ID
 *   Retorna [] se o cliente não tiver veículos cadastrados.
 *
 * ponytail: o backend ainda não expõe histórico de veículos por cliente
 * (GET /clientes/:id/veiculos não existe — /vehicles é o catálogo Ford do
 * scrapper, não a frota do cliente). A fonte segue sendo veiculos.data.ts,
 * indexada pelo `codigo` do cliente (C001…), que é o `id` devolvido pelo
 * mapeamento da API — então os clientes do seed encontram seus veículos e
 * clientes novos caem no estado vazio. Trocar por chamada real quando o
 * endpoint existir; nenhum outro arquivo precisa mudar.
 */

import type { Veiculo } from '../../../types/global.types';
import { VEICULOS } from '../../../data/veiculos.data';

export function getVeiculosCliente(cid: string): Veiculo[] {
  return VEICULOS[cid] || [];
}
