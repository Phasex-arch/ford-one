// "Motoristas" — quem tem acesso ao Ford e o que cada um pode fazer.
// Mesmo shape do script.js: `drivers` é uma lista mutável a nível de módulo
// (não por veículo), com a proprietária sempre em primeiro (role
// "Proprietária", sem botões de editar/revogar).
import { user } from './user';

export const ALL_DRIVER_PERMISSIONS = [
  'Dirigir', 'Localizar veículo', 'Visualizar saúde', 'Visualizar documentos', 'Agendar manutenção',
];

export interface DriverRecord {
  id: number;
  name: string;
  role: 'Proprietária' | 'Motorista';
  permissions: string[];
  expiresAt: string | null;
}

interface DriverInput {
  name: string;
  permissions: string[];
  expiresAt: string | null;
}

let driverIdCounter = 2;

export let drivers: DriverRecord[] = [
  { id: 1, name: user.name, role: 'Proprietária', permissions: ['Dirigir', 'Localização', 'Histórico', 'Saúde', 'Pagamentos'], expiresAt: null },
  { id: 2, name: 'Nathan', role: 'Motorista', permissions: ['Dirigir', 'Localização'], expiresAt: null },
];

export function addDriver({ name, permissions, expiresAt }: DriverInput) {
  drivers = [...drivers, {
    id: ++driverIdCounter, name, role: 'Motorista',
    permissions: permissions.length ? permissions : ['Dirigir'], expiresAt,
  }];
}

export function updateDriver(id: number, { name, permissions, expiresAt }: DriverInput) {
  drivers = drivers.map((d) => (d.id === id ? {
    ...d,
    name,
    permissions: permissions.length ? permissions : ['Dirigir'],
    expiresAt,
  } : d));
}

export function revokeDriver(id: number) {
  drivers = drivers.filter((d) => d.id !== id);
}

// Mesma fórmula do computeValetExpiry() do site.
export function computeValetExpiry(option: string) {
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const d = new Date();
  if (option === '2h') d.setHours(d.getHours() + 2);
  else if (option === '24h') d.setHours(d.getHours() + 24);
  else if (option === 'hoje') d.setHours(22, 0, 0, 0);
  else return null;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} de ${months[d.getMonth()]} — ${hh}:${mm}`;
}

export const EXPIRY_OPTIONS = [
  { key: 'permanent', label: 'Permanente' },
  { key: '2h', label: 'Acesso temporário — 2 horas' },
  { key: 'hoje', label: 'Acesso temporário — até às 22:00 hoje' },
  { key: '24h', label: 'Acesso temporário — 24 horas' },
];
