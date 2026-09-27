import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  value: number;
  tone?: 'ok' | 'warn';
}

export default function ProgressBar({ value, tone = 'ok' }: ProgressBarProps) {
  const { theme } = useTheme();
  const fillColor = tone === 'warn' ? theme.colors.warning : theme.colors.accent;
  return (
    <View style={[styles.track, { backgroundColor: theme.colors.borderSoft }]}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 999, overflow: 'hidden', width: '100%' },
  fill: { height: '100%', borderRadius: 999 },
});
