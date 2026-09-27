import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import BottomSheet from './BottomSheet';
import { MORE_PAGES } from '../constants/nav';

// Mirrors the HTML MVP's "Mais" bottom-nav button: it doesn't navigate to a
// page, it opens `#moreSheet` (renderMoreSheet() in script.js) — a bottom
// sheet with a grid of every PAGES entry not in BOTTOM_IDS (the 4 quick
// tabs). Reuses the same BottomSheet component used for the garage
// switcher and the topbar menu, so it opens as an overlay on top of
// whatever tab screen is currently showing, not as a 5th navigated screen.
interface MoreSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function MoreSheet({ visible, onClose }: MoreSheetProps) {
  const { theme } = useTheme();
  const s = styles(theme);

  const handlePress = (href: string) => {
    onClose();
    router.push(href as Parameters<typeof router.push>[0]);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={s.title}>Mais</Text>
      <Text style={s.sub}>Tudo que você precisa para cuidar do seu Ford.</Text>
      <View style={s.grid}>
        {MORE_PAGES.map((item) => (
          <Pressable key={item.id} style={s.tile} onPress={() => handlePress(item.href)}>
            <View style={[s.iconWrap, { backgroundColor: theme.colors.accentSoft }]}>
              <Icon name={item.icon} size={22} color={theme.colors.accent} />
            </View>
            <Text style={s.tileLabel} numberOfLines={2}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary },
  sub: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '31.3%', minHeight: 88, borderRadius: 16, alignItems: 'center', justifyContent: 'flex-start',
    paddingVertical: 12, paddingHorizontal: 4, backgroundColor: theme.colors.bg,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tileLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary, textAlign: 'center', lineHeight: 15 },
});
