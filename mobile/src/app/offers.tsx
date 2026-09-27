import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { offers } from '../constants/data';
import type { Offer } from '../constants/data/offers';

export default function OffersScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const { setSuggestedService } = useAppState();
  const s = styles(theme);

  const handleOffer = (offer: Offer) => {
    if (offer.action.kind === 'schedule') {
      setSuggestedService(offer.action.service);
      showToast(`Abrindo agendamento: ${offer.action.service}`);
      router.push('/scheduling');
      return;
    }
    showToast('Solicitação de contato enviada');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Ofertas relevantes para o momento atual do seu Ford.</Text>
      {offers.map((offer) => (
        <Card key={offer.title}>
          <Badge label={offer.context} tone="neutral" />
          <Text style={s.title}>{offer.title}</Text>
          <View style={s.priceRow}>
            <Text style={s.price}>{offer.price}</Text>
            <Text style={s.oldPrice}>{offer.oldPrice}</Text>
          </View>
          <Text style={s.desc}>{offer.desc}</Text>
          <Pressable style={[s.ctaBtn, { backgroundColor: theme.colors.navy950 }]} onPress={() => handleOffer(offer)}>
            <Text style={s.ctaText}>{offer.cta}</Text>
          </Pressable>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  title: { fontSize: 15.5, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 10, marginBottom: 8, lineHeight: 21 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  price: { fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary },
  oldPrice: { fontSize: 13, color: theme.colors.textTertiary, textDecorationLine: 'line-through' },
  desc: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 14 },
  ctaBtn: { borderRadius: 999, paddingVertical: 13, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 13.5, fontWeight: '800' },
});
