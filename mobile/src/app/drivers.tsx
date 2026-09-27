import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Chip from '../components/Chip';
import BottomSheet from '../components/BottomSheet';
import {
  drivers, ALL_DRIVER_PERMISSIONS, EXPIRY_OPTIONS, computeValetExpiry, addDriver, updateDriver, revokeDriver,
} from '../constants/data';
import type { DriverRecord } from '../constants/data/drivers';

// openDriversModal()/openAddDriverModal() no site: quem pode usar o Ford e
// o que cada um pode fazer, com acesso permanente ou temporário ("Modo
// Valet"/empréstimo).
export default function DriversScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const s = styles(theme);
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState<number | 'new' | null>(null); // driver being edited, or 'new'
  const refresh = () => setTick((t) => t + 1);

  const editingDriver = editing && editing !== 'new' ? drivers.find((d) => d.id === editing) || null : null;

  const handleRevoke = (d: DriverRecord) => {
    revokeDriver(d.id);
    refresh();
    showToast(`Acesso de ${d.name} revogado`);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Quem pode usar o seu Ford e o que cada um pode fazer.</Text>

      <Card style={{ padding: 0 }}>
        {drivers.map((d, i) => (
          <View key={d.id} style={[s.row, i < drivers.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}>
            <View style={[s.avatar, { backgroundColor: theme.colors.accentSoft }]}>
              <Text style={[s.avatarText, { color: theme.colors.accent }]}>{d.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{d.name}</Text>
              <Text style={s.sub}>{d.role}{d.expiresAt ? ' · Acesso temporário' : ''}</Text>
              {d.expiresAt && <Text style={[s.sub, { color: theme.colors.warning, fontWeight: '700', marginBottom: 4 }]}>Acesso permitido até: {d.expiresAt}</Text>}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                {d.permissions.map((p) => <Badge key={p} label={p} tone="neutral" style={{ marginRight: 6, marginBottom: 6 }} />)}
              </View>
              {d.role !== 'Proprietária' && (
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
                  <Pressable onPress={() => setEditing(d.id)}><Text style={s.linkText}>Editar</Text></Pressable>
                  <Pressable onPress={() => handleRevoke(d)}><Text style={[s.linkText, { color: theme.colors.danger }]}>Revogar acesso</Text></Pressable>
                </View>
              )}
            </View>
          </View>
        ))}
      </Card>

      <Pressable style={s.addBtn} onPress={() => setEditing('new')}>
        <Text style={[s.addBtnText, { color: theme.colors.accent }]}>+ Adicionar motorista</Text>
      </Pressable>

      <DriverFormSheet
        visible={!!editing}
        driver={editingDriver}
        onClose={() => setEditing(null)}
        onSaved={(name: string) => { refresh(); showToast(editingDriver ? `${name} atualizado com sucesso` : `${name} adicionado com sucesso`); setEditing(null); }}
      />
    </ScrollView>
  );
}

interface DriverFormSheetProps {
  visible: boolean;
  driver: DriverRecord | null;
  onClose: () => void;
  onSaved: (name: string) => void;
}

function DriverFormSheet({ visible, driver, onClose, onSaved }: DriverFormSheetProps) {
  const { theme } = useTheme();
  const showToast = useToast();
  const s = styles(theme);
  const isEdit = !!driver;
  const [name, setName] = useState('');
  const [perms, setPerms] = useState<string[]>([]);
  const [expiry, setExpiry] = useState('permanent');

  // Reset the form fields whenever a new sheet instance opens for a
  // different driver (or "new"), mirroring the site rebuilding the modal
  // HTML fresh each time openAddDriverModal() runs.
  const [lastKey, setLastKey] = useState<number | 'new' | null>(null);
  const key: number | 'new' | null = driver ? driver.id : (visible ? 'new' : null);
  if (key !== lastKey) {
    setLastKey(key);
    setName(driver ? driver.name : '');
    setPerms(driver ? driver.permissions.filter((p) => ALL_DRIVER_PERMISSIONS.includes(p)) : []);
    setExpiry(driver && !driver.expiresAt ? 'permanent' : (driver ? '2h' : 'permanent'));
  }

  const togglePerm = (p: string) => setPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { showToast('Digite o nome do motorista'); return; }
    const expiresAt = expiry === 'permanent' ? null : computeValetExpiry(expiry);
    if (isEdit) {
      updateDriver(driver.id, { name: trimmed, permissions: perms, expiresAt });
    } else {
      addDriver({ name: trimmed, permissions: perms, expiresAt });
    }
    onSaved(trimmed);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={s.sheetTitle}>{isEdit ? 'Editar motorista' : 'Adicionar motorista'}</Text>
      <Text style={s.sheetSub}>Defina o nome, as permissões e por quanto tempo o acesso deve valer.</Text>

      <Text style={s.fieldLabel}>Nome</Text>
      <TextInput
        value={name} onChangeText={setName} placeholder="Nome do motorista"
        placeholderTextColor={theme.colors.textTertiary}
        style={[s.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
      />

      <Text style={[s.fieldLabel, { marginTop: 14 }]}>Permissões</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {ALL_DRIVER_PERMISSIONS.map((p) => (
          <Chip key={p} label={p} selected={perms.includes(p)} onPress={() => togglePerm(p)} />
        ))}
      </View>

      <Text style={[s.fieldLabel, { marginTop: 14, marginBottom: 8 }]}>Duração do acesso</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {EXPIRY_OPTIONS.map((o) => (
          <Chip key={o.key} label={o.label} selected={expiry === o.key} onPress={() => setExpiry(o.key)} />
        ))}
      </View>
      {isEdit && driver.expiresAt && (
        <Text style={s.sub}>Acesso atual válido até: {driver.expiresAt} — escolha uma opção acima para renovar, ou "Permanente" para remover o prazo.</Text>
      )}

      <Pressable style={[s.submitBtn, { backgroundColor: theme.colors.navy950 }]} onPress={handleSubmit}>
        <Text style={s.submitBtnText}>{isEdit ? 'Salvar alterações' : 'Adicionar motorista'}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 14, fontWeight: '800' },
  name: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  sub: { fontSize: 11.5, color: theme.colors.textSecondary, marginTop: 2, marginBottom: 6, lineHeight: 16 },
  linkText: { fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary },
  addBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 14 },
  addBtnText: { fontSize: 13.5, fontWeight: '700' },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  sheetSub: { fontSize: 12.5, color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 18 },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  submitBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
