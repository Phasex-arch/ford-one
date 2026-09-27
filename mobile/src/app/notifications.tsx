import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import Chip from '../components/Chip';
import {
  NOTIFICATION_TYPES, notificationEvents, seedNotificationsIfEmpty, markNotificationRead, deleteNotification,
} from '../constants/data';

const BUCKETS = [['hoje', 'Hoje'], ['semana', 'Esta semana'], ['anteriores', 'Anteriores']];

// openNotificationsFeedModal() no site: feed real (semeado a partir do
// alerta crítico, previsão de revisão e garantia — não uma lista
// inventada), com chips de filtro por tipo e link para as preferências.
export default function NotificationsScreen() {
  const { theme } = useTheme();
  const s = styles(theme);
  seedNotificationsIfEmpty();
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState('todos');

  const usedTypes = useMemo(() => [...new Set(notificationEvents.map((n) => n.type))], [tick]);
  const filtered = filter === 'todos' ? notificationEvents : notificationEvents.filter((n) => n.type === filter);

  const refresh = () => setTick((t) => t + 1);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Tudo que aconteceu recentemente com o seu Ford.</Text>

      <View style={s.filterRow}>
        <Chip label="Todos" selected={filter === 'todos'} onPress={() => setFilter('todos')} />
        {usedTypes.map((t) => (
          <Chip
            key={t}
            label={(NOTIFICATION_TYPES[t] || { label: 'Ford One' }).label}
            selected={filter === t}
            onPress={() => setFilter(t)}
          />
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={[s.emptyBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
          <Text style={s.emptyTitle}>Nenhuma notificação</Text>
          <Text style={s.emptyDesc}>
            {filter === 'todos' ? 'Você está em dia — avisaremos quando houver novidades.' : 'Nenhuma notificação nessa categoria.'}
          </Text>
        </View>
      ) : (
        BUCKETS.map(([key, label]) => {
          const items = filtered.filter((n) => n.bucket === key);
          if (items.length === 0) return null;
          return (
            <View key={key} style={{ marginBottom: 14 }}>
              <Text style={s.bucketLabel}>{label}</Text>
              <View style={[s.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
                {items.map((n, i) => {
                  const typeInfo = NOTIFICATION_TYPES[n.type] || { label: 'Ford One', icon: 'bell' as const };
                  return (
                    <View
                      key={n.id}
                      style={[s.row, i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }, n.read && { opacity: 0.55 }]}
                    >
                      <View style={[s.iconWrap, { backgroundColor: theme.colors.accentSoft }]}>
                        <Icon name={typeInfo.icon} size={16} color={theme.colors.accent} />
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[s.text, !n.read && { fontWeight: '700', color: theme.colors.textPrimary }]}>{n.text}</Text>
                        <Text style={s.typeLabel}>{typeInfo.label}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        {!n.read && (
                          <Pressable onPress={() => { markNotificationRead(n.id); refresh(); }}>
                            <Text style={s.actionText}>Marcar como lida</Text>
                          </Pressable>
                        )}
                        <Pressable onPress={() => { deleteNotification(n.id); refresh(); }}>
                          <Text style={[s.actionText, { color: theme.colors.danger }]}>Excluir</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })
      )}

      <Pressable style={s.prefsBtn} onPress={() => router.push('/notificationPrefs')}>
        <Text style={[s.prefsBtnText, { color: theme.colors.textPrimary }]}>Preferências de notificação</Text>
        <Icon name="chevron" size={18} color={theme.colors.textTertiary} />
      </Pressable>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  bucketLabel: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textTertiary, marginBottom: 8 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  text: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  typeLabel: { fontSize: 10.5, color: theme.colors.textTertiary, marginTop: 3 },
  actionText: { fontSize: 11.5, fontWeight: '600', color: theme.colors.accent },
  emptyBox: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 14.5, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 12.5, color: theme.colors.textSecondary, textAlign: 'center' },
  prefsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, marginTop: 6 },
  prefsBtnText: { fontSize: 13.5, fontWeight: '700' },
});
