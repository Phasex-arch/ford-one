import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface RowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  last?: boolean;
}

// A label/value row, the RN equivalent of the web app's .row-item pattern.
export default function Row({ label, value, last }: RowProps) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.row,
      !last && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft },
    ]}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  label: { fontSize: 13.5 },
  value: { fontSize: 13.5, fontWeight: '700' },
});
