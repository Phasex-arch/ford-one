export const diagnosisSymptoms = [
  'Barulho estranho', 'Vibração', 'Luz no painel', 'Problema no motor', 'Problema nos freios',
  'Dificuldade de partida', 'Superaquecimento', 'Perda de potência', 'Consumo elevado',
  'Ar-condicionado', 'Direção', 'Suspensão', 'Pneu', 'Bateria',
];

// A small deterministic rules engine, same spirit as the web app's keyword
// matcher — not a real diagnostic tool, just a plausible simulated result.
export function analyzeDiagnosis(selectedSymptoms: string[]) {
  const has = (s: string) => selectedSymptoms.includes(s);
  if (has('Problema nos freios') || has('Vibração')) {
    return {
      title: 'Possível desgaste no sistema de freios',
      confidence: 'Média',
      text: 'Os sintomas selecionados são compatíveis com desgaste nas pastilhas ou discos de freio. Isso é consistente com o alerta já identificado no seu veículo.',
      action: 'Verificação de freios',
    };
  }
  if (has('Luz no painel') || has('Problema no motor') || has('Superaquecimento')) {
    return {
      title: 'Possível falha eletrônica ou mecânica no motor',
      confidence: 'Média',
      text: 'Recomendamos um diagnóstico eletrônico completo na concessionária para identificar o código de falha com precisão.',
      action: 'Revisão dos 30.000 km',
    };
  }
  if (has('Dificuldade de partida') || has('Bateria')) {
    return {
      title: 'Possível problema na bateria ou sistema de partida',
      confidence: 'Média',
      text: 'Baterias perdem eficiência com o tempo, especialmente em uso urbano intenso. Uma verificação rápida pode confirmar o estado de carga.',
      action: 'Troca de óleo',
    };
  }
  return {
    title: 'Sintomas registrados para análise',
    confidence: 'Baixa',
    text: 'Não identificamos um padrão claro com os sintomas selecionados. Recomendamos uma avaliação presencial na concessionária para um diagnóstico mais preciso.',
    action: 'Revisão dos 30.000 km',
  };
}
