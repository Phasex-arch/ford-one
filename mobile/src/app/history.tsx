import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import { historyTimeline, getMonthlyRecap } from '../constants/data';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { vehicleVersion } = useAppState();
  void vehicleVersion;
  const s = styles(theme);
  const recap = getMonthlyRecap();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Toda a jornada do seu veículo, do primeiro dia até hoje.</Text>

      <Card>
        <Text style={s.sectionTitle}>Seu Ford em {recap.monthLabel}</Text>
        <View style={s.recapRow}>
          <View style={s.recapTile}>
            <Text style={s.recapLabel}>Km percorridos</Text>
            <Text style={s.recapValue}>{recap.kmDriven.toLocaleString('pt-BR')} km</Text>
          </View>
          <View style={s.recapTile}>
            <Text style={s.recapLabel}>Gasto no mês</Text>
            <Text style={s.recapValue}>R$ {recap.spent.toLocaleString('pt-BR')}</Text>
          </View>
          <View style={s.recapTile}>
            <Text style={s.recapLabel}>Consumo médio</Text>
            <Text style={s.recapValue}>{recap.consumption}</Text>
          </View>
        </View>
        <Text style={s.recapHealth}>Saúde: {recap.healthPrev}% → {recap.health}%.</Text>
      </Card>

      <Card>
        {historyTimeline.map((item, i) => (
          <View key={item.title + item.date} style={s.itemRow}>
            <View style={s.timelineCol}>
              <View style={[s.dot, { backgroundColor: theme.colors.accent }]} />
              {i < historyTimeline.length - 1 && <View style={[s.line, { backgroundColor: theme.colors.borderSoft }]} />}
            </View>
            <View style={{ flex: 1, paddingBottom: i < historyTimeline.length - 1 ? 20 : 0 }}>
              <Text style={s.date}>{item.date} · {item.km}</Text>
              <Text style={s.title}>{item.title}</Text>
              <View style={s.footerRow}>
                <Text style={s.place}>{item.place}</Text>
                <Text style={s.cost}>{item.cost}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 12 },
  recapRow: { flexDirection: 'row', gap: 10 },
  recapTile: { flex: 1, backgroundColor: theme.colors.surfaceSunken, borderRadius: 10, padding: 10 },
  recapLabel: { fontSize: 10, color: theme.colors.textTertiary, fontWeight: '600', marginBottom: 4 },
  recapValue: { fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary },
  recapHealth: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 14 },
  itemRow: { flexDirection: 'row' },
  timelineCol: { width: 20, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  line: { flex: 1, width: 2, marginTop: 4 },
  date: { fontSize: 11.5, fontWeight: '700', color: theme.colors.textTertiary, marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  place: { fontSize: 12, color: theme.colors.accent, flex: 1 },
  cost: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary, marginLeft: 8 },
});
