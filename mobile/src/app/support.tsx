import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import { supportFaqs } from '../constants/data';

// openSupportModal() no site: campo de busca + todas as perguntas sempre
// visíveis (não é um acordeão) + "Falar com um consultor".
export default function SupportScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const s = styles(theme);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? supportFaqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    : supportFaqs;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Pesquise ou navegue pelas perguntas frequentes.</Text>
      <TextInput
        value={query} onChangeText={setQuery}
        placeholder="Pesquisar, ex: calibrar pneu..." placeholderTextColor={theme.colors.textTertiary}
        style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
      />

      {filtered.length === 0 ? (
        <View style={[s.emptyBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
          <Text style={s.emptyTitle}>Nada encontrado</Text>
          <Text style={s.emptyDesc}>Tente outra palavra, ou fale direto com um consultor abaixo.</Text>
        </View>
      ) : (
        <Card style={{ padding: 0 }}>
          {filtered.map((faq, i) => (
            <View key={faq.q} style={[s.row, i < filtered.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}>
              <Text style={s.question}>{faq.q}</Text>
              <Text style={s.answer}>{faq.a}</Text>
            </View>
          ))}
        </Card>
      )}

      <Pressable
        style={[s.consultBtn, { backgroundColor: theme.colors.navy950 }]}
        onPress={() => showToast('Conectando você com um consultor Ford...')}
      >
        <Text style={s.consultBtnText}>Falar com um consultor</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 14 },
  row: { padding: 14 },
  question: { fontSize: 13.5, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  answer: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 18 },
  emptyBox: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 14.5, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 12.5, color: theme.colors.textSecondary, textAlign: 'center' },
  consultBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  consultBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
