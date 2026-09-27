// Data for the Meu Veículo screen: ficha técnica, garantia, localização,
// assistência 24h and Eco Score.
//
// `vehicle` comes straight from ./shared (not ./state) so this module
// doesn't cycle back through state.js, which used to import
// setEcoScore/setDocuments from here — see the comment at the top of
// shared.js. `ecoScore`/`documents`/their setters now live there too,
// re-exported below unchanged.
import { vehicle } from './shared';

export { ecoScore, setEcoScore, documents, setDocuments } from './shared';

export function getSpecFields() {
  return [
    ['Modelo', vehicle.model],
    ['Ano', vehicle.year],
    ['Placa', vehicle.plate],
    ['Cor', vehicle.color],
    ['Motorização', vehicle.engine],
    ['Câmbio', vehicle.transmission],
    ['Combustível', vehicle.fuel],
    ['Garantia até', vehicle.warrantyUntil],
  ];
}

export const warrantyCoverage = [
  'Motor e câmbio', 'Sistema elétrico', 'Freios', 'Suspensão', 'Ar-condicionado', 'Pintura e estrutura',
];

export function getWarrantyRemaining() {
  const [mm, yyyy] = vehicle.warrantyUntil.split('/').map(Number);
  const until = new Date(yyyy, mm - 1, 1);
  const now = new Date();
  let totalMonths = (until.getFullYear() - now.getFullYear()) * 12 + (until.getMonth() - now.getMonth());
  totalMonths = Math.max(0, totalMonths);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  if (months === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export const emergencyOptions = ['Pane', 'Pneu furado', 'Bateria descarregada', 'Acidente', 'Chave', 'Guincho', 'Outro'];

// "Minhas viagens" — same trips as script.js's `trips`, each with its own
// Eco Score.
export interface Trip {
  origin: string;
  destination: string;
  date: string;
  distance: string;
  duration: string;
  avgSpeed: string;
  consumption: string;
  ecoScore: number;
  route: string;
}

export const trips: Trip[] = [
  { origin: 'Casa', destination: 'FIAP', date: '09/09/2026', distance: '12,4 km', duration: '31 min', avgSpeed: '24 km/h', consumption: '11,2 km/L', ecoScore: 89, route: 'Via Marginal Pinheiros' },
  { origin: 'FIAP', destination: 'Casa', date: '09/09/2026', distance: '13,1 km', duration: '42 min', avgSpeed: '19 km/h', consumption: '9,8 km/L', ecoScore: 81, route: 'Via Av. Rebouças' },
  { origin: 'Casa', destination: 'Concessionária Ford Vila Ré', date: '07/09/2026', distance: '2,4 km', duration: '9 min', avgSpeed: '16 km/h', consumption: '12,5 km/L', ecoScore: 93, route: 'Via Rua dos Ipês' },
  { origin: 'Casa', destination: 'Shopping Ibirapuera', date: '05/09/2026', distance: '8,7 km', duration: '24 min', avgSpeed: '22 km/h', consumption: '10,4 km/L', ecoScore: 85, route: 'Via Av. Ibirapuera' },
];

// Same date-diff helper as script.js's daysUntil() — dateLabel is "DD/MM/AAAA".
export function daysUntil(dateLabel: string) {
  const [d, m, y] = dateLabel.split('/').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// "Software do veículo" — igual ao softwareState do site: versão/data base
// (o `installing`/`updateAvailable` ao vivo mora em useState na própria
// tela de Meu Veículo, igual ao softwareState global do site que a UI lê e
// muta em lugar).
export const softwareInfo = {
  version: '4.8.2',
  lastUpdate: '03/09/2026',
  updateAvailable: true,
  newVersion: '4.9.0',
  releaseNotes: [
    'Melhorias no gerenciamento de bateria',
    'Nova interface do painel digital',
    'Correções de estabilidade do Ford One Intelligence',
  ],
};
