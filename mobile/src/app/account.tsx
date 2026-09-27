import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import { user } from '../constants/data';

export default function AccountScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const s = styles(theme);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState('(11) 98765-4321');

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Card>
        <Text style={s.label}>Nome</Text>
        <TextInput value={name} onChangeText={setName} style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />

        <Text style={[s.label, { marginTop: 14 }]}>E-mail</Text>
        <TextInput
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
          style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
        />

        <Text style={[s.label, { marginTop: 14 }]}>Telefone</Text>
        <TextInput
          value={phone} onChangeText={setPhone} keyboardType="phone-pad"
          style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
        />

        <Pressable style={[s.saveBtn, { backgroundColor: theme.colors.navy950 }]} onPress={() => showToast('Dados atualizados com sucesso')}>
          <Text style={s.saveBtnText}>Salvar alterações</Text>
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
