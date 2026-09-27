import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import { router } from 'expo-router';

export default function PasswordScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const s = styles(theme);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSave = () => {
    if (!current || !next || !confirm) {
      showToast('Preencha todos os campos');
      return;
    }
    if (next.length < 8) {
      showToast('A nova senha precisa ter pelo menos 8 caracteres');
      return;
    }
    if (next !== confirm) {
      showToast('As senhas não coincidem');
      return;
    }
    showToast('Senha atualizada com sucesso');
    router.back();
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Card>
        <Text style={s.label}>Senha atual</Text>
        <TextInput value={current} onChangeText={setCurrent} secureTextEntry style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />

        <Text style={[s.label, { marginTop: 14 }]}>Nova senha</Text>
        <TextInput
          value={next} onChangeText={setNext} secureTextEntry placeholder="Mínimo 8 caracteres"
          placeholderTextColor={theme.colors.textTertiary}
          style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
        />

        <Text style={[s.label, { marginTop: 14 }]}>Confirmar nova senha</Text>
        <TextInput value={confirm} onChangeText={setConfirm} secureTextEntry style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />

        <Pressable style={[s.saveBtn, { backgroundColor: theme.colors.navy950 }]} onPress={handleSave}>
          <Text style={s.saveBtnText}>Salvar nova senha</Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  label: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  saveBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
