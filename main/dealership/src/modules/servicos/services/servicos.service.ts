/**
 * @file servicos.service.ts
 * @module servicos
 * @description Acesso às Ordens de Serviço.
 *
 * A tela é organizada em abas (previstos/andamento/concluídos) que correspondem
 * ao `status` do backend. O corte da lista única fica em shared/api/mappers.ts,
 * junto da tradução status↔situação, e as operações de escrita vão direto para
 * a API — o store mutável em memória que existia aqui foi removido.
 *
 * - GET    /servicos        → fetchServicos (em shared/api/resources.ts)
 * - POST   /servicos        → createServico
 * - PATCH  /servicos/:id    → updateServico (campos) e moveServico (status)
 * - DELETE /servicos/:id    → deleteServico
 */

export { fetchServicos, createServico, updateServico, moveServico, deleteServico }
  from '../../../shared/api/resources';

export { agruparPorSituacao, proximaSituacao, type ServicoStore }
  from '../../../shared/api/mappers';
