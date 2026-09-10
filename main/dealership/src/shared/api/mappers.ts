/**
 * @file mappers.ts
 * @description Tradução entre o contrato do backend (NestJS/Prisma) e os tipos
 * de tela do dealership (types/global.types.ts).
 *
 * O backend expõe `telefone/iniciais/segmento/ultimaVisita` e enums em CAIXA ALTA;
 * as telas usam `tel/ini/seg/ult` e enums minúsculos (usados também como classe CSS).
 * Todo o mapeamento vive aqui — módulos e busca global consomem estas funções
 * em vez de reimplementar a conversão.
 *
 * `id` recebe o `codigo` do backend (C001, E001, L001), que é o identificador
 * exibido na UI; o UUID real fica em `uuid` para chamadas de escrita futuras.
 *
 * Funções puras de propósito — os fetchers ficam em resources.ts e o
 * autocheck em mappers.check.ts.
 */

import { formatDateBr } from '../utils/dates';
import type {
  Cliente, ClienteSegmento, ClienteStatus,
  Estoque, EstoqueCondicao, EstoqueSegmento,
  Lead, LeadUrgencia,
  OrdemServico, OSStatus, OSSituacao,
  Meta, MetaIndicador,
  Financiamento, FinanciamentoStatus,
  Avaliacao, Tecnico, TecnicoStatus,
} from '../../types/global.types';

const lower = <T extends string>(v: string | null | undefined, fallback: T): T =>
  (v ? (v.toLowerCase() as T) : fallback);

/** O seed grava segmentos sem acento ("Familia"); a UI exibe com acento. */
const SEGMENTO_CLIENTE: Record<string, ClienteSegmento> = {
  familia: 'Família', padrao: 'Padrão', executivo: 'Executivo',
  premium: 'Premium', vip: 'VIP',
};

export interface ClienteApi {
  id: string; codigo: string; nome: string; telefone: string; email: string;
  ultimaVisita: string | null; status: string; veiculosCount: number;
  ltv: number; iniciais: string; segmento: string;
}

export const toCliente = (c: ClienteApi): Cliente => ({
  uuid: c.id,
  id: c.codigo,
  nome: c.nome,
  tel: c.telefone,
  email: c.email,
  ult: formatDateBr(c.ultimaVisita),
  status: lower<ClienteStatus>(c.status, 'ativo'),
  v: c.veiculosCount ?? 0,
  ltv: c.ltv ?? 0,
  ini: c.iniciais,
  seg: SEGMENTO_CLIENTE[(c.segmento || '').toLowerCase()] ?? (c.segmento as ClienteSegmento),
});

export interface EstoqueApi {
  id: string; codigo: string; modelo: string; versao: string; ano: string;
  motor: string; transmissao: string; condicao: string; status: string;
  preco: number; segmento: string; cor: string; imagem: string | null;
  quantidade: number; km: string | null; opcionais: string[];
}

export const toEstoque = (e: EstoqueApi): Estoque => ({
  uuid: e.id,
  id: e.codigo,
  modelo: e.modelo,
  versao: e.versao,
  ano: e.ano,
  motor: e.motor,
  trans: e.transmissao,
  cond: lower<EstoqueCondicao>(e.condicao, 'novo'),
  status: e.status,
  preco: e.preco ?? 0,
  seg: lower<EstoqueSegmento>(e.segmento, 'outro'),
  cor: e.cor,
  img: e.imagem,
  estq: e.quantidade ?? 0,
  km: e.km,
  ops: e.opcionais ?? [],
});

export interface LeadApi {
  id: string; codigo: string; clienteNome: string; iniciais: string;
  veiculoInteresse: string; necessidade: string; urgencia: string;
  valorEstimado: number; telefone: string; insight: string | null;
}

export const toLead = (l: LeadApi): Lead => ({
  uuid: l.id,
  id: l.codigo,
  cli: l.clienteNome,
  ini: l.iniciais,
  v: l.veiculoInteresse,
  nec: l.necessidade,
  urg: lower<LeadUrgencia>(l.urgencia, 'media'),
  val: l.valorEstimado ?? 0,
  tel: l.telefone,
  ins: l.insight ?? '',
});

// ── Ordens de serviço ───────────────────────────────────────────────────────

export interface ServicoApi {
  id: string; numero: string; cliente: string; veiculo: string; tipo: string;
  tecnico: string; prazo: string; prioridade: string; valor: string; status: string;
}

/** As abas da tela são o status do backend; CANCELADO ganha aba própria. */
const SITUACAO: Record<string, OSSituacao> = {
  PREVISTO: 'previstos',
  ANDAMENTO: 'andamento',
  CONCLUIDO: 'concluidos',
  CANCELADO: 'cancelados',
};

export const toServico = (s: ServicoApi): OrdemServico => ({
  uuid: s.id,
  situacao: SITUACAO[s.status] ?? 'previstos',
  num: s.numero,
  c: s.cliente,
  v: s.veiculo,
  t: s.tipo,
  tech: s.tecnico,
  prazo: s.prazo,
  pc: lower<OSStatus>(s.prioridade, 'ok'),
  val: s.valor,
});

/** Inverso de SITUACAO — usado ao mover a OS de aba (PATCH /servicos/:id). */
export const statusDaSituacao = (situacao: OSSituacao): string =>
  (Object.keys(SITUACAO) as string[]).find(k => SITUACAO[k] === situacao) ?? 'PREVISTO';

// ── Metas ───────────────────────────────────────────────────────────────────

export interface MetaApi {
  id: string; codigo: string; titulo: string; periodo: string; indicador: string;
  atual: number; alvo: number; unidade: string; responsavel: string; lowerIsBetter: boolean;
}

export const toMeta = (m: MetaApi): Meta => ({
  uuid: m.id,
  id: m.codigo,
  titulo: m.titulo,
  periodo: m.periodo,
  indicador: lower<MetaIndicador>(m.indicador, 'vendas'),
  atual: m.atual ?? 0,
  alvo: m.alvo ?? 0,
  unidade: m.unidade ?? '',
  responsavel: m.responsavel,
  lowerIsBetter: !!m.lowerIsBetter,
});

// ── Financiamentos ──────────────────────────────────────────────────────────

export interface FinanciamentoApi {
  id: string; codigo: string; clienteNome: string; iniciais: string; veiculo: string;
  valor: number; entrada: number; prazo: number; taxa: number; parcela: number;
  status: string; data: string;
}

export const toFinanciamento = (f: FinanciamentoApi): Financiamento => ({
  uuid: f.id,
  id: f.codigo,
  cli: f.clienteNome,
  ini: f.iniciais,
  veiculo: f.veiculo,
  valor: f.valor ?? 0,
  entrada: f.entrada ?? 0,
  prazo: f.prazo ?? 0,
  taxa: f.taxa ?? 0,
  parcela: f.parcela ?? 0,
  status: lower<FinanciamentoStatus>(f.status, 'analise'),
  data: f.data,
});

// ── Avaliações ──────────────────────────────────────────────────────────────

export interface AvaliacaoApi {
  id: string; cliente: string; nota: number; data: string;
  texto: string; detalhe: string | null;
}

export const toAvaliacao = (a: AvaliacaoApi): Avaliacao => ({
  uuid: a.id,
  c: a.cliente,
  nota: a.nota ?? 0,
  data: a.data,
  txt: a.texto,
  detalhe: a.detalhe ?? '',
});

// ── Técnicos ────────────────────────────────────────────────────────────────

export interface TecnicoApi {
  id: string; nome: string; iniciais: string; especialidade: string; status: string;
}

export const toTecnico = (t: TecnicoApi): Tecnico => ({
  uuid: t.id,
  nome: t.nome,
  ini: t.iniciais,
  esp: t.especialidade,
  status: lower<TecnicoStatus>(t.status, 'livre'),
});

// ── Agrupamento das OS por aba ──────────────────────────────────────────────

export interface ServicoStore {
  previstos: OrdemServico[];
  andamento: OrdemServico[];
  concluidos: OrdemServico[];
  cancelados: OrdemServico[];
}

/** Corta a lista única de GET /servicos nas abas da tela. */
export function agruparPorSituacao(servicos: OrdemServico[]): ServicoStore {
  const grupos: ServicoStore = { previstos: [], andamento: [], concluidos: [], cancelados: [] };
  for (const s of servicos) grupos[s.situacao ?? 'previstos'].push(s);
  return grupos;
}

/** Próxima aba no fluxo da oficina. `null` quando não há para onde mover. */
export const proximaSituacao = (atual: OSSituacao): OSSituacao | null =>
  atual === 'previstos' ? 'andamento' : atual === 'andamento' ? 'concluidos' : null;
