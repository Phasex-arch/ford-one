import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ChipProps {
  label: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
}

export default function Chip({ label, onPress, selected }: ChipProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? theme.colors.accent : theme.colors.border,
          backgroundColor: selected ? theme.colors.accentSoft : 'transparent',
        },
      ]}
    >
      <Text style={[styles.text, { color: selected ? theme.colors.accent : theme.colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  text: { fontSize: 12.5, fontWeight: '600' },
});
