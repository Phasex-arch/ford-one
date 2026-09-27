import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { boxShadow } from '../styles/theme';
import { useAppState } from '../context/AppStateContext';
import Card from './Card';
import Badge from './Badge';
import BottomSheet from './BottomSheet';
import { maintenance, getServicePrediction } from '../constants/data';
import type { BadgeTone } from './Badge';

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 12 }}>{children}</Text>;
}

const TAG_TONE: Record<string, BadgeTone> = { warning: 'warning', accent: 'accent', neutral: 'neutral' };

// The Manutenções content — shared by the stacked route (app/maintenance.js,
// reached via "Ver todas" links etc., with a native back header) and the
// "Serviços" bottom tab (app/(tabs)/services.js, with the custom TopBar).
// Same single page in the HTML MVP: `maintenance` is a bottom-nav id whose
// mobile label happens to read "Serviços", not a separate hub screen.
export default function MaintenanceBody({ header }: { header?: React.ReactNode }) {
  const { theme } = useTheme();
  const { vehicleVersion, setSuggestedService } = useAppState();
  void vehicleVersion; // subscribe so this screen re-renders on vehicle switch
  const [tab, setTab] = useState('proximas');
  const [openItem, setOpenItem] = useState<number | null>(null); // maintenance.items index
  const s = styles(theme);
  const prediction = getServicePrediction();
  const item = openItem !== null ? maintenance.items[openItem] : null;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      {header}
      <Text style={s.pageSub}>Acompanhe o que está programado, recomendado e já realizado.</Text>
      <Card>
        <SectionTitle>Previsão de manutenção</SectionTitle>
        <Text style={s.predictionText}>
          Você percorre em média <Text style={s.bold}>{prediction.avgKmPerDay} km/dia</Text>. Nesse ritmo, os{' '}
          {maintenance.next.dueKm.toLocaleString('pt-BR')} km serão atingidos em aproximadamente <Text style={s.bold}>{prediction.days} dias</Text>.
        </Text>
        <Text style={[s.predictionText, { marginTop: 6 }]}>Previsão: <Text style={s.bold}>{prediction.dateLabel}</Text></Text>
      </Card>

      <View style={[s.tabRow, { backgroundColor: theme.colors.surfaceSunken }]}>
        {[['proximas', 'Próximas'], ['recalls', 'Recalls'], ['concluidas', 'Concluídas']].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[
              s.tabBtn,
              tab === key && { backgroundColor: theme.colors.surface, ...boxShadow('#0F1932', 0.06, 3, 1) },
            ]}
          >
            <Text style={[s.tabText, { color: tab === key ? theme.colors.textPrimary : theme.colors.textSecondary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'proximas' && (
        <Card>
          {maintenance.items.map((m, i) => (
            <Pressable
              key={m.id || m.title}
              onPress={() => setOpenItem(i)}
              style={[i < maintenance.items.length - 1 && s.divider]}
            >
              <View style={s.itemRow}>
                <View style={[s.itemIcon, { backgroundColor: m.tagType === 'warning' ? theme.colors.warningBg : theme.colors.accentSoft }]}>
                  <Icon name="wrench" size={16} color={m.tagType === 'warning' ? theme.colors.warning : theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>{m.title}</Text>
                  <Text style={s.itemSub}>{m.meta}</Text>
                  <Text style={s.itemSub}>{m.price} · {m.duration}{m.warrantyCovered ? ' · Coberto pela garantia' : ''}</Text>
                </View>
                <Badge label={m.tag} tone={TAG_TONE[m.tagType] || 'neutral'} />
                <Icon name="chevron" size={18} color={theme.colors.textTertiary} style={{ marginLeft: 6 }} />
              </View>
            </Pressable>
          ))}
        </Card>
      )}

      {tab === 'recalls' && (
        <Card>
          {maintenance.recalls.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyTitle}>Nenhum recall pendente</Text>
              <Text style={s.emptyDesc}>Seu Ford está em dia. Avisaremos assim que houver algum recall relevante para o seu veículo.</Text>
            </View>
          ) : (
            maintenance.recalls.map((r, i) => (
              <View key={r.title} style={[i < maintenance.recalls.length - 1 && s.divider, s.itemRow]}>
                <View style={[s.itemIcon, { backgroundColor: theme.colors.warningBg }]}>
                  <Icon name="alert" size={16} color={theme.colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>{r.title}</Text>
                  <Text style={s.itemSub}>{r.desc}</Text>
                </View>
              </View>
            ))
          )}
        </Card>
      )}

      {tab === 'concluidas' && (
        <Card>
          <View style={s.timeline}>
            <View style={[s.timelineLine, { backgroundColor: theme.colors.border }]} />
            {maintenance.completed.map((c, i) => (
              <View key={c.title + c.date} style={[s.timelineItem, i === maintenance.completed.length - 1 && { paddingBottom: 0 }]}>
                <View style={[s.timelineDot, { backgroundColor: theme.colors.accent, borderColor: theme.colors.surface }]} />
                <Text style={s.itemDate}>{c.date}</Text>
                <Text style={s.itemTitle}>{c.title}</Text>
                <Text style={s.timelineCost}>{c.cost}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* openMaintenanceModal() no site */}
      <BottomSheet visible={!!item} onClose={() => setOpenItem(null)}>
        {item && (
          <View>
            <View style={[s.detailIcon, { backgroundColor: item.tagType === 'warning' ? theme.colors.warningBg : theme.colors.accentSoft }]}>
              <Icon name="wrench" size={20} color={item.tagType === 'warning' ? theme.colors.warning : theme.colors.accent} />
            </View>
            <Text style={s.detailTitle}>{item.title}</Text>
            <Text style={[s.itemSub, { marginBottom: 12 }]}>{item.meta}</Text>
            <Badge label={item.tag} tone={TAG_TONE[item.tagType] || 'neutral'} style={{ marginBottom: 16, alignSelf: 'flex-start' }} />
            <View style={[s.detailRow, { borderBottomColor: theme.colors.borderSoft }]}>
              <Text style={s.detailLabel}>Preço estimado</Text>
              <Text style={s.detailValue}>{item.price}</Text>
            </View>
            <View style={[s.detailRow, { borderBottomColor: theme.colors.borderSoft }]}>
              <Text style={s.detailLabel}>Tempo estimado</Text>
              <Text style={s.detailValue}>{item.duration}</Text>
            </View>
            <View style={[s.detailRow, { borderBottomColor: theme.colors.borderSoft }]}>
              <Text style={s.detailLabel}>Cobertura de garantia</Text>
              <Text style={[s.detailValue, item.warrantyCovered && { color: theme.colors.success }]}>{item.warrantyCovered ? 'Coberto' : 'Não coberto'}</Text>
            </View>
            <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={s.detailLabel}>Concessionária sugerida</Text>
              <Text style={s.detailValue}>{item.dealer}</Text>
            </View>
            <Pressable
              style={[s.scheduleBtn, { backgroundColor: theme.colors.navy950 }]}
              onPress={() => { setOpenItem(null); setSuggestedService(item.serviceOption || 'Outro'); router.push('/scheduling'); }}
            >
              <Text style={s.scheduleBtnText}>Agendar este serviço</Text>
            </Pressable>
          </View>
        )}
      </BottomSheet>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 32 },
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  predictionText: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19 },
  bold: { fontWeight: '800', color: theme.colors.textPrimary },
  tabRow: { flexDirection: 'row', gap: 6, marginVertical: 16, padding: 4, borderRadius: 999, alignSelf: 'flex-start' },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  divider: { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft, marginBottom: 14, paddingBottom: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start' },
  itemIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemDate: { fontSize: 11.5, color: theme.colors.textTertiary, fontWeight: '600', marginBottom: 4 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  itemSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 3 },
  timeline: { paddingLeft: 22, position: 'relative' },
  timelineLine: { position: 'absolute', left: 5, top: 6, bottom: 6, width: 1.5 },
  timelineItem: { position: 'relative', paddingBottom: 22 },
  timelineDot: { position: 'absolute', left: -22, top: 3, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
  timelineCost: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 3 },
  emptyBox: { alignItems: 'center', paddingVertical: 20 },
  emptyTitle: { fontSize: 14.5, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 12.5, color: theme.colors.textSecondary, textAlign: 'center' },
  detailIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  detailTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1 },
  detailLabel: { fontSize: 13.5, color: theme.colors.textSecondary },
  detailValue: { fontSize: 13.5, fontWeight: '700', color: theme.colors.textPrimary },
  scheduleBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 18 },
  scheduleBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
