/**
 * @file servicos.data.ts
 * @description Dados mockados das Ordens de Serviço em três categorias:
 * previstos, andamento e concluídos.
 * Exporta ServicoStore (interface do store mutável) e SERVICOS_INICIAL (dados base).
 *
 * Atenção: o store em servicos.service.ts é mutável em memória. Em produção,
 * substituir por chamadas CRUD na API (/api/os).
 */

import type { OrdemServico } from '../types/global.types';

export interface ServicoStore {
  previstos: OrdemServico[];
  andamento: OrdemServico[];
  concluidos: OrdemServico[];
}

export const SERVICOS_INICIAL: ServicoStore = {
  previstos: [
    { num:'#4831', c:'Carlos Mendes',   v:'Bronco Sport 2024',  t:'Revisão 20.000 km',          tech:'André Souza',   prazo:'Hoje, 14:00',   pc:'risco',   val:'R$ 1.840' },
    { num:'#4832', c:'Ana Rodrigues',   v:'Territory 2023',     t:'Alinhamento + balanceamento', tech:'Eduardo Lima',  prazo:'Hoje, 16:00',   pc:'ok',      val:'R$ 480'   },
    { num:'#4833', c:'Fernanda Costa',  v:'Ranger Storm 2022',  t:'Revisão 30.000 km',           tech:'André Souza',   prazo:'Amanhã, 09:00', pc:'ok',      val:'R$ 3.200' },
    { num:'#4834', c:'Paulo Almeida',   v:'Maverick 2024',      t:'Troca de pneus',              tech:'Marcos Vieira', prazo:'Amanhã, 11:00', pc:'ok',      val:'R$ 2.100' },
    { num:'#4835', c:'Beatriz Neves',   v:'Ka Sedan 2021',      t:'Revisão 15.000 km',           tech:'Eduardo Lima',  prazo:'22/04, 09:00',  pc:'ok',      val:'R$ 1.100' },
  ],
  andamento: [
    { num:'#4821', c:'Juliana Cardoso', v:'Territory SE 2023',  t:'Reparo elétrico — Sensor airbag', tech:'Bruna Castro',   prazo:'Hoje, 12:00', pc:'atrasado', val:'R$ 2.400' },
    { num:'#4822', c:'Marcelo Pires',   v:'Ecosport 2020',      t:'Funilaria — Porta dianteira',     tech:'Diego Ferreira', prazo:'Hoje, 15:00', pc:'risco',    val:'R$ 4.200' },
    { num:'#4823', c:'Alexandre Torres',v:'Ranger Storm 2022',  t:'Substituição de correias',        tech:'André Souza',    prazo:'Hoje, 17:00', pc:'ok',       val:'R$ 1.900' },
  ],
  concluidos: [
    { num:'#4810', c:'José Melo',       v:'Ka Sedan 2020',      t:'Revisão 60.000 km',           tech:'André Souza',    prazo:'Ontem', pc:'ok', val:'R$ 2.100' },
    { num:'#4811', c:'Mariana Silva',   v:'Territory 2022',     t:'Alinhamento e balanceamento', tech:'Eduardo Lima',   prazo:'Ontem', pc:'ok', val:'R$ 480'   },
    { num:'#4812', c:'Paulo Almeida',   v:'Bronco Sport 2024',  t:'Revisão 10.000 km',           tech:'Marcos Vieira',  prazo:'Ontem', pc:'ok', val:'R$ 1.240' },
    { num:'#4813', c:'Fernanda Costa',  v:'Maverick 2024',      t:'Instalação de acessórios',    tech:'Diego Ferreira', prazo:'Ontem', pc:'ok', val:'R$ 3.800' },
  ],
};
