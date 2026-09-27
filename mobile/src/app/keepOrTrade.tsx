import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import GaugeRing from '../components/GaugeRing';
import BottomSheet from '../components/BottomSheet';
import {
  vehicle, vehicleHealth, historyTimeline,
  getCostBreakdown, getTcoAndForecast, getResaleProjection, getTradeInEstimate,
  getTradeIndex, newFordLineup, setCustomCosts, resetCustomCosts,
} from '../constants/data';

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 12 }}>{children}</Text>;
}

function computeFinancingInstallment(entrada: number, prazo: number) {
  const diff = newFordLineup[0].price - vehicle.estimatedValue;
  const financed = Math.max(0, diff - entrada);
  const taxaMensal = 0.0199; // 1,99% a.m. — taxa estimada ilustrativa
  const parcela = prazo > 0 ? (financed * (1 + taxaMensal * prazo)) / prazo : 0;
  return { diff, financed, parcela: Math.round(parcela) };
}

export default function KeepOrTradeScreen() {
  const { theme } = useTheme();
  const { vehicleVersion, setSuggestedService } = useAppState();
  const showToast = useToast();
  void vehicleVersion;
  const s = styles(theme);

  const [tradeInOpen, setTradeInOpen] = useState(false);
  const [financingOpen, setFinancingOpen] = useState(false);
  const [entrada, setEntrada] = useState(10000);
  const [prazo, setPrazo] = useState(24);
  const [explainOpen, setExplainOpen] = useState(false);
  const [editCostsOpen, setEditCostsOpen] = useState(false);
  // Bumped after saving/resetting customCosts to force this screen to
  // re-read getCostBreakdown()/getTcoAndForecast() with the new values —
  // they read a plain module-level `let`, not React state.
  const [costsTick, setCostsTick] = useState(0);
  void costsTick;

  const breakdown = getCostBreakdown();
  const tco = getTcoAndForecast();
  const tradeIndex = getTradeIndex();
  const maxCategory = Math.max(...breakdown.items.map((i) => i.value));
  const newFordPrice = newFordLineup[0].price;
  const diff = newFordPrice - vehicle.estimatedValue;
  const keepCost24m = tco.annualEstimate * 2;
  const tradeInEst = getTradeInEstimate();
  const fin = computeFinancingInstallment(entrada, prazo);

  const factors = [
    ['Ano', vehicle.year],
    ['Quilometragem', `${vehicle.km.toLocaleString('pt-BR')} km`],
    ['Versão', vehicle.trim],
    ['Saúde', `${vehicleHealth.overall}/100`],
    ['Histórico', `${historyTimeline.length} eventos registrados`],
    ['Estado geral', vehicle.status],
    ['Mercado', 'Estável'],
  ];

  // Editar valores — mesmos 5 campos do site (monthlyOf), com o valor
  // mensal atual (customizado ou estimado) como ponto de partida a cada
  // vez que o sheet abre.
  const monthlyOf = (label: string) => {
    const item = breakdown.items.find((i) => i.label === label);
    return item ? Math.round(item.value / breakdown.months) : 0;
  };
  const costFields: [string, string][] = [
    ['fuel', 'Combustível'],
    ['insurance', 'Seguro'],
    ['tax', 'Impostos'],
    ['parking', 'Estacionamento'],
    ['other', 'Outros'],
  ];
  const [costInputs, setCostInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(costFields.map(([key, label]) => [key, String(monthlyOf(label))]))
  );

  const openEditCosts = () => {
    setCostInputs(Object.fromEntries(costFields.map(([key, label]) => [key, String(monthlyOf(label))])));
    setEditCostsOpen(true);
  };

  const handleSaveCosts = () => {
    const next: Record<string, number> = {};
    costFields.forEach(([key]) => {
      const n = Number(costInputs[key]);
      next[key] = isNaN(n) || n < 0 ? 0 : n;
    });
    setCustomCosts(next);
    setCostsTick((t) => t + 1);
    setEditCostsOpen(false);
    showToast('Valores atualizados');
  };

  const handleResetCosts = () => {
    resetCustomCosts();
    setCostsTick((t) => t + 1);
    setEditCostsOpen(false);
    showToast('Voltando a usar estimativas');
  };

  const intelText = `Considerando saúde geral, custos recentes e desvalorização projetada, manter o veículo pelos próximos ${tradeIndex.keepMonths} meses é a opção financeiramente mais vantajosa.`;
  const intelDataPoints = [
    `Índice de troca: ${tradeIndex.score}/100`,
    'Custo total de propriedade (TCO)',
    `Valor de mercado: R$ ${vehicle.estimatedValue.toLocaleString('pt-BR')}`,
    'Garantia restante',
    'Histórico de manutenção',
  ];

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Uma análise do seu perfil de uso, custos e valor de mercado.</Text>
      <Card style={s.recommendCard}>
        <Badge label="Recomendação atual" tone="success" style={{ marginBottom: 14 }} />
        <Text style={s.recommendTitle}>Manter o veículo</Text>
        <Text style={s.recommendText}>Seu {vehicle.name} apresenta excelente saúde geral e custo de manutenção controlado. Ainda não é o momento ideal para uma troca.</Text>
      </Card>

      <Card>
        <SectionTitle>Seu Ford hoje</SectionTitle>
        <View style={s.rowList}>
          <View style={s.rowItem}><Text style={s.rowSub}>Valor estimado</Text><Text style={s.rowMeta}>R$ {vehicle.estimatedValue.toLocaleString('pt-BR')}</Text></View>
          <View style={s.rowItem}><Text style={s.rowSub}>Quilometragem</Text><Text style={s.rowMeta}>{vehicle.km.toLocaleString('pt-BR')} km</Text></View>
          <View style={s.rowItem}><Text style={s.rowSub}>Saúde</Text><Text style={s.rowMeta}>{vehicleHealth.overall}/100</Text></View>
          <View style={s.rowItem}><Text style={s.rowSub}>Garantia</Text><Text style={s.rowMeta}>até {vehicle.warrantyUntil}</Text></View>
          <View style={[s.rowItem, { borderBottomWidth: 0 }]}><Text style={s.rowSub}>Gastos desde a compra</Text><Text style={s.rowMeta}>R$ {breakdown.total.toLocaleString('pt-BR')}</Text></View>
        </View>
      </Card>

      <Card>
        <SectionTitle>Custo do meu Ford</SectionTitle>
        <Text style={[s.rowSub, { marginBottom: 12 }]}>Manutenção vem do seu histórico real. Os demais valores são estimados — toque em "Editar valores" para usar os seus.</Text>
        <View style={s.statsRow}>
          <View style={[s.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={s.statLabel}>Este mês</Text>
            <Text style={s.statValue}>R$ {breakdown.thisMonth.toLocaleString('pt-BR')}</Text>
          </View>
          <View style={[s.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={s.statLabel}>Este ano</Text>
            <Text style={s.statValue}>R$ {breakdown.thisYear.toLocaleString('pt-BR')}</Text>
          </View>
          <View style={[s.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={s.statLabel}>Desde a compra</Text>
            <Text style={s.statValue}>R$ {breakdown.total.toLocaleString('pt-BR')}</Text>
          </View>
        </View>
        {breakdown.items.map((item) => (
          <View key={item.label} style={{ marginTop: 14 }}>
            <View style={s.costRow}>
              <Text style={s.costLabel}>{item.label}{item.estimated ? ' (estimado)' : ''}</Text>
              <Text style={s.costValue}>R$ {item.value.toLocaleString('pt-BR')}</Text>
            </View>
            <ProgressBar value={(item.value / maxCategory) * 100} />
          </View>
        ))}
        <Pressable style={[s.ghostBtn, { marginLeft: 0, marginTop: 14 }]} onPress={openEditCosts}>
          <Text style={[s.ghostBtnText, { color: theme.colors.textPrimary }]}>Editar valores</Text>
          <Icon name="chevron" size={14} color={theme.colors.textPrimary} />
        </Pressable>
      </Card>

      <Card>
        <SectionTitle>Custo total de propriedade (TCO)</SectionTitle>
        <View style={s.statsRow}>
          <View style={[s.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={s.statLabel}>Mensal estimado</Text>
            <Text style={s.statValue}>R$ {tco.monthlyEstimate.toLocaleString('pt-BR')}</Text>
          </View>
          <View style={[s.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={s.statLabel}>Anual estimado</Text>
            <Text style={s.statValue}>R$ {tco.annualEstimate.toLocaleString('pt-BR')}</Text>
          </View>
          <View style={[s.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
            <Text style={s.statLabel}>Custo por km</Text>
            <Text style={s.statValue}>R$ {tco.perKm.toFixed(2)}</Text>
          </View>
        </View>
        <Text style={[s.subTitle]}>Previsão para os próximos 12 meses</Text>
        <View style={s.rowList}>
          <View style={s.rowItem}><Text style={s.rowSub}>Manutenções previstas</Text><Text style={s.rowMeta}>R$ {tco.forecast.upcomingMaintenanceCost.toLocaleString('pt-BR')}</Text></View>
          <View style={s.rowItem}><Text style={s.rowSub}>Seguro</Text><Text style={s.rowMeta}>R$ {tco.forecast.insuranceAnnual.toLocaleString('pt-BR')}</Text></View>
          <View style={s.rowItem}><Text style={s.rowSub}>Combustível</Text><Text style={s.rowMeta}>R$ {tco.forecast.fuelAnnual.toLocaleString('pt-BR')}</Text></View>
          <View style={s.rowItem}><Text style={s.rowSub}>Depreciação</Text><Text style={s.rowMeta}>R$ {tco.forecast.depreciationAnnual.toLocaleString('pt-BR')}</Text></View>
          <View style={[s.rowItem, { borderBottomWidth: 0 }]}><Text style={[s.rowSub, { fontWeight: '800', color: theme.colors.textPrimary }]}>Custos totais</Text><Text style={[s.rowMeta, { fontWeight: '800' }]}>R$ {tco.forecast.forecastTotal.toLocaleString('pt-BR')}</Text></View>
        </View>
      </Card>

      <Card>
        <SectionTitle>Índice de troca</SectionTitle>
        <View style={s.gaugeRow}>
          <GaugeRing value={tradeIndex.score} size={88} strokeWidth={8} />
          <View style={{ flex: 1, minWidth: 180 }}>
            <Text style={s.gaugeLabel}>{tradeIndex.label}</Text>
            <Text style={s.rowSub}>Financeiramente, manter o veículo ainda é vantajoso pelos próximos {tradeIndex.keepMonths} meses. Isso considera saúde, quilometragem, garantia e histórico — é uma recomendação estimada, não uma certeza absoluta.</Text>
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle>Previsão de revenda</SectionTitle>
        <Text style={[s.rowSub, { marginBottom: 14 }]}>Estimativa de valor de mercado ao longo do tempo, considerando depreciação média de 8% ao ano.</Text>
        <View style={s.statsRow}>
          {getResaleProjection().map((p) => (
            <View key={p.months} style={[s.statTile, { backgroundColor: theme.colors.surfaceSunken }]}>
              <Text style={s.statLabel}>Em {p.months} meses</Text>
              <Text style={s.statValue}>R$ {p.value.toLocaleString('pt-BR')}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={s.compareRow}>
        <Card style={{ flex: 1 }}>
          <SectionTitle>Manter</SectionTitle>
          <Text style={[s.rowSub, { marginBottom: 10 }]}>Custo estimado em 24 meses</Text>
          <Text style={s.bigValue}>R$ {keepCost24m.toLocaleString('pt-BR')}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <SectionTitle>Trocar</SectionTitle>
          <Text style={[s.rowSub, { marginBottom: 10 }]}>{newFordLineup[0].name.split(' ').slice(0, 2).join(' ')} — diferença estimada</Text>
          <Text style={s.bigValue}>R$ {diff.toLocaleString('pt-BR')}</Text>
        </Card>
      </View>

      <Card style={s.actionsCard}>
        <Pressable style={[s.secondaryBtn, { borderColor: theme.colors.border }]} onPress={() => setTradeInOpen(true)}>
          <Text style={[s.secondaryBtnText, { color: theme.colors.textPrimary }]}>Avaliar meu veículo</Text>
        </Pressable>
        <Pressable style={[s.secondaryBtn, { borderColor: theme.colors.border }]} onPress={() => setFinancingOpen(true)}>
          <Text style={[s.secondaryBtnText, { color: theme.colors.textPrimary }]}>Simular financiamento</Text>
        </Pressable>
        <Pressable style={s.ghostBtn} onPress={() => router.push('/newFord')}>
          <Text style={[s.ghostBtnText, { color: theme.colors.textPrimary }]}>Ver novos Ford</Text>
          <Icon name="chevron" size={14} color={theme.colors.textPrimary} />
        </Pressable>
      </Card>

      {/* Ford One Intelligence — mesmo padrão visual do card da Home */}
      <View style={[s.intelCard, { backgroundColor: theme.colors.navy950 }]}>
        <View style={s.intelHead}>
          <View style={s.intelMark}>
            <Icon name="spark" size={13} color="#A8B2FF" />
          </View>
          <Text style={s.intelLabel}>Ford One Intelligence</Text>
          <View style={s.intelBadge}>
            <Text style={s.intelBadgeText}>Confiança Alta</Text>
          </View>
        </View>
        <Text style={s.intelText}>{intelText}</Text>
        <View style={s.intelMetaRow}>
          <View>
            <Text style={s.intelMetaLabel}>Confiança</Text>
            <Text style={s.intelMetaValue}>Alta</Text>
          </View>
          <View>
            <Text style={s.intelMetaLabel}>Fatores considerados</Text>
            <Text style={s.intelMetaValue}>7</Text>
          </View>
        </View>
        <View style={s.intelActionsRow}>
          <Pressable style={s.intelBtnOutline} onPress={() => setExplainOpen((v) => !v)}>
            <Text style={s.intelBtnOutlineText}>{explainOpen ? 'Ocultar análise' : 'Ver análise'}</Text>
          </Pressable>
        </View>
        {explainOpen && (
          <View style={s.intelExpand}>
            <Text style={s.intelExpandTitle}>Dados considerados</Text>
            {intelDataPoints.map((dp) => (
              <Text key={dp} style={s.intelExpandItem}>· {dp}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Avaliar meu veículo */}
      <BottomSheet visible={tradeInOpen} onClose={() => setTradeInOpen(false)}>
        <Text style={s.sheetTitle}>Avaliação estimada do veículo</Text>
        <Text style={[s.rowSub, { marginBottom: 14 }]}>Faixa: R$ {tradeInEst.low.toLocaleString('pt-BR')} – R$ {tradeInEst.high.toLocaleString('pt-BR')}</Text>
        <Text style={s.bigValue}>R$ {tradeInEst.central.toLocaleString('pt-BR')}</Text>
        <Text style={[s.subTitle, { marginTop: 16 }]}>Fatores considerados</Text>
        <View style={s.rowList}>
          {factors.map(([label, value], i) => (
            <View key={label} style={[s.rowItem, i === factors.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.rowSub}>{label}</Text>
              <Text style={s.rowMeta}>{value}</Text>
            </View>
          ))}
        </View>
        <Pressable
          style={[s.primaryBtn, { backgroundColor: theme.colors.navy950 }]}
          onPress={() => {
            setSuggestedService('Avaliação de veículo');
            setTradeInOpen(false);
            router.push('/scheduling');
          }}
        >
          <Text style={s.primaryBtnText}>Agendar avaliação presencial</Text>
        </Pressable>
      </BottomSheet>

      {/* Simular financiamento */}
      <BottomSheet visible={financingOpen} onClose={() => setFinancingOpen(false)}>
        <Text style={s.sheetTitle}>Simulação de financiamento</Text>
        <Text style={[s.rowSub, { marginBottom: 16 }]}>Diferença estimada para o {newFordLineup[0].name.split(' ').slice(0, 2).join(' ')}: <Text style={{ fontWeight: '800', color: theme.colors.textPrimary }}>R$ {fin.diff.toLocaleString('pt-BR')}</Text></Text>

        <Text style={s.label}>Entrada (R$)</Text>
        <TextInput
          value={String(entrada)}
          onChangeText={(t) => setEntrada(Number(t.replace(/[^\d]/g, '')) || 0)}
          keyboardType="numeric"
          style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
        />

        <Text style={[s.label, { marginTop: 14 }]}>Prazo</Text>
        <View style={s.chipRow}>
          {[12, 24, 36, 48].map((m) => (
            <Pressable
              key={m}
              onPress={() => setPrazo(m)}
              style={[s.chip, { borderColor: prazo === m ? theme.colors.accent : theme.colors.border, backgroundColor: prazo === m ? theme.colors.accentSoft : 'transparent' }]}
            >
              <Text style={[s.chipText, { color: prazo === m ? theme.colors.accent : theme.colors.textSecondary }]}>{m}x</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.rowList}>
          <View style={s.rowItem}><Text style={s.rowSub}>Taxa estimada</Text><Text style={s.rowMeta}>1,99% a.m.</Text></View>
          <View style={[s.rowItem, { borderBottomWidth: 0 }]}><Text style={s.rowSub}>Valor financiado</Text><Text style={s.rowMeta}>R$ {fin.financed.toLocaleString('pt-BR')}</Text></View>
        </View>
        <Text style={[s.bigValue, { marginTop: 14 }]}>{prazo}x de R$ {fin.parcela.toLocaleString('pt-BR')}</Text>
        <Text style={[s.rowSub, { marginTop: 12 }]}>Simulação ilustrativa — não substitui uma proposta real de financiamento.</Text>
      </BottomSheet>

      {/* Editar valores — openEditCostsModal() no site */}
      <BottomSheet visible={editCostsOpen} onClose={() => setEditCostsOpen(false)}>
        <Text style={s.sheetTitle}>Editar valores</Text>
        <Text style={[s.rowSub, { marginBottom: 16 }]}>Informe sua média mensal (R$) em cada categoria. Manutenção continua vindo do seu histórico real.</Text>
        {costFields.map(([key, label]) => (
          <View key={key} style={{ marginBottom: 14 }}>
            <Text style={s.label}>{label} (R$/mês)</Text>
            <TextInput
              value={costInputs[key]}
              onChangeText={(t) => setCostInputs((prev) => ({ ...prev, [key]: t.replace(/[^\d]/g, '') }))}
              keyboardType="numeric"
              style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
            />
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <Pressable style={[s.secondaryBtn, { borderColor: theme.colors.border, flex: 1 }]} onPress={handleResetCosts}>
            <Text style={[s.secondaryBtnText, { color: theme.colors.textPrimary }]}>Usar estimativa</Text>
          </Pressable>
          <Pressable style={[s.primaryBtn, { flex: 1, marginTop: 0, backgroundColor: theme.colors.navy950 }]} onPress={handleSaveCosts}>
            <Text style={s.primaryBtnText}>Salvar</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  recommendCard: { alignItems: 'center', paddingVertical: 28 },
  recommendTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 8 },
  recommendText: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 19, maxWidth: 320 },
  rowList: {},
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft },
  rowSub: { fontSize: 12.5, color: theme.colors.textSecondary, flexShrink: 1, paddingRight: 8 },
  rowMeta: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  statTile: { flex: 1, borderRadius: 10, padding: 10 },
  statLabel: { fontSize: 10, color: theme.colors.textTertiary, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  costLabel: { fontSize: 12.5, fontWeight: '600', color: theme.colors.textPrimary },
  costValue: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary },
  subTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8 },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: 18, flexWrap: 'wrap' },
  gaugeLabel: { fontSize: 14.5, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 6 },
  compareRow: { flexDirection: 'row', gap: 12 },
  bigValue: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  actionsCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  secondaryBtn: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 14 },
  secondaryBtnText: { fontSize: 12.5, fontWeight: '700' },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  ghostBtnText: { fontSize: 13, fontWeight: '700' },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  label: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, fontWeight: '600' },
  chip: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  primaryBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  // Ford One Intelligence card — same visual pattern as the Home screen's.
  intelCard: { borderRadius: 22, padding: 18, marginBottom: 12 },
  intelHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  intelMark: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(107,120,255,.4)', backgroundColor: 'rgba(107,120,255,.14)',
  },
  intelLabel: { fontSize: 12, fontWeight: '700', color: '#C4CAF2' },
  intelBadge: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  intelBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#ECEEFC' },
  intelText: { fontSize: 13.5, lineHeight: 20, color: '#ECEEFC' },
  intelMetaRow: {
    flexDirection: 'row', gap: 22, marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.12)',
  },
  intelMetaLabel: { fontSize: 11, color: '#9BA3E5' },
  intelMetaValue: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 2 },
  intelActionsRow: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  intelBtnOutline: { borderWidth: 1, borderColor: 'rgba(255,255,255,.28)', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  intelBtnOutlineText: { fontSize: 12.5, fontWeight: '700', color: '#ECEEFC' },
  intelExpand: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.12)' },
  intelExpandTitle: { fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 6 },
  intelExpandItem: { fontSize: 12.5, color: '#C4CAF2', lineHeight: 19 },
});
