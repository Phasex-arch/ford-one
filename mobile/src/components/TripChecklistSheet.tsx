import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import Badge from './Badge';
import BottomSheet from './BottomSheet';
import { vehicleHealth } from '../constants/data/state';

// openTripChecklistModal() no site — "Preparar viagem", disparado pelo
// botão "Checklist da viagem" da resposta do Assistente à pergunta
// "Posso viajar amanhã?".
interface TripChecklistSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function TripChecklistSheet({ visible, onClose }: TripChecklistSheetProps) {
  const { theme } = useTheme();
  const s = styles(theme);
  const systems = vehicleHealth.systems;
  const warnList = systems.filter((sys) => sys.status === 'warn');
  const verdict = warnList.length === 0 ? 'Ótima para viagem' : 'Boa para viagem';

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[s.iconWrap, { backgroundColor: theme.colors.accentSoft }]}>
        <Icon name="check" size={20} color={theme.colors.accent} />
      </View>
      <Text style={s.title}>Preparar viagem</Text>
      <Text style={s.sub}>Verificação rápida das condições do seu Ford antes de sair.</Text>

      <View>
        {systems.map((sys, i) => (
          <View key={sys.id} style={[s.row, i < systems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}>
            <Text style={s.rowLabel}>{sys.label}</Text>
            <Badge label={sys.status === 'warn' ? 'Atenção' : 'OK'} tone={sys.status === 'warn' ? 'warning' : 'success'} />
          </View>
        ))}
      </View>

      <Text style={s.verdictTitle}>Condição geral: {verdict}</Text>
      {warnList.length > 0 ? (
        <>
          <Text style={s.sub}>Antes de sair:</Text>
          {warnList.map((sys, i) => (
            <Text key={sys.id} style={s.noteItem}>{i + 1}. {sys.note}</Text>
          ))}
        </>
      ) : (
        <Text style={s.sub}>Nenhuma pendência identificada.</Text>
      )}
    </BottomSheet>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: 12.5, color: theme.colors.textSecondary, marginBottom: 12, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11 },
  rowLabel: { fontSize: 13.5, color: theme.colors.textSecondary },
  verdictTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8 },
  noteItem: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 6 },
});
