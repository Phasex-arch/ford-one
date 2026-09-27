import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAppState } from '../../context/AppStateContext';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import GaugeRing from '../../components/GaugeRing';
import ProgressBar from '../../components/ProgressBar';
import LineChart from '../../components/LineChart';
import TopBar from '../../components/TopBar';
import VehicleHealthDiagram from '../../components/VehicleHealthDiagram';
import SystemDetailSheet from '../../components/SystemDetailSheet';
import FuelDetailSheet from '../../components/FuelDetailSheet';
import PageHead from '../../components/PageHead';
import Icon from '../../components/Icon';
import { router } from 'expo-router';
import {
  vehicle, vehicleHealth, getHealthHistory, getFordOnePredictions, getDigitalTwinItems,
} from '../../constants/data';
import { SYSTEM_ICONS } from '../../constants/healthHotspots';
import type { DigitalTwinItem } from '../../constants/data/healthScreen';
import type { VehicleSystem } from '../../types';

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 12 }}>{children}</Text>;
}

export default function HealthScreen() {
  const { theme } = useTheme();
  const { vehicleVersion, dismissedAlertIds } = useAppState();
  void vehicleVersion; // subscribe so this screen re-renders on vehicle switch
  const s = styles(theme);
  const [openPrediction, setOpenPrediction] = useState<number | null>(null);
  const [openSystem, setOpenSystem] = useState<string | null>(null);
  const [detailSystem, setDetailSystem] = useState<VehicleSystem | null>(null);
  const [fuelSheetOpen, setFuelSheetOpen] = useState(false);
  const digitalTwinItems = getDigitalTwinItems(dismissedAlertIds);

  const handleTwinPress = (item: DigitalTwinItem) => {
    if (!item.action) return;
    if (item.action.kind === 'system') {
      const targetId = item.action.id;
      const sys = vehicleHealth.systems.find((s) => s.id === targetId);
      if (sys) setDetailSystem(sys);
    } else if (item.action.kind === 'fuel') {
      setFuelSheetOpen(true);
    } else if (item.action.kind === 'page') {
      router.push(item.action.page as Parameters<typeof router.push>[0]);
    }
  };

  const warnCount = vehicleHealth.systems.filter((sys) => sys.status === 'warn').length;
  const summary = warnCount > 0
    ? `Baseada na análise de ${vehicleHealth.systems.length} sistemas monitorados. ${warnCount} sistema${warnCount > 1 ? 's' : ''} pede${warnCount > 1 ? 'm' : ''} atenção.`
    : `Baseada na análise de ${vehicleHealth.systems.length} sistemas monitorados. Nenhum requer atenção no momento.`;
  const predictions = getFordOnePredictions();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar />
      <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <PageHead eyebrow="Diagnóstico contínuo" title="Saúde do veículo" sub="Visão geral da condição atual de cada sistema do seu Ford." />
      {/* Overview */}
      <Card style={s.overviewCard}>
        <GaugeRing value={vehicleHealth.overall} size={72} strokeWidth={7} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={s.overviewTitle}>Saúde geral: {vehicle.status}</Text>
          <Text style={s.overviewSub}>{summary}</Text>
          <Text style={s.overviewMeta}>Atualizado com base em {vehicle.km.toLocaleString('pt-BR')} km rodados · Última atualização: Agora</Text>
        </View>
      </Card>

      {/* Evolução */}
      <Card>
        <SectionTitle>Evolução da saúde</SectionTitle>
        <LineChart points={getHealthHistory()} />
      </Card>

      {/* Previsões */}
      <Card>
        <SectionTitle>Previsões Ford One</SectionTitle>
        {predictions.map((p, i) => (
          <View key={i} style={[i < predictions.length - 1 && s.predictionDivider]}>
            <Text style={s.predictionText}>{p.text}</Text>
            <View style={s.predictionFooter}>
              <Badge label={`Confiança: ${p.confidence}`} tone={p.confidence === 'Alta' ? 'success' : 'warning'} />
              <Pressable onPress={() => setOpenPrediction(openPrediction === i ? null : i)}>
                <Text style={s.linkText}>{openPrediction === i ? 'Ocultar detalhes' : 'Por que estou vendo isso?'}</Text>
              </Pressable>
            </View>
            {openPrediction === i && (
              <View style={[s.expandBox, { backgroundColor: theme.colors.surfaceSunken }]}>
                <Text style={s.expandTitle}>Dados considerados</Text>
                {p.dataPoints.map((dp) => (
                  <Text key={dp} style={s.expandItem}>· {dp}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </Card>

      {/* Digital Twin */}
      <Card>
        <View style={s.twinHeaderRow}>
          <Text style={[s.sectionTitleNoMargin]}>Digital Twin</Text>
          <View style={s.twinStatusRow}>
            <View style={[s.twinStatusDot, { backgroundColor: theme.colors.success }]} />
            <Text style={s.twinStatusText}>Veículo online · Última sincronização: Agora</Text>
          </View>
        </View>
        <Text style={s.twinDesc}>Seu Digital Twin reúne os dados disponíveis do veículo para acompanhar sua condição ao longo do tempo.</Text>
        <View style={s.twinGrid}>
          {digitalTwinItems.map((item) => (
            <Pressable
              key={item.label}
              disabled={!item.action}
              onPress={() => handleTwinPress(item)}
              style={[s.twinTag, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.borderSoft }]}
            >
              <Text style={s.twinLabel}>{item.label}</Text>
              <Text style={s.twinValue}>{item.value}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Inspeção do veículo */}
      <Card>
        <SectionTitle>Inspeção do veículo</SectionTitle>
        <Text style={s.diagramSub}>Toque em um ponto do veículo para ver o detalhe de cada sistema.</Text>
        <VehicleHealthDiagram
          photoKey={vehicle.photo as 'maverick' | 'ranger' | 'mache'}
          systems={vehicleHealth.systems}
          onOpenSystem={(sys) => setDetailSystem(sys)}
        />
      </Card>

      {/* Todos os sistemas */}
      <Card>
        <SectionTitle>Todos os sistemas</SectionTitle>
        {vehicleHealth.systems.map((sys, i) => (
          <Pressable
            key={sys.id}
            onPress={() => setOpenSystem(openSystem === sys.id ? null : sys.id)}
            style={[s.healthRow, i < vehicleHealth.systems.length - 1 && s.sysDivider]}
          >
            <View style={[
              s.rowIcon,
              { backgroundColor: sys.status === 'warn' ? theme.colors.warningBg : theme.colors.accentSoft },
            ]}>
              <Icon
                name={SYSTEM_ICONS[sys.id] || 'gauge'}
                size={19}
                color={sys.status === 'warn' ? theme.colors.warning : theme.colors.accent}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={s.sysHeaderRow}>
                <Text style={s.sysLabel}>{sys.label}</Text>
                <Text style={s.sysScore}>{sys.score}%</Text>
              </View>
              <ProgressBar value={sys.score} tone={sys.status === 'warn' ? 'warn' : 'ok'} />
              <View style={s.sysFooterRow}>
                <Badge label={sys.condition} tone={sys.status === 'warn' ? 'warning' : 'success'} />
                <Text style={[s.sysNote, sys.status === 'warn' && { color: theme.colors.warning, fontWeight: '600' }]}>{sys.note}</Text>
              </View>
            </View>
            {openSystem === sys.id && (
              <View style={[s.expandBox, { backgroundColor: theme.colors.surfaceSunken }]}>
                <Text style={s.expandTitle}>Tendência</Text>
                <Text style={s.expandItem}>{sys.trend}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </Card>

      {/* Ford One Intelligence — resumo da saúde */}
      <View style={[s.intelCard, { backgroundColor: theme.colors.navy950 }]}>
        <View style={s.intelHead}>
          <View style={s.intelMark}>
            <Icon name="spark" size={13} color="#A8B2FF" />
          </View>
          <Text style={s.intelLabel}>Ford One Intelligence</Text>
        </View>
        <Text style={s.intelText}>
          {warnCount > 0
            ? `${vehicleHealth.systems.filter((sys) => sys.status === 'warn').map((sys) => sys.label).join(' e ')} ${warnCount > 1 ? 'apresentam' : 'apresenta'} o menor índice no momento. Nenhum requer ação imediata, mas recomendamos verificação na próxima manutenção.`
            : 'Todos os sistemas monitorados estão dentro do esperado para o padrão de uso do seu veículo.'}
        </Text>
        <View style={s.intelMetaRow}>
          <View>
            <Text style={s.intelMetaLabel}>Confiança</Text>
            <Text style={s.intelMetaValue}>Média-alta</Text>
          </View>
          <View>
            <Text style={s.intelMetaLabel}>Fatores considerados</Text>
            <Text style={s.intelMetaValue}>{vehicleHealth.systems.length}</Text>
          </View>
        </View>
      </View>

      <Card style={s.footLinksCard}>
        <Pressable style={s.footLinkRow} onPress={() => router.push('/maintenance')}>
          <Text style={s.footLinkText}>Ver manutenções recomendadas</Text>
          <Icon name="chevron" size={14} color={theme.colors.accent} />
        </Pressable>
        <Pressable style={s.footLinkRow} onPress={() => router.push('/diagnosis')}>
          <Text style={s.footLinkText}>Diagnosticar um problema</Text>
          <Icon name="chevron" size={14} color={theme.colors.accent} />
        </Pressable>
      </Card>
      </ScrollView>
      <SystemDetailSheet system={detailSystem} onClose={() => setDetailSystem(null)} />
      <FuelDetailSheet visible={fuelSheetOpen} onClose={() => setFuelSheetOpen(false)} />
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  overviewCard: { flexDirection: 'row', alignItems: 'center' },
  twinHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  sectionTitleNoMargin: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  twinStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  twinStatusDot: { width: 7, height: 7, borderRadius: 4 },
  twinStatusText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  twinDesc: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 10, marginBottom: 14, lineHeight: 18 },
  intelCard: { borderRadius: 22, padding: 18, marginBottom: 12 },
  intelHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  intelMark: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(107,120,255,.16)', borderWidth: 1, borderColor: 'rgba(107,120,255,.4)',
  },
  intelLabel: { fontSize: 12, fontWeight: '700', color: '#C4CAF2' },
  intelText: { fontSize: 13.5, lineHeight: 20, color: '#ECEEFC' },
  intelMetaRow: {
    flexDirection: 'row', gap: 14, marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.12)',
  },
  intelMetaLabel: { fontSize: 11, color: '#9BA3E5' },
  intelMetaValue: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 2 },
  footLinksCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 22 },
  footLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footLinkText: { fontSize: 12.5, fontWeight: '700', color: theme.colors.accent },
  overviewTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 4 },
  overviewSub: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18 },
  overviewMeta: { fontSize: 11.5, color: theme.colors.textTertiary, marginTop: 8 },
  diagramSub: { fontSize: 12.5, color: theme.colors.textSecondary, marginBottom: 14 },
  predictionDivider: { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft, marginBottom: 14, paddingBottom: 14 },
  predictionText: { fontSize: 13.5, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8, lineHeight: 19 },
  predictionFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  linkText: { fontSize: 12.5, fontWeight: '700', color: theme.colors.accent },
  expandBox: { borderRadius: 10, padding: 12, marginTop: 10 },
  expandTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  expandItem: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18 },
  twinGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  twinTag: { width: '47%', borderWidth: 1, borderRadius: 10, padding: 8, alignItems: 'center' },
  twinLabel: { fontSize: 10, fontWeight: '600', color: theme.colors.textTertiary, textAlign: 'center' },
  twinValue: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 3 },
  healthRow: { flexDirection: 'row', gap: 14, paddingVertical: 16, alignItems: 'flex-start' },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sysDivider: { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft },
  sysHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7, gap: 10 },
  sysLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  sysScore: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  sysFooterRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  sysNote: { fontSize: 12.5, color: theme.colors.textSecondary },
});
