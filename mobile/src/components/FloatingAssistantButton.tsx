import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import { boxShadow } from '../styles/theme';
import { useAppState } from '../context/AppStateContext';
import BottomSheet from './BottomSheet';
import SystemDetailSheet from './SystemDetailSheet';
import { vehicle, vehicleHealth, alerts } from '../constants/data';
import { SYSTEM_ICONS } from '../constants/healthHotspots';
import type { IconName } from './Icon';
import type { VehicleSystem } from '../types';

interface Insight {
  icon: IconName;
  title: string;
  desc: string;
  action: () => void;
}

// Mirrors script.js's floating .ai-fab launcher + openIntelligencePopup():
// a circular button, fixed bottom-right on every page except Assistente
// itself (navigateTo toggles .ai-fab--hidden there), that opens a summary
// of up to 4 "insights" (systems needing attention, critical alerts, the
// next service milestone) — same priority order and 4-item cap as
// getIntelligenceInsights(). A red dot appears when there is at least one
// undismissed danger-type alert, same rule as updateNotificationDots()'s
// aiFabDot.
export default function FloatingAssistantButton() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const { vehicleVersion, dismissedAlertIds } = useAppState();
  void vehicleVersion;
  const [open, setOpen] = useState(false);
  const [detailSystem, setDetailSystem] = useState<VehicleSystem | null>(null);
  const s = styles(theme);

  // Hidden on the Assistente screen itself (same as .ai-fab--hidden there).
  if (pathname === '/assistant') return null;

  const activeAlerts = alerts.filter((a) => !dismissedAlertIds.has(a.id));
  const hasCritical = activeAlerts.some((a) => a.type === 'danger');

  const insights: Insight[] = [];
  vehicleHealth.systems.filter((sy) => sy.status === 'warn').forEach((sy) => {
    insights.push({
      icon: SYSTEM_ICONS[sy.id] || 'gauge',
      title: `${sy.label}: ${sy.condition.toLowerCase()}`,
      desc: sy.note,
      action: () => { setOpen(false); setDetailSystem(sy); },
    });
  });
  activeAlerts.filter((a) => a.type === 'danger').forEach((a) => {
    insights.push({
      icon: a.system === 'freios' ? 'brake' : a.system === 'oleo' ? 'oil' : a.system === 'pneus' ? 'tire' : 'alert',
      title: a.title,
      desc: a.desc,
      action: () => { setOpen(false); router.push('/alerts'); },
    });
  });
  const remainingKm = vehicle.nextServiceKm - vehicle.km;
  insights.push({
    icon: 'wrench',
    title: `Revisão dos ${vehicle.nextServiceKm.toLocaleString('pt-BR')} km se aproxima`,
    desc: `Faltam ${remainingKm.toLocaleString('pt-BR')} km para o próximo marco de manutenção programada.`,
    action: () => { setOpen(false); router.push('/(tabs)/services'); },
  });
  const shown = insights.slice(0, 4);

  return (
    <>
      <Pressable
        style={[s.fab, { backgroundColor: theme.colors.navy950, borderColor: 'rgba(107,120,255,.4)' }]}
        onPress={() => setOpen(true)}
        accessibilityLabel="Abrir Ford One Intelligence"
      >
        <Icon name="spark" size={22} color="#A8B2FF" />
        {hasCritical && <View style={[s.dot, { backgroundColor: theme.colors.danger, borderColor: theme.colors.navy950 }]} />}
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)}>
        <View style={[s.header, { backgroundColor: theme.colors.navy950 }]}>
          <View style={s.mark}>
            <Icon name="spark" size={18} color="#A8B2FF" />
          </View>
          <Text style={s.headerTitle}>Ford One Intelligence</Text>
          <Text style={s.headerSub}>Um resumo do que identificamos no seu Ford agora.</Text>
        </View>
        {shown.length === 0 ? (
          <View style={s.emptyBlock}>
            <Text style={s.emptyTitle}>Tudo certo por aqui</Text>
            <Text style={s.emptySub}>Não há nenhuma recomendação nova no momento.</Text>
          </View>
        ) : (
          <View>
            {shown.map((ins, i) => (
              <Pressable
                key={i}
                onPress={ins.action}
                style={[s.row, i < shown.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}
              >
                <View style={[s.rowIcon, { backgroundColor: theme.colors.accentSoft }]}>
                  <Icon name={ins.icon} size={18} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.rowTitle}>{ins.title}</Text>
                  <Text style={s.rowSub}>{ins.desc}</Text>
                </View>
                <Icon name="chevron" size={16} color={theme.colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}
        <Pressable style={[s.talkBtn, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border }]} onPress={() => { setOpen(false); router.push('/assistant'); }}>
          <Text style={[s.talkBtnText, { color: theme.colors.textPrimary }]}>Conversar com a Ford One Intelligence</Text>
        </Pressable>
      </BottomSheet>

      <SystemDetailSheet system={detailSystem} onClose={() => setDetailSystem(null)} />
    </>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  fab: {
    position: 'absolute', right: 16, bottom: 82, zIndex: 44,
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    ...boxShadow('#000000', 0.3, 12, 8),
  },
  dot: { position: 'absolute', top: 1, right: 1, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  header: { margin: -20, marginBottom: 18, padding: 20, paddingTop: 22, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  mark: {
    width: 40, height: 40, borderRadius: 20, marginBottom: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(107,120,255,.16)', borderWidth: 1, borderColor: 'rgba(107,120,255,.4)',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  headerSub: { fontSize: 12.5, color: '#C4CAF2', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  rowSub: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 2 },
  talkBtn: { marginTop: 16, height: 44, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  talkBtnText: { fontSize: 14, fontWeight: '600' },
  emptyBlock: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.colors.border, borderRadius: 22, paddingVertical: 36, paddingHorizontal: 20, alignItems: 'center' },
  emptyTitle: { fontSize: 14.5, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  emptySub: { fontSize: 12.5, color: theme.colors.textSecondary, textAlign: 'center' },
});
