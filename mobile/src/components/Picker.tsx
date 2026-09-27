import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

// A tap-to-expand selector — the RN equivalent of a web <select>, since
// there is no native picker UI that looks consistent across platforms.
interface PickerProps {
  label: React.ReactNode;
  value: string;
  options: string[];
  onSelect: (option: string) => void;
}

export default function Picker({ label, value, options, onSelect }: PickerProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const s = styles(theme);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(!open)}
        style={[s.field, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
      >
        <Text style={s.value}>{value}</Text>
        <Icon name="chevron" size={18} color={theme.colors.textSecondary} style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }} />
      </Pressable>
      {open && (
        <View style={[s.dropdown, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          {options.map((opt, i) => (
            <Pressable
              key={opt}
              onPress={() => { onSelect(opt); setOpen(false); }}
              style={[s.option, i < options.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}
            >
              <Text style={[s.optionText, opt === value && { color: theme.colors.accent, fontWeight: '700' }]}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  label: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 6 },
  field: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  value: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  dropdown: { borderWidth: 1, borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  option: { paddingHorizontal: 14, paddingVertical: 12 },
  optionText: { fontSize: 13.5, color: theme.colors.textPrimary },
});
