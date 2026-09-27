import type { Dealership } from '../../types';

export const dealershipDetails: Dealership[] = [
  {
    name: 'Ford Vila Ré', distance: '2,4 km', address: 'Av. Águia de Haia, 2100 — São Paulo',
    phone: '(11) 2345-6789', hours: 'Seg a Sáb, 08:00–18:00', rating: 4.7,
    availableToday: true, nextSlot: 'Hoje, 16:00',
    services: ['Revisão', 'Funilaria', 'Peças', 'Test-drive'],
    mapPos: { x: 38, y: 58 },
  },
  {
    name: 'Ford ABC', distance: '5,1 km', address: 'Av. Industrial, 900 — Santo André',
    phone: '(11) 3456-7890', hours: 'Seg a Sex, 08:00–19:00', rating: 4.5,
    availableToday: true, nextSlot: 'Hoje, 17:30',
    services: ['Revisão', 'Peças'],
    mapPos: { x: 68, y: 32 },
  },
  {
    name: 'Ford Osasco', distance: '8,7 km', address: 'Av. dos Autonomistas, 1500 — Osasco',
    phone: '(11) 4567-8901', hours: 'Fechada — abre às 8h', rating: 4.6,
    availableToday: false, nextSlot: 'Amanhã, 09:00',
    services: ['Revisão', 'Funilaria', 'Test-drive'],
    mapPos: { x: 22, y: 78 },
  },
];
