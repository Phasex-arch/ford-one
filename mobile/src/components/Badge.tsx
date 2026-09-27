import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

interface BadgeProps {
  label: React.ReactNode;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}

export default function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const { theme } = useTheme();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    success: { bg: theme.colors.successBg, fg: theme.colors.success },
    warning: { bg: theme.colors.warningBg, fg: theme.colors.warning },
    danger: { bg: theme.colors.dangerBg, fg: theme.colors.danger },
    neutral: { bg: theme.colors.surfaceSunken, fg: theme.colors.textSecondary },
    accent: { bg: theme.colors.accentSoft, fg: theme.colors.accent },
  };
  const c = map[tone] || map.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontSize: 11.5, fontWeight: '700' },
});
