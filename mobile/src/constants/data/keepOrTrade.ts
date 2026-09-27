import { vehicle, vehicleHealth } from './state';

/* "Índice de troca" — a transparent, explainable heuristic (never presented
   as certainty), weighing health, km, open issues and remaining warranty.
   Same formula as getTradeIndex() in script.js. */
export function getTradeIndex() {
  const warnCount = vehicleHealth.systems.filter((s) => s.status === 'warn').length;
  const [mm, yyyy] = vehicle.warrantyUntil.split('/').map(Number);
  const until = new Date(yyyy, mm - 1, 1);
  const now = new Date();
  const warrantyMonths = Math.max(0, (until.getFullYear() - now.getFullYear()) * 12 + (until.getMonth() - now.getMonth()));
  let score = (100 - vehicleHealth.overall) * 0.5 + Math.min(30, vehicle.km / 1000) + warnCount * 5 - Math.min(15, (warrantyMonths / 24) * 15);
  score = Math.max(0, Math.min(100, Math.round(score)));
  const keepMonths = Math.max(6, Math.round(24 - (score / 100) * 12));
  return { score, keepMonths, label: score < 40 ? 'Baixo' : score < 70 ? 'Moderado' : 'Alto' };
}
