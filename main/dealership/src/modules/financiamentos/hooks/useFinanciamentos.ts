/**
 * @file useFinanciamentos.ts
 * @module financiamentos
 * @description Hook de estado e lógica do módulo de Financiamentos.
 *
 * Gerencia:
 * - financiamentos/pagination/loading/error: página real de GET /api/financiamentos
 * - simOpen: visibilidade do modal Simulação de Financiamento
 * - contratoId: ID do contrato com modal aberto (null = fechado)
 * - Campos do simulador: simVei, simCli, simValor, simEntrada, simPrazo, simTaxa
 *
 * Cálculo de parcela (client-side, não é dado fictício — é matemática pura):
 * Usa a fórmula de amortização Price (Sistema Francês):
 * PMT = PV × [i × (1+i)^n] / [(1+i)^n - 1]
 * onde PV = valor financiado, i = taxa mensal, n = prazo em meses.
 *
 * - saveFinSim → valida, calcula parcela, persiste via POST /api/financiamentos
 *   (nasce como 'analise' — default do schema) e recarrega a lista
 * - emAndamento/contratosAtivos/reprovados → a mesma página de resultados
 *   agrupada por status, espelhando o processo real de financiamento de
 *   veículo: simulação/proposta em análise → banco aprova (vira contrato
 *   ativo, conta como carteira/receita) ou reprova (só fica de histórico).
 * - aprovar/reprovar → PATCH de status (ADMIN/GERENTE no backend)
 *
 * @param showToast → feedback de salvamento da simulação
 */

import { useState, useCallback, useEffect } from 'react';
import {
  fetchFinanciamentos, createFinanciamento, deleteFinanciamento, updateFinanciamentoStatus,
} from '../services/financiamentos.service';
import { fetchLeads } from '../../leads/services/leads.service';
import { fetchEstoque } from '../../estoque/services/estoque.service';
import type { Financiamento, Lead, Estoque } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';
import { friendlyApiMessage, type PaginationMeta } from '../../../shared/api/client';
import { MONTHS } from '../../../shared/utils/dates';

const PAGE_SIZE = 20;

/** "Mar 2026" — mesmo formato usado pelos contratos históricos (data/seed). */
const mesAnoAtual = (): string => {
  const d = new Date();
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

export function useFinanciamentos(showToast: (m: string, t?: ToastType) => void) {
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simOpen, setSimOpen] = useState(false);
  const [contratoId, setContratoId] = useState<string | null>(null);
  const [simVei, setSimVei] = useState(''); const [simCli, setSimCli] = useState('');
  const [simValor, setSimValor] = useState(199900); const [simEntrada, setSimEntrada] = useState(40000);
  const [simPrazo, setSimPrazo] = useState(48); const [simTaxa, setSimTaxa] = useState(1.49);
  const [deleteTarget, setDeleteTarget] = useState<Financiamento | null>(null);
  // Lead/estoque de origem — opcionais, mas sem eles a aprovação não dispara
  // a conversão automática em Cliente nem a baixa de estoque (seção 0 da
  // auditoria). Carregados uma vez ao montar, igual ao padrão de Metas.
  const [leadsAbertos, setLeadsAbertos] = useState<Lead[]>([]);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState<Estoque[]>([]);
  const [simLeadId, setSimLeadId] = useState('');
  const [simEstoqueId, setSimEstoqueId] = useState('');

  useEffect(() => {
    fetchLeads({ page: 1, limit: 100 })
      .then(res => setLeadsAbertos(res.data.filter(l => !l.convertido)))
      .catch(() => setLeadsAbertos([]));
    fetchEstoque({ page: 1, limit: 100 })
      .then(res => setEstoqueDisponivel(res.data.filter(e => e.estq > 0)))
      .catch(() => setEstoqueDisponivel([]));
  }, []);

  const selecionarLead = (leadId: string) => {
    setSimLeadId(leadId);
    const lead = leadsAbertos.find(l => l.id === leadId);
    if (lead) setSimCli(lead.cli);
  };

  const selecionarEstoque = (estoqueId: string) => {
    setSimEstoqueId(estoqueId);
    const item = estoqueDisponivel.find(e => e.id === estoqueId);
    if (item) setSimVei(`${item.modelo} ${item.versao}`);
  };

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchFinanciamentos({ page, limit: PAGE_SIZE });
      setFinanciamentos(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(friendlyApiMessage(e));
      setFinanciamentos([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { reload(); }, [reload]);

  const calcParcela = (valor = simValor, entrada = simEntrada, prazo = simPrazo, taxa = simTaxa) => {
    const fin = valor - entrada; const t = taxa / 100;
    return Math.round(fin * (t * Math.pow(1 + t, prazo)) / (Math.pow(1 + t, prazo) - 1));
  };

  const saveFinSim = (responsavelId?: string) => {
    if (!simCli || !simVei) { showToast('Preencha cliente e veículo.', 'warning'); return; }
    const parcela = calcParcela();
    const iniciais = simCli.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
    const data = mesAnoAtual();
    createFinanciamento({
      codigo: 'F' + Date.now().toString().slice(-8),
      clienteNome: simCli, iniciais, veiculo: simVei,
      valor: simValor, entrada: simEntrada, prazo: simPrazo, taxa: simTaxa, parcela, data,
      responsavelId,
      leadId: simLeadId || undefined,
      estoqueVeiculoId: simEstoqueId || undefined,
    }).then(() => {
      setSimOpen(false);
      setSimLeadId(''); setSimEstoqueId('');
      setPage(1);
      reload();
      showToast(`Simulação salva: ${simCli}!`, 'success');
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  };

  const confirmarExclusao = () => {
    if (!deleteTarget) return;
    deleteFinanciamento(deleteTarget.id).then(() => {
      setDeleteTarget(null);
      setContratoId(null);
      reload();
      showToast(`Simulação de ${deleteTarget.cli} excluída.`, 'success');
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  };

  /**
   * Alerta o que a aprovação disparou automaticamente (ver auditoria,
   * seção 0) — sem lead de origem, aprovar só vira contrato ativo mesmo;
   * com lead, o lead também é convertido em cliente na hora, e é isso que
   * a mensagem avisa (em vez de uma seção separada pra navegar depois).
   */
  const decidir = (id: string, status: 'aprovado' | 'reprovado', cli: string) => {
    updateFinanciamentoStatus(id, status).then(financiamento => {
      reload();
      if (status === 'aprovado') {
        showToast(
          financiamento.temLeadOrigem
            ? `Financiamento de ${cli} aprovado — lead convertido em cliente automaticamente!`
            : `Financiamento de ${cli} aprovado — virou contrato ativo!`,
          'success',
        );
      } else {
        showToast(`Financiamento de ${cli} reprovado.`, 'warning');
      }
    }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
  };

  const contrato = contratoId ? financiamentos.find(f => f.id === contratoId) : null;

  // Agrupamento por status — mesmo processo de financiamento de veículo no
  // mundo real: PENDENTE/ANALISE = proposta em decisão, APROVADO = contrato
  // ativo (carteira de verdade), REPROVADO = encerrado sem sucesso.
  const emAndamento = financiamentos.filter(f => f.status === 'pendente' || f.status === 'analise');
  const contratosAtivos = financiamentos.filter(f => f.status === 'aprovado');
  const reprovados = financiamentos.filter(f => f.status === 'reprovado');

  return { financiamentos, pagination, page, setPage, loading, error,
           simOpen, setSimOpen, contratoId, setContratoId, contrato,
           simVei, setSimVei, simCli, setSimCli, simValor, setSimValor, simEntrada, setSimEntrada,
           simPrazo, setSimPrazo, simTaxa, setSimTaxa, calcParcela, saveFinSim,
           deleteTarget, setDeleteTarget, confirmarExclusao, decidir,
           emAndamento, contratosAtivos, reprovados,
           leadsAbertos, estoqueDisponivel, simLeadId, simEstoqueId, selecionarLead, selecionarEstoque };
}
