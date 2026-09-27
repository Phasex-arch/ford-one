// Mirrors script.js's PAGES / GROUP_ORDER / BOTTOM_IDS from the HTML MVP —
// the single source of truth for both the topbar hamburger menu (drawer:
// full list, grouped, like the desktop sidebar) and the bottom nav (4 quick
// tabs + "Mais" grid with everything else). `mobileLabel` mirrors PAGES'
// `mobile: "Serviços"` override — the bottom tab shows a shorter label than
// the full nav-item label used everywhere else.
// icon values are keys into src/components/Icon.tsx's custom icon set,
// mirroring script.js's PAGES array (ICONS.home, ICONS.car, ...) exactly.
import type { IconName } from '../components/Icon';

export interface NavPage {
  id: string;
  label: string;
  group: string;
  icon: IconName;
  href: string;
  mobileLabel?: string;
}

export const NAV_PAGES: NavPage[] = [
  { id: 'home', label: 'Início', group: 'Veículo', icon: 'home', href: '/(tabs)' },
  { id: 'vehicle', label: 'Meu Veículo', group: 'Veículo', icon: 'car', href: '/(tabs)/vehicle' },
  { id: 'health', label: 'Saúde', group: 'Veículo', icon: 'pulse', href: '/(tabs)/health' },
  { id: 'maintenance', label: 'Manutenções', group: 'Veículo', icon: 'wrench', href: '/(tabs)/services', mobileLabel: 'Serviços' },
  { id: 'history', label: 'Histórico', group: 'Veículo', icon: 'history', href: '/history' },
  { id: 'alerts', label: 'Alertas', group: 'Assistência', icon: 'alert', href: '/alerts' },
  { id: 'scheduling', label: 'Agendamento', group: 'Assistência', icon: 'calendar', href: '/scheduling' },
  { id: 'diagnosis', label: 'Diagnóstico', group: 'Assistência', icon: 'stethoscope', href: '/diagnosis' },
  { id: 'recommendations', label: 'Recomendações', group: 'Assistência', icon: 'spark', href: '/recommendations' },
  { id: 'assistant', label: 'Assistente', group: 'Assistência', icon: 'help', href: '/assistant' },
  { id: 'keepOrTrade', label: 'Manter ou Trocar', group: 'Ford One', icon: 'scale', href: '/keepOrTrade' },
  { id: 'newFord', label: 'Trocar meu Ford', group: 'Ford One', icon: 'swap', href: '/newFord' },
  { id: 'offers', label: 'Ofertas', group: 'Ford One', icon: 'tag', href: '/offers' },
  { id: 'dealerships', label: 'Concessionárias', group: 'Ford One', icon: 'pin', href: '/dealerships' },
  { id: 'profile', label: 'Perfil', group: 'Conta', icon: 'user', href: '/profile' },
];

export const GROUP_ORDER = ['Veículo', 'Assistência', 'Ford One', 'Conta'];

// The 4 quick-access bottom tabs, in order — everything else in NAV_PAGES
// surfaces in the "Mais" grid instead.
export const BOTTOM_IDS = ['home', 'vehicle', 'health', 'maintenance'];

export const MORE_PAGES = NAV_PAGES.filter((p) => !BOTTOM_IDS.includes(p.id));
