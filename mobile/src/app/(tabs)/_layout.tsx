import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icon, { IconName } from '../../components/Icon';
import MoreSheet from '../../components/MoreSheet';

// The HTML MVP's bottom nav (BOTTOM_IDS) has exactly 4 real tab buttons —
// Início / Meu Veículo / Saúde / Manutenções (labeled "Serviços" on
// mobile). A 5th button, "Mais", does NOT navigate anywhere: it opens
// #moreSheet, a bottom sheet over the current page (renderMoreSheet()),
// not a page of its own. Expo Router's Tabs navigator only registers real
// routes, so "Mais" is rendered by this custom tabBar as a 5th button that
// opens <MoreSheet> instead of calling navigation.navigate — it is never a
// Tabs.Screen, so there is no persistent "/more" route/screen behind it.
const TAB_ROUTES: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Início', icon: 'home' },
  { name: 'vehicle', label: 'Meu Veículo', icon: 'car' },
  { name: 'health', label: 'Saúde', icon: 'pulse' },
  { name: 'services', label: 'Serviços', icon: 'wrench' },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [moreOpen, setMoreOpen] = useState(false);
  const s = styles(theme, insets);
  const activeName = state.routes[state.index]?.name;

  return (
    <>
      <View style={s.bar}>
        {TAB_ROUTES.map((tab) => {
          const focused = activeName === tab.name;
          const color = focused ? theme.colors.accent : theme.colors.textTertiary;
          return (
            <Pressable
              key={tab.name}
              style={s.item}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: tab.name, canPreventDefault: true });
                if (!event.defaultPrevented) navigation.navigate(tab.name);
              }}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
            >
              <Icon name={tab.icon} size={22} color={color} />
              <Text style={[s.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          style={s.item}
          onPress={() => setMoreOpen(true)}
          accessibilityRole="button"
        >
          <Icon name="dots" size={22} color={theme.colors.textTertiary} />
          <Text style={[s.label, { color: theme.colors.textTertiary }]}>Mais</Text>
        </Pressable>
      </View>
      <MoreSheet visible={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="vehicle" options={{ title: 'Meu Veículo' }} />
      <Tabs.Screen name="health" options={{ title: 'Saúde' }} />
      <Tabs.Screen name="services" options={{ title: 'Manutenções' }} />
    </Tabs>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme'], insets: EdgeInsets) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    paddingTop: 6,
    paddingBottom: Math.max(insets.bottom, 8),
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 2 },
  label: { fontSize: 11, fontWeight: '600' },
});
