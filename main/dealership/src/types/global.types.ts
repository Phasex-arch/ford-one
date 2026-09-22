/**
 * @file global.types.ts
 * @description Tipos e interfaces TypeScript globais compartilhados entre todos os módulos.
 *
 * Origem: migração completa dos @typedef JSDoc do arquivo types.js original para
 * TypeScript estrito, com tipagem forte em todos os campos.
 *
 * Organização:
 * - Union types de status (ClienteStatus, LeadUrgencia, TecnicoStatus, etc.)
 * - Interfaces de entidade (Cliente, Veiculo, Estoque, Lead, etc.)
 * - ModuleId: union type com todos os IDs de módulo válidos para navegação
 *
 * Regra: tipos exclusivos de um módulo ficam em modules/modulo/types/modulo.types.ts.
 * Tipos usados por dois ou mais módulos ficam aqui.
 */
// global.types.ts — Tipos TypeScript globais
// Migração dos @typedef do types.js para TypeScript estrito.

export type ClienteStatus   = 'ativo' | 'inativo' | 'potencial';
export type ClienteSegmento = 'Premium' | 'VIP' | 'Família' | 'Executivo' | 'Padrão';
export type LeadUrgencia    = 'urgente' | 'alta' | 'media' | 'baixa';
export type TecnicoStatus   = 'livre' | 'ocupado' | 'pausa' | 'ausente';
export type EstoqueCondicao = 'novo' | 'seminovo';
export type EstoqueSegmento = 'suv' | 'picape' | 'sedan';
export type MetaIndicador   = 'vendas' | 'receita' | 'leads' | 'nps' | 'sla' | 'conv';
export type FinanciamentoStatus = 'aprovado' | 'analise' | 'pendente' | 'reprovado';
export type OSStatus        = 'ok' | 'risco' | 'atrasado';
export type ModuleId =
  | 'dashboard' | 'clientes' | 'historico' | 'estoque' | 'leads'
  | 'agenda' | 'servicos' | 'metas' | 'financiamentos'
  | 'receita' | 'avaliacao' | 'desempenho' | 'relatorios' | 'config';

export interface Cliente {
  id: string;
  nome: string;
  tel: string;
  email: string;
  /** Formatada pra exibição (dd/mm/yyyy ou "-") — usar ultRaw pra ordenar. */
  ult: string;
  /** ISO da mesma data, ou null — é o que sortClientes('ult') usa de verdade. */
  ultRaw: string | null;
  status: ClienteStatus;
  v: number;
  ltv: number;
  ini: string;
  seg: ClienteSegmento;
}

export interface HistoricoItem {
  d: string;
  ev: string;
  det: string;
  val: string;
}

export interface Veiculo {
  id: string;
  modelo: string;
  versao: string;
  ano: string;
  cor: string;
  km: string;
  aq: string;
  precoAquisicao: number;
  saida: string | null;
  status: 'ativo' | 'vendido' | 'substituido';
  atual: boolean;
  ult: string;
  img: string | null;
  hist: HistoricoItem[];
}

export interface Estoque {
  id: string;
  modelo: string;
  versao: string;
  ano: string;
  motor: string;
  trans: string;
  cond: EstoqueCondicao;
  status: string;
  preco: number;
  seg: EstoqueSegmento;
  cor: string;
  img: string | null;
  estq: number;
  km: string | null;
  ops: string[];
  /** Reserva real (POST /estoque/:id/reservar) — null quando não há
   * reserva em andamento. Expira sozinha (ver auditoria, seção 3). */
  reservadoClienteId: string | null;
  reservadoAte: string | null;
}

export interface Lead {
  id: string;
  cli: string;
  ini: string;
  v: string;
  nec: string;
  urg: LeadUrgencia;
  val: number;
  tel: string;
  email: string | null;
  ins: string;
  /** true quando um financiamento vinculado a este lead já foi aprovado —
   * a conversão em Cliente já aconteceu automaticamente (ver auditoria,
   * seção 0). Lead já convertido some das opções de "Lead de origem" na
   * Nova Simulação. */
  convertido: boolean;
}

export interface OrdemServico {
  id: string;
  num: string;
  c: string;
  v: string;
  t: string;
  tech: string;
  prazo: string;
  /** ISO 8601 (UTC) — fonte real do prazo; prazo (texto) e pc (prioridade)
   * são sempre derivados daqui no servidor. null só em registro antigo, de
   * antes desse campo existir. */
  prazoData: string | null;
  pc: OSStatus;
  val: number;
}

export interface Financiamento {
  id: string;
  codigo: string;
  cli: string;
  ini: string;
  veiculo: string;
  valor: number;
  entrada: number;
  prazo: number;
  taxa: number;
  parcela: number;
  status: FinanciamentoStatus;
  data: string;
  /** true quando vinculado a um Lead — é o que dispara a conversão
   * automática em Cliente na aprovação (ver auditoria, seção 0). */
  temLeadOrigem: boolean;
}

export type AvaliacaoStatus = 'pendente' | 'aprovada' | 'rejeitada';

export interface Avaliacao {
  id: string;
  c: string;
  nota: number;
  data: string;
  txt: string;
  detalhe: string;
  status: AvaliacaoStatus;
}

export interface Meta {
  id: string;
  codigo: string;
  titulo: string;
  periodo: string;
  indicador: MetaIndicador;
  atual: number;
  alvo: number;
  unidade: string;
  responsavel: string;
  responsavelId: string | null;
  lowerIsBetter: boolean;
}

export interface Tecnico {
  id: string;
  nome: string;
  ini: string;
  esp: string;
  status: TecnicoStatus;
}

export interface Appointment {
  id: string;
  cli: string;
  type: string;
  tech: string;
  cls: string;
  cancelled: boolean;
}

export interface AgendaSlot {
  hora: string;
  apts: Appointment[];
}

export interface AccessLogItem {
  id: string;
  nome: string;
  ini: string;
  hora: string;
}

export interface VehicleLogItem {
  id: string;
  cid: string;
  modelo: string;
  cli: string;
  hora: string;
}
