// Data helpers for the Início (Home) screen.
import { vehicle, vehicleHealth, alerts, maintenance } from './state';

export function getWarnSystems() {
  return vehicleHealth.systems.filter((s) => s.status === 'warn');
}

export function getAttentionCount() {
  return alerts.filter((a) => a.type === 'danger' || a.type === 'warning').length;
}

// Same prediction logic as computeServicePrediction() no script.js:
// remaining km / average daily km, projected to a calendar date.
export function getServicePrediction() {
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const remainingKm = vehicle.nextServiceKm - vehicle.km;
  const days = Math.max(1, Math.round(remainingKm / vehicle.avgKmPerDay));
  const d = new Date();
  d.setDate(d.getDate() + days);
  const dateLabel = `${d.getDate()} de ${months[d.getMonth()]}`;
  return { remainingKm, days, avgKmPerDay: vehicle.avgKmPerDay, dateLabel };
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getTodayInsight() {
  const critical = alerts.find((a) => a.type === 'danger');
  if (critical) return { text: `Atenção: ${critical.title.toLowerCase()}.`, tone: 'warn' };
  const warnSys = vehicleHealth.systems.find((s) => s.status === 'warn');
  if (warnSys) return { text: `Atenção: ${warnSys.note}`, tone: 'warn' };
  return { text: 'Tudo certo para dirigir hoje.', tone: 'ok' };
}

// "Próximas ações" — same 3 items (title.includes matching) as script.js's
// renderHome(), with the same static fallbacks when a matching maintenance
// item doesn't exist (e.g. there's no dedicated "Rodízio de pneus" item).
export function getOilItem() {
  return maintenance.items.find((i) => i.title.includes('óleo'));
}
export function getRevisionItem() {
  return maintenance.items.find((i) => i.title.includes('Revisão'));
}
export function getTireItem() {
  return maintenance.items.find((i) => i.title.includes('Rodízio'));
}
export function getRemainingKm() {
  return vehicle.nextServiceKm - vehicle.km;
}

// "Seu Ford precisa da sua atenção" — top 2 non-informational alerts.
export function getTopAlerts() {
  return alerts.filter((a) => a.type !== 'accent').slice(0, 2);
}

// "Por que estou vendo isso?" data for the home intel card — same shape as
// getIntelExplainData("home-oil") in script.js.
export function getHomeOilExplain() {
  const oilItem = getOilItem();
  const oleoSys = vehicleHealth.systems.find((s) => s.id === 'oleo');
  return {
    text: `Com base no seu histórico, quilometragem e padrão de uso, o óleo do motor provavelmente precisará ser substituído nos próximos ${oilItem?.dueInKm != null ? oilItem.dueInKm.toLocaleString('pt-BR') : '1.200'} km.`,
    dataPoints: [
      `Óleo em ${oleoSys?.score}%`,
      `Quilometragem atual: ${vehicle.km.toLocaleString('pt-BR')} km`,
      `Uso médio: ${vehicle.avgKmPerDay} km/dia`,
      'Histórico de manutenção',
    ],
  };
}
