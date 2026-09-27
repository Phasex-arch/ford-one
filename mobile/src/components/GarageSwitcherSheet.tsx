import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import { useToast } from './Toast';
import BottomSheet from './BottomSheet';
import { garage } from '../constants/data';

// Mirrors the web app's openGarageModal(): "Minha Garagem" — tap a vehicle
// to make it the active one across the whole app (Home, Saúde,
// Manutenções, Alertas, Histórico all update).
interface GarageSwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function GarageSwitcherSheet({ visible, onClose }: GarageSwitcherSheetProps) {
  const { theme } = useTheme();
  const { activeVehicleIndex, switchVehicle } = useAppState();
  const showToast = useToast();
  const s = styles(theme);

  const handleSwitch = (i: number) => {
    if (i === activeVehicleIndex) return;
    const name = garage[i].vehicle.name;
    switchVehicle(i);
    onClose();
    router.push('/(tabs)');
    showToast(`Veículo ativo: ${name}`);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={s.title}>Minha Garagem</Text>
      <Text style={s.sub}>
        Toque em um veículo para trocar o veículo ativo — Home, Saúde, Manutenções, Alertas e Histórico são atualizados.
      </Text>
      <View>
        {garage.map((g, i) => {
          const active = i === activeVehicleIndex;
          return (
            <Pressable
              key={g.vehicle.plate}
              onPress={() => handleSwitch(i)}
              disabled={active}
              style={[s.row, i < garage.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}
            >
              <View style={[s.rowIcon, { backgroundColor: active ? theme.colors.successBg : theme.colors.accentSoft }]}>
                <Icon name="car" size={18} color={active ? theme.colors.success : theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{g.vehicle.name}</Text>
                <Text style={s.rowSub}>{g.vehicle.trim}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: active ? theme.colors.successBg : theme.colors.surfaceSunken }]}>
                <Text style={[s.badgeText, { color: active ? theme.colors.success : theme.colors.textSecondary }]}>
                  {active ? `Ativo · ${g.health.overall}%` : `${g.health.overall}%`}
                </Text>
              </View>
              {!active && <Icon name="chevron" size={18} color={theme.colors.textTertiary} style={{ marginLeft: 6 }} />}
            </Pressable>
          );
        })}
      </View>
      <Pressable style={s.addBtn} onPress={() => showToast('Fluxo de adicionar veículo em breve')}>
        <Text style={[s.addBtnText, { color: theme.colors.accent }]}>+ Adicionar veículo</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  sub: { fontSize: 12.5, color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  rowSub: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11.5, fontWeight: '600' },
  addBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 10 },
  addBtnText: { fontSize: 13.5, fontWeight: '700' },
});
