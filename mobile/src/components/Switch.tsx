import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function Switch({ value, onValueChange }: SwitchProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[styles.toggle, { backgroundColor: value ? theme.colors.accent : theme.colors.borderSoft }]}
    >
      <View style={[styles.knob, value && { alignSelf: 'flex-end' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
});
