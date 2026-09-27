import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// A tiny in-app toast, used instead of Alert.alert() because Alert.alert()
// is a no-op on React Native Web — this works identically on web, iOS and
// Android, and (importantly) can be verified in a browser-based test.
const ToastContext = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2400);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {message && (
        <View style={styles.wrap}>
          <View style={[styles.toast, { backgroundColor: theme.colors.navy950 }]}>
            <Text style={styles.text}>{message}</Text>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  // `pointerEvents` as a JSX prop is deprecated on RN Web ("Use
  // style.pointerEvents"); set here in the style object instead.
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 76, alignItems: 'center', pointerEvents: 'none' },
  toast: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, maxWidth: '100%' },
  text: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
