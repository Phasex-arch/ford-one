/**
 * @file resources.ts
 * @description Chamadas HTTP dos recursos do dealership, já convertidas para os
 * tipos de tela. A tradução do contrato fica em mappers.ts (puro e testável).
 */

import { apiRequest } from './client';
import {
  toCliente, toEstoque, toLead, toServico, toMeta,
  toFinanciamento, toAvaliacao, toTecnico, statusDaSituacao,
  type ClienteApi, type EstoqueApi, type LeadApi, type ServicoApi,
  type MetaApi, type FinanciamentoApi, type AvaliacaoApi, type TecnicoApi,
} from './mappers';
import type {
  Cliente, Estoque, Lead, OrdemServico, OSSituacao,
  Meta, Financiamento, Avaliacao, Tecnico,
} from '../../types/global.types';

export {
  toCliente, toEstoque, toLead, toServico, toMeta,
  toFinanciamento, toAvaliacao, toTecnico,
} from './mappers';

/**
 * Listas do backend são paginadas (limit=20 por padrão) e o PaginationQueryDto
 * recusa limit acima de 100 com 400 — as telas filtram no cliente.
 *
 * ponytail: teto de 100 itens por recurso. Acima disso a tela trunca em silêncio;
 * quando o volume crescer, trocar por filtro no servidor (os endpoints já aceitam
 * search/status/segmento) ou por um laço sobre pagination.hasNext.
 */
const LIST_LIMIT = 100;

export const fetchClientes = async (): Promise<Cliente[]> =>
  (await apiRequest<ClienteApi[]>(`/clientes?limit=${LIST_LIMIT}`)).map(toCliente);

export const fetchEstoque = async (): Promise<Estoque[]> =>
  (await apiRequest<EstoqueApi[]>(`/estoque?limit=${LIST_LIMIT}`)).map(toEstoque);

export const fetchLeads = async (): Promise<Lead[]> =>
  (await apiRequest<LeadApi[]>(`/leads?limit=${LIST_LIMIT}`)).map(toLead);

/** POST /clientes exige codigo/telefone/iniciais/segmento e rejeita campos extras. */
export const createCliente = async (
  dados: Pick<Cliente, 'nome' | 'tel' | 'email' | 'status' | 'seg'>,
): Promise<Cliente> =>
  toCliente(await apiRequest<ClienteApi>('/clientes', {
    method: 'POST',
    body: JSON.stringify({
      codigo: `C${Date.now().toString().slice(-6)}`,
      nome: dados.nome,
      telefone: dados.tel,
      email: dados.email,
      status: dados.status.toUpperCase(),
      iniciais: dados.nome.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase(),
      segmento: dados.seg,
    }),
  }));

export const fetchServicos = async (): Promise<OrdemServico[]> =>
  (await apiRequest<ServicoApi[]>(`/servicos?limit=${LIST_LIMIT}`)).map(toServico);

export const fetchMetas = async (): Promise<Meta[]> =>
  (await apiRequest<MetaApi[]>(`/metas?limit=${LIST_LIMIT}`)).map(toMeta);

export const fetchFinanciamentos = async (): Promise<Financiamento[]> =>
  (await apiRequest<FinanciamentoApi[]>(`/financiamentos?limit=${LIST_LIMIT}`)).map(toFinanciamento);

export const fetchAvaliacoes = async (): Promise<Avaliacao[]> =>
  (await apiRequest<AvaliacaoApi[]>(`/avaliacoes?limit=${LIST_LIMIT}`)).map(toAvaliacao);

export const fetchTecnicos = async (): Promise<Tecnico[]> =>
  (await apiRequest<TecnicoApi[]>(`/tecnicos?limit=${LIST_LIMIT}`)).map(toTecnico);

/** POST /servicos — `numero` é obrigatório e único; prioridade começa em OK. */
export const createServico = async (
  dados: Pick<OrdemServico, 'num' | 'c' | 'v' | 't' | 'tech' | 'prazo' | 'val'>,
): Promise<OrdemServico> =>
  toServico(await apiRequest<ServicoApi>('/servicos', {
    method: 'POST',
    body: JSON.stringify({
      numero: dados.num,
      cliente: dados.c,
      veiculo: dados.v,
      tipo: dados.t,
      tecnico: dados.tech,
      prazo: dados.prazo,
      valor: dados.val,
      prioridade: 'OK',
      status: 'PREVISTO',
    }),
  }));

export const updateServico = async (
  uuid: string,
  dados: Partial<Pick<OrdemServico, 'c' | 'v' | 't' | 'tech' | 'prazo' | 'val'>>,
): Promise<OrdemServico> => {
  const campos: Record<string, string> = {};
  if (dados.c !== undefined) campos.cliente = dados.c;
  if (dados.v !== undefined) campos.veiculo = dados.v;
  if (dados.t !== undefined) campos.tipo = dados.t;
  if (dados.tech !== undefined) campos.tecnico = dados.tech;
  if (dados.prazo !== undefined) campos.prazo = dados.prazo;
  if (dados.val !== undefined) campos.valor = dados.val;
  return toServico(await apiRequest<ServicoApi>(`/servicos/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(campos),
  }));
};

export const moveServico = async (uuid: string, destino: OSSituacao): Promise<OrdemServico> =>
  toServico(await apiRequest<ServicoApi>(`/servicos/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: statusDaSituacao(destino) }),
  }));

/** DELETE devolve 204 sem corpo. */
export const deleteServico = (uuid: string): Promise<unknown> =>
  apiRequest(`/servicos/${uuid}`, { method: 'DELETE' });

/** POST /metas — `codigo` é único; unidade e lowerIsBetter derivam do indicador. */
export const createMeta = async (
  dados: Pick<Meta, 'titulo' | 'periodo' | 'indicador' | 'alvo' | 'unidade' | 'responsavel' | 'lowerIsBetter'>,
): Promise<Meta> =>
  toMeta(await apiRequest<MetaApi>('/metas', {
    method: 'POST',
    body: JSON.stringify({
      codigo: `M${Date.now().toString().slice(-6)}`,
      titulo: dados.titulo,
      periodo: dados.periodo,
      indicador: dados.indicador,
      atual: 0,
      alvo: dados.alvo,
      unidade: dados.unidade,
      responsavel: dados.responsavel,
      lowerIsBetter: dados.lowerIsBetter,
    }),
  }));

/** POST /financiamentos — status inicial PENDENTE. */
export const createFinanciamento = async (
  dados: Pick<Financiamento, 'cli' | 'ini' | 'veiculo' | 'valor' | 'entrada' | 'prazo' | 'taxa' | 'parcela' | 'data'>,
): Promise<Financiamento> =>
  toFinanciamento(await apiRequest<FinanciamentoApi>('/financiamentos', {
    method: 'POST',
    body: JSON.stringify({
      codigo: `F${Date.now().toString().slice(-6)}`,
      clienteNome: dados.cli,
      iniciais: dados.ini,
      veiculo: dados.veiculo,
      valor: dados.valor,
      entrada: dados.entrada,
      prazo: dados.prazo,
      taxa: dados.taxa,
      parcela: dados.parcela,
      status: 'PENDENTE',
      data: dados.data,
    }),
  }));

export interface AvaliacaoStats { total: number; notaMedia: number; }

export const fetchAvaliacaoStats = (): Promise<AvaliacaoStats> =>
  apiRequest<AvaliacaoStats>('/avaliacoes/stats');
