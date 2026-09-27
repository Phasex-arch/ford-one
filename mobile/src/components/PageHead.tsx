import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// script.js's pageHead(eyebrow, title, sub) — used at the top of a page's
// body content. Only needed on the bottom-tab screens (Meu Veículo, Saúde,
// Serviços) here: every OTHER page that uses pageHead() in the site is a
// pushed/stacked route in this port, which already gets its `title` from
// the native Stack header (see app/_layout.js) — those screens render just
// the subtitle text inline instead of repeating the title a second time.
interface PageHeadProps {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
}

export default function PageHead({ eyebrow, title, sub }: PageHeadProps) {
  const { theme } = useTheme();
  const s = styles(theme);
  return (
    <View style={s.wrap}>
      <Text style={s.eyebrow}>{eyebrow}</Text>
      <Text style={s.title}>{title}</Text>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  wrap: { marginBottom: 20 },
  eyebrow: { fontSize: 12.5, fontWeight: '600', color: theme.colors.accent, marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '600', letterSpacing: -0.2, color: theme.colors.textPrimary },
  sub: { fontSize: 13.5, color: theme.colors.textSecondary, marginTop: 4 },
});
