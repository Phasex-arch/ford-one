import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useToast } from './Toast';
import Badge from './Badge';
import GaugeRing from './GaugeRing';
import BottomSheet from './BottomSheet';
import { SYSTEM_ICONS, WARRANTY_SYSTEM_IDS } from '../constants/healthHotspots';
import { tirePositions } from '../constants/data/state';
import type { VehicleSystem } from '../types';

interface SystemDetailSheetProps {
  system: VehicleSystem | null;
  onClose: () => void;
}

// The RN equivalent of script.js's openSystemModal(): icon + label + status
// badge, note, gauge + trend, and (when the system needs attention) a
// warranty hint and an "Agendar verificação" button. Opened by tapping a
// hotspot on the vehicle diagram or a row in "Todos os sistemas".
//
// "Pneus" is special-cased, same as openSystemModal()'s
// `if(sysId === "pneus") return openTiresModal();` — a per-tire PSI grid
// instead of the generic gauge, since the site's "pneus" system has its
// own dedicated drill-down modal.
export default function SystemDetailSheet({ system, onClose }: SystemDetailSheetProps) {
  const { theme } = useTheme();
  const showToast = useToast();
  const visible = !!system;
  const warn = system?.status === 'warn';
  const underWarranty = system ? WARRANTY_SYSTEM_IDS.includes(system.id) : false;
  const s = styles(theme);

  if (system && system.id === 'pneus') {
    const flagged = tirePositions.find((t) => t.status === 'warn');
    return (
      <BottomSheet visible={visible} onClose={onClose}>
        <View style={s.headerRow}>
          <View style={[s.iconWrap, { backgroundColor: flagged ? theme.colors.warningBg : theme.colors.successBg }]}>
            <Icon name="tire" size={20} color={flagged ? theme.colors.warning : theme.colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Pneus</Text>
          </View>
        </View>
        <Text style={s.note}>Saúde geral: {system.score}% ({system.condition}).</Text>
        <View style={s.tireGrid}>
          {tirePositions.map((t) => (
            <View key={t.id} style={[s.tireCard, { backgroundColor: theme.colors.surfaceSunken, borderColor: t.status === 'warn' ? theme.colors.warning : 'transparent' }]}>
              <Text style={s.tireLabel}>{t.label}</Text>
              <Text style={s.tirePsi}>{t.psi} <Text style={s.tirePsiUnit}>PSI</Text></Text>
              <Badge label={t.status === 'warn' ? 'Atenção' : 'Normal'} tone={t.status === 'warn' ? 'warning' : 'success'} />
            </View>
          ))}
        </View>
        {flagged ? (
          <>
            <View style={[s.warrantyRow, { backgroundColor: theme.colors.warningBg, marginTop: 16 }]}>
              <Text style={s.warrantyText}>
                <Text style={{ fontWeight: '800', color: theme.colors.textPrimary }}>{flagged.label}: </Text>
                pressão em {flagged.psi} PSI, abaixo do recomendado ({flagged.recommended} PSI). Calibre antes de uma viagem longa para evitar desgaste irregular.
              </Text>
            </View>
            <Pressable style={[s.scheduleBtn, { backgroundColor: theme.colors.accent }]} onPress={() => { onClose(); router.push('/dealerships'); }}>
              <Text style={s.scheduleBtnText}>Encontrar posto de calibragem</Text>
            </Pressable>
          </>
        ) : (
          <Text style={[s.note, { marginTop: 16, marginBottom: 0 }]}>Todos os pneus estão dentro da faixa recomendada.</Text>
        )}
      </BottomSheet>
    );
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {system && (
        <>
          <View style={s.headerRow}>
            <View style={[s.iconWrap, { backgroundColor: warn ? theme.colors.warningBg : theme.colors.successBg }]}>
              <Icon name={SYSTEM_ICONS[system.id] || 'gauge'} size={20} color={warn ? theme.colors.warning : theme.colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{system.label}</Text>
              <Badge label={system.condition} tone={warn ? 'warning' : 'success'} />
            </View>
          </View>

          <Text style={s.note}>{system.note}</Text>

          <View style={s.metricsRow}>
            <GaugeRing
              value={system.score}
              size={88}
              strokeWidth={8}
              textColor={warn ? theme.colors.warning : undefined}
              ringColor={warn ? theme.colors.warning : undefined}
            />
            <View style={[s.trendBox, { backgroundColor: theme.colors.surfaceSunken }]}>
              <Text style={s.trendTitle}>Tendência</Text>
              <Text style={s.trendText}>{system.trend}</Text>
            </View>
          </View>

          {warn && underWarranty && (
            <View style={[s.warrantyRow, { backgroundColor: theme.colors.accentSoft }]}>
              <Text style={s.warrantyText}>Este item pode estar coberto pela garantia.</Text>
              <Pressable onPress={() => { onClose(); router.push('/(tabs)/vehicle'); }}>
                <Text style={s.warrantyLink}>Consultar cobertura</Text>
              </Pressable>
            </View>
          )}

          {warn && (
            <Pressable
              style={[s.scheduleBtn, { backgroundColor: theme.colors.accent }]}
              onPress={() => {
                onClose();
                showToast(`Abrindo agendamento: ${system.label}`);
                router.push('/scheduling');
              }}
            >
              <Text style={s.scheduleBtnText}>Agendar verificação</Text>
            </Pressable>
          )}
        </>
      )}
    </BottomSheet>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 5 },
  note: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19, marginBottom: 16 },
  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  trendBox: { flex: 1, minWidth: 160, borderRadius: 16, padding: 14 },
  trendTitle: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  trendText: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18 },
  warrantyRow: { borderRadius: 12, padding: 12, marginTop: 16 },
  warrantyText: { fontSize: 12.5, color: theme.colors.textPrimary, marginBottom: 4 },
  warrantyLink: { fontSize: 12.5, fontWeight: '700', color: theme.colors.accent },
  scheduleBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  scheduleBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  tireGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tireCard: { width: '47%', borderRadius: 14, borderWidth: 1.5, padding: 14, alignItems: 'flex-start', gap: 6 },
  tireLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  tirePsi: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  tirePsiUnit: { fontSize: 11, fontWeight: '600', color: theme.colors.textTertiary },
});
