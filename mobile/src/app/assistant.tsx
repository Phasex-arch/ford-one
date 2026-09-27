import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import SystemDetailSheet from '../components/SystemDetailSheet';
import TripChecklistSheet from '../components/TripChecklistSheet';
import { useToast } from '../components/Toast';
import {
  getAssistantSuggestions, getAssistantReply, vehicleHealth, dealershipDetails, pushNotification,
  user, vehicle,
} from '../constants/data';
import type { AssistantAction } from '../constants/data/assistant';
import type { VehicleSystem } from '../types';

interface ChatMessage {
  id: number;
  from: 'ai' | 'user';
  text: string;
  actions: AssistantAction[];
}

export default function AssistantScreen() {
  const { theme } = useTheme();
  const { setSuggestedService, setConfirmedAppointment, dismissedAlertIds, vehicleVersion } = useAppState();
  void vehicleVersion; // subscribe so this screen re-renders on vehicle switch
  const showToast = useToast();
  const s = styles(theme);
  const scrollRef = useRef<ScrollView>(null);
  const [detailSystem, setDetailSystem] = useState<VehicleSystem | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const assistantSuggestions = getAssistantSuggestions(dismissedAlertIds);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, from: 'ai', text: `Oi, ${user.name}! Sou a Ford One Intelligence do seu ${vehicle.name}. Posso te ajudar a entender a saúde do carro, alertas, manutenções, custos e muito mais. O que você quer saber?`, actions: [] },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: Date.now(), from: 'user', text: trimmed, actions: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const reply = getAssistantReply(trimmed, dismissedAlertIds);
      const aiMsg: ChatMessage = { id: Date.now() + 1, from: 'ai', text: reply.text, actions: reply.actions || [] };
      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 700);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const runAction = (act: AssistantAction) => {
    if (!act) return;
    if (act.kind === 'page') router.push(`/${act.page}` as Parameters<typeof router.push>[0]);
    else if (act.kind === 'system') {
      const sys = vehicleHealth.systems.find((sy) => sy.id === act.system);
      if (sys) setDetailSystem(sys);
    } else if (act.kind === 'schedule') {
      setSuggestedService(act.service || null);
      router.push('/scheduling');
    } else if (act.kind === 'trip-checklist') {
      setChecklistOpen(true);
    } else if (act.kind === 'confirm-appt') {
      const dealer = dealershipDetails[act.dealerIndex!];
      setConfirmedAppointment({ service: act.service!, dealer: dealer.name, dateLabel: act.dateLabel!, time: act.time! });
      const aiMsg: ChatMessage = {
        id: Date.now() + 2, from: 'ai',
        text: `Prontinho! ${act.service} confirmada para ${act.dateLabel} às ${act.time} na ${dealer.name}.`,
        actions: [{ label: 'Ver agendamento', kind: 'page', page: 'scheduling' }],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      pushNotification(`Agendamento confirmado: ${act.service} em ${act.dateLabel} às ${act.time}.`, 'concessionaria' as const);
      showToast('Agendamento confirmado com sucesso');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={[s.pageSub, { color: theme.colors.textSecondary }]}>Pergunte qualquer coisa sobre o seu Ford — a gente te ajuda a entender.</Text>
      <ScrollView ref={scrollRef} contentContainerStyle={s.messages} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
        {messages.map((m) => (
          <View key={m.id} style={[s.bubbleRow, m.from === 'user' && s.bubbleRowUser]}>
            {m.from === 'ai' && (
              <View style={[s.aiIcon, { backgroundColor: theme.colors.accentSoft }]}>
                <Icon name="spark" size={14} color={theme.colors.accent} />
              </View>
            )}
            <View style={{ flexShrink: 1, maxWidth: '100%' }}>
              <View style={[
                s.bubble,
                m.from === 'user'
                  ? { backgroundColor: theme.colors.navy950, borderBottomRightRadius: 4 }
                  : { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.colors.borderSoft },
              ]}>
                <Text style={[s.bubbleText, { color: m.from === 'user' ? '#fff' : theme.colors.textPrimary }]}>{m.text}</Text>
              </View>
              {m.actions && m.actions.length > 0 && (
                <View style={s.msgActions}>
                  {m.actions.map((act, i) => (
                    <Pressable key={i} style={[s.msgActionBtn, { borderColor: theme.colors.border }]} onPress={() => runAction(act)}>
                      <Text style={[s.msgActionText, { color: theme.colors.textPrimary }]}>{act.label}</Text>
                      <Icon name="chevron" size={13} color={theme.colors.textPrimary} />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {messages.length < 3 && (
        <View style={s.suggestionsRow}>
          {assistantSuggestions.map((sug) => (
            <Pressable key={sug} onPress={() => send(sug)} style={[s.suggestionChip, { borderColor: theme.colors.border }]}>
              <Text style={[s.suggestionText, { color: theme.colors.textSecondary }]}>{sug}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={[s.inputRow, { borderTopColor: theme.colors.borderSoft, backgroundColor: theme.colors.surface }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escreva sua pergunta..."
          placeholderTextColor={theme.colors.textTertiary}
          style={[s.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable style={[s.sendBtn, { backgroundColor: theme.colors.navy950 }]} onPress={() => send(input)}>
          <Icon name="send" size={18} color="#fff" />
        </Pressable>
      </View>
      <SystemDetailSheet system={detailSystem} onClose={() => setDetailSystem(null)} />
      <TripChecklistSheet visible={checklistOpen} onClose={() => setChecklistOpen(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  pageSub: { fontSize: 13, paddingHorizontal: 16, paddingTop: 12 },
  messages: { padding: 16, paddingBottom: 8 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, maxWidth: '90%' },
  bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11, flexShrink: 1 },
  bubbleText: { fontSize: 13.5, lineHeight: 19 },
  msgActions: { marginTop: 6, gap: 6 },
  msgActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1.5, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14, alignSelf: 'flex-start' },
  msgActionText: { fontSize: 12, fontWeight: '700' },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  suggestionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  suggestionText: { fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, gap: 10 },
  input: { flex: 1, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13.5 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
