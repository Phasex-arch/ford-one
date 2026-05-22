/**
 * @file useFinanciamentos.ts
 * @module financiamentos
 * @description Hook de estado e lógica do módulo de Financiamentos.
 *
 * - `financiamentos` carrega da API GET /api/v1/financiamentos.
 * - `saveFinSim` calcula a parcela (Sistema Price) e cria o contrato via POST.
 * - `openFromEstoque` pre-preenche o simulador com dados de um item do
 *   estoqueStore (cache populado pelo bootstrap / useEstoque).
 *
 * Cálculo de parcela (Sistema Price):
 *   PMT = PV × [i × (1+i)^n] / [(1+i)^n - 1]
 *   PV = valor financiado, i = taxa mensal, n = prazo em meses
 */

import { useCallback, useEffect, useState } from 'react';
import * as financiamentosApi from '../../../shared/api/resources/financiamentos';
import { estoqueStore } from '../../../shared/api/cache';
import { extractErrorMessage } from '../../../shared/api/http';
import type { Financiamento } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';

export function useFinanciamentos(showToast:(m:string,t?:ToastType)=>void) {
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simOpen, setSimOpen] = useState(false);
  const [contratoId, setContratoId] = useState<string|null>(null);
  const [simVei, setSimVei] = useState(''); const [simCli, setSimCli] = useState('');
  const [simValor, setSimValor] = useState(199900); const [simEntrada, setSimEntrada] = useState(40000);
  const [simPrazo, setSimPrazo] = useState(48); const [simTaxa, setSimTaxa] = useState(1.49);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await financiamentosApi.list({ limit: 100 });
      setFinanciamentos(list);
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao carregar financiamentos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const calcParcela = (valor=simValor, entrada=simEntrada, prazo=simPrazo, taxa=simTaxa) => {
    const fin=valor-entrada; const t=taxa/100;
    if (fin <= 0 || t <= 0 || prazo <= 0) return 0;
    return Math.round(fin*(t*Math.pow(1+t,prazo))/(Math.pow(1+t,prazo)-1));
  };

  const saveFinSim = useCallback(async () => {
    if (!simCli || !simVei) { showToast('Preencha cliente e veículo.','warning'); return; }
    const parcela = calcParcela();
    const ini = simCli.split(' ').map((n:string)=>n[0]).slice(0,2).join('').toUpperCase();
    try {
      const novo = await financiamentosApi.create(
        {
          cli: simCli,
          ini,
          veiculo: simVei,
          valor: simValor,
          entrada: simEntrada,
          prazo: simPrazo,
          taxa: simTaxa,
          parcela,
          status: 'pendente',
          data: new Date().toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
        },
        `F${Date.now().toString().slice(-6)}`
      );
      setFinanciamentos(p => [novo, ...p]);
      setSimOpen(false);
      showToast(`Simulação salva: ${simCli}!`,'success');
    } catch (err) {
      showToast(extractErrorMessage(err, 'Falha ao salvar simulação.'), 'error');
    }
  }, [simCli, simVei, simValor, simEntrada, simPrazo, simTaxa, showToast]);

  const openFromEstoque = (eid: string) => {
    const e = estoqueStore.get().find(x => x.id === eid);
    if (!e) return;
    setSimVei(`${e.modelo} ${e.versao}`);
    setSimValor(e.preco);
    setSimOpen(true);
  };

  const contrato = contratoId ? financiamentos.find(f=>f.id===contratoId) : null;

  return {
    financiamentos, loading, error, simOpen, setSimOpen, contratoId, setContratoId, contrato,
    simVei, setSimVei, simCli, setSimCli, simValor, setSimValor, simEntrada, setSimEntrada,
    simPrazo, setSimPrazo, simTaxa, setSimTaxa, calcParcela, saveFinSim, openFromEstoque,
    refresh,
  };
}
