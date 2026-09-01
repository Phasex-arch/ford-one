/**
 * @file leads.data.ts
 * @description Dados mockados do pipeline de leads inteligentes.
 * 6 leads com urgência (urgente/alta/media/baixa), veículo de interesse,
 * necessidade identificada, valor estimado e insight gerado por IA.
 *
 * Em produção: substituir por chamada GET /api/leads.
 */

import type { Lead } from '../types/global.types';

export const LEADS: Lead[] = [
  { id:'L001', cli:'Carlos Silva',      ini:'CS', v:'Ford Ranger Storm 2026',    nec:'Upgrade de picape — vende Hilux',           urg:'urgente', val:299900, tel:'(11) 97788-4411', ins:'Cliente com histórico de troca a cada 2 anos. Hilux com 48.000 km — janela perfeita.' },
  { id:'L002', cli:'Maria Fernanda',    ini:'MF', v:'Ford Territory Titanium',   nec:'Primeiro carro próprio — quer parcelar',     urg:'alta',    val:179900, tel:'(11) 98811-2233', ins:'25 anos, recém-contratada. Perfil entrada com potencial VIP em 5 anos.' },
  { id:'L003', cli:'Rafael Costa',      ini:'RC', v:'Ford Mustang GT 5.0',       nec:'Colecionador — quer edição especial',        urg:'media',   val:389900, tel:'(11) 96644-0099', ins:'Alto poder aquisitivo. Já possui BMW M3. Decisão emocional.' },
  { id:'L004', cli:'Patrícia Nunes',    ini:'PN', v:'Ford Maverick Hybrid',      nec:'Substituir SUV urbano por picape compacta',  urg:'alta',    val:189900, tel:'(11) 99977-3344', ins:'Engenheira. Valoriza eficiência. Maverick Hybrid é diferencial decisivo.' },
  { id:'L005', cli:'Diego Almeida',     ini:'DA', v:'Ford Bronco Sport Badlands',nec:'Trilhas nos fins de semana',                 urg:'media',   val:209900, tel:'(11) 94455-6677', ins:'Perfil aventura. Já testou Jeep Compass. Badlands resolve objeção.' },
  { id:'L006', cli:'Camila Rocha',      ini:'CR', v:'Ford Ranger XLS',           nec:'Uso rural — fazenda no interior',            urg:'baixa',   val:219900, tel:'(11) 93322-5588', ins:'Proprietária rural. Decisão conjunta com cônjuge. Visita marcada.' },
];
