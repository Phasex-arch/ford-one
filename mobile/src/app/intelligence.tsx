import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Switch from '../components/Switch';
import { intelligenceToggles } from '../constants/data';

// openIntelligenceSettingsModal() no site — os 2 alternadores vivem em
// settingsState.intelligence, compartilhado e persistido (AppStateContext),
// não um useState local que resetava toda vez que a tela era reaberta.
export default function IntelligenceScreen() {
  const { theme } = useTheme();
  const { settings, setIntelligencePref } = useAppState();
  const s = styles(theme);
  const values = settings.intelligence;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Controle como a inteligência do seu Ford trabalha para você.</Text>
      <Card style={{ padding: 0, marginBottom: 16 }}>
        {intelligenceToggles.map((t, i) => (
          <View key={t.key} style={[s.row, i < intelligenceToggles.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={s.label}>{t.label}</Text>
              <Text style={s.desc}>{t.desc}</Text>
            </View>
            <Switch value={values[t.key]} onValueChange={(v) => setIntelligencePref(t.key, v)} />
          </View>
        ))}
      </Card>
      <Pressable style={[s.ctaBtn, { borderColor: theme.colors.border }]} onPress={() => router.push('/assistant')}>
        <Text style={[s.ctaText, { color: theme.colors.textPrimary }]}>Conversar com a Ford One Intelligence</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 12.5, color: theme.colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  label: { fontSize: 13.5, fontWeight: '700', color: theme.colors.textPrimary },
  desc: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 3, lineHeight: 16 },
  ctaBtn: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  ctaText: { fontSize: 14, fontWeight: '700' },
});
