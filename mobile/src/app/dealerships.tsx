import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { boxShadow } from '../styles/theme';
import { useToast } from '../components/Toast';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BottomSheet from '../components/BottomSheet';
import { dealershipDetails } from '../constants/data';
import type { Dealership } from '../types';

const FILTERS = [
  { key: 'proxima', label: 'Mais próxima' },
  { key: 'avaliada', label: 'Melhor avaliada' },
  { key: 'disponivel', label: 'Disponível hoje' },
];

export default function DealershipsScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const { setSuggestedDealer } = useAppState();
  const s = styles(theme);

  const [view, setView] = useState('lista');
  const [filter, setFilter] = useState('proxima');
  const [detailIdx, setDetailIdx] = useState<number | null>(null);

  const list = dealershipDetails.map((d, i) => ({ ...d, _idx: i }));
  if (filter === 'avaliada') list.sort((a, b) => b.rating - a.rating);
  else if (filter === 'disponivel') {
    const filtered = list.filter((d) => d.availableToday);
    list.length = 0;
    list.push(...filtered);
  }

  const detail = detailIdx !== null ? dealershipDetails[detailIdx] : null;

  const handleSchedule = (dealer: Dealership) => {
    setSuggestedDealer(`${dealer.name} — ${dealer.distance}`);
    showToast(`Abrindo agendamento em ${dealer.name}`);
    setDetailIdx(null);
    router.push('/scheduling');
  };

  const handleCall = (dealer: Dealership) => {
    Linking.openURL(`tel:${dealer.phone.replace(/\D/g, '')}`).catch(() => {
      showToast(`Ligando para ${dealer.phone}`);
    });
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Encontre a concessionária mais próxima de você.</Text>

      <View style={[s.viewTabs, { backgroundColor: theme.colors.surfaceSunken }]}>
        {['lista', 'mapa'].map((v) => {
          const active = view === v;
          return (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              style={[
                s.viewTab,
                active && { backgroundColor: theme.colors.surface, ...boxShadow('#0F1932', 0.06, 3, 1) },
              ]}
            >
              <Text style={[s.viewTabText, { color: active ? theme.colors.textPrimary : theme.colors.textSecondary }]}>{v === 'lista' ? 'Lista' : 'Mapa'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[s.filterChip, { borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: active ? theme.colors.accentSoft : 'transparent' }]}
            >
              <Text style={[s.filterChipText, { color: active ? theme.colors.accent : theme.colors.textSecondary }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {list.length === 0 ? (
        <Card style={s.emptyCard}>
          <Text style={s.emptyTitle}>Nenhuma concessionária com esse filtro</Text>
          <Text style={s.emptyText}>Experimente outro filtro para ver mais opções.</Text>
        </Card>
      ) : view === 'lista' ? (
        <Card style={{ padding: 0 }}>
          {list.map((d, i) => (
            <Pressable
              key={d.name}
              onPress={() => setDetailIdx(d._idx)}
              style={[s.listRow, i < list.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}
            >
              <View style={[s.pinIcon, { backgroundColor: theme.colors.accentSoft }]}>
                <Icon name="pin" size={16} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{d.name}</Text>
                <Text style={s.infoText}>{d.address}</Text>
                <Text style={s.infoText}>
                  {d.hours} · ★ {d.rating}
                  {d.availableToday ? <Text style={{ color: theme.colors.success, fontWeight: '700' }}> · Disponível hoje</Text> : null}
                </Text>
              </View>
              <Text style={s.distanceMeta}>{d.distance}</Text>
              <Icon name="chevron" size={16} color={theme.colors.textTertiary} />
            </Pressable>
          ))}
        </Card>
      ) : (
        // Simplified static "map" — RN has no bundled interactive map library
        // in this project, so pins are placed by the same mapPos (%x/%y)
        // coordinates the HTML version uses, over a plain gradient surface
        // standing in for the map tile.
        <Card style={s.mapCard}>
          {list.map((d) => (
            <Pressable
              key={d.name}
              onPress={() => setDetailIdx(d._idx)}
              style={[s.mapPin, { left: `${d.mapPos.x}%`, top: `${d.mapPos.y}%` }]}
            >
              <View style={[s.mapPinDot, { backgroundColor: theme.colors.navy950 }]}>
                <Icon name="pin" size={14} color="#fff" />
              </View>
              <Text style={[s.mapPinLabel, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]} numberOfLines={1}>{d.name}</Text>
            </Pressable>
          ))}
        </Card>
      )}

      <BottomSheet visible={!!detail} onClose={() => setDetailIdx(null)}>
        {detail && (
          <View>
            <View style={[s.sheetIcon, { backgroundColor: theme.colors.accentSoft }]}>
              <Icon name="pin" size={20} color={theme.colors.accent} />
            </View>
            <Text style={s.sheetTitle}>{detail.name}</Text>
            <Badge label={detail.distance} tone="neutral" style={{ marginBottom: 14 }} />
            <View style={s.rowList}>
              <View style={s.rowItem}><Text style={s.rowSub}>Endereço</Text><Text style={s.rowMeta}>{detail.address}</Text></View>
              <View style={s.rowItem}><Text style={s.rowSub}>Funcionamento</Text><Text style={s.rowMeta}>{detail.hours}</Text></View>
              <View style={s.rowItem}><Text style={s.rowSub}>Avaliação</Text><Text style={s.rowMeta}>★ {detail.rating}</Text></View>
              <View style={s.rowItem}><Text style={s.rowSub}>Telefone</Text><Text style={s.rowMeta}>{detail.phone}</Text></View>
              <View style={[s.rowItem, { borderBottomWidth: 0 }]}><Text style={s.rowSub}>Próximo horário</Text><Text style={s.rowMeta}>{detail.nextSlot}</Text></View>
            </View>
            <View style={s.servicesRow}>
              {detail.services.map((svc) => (
                <Badge key={svc} label={svc} tone="neutral" />
              ))}
            </View>
            <View style={s.sheetBtnRow}>
              <Pressable style={[s.secondaryBtn, { borderColor: theme.colors.border }]} onPress={() => handleCall(detail)}>
                <Text style={[s.secondaryBtnText, { color: theme.colors.textPrimary }]}>Ligar</Text>
              </Pressable>
            </View>
            <Pressable style={[s.primaryBtn, { backgroundColor: theme.colors.navy950 }]} onPress={() => handleSchedule(detail)}>
              <Text style={s.primaryBtnText}>Agendar nesta concessionária</Text>
            </Pressable>
          </View>
        )}
      </BottomSheet>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  viewTabs: { flexDirection: 'row', gap: 6, marginBottom: 12, padding: 4, borderRadius: 999, alignSelf: 'flex-start' },
  viewTab: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  viewTabText: { fontSize: 13, fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filterChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  filterChipText: { fontSize: 12, fontWeight: '700' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  pinIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14.5, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 3 },
  infoText: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 1 },
  distanceMeta: { fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary, marginRight: 4 },
  emptyCard: { alignItems: 'center', paddingVertical: 26 },
  emptyTitle: { fontSize: 14.5, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 12.5, color: theme.colors.textSecondary, textAlign: 'center' },
  mapCard: { height: 320, position: 'relative', overflow: 'hidden' },
  mapPin: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -14 }, { translateY: -14 }] },
  mapPinDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mapPinLabel: { fontSize: 10, fontWeight: '700', borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4, maxWidth: 100 },
  sheetIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  rowList: {},
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft, gap: 10 },
  rowSub: { fontSize: 12.5, color: theme.colors.textSecondary },
  rowMeta: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary, textAlign: 'right', flexShrink: 1 },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  sheetBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondaryBtn: { flex: 1, borderWidth: 1.5, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { fontSize: 13, fontWeight: '700' },
  primaryBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '800' },
});
