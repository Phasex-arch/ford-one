/**
 * @file routes.tsx
 * @description Re-exporta o tipo ModuleId para uso em toda a aplicação.
 * ModuleId é o union type que lista os 14 identificadores válidos de módulo:
 * dashboard | clientes | historico | estoque | leads | agenda | servicos |
 * metas | financiamentos | receita | avaliacao | desempenho | relatorios | config
 */
// routes.tsx — re-exports ModuleId for use across the app
export type { ModuleId } from '../types/global.types';
