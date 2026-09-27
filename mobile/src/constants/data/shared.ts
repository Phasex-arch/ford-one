// Dependency-free core: the mutable "active vehicle" bindings that get
// reassigned wholesale on a garage switch (vehicle, vehicleHealth, alerts,
// maintenance, tirePositions, historyTimeline, ecoScore, documents), plus
// `garage` (the 3 full vehicle bundles) and loadVehicleBundleData(), which
// does the reassigning.
//
// This file exists so state.js, history.js, costs.js and vehicleScreen.js
// can all depend on ONE shared base without depending on EACH OTHER —
// they used to import these bindings from one another directly (state.js
// importing setHistoryTimeline from history.js, history.js importing
// vehicle from state.js and getCostBreakdown from costs.js, costs.js
// importing historyTimeline from history.js and vehicle from state.js,
// vehicleScreen.js importing vehicle from state.js while state.js imported
// setEcoScore/setDocuments from it), which formed a real require cycle
// (state <-> history, state <-> vehicleScreen, and history <-> costs, all
// through state.js as the connecting node). It never caused a runtime bug
// (every cross-file read happens inside function bodies, never at module
// top level, so ES module live bindings always resolved correctly once a
// screen actually called a function) but it's a real cycle Metro warns
// about on every reload, and easy to remove for good: this module has ZERO
// imports of its own, so nothing that depends on it can cycle back into it.
//
// state.js, history.js and vehicleScreen.js each keep re-exporting their
// slice of this (same names, same shapes) so every existing import from
// '.../constants/data' (or './state', './history', './vehicleScreen')
// elsewhere in the app keeps working unchanged.

import type {
  Vehicle,
  VehicleHealth,
  VehicleAlert,
  TirePosition,
  MaintenanceData,
  HistoryEntry,
  EcoScore,
  DocumentItem,
  GarageBundle,
} from '../../types';

export let vehicle: Vehicle = {
  model: 'Ford Maverick Lariat 2025',
  name: 'Ford Maverick',
  trim: 'Lariat 2025',
  plate: 'ABC1D23',
  km: 28450,
  lastService: '15/07/2026',
  nextServiceKm: 30000,
  healthScore: 88,
  status: 'Boa',
  estimatedValue: 176900,
  color: 'Verde Eclipse',
  engine: '2.5 Hybrid',
  transmission: 'CVT',
  year: '2025',
  warrantyUntil: '07/2028',
  fuel: 'Flex',
  connected: true,
  fuelLevel: 62,
  range: 412,
  avgKmPerDay: 37,
  consumption: '11,3 km/L',
  consumptionKmL: 11.3,
  engineTemp: '89°C',
  parkedSince: '1h42',
  parkedDistance: '420 m',
  parkedAddress: 'Rua dos Ipês, 340 — São Paulo',
  photo: 'maverick',
};

export let vehicleHealth: VehicleHealth = {
  overall: 88,
  systems: [
    { id: 'motor', label: 'Motor', score: 96, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Estável nos últimos 30 dias.' },
    { id: 'bateria', label: 'Bateria', score: 89, status: 'ok', condition: 'Boa', note: 'Desempenho estável para o padrão de uso.', trend: 'Desempenho consistente com o padrão de uso.' },
    { id: 'freios', label: 'Freios', score: 76, status: 'warn', condition: 'Atenção', note: 'Desgaste identificado nas pastilhas dianteiras — inspeção recomendada.', trend: 'Desgaste 12% maior que no mês anterior.' },
    { id: 'pneus', label: 'Pneus', score: 84, status: 'ok', condition: 'Bom', note: 'Calibragem levemente abaixo do ideal no pneu traseiro esquerdo.', trend: 'Pressão caiu 5% nos últimos 7 dias.' },
    { id: 'oleo', label: 'Óleo', score: 78, status: 'warn', condition: 'Atenção', note: 'Vida útil se aproximando do limite recomendado.', trend: 'Consumo de vida útil 8% mais rápido que o previsto.' },
    { id: 'suspensao', label: 'Suspensão', score: 95, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Sem alterações relevantes.' },
    { id: 'eletrico', label: 'Sistema elétrico', score: 98, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Sem alterações relevantes.' },
    { id: 'fluidos', label: 'Fluidos', score: 93, status: 'ok', condition: 'Excelente', note: 'Níveis dentro do esperado.', trend: 'Níveis estáveis nas últimas verificações.' },
  ],
};

export let alerts: VehicleAlert[] = [
  {
    id: 'brake', level: 'Importante', type: 'danger', title: 'Desgaste nas pastilhas de freio',
    desc: 'Sistema identificou redução de espessura no eixo dianteiro.', system: 'freios',
    recommendation: 'Recomendamos verificar o sistema de freios na concessionária nos próximos 500 km para evitar desgaste adicional ao disco.',
    actions: [
      { label: 'Ver saúde dos freios', kind: 'system' },
      { label: 'Agendar verificação', kind: 'schedule', service: 'Verificação de freios' },
    ],
  },
  {
    id: 'oil', level: 'Atenção', type: 'warning', title: 'Troca de óleo se aproxima',
    desc: 'Estimativa de 300 km restantes até o limite recomendado.', system: 'oleo',
    recommendation: 'A vida útil estimada do óleo está em 78%. Uma troca preventiva evita desgaste do motor e mantém a garantia em dia.',
    actions: [
      { label: 'Ver saúde do óleo', kind: 'system' },
      { label: 'Agendar troca de óleo', kind: 'schedule', service: 'Troca de óleo' },
    ],
  },
  {
    id: 'tire', level: 'Informativo', type: 'accent', title: 'Calibragem dos pneus',
    desc: 'Pressão levemente abaixo do ideal no pneu traseiro esquerdo.', system: 'pneus',
    recommendation: 'Calibre os pneus na próxima oportunidade para manter o consumo e o desgaste equilibrados.',
    actions: [
      { label: 'Ver saúde dos pneus', kind: 'system' },
    ],
  },
];

// Pressão individual de cada pneu — drill-down do sistema "Pneus" acima
// (openTiresModal() no site), consistente com a nota desse sistema.
export let tirePositions: TirePosition[] = [
  { id: 'dianteiro-esquerdo', label: 'Dianteiro esquerdo', psi: 33, recommended: 35, status: 'ok' },
  { id: 'dianteiro-direito', label: 'Dianteiro direito', psi: 33, recommended: 35, status: 'ok' },
  { id: 'traseiro-esquerdo', label: 'Traseiro esquerdo', psi: 27, recommended: 35, status: 'warn' },
  { id: 'traseiro-direito', label: 'Traseiro direito', psi: 32, recommended: 35, status: 'ok' },
];

export let maintenance: MaintenanceData = {
  next: { title: 'Revisão dos 30.000 km', dueKm: 30000, dueDate: 'Outubro/2026', predictedDate: '18 de outubro', priority: 'Programada' },
  items: [
    { id: 'revisao', title: 'Revisão dos 30.000 km', meta: 'Faltam 1.550 km', tag: 'Programada', tagType: 'accent', dueInKm: 1550, serviceOption: 'Revisão dos 30.000 km', price: 'R$ 620', duration: '1h30', warrantyCovered: false, dealer: 'Ford Vila Ré' },
    { id: 'oleo', title: 'Troca de óleo e filtro', meta: 'Recomendado em até 30 dias', tag: 'Atenção', tagType: 'warning', dueInKm: 1200, serviceOption: 'Troca de óleo', price: 'R$ 280', duration: '40min', warrantyCovered: false, dealer: 'Ford Vila Ré' },
    { id: 'rodizio', title: 'Rodízio de pneus', meta: 'Recomendado a cada 10.000 km', tag: 'Preventiva', tagType: 'neutral', dueInKm: 2500, serviceOption: 'Outro', price: 'R$ 90', duration: '30min', warrantyCovered: false, dealer: 'Ford Vila Ré' },
    { id: 'freios', title: 'Verificação do sistema de freios', meta: 'Desgaste identificado nas pastilhas dianteiras', tag: 'Atenção', tagType: 'warning', serviceOption: 'Verificação de freios', price: 'R$ 410', duration: '1h', warrantyCovered: true, dealer: 'Ford Vila Ré' },
  ],
  completed: [
    { title: 'Revisão dos 20.000 km', date: '15/07/2026', cost: 'R$ 620' },
    { title: 'Troca de pneus dianteiros', date: '02/04/2026', cost: 'R$ 1.480' },
    { title: 'Revisão dos 10.000 km', date: '18/11/2025', cost: 'R$ 540' },
  ],
  recalls: [],
};

// "Seu Ford em [mês]"/Histórico — igual ao `history` do site.
export let historyTimeline: HistoryEntry[] = [
  { date: '15/07/2026', km: '27.100 km', title: 'Revisão dos 20.000 km', place: 'Concessionária Ford Vila Ré', cost: 'R$ 620' },
  { date: '02/04/2026', km: '21.800 km', title: 'Troca de pneus dianteiros', place: 'Concessionária Ford Vila Ré', cost: 'R$ 1.480' },
  { date: '09/01/2026', km: '16.200 km', title: 'Reparo no sistema de ar-condicionado', place: 'Concessionária Ford ABC', cost: 'R$ 340' },
  { date: '18/11/2025', km: '10.050 km', title: 'Revisão dos 10.000 km', place: 'Concessionária Ford Vila Ré', cost: 'R$ 540' },
  { date: '22/08/2025', km: '3.400 km', title: 'Compra do veículo', place: 'Concessionária Ford Vila Ré', cost: '—' },
];

export function setHistoryTimeline(next: HistoryEntry[]) {
  historyTimeline = next;
}

// Eco Score — igual ao `ecoIndicators`/`ecoScore` do site, mesclados aqui
// (ver nota em vehicleScreen.js).
export let ecoScore: EcoScore = {
  score: 86,
  previousScore: 78,
  indicators: [
    { label: 'Aceleração', value: 82 },
    { label: 'Frenagem', value: 79 },
    { label: 'Velocidade', value: 91 },
    { label: 'Marcha lenta', value: 88 },
    { label: 'Eficiência', value: 90 },
  ],
};

export function setEcoScore(next: EcoScore) {
  ecoScore = next;
}

// "Documentos" — igual ao `documents` do site.
export let documents: DocumentItem[] = [
  { name: 'CRLV', status: 'Ativo', validUntil: '31/12/2026' },
  { name: 'Manual do proprietário', status: 'Disponível', validUntil: null },
  { name: 'Apólice de seguro', status: 'Ativo', validUntil: '11/10/2026' },
  { name: 'Nota fiscal', status: 'Disponível', validUntil: null },
  { name: 'Comprovantes de revisão', status: 'Disponível', validUntil: null },
];

export function setDocuments(next: DocumentItem[]) {
  documents = next;
}

// --- Garagem (multi-veículo) -----------------------------------------------

export const garage: GarageBundle[] = [
  {
    vehicle: {
      model: 'Ford Maverick Lariat 2025', name: 'Ford Maverick', trim: 'Lariat 2025',
      plate: 'ABC1D23', km: 28450, lastService: '15/07/2026', nextServiceKm: 30000,
      healthScore: 88, status: 'Boa', estimatedValue: 176900, color: 'Verde Eclipse',
      engine: '2.5 Hybrid', transmission: 'CVT', year: '2025', warrantyUntil: '07/2028',
      fuel: 'Flex', connected: true, fuelLevel: 62, range: 412, avgKmPerDay: 37,
      consumption: '11,3 km/L', consumptionKmL: 11.3, photo: 'maverick',
      engineTemp: '89°C', parkedSince: '1h42', parkedDistance: '420 m', parkedAddress: 'Rua dos Ipês, 340 — São Paulo',
    },
    health: {
      overall: 88,
      systems: [
        { id: 'motor', label: 'Motor', score: 96, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Estável nos últimos 30 dias.' },
        { id: 'bateria', label: 'Bateria', score: 89, status: 'ok', condition: 'Boa', note: 'Desempenho estável para o padrão de uso.', trend: 'Desempenho consistente com o padrão de uso.' },
        { id: 'freios', label: 'Freios', score: 76, status: 'warn', condition: 'Atenção', note: 'Desgaste identificado nas pastilhas dianteiras — inspeção recomendada.', trend: 'Desgaste 12% maior que no mês anterior.' },
        { id: 'pneus', label: 'Pneus', score: 84, status: 'ok', condition: 'Bom', note: 'Calibragem levemente abaixo do ideal no pneu traseiro esquerdo.', trend: 'Pressão caiu 5% nos últimos 7 dias.' },
        { id: 'oleo', label: 'Óleo', score: 78, status: 'warn', condition: 'Atenção', note: 'Vida útil se aproximando do limite recomendado.', trend: 'Consumo de vida útil 8% mais rápido que o previsto.' },
        { id: 'suspensao', label: 'Suspensão', score: 95, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Sem alterações relevantes.' },
        { id: 'eletrico', label: 'Sistema elétrico', score: 98, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Sem alterações relevantes.' },
        { id: 'fluidos', label: 'Fluidos', score: 93, status: 'ok', condition: 'Excelente', note: 'Níveis dentro do esperado.', trend: 'Níveis estáveis nas últimas verificações.' },
      ],
    },
    alerts: [
      { id: 'brake', level: 'Importante', type: 'danger', title: 'Desgaste nas pastilhas de freio', desc: 'Sistema identificou redução de espessura no eixo dianteiro.', system: 'freios', recommendation: 'Recomendamos verificar o sistema de freios na concessionária nos próximos 500 km para evitar desgaste adicional ao disco.', actions: [{ label: 'Ver saúde dos freios', kind: 'system' }, { label: 'Agendar verificação', kind: 'schedule', service: 'Verificação de freios' }] },
      { id: 'oil', level: 'Atenção', type: 'warning', title: 'Troca de óleo se aproxima', desc: 'Estimativa de 300 km restantes até o limite recomendado.', system: 'oleo', recommendation: 'A vida útil estimada do óleo está em 78%. Uma troca preventiva evita desgaste do motor e mantém a garantia em dia.', actions: [{ label: 'Ver saúde do óleo', kind: 'system' }, { label: 'Agendar troca de óleo', kind: 'schedule', service: 'Troca de óleo' }] },
      { id: 'tire', level: 'Informativo', type: 'accent', title: 'Calibragem dos pneus', desc: 'Pressão levemente abaixo do ideal no pneu traseiro esquerdo.', system: 'pneus', recommendation: 'Calibre os pneus na próxima oportunidade para manter o consumo e o desgaste equilibrados.', actions: [{ label: 'Ver saúde dos pneus', kind: 'system' }] },
    ],
    maintenance: {
      next: { title: 'Revisão dos 30.000 km', dueKm: 30000, dueDate: 'Outubro/2026', predictedDate: '18 de outubro', priority: 'Programada' },
      items: [
        { id: 'revisao', title: 'Revisão dos 30.000 km', meta: 'Faltam 1.550 km', tag: 'Programada', tagType: 'accent', dueInKm: 1550, serviceOption: 'Revisão dos 30.000 km', price: 'R$ 620', duration: '1h30', warrantyCovered: false, dealer: 'Ford Vila Ré' },
        { id: 'oleo', title: 'Troca de óleo e filtro', meta: 'Recomendado em até 30 dias', tag: 'Atenção', tagType: 'warning', dueInKm: 1200, serviceOption: 'Troca de óleo', price: 'R$ 280', duration: '40min', warrantyCovered: false, dealer: 'Ford Vila Ré' },
        { id: 'rodizio', title: 'Rodízio de pneus', meta: 'Recomendado a cada 10.000 km', tag: 'Preventiva', tagType: 'neutral', dueInKm: 2500, serviceOption: 'Outro', price: 'R$ 90', duration: '30min', warrantyCovered: false, dealer: 'Ford Vila Ré' },
        { id: 'freios', title: 'Verificação do sistema de freios', meta: 'Desgaste identificado nas pastilhas dianteiras', tag: 'Atenção', tagType: 'warning', serviceOption: 'Verificação de freios', price: 'R$ 410', duration: '1h', warrantyCovered: true, dealer: 'Ford Vila Ré' },
      ],
      completed: [
        { title: 'Revisão dos 20.000 km', date: '15/07/2026', cost: 'R$ 620' },
        { title: 'Troca de pneus dianteiros', date: '02/04/2026', cost: 'R$ 1.480' },
        { title: 'Revisão dos 10.000 km', date: '18/11/2025', cost: 'R$ 540' },
      ],
    },
    history: [
      { date: '15/07/2026', km: '27.100 km', title: 'Revisão dos 20.000 km', place: 'Concessionária Ford Vila Ré', cost: 'R$ 620' },
      { date: '02/04/2026', km: '21.800 km', title: 'Troca de pneus dianteiros', place: 'Concessionária Ford Vila Ré', cost: 'R$ 1.480' },
      { date: '09/01/2026', km: '16.200 km', title: 'Reparo no sistema de ar-condicionado', place: 'Concessionária Ford ABC', cost: 'R$ 340' },
      { date: '18/11/2025', km: '10.050 km', title: 'Revisão dos 10.000 km', place: 'Concessionária Ford Vila Ré', cost: 'R$ 540' },
      { date: '22/08/2025', km: '3.400 km', title: 'Compra do veículo', place: 'Concessionária Ford Vila Ré', cost: '—' },
    ],
    eco: {
      indicators: [
        { label: 'Aceleração', value: 82 }, { label: 'Frenagem', value: 79 }, { label: 'Velocidade', value: 91 },
        { label: 'Marcha lenta', value: 88 }, { label: 'Eficiência', value: 90 },
      ],
      score: 86, previousScore: 78,
    },
    docs: [
      { name: 'CRLV', status: 'Ativo', validUntil: '31/12/2026' },
      { name: 'Manual do proprietário', status: 'Disponível', validUntil: null },
      { name: 'Apólice de seguro', status: 'Ativo', validUntil: '11/10/2026' },
      { name: 'Nota fiscal', status: 'Disponível', validUntil: null },
      { name: 'Comprovantes de revisão', status: 'Disponível', validUntil: null },
    ],
    tires: [
      { id: 'dianteiro-esquerdo', label: 'Dianteiro esquerdo', psi: 33, recommended: 35, status: 'ok' },
      { id: 'dianteiro-direito', label: 'Dianteiro direito', psi: 33, recommended: 35, status: 'ok' },
      { id: 'traseiro-esquerdo', label: 'Traseiro esquerdo', psi: 27, recommended: 35, status: 'warn' },
      { id: 'traseiro-direito', label: 'Traseiro direito', psi: 32, recommended: 35, status: 'ok' },
    ],
  },
  {
    vehicle: {
      model: 'Ford Ranger XLT 2024', name: 'Ford Ranger', trim: 'XLT 2024',
      plate: 'XYZ9A87', km: 41200, lastService: '10/05/2026', nextServiceKm: 45000,
      healthScore: 87, status: 'Boa', estimatedValue: 198500, color: 'Vermelho Rapid',
      engine: '3.0 V6 Turbo Diesel', transmission: 'Automática 10 marchas', year: '2024', warrantyUntil: '03/2027',
      fuel: 'Diesel', connected: true, fuelLevel: 45, range: 520, avgKmPerDay: 52,
      consumption: '9,8 km/L', consumptionKmL: 9.8, photo: 'ranger',
      engineTemp: '91°C', parkedSince: '3h10', parkedDistance: '1,2 km', parkedAddress: 'Av. Industrial, 480 — Santo André',
    },
    health: {
      overall: 87,
      systems: [
        { id: 'motor', label: 'Motor', score: 91, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Estável nos últimos 30 dias.' },
        { id: 'bateria', label: 'Bateria', score: 85, status: 'ok', condition: 'Boa', note: 'Desempenho estável para o padrão de uso.', trend: 'Desempenho consistente com o padrão de uso.' },
        { id: 'freios', label: 'Freios', score: 88, status: 'ok', condition: 'Bom', note: 'Desgaste normal para a quilometragem.', trend: 'Sem alterações relevantes.' },
        { id: 'pneus', label: 'Pneus', score: 79, status: 'warn', condition: 'Atenção', note: 'Desgaste acima do esperado no eixo traseiro devido ao uso em estrada de terra.', trend: 'Desgaste 8% maior que no mês anterior.' },
        { id: 'oleo', label: 'Óleo', score: 90, status: 'ok', condition: 'Excelente', note: 'Vida útil dentro do esperado.', trend: 'Estável nas últimas verificações.' },
        { id: 'suspensao', label: 'Suspensão', score: 83, status: 'ok', condition: 'Bom', note: 'Leve desgaste compatível com uso off-road ocasional.', trend: 'Estável nos últimos 30 dias.' },
        { id: 'eletrico', label: 'Sistema elétrico', score: 94, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Sem alterações relevantes.' },
        { id: 'fluidos', label: 'Fluidos', score: 89, status: 'ok', condition: 'Boa', note: 'Níveis dentro do esperado.', trend: 'Níveis estáveis nas últimas verificações.' },
      ],
    },
    alerts: [
      { id: 'tire-rr', level: 'Atenção', type: 'warning', title: 'Desgaste acima do esperado nos pneus traseiros', desc: 'Padrão de uso em estrada de terra acelerou o desgaste do eixo traseiro.', system: 'pneus', recommendation: 'Recomendamos rodízio dos pneus na próxima manutenção para equilibrar o desgaste.', actions: [{ label: 'Ver saúde dos pneus', kind: 'system' }, { label: 'Agendar rodízio', kind: 'schedule', service: 'Rodízio de pneus' }] },
    ],
    maintenance: {
      next: { title: 'Revisão dos 45.000 km', dueKm: 45000, dueDate: 'Novembro/2026', predictedDate: '5 de novembro', priority: 'Programada' },
      items: [
        { id: 'revisao', title: 'Revisão dos 45.000 km', meta: 'Faltam 3.800 km', tag: 'Programada', tagType: 'accent', dueInKm: 3800, serviceOption: 'Revisão dos 30.000 km', price: 'R$ 890', duration: '2h', warrantyCovered: false, dealer: 'Ford ABC' },
        { id: 'freios', title: 'Verificação do sistema de freios', meta: 'Desgaste avançado nas pastilhas traseiras', tag: 'Atenção', tagType: 'warning', serviceOption: 'Verificação de freios', price: 'R$ 520', duration: '1h30', warrantyCovered: true, dealer: 'Ford ABC' },
      ],
      completed: [
        { title: 'Revisão dos 40.000 km', date: '10/05/2026', cost: 'R$ 780' },
        { title: 'Troca de óleo diesel', date: '02/02/2026', cost: 'R$ 410' },
      ],
    },
    history: [
      { date: '10/05/2026', km: '38.900 km', title: 'Revisão dos 40.000 km', place: 'Concessionária Ford ABC', cost: 'R$ 780' },
      { date: '02/02/2026', km: '33.100 km', title: 'Troca de óleo diesel', place: 'Concessionária Ford ABC', cost: 'R$ 410' },
      { date: '14/09/2024', km: '0 km', title: 'Compra do veículo', place: 'Concessionária Ford ABC', cost: '—' },
    ],
    eco: {
      indicators: [
        { label: 'Aceleração', value: 74 }, { label: 'Frenagem', value: 70 }, { label: 'Velocidade', value: 85 },
        { label: 'Marcha lenta', value: 80 }, { label: 'Eficiência', value: 76 },
      ],
      score: 77, previousScore: 72,
    },
    docs: [
      { name: 'CRLV', status: 'Ativo', validUntil: '28/02/2027' },
      { name: 'Manual do proprietário', status: 'Disponível', validUntil: null },
      { name: 'Apólice de seguro', status: 'Ativo', validUntil: '05/12/2026' },
      { name: 'Nota fiscal', status: 'Disponível', validUntil: null },
      { name: 'Comprovantes de revisão', status: 'Disponível', validUntil: null },
    ],
    tires: [
      { id: 'dianteiro-esquerdo', label: 'Dianteiro esquerdo', psi: 36, recommended: 38, status: 'ok' },
      { id: 'dianteiro-direito', label: 'Dianteiro direito', psi: 36, recommended: 38, status: 'ok' },
      { id: 'traseiro-esquerdo', label: 'Traseiro esquerdo', psi: 38, recommended: 38, status: 'ok' },
      { id: 'traseiro-direito', label: 'Traseiro direito', psi: 37, recommended: 38, status: 'ok' },
    ],
  },
  {
    vehicle: {
      model: 'Ford Mustang Mach-E Premium 2025', name: 'Ford Mustang Mach-E', trim: 'Premium 2025',
      plate: 'MEV4E25', km: 15800, lastService: '20/06/2026', nextServiceKm: 20000,
      healthScore: 94, status: 'Excelente', estimatedValue: 289900, color: 'Azul Grabber',
      engine: 'Motor elétrico duplo', transmission: 'Automática de velocidade única', year: '2025', warrantyUntil: '06/2033',
      fuel: 'Elétrico', connected: true, fuelLevel: 78, range: 390, avgKmPerDay: 28,
      consumption: '5,6 km/kWh', consumptionKmL: 5.6, photo: 'mache',
      engineTemp: '34°C', parkedSince: '40min', parkedDistance: '180 m', parkedAddress: 'Av. dos Ipês, 1200 — São Paulo',
    },
    health: {
      overall: 94,
      systems: [
        { id: 'motor', label: 'Motor', score: 98, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Estável nos últimos 30 dias.' },
        { id: 'bateria', label: 'Bateria', score: 96, status: 'ok', condition: 'Excelente', note: 'Degradação mínima, dentro do esperado para a idade da bateria.', trend: 'Estável nas últimas verificações.' },
        { id: 'freios', label: 'Freios', score: 97, status: 'ok', condition: 'Excelente', note: 'Frenagem regenerativa reduz o desgaste das pastilhas.', trend: 'Sem alterações relevantes.' },
        { id: 'pneus', label: 'Pneus', score: 92, status: 'ok', condition: 'Excelente', note: 'Calibragem e desgaste dentro do ideal.', trend: 'Pressão estável nos últimos 7 dias.' },
        { id: 'oleo', label: 'Óleo', score: 100, status: 'ok', condition: 'N/A', note: 'Veículo elétrico — sem troca de óleo do motor.', trend: 'Não aplicável.' },
        { id: 'suspensao', label: 'Suspensão', score: 96, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Sem alterações relevantes.' },
        { id: 'eletrico', label: 'Sistema elétrico', score: 97, status: 'ok', condition: 'Excelente', note: 'Nenhuma ação necessária.', trend: 'Sem alterações relevantes.' },
        { id: 'fluidos', label: 'Fluidos', score: 94, status: 'ok', condition: 'Excelente', note: 'Níveis dentro do esperado.', trend: 'Níveis estáveis nas últimas verificações.' },
      ],
    },
    alerts: [],
    maintenance: {
      next: { title: 'Revisão dos 20.000 km', dueKm: 20000, dueDate: 'Dezembro/2026', predictedDate: '12 de dezembro', priority: 'Programada' },
      items: [
        { id: 'revisao', title: 'Revisão dos 20.000 km', meta: 'Faltam 4.200 km', tag: 'Programada', tagType: 'accent', dueInKm: 4200, serviceOption: 'Revisão dos 30.000 km', price: 'R$ 450', duration: '1h', warrantyCovered: false, dealer: 'Ford Vila Ré' },
      ],
      completed: [
        { title: 'Revisão dos 10.000 km', date: '20/06/2026', cost: 'R$ 320' },
      ],
    },
    history: [
      { date: '20/06/2026', km: '9.800 km', title: 'Revisão dos 10.000 km', place: 'Concessionária Ford Vila Ré', cost: 'R$ 320' },
      { date: '05/01/2026', km: '0 km', title: 'Compra do veículo', place: 'Concessionária Ford Vila Ré', cost: '—' },
    ],
    eco: {
      indicators: [
        { label: 'Aceleração', value: 88 }, { label: 'Frenagem', value: 92 }, { label: 'Velocidade', value: 90 },
        { label: 'Marcha lenta', value: 96 }, { label: 'Eficiência', value: 95 },
      ],
      score: 92, previousScore: 89,
    },
    docs: [
      { name: 'CRLV', status: 'Ativo', validUntil: '15/01/2027' },
      { name: 'Manual do proprietário', status: 'Disponível', validUntil: null },
      { name: 'Apólice de seguro', status: 'Ativo', validUntil: '20/06/2027' },
      { name: 'Nota fiscal', status: 'Disponível', validUntil: null },
      { name: 'Comprovantes de revisão', status: 'Disponível', validUntil: null },
    ],
    tires: [
      { id: 'dianteiro-esquerdo', label: 'Dianteiro esquerdo', psi: 38, recommended: 38, status: 'ok' },
      { id: 'dianteiro-direito', label: 'Dianteiro direito', psi: 38, recommended: 38, status: 'ok' },
      { id: 'traseiro-esquerdo', label: 'Traseiro esquerdo', psi: 40, recommended: 40, status: 'ok' },
      { id: 'traseiro-direito', label: 'Traseiro direito', psi: 40, recommended: 40, status: 'ok' },
    ],
  },
];

export function loadVehicleBundleData(index: number) {
  const bundle = garage[index];
  if (!bundle) return;
  vehicle = { ...bundle.vehicle };
  vehicleHealth = { overall: bundle.health.overall, systems: bundle.health.systems.map((sys) => ({ ...sys })) };
  alerts = bundle.alerts.map((a) => ({ ...a }));
  maintenance = {
    next: { ...bundle.maintenance.next },
    items: bundle.maintenance.items.map((m) => ({ ...m })),
    completed: bundle.maintenance.completed.map((c) => ({ ...c })),
    recalls: [],
  };
  if (bundle.tires) tirePositions = bundle.tires.map((t) => ({ ...t }));
  if (bundle.history) setHistoryTimeline(bundle.history.map((h) => ({ ...h })));
  if (bundle.eco) setEcoScore({ score: bundle.eco.score, previousScore: bundle.eco.previousScore, indicators: bundle.eco.indicators.map((i) => ({ ...i })) });
  if (bundle.docs) setDocuments(bundle.docs.map((d) => ({ ...d })));
}
