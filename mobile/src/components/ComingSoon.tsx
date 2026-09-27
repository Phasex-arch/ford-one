import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';

interface ComingSoonProps {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: React.ReactNode;
  description: React.ReactNode;
}

export default function ComingSoon({ icon, title, description }: ComingSoonProps) {
  const { theme } = useTheme();
  const s = styles(theme);
  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.wrap}>
      <View style={s.iconCircle}>
        <Icon name={icon} size={26} color={theme.colors.accent} />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.desc}>{description}</Text>
      <View style={s.noteBox}>
        <Text style={s.noteText}>
          Esta tela ainda não foi portada do app web. A versão web completa (script.js) já
          implementa isso — esta é a próxima parte a migrar para o Expo.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 6 },
  desc: { fontSize: 13.5, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  noteBox: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.colors.borderSoft },
  noteText: { fontSize: 12.5, color: theme.colors.textTertiary, textAlign: 'center', lineHeight: 18 },
});
