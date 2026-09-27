import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Row from '../components/Row';
import { distanceUnits } from '../constants/data';

// openPreferencesModal() no site: unidade de distância (km/mi) + idioma
// (linha informativa fixa) — não é uma tela de toggles. `unit` mora em
// AppStateContext (settings.preferences.unit), igual ao settingsState do
// site — antes era um useState local que resetava pra "km" toda vez que
// a tela era reaberta, mesmo tendo sido trocada pra "mi" na visita anterior.
export default function PreferencesScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const { settings, setDistanceUnit } = useAppState();
  const s = styles(theme);
  const unit = settings.preferences.unit;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Ajuste como as informações aparecem para você.</Text>
      <Card>
        <Text style={s.label}>Unidade de distância</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {distanceUnits.map((u) => (
            <Chip
              key={u.key}
              label={u.label}
              selected={unit === u.key}
              onPress={() => {
                setDistanceUnit(u.key);
                showToast(u.key === 'km' ? 'Exibindo distâncias em quilômetros' : 'Exibindo distâncias em milhas');
              }}
            />
          ))}
        </View>
        <Row label="Idioma" value="Português (Brasil)" last />
      </Card>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  label: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 10 },
});
