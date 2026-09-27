// Dados dos modais/telas de configuração do Perfil — reconferidos contra
// `settingsState` e cada `open*Modal()` do script.js (antes deste arquivo
// tinha toggles com nomes/labels inventados que não batiam com o site).

// "Preferências" (openPreferencesModal): unidade de distância + idioma
// (fixo, só informativo) — não é uma tela de toggles.
export const distanceUnits = [
  { key: 'km', label: 'Quilômetros (km)' },
  { key: 'mi', label: 'Milhas (mi)' },
];

// "Notificações" → "Preferências de notificação" (openNotificationPrefsModal).
export const notificationPrefsToggles = [
  { key: 'important', label: 'Alertas importantes', desc: 'Problemas que precisam de atenção imediata', default: true },
  { key: 'maintenance', label: 'Lembretes de manutenção', desc: 'Revisões, trocas de óleo e prazos', default: true },
  { key: 'offers', label: 'Ofertas e promoções', desc: 'Descontos e pacotes personalizados', default: false },
  { key: 'news', label: 'Novidades Ford', desc: 'Lançamentos e atualizações do app', default: false },
];

// "Ford One Intelligence" (openIntelligenceSettingsModal).
export const intelligenceToggles = [
  { key: 'personalizedRecs', label: 'Recomendações personalizadas', desc: 'Usar seu histórico e padrão de uso para sugestões mais precisas', default: true },
  { key: 'proactiveNotifications', label: 'Notificações proativas', desc: 'Ser avisado quando identificarmos algo novo', default: true },
];

// "Privacidade" (openPrivacyModal).
export const privacyToggles = [
  { key: 'usageData', label: 'Dados de uso do veículo', desc: 'Ajuda a melhorar diagnósticos e recomendações', default: true },
  { key: 'location', label: 'Localização', desc: 'Necessário para encontrar concessionárias próximas', default: true },
  { key: 'personalizedOffers', label: 'Personalização de ofertas', desc: 'Usar seus dados para ofertas mais relevantes', default: false },
];
