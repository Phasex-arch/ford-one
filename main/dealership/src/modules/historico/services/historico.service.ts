/**
 * @file historico.service.ts
 * @module historico
 * @description Service de acesso ao histórico de veículos de um cliente.
 * Busca em GET /api/clientes/:clienteId/veiculos (módulo veiculo-cliente do
 * backend) — cada registro representa um veículo que o cliente adquiriu.
 *
 * A "Linha do Tempo" (`hist`) é montada aqui a partir dos únicos eventos que
 * a API realmente sabe: aquisição e, se houver, venda/substituição — não há
 * histórico de serviços por veículo (isso exigiria ligar OrdemServico a um
 * veículo específico, o que não existe no schema hoje).
 */

import type { Veiculo, HistoricoItem } from '../../../types/global.types';
import { apiRequest } from '../../../shared/api/client';
import { formatCurrency } from '../../../shared/utils/formatters';

interface VeiculoClienteApi {
  id: string;
  modelo: string;
  versao: string;
  ano: string;
  cor: string;
  km?: string | null;
  imagem?: string | null;
  precoAquisicao: number;
  dataAquisicao: string;
  dataSaida?: string | null;
  status: 'ATIVO' | 'VENDIDO' | 'SUBSTITUIDO';
  atual: boolean;
}

const fmtData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

const toVeiculo = (item: VeiculoClienteApi): Veiculo => {
  const aq = fmtData(item.dataAquisicao);
  const saida = item.dataSaida ? fmtData(item.dataSaida) : null;
  const status = item.status.toLowerCase() as Veiculo['status'];

  const hist: HistoricoItem[] = [];
  if (saida) {
    hist.push({
      d: saida,
      ev: status === 'vendido' ? 'Venda' : 'Substituição',
      det: status === 'vendido' ? 'Veículo vendido' : 'Substituído por outro veículo',
      val: '—',
    });
  }
  hist.push({ d: aq, ev: 'Aquisição', det: 'Compra registrada', val: formatCurrency(item.precoAquisicao) });

  return {
    id: item.id,
    modelo: item.modelo,
    versao: item.versao,
    ano: item.ano,
    cor: item.cor,
    km: item.km ?? '—',
    aq,
    precoAquisicao: item.precoAquisicao,
    saida,
    status,
    atual: item.atual,
    ult: saida ? (status === 'vendido' ? 'Venda' : 'Substituição') : 'Aquisição',
    img: item.imagem ?? null,
    hist,
  };
};

export async function fetchVeiculosCliente(clienteId: string): Promise<Veiculo[]> {
  const items = await apiRequest<VeiculoClienteApi[]>(`/clientes/${clienteId}/veiculos`);
  return items.map(toVeiculo);
}
