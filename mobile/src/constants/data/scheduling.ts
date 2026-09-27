export const dealerships = ['Ford Vila Ré — 2,4 km', 'Ford ABC — 5,1 km', 'Ford Osasco — 8,7 km'];

export const schedulingServices = [
  'Revisão dos 30.000 km', 'Troca de óleo', 'Verificação de freios', 'Test-drive',
];

export function getSchedulingDays() {
  const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const slotSets = [
    ['09:00', '10:30', '14:00'],
    ['08:30', '11:00', '15:30'],
    ['09:30', '13:00'],
    ['10:00', '13:30', '16:00'],
    ['08:00', '11:30', '14:30'],
  ];
  const now = new Date();
  const days = [];
  for (let i = 1; i <= 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      label: `${dayNames[d.getDay()]} ${d.getDate()}`,
      dateLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
      slots: slotSets[i - 1],
    });
  }
  return days;
}
