import React, { ReactNode } from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Mirrors the web app's .sheet / .modal-overlay pattern: a dark overlay
// behind a surface sheet with rounded top corners, sliding up from the
// bottom. Used for the garage quick-switch modal and the topbar menu.
export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(8,13,26,0.42)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28,
    maxHeight: '80%',
  },
  handle: { width: 36, height: 4, borderRadius: 999, alignSelf: 'center', marginBottom: 16 },
});
