// Hotspot positions (% of the diagram container) — same values as
// HEALTH_HOTSPOTS in script.js, calibrated against the real vehicle photo
// (nose on the right, bed/trunk on the left).
export const HEALTH_HOTSPOTS = {
  bateria: { x: 90.0, y: 40.0 },
  motor: { x: 80.0, y: 46.0 },
  oleo: { x: 74.0, y: 50.0 },
  eletrico: { x: 68.0, y: 24.0 },
  freios: { x: 83.0, y: 74.0 },
  fluidos: { x: 45.0, y: 80.0 },
  suspensao: { x: 63.0, y: 80.0 },
  pneus: { x: 25.0, y: 74.0 },
};

// Custom icon (src/components/Icon.tsx) per system id — exact port of
// script.js's sysIcon map: { motor:ICONS.gauge, bateria:ICONS.battery,
// freios:ICONS.brake, pneus:ICONS.tire, oleo:ICONS.drop,
// suspensao:ICONS.spring, eletrico:ICONS.bolt, fluidos:ICONS.drop }.
// Used on the system-detail sheet's header avatar.
import type { IconName } from '../components/Icon';

export const SYSTEM_ICONS: Record<string, IconName> = {
  motor: 'gauge',
  bateria: 'battery',
  freios: 'brake',
  pneus: 'tire',
  oleo: 'drop',
  suspensao: 'spring',
  eletrico: 'bolt',
  fluidos: 'drop',
};

// Systems considered covered by the Ford warranty — same list as
// openSystemModal()'s `underWarranty` check in script.js.
export const WARRANTY_SYSTEM_IDS = ['motor', 'eletrico', 'freios', 'suspensao'];
