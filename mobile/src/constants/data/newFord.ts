import { vehicle } from './state';
import type { NewFordVehicle } from '../../types';

export const newFordLineup: NewFordVehicle[] = [
  {
    id: 'territory', name: 'Ford Territory Titanium 2026', trim: 'Titanium 2026', price: 198900,
    desc: 'Um SUV robusto e versátil, com tecnologia embarcada de ponta.',
    fit: 'Alta compatibilidade', compatibility: 94, year: '2026', warranty: '4 anos',
    power: '177 cv', consumption: '12,8 km/L', trunk: '500 L', themeColor: '#00095B',
  },
  {
    id: 'bronco-sport', name: 'Ford Bronco Sport', trim: '2026', price: 214500,
    desc: 'Para quem busca mais aventura sem abrir mão do conforto do dia a dia.',
    fit: 'Boa compatibilidade', compatibility: 87, year: '2026', warranty: '4 anos',
    power: '245 cv', consumption: '10,9 km/L', trunk: '420 L', themeColor: '#B45309',
  },
  {
    id: 'mustang-mache', name: 'Ford Mustang Mach-E', trim: '2026', price: 349900,
    desc: 'Transição para elétrico mantendo o DNA de performance Ford.',
    fit: 'Perfil emergente', compatibility: 81, year: '2026', warranty: '8 anos (bateria)',
    power: '294 cv', consumption: '5,6 km/kWh', trunk: '402 L', themeColor: '#0F766E',
  },
];

export const financingTerms = [24, 36, 48, 60];
export const downPaymentOptions = [0.1, 0.2, 0.3, 0.5];

export function estimateInstallment(price: number, downPaymentPct: number, months: number) {
  const tradeInCredit = vehicle.estimatedValue * 0.9; // typical trade-in offer is a bit under market value
  const downPayment = price * downPaymentPct;
  const totalDown = Math.min(price, downPayment + tradeInCredit);
  const financed = Math.max(0, price - totalDown);
  const monthlyRate = 0.018; // ~1.8% a.m., a plausible Brazilian auto-loan rate
  const installment = financed > 0
    ? (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
    : 0;
  return { tradeInCredit, downPayment, financed, installment };
}
