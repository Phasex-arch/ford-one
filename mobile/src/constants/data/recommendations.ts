export interface RecommendationItem {
  title: string;
  desc: string;
  cta: string;
  action:
    | { kind: 'schedule'; service: string }
    | { kind: 'system'; system: string }
    | { kind: 'page'; page: string };
}

export const recommendations: RecommendationItem[] = [
  {
    title: 'Agende a revisão dos 30.000 km',
    desc: 'Faltam apenas 1.550 km para o próximo marco de manutenção programada.',
    cta: 'Agendar',
    action: { kind: 'schedule', service: 'Revisão dos 30.000 km' },
  },
  {
    title: 'Verifique as pastilhas de freio',
    desc: 'O desgaste identificado pode reduzir a eficiência de frenagem se não for tratado.',
    cta: 'Ver detalhes',
    action: { kind: 'system', system: 'freios' },
  },
  {
    title: 'Economize com pacote de revisão',
    desc: 'Um pacote antecipado pode reduzir o custo da próxima manutenção em até 15%.',
    cta: 'Ver oferta',
    action: { kind: 'page', page: 'offers' },
  },
];
