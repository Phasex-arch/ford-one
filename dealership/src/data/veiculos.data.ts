/**
 * @file veiculos.data.ts
 * @description Dados mockados de veículos por cliente, indexados por ID de cliente.
 * Cada veículo possui: especificações, status (ativo/vendido/substituído),
 * linha do tempo de serviços (hist), dados financeiros (fin) e insights de IA (ins).
 * Imagens definidas como null — exibem placeholder SVG no sistema.
 *
 * Em produção: substituir por chamada GET /api/clientes/:id/veiculos.
 */

import type { Veiculo } from '../types/global.types';

export const VEICULOS: Record<string, Veiculo[]> = {
  C001: [
    { id:'VC001A', modelo:'Ford Bronco Sport', versao:'Badlands 2.0 EcoBoost AT6', ano:'2024/2024', cor:'Azul Arizona', km:'12.450', aq:'Mar 2024', saida:null, status:'ativo', atual:true, ult:'Revisão 10.000 km', img:null,
      hist:[{d:'Jan 2026',ev:'Revisão 10.000 km',det:'Troca de óleo, filtros e verificação geral',val:'R$ 1.240'},{d:'Mar 2024',ev:'Aquisição',det:'Compra via financiamento Ford Financeira',val:'R$ 189.900'}],
      fin:{custo:'R$ 191.140',ticket:'R$ 1.240',est:'R$ 175.000'},
      ins:['Revisão 20.000 km prevista para Jul/2026','Alto potencial para acessórios off-road','Perfil: uso intenso aos fins de semana'] },
    { id:'VC001B', modelo:'Ford Ranger Storm', versao:'3.0 V6 Diesel 4x4 AT10', ano:'2022/2022', cor:'Cinza Magnético', km:'48.200', aq:'Mai 2022', saida:'Mar 2024', status:'vendido', atual:false, ult:'Revisão 45.000 km', img:null,
      hist:[{d:'Jan 2024',ev:'Revisão 45.000 km',det:'Troca correias, fluidos e pastilhas',val:'R$ 3.800'},{d:'Mai 2022',ev:'Aquisição',det:'Compra à vista',val:'R$ 248.000'},{d:'Mar 2024',ev:'Venda/Troca',det:'Trocado por Bronco Sport',val:'—'}],
      fin:{custo:'R$ 259.800',ticket:'R$ 2.633',est:'—'},
      ins:['Trocou após 22 meses','Ciclo acelerado de troca','Provável interesse em Ranger 2026'] },
    { id:'VC001C', modelo:'Ford Ka Sedan', versao:'SE 1.5 Flex', ano:'2019/2020', cor:'Branco Ártico', km:'92.100', aq:'Fev 2020', saida:'Mai 2022', status:'substituido', atual:false, ult:'Revisão 90.000 km', img:null,
      hist:[{d:'Abr 2022',ev:'Revisão 90.000 km',det:'Revisão completa pré-venda',val:'R$ 1.800'},{d:'Fev 2020',ev:'Aquisição',det:'Compra parcelada',val:'R$ 68.900'},{d:'Mai 2022',ev:'Substituição',det:'Substituído por Ranger Storm',val:'—'}],
      fin:{custo:'R$ 78.400',ticket:'R$ 980',est:'—'},
      ins:['Primeiro Ford do cliente','Alta fidelidade à marca','Ciclo de posse: 28 meses'] },
  ],
  C002: [
    { id:'VC002A', modelo:'Ford Territory Titanium', versao:'1.5 EcoBoost AT7', ano:'2026/2026', cor:'Branco Platinum', km:'3.200', aq:'Jan 2026', saida:null, status:'ativo', atual:true, ult:'Revisão 1.000 km', img:null,
      hist:[{d:'Fev 2026',ev:'Revisão 1.000 km',det:'Revisão inicial de rodagem',val:'R$ 380'},{d:'Jan 2026',ev:'Aquisição',det:'Compra via Ford Financeira',val:'R$ 179.900'}],
      fin:{custo:'R$ 180.280',ticket:'R$ 380',est:'R$ 172.000'},
      ins:['Próxima revisão em 10.000 km','Perfil família — interesse em acessórios','Oportunidade de plano de manutenção'] },
    { id:'VC002B', modelo:'Ford Maverick Hybrid', versao:'XLT FWD 2.5 Hybrid', ano:'2022/2022', cor:'Azul Stellar', km:'54.800', aq:'Jun 2022', saida:'Dez 2024', status:'vendido', atual:false, ult:'Revisão 50.000 km', img:null,
      hist:[{d:'Nov 2024',ev:'Revisão 50.000 km',det:'Serviço completo',val:'R$ 1.900'},{d:'Jun 2022',ev:'Aquisição',det:'Compra à vista',val:'R$ 169.900'},{d:'Dez 2024',ev:'Venda',det:'Substituído por Territory Titanium',val:'—'}],
      fin:{custo:'R$ 178.600',ticket:'R$ 1.266',est:'—'},
      ins:['Upgrade para SUV maior','Família em crescimento','LTV gerado: R$ 178.600'] },
  ],
  C004: [
    { id:'VC004A', modelo:'Ford Bronco Sport', versao:'Outer Banks 2.0 EcoBoost', ano:'2023/2024', cor:'Cactus Gray', km:'22.100', aq:'Dez 2023', saida:null, status:'ativo', atual:true, ult:'Revisão 20.000 km', img:null,
      hist:[{d:'Mar 2026',ev:'Revisão 20.000 km',det:'Serviço completo + troca de pneus',val:'R$ 3.400'},{d:'Dez 2023',ev:'Aquisição',det:'Compra via financiamento',val:'R$ 184.900'}],
      fin:{custo:'R$ 188.300',ticket:'R$ 1.700',est:'R$ 168.000'},
      ins:['Revisão 30.000 km em Set/2026','Interesse histórico em acessórios','Padrão de troca: ~24 meses'] },
  ],
  C007: [
    { id:'VC007A', modelo:'Ford Bronco Sport', versao:'Wildtrak 2.0 EcoBoost', ano:'2024/2024', cor:'Eruption Green', km:'8.900', aq:'Ago 2024', saida:null, status:'ativo', atual:true, ult:'Revisão 5.000 km', img:null,
      hist:[{d:'Dez 2024',ev:'Revisão 5.000 km',det:'Revisão inicial',val:'R$ 780'},{d:'Ago 2024',ev:'Aquisição',det:'Compra à vista',val:'R$ 194.900'}],
      fin:{custo:'R$ 195.680',ticket:'R$ 780',est:'R$ 185.000'},
      ins:['Cliente VIP — atendimento prioritário','4 veículos no histórico','LTV total: R$ 721.400'] },
  ],
};
