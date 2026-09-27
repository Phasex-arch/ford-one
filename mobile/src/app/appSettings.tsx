import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import Switch from '../components/Switch';
import Row from '../components/Row';

// openAppSettingsModal() no site: modo escuro + versão do app.
export default function AppSettingsScreen() {
  const { theme, toggle, mode } = useTheme();
  const s = styles(theme);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Preferências gerais do aplicativo.</Text>
      <Card>
        <View style={s.row}>
          <View style={[s.iconWrap, { backgroundColor: theme.colors.accentSoft }]}>
            <Icon name="sun" size={17} color={theme.colors.accent} />
          </View>
          <Text style={s.rowLabel}>Modo escuro</Text>
          <Switch value={mode === 'dark'} onValueChange={toggle} />
        </View>
        <Row label="Versão do app" value="Ford One 1.0" last />
      </Card>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 14.5, fontWeight: '600', color: theme.colors.textPrimary },
});
