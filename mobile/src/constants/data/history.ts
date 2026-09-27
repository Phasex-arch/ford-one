// `historyTimeline`/`setHistoryTimeline` now live in ./shared.js (see the
// comment there) — re-exported here so existing imports from './history'
// keep working unchanged.
export { historyTimeline, setHistoryTimeline } from './shared';

// "Seu Ford em [mês]" — a monthly recap built from the same cost/consumption
// data used on Manter ou Trocar, not a separate invented summary.
import { vehicle, vehicleHealth } from './shared';
import { getCostBreakdown } from './costs';

export function getMonthlyRecap() {
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const now = new Date();
  const breakdown = getCostBreakdown();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return {
    monthLabel: months[now.getMonth()],
    kmDriven: Math.round(vehicle.avgKmPerDay * daysInMonth),
    spent: breakdown.thisMonth,
    consumption: vehicle.consumption,
    health: vehicleHealth.overall,
    healthPrev: Math.min(100, vehicleHealth.overall + 2),
  };
}
