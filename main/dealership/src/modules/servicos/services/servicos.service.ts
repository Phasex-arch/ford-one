/**
 * @file servicos.service.ts
 * @module servicos
 * @description Service e store mutável de Ordens de Serviço.
 *
 * Exporta `store`: objeto com três arrays mutáveis (previstos, andamento, concluidos),
 * inicializado com os dados de data/servicos.data.ts.
 *
 * O store é mutado diretamente pelo useServicos (splice, unshift, Object.assign)
 * para simular operações CRUD em memória durante a sessão.
 * O forceUpdate() no hook dispara re-renders após cada mutação.
 *
 * Em produção: substituir por chamadas REST:
 * - GET    /api/os?tab=previstos
 * - POST   /api/os
 * - PUT    /api/os/:id
 * - DELETE /api/os/:id
 * - PATCH  /api/os/:id/mover
 */

import { SERVICOS_INICIAL, type ServicoStore } from '../../../data/servicos.data';
import { TECNICOS } from '../../../data/tecnicos.data';
export { TECNICOS };
export const store: ServicoStore = {
  previstos: [...SERVICOS_INICIAL.previstos],
  andamento: [...SERVICOS_INICIAL.andamento],
  concluidos: [...SERVICOS_INICIAL.concluidos],
};