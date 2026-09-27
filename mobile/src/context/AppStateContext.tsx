import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadVehicleBundleData, garage } from '../constants/data';
import { notificationPrefsToggles, intelligenceToggles, privacyToggles } from '../constants/data/settings';
import type { Appointment, NewVehicleOrder } from '../types';

interface SettingsState {
  notifications: Record<string, boolean>;
  preferences: { unit: string };
  intelligence: Record<string, boolean>;
  privacy: Record<string, boolean>;
}

interface AppStateValue {
  confirmedAppointment: Appointment | null;
  setConfirmedAppointment: React.Dispatch<React.SetStateAction<Appointment | null>>;
  suggestedService: string | null;
  setSuggestedService: React.Dispatch<React.SetStateAction<string | null>>;
  suggestedDealer: string | null;
  setSuggestedDealer: React.Dispatch<React.SetStateAction<string | null>>;
  newVehicleOrder: NewVehicleOrder | null;
  setNewVehicleOrder: React.Dispatch<React.SetStateAction<NewVehicleOrder | null>>;
  activeVehicleIndex: number;
  switchVehicle: (index: number) => void;
  vehicleVersion: number;
  dismissedAlertIds: Set<string>;
  dismissAlert: (id: string) => void;
  restoreDismissedAlerts: () => void;
  settings: SettingsState;
  setNotificationPref: (key: string, value: boolean) => void;
  setIntelligencePref: (key: string, value: boolean) => void;
  setPrivacyPref: (key: string, value: boolean) => void;
  setDistanceUnit: (unit: string) => void;
}

// Cross-screen app state that isn't user preference (that's ThemeContext)
// and isn't transient feedback (that's Toast) — the confirmed appointment,
// a service suggested by another screen (e.g. Diagnóstico), and which
// vehicle in the garage is active, so more than one screen can read and
// react to the same fact.
const AppStateContext = createContext<AppStateValue | null>(null);

const SETTINGS_STORAGE_KEY = 'fordone-settings';

// Mirrors script.js's `settingsState` (Perfil / Configurações modals):
// notification prefs, distance unit, Ford One Intelligence toggles and
// privacy toggles. In the HTML these are one shared, saved object — every
// screen that reads or writes them sees the same values and they persist
// across navigation (and reloads, via localStorage + saveState()/loadState()).
// Building the default from the *Toggles data files keeps a single source
// of truth for the keys/defaults instead of duplicating them here.
function defaultSettingsState(): SettingsState {
  return {
    notifications: Object.fromEntries(notificationPrefsToggles.map((t) => [t.key, t.default])),
    preferences: { unit: 'km' },
    intelligence: Object.fromEntries(intelligenceToggles.map((t) => [t.key, t.default])),
    privacy: Object.fromEntries(privacyToggles.map((t) => [t.key, t.default])),
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [suggestedService, setSuggestedService] = useState<string | null>(null);
  const [suggestedDealer, setSuggestedDealer] = useState<string | null>(null);
  // newVehicleOrderState no site: { vehicleIndex, stage } (stage 0-4) — o
  // pedido em andamento depois de "Solicitar proposta" em Trocar meu Ford,
  // mostrado como card de progresso em Meu Veículo. Cross-screen como o
  // agendamento, então mora aqui também.
  const [newVehicleOrder, setNewVehicleOrder] = useState<NewVehicleOrder | null>(null);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);
  // Alertas dispensados nesta sessão — igual ao `alertsUiState.dismissed`
  // do site: estado global (não só da tela de Alertas), lido por qualquer
  // tela que precise da contagem de alertas *ativos* (ex.: Assistente).
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const dismissAlert = (id: string) => setDismissedAlertIds((prev) => new Set(prev).add(id));
  const restoreDismissedAlerts = () => setDismissedAlertIds(new Set());
  // Plain module-level bindings (vehicle, vehicleHealth, alerts, maintenance)
  // aren't reactive in React on their own, so switching vehicles reassigns
  // them in place (loadVehicleBundleData) and bumps this counter — screens
  // that read live vehicle data subscribe to it via useAppState() to force
  // a re-render, then re-read the (now updated) values.
  const [vehicleVersion, setVehicleVersion] = useState(0);

  // settingsState (Preferências, Privacidade, Ford One Intelligence,
  // Preferências de notificação) — loaded once from AsyncStorage on mount
  // (same fire-and-forget pattern as ThemeContext, but without blocking
  // the first render on it: these toggles don't affect layout/paint the
  // way the theme does, so there's no flash-of-wrong-content to guard).
  const [settings, setSettings] = useState(defaultSettingsState);
  const settingsLoaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSettings((prev) => ({
              notifications: { ...prev.notifications, ...parsed.notifications },
              preferences: { ...prev.preferences, ...parsed.preferences },
              intelligence: { ...prev.intelligence, ...parsed.intelligence },
              privacy: { ...prev.privacy, ...parsed.privacy },
            }));
          } catch (e) { /* malformed storage — keep defaults */ }
        }
        settingsLoaded.current = true;
      })
      .catch(() => { settingsLoaded.current = true; });
  }, []);

  const persistSettings = (next: SettingsState) => {
    AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const updateSettingsGroup = (group: keyof SettingsState, key: string, value: boolean | string) => {
    setSettings((prev) => {
      const next = { ...prev, [group]: { ...prev[group], [key]: value } } as SettingsState;
      persistSettings(next);
      return next;
    });
  };

  const setNotificationPref = (key: string, value: boolean) => updateSettingsGroup('notifications', key, value);
  const setIntelligencePref = (key: string, value: boolean) => updateSettingsGroup('intelligence', key, value);
  const setPrivacyPref = (key: string, value: boolean) => updateSettingsGroup('privacy', key, value);
  const setDistanceUnit = (unit: string) => updateSettingsGroup('preferences', 'unit', unit);

  const switchVehicle = (index: number) => {
    if (index === activeVehicleIndex || !garage[index]) return;
    loadVehicleBundleData(index);
    setActiveVehicleIndex(index);
    setConfirmedAppointment(null);
    setDismissedAlertIds(new Set());
    setVehicleVersion((v) => v + 1);
  };

  return (
    <AppStateContext.Provider
      value={{
        confirmedAppointment, setConfirmedAppointment,
        suggestedService, setSuggestedService,
        suggestedDealer, setSuggestedDealer,
        newVehicleOrder, setNewVehicleOrder,
        activeVehicleIndex, switchVehicle, vehicleVersion,
        dismissedAlertIds, dismissAlert, restoreDismissedAlerts,
        settings, setNotificationPref, setIntelligencePref, setPrivacyPref, setDistanceUnit,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within an AppStateProvider');
  return ctx;
}
