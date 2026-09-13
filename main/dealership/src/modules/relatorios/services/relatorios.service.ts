/**
 * @file relatorios.service.ts
 * @module relatorios
 * @description Geração dos 6 relatórios com exportação CSV real — os únicos
 * com dado real e completo no sistema hoje (Clientes, Estoque, Leads,
 * Financiamentos, Metas, Serviços). DRE Gerencial, NPS, Giro de Estoque e
 * Performance de Consultores ficam de fora por enquanto: sem fonte de dado
 * real o bastante pra virar relatório exportável ainda.
 *
 * Cada builder pagina até esgotar os registros (o backend limita 100 por
 * página) e mapeia pra colunas em português, prontas pro CSV.
 */

import { downloadCsv } from '../../../shared/utils/csv';
import { apiRequest, type PaginatedResponse } from '../../../shared/api/client';
import { fetchClientes } from '../../clientes/services/clientes.service';
import { fetchEstoque } from '../../estoque/services/estoque.service';
import { fetchLeads } from '../../leads/services/leads.service';
import { fetchFinanciamentos } from '../../financiamentos/services/financiamentos.service';
import { fetchMetas } from '../../metas/services/metas.service';
import { formatCurrency } from '../../../shared/utils/formatters';

const PAGE_LIMIT = 100;

async function fetchAllPaginated<T>(
  fetchPage: (page: number) => Promise<{ data: T[]; pagination: { hasNext: boolean } }>,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  for (;;) {
    const res = await fetchPage(page);
    all.push(...res.data);
    if (!res.pagination.hasNext) break;
    page += 1;
  }
  return all;
}

export type RelatorioKey = 'clientes' | 'estoque' | 'leads' | 'financiamentos' | 'metas' | 'servicos';

async function rowsClientes() {
  const items = await fetchAllPaginated((page) => fetchClientes({ page, limit: PAGE_LIMIT }));
  return items.map(c => ({
    Nome: c.nome, Telefone: c.tel, Email: c.email, Status: c.status,
    Segmento: c.seg, Veiculos: c.v, LTV: formatCurrency(c.ltv), 'Ultima Visita': c.ult,
  }));
}

async function rowsEstoque() {
  const items = await fetchAllPaginated((page) => fetchEstoque({ page, limit: PAGE_LIMIT }));
  return items.map(e => ({
    Modelo: e.modelo, Versao: e.versao, Ano: e.ano, Motor: e.motor, Transmissao: e.trans,
    Condicao: e.cond, Status: e.status, Preco: formatCurrency(e.preco), Segmento: e.seg,
    Cor: e.cor, Quantidade: e.estq, KM: e.km ?? '',
  }));
}

async function rowsLeads() {
  const items = await fetchAllPaginated((page) => fetchLeads({ page, limit: PAGE_LIMIT }));
  return items.map(l => ({
    Cliente: l.cli, Telefone: l.tel, Email: l.email ?? '', 'Veiculo de Interesse': l.v,
    Necessidade: l.nec, Urgencia: l.urg, 'Valor Estimado': formatCurrency(l.val),
  }));
}

async function rowsFinanciamentos() {
  const items = await fetchAllPaginated((page) => fetchFinanciamentos({ page, limit: PAGE_LIMIT }));
  return items.map(f => ({
    Codigo: f.codigo, Cliente: f.cli, Veiculo: f.veiculo, Status: f.status,
    Valor: formatCurrency(f.valor), Entrada: formatCurrency(f.entrada),
    Parcela: formatCurrency(f.parcela), Prazo: f.prazo, Taxa: f.taxa + '%', Data: f.data,
  }));
}

async function rowsMetas() {
  const items = await fetchAllPaginated((page) => fetchMetas({ page, limit: PAGE_LIMIT }));
  return items.map(m => ({
    Codigo: m.codigo, Titulo: m.titulo, Periodo: m.periodo, Indicador: m.indicador,
    Realizado: m.atual, Meta: m.alvo, Unidade: m.unidade, Responsavel: m.responsavel,
  }));
}

interface ServicoApi {
  numero: string; cliente: string; veiculo: string; tipo: string; tecnico: string;
  prazo: string; prioridade: string; valor: number; status: string;
}

async function rowsServicos() {
  const items = await fetchAllPaginated(async (page) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
    const res = await apiRequest<PaginatedResponse<ServicoApi>>(`/servicos?${qs}`);
    return res;
  });
  return items.map(s => ({
    Numero: s.numero, Cliente: s.cliente, Veiculo: s.veiculo, Tipo: s.tipo,
    Tecnico: s.tecnico, Prazo: s.prazo, Prioridade: s.prioridade,
    Valor: formatCurrency(s.valor), Status: s.status,
  }));
}

const BUILDERS: Record<RelatorioKey, () => Promise<Record<string, string | number>[]>> = {
  clientes: rowsClientes,
  estoque: rowsEstoque,
  leads: rowsLeads,
  financiamentos: rowsFinanciamentos,
  metas: rowsMetas,
  servicos: rowsServicos,
};

const FILENAMES: Record<RelatorioKey, string> = {
  clientes: 'clientes',
  estoque: 'estoque',
  leads: 'leads',
  financiamentos: 'financiamentos',
  metas: 'metas',
  servicos: 'ordens-de-servico',
};

const ULTIMO_EXPORT_PREFIX = 'ford_relatorio_ultimo_export_';

export function getUltimoExport(key: RelatorioKey): string | null {
  try {
    return localStorage.getItem(ULTIMO_EXPORT_PREFIX + key);
  } catch {
    return null;
  }
}

function marcarUltimoExport(key: RelatorioKey): void {
  try {
    localStorage.setItem(ULTIMO_EXPORT_PREFIX + key, new Date().toISOString());
  } catch {
    // localStorage indisponível (modo privado etc.) — sem problema, só não fica o histórico local.
  }
}

export async function exportarRelatorio(key: RelatorioKey): Promise<void> {
  const rows = await BUILDERS[key]();
  const data = new Date().toISOString().slice(0, 10);
  downloadCsv(`${FILENAMES[key]}_${data}.csv`, rows);
  marcarUltimoExport(key);
}
