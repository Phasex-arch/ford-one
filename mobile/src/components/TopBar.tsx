import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import { alerts } from '../constants/data';
import { NAV_PAGES, GROUP_ORDER } from '../constants/nav';
import BottomSheet from './BottomSheet';

const logo = require('../../assets/ford-one-logo.png');

const NAV_GROUPS = GROUP_ORDER.map((group) => ({
  group,
  items: NAV_PAGES.filter((p) => p.group === group),
}));

// Mirrors the web app's mobile <header class="topbar">: hamburger — Ford
// One logo, centered — bell (badge dot when there are alerts that need
// attention), same as topbarMenu/topbarAlert in script.js. The hamburger
// opens the same full, grouped nav list as the site's off-canvas drawer /
// desktop sidebar (buildNavGroups()) — here as a bottom sheet, since RN has
// no off-canvas-drawer concept on mobile. Shown at the top of every tab
// screen.
export default function TopBar() {
  const { theme, mode, toggle } = useTheme();
  const { vehicleVersion, dismissedAlertIds } = useAppState();
  void vehicleVersion; // subscribe so the alert dot updates on vehicle switch
  const [menuOpen, setMenuOpen] = useState(false);
  const s = styles(theme);
  // Igual ao updateNotificationDots() do site: o ponto do sino aparece
  // quando há pelo menos um alerta ativo (não dispensado), de qualquer tipo.
  const hasAttention = alerts.some((a) => !dismissedAlertIds.has(a.id));

  return (
    <View style={[s.bar, { backgroundColor: theme.colors.bg, borderBottomColor: theme.colors.borderSoft }]}>
      <Pressable style={s.iconBtn} onPress={() => setMenuOpen(true)} accessibilityLabel="Abrir menu">
        <Icon name="menu" size={20} color={theme.colors.textPrimary} />
      </Pressable>
      <Image source={logo} style={s.logo} resizeMode="contain" />
      <Pressable style={s.iconBtn} onPress={() => router.push('/alerts')} accessibilityLabel="Alertas">
        <Icon name="bell" size={20} color={theme.colors.textPrimary} />
        {hasAttention && <View style={[s.dot, { backgroundColor: theme.colors.danger, borderColor: theme.colors.bg }]} />}
      </Pressable>

      <BottomSheet visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <Text style={s.menuTitle}>Navegação</Text>
        <ScrollView style={s.menuScroll}>
          {NAV_GROUPS.map(({ group, items }) => (
            <View key={group} style={s.menuGroup}>
              <Text style={s.menuGroupLabel}>{group}</Text>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  style={s.menuRow}
                  onPress={() => { setMenuOpen(false); router.push(item.href as Parameters<typeof router.push>[0]); }}
                >
                  <Icon name={item.icon} size={18} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
                  <Text style={s.menuLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
        <Pressable style={[s.menuRow, s.menuToggle]} onPress={toggle}>
          <Icon name="sun" size={18} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
          <Text style={s.menuLabel}>Modo escuro</Text>
          <View style={{ flex: 1 }} />
          <View style={[s.toggleTrack, { backgroundColor: mode === 'dark' ? theme.colors.accent : theme.colors.border }]}>
            <View style={[s.toggleThumb, mode === 'dark' && { alignSelf: 'flex-end' }]} />
          </View>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56, paddingHorizontal: 8, borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 84, height: 28 },
  dot: {
    position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5,
  },
  menuTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 12 },
  menuScroll: { maxHeight: 420 },
  menuGroup: { marginBottom: 14 },
  menuGroupLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textTertiary, marginBottom: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  menuLabel: { fontSize: 14.5, fontWeight: '500', color: theme.colors.textPrimary },
  menuToggle: { marginTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.borderSoft },
  toggleTrack: { width: 40, height: 22, borderRadius: 11, padding: 2, justifyContent: 'center' },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },
});
