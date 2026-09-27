import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import BottomSheet from '../components/BottomSheet';
import GarageSwitcherSheet from '../components/GarageSwitcherSheet';
import { user } from '../constants/data';
import type { IconName } from '../components/Icon';

// renderProfile() no site: lista única (sem grupos) com os 11 itens, na
// mesma ordem, mais "Sair da conta" com confirmação (openConfirmModal()).
// icon values are Icon.js keys — exact port of script.js's profile item
// icons (user, lock, car, car, user, bell, gauge, spark, stethoscope, help,
// wrench).
const PROFILE_ITEMS: { key: string; label: string; icon: IconName }[] = [
  { key: 'account', label: 'Minha conta', icon: 'user' },
  { key: 'password', label: 'Senha', icon: 'lock' },
  { key: 'vehicle', label: 'Meu Ford', icon: 'car' },
  { key: 'garage', label: 'Minha Garagem', icon: 'car' },
  { key: 'drivers', label: 'Motoristas', icon: 'user' },
  { key: 'notifications', label: 'Notificações', icon: 'bell' },
  { key: 'preferences', label: 'Preferências', icon: 'gauge' },
  { key: 'intelligence', label: 'Ford One Intelligence', icon: 'spark' },
  { key: 'privacy', label: 'Privacidade', icon: 'stethoscope' },
  { key: 'support', label: 'Suporte', icon: 'help' },
  { key: 'settings', label: 'Configurações', icon: 'wrench' },
];

export default function ProfileScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const s = styles(theme);
  const [garageOpen, setGarageOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handlePress = (key: string) => {
    if (key === 'vehicle') return router.push('/(tabs)/vehicle');
    if (key === 'garage') return setGarageOpen(true);
    if (key === 'drivers') return router.push('/drivers');
    if (key === 'notifications') return router.push('/notifications');
    if (key === 'preferences') return router.push('/preferences');
    if (key === 'intelligence') return router.push('/intelligence');
    if (key === 'privacy') return router.push('/privacy');
    if (key === 'support') return router.push('/support');
    if (key === 'settings') return router.push('/appSettings');
    if (key === 'account') return router.push('/account');
    if (key === 'password') return router.push('/password');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Gerencie sua conta e preferências do Ford One.</Text>
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: theme.colors.accentSoft }]}>
          <Text style={[s.avatarText, { color: theme.colors.accent }]}>{user.name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.email}>{user.email}</Text>
        </View>
      </View>

      <Card style={{ padding: 0 }}>
        {PROFILE_ITEMS.map((item, i) => (
          <Pressable
            key={item.key}
            onPress={() => handlePress(item.key)}
            style={[s.row, i < PROFILE_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}
          >
            <View style={[s.iconWrap, { backgroundColor: theme.colors.accentSoft }]}>
              <Icon name={item.icon} size={17} color={theme.colors.accent} />
            </View>
            <Text style={s.rowLabel}>{item.label}</Text>
            <Icon name="chevron" size={18} color={theme.colors.textTertiary} />
          </Pressable>
        ))}
      </Card>

      <Pressable
        style={[s.logoutBtn, { borderColor: theme.colors.danger }]}
        onPress={() => setConfirmLogout(true)}
      >
        <Text style={[s.logoutText, { color: theme.colors.danger }]}>Sair da conta</Text>
      </Pressable>

      <GarageSwitcherSheet visible={garageOpen} onClose={() => setGarageOpen(false)} />

      <BottomSheet visible={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <Text style={s.confirmTitle}>Sair da conta?</Text>
        <Text style={s.confirmDesc}>Você precisará entrar novamente para acessar o Ford One.</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <Pressable style={[s.confirmCancel, { borderColor: theme.colors.border }]} onPress={() => setConfirmLogout(false)}>
            <Text style={[s.confirmCancelText, { color: theme.colors.textPrimary }]}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[s.confirmOk, { backgroundColor: theme.colors.danger }]}
            onPress={() => { setConfirmLogout(false); showToast('Você saiu da sua conta'); }}
          >
            <Text style={s.confirmOkText}>Sair</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { fontSize: 20, fontWeight: '800' },
  name: { fontSize: 17, fontWeight: '800', color: theme.colors.textPrimary },
  email: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 14.5, fontWeight: '600', color: theme.colors.textPrimary },
  logoutBtn: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  logoutText: { fontSize: 14, fontWeight: '800' },
  confirmTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 },
  confirmDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 20, lineHeight: 19 },
  confirmCancel: { flex: 1, borderWidth: 1.5, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  confirmCancelText: { fontSize: 14, fontWeight: '700' },
  confirmOk: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  confirmOkText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
