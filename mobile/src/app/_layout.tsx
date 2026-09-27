import React, { useEffect } from 'react';
import { Text, TextInput, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ToastProvider } from '../components/Toast';
import { AppStateProvider } from '../context/AppStateContext';
import FloatingAssistantButton from '../components/FloatingAssistantButton';

// The web app loads 'Archivo' as a single family with several real weight
// files via a Google Fonts <link>, the same way style.css's
// --font-ui/--font-display do. Setting fontFamily here — once, as the
// default for every <Text>/<TextInput> — lets every screen's existing
// fontWeight (400/500/600/700/800/900) resolve to the real Archivo weight
// file on web, exactly like the CSS version, with no per-screen changes.
// `defaultProps` on function components isn't in React 19's/RN's types
// anymore (it's a runtime-only legacy field), so this needs an `any`
// escape hatch — see the "Migração para TypeScript" note in the README.
const TextAny = Text as any;
const TextInputAny = TextInput as any;
TextAny.defaultProps = TextAny.defaultProps || {};
TextAny.defaultProps.style = [{ fontFamily: 'Archivo' }, TextAny.defaultProps.style];
TextInputAny.defaultProps = TextInputAny.defaultProps || {};
TextInputAny.defaultProps.style = [{ fontFamily: 'Archivo' }, TextInputAny.defaultProps.style];

// Injects the same Google Fonts <link> the web app's index.html uses.
// Done at runtime (not via app/+html.js) because this project's web export
// uses `web.output: "single"` (SPA mode), where +html.js customization
// isn't applied — this runs on every platform but is a no-op off web.
function useWebFontLink() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.getElementById('archivo-font-link')) return;
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    const link = document.createElement('link');
    link.id = 'archivo-font-link';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500&display=swap';
    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(link);
    document.title = 'Ford One';
  }, []);
}

function RootStack() {
  const { mode, theme } = useTheme();
  const headerOptions = {
    headerStyle: { backgroundColor: theme.colors.surface },
    headerTintColor: theme.colors.textPrimary,
    headerTitleStyle: { fontWeight: '800' as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.bg },
  };
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="maintenance" options={{ headerShown: true, title: 'Manutenções', ...headerOptions }} />
        <Stack.Screen name="alerts" options={{ headerShown: true, title: 'Alertas', ...headerOptions }} />
        <Stack.Screen name="scheduling" options={{ headerShown: true, title: 'Agendamento', ...headerOptions }} />
        <Stack.Screen name="diagnosis" options={{ headerShown: true, title: 'Diagnóstico', ...headerOptions }} />
        <Stack.Screen name="profile" options={{ headerShown: true, title: 'Perfil', ...headerOptions }} />
        <Stack.Screen name="dealerships" options={{ headerShown: true, title: 'Concessionárias', ...headerOptions }} />
        <Stack.Screen name="offers" options={{ headerShown: true, title: 'Ofertas', ...headerOptions }} />
        <Stack.Screen name="history" options={{ headerShown: true, title: 'Histórico', ...headerOptions }} />
        <Stack.Screen name="keepOrTrade" options={{ headerShown: true, title: 'Manter ou Trocar', ...headerOptions }} />
        <Stack.Screen name="newFord" options={{ headerShown: true, title: 'Trocar meu Ford', ...headerOptions }} />
        <Stack.Screen name="assistant" options={{ headerShown: true, title: 'Assistente Ford One Intelligence', ...headerOptions }} />
        <Stack.Screen name="recommendations" options={{ headerShown: true, title: 'Recomendações', ...headerOptions }} />
        <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notificações', ...headerOptions }} />
        <Stack.Screen name="support" options={{ headerShown: true, title: 'Suporte', ...headerOptions }} />
        <Stack.Screen name="account" options={{ headerShown: true, title: 'Minha conta', ...headerOptions }} />
        <Stack.Screen name="password" options={{ headerShown: true, title: 'Senha', ...headerOptions }} />
        <Stack.Screen name="preferences" options={{ headerShown: true, title: 'Preferências', ...headerOptions }} />
        <Stack.Screen name="privacy" options={{ headerShown: true, title: 'Privacidade', ...headerOptions }} />
        <Stack.Screen name="drivers" options={{ headerShown: true, title: 'Motoristas', ...headerOptions }} />
        <Stack.Screen name="notificationPrefs" options={{ headerShown: true, title: 'Preferências de notificação', ...headerOptions }} />
        <Stack.Screen name="intelligence" options={{ headerShown: true, title: 'Ford One Intelligence', ...headerOptions }} />
        <Stack.Screen name="appSettings" options={{ headerShown: true, title: 'Configurações', ...headerOptions }} />
      </Stack>
      <FloatingAssistantButton />
    </>
  );
}

export default function RootLayout() {
  useWebFontLink();
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppStateProvider>
            <RootStack />
          </AppStateProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
