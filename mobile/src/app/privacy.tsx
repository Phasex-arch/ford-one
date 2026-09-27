import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Switch from '../components/Switch';
import { privacyToggles } from '../constants/data';

// openPrivacyModal() no site: os 3 alternadores vivem em settingsState,
// compartilhado e persistido — aqui em AppStateContext.settings.privacy,
// em vez de um useState local que perdia o valor ao sair e voltar da tela.
export default function PrivacyScreen() {
  const { theme } = useTheme();
  const { settings, setPrivacyPref } = useAppState();
  const s = styles(theme);
  const values = settings.privacy;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Seus dados são tratados de acordo com a LGPD. Você pode ajustar o que é compartilhado a qualquer momento.</Text>
      <Card style={{ padding: 0 }}>
        {privacyToggles.map((t, i) => (
          <View key={t.key} style={[s.row, i < privacyToggles.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={s.label}>{t.label}</Text>
              <Text style={s.desc}>{t.desc}</Text>
            </View>
            <Switch value={values[t.key]} onValueChange={(v) => setPrivacyPref(t.key, v)} />
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 12.5, color: theme.colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  label: { fontSize: 13.5, fontWeight: '700', color: theme.colors.textPrimary },
  desc: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 3, lineHeight: 16 },
});
