// Tipos de domínio compartilhados entre telas/componentes/dados.
// Migração JS -> TS: ver seção "Migração para TypeScript" no README.

export interface Vehicle {
  model: string;
  name: string;
  trim: string;
  plate: string;
  km: number;
  lastService: string;
  nextServiceKm: number;
  healthScore: number;
  status: string;
  estimatedValue: number;
  color: string;
  engine: string;
  transmission: string;
  year: string;
  warrantyUntil: string;
  fuel: string;
  connected: boolean;
  fuelLevel: number;
  range: number;
  avgKmPerDay: number;
  consumption: string;
  consumptionKmL: number;
  photo: string;
  engineTemp: string;
  parkedSince: string;
  parkedDistance: string;
  parkedAddress: string;
}

export type SystemStatus = 'ok' | 'warn' | 'danger';

export interface VehicleSystem {
  id: string;
  label: string;
  score: number;
  status: SystemStatus;
  condition: string;
  note: string;
  trend: string;
}

export interface VehicleHealth {
  overall: number;
  systems: VehicleSystem[];
}

export type AlertType = 'danger' | 'warning' | 'accent';

export interface AlertAction {
  label: string;
  kind: 'system' | 'schedule';
  service?: string;
}

export interface VehicleAlert {
  id: string;
  level: string;
  type: AlertType;
  title: string;
  desc: string;
  system: string;
  recommendation: string;
  actions: AlertAction[];
}

export interface TirePosition {
  id: string;
  label: string;
  psi: number;
  recommended: number;
  status: SystemStatus;
}

export interface MaintenanceNext {
  title: string;
  dueKm: number;
  dueDate: string;
  predictedDate: string;
  priority: string;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  meta: string;
  tag: string;
  tagType: 'accent' | 'warning' | 'neutral';
  dueInKm?: number;
  serviceOption: string;
  price: string;
  duration: string;
  warrantyCovered: boolean;
  dealer: string;
}

export interface MaintenanceCompletedItem {
  title: string;
  date: string;
  cost: string;
}

export interface RecallItem {
  title: string;
  desc: string;
}

export interface MaintenanceData {
  next: MaintenanceNext;
  items: MaintenanceItem[];
  completed: MaintenanceCompletedItem[];
  recalls: RecallItem[];
}

export interface HistoryEntry {
  date: string;
  km: string;
  title: string;
  place: string;
  cost: string;
}

export interface EcoIndicator {
  label: string;
  value: number;
}

export interface EcoScore {
  score: number;
  previousScore: number;
  indicators: EcoIndicator[];
}

export interface DocumentItem {
  name: string;
  status: string;
  validUntil: string | null;
}

export interface GarageBundle {
  vehicle: Vehicle;
  health: VehicleHealth;
  alerts: VehicleAlert[];
  maintenance: Omit<MaintenanceData, 'recalls'>;
  history: HistoryEntry[];
  eco: EcoScore;
  docs: DocumentItem[];
  tires: TirePosition[];
}

export interface Dealership {
  name: string;
  distance: string;
  address: string;
  phone: string;
  hours: string;
  rating: number;
  availableToday: boolean;
  nextSlot: string;
  services: string[];
  mapPos: { x: number; y: number };
}

export interface Recommendation {
  id: string;
  title: string;
  desc: string;
  [key: string]: unknown;
}

export interface NewFordVehicle {
  id: string;
  name: string;
  trim: string;
  price: number;
  desc: string;
  fit: string;
  compatibility: number;
  year: string;
  warranty: string;
  power: string;
  consumption: string;
  trunk: string;
  themeColor: string;
}

export interface NewVehicleOrder {
  vehicleId: string;
  stage: number;
}

export interface AssistantMessage {
  id: string | number;
  role: 'user' | 'assistant';
  text: string;
  [key: string]: unknown;
}

export interface Appointment {
  service: string;
  dealer: string;
  dateLabel: string;
  time: string;
}

export interface Driver {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time?: string;
  read?: boolean;
  [key: string]: unknown;
}
