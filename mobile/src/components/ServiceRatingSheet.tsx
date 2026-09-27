import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomSheet from './BottomSheet';
import Icon from './Icon';

const CATEGORIES: [string, string][] = [['atendimento', 'Atendimento'], ['servico', 'Serviço'], ['tempo', 'Tempo'], ['geral', 'Experiência geral']];

interface ServiceRatingSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

// openServiceRatingModal() no site — mostrado ao concluir o atendimento
// ("Concluir atendimento"), antes de zerar o card de acompanhamento.
export default function ServiceRatingSheet({ visible, onClose, onSubmit }: ServiceRatingSheetProps) {
  const { theme } = useTheme();
  const s = styles(theme);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');

  const setStar = (cat: string, n: number) => setRatings((prev) => ({ ...prev, [cat]: n }));

  const handleClose = () => { setRatings({}); setComment(''); onClose(); };
  const handleSubmit = () => { onSubmit(); setRatings({}); setComment(''); };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <View style={[s.iconWrap, { backgroundColor: theme.colors.successBg }]}>
        <Icon name="check" size={20} color={theme.colors.success} />
      </View>
      <Text style={s.title}>Como foi sua experiência?</Text>
      <Text style={s.sub}>Sua avaliação ajuda a melhorar o atendimento Ford.</Text>

      {CATEGORIES.map(([key, label]) => (
        <View key={key} style={s.ratingRow}>
          <Text style={s.ratingLabel}>{label}</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setStar(key, n)} hitSlop={4}>
                {/* Plain "★" glyph, same as the HTML's .star-btn (a text
                    button, not an SVG icon) — active color #F5A623. */}
                <Text style={{ fontSize: 22, lineHeight: 22, color: (ratings[key] || 0) >= n ? '#F5A623' : theme.colors.border }}>★</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Text style={s.fieldLabel}>Conte mais sobre sua experiência (opcional)</Text>
      <TextInput
        value={comment} onChangeText={setComment} multiline numberOfLines={3}
        placeholder="O que podemos melhorar?" placeholderTextColor={theme.colors.textTertiary}
        style={[s.textarea, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
      />

      <Pressable style={[s.submitBtn, { backgroundColor: theme.colors.navy950 }]} onPress={handleSubmit}>
        <Text style={s.submitBtnText}>Enviar avaliação</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: 12.5, color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  ratingLabel: { fontSize: 13.5, fontWeight: '600', color: theme.colors.textPrimary },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginTop: 14, marginBottom: 8 },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13.5, minHeight: 70, textAlignVertical: 'top' },
  submitBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
