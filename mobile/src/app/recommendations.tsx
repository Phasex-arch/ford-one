import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import SystemDetailSheet from '../components/SystemDetailSheet';
import { recommendations, vehicleHealth } from '../constants/data';
import type { RecommendationItem } from '../constants/data/recommendations';
import type { VehicleSystem } from '../types';

export default function RecommendationsScreen() {
  const { theme } = useTheme();
  const { setSuggestedService, vehicleVersion } = useAppState();
  void vehicleVersion;
  const [detailSystem, setDetailSystem] = useState<VehicleSystem | null>(null);
  const s = styles(theme);

  const runAction = (r: RecommendationItem) => {
    if (!r.action) return;
    const { action } = r;
    if (action.kind === 'schedule') {
      setSuggestedService(action.service);
      router.push('/scheduling');
    } else if (action.kind === 'system') {
      const sys = vehicleHealth.systems.find((sy) => sy.id === action.system);
      if (sys) setDetailSystem(sys);
    } else if (action.kind === 'page') {
      router.push(`/${action.page}` as Parameters<typeof router.push>[0]);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Sugestões personalizadas com base no uso e na condição do seu veículo.</Text>
      {recommendations.map((r) => (
        <Card key={r.title}>
          <View style={[s.iconWrap, { backgroundColor: theme.colors.accentSoft }]}>
            <Icon name="spark" size={17} color={theme.colors.accent} />
          </View>
          <Text style={s.title}>{r.title}</Text>
          <Text style={s.text}>{r.desc}</Text>
          <Pressable style={[s.ctaBtn, { borderColor: theme.colors.border }]} onPress={() => runAction(r)}>
            <Text style={[s.ctaText, { color: theme.colors.textPrimary }]}>{r.cta}</Text>
            <Icon name="chevron" size={15} color={theme.colors.textPrimary} />
          </Pressable>
        </Card>
      ))}
      <SystemDetailSheet system={detailSystem} onClose={() => setDetailSystem(null)} />
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 14.5, fontWeight: '800', color: theme.colors.textPrimary, lineHeight: 19, marginBottom: 6 },
  text: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 14 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 999, paddingVertical: 11 },
  ctaText: { fontSize: 13, fontWeight: '700' },
});
