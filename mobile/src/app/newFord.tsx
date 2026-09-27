import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BottomSheet from '../components/BottomSheet';
import { vehicle, vehicleHealth, newFordLineup, financingTerms, downPaymentOptions, estimateInstallment } from '../constants/data';
import type { NewFordVehicle } from '../types';

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 12 }}>{children}</Text>;
}

const shortName = (v: NewFordVehicle) => v.name.split(' ').slice(0, 2).join(' ');
const compareRows: [string, (v: NewFordVehicle) => string][] = [
  ['Preço', (v) => `R$ ${v.price.toLocaleString('pt-BR')}`],
  ['Potência', (v) => v.power],
  ['Consumo', (v) => v.consumption],
  ['Porta-malas', (v) => v.trunk],
  ['Garantia', (v) => v.warranty],
  ['Compatibilidade com você', (v) => `${v.compatibility}%`],
];

export default function NewFordScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const { setSuggestedService, newVehicleOrder, setNewVehicleOrder } = useAppState();
  const s = styles(theme);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const [downPct, setDownPct] = useState(downPaymentOptions[1]);
  const [term, setTerm] = useState(financingTerms[1]);

  const detail = newFordLineup.find((v) => v.id === detailId) || null;
  const sim = detail ? estimateInstallment(detail.price, downPct, term) : null;
  const diff = detail ? detail.price - vehicle.estimatedValue : 0;
  const compareVehicles = newFordLineup.filter((v) => compareSet.has(v.id));

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const handleTestDrive = (v: NewFordVehicle) => {
    setSuggestedService('Test-drive');
    showToast(`Agendando test-drive: ${v.name}`);
    setDetailId(null);
    router.push('/scheduling');
  };

  const handleProposal = (v: NewFordVehicle) => {
    setNewVehicleOrder({ vehicleId: v.id, stage: 0 });
    showToast('Proposta solicitada — acompanhe o status em Meu Veículo');
    setDetailId(null);
    router.push('/(tabs)/vehicle');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Veículos recomendados com base no seu perfil e veículo atual.</Text>
      <Text style={[s.pageSub, { marginTop: -8 }]}>Marque de 2 a 3 veículos em "Comparar" para ver lado a lado.</Text>

      {newFordLineup.map((v) => {
        const isFav = favorites.has(v.id);
        const isCompared = compareSet.has(v.id);
        return (
          <Card key={v.id} style={s.vehicleCard}>
            <View style={s.cardTopRow}>
              <Pressable onPress={() => toggleCompare(v.id)} style={s.compareRow}>
                <View style={[s.checkbox, { borderColor: theme.colors.border }, isCompared && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}>
                  {isCompared && <Icon name="check" size={12} color="#fff" />}
                </View>
                <Text style={[s.compareLabel, { color: theme.colors.textSecondary }]}>Comparar</Text>
              </Pressable>
              <Pressable onPress={() => toggleFavorite(v.id)} hitSlop={8}>
                <Icon name="heart" size={19} color={isFav ? theme.colors.danger : theme.colors.textTertiary} style={isFav ? { opacity: 1 } : { opacity: 0.7 }} />
              </Pressable>
            </View>

            <Pressable onPress={() => setDetailId(v.id)}>
              <Badge label={`${v.fit} · ${v.compatibility}%`} tone="accent" style={{ marginBottom: 8, alignSelf: 'flex-start' }} />
              <Text style={s.vehicleName}>{v.name}</Text>
              <Text style={s.vehicleDesc}>{v.desc}</Text>
              <View style={s.footRow}>
                <Text style={s.vehiclePrice}>R$ {v.price.toLocaleString('pt-BR')}</Text>
                <View style={s.verBtn}>
                  <Text style={[s.verBtnText, { color: theme.colors.textPrimary }]}>Ver</Text>
                  <Icon name="chevron" size={14} color={theme.colors.textPrimary} />
                </View>
              </View>
            </Pressable>
          </Card>
        );
      })}

      {compareSet.size >= 2 && (
        <Card style={s.compareBar}>
          <Text style={s.compareBarText}>{compareSet.size} veículos selecionados para comparação</Text>
          <Pressable style={[s.compareBtn, { backgroundColor: theme.colors.navy950 }]} onPress={() => setCompareOpen(true)}>
            <Text style={s.compareBtnText}>Comparar veículos</Text>
          </Pressable>
        </Card>
      )}

      <Card style={s.tradeCard}>
        <View style={{ flex: 1 }}>
          <Text style={s.tradeTitle}>Seu Ford como entrada</Text>
          <Text style={s.pageSub}>Seu {vehicle.model} está avaliado em até R$ {vehicle.estimatedValue.toLocaleString('pt-BR')} para troca.</Text>
        </View>
        <Pressable style={[s.tradeBtn, { borderColor: theme.colors.border }]} onPress={() => router.push('/(tabs)/vehicle')}>
          <Text style={[s.tradeBtnText, { color: theme.colors.textPrimary }]}>Ver avaliação do meu Ford</Text>
        </Pressable>
      </Card>

      {/* Financing simulator kept here (not a 1:1 web section — the HTML's
          equivalent calculator lives as a modal off Manter ou Trocar, always
          computed for the first lineup vehicle). Interactive, tied to the
          vehicle currently open in the detail sheet, and only shown while a
          vehicle is selected below. */}
      {detail && (
        <Card>
          <SectionTitle>Simular financiamento — {shortName(detail)}</SectionTitle>
          <Text style={s.label}>Entrada (usando seu Ford como parte do pagamento)</Text>
          <View style={s.chipRow}>
            {downPaymentOptions.map((pct) => (
              <Pressable
                key={pct}
                onPress={() => setDownPct(pct)}
                style={[s.chip, { borderColor: downPct === pct ? theme.colors.accent : theme.colors.border, backgroundColor: downPct === pct ? theme.colors.accentSoft : 'transparent' }]}
              >
                <Text style={[s.chipText, { color: downPct === pct ? theme.colors.accent : theme.colors.textSecondary }]}>{Math.round(pct * 100)}%</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[s.label, { marginTop: 14 }]}>Prazo</Text>
          <View style={s.chipRow}>
            {financingTerms.map((m) => (
              <Pressable
                key={m}
                onPress={() => setTerm(m)}
                style={[s.chip, { borderColor: term === m ? theme.colors.accent : theme.colors.border, backgroundColor: term === m ? theme.colors.accentSoft : 'transparent' }]}
              >
                <Text style={[s.chipText, { color: term === m ? theme.colors.accent : theme.colors.textSecondary }]}>{m}x</Text>
              </Pressable>
            ))}
          </View>

          <View style={[s.resultBox, { backgroundColor: theme.colors.surfaceSunken }]}>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>Crédito do seu Ford na troca</Text>
              <Text style={s.resultValue}>R$ {Math.round(sim!.tradeInCredit).toLocaleString('pt-BR')}</Text>
            </View>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>Entrada adicional</Text>
              <Text style={s.resultValue}>R$ {Math.round(sim!.downPayment).toLocaleString('pt-BR')}</Text>
            </View>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>Valor financiado</Text>
              <Text style={s.resultValue}>R$ {Math.round(sim!.financed).toLocaleString('pt-BR')}</Text>
            </View>
            <View style={[s.resultRow, { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.borderSoft }]}>
              <Text style={s.installmentLabel}>{term}x de</Text>
              <Text style={s.installmentValue}>R$ {Math.round(sim!.installment).toLocaleString('pt-BR')}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Detail sheet */}
      <BottomSheet visible={!!detail} onClose={() => setDetailId(null)}>
        {detail && (
          <View>
            <Badge label={detail.fit} tone="accent" style={{ marginBottom: 10, alignSelf: 'flex-start' }} />
            <Text style={s.sheetTitle}>{detail.name}</Text>
            <Text style={[s.pageSub, { marginBottom: 14 }]}>{detail.desc}</Text>
            <View style={s.rowList}>
              <View style={s.rowItem}><Text style={s.rowSub}>Preço</Text><Text style={s.rowMeta}>R$ {detail.price.toLocaleString('pt-BR')}</Text></View>
              <View style={s.rowItem}><Text style={s.rowSub}>Seu {vehicle.name} como entrada</Text><Text style={s.rowMeta}>R$ {vehicle.estimatedValue.toLocaleString('pt-BR')}</Text></View>
              <View style={s.rowItem}><Text style={s.rowSub}>Complemento estimado</Text><Text style={s.rowMeta}>R$ {diff.toLocaleString('pt-BR')}</Text></View>
            </View>
            <View style={s.sheetBtnRow}>
              <Pressable style={[s.sheetBtnSecondary, { borderColor: theme.colors.border }]} onPress={() => { setDetailId(null); router.push('/(tabs)/vehicle'); }}>
                <Text style={[s.sheetBtnSecondaryText, { color: theme.colors.textPrimary }]}>Ver meu veículo</Text>
              </Pressable>
              <Pressable
                style={[s.sheetBtnSecondary, { borderColor: theme.colors.border }]}
                onPress={() => { setCompareSet(new Set([detail.id])); setDetailId(null); setCompareOpen(true); }}
              >
                <Text style={[s.sheetBtnSecondaryText, { color: theme.colors.textPrimary }]}>Comparar</Text>
              </Pressable>
            </View>
            <View style={s.sheetBtnRow}>
              <Pressable style={[s.sheetBtnSecondary, { borderColor: theme.colors.border }]} onPress={() => handleTestDrive(detail)}>
                <Text style={[s.sheetBtnSecondaryText, { color: theme.colors.textPrimary }]}>Agendar test-drive</Text>
              </Pressable>
              <Pressable style={[s.sheetBtnPrimary, { backgroundColor: theme.colors.navy950 }]} onPress={() => { setDetailId(null); router.push('/dealerships'); }}>
                <Text style={s.sheetBtnPrimaryText}>Falar com concessionária</Text>
              </Pressable>
            </View>
            {!newVehicleOrder && (
              <Pressable style={s.proposalBtn} onPress={() => handleProposal(detail)}>
                <Text style={[s.proposalBtnText, { color: theme.colors.textPrimary }]}>Solicitar proposta</Text>
                <Icon name="chevron" size={14} color={theme.colors.textPrimary} />
              </Pressable>
            )}
          </View>
        )}
      </BottomSheet>

      {/* Compare sheet — 1 vehicle (vs. seu Ford atual) when opened from the
          detail sheet's "Comparar" button, or 2-3 lineup vehicles side by
          side when opened from the compare bar. */}
      <BottomSheet visible={compareOpen} onClose={() => setCompareOpen(false)}>
        {compareOpen && compareVehicles.length === 1 && (
          <View>
            <Text style={s.sheetTitle}>Comparar veículos</Text>
            <Text style={[s.pageSub, { marginBottom: 14 }]}>Seu {vehicle.name} vs. {compareVehicles[0].name}</Text>
            <View style={s.rowList}>
              {[
                ['Preço', vehicle.model.split(' ').slice(0, 2).join(' '), shortName(compareVehicles[0])],
                ['Valor', `R$ ${vehicle.estimatedValue.toLocaleString('pt-BR')}`, `R$ ${compareVehicles[0].price.toLocaleString('pt-BR')}`],
                ['Ano', vehicle.year, compareVehicles[0].year],
                ['Garantia', `até ${vehicle.warrantyUntil}`, compareVehicles[0].warranty],
                ['Saúde / condição', `${vehicleHealth.overall}/100`, '0 km (novo)'],
              ].map(([label, a, b]) => (
                <View key={label} style={s.compareRowItem}>
                  <Text style={s.rowSub}>{label}</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.compareValA}>{a}</Text>
                    <Text style={s.compareValB}>{b}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        {compareOpen && compareVehicles.length >= 2 && (
          <View>
            <Text style={s.sheetTitle}>Comparar veículos</Text>
            <Text style={[s.pageSub, { marginBottom: 14 }]}>{compareVehicles.map(shortName).join(' vs. ')}</Text>
            <View style={s.compareTable}>
              <View style={s.compareTableHeadRow}>
                <View style={s.compareTableLabelCol} />
                {compareVehicles.map((v) => (
                  <Text key={v.id} style={s.compareTableName} numberOfLines={2}>{shortName(v)}</Text>
                ))}
              </View>
              {compareRows.map(([label, getter]) => (
                <View key={label} style={s.compareTableRow}>
                  <Text style={s.compareTableLabel}>{label}</Text>
                  {compareVehicles.map((v) => (
                    <Text key={v.id} style={s.compareTableValue}>{getter(v)}</Text>
                  ))}
                </View>
              ))}
            </View>
            <Text style={[s.pageSub, { marginTop: 14 }]}>Compatibilidade calculada com base no seu perfil de uso, veículo atual e histórico de manutenção.</Text>
          </View>
        )}
      </BottomSheet>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14, lineHeight: 19 },
  vehicleCard: {},
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  compareLabel: { fontSize: 12, fontWeight: '600' },
  vehicleName: { fontSize: 15.5, fontWeight: '800', color: theme.colors.textPrimary },
  vehicleDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 6, lineHeight: 17, marginBottom: 12 },
  footRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vehiclePrice: { fontSize: 17, fontWeight: '800', color: theme.colors.textPrimary },
  verBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verBtnText: { fontSize: 13, fontWeight: '700' },
  compareBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  compareBarText: { fontSize: 12.5, color: theme.colors.textSecondary, flex: 1 },
  compareBtn: { borderRadius: 999, paddingVertical: 11, paddingHorizontal: 16 },
  compareBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tradeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  tradeTitle: { fontSize: 14.5, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 4 },
  tradeBtn: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 },
  tradeBtnText: { fontSize: 12.5, fontWeight: '700' },
  label: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, paddingVertical: 10, borderRadius: 999, borderWidth: 1, alignItems: 'center' },
  chipText: { fontSize: 12.5, fontWeight: '700' },
  resultBox: { borderRadius: 10, padding: 14, marginTop: 16 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultLabel: { fontSize: 12.5, color: theme.colors.textSecondary },
  resultValue: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary },
  installmentLabel: { fontSize: 14, fontWeight: '800', color: theme.colors.textPrimary },
  installmentValue: { fontSize: 16, fontWeight: '800', color: theme.colors.accent },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  rowList: { borderTopWidth: 1, borderTopColor: theme.colors.borderSoft },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft },
  compareRowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft },
  rowSub: { fontSize: 12.5, color: theme.colors.textSecondary, flex: 1 },
  rowMeta: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  compareValA: { fontSize: 12.5, color: theme.colors.textSecondary },
  compareValB: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 2 },
  sheetBtnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  sheetBtnSecondary: { flex: 1, borderWidth: 1.5, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  sheetBtnSecondaryText: { fontSize: 12.5, fontWeight: '700' },
  sheetBtnPrimary: { flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  sheetBtnPrimaryText: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  proposalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 14 },
  proposalBtnText: { fontSize: 13, fontWeight: '700' },
  compareTable: {},
  compareTableHeadRow: { flexDirection: 'row', marginBottom: 6 },
  compareTableLabelCol: { flex: 1 },
  compareTableName: { flex: 1, fontSize: 11.5, fontWeight: '800', color: theme.colors.textPrimary, textAlign: 'center' },
  compareTableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.borderSoft },
  compareTableLabel: { flex: 1, fontSize: 11.5, color: theme.colors.textSecondary },
  compareTableValue: { flex: 1, fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary, textAlign: 'center' },
});
