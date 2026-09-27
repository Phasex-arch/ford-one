import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import Badge from './Badge';
import GaugeRing from './GaugeRing';
import BottomSheet from './BottomSheet';
import { vehicle } from '../constants/data/state';

interface FuelDetailSheetProps {
  visible: boolean;
  onClose: () => void;
}

// openFuelModal() no site — a "Combustível" tag do Digital Twin.
export default function FuelDetailSheet({ visible, onClose }: FuelDetailSheetProps) {
  const { theme } = useTheme();
  const s = styles(theme);
  const daysUntilRefuel = Math.max(1, Math.round(vehicle.range / vehicle.avgKmPerDay));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={s.headerRow}>
        <View style={[s.iconWrap, { backgroundColor: theme.colors.accentSoft }]}>
          <Icon name="drop" size={20} color={theme.colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Combustível</Text>
          <Badge label={vehicle.fuel} tone="neutral" />
        </View>
      </View>
      <Text style={s.note}>
        No seu ritmo atual, você provavelmente precisará abastecer em aproximadamente {daysUntilRefuel} dia{daysUntilRefuel > 1 ? 's' : ''}.
      </Text>
      <View style={s.row}>
        <GaugeRing value={vehicle.fuelLevel} size={88} strokeWidth={8} />
        <View style={[s.box, { backgroundColor: theme.colors.surfaceSunken }]}>
          <Text style={s.boxTitle}>Autonomia estimada</Text>
          <Text style={s.boxText}>{vehicle.range} km restantes, com consumo médio de {vehicle.consumption}.</Text>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 5 },
  note: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  box: { flex: 1, minWidth: 160, borderRadius: 16, padding: 14 },
  boxTitle: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  boxText: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18 },
});
