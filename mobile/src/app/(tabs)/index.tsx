import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAppState } from '../../context/AppStateContext';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import GaugeRing from '../../components/GaugeRing';
import TopBar from '../../components/TopBar';
import Icon from '../../components/Icon';
import VehicleHeroArt from '../../components/VehicleHeroArt';
import GarageSwitcherSheet from '../../components/GarageSwitcherSheet';
import SystemDetailSheet from '../../components/SystemDetailSheet';
import { useToast } from '../../components/Toast';
import {
  user, vehicle, vehicleHealth, alerts, getGreeting, getTodayInsight,
  getServicePrediction, getAttentionCount, getOilItem, getRevisionItem,
  getTireItem, getRemainingKm, getTopAlerts, getHomeOilExplain, historyTimeline,
} from '../../constants/data';
import type { VehicleSystem } from '../../types';
import type { IconName } from '../../components/Icon';

export default function HomeScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const { confirmedAppointment, vehicleVersion } = useAppState();
  void vehicleVersion; // subscribe so this screen re-renders on vehicle switch
  const [garageOpen, setGarageOpen] = useState(false);
  const [oilExplainOpen, setOilExplainOpen] = useState(false);
  const [detailSystem, setDetailSystem] = useState<VehicleSystem | null>(null);
  const insight = getTodayInsight();
  const prediction = getServicePrediction();
  const attentionCount = getAttentionCount();
  const s = styles(theme);

  const oilItem = getOilItem();
  const revisionItem = getRevisionItem();
  const tireItem = getTireItem();
  const remainingKm = getRemainingKm();
  const topAlerts = getTopAlerts();
  const recentHistory = historyTimeline.slice(0, 3);
  const oilExplain = getHomeOilExplain();

  const openAlertSystem = (systemId: string) => {
    const sys = vehicleHealth.systems.find((s2) => s2.id === systemId);
    if (sys) setDetailSystem(sys);
  };
  const scheduleService = (service: string) => {
    showToast(`Abrindo agendamento: ${service}`);
    router.push('/scheduling');
  };

  const quickStats: { label: string; value: string; sub?: string; warn?: boolean }[] = [
    { label: 'Quilometragem', value: `${vehicle.km.toLocaleString('pt-BR')} km` },
    { label: 'Autonomia', value: `${vehicle.range} km`, sub: `${vehicle.fuelLevel}% do tanque` },
    { label: 'Próxima revisão', value: `${vehicle.nextServiceKm.toLocaleString('pt-BR')} km`, sub: `Faltam ${(vehicle.nextServiceKm - vehicle.km).toLocaleString('pt-BR')} km` },
    {
      label: 'Alertas',
      value: alerts.length > 0 ? `${alerts.length} ativo${alerts.length > 1 ? 's' : ''}` : 'Nenhum',
      sub: alerts.length > 0 ? `${attentionCount} requerem atenção` : 'Tudo certo por aqui',
      warn: attentionCount > 0,
    },
    { label: 'Valor estimado', value: `R$ ${vehicle.estimatedValue.toLocaleString('pt-BR')}` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar />
      <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      {/* Header */}
      <View style={s.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>{getGreeting()}, {user.name}.</Text>
          <Text style={s.subGreeting}>Seu Ford está pronto para seguir viagem.</Text>
        </View>
        <View style={s.headerActions}>
          <Pressable onPress={() => router.push('/alerts')} style={s.iconButton} accessibilityLabel="Ver alertas">
            <Icon name="bell" size={17} color={theme.colors.textPrimary} />
            {attentionCount > 0 && <View style={[s.headerDot, { backgroundColor: theme.colors.danger, borderColor: theme.colors.bg }]} />}
          </Pressable>
          <Pressable onPress={() => router.push('/profile')} style={[s.avatar, { backgroundColor: theme.colors.accentSoft }]} accessibilityLabel="Abrir perfil">
            <Text style={[s.avatarText, { color: theme.colors.accent }]}>{user.name.charAt(0)}</Text>
          </Pressable>
        </View>
      </View>

      {/* Hero */}
      <View style={[s.hero, { backgroundColor: theme.colors.navy950 }]}>
        <View style={s.heroEyebrowRow}>
          <Text style={s.heroEyebrow}>Meu Ford</Text>
          <Pressable style={s.heroSwitchBtn} onPress={() => setGarageOpen(true)}>
            <Text style={s.heroSwitchText}>Trocar veículo</Text>
          </Pressable>
        </View>
        <Text style={s.heroName}>{vehicle.name}</Text>
        <Text style={s.heroTrim}>{vehicle.trim}</Text>
        <Text style={s.heroMeta}>{vehicle.plate}  •  {vehicle.km.toLocaleString('pt-BR')} km</Text>
        {vehicle.connected && (
          <View style={s.connectedRow}>
            <View style={s.connectedDot} />
            <Text style={s.connectedText}>Veículo conectado · atualizado agora</Text>
          </View>
        )}
        <Pressable onPress={() => router.push('/(tabs)/health')} style={s.heroArtWrap}>
          <VehicleHeroArt photoKey={vehicle.photo as 'maverick' | 'ranger' | 'mache'} size={110} />
        </Pressable>
        <View style={s.heroHealthRow}>
          <View style={s.heroHealthLeft}>
            <GaugeRing value={vehicleHealth.overall} size={64} strokeWidth={6} textColor="#fff" ringColor="#6B78FF" trackColor="rgba(255,255,255,.16)" />
            <View style={{ marginLeft: 14 }}>
              <Text style={s.heroHealthTitle}>{vehicleHealth.overall}/100 · {vehicle.status}</Text>
              <Text style={s.heroHealthSub}>Saúde do veículo</Text>
            </View>
          </View>
          <Pressable style={s.heroHealthLink} onPress={() => router.push('/(tabs)/health')}>
            <Text style={s.heroHealthLinkText}>Ver saúde completa</Text>
            <Icon name="chevron" size={14} color="#A8B2FF" />
          </Pressable>
        </View>
      </View>

      <GarageSwitcherSheet visible={garageOpen} onClose={() => setGarageOpen(false)} />

      {/* Quick status */}
      <Card style={s.quickStatusCard}>
        <View style={s.quickStatusWrap}>
          {quickStats.map((item, i) => (
            <View key={item.label} style={[s.qsItem, i % 2 === 0 && s.qsItemBorder]}>
              <Text style={s.qsLabel}>{item.label}</Text>
              <Text style={s.qsValue}>{item.value}</Text>
              {item.sub && (
                <Text style={[s.qsSub, item.warn && { color: theme.colors.warning, fontWeight: '700' }]}>
                  {item.sub}
                </Text>
              )}
            </View>
          ))}
        </View>
      </Card>

      {/* Próximo agendamento (se houver) */}
      {confirmedAppointment && (
        <Pressable onPress={() => router.push('/scheduling')}>
          <Card style={s.apptCard}>
            <View style={[s.apptIcon, { backgroundColor: theme.colors.accentSoft }]}>
              <Icon name="calendar" size={17} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.apptTitle}>{confirmedAppointment.service}</Text>
              <Text style={s.apptSub}>{confirmedAppointment.dateLabel} · {confirmedAppointment.time} · {confirmedAppointment.dealer}</Text>
            </View>
            <Badge label="Confirmado" tone="success" />
          </Card>
        </Pressable>
      )}

      {/* Meu Ford Hoje */}
      <Card>
        <Text style={s.eyebrowLabel}>MEU FORD HOJE</Text>
        <View style={s.insightRow}>
          <View style={[s.insightDot, { backgroundColor: insight.tone === 'warn' ? theme.colors.warning : theme.colors.success }]} />
          <Text style={s.insightText}>{insight.text}</Text>
        </View>
        <Pressable style={s.footLink} onPress={() => router.push('/(tabs)/health')}>
          <Text style={s.footLinkText}>Ver análise completa</Text>
          <Icon name="chevron" size={14} color={theme.colors.accent} />
        </Pressable>
      </Card>

      {/* Seu Ford hoje — system bars */}
      <Card>
        <Text style={s.sectionTitle}>Seu Ford hoje</Text>
        {vehicleHealth.systems.slice(0, 5).map((sys, i, arr) => (
          <Pressable
            key={sys.id}
            onPress={() => setDetailSystem(sys)}
            style={[s.sysRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}
          >
            <View style={s.sysHeaderRow}>
              <Text style={s.sysLabel}>{sys.label}</Text>
              <Text style={s.sysScore}>{sys.score}%</Text>
            </View>
            <ProgressBar value={sys.score} tone={sys.status === 'warn' ? 'warn' : 'ok'} />
            <Text style={[s.sysCondition, sys.status === 'warn' && { color: theme.colors.warning, fontWeight: '600' }]}>
              {sys.condition}
            </Text>
          </Pressable>
        ))}
        <Pressable style={s.footLink} onPress={() => router.push('/(tabs)/health')}>
          <Text style={s.footLinkText}>Explorar todos os componentes</Text>
          <Icon name="chevron" size={14} color={theme.colors.accent} />
        </Pressable>
      </Card>

      {/* Ford One Intelligence — previsão de óleo */}
      <View style={[s.intelCard, { backgroundColor: theme.colors.navy950 }]}>
        <View style={s.intelHead}>
          <View style={s.intelMark}>
            <Icon name="spark" size={13} color="#A8B2FF" />
          </View>
          <Text style={s.intelLabel}>Ford One Intelligence</Text>
          <View style={s.intelBadge}>
            <Text style={s.intelBadgeText}>Não é urgente</Text>
          </View>
        </View>
        <Text style={s.intelTitle}>Uma atenção para os próximos quilômetros</Text>
        <Text style={s.intelText}>{oilExplain.text}</Text>
        <View style={s.intelMetaRow}>
          <View>
            <Text style={s.intelMetaLabel}>Confiança</Text>
            <Text style={s.intelMetaValue}>87%</Text>
          </View>
          <View>
            <Text style={s.intelMetaLabel}>Fatores considerados</Text>
            <Text style={s.intelMetaValue}>5</Text>
          </View>
        </View>
        <View style={s.intelActionsRow}>
          <Pressable style={s.intelBtnOutline} onPress={() => setOilExplainOpen((v) => !v)}>
            <Text style={s.intelBtnOutlineText}>{oilExplainOpen ? 'Ocultar análise' : 'Ver análise'}</Text>
          </Pressable>
          <Pressable style={s.intelBtnSolid} onPress={() => scheduleService('Troca de óleo')}>
            <Text style={s.intelBtnSolidText}>Agendar manutenção</Text>
          </Pressable>
        </View>
        {oilExplainOpen && (
          <View style={s.intelExpand}>
            <Text style={s.intelExpandTitle}>Dados considerados</Text>
            {oilExplain.dataPoints.map((dp) => (
              <Text key={dp} style={s.intelExpandItem}>· {dp}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Próximas ações */}
      <Card>
        <Text style={s.sectionTitle}>Próximas ações</Text>
        <Pressable style={s.actionRow} onPress={() => scheduleService('Troca de óleo')}>
          <Text style={s.actionIndex}>01</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.actionTitle}>Troca de óleo</Text>
            <Text style={[s.actionMeta, { color: theme.colors.warning }]}>
              Recomendado em aproximadamente {(oilItem?.dueInKm ?? 1200).toLocaleString('pt-BR')} km
            </Text>
          </View>
          <Text style={s.actionCta}>Agendar</Text>
        </Pressable>
        <Pressable style={s.actionRow} onPress={() => router.push('/(tabs)/services')}>
          <Text style={s.actionIndex}>02</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.actionTitle}>{revisionItem ? revisionItem.title : 'Revisão dos 30.000 km'}</Text>
            <Text style={s.actionMeta}>Faltam {remainingKm.toLocaleString('pt-BR')} km · Previsão: {prediction.days} dias</Text>
          </View>
          <Text style={s.actionCta}>Ver revisão</Text>
        </Pressable>
        <Pressable style={[s.actionRow, { borderBottomWidth: 0 }]} onPress={() => openAlertSystem('pneus')}>
          <Text style={s.actionIndex}>03</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.actionTitle}>Verificação dos pneus</Text>
            <Text style={s.actionMeta}>Recomendado em {(tireItem?.dueInKm ?? 2500).toLocaleString('pt-BR')} km</Text>
          </View>
          <Text style={s.actionCta}>Ver pneus</Text>
        </Pressable>
      </Card>

      {/* Seu Ford precisa da sua atenção */}
      {topAlerts.length > 0 && (
        <Card>
          <Text style={s.sectionTitle}>Seu Ford precisa da sua atenção</Text>
          {topAlerts.map((a, i) => (
            <View key={a.id} style={[i < topAlerts.length - 1 && s.attentionDivider]}>
              <Badge label={a.level} tone={a.type === 'danger' ? 'danger' : 'warning'} style={{ marginBottom: 8 }} />
              <Text style={s.attentionTitle}>{a.title}</Text>
              <Text style={s.attentionRec}>{a.recommendation}</Text>
              <View style={s.attentionActionsRow}>
                {(a.actions || []).map((act) => (
                  <Pressable
                    key={act.label}
                    style={act.kind === 'schedule' ? [s.smBtn, { backgroundColor: theme.colors.accent }] : [s.smBtn, s.smBtnSecondary, { borderColor: theme.colors.border }]}
                    onPress={() => (act.kind === 'schedule' ? scheduleService(act.service || '') : openAlertSystem(a.system))}
                  >
                    <Text style={act.kind === 'schedule' ? s.smBtnText : [s.smBtnText, { color: theme.colors.textPrimary }]}>{act.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
          <Pressable style={s.footLink} onPress={() => router.push('/alerts')}>
            <Text style={s.footLinkText}>Ver todos os alertas</Text>
            <Icon name="chevron" size={14} color={theme.colors.accent} />
          </Pressable>
        </Card>
      )}

      {/* Atividade recente */}
      <Card>
        <Text style={s.sectionTitle}>Atividade recente</Text>
        <View style={s.timeline}>
          {recentHistory.map((h, i) => (
            <View key={h.date + h.title} style={[s.timelineItem, i < recentHistory.length - 1 && { marginBottom: 22 }]}>
              <View style={[s.timelineDot, { backgroundColor: theme.colors.accent, borderColor: theme.colors.surface }]} />
              <Text style={s.timelineDate}>{h.date.toUpperCase()}</Text>
              <Text style={s.timelineTitle}>{h.title}</Text>
              <Text style={s.timelineSub}>{h.km}</Text>
              <Pressable onPress={() => router.push('/dealerships')}>
                <Text style={s.timelinePlace}>{h.place}</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <Pressable style={s.footLink} onPress={() => router.push('/history')}>
          <Text style={s.footLinkText}>Ver histórico completo</Text>
          <Icon name="chevron" size={14} color={theme.colors.accent} />
        </Pressable>
      </Card>

      {/* Acessos rápidos */}
      <View style={{ marginBottom: 8 }}>
        <Text style={s.sectionTitle}>Acessos rápidos</Text>
        <View style={s.quickAccessGrid}>
          {([
            { icon: 'calendar', label: 'Agendar serviço', href: '/scheduling' },
            { icon: 'stethoscope', label: 'Diagnosticar problema', href: '/diagnosis' },
            { icon: 'pin', label: 'Encontrar concessionária', href: '/dealerships' },
            { icon: 'scale', label: 'Manter ou trocar', href: '/keepOrTrade' },
          ] as { icon: IconName; label: string; href: string }[]).map((item) => (
            <Pressable key={item.label} style={[s.quickAccessItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]} onPress={() => router.push(item.href as Parameters<typeof router.push>[0])}>
              <View style={[s.quickAccessIcon, { backgroundColor: theme.colors.accentSoft }]}>
                <Icon name={item.icon} size={17} color={theme.colors.accent} />
              </View>
              <Text style={s.quickAccessLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      </ScrollView>
      <SystemDetailSheet system={detailSystem} onClose={() => setDetailSystem(null)} />
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
  subGreeting: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderSoft,
    position: 'relative',
  },
  headerDot: { position: 'absolute', top: 6, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: '#C23A3A', borderWidth: 1.5 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  hero: { borderRadius: 28, paddingHorizontal: 22, paddingTop: 24, marginBottom: 12, overflow: 'hidden' },
  heroEyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  heroEyebrow: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.4, color: '#9BA3E5' },
  heroSwitchBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12,
  },
  heroSwitchText: { fontSize: 11.5, fontWeight: '600', color: '#C4CAF2' },
  heroName: { fontSize: 27, fontWeight: '600', color: '#fff' },
  heroTrim: { fontSize: 17, fontWeight: '500', color: '#C4CAF2', marginTop: 2 },
  heroMeta: { fontSize: 13, color: '#9FB0D9', marginTop: 12 },
  connectedRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 14, alignSelf: 'flex-start',
    backgroundColor: 'rgba(127,216,168,0.14)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10,
  },
  connectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5EDB93', marginRight: 6 },
  connectedText: { fontSize: 12, fontWeight: '600', color: '#8FE0B4' },
  heroArtWrap: { alignItems: 'center', paddingVertical: 14 },
  heroHealthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingVertical: 16, marginTop: 8,
  },
  heroHealthLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  heroHealthTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  heroHealthSub: { fontSize: 12, color: '#9BA3E5', marginTop: 2 },
  heroHealthLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroHealthLinkText: { fontSize: 12.5, fontWeight: '700', color: '#A8B2FF' },
  quickStatusCard: { padding: 0, overflow: 'hidden' },
  quickStatusWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  qsItem: { width: '50%', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft },
  qsItemBorder: { borderRightWidth: 1, borderRightColor: theme.colors.borderSoft },
  qsLabel: { fontSize: 11, color: theme.colors.textTertiary, fontWeight: '600', marginBottom: 4 },
  qsValue: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  qsSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  eyebrowLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textTertiary, letterSpacing: 0.4, marginBottom: 10 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start' },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 8 },
  insightText: { flex: 1, fontSize: 14.5, fontWeight: '600', color: theme.colors.textPrimary },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 14 },
  apptCard: { flexDirection: 'row', alignItems: 'center' },
  apptIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  apptTitle: { fontSize: 13.5, fontWeight: '700', color: theme.colors.textPrimary },
  apptSub: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 2 },
  sysRow: { paddingVertical: 12 },
  sysHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  sysLabel: { fontSize: 13.5, fontWeight: '600', color: theme.colors.textPrimary },
  sysScore: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  sysCondition: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 6 },
  footLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  footLinkText: { fontSize: 12.5, fontWeight: '700', color: theme.colors.accent },

  // Ford One Intelligence card
  intelCard: { borderRadius: 22, padding: 18, marginBottom: 12 },
  intelHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  intelMark: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(107,120,255,.4)', backgroundColor: 'rgba(107,120,255,.14)',
  },
  intelLabel: { fontSize: 12, fontWeight: '700', color: '#C4CAF2' },
  intelBadge: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  intelBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#ECEEFC' },
  intelTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 6 },
  intelText: { fontSize: 13.5, lineHeight: 20, color: '#ECEEFC' },
  intelMetaRow: {
    flexDirection: 'row', gap: 22, marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.12)',
  },
  intelMetaLabel: { fontSize: 11, color: '#9BA3E5' },
  intelMetaValue: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 2 },
  intelActionsRow: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  intelBtnOutline: { borderWidth: 1, borderColor: 'rgba(255,255,255,.28)', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  intelBtnOutlineText: { fontSize: 12.5, fontWeight: '700', color: '#ECEEFC' },
  intelBtnSolid: { backgroundColor: 'rgba(255,255,255,.16)', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  intelBtnSolidText: { fontSize: 12.5, fontWeight: '700', color: '#fff' },
  intelExpand: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.12)' },
  intelExpandTitle: { fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 6 },
  intelExpandItem: { fontSize: 12.5, color: '#C4CAF2', lineHeight: 19 },

  // Próximas ações
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft,
  },
  actionIndex: { fontSize: 13, fontWeight: '700', color: theme.colors.textTertiary, width: 20 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  actionMeta: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 2 },
  actionCta: { fontSize: 12.5, fontWeight: '700', color: theme.colors.accent },

  // Seu Ford precisa da sua atenção
  attentionDivider: { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft, marginBottom: 14, paddingBottom: 14 },
  attentionTitle: { fontSize: 14.5, fontWeight: '700', color: theme.colors.textPrimary },
  attentionRec: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 6, lineHeight: 19 },
  attentionActionsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  smBtn: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13 },
  smBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1 },
  smBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Atividade recente
  timeline: { paddingLeft: 20 },
  timelineItem: { position: 'relative' },
  timelineDot: { position: 'absolute', left: -20, top: 3, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  timelineDate: { fontSize: 11, fontWeight: '700', color: theme.colors.textTertiary, marginBottom: 3 },
  timelineTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  timelineSub: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 2 },
  timelinePlace: { fontSize: 12.5, fontWeight: '600', color: theme.colors.accent, marginTop: 3 },

  // Acessos rápidos
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  quickAccessItem: {
    width: '47.5%', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: 16, borderWidth: 1,
  },
  quickAccessIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickAccessLabel: { fontSize: 12.5, fontWeight: '600', color: theme.colors.textPrimary, textAlign: 'center' },
});
