/**
 * @file historico.service.ts
 * @module historico
 * @description Service de acesso ao histórico de veículos por cliente.
 *
 * Funções exportadas:
 * - getVeiculosCliente(cid) → retorna o array de veículos de um cliente pelo ID
 *   Retorna [] se o cliente não tiver veículos cadastrados.
 *
 * Em produção: substituir por chamada GET /api/clientes/:id/veiculos.
 */

import type { Veiculo } from '../../../types/global.types';
import { VEICULOS } from '../../../data/veiculos.data';

export function getVeiculosCliente(cid: string): Veiculo[] {
  return VEICULOS[cid] || [];
}
