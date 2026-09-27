// Central de notificações — separada de Alertas (que é só saúde do
// veículo). Semeada uma vez com dados reais (alerta crítico, previsão de
// revisão, garantia) e cresce com eventos reais da sessão (agendamento
// confirmado, atendimento concluído) — mesmo espírito do
// seedNotificationsIfEmpty()/pushNotification() do script.js. Estado a
// nível de módulo (como customCosts/drivers) porque é lido tanto pela tela
// de Notificações quanto por quem dispara um evento (Agendamento).
import { vehicle, alerts } from './state';
import type { IconName } from '../../components/Icon';

// icon values are Icon.tsx keys — exact port of script.js's NOTIFICATION_TYPES
// (veiculo:"car", manutencao:"wrench", concessionaria:"pin", seguranca:"alert",
// ofertas:"tag", intelligence:"spark").
export const NOTIFICATION_TYPES = {
  veiculo: { label: 'Veículo', icon: 'car' },
  manutencao: { label: 'Manutenção', icon: 'wrench' },
  concessionaria: { label: 'Concessionária', icon: 'pin' },
  seguranca: { label: 'Segurança', icon: 'alert' },
  ofertas: { label: 'Ofertas', icon: 'tag' },
  intelligence: { label: 'Ford One Intelligence', icon: 'spark' },
} satisfies Record<string, { label: string; icon: IconName }>;

export interface NotificationEvent {
  id: number;
  text: string;
  bucket: 'hoje' | 'semana' | 'anteriores';
  read: boolean;
  type: keyof typeof NOTIFICATION_TYPES;
}

let idCounter = 0;
export let notificationEvents: NotificationEvent[] = [];

export function seedNotificationsIfEmpty() {
  if (notificationEvents.length > 0) return;
  const criticalAlert = alerts.find((a) => a.type === 'danger');
  const seeded: NotificationEvent[] = [];
  if (criticalAlert) {
    seeded.push({ id: ++idCounter, text: `${criticalAlert.title}.`, bucket: 'hoje', read: false, type: 'seguranca' });
  }
  const remainingKm = vehicle.nextServiceKm - vehicle.km;
  const days = Math.max(1, Math.round(remainingKm / vehicle.avgKmPerDay));
  seeded.push({ id: ++idCounter, text: `Revisão prevista para daqui a ${days} dias.`, bucket: 'semana', read: false, type: 'manutencao' });
  seeded.push({ id: ++idCounter, text: 'Nova oferta baseada na sua próxima manutenção.', bucket: 'anteriores', read: true, type: 'ofertas' });
  seeded.push({ id: ++idCounter, text: `Garantia Ford ativa até ${vehicle.warrantyUntil}.`, bucket: 'anteriores', read: true, type: 'veiculo' });
  notificationEvents = seeded;
}

export function pushNotification(text: string, type?: keyof typeof NOTIFICATION_TYPES) {
  notificationEvents = [{ id: ++idCounter, text, bucket: 'hoje', read: false, type: type || 'concessionaria' }, ...notificationEvents];
}

export function markNotificationRead(id: number) {
  notificationEvents = notificationEvents.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function deleteNotification(id: number) {
  notificationEvents = notificationEvents.filter((n) => n.id !== id);
}
