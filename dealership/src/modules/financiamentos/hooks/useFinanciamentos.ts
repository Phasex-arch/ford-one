/**
 * @file useFinanciamentos.ts
 * @module financiamentos
 * @description Hook de estado e lógica do módulo de Financiamentos.
 *
 * Gerencia:
 * - financiamentos: array de contratos (inicializado com data/financiamentos.data.ts)
 * - simOpen: visibilidade do modal Simulação de Financiamento
 * - contratoId: ID do contrato com modal aberto (null = fechado)
 * - Campos do simulador: simVei, simCli, simValor, simEntrada, simPrazo, simTaxa
 *
 * Cálculo de parcela:
 * Usa a fórmula de amortização Price (Sistema Francês):
 * PMT = PV × [i × (1+i)^n] / [(1+i)^n - 1]
 * onde PV = valor financiado, i = taxa mensal, n = prazo em meses.
 *
 * - saveFinSim → valida, calcula parcela, adiciona novo contrato como 'pendente'
 * - openFromEstoque → pré-preenche simulador com dados do veículo do estoque
 *
 * @param showToast → feedback de salvamento da simulação
 */

import { useState } from 'react';
import { FINANCIAMENTOS_INICIAL } from '../../../data/financiamentos.data';
import { ESTOQUE } from '../../../data/estoque.data';
import type { Financiamento } from '../../../types/global.types';
import type { ToastType } from '../../../shared/hooks/useToast';

export function useFinanciamentos(showToast:(m:string,t?:ToastType)=>void) {
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>(FINANCIAMENTOS_INICIAL);
  const [simOpen, setSimOpen] = useState(false);
  const [contratoId, setContratoId] = useState<string|null>(null);
  const [simVei, setSimVei] = useState(''); const [simCli, setSimCli] = useState('');
  const [simValor, setSimValor] = useState(199900); const [simEntrada, setSimEntrada] = useState(40000);
  const [simPrazo, setSimPrazo] = useState(48); const [simTaxa, setSimTaxa] = useState(1.49);

  const calcParcela = (valor=simValor, entrada=simEntrada, prazo=simPrazo, taxa=simTaxa) => {
    const fin=valor-entrada; const t=taxa/100;
    return Math.round(fin*(t*Math.pow(1+t,prazo))/(Math.pow(1+t,prazo)-1));
  };

  const saveFinSim = () => {
    if(!simCli||!simVei){showToast('Preencha cliente e veículo.','warning');return;}
    const parcela=calcParcela();
    const ini=simCli.split(' ').map((n:string)=>n[0]).slice(0,2).join('');
    setFinanciamentos(p=>[{id:'F'+Date.now(),cli:simCli,ini,veiculo:simVei,valor:simValor,entrada:simEntrada,prazo:simPrazo,taxa:simTaxa,parcela,status:'pendente',data:'Agora'},...p]);
    setSimOpen(false); showToast(`Simulação salva: ${simCli}!`,'success');
  };

  const openFromEstoque = (eid: string) => {
    const e=ESTOQUE.find(x=>x.id===eid); if(!e) return;
    setSimVei(`${e.modelo} ${e.versao}`); setSimValor(e.preco); setSimOpen(true);
  };

  const contrato = contratoId ? financiamentos.find(f=>f.id===contratoId) : null;

  return { financiamentos, simOpen, setSimOpen, contratoId, setContratoId, contrato,
           simVei, setSimVei, simCli, setSimCli, simValor, setSimValor, simEntrada, setSimEntrada,
           simPrazo, setSimPrazo, simTaxa, setSimTaxa, calcParcela, saveFinSim, openFromEstoque };
}