import {
  vehicle, vehicleHealth, alerts, maintenance,
} from './state';
import { dealershipDetails } from './dealerships';
import { historyTimeline } from './history';

export interface AssistantAction {
  label: string;
  kind: string;
  service?: string;
  page?: string;
  system?: string;
  dealerIndex?: number;
  time?: string;
  dateLabel?: string;
}

export interface AssistantRuleReply {
  text: string;
  actions: AssistantAction[];
}

function sumHistoryCosts() {
  return historyTimeline.reduce((sum, h) => {
    const value = Number(String(h.cost).replace(/[^\d]/g, '')) || 0;
    return sum + value;
  }, 0);
}

function tomorrowLabel() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// getAssistantSuggestions() no site: os chips mudam com o que está
// acontecendo com o veículo — um alerta crítico ou uma revisão próxima têm
// prioridade sobre as perguntas genéricas.
export function getAssistantSuggestions(dismissedIds?: Set<string>): string[] {
  const activeAlerts = dismissedIds ? alerts.filter((a) => !dismissedIds.has(a.id)) : alerts;
  const critical = activeAlerts.find((a) => a.type === 'danger');
  const warnSystems = vehicleHealth.systems.filter((s) => s.status === 'warn');
  const remainingKm = vehicle.nextServiceKm - vehicle.km;
  const suggestions = [];

  if (critical) suggestions.push(`Por que recebi o alerta de ${critical.title.toLowerCase()}?`);
  else if (warnSystems.length > 0) suggestions.push(`Como está meu ${warnSystems[0].label.toLowerCase()}?`);
  else suggestions.push('Como posso manter meu carro saudável?');

  if (remainingKm <= 2000) suggestions.push('Quando é a próxima revisão?');
  suggestions.push('Posso viajar amanhã?');
  suggestions.push('Devo trocar de carro?');

  return suggestions.slice(0, 4);
}

/* Rule-based reply engine, same spirit as findAssistantAnswer() in the web
   version: keyword matching over real vehicle/alert/dealer data, each rule
   returning a text and (optionally) inline action buttons the message can
   carry (kind: 'page' | 'system' | 'schedule'). */
export function getAssistantReply(message: string, dismissedIds?: Set<string>): AssistantRuleReply {
  const text = message.toLowerCase();
  const remainingKm = vehicle.nextServiceKm - vehicle.km;
  const warnSystems = vehicleHealth.systems.filter((s) => s.status === 'warn');
  // Igual ao `activeAlerts`/`criticalAlerts` do findAssistantAnswer() no site:
  // descontam os alertas dispensados nesta sessão (AppStateContext).
  const activeAlerts = dismissedIds ? alerts.filter((a) => !dismissedIds.has(a.id)) : alerts;
  const criticalAlerts = activeAlerts.filter((a) => a.type === 'danger');
  const dealer0 = dealershipDetails[0];
  const sysById = (id: string) => vehicleHealth.systems.find((s) => s.id === id)!;
  const freios = sysById('freios');
  const oleo = sysById('oleo');
  const pneus = sysById('pneus');

  const rules = [
    {
      kws: ['posso viajar', 'viagem', 'viajar amanhã', 'viajar amanha'],
      text: `Seu ${vehicle.name} está em boas condições gerais para a viagem, com saúde de ${vehicleHealth.overall}%. ${warnSystems.length > 0 ? `Porém identifiquei ${warnSystems.length === 1 ? 'um ponto' : 'alguns pontos'} de atenção: ${warnSystems.map((s) => s.label.toLowerCase()).join(', ')}. Recomendo resolver isso antes de pegar a estrada.` : 'Nenhum ponto de atenção identificado — pode viajar tranquila.'}`,
      actions: [
        { label: 'Checklist da viagem', kind: 'trip-checklist' },
        ...(warnSystems.length > 0 ? [{ label: `Ver ${warnSystems[0].label.toLowerCase()}`, kind: 'system', system: warnSystems[0].id }] : []),
      ],
    },
    {
      kws: ['o que devo fazer primeiro', 'prioridade', 'por onde começo', 'por onde comeco'],
      text: criticalAlerts.length > 0
        ? `O mais urgente agora é: ${criticalAlerts[0].title.toLowerCase()}. ${criticalAlerts[0].recommendation}`
        : warnSystems.length > 0
          ? `Não há nada crítico. O ponto que mais merece atenção é o ${warnSystems[0].label.toLowerCase()}, em ${warnSystems[0].score}%.`
          : `Está tudo em dia. A próxima coisa no seu radar é a revisão dos ${vehicle.nextServiceKm.toLocaleString('pt-BR')} km, faltam ${remainingKm.toLocaleString('pt-BR')} km.`,
      actions: criticalAlerts.length > 0 ? [{ label: 'Ver alertas', kind: 'page', page: 'alerts' }] : [{ label: 'Ver manutenções', kind: 'page', page: 'maintenance' }],
    },
    {
      kws: ['recall'],
      text: 'Nenhum recall pendente para o seu Ford no momento.',
      actions: [{ label: 'Ver Meu Veículo', kind: 'page', page: 'vehicle' }],
    },
    {
      kws: ['garantia'],
      text: `Sua garantia Ford é válida até ${vehicle.warrantyUntil}.`,
      actions: [{ label: 'Ver Meu Veículo', kind: 'page', page: 'vehicle' }],
    },
    {
      kws: ['marcar minha revisão', 'marcar minha revisao', 'agendar minha revisão', 'agendar minha revisao', 'marque minha revisão', 'marque minha revisao'],
      text: `Encontrei a ${dealer0.name} a ${dealer0.distance}. Meu próximo horário livre é ${tomorrowLabel()} às 10:30. Quer confirmar?`,
      actions: [
        { label: 'Confirmar', kind: 'confirm-appt', service: 'Revisão dos 30.000 km', dealerIndex: 0, time: '10:30', dateLabel: tomorrowLabel() },
        { label: 'Ver outros horários', kind: 'page', page: 'scheduling' },
      ],
    },
    {
      kws: ['saude', 'saúde', 'condição', 'condicao', 'estado do carro', 'como está meu', 'como esta meu'],
      text: `Seu ${vehicle.name} está com ${vehicleHealth.overall}% de saúde geral — classificado como ${vehicle.status}. ${warnSystems.length > 0 ? `O ponto de atenção agora é: ${warnSystems.map((s) => s.label).join(' e ')}.` : 'Nenhum sistema precisa de atenção no momento.'}`,
      actions: [{ label: 'Ver saúde completa', kind: 'page', page: 'health' }],
    },
    {
      kws: ['freio', 'pastilha'],
      text: `Os freios estão em ${freios.score}% (${freios.condition}). ${freios.note}`,
      actions: [{ label: 'Ver detalhes dos freios', kind: 'system', system: 'freios' }],
    },
    {
      kws: ['oleo', 'óleo'],
      text: `O óleo está em ${oleo.score}% (${oleo.condition}). ${oleo.note}`,
      actions: [{ label: 'Agendar troca de óleo', kind: 'schedule', service: 'Troca de óleo' }],
    },
    {
      kws: ['pneu', 'calibragem'],
      text: `Os pneus estão em ${pneus.score}% (${pneus.condition}). ${pneus.note}`,
      actions: [{ label: 'Ver saúde dos pneus', kind: 'system', system: 'pneus' }],
    },
    {
      kws: ['revisao', 'revisão', 'manutencao', 'manutenção'],
      text: `Faltam ${remainingKm.toLocaleString('pt-BR')} km para a revisão dos ${vehicle.nextServiceKm.toLocaleString('pt-BR')} km, prevista para ${maintenance.next.predictedDate}.`,
      actions: [{ label: 'Ver manutenções', kind: 'page', page: 'maintenance' }],
    },
    {
      kws: ['agendar', 'agendamento', 'marcar'],
      text: 'Posso te ajudar a agendar um atendimento em poucos passos — escolha o serviço, a concessionária e o horário.',
      actions: [{ label: 'Ir para Agendamento', kind: 'page', page: 'scheduling' }],
    },
    {
      kws: ['trocar', 'troca de carro', 'vender', 'novo ford', 'novo carro', 'manter ou trocar'],
      text: `Considerando a saúde geral e os custos recentes do seu ${vehicle.name}, manter o veículo ainda é a opção mais vantajosa pelos próximos meses.`,
      actions: [{ label: 'Ver análise completa', kind: 'page', page: 'keepOrTrade' }],
    },
    {
      kws: ['valor', 'quanto vale', 'avaliacao', 'avaliação', 'preço', 'preco'],
      text: `Seu ${vehicle.name} está avaliado em aproximadamente R$ ${vehicle.estimatedValue.toLocaleString('pt-BR')}.`,
      actions: [{ label: 'Ver Meu Veículo', kind: 'page', page: 'vehicle' }],
    },
    {
      kws: ['quanto gastei', 'gasto', 'custo'],
      text: `Você gastou aproximadamente R$ ${sumHistoryCosts().toLocaleString('pt-BR')} com manutenção nos últimos registros do seu Ford.`,
      actions: [{ label: 'Ver histórico', kind: 'page', page: 'history' }],
    },
    {
      kws: ['km', 'quilometragem', 'rodei', 'rodagem'],
      text: `Seu Ford já rodou ${vehicle.km.toLocaleString('pt-BR')} km, com a última revisão feita em ${vehicle.lastService}.`,
      actions: [{ label: 'Ver Meu Veículo', kind: 'page', page: 'vehicle' }],
    },
    {
      kws: ['concession', 'oficina'],
      text: `A concessionária mais próxima é a ${dealer0.name}, a ${dealer0.distance}.`,
      actions: [{ label: 'Ver concessionárias', kind: 'page', page: 'dealerships' }],
    },
    {
      kws: ['alerta'],
      text: `Você tem ${activeAlerts.length} alerta${activeAlerts.length !== 1 ? 's' : ''} ativo${activeAlerts.length !== 1 ? 's' : ''}${criticalAlerts.length > 0 ? `, sendo ${criticalAlerts.length} importante${criticalAlerts.length > 1 ? 's' : ''}` : ''}.`,
      actions: [{ label: 'Ver alertas', kind: 'page', page: 'alerts' }],
    },
  ];

  for (const rule of rules) {
    if (rule.kws.some((k) => text.includes(k))) {
      return { text: rule.text, actions: rule.actions };
    }
  }
  return {
    text: 'Ainda não tenho uma resposta pronta pra essa pergunta, mas você pode explorar Saúde, Manutenções ou falar com uma concessionária para mais detalhes.',
    actions: [{ label: 'Ver saúde do veículo', kind: 'page', page: 'health' }],
  };
}

// Backwards-compatible plain-text variant, kept for any other consumer.
export function getAssistantResponse(message: string): string {
  return getAssistantReply(message).text;
}
