export interface Offer {
  title: string;
  context: string;
  price: string;
  oldPrice: string;
  desc: string;
  action: { kind: 'schedule'; service: string } | { kind: 'contact' };
  cta: string;
}

export const offers: Offer[] = [
  {
    title: 'Revisão dos 30.000 km com 10% off', context: 'Sua próxima revisão está próxima',
    price: 'R$ 558', oldPrice: 'R$ 620',
    desc: 'Aproveite 10% de desconto agendando sua revisão programada dentro do prazo recomendado.',
    action: { kind: 'schedule', service: 'Revisão dos 30.000 km' }, cta: 'Agendar com desconto',
  },
  {
    title: 'Pastilhas de freio + mão de obra', context: 'Baseado no desgaste identificado',
    price: 'R$ 369', oldPrice: 'R$ 410',
    desc: 'Troca das pastilhas dianteiras com mão de obra inclusa, recomendada com base no desgaste identificado pela Ford One Intelligence.',
    action: { kind: 'schedule', service: 'Verificação de freios' }, cta: 'Agendar com desconto',
  },
  {
    title: 'Seguro Ford Proteção Total', context: 'Recomendado para o perfil do seu veículo',
    price: 'a partir de R$ 189/mês', oldPrice: 'R$ 219/mês',
    desc: 'Cobertura completa para o seu Ford, incluindo assistência 24h e proteção contra roubo e colisão.',
    action: { kind: 'contact' }, cta: 'Solicitar contato',
  },
];
