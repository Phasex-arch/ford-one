// "Custo do meu Ford" — since-purchase cost breakdown by category, shared
// between Histórico ("Seu Ford em [mês]") and Manter ou Trocar (TCO,
// forecast). Manutenção reuses the real history costs; the rest are
// estimated recurring costs prorated by months of ownership — same
// arithmetic as getCostBreakdown()/getMonthsSincePurchase() in script.js.
// Imports straight from ./shared (not ./state / ./history) so this module
// doesn't cycle back through history.js, which itself imports
// getCostBreakdown from here — see the comment at the top of shared.js.
import { vehicle, maintenance, historyTimeline } from './shared';

export interface CustomCosts {
  fuel?: number;
  insurance?: number;
  tax?: number;
  parking?: number;
  other?: number;
}

// customCosts no site: { fuel, insurance, tax, parking, other } — monthly R$
// (per month) the user typed into "Editar valores" on Manter ou Trocar;
// missing keys stay on the default estimate. It's a plain module-level
// mutable object (not per-vehicle) because getCostBreakdown() is also read
// by Histórico's "Seu Ford em [mês]" card, exactly like on the site.
export let customCosts: CustomCosts = {};

export function setCustomCosts(next: CustomCosts) {
  customCosts = next;
}

export function resetCustomCosts() {
  customCosts = {};
}

export function sumHistoryCosts() {
  return historyTimeline.reduce((sum, h) => {
    const digits = String(h.cost).replace(/[^\d]/g, '');
    return sum + (digits ? parseInt(digits, 10) : 0);
  }, 0);
}

export function getMonthsSincePurchase() {
  const purchase = historyTimeline.find((h) => h.title.toLowerCase().includes('compra'));
  if (!purchase) return 12;
  const [d, m, y] = purchase.date.split('/').map(Number);
  const p = new Date(y, m - 1, d);
  const now = new Date();
  return Math.max(1, (now.getFullYear() - p.getFullYear()) * 12 + (now.getMonth() - p.getMonth()));
}

export function getCostBreakdown() {
  const months = getMonthsSincePurchase();
  const maintenanceCost = sumHistoryCosts();
  const defaultFuelMonthly = (vehicle.km / vehicle.consumptionKmL) * 6.19 / months;
  const fuelCost = Math.round((customCosts.fuel != null ? customCosts.fuel : defaultFuelMonthly) * months);
  const insuranceCost = Math.round((customCosts.insurance != null ? customCosts.insurance : 3200 / 12) * months);
  const taxCost = Math.round((customCosts.tax != null ? customCosts.tax : 1350 / 12) * months);
  const parkingCost = Math.round((customCosts.parking != null ? customCosts.parking : 40) * months);
  const otherCost = Math.round((customCosts.other != null ? customCosts.other : 25) * months);
  const items = [
    { label: 'Manutenção', value: maintenanceCost, estimated: false },
    { label: 'Combustível', value: fuelCost, estimated: customCosts.fuel == null },
    { label: 'Seguro', value: insuranceCost, estimated: customCosts.insurance == null },
    { label: 'Impostos', value: taxCost, estimated: customCosts.tax == null },
    { label: 'Estacionamento', value: parkingCost, estimated: customCosts.parking == null },
    { label: 'Outros', value: otherCost, estimated: customCosts.other == null },
  ];
  const total = items.reduce((s, i) => s + i.value, 0);
  const monthlyAvg = Math.round(total / months);
  return {
    months, items, total,
    thisMonth: monthlyAvg,
    thisYear: months >= 12 ? monthlyAvg * 12 : total,
  };
}

export function getTcoAndForecast() {
  const breakdown = getCostBreakdown();
  const upcomingMaintenanceCost = maintenance.items.reduce((s, m) => s + (parseInt(String(m.price).replace(/\D/g, ''), 10) || 0), 0);
  const insuranceAnnual = Math.round((breakdown.items[2].value / breakdown.months) * 12);
  const fuelAnnual = Math.round((breakdown.items[1].value / breakdown.months) * 12);
  const depreciationAnnual = Math.round(vehicle.estimatedValue * 0.08);
  const forecastTotal = upcomingMaintenanceCost + insuranceAnnual + fuelAnnual + depreciationAnnual;
  return {
    monthlyEstimate: Math.round(breakdown.total / breakdown.months),
    annualEstimate: Math.round((breakdown.total / breakdown.months) * 12),
    perKm: Math.round((breakdown.total / vehicle.km) * 100) / 100,
    forecast: { upcomingMaintenanceCost, insuranceAnnual, fuelAnnual, depreciationAnnual, forecastTotal },
  };
}

export function getResaleProjection() {
  const rate = 0.08;
  return [12, 24, 36].map((m) => ({
    months: m,
    value: Math.round(vehicle.estimatedValue * Math.pow(1 - rate, m / 12)),
  }));
}

export function getTradeInEstimate() {
  const central = vehicle.estimatedValue;
  return { low: Math.round((central * 0.972) / 100) * 100, high: Math.round((central * 1.018) / 100) * 100, central };
}
