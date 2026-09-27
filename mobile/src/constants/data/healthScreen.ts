// Data helpers for the Saúde screen: evolução, previsões, Digital Twin.
import {
  vehicle, vehicleHealth, alerts, maintenance,
} from './state';

export type DigitalTwinAction =
  | { kind: 'system'; id: string }
  | { kind: 'fuel' }
  | { kind: 'page'; page: string }
  | null;

export interface DigitalTwinItem {
  label: string;
  value: string;
  action: DigitalTwinAction;
}

// Last 4 months trending toward the real current score — same approach as
// the web app: a gentle decline pattern ending at today's actual value.
export function getHealthHistory() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  const points = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({ label: months[d.getMonth()], score: Math.min(100, vehicleHealth.overall + i) });
  }
  return points;
}

export function getFordOnePredictions() {
  const predictions = [];
  const remainingKm = vehicle.nextServiceKm - vehicle.km;
  const days = Math.max(1, Math.round(remainingKm / vehicle.avgKmPerDay));
  predictions.push({
    text: `Considerando seu padrão de uso, sua próxima revisão deverá ocorrer em aproximadamente ${days} dias.`,
    confidence: 'Alta',
    dataPoints: [`Quilometragem atual: ${vehicle.km.toLocaleString('pt-BR')} km`, `Uso médio: ${vehicle.avgKmPerDay} km/dia`, 'Histórico de manutenção', `Última revisão: ${vehicle.lastService}`],
  });
  const warnSystems = vehicleHealth.systems.filter((s) => s.status === 'warn');
  warnSystems.forEach((s) => {
    predictions.push({
      text: `A saúde do sistema "${s.label}" apresentou uma tendência de queda recentemente.`,
      confidence: 'Média',
      dataPoints: [`Score atual: ${s.score}%`, s.trend, 'Histórico de manutenção', `Quilometragem: ${vehicle.km.toLocaleString('pt-BR')} km`],
    });
  });
  if (warnSystems.length === 0) {
    predictions.push({
      text: 'Todos os sistemas monitorados estão dentro do padrão esperado.',
      confidence: 'Alta',
      dataPoints: [`Saúde geral: ${vehicleHealth.overall}%`, 'Histórico dos últimos 4 meses'],
    });
  }
  const pneus = vehicleHealth.systems.find((s) => s.id === 'pneus');
  if (pneus && pneus.status !== 'warn') {
    predictions.push({
      text: 'O desgaste dos pneus está dentro do esperado.',
      confidence: 'Alta',
      dataPoints: [`Score dos pneus: ${pneus.score}%`, 'Pressão individual dos 4 pneus'],
    });
  }
  return predictions.slice(0, 3);
}

// Cada item carrega como reagir ao toque, igual ao `clickAttr` do
// getDigitalTwinItems() do site: abrir o sistema (`system`), navegar para
// uma página (`page`), ou nada (`null`, ex.: Temperatura/Consumo).
export function getDigitalTwinItems(dismissedIds?: Set<string>): DigitalTwinItem[] {
  const find = (id: string) => vehicleHealth.systems.find((s) => s.id === id)!;
  // Igual ao `activeAlerts` do site (alerts.filter(a=>!alertsUiState.dismissed.has(a.id))) —
  // dismissedIds vem do AppStateContext, estado global compartilhado com a tela de Alertas.
  const activeAlerts = dismissedIds ? alerts.filter((a) => !dismissedIds.has(a.id)) : alerts;
  return [
    { label: 'Motor', value: `${find('motor').score}%`, action: { kind: 'system', id: 'motor' } },
    { label: 'Bateria', value: `${find('bateria').score}%`, action: { kind: 'system', id: 'bateria' } },
    { label: 'Freios', value: `${find('freios').score}%`, action: { kind: 'system', id: 'freios' } },
    { label: 'Pneus', value: `${find('pneus').score}%`, action: { kind: 'system', id: 'pneus' } },
    { label: 'Óleo', value: `${find('oleo').score}%`, action: { kind: 'system', id: 'oleo' } },
    { label: 'Suspensão', value: `${find('suspensao').score}%`, action: { kind: 'system', id: 'suspensao' } },
    { label: 'Fluidos', value: `${find('fluidos').score}%`, action: { kind: 'system', id: 'fluidos' } },
    { label: 'Sistema elétrico', value: `${find('eletrico').score}%`, action: { kind: 'system', id: 'eletrico' } },
    { label: 'Temperatura', value: vehicle.engineTemp, action: null },
    { label: 'Combustível', value: `${vehicle.fuelLevel}%`, action: { kind: 'fuel' } },
    { label: 'Quilometragem', value: `${vehicle.km.toLocaleString('pt-BR')} km`, action: { kind: 'page', page: '/(tabs)/vehicle' } },
    { label: 'Autonomia', value: `${vehicle.range} km`, action: { kind: 'page', page: '/(tabs)/vehicle' } },
    { label: 'Consumo', value: vehicle.consumption, action: null },
    { label: 'Diagnósticos', value: '3 métodos', action: { kind: 'page', page: '/diagnosis' } },
    { label: 'Falhas', value: `${activeAlerts.length}`, action: { kind: 'page', page: '/alerts' } },
    { label: 'Revisões', value: `${maintenance.completed.length}`, action: { kind: 'page', page: '/(tabs)/services' } },
  ];
}
