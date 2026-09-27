import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Icon from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { boxShadow } from '../styles/theme';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import SystemDetailSheet from '../components/SystemDetailSheet';
import { alerts, vehicleHealth } from '../constants/data';
import type { VehicleSystem, VehicleAlert, AlertAction, AlertType } from '../types';
import type { BadgeTone } from '../components/Badge';

const toneMap: Record<AlertType, BadgeTone> = { danger: 'danger', warning: 'warning', accent: 'neutral' };
const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'danger', label: 'Importante' },
  { key: 'warning', label: 'Atenção' },
  { key: 'accent', label: 'Informativo' },
];

export default function AlertsScreen() {
  const { theme } = useTheme();
  const { vehicleVersion, setSuggestedService, dismissedAlertIds, dismissAlert, restoreDismissedAlerts } = useAppState();
  void vehicleVersion; // subscribe so this screen re-renders on vehicle switch
  const s = styles(theme);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const dismissed = dismissedAlertIds;
  const [detailSystem, setDetailSystem] = useState<VehicleSystem | null>(null);

  const visible = alerts.filter((a) => !dismissed.has(a.id));
  const filtered = filter === 'all' ? visible : visible.filter((a) => a.type === filter);
  const countFor = (type: string) => alerts.filter((a) => !dismissed.has(a.id) && (type === 'all' || a.type === type)).length;

  const runAlertAction = (a: VehicleAlert, act: AlertAction) => {
    if (act.kind === 'system') {
      const sys = vehicleHealth.systems.find((sy) => sy.id === a.system);
      if (sys) setDetailSystem(sys);
    } else if (act.kind === 'schedule') {
      setSuggestedService(act.service || null);
      router.push('/scheduling');
    }
  };

  const dismiss = (id: string) => {
    dismissAlert(id);
    setOpen((cur) => (cur === id ? null : cur));
  };

  const restoreAll = () => restoreDismissedAlerts();

  if (alerts.length === 0) {
    return (
      <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
        <Text style={s.pageSub}>Itens que merecem sua atenção, ordenados por prioridade. Toque em um alerta para ver o detalhe e agir.</Text>
        <Card style={s.emptyCard}>
          <View style={[s.emptyIcon, { backgroundColor: theme.colors.successBg }]}>
            <Icon name="emptyStar" size={22} color={theme.colors.success} />
          </View>
          <Text style={s.emptyTitle}>Tudo certo por aqui</Text>
          <Text style={s.emptyText}>Nenhum alerta ativo para este veículo no momento.</Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Itens que merecem sua atenção, ordenados por prioridade. Toque em um alerta para ver o detalhe e agir.</Text>

      <View style={[s.tabsRow, { backgroundColor: theme.colors.surfaceSunken }]}>
        {TABS.map((t) => {
          const count = countFor(t.key);
          const active = filter === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setFilter(t.key)}
              style={[
                s.tab,
                active && { backgroundColor: theme.colors.surface, ...boxShadow('#0F1932', 0.06, 3, 1) },
              ]}
            >
              <Text style={[s.tabText, { color: active ? theme.colors.textPrimary : theme.colors.textSecondary }]}>{t.label}{count > 0 ? ` · ${count}` : ''}</Text>
            </Pressable>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <Card style={s.emptyCard}>
          <View style={[s.emptyIcon, { backgroundColor: theme.colors.successBg }]}>
            <Icon name="emptyStar" size={22} color={theme.colors.success} />
          </View>
          <Text style={s.emptyTitle}>{visible.length === 0 ? 'Tudo em dia por aqui' : 'Nenhum alerta nessa categoria'}</Text>
          <Text style={s.emptyText}>{visible.length === 0 ? 'Você não tem alertas pendentes no momento. Assim que algo precisar da sua atenção, vai aparecer aqui.' : 'Experimente outra aba para ver os demais alertas.'}</Text>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {filtered.map((a, i) => (
            <View key={a.id} style={[i < filtered.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}>
              <Pressable onPress={() => setOpen(open === a.id ? null : a.id)} style={s.row}>
                <View style={s.rowHeader}>
                  <View style={[
                    s.rowIcon,
                    {
                      backgroundColor: a.type === 'danger' ? theme.colors.dangerBg
                        : a.type === 'warning' ? theme.colors.warningBg
                          : theme.colors.accentSoft,
                    },
                  ]}>
                    <Icon
                      name={a.system === 'freios' ? 'brake' : a.system === 'oleo' ? 'oil' : a.system === 'pneus' ? 'tire' : 'alert'}
                      size={19}
                      color={a.type === 'danger' ? theme.colors.danger : a.type === 'warning' ? theme.colors.warning : theme.colors.accent}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Badge label={a.level} tone={toneMap[a.type]} />
                    <Text style={s.title}>{a.title}</Text>
                    <Text style={s.desc}>{a.desc}</Text>
                  </View>
                  <Icon
                    name="chevron"
                    size={18}
                    color={theme.colors.textTertiary}
                    style={{ transform: [{ rotate: open === a.id ? '90deg' : '0deg' }] }}
                  />
                </View>
              </Pressable>
              {open === a.id && (
                <View style={[s.expandBox, { backgroundColor: theme.colors.surfaceSunken }]}>
                  <Text style={s.expandText}>{a.recommendation}</Text>
                  <View style={s.actionsRow}>
                    {a.actions.map((act, idx) => (
                      <Pressable
                        key={idx}
                        style={act.kind === 'schedule' ? [s.actionBtnPrimary, { backgroundColor: theme.colors.navy950 }] : [s.actionBtnSecondary, { borderColor: theme.colors.border }]}
                        onPress={() => runAlertAction(a, act)}
                      >
                        <Text style={act.kind === 'schedule' ? s.actionBtnPrimaryText : [s.actionBtnSecondaryText, { color: theme.colors.textPrimary }]}>{act.label}</Text>
                      </Pressable>
                    ))}
                    <Pressable style={s.dismissBtn} onPress={() => dismiss(a.id)}>
                      <Text style={[s.dismissBtnText, { color: theme.colors.textSecondary }]}>Dispensar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          ))}
        </Card>
      )}

      {dismissed.size > 0 && (
        <Pressable style={s.restoreBtn} onPress={restoreAll}>
          <Text style={[s.restoreBtnText, { color: theme.colors.textPrimary }]}>
            Restaurar {dismissed.size} alerta{dismissed.size > 1 ? 's' : ''} dispensado{dismissed.size > 1 ? 's' : ''}
          </Text>
        </Pressable>
      )}

      <SystemDetailSheet system={detailSystem} onClose={() => setDetailSystem(null)} />
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19 },
  tabsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14, marginBottom: 14, padding: 4, borderRadius: 999, alignSelf: 'flex-start' },
  tab: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  tabText: { fontSize: 12.5, fontWeight: '600' },
  row: { padding: 14 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: 14.5, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 8 },
  desc: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 18 },
  expandBox: { borderRadius: 10, padding: 12, marginHorizontal: 14, marginBottom: 14 },
  expandText: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  actionBtnPrimary: { borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  actionBtnPrimaryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionBtnSecondary: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  actionBtnSecondaryText: { fontSize: 12, fontWeight: '700' },
  dismissBtn: { marginLeft: 'auto', paddingVertical: 9, paddingHorizontal: 6 },
  dismissBtnText: { fontSize: 12, fontWeight: '700' },
  restoreBtn: { alignItems: 'center', marginTop: 16 },
  restoreBtnText: { fontSize: 12.5, fontWeight: '700' },
  emptyCard: { marginTop: 14, alignItems: 'center', paddingVertical: 28 },
  emptyIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 12.5, color: theme.colors.textSecondary, textAlign: 'center' },
});
