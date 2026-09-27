import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../../components/TopBar';
import MaintenanceBody from '../../components/MaintenanceBody';
import PageHead from '../../components/PageHead';

// The 4th bottom tab. In the HTML MVP, BOTTOM_IDS's 4th entry is
// "maintenance" — its bottom-nav label reads "Serviços" (PAGES'
// `mobile:"Serviços"` override) but it's the same Manutenções page as
// everywhere else, not a separate hub. Kept as its own route file (rather
// than reusing app/maintenance.js) only because Expo Router's `(tabs)`
// group doesn't appear in the URL, so the two would otherwise collide at
// the same path; the tab bar label "Serviços" is set in (tabs)/_layout.js.
export default function ServicesTabScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar />
      <MaintenanceBody header={<PageHead eyebrow="Prevenção e cuidado" title="Manutenções" />} />
    </View>
  );
}
