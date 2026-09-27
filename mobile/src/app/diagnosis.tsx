import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, TextInput, ActivityIndicator, StyleSheet, Animated, Easing } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { boxShadow } from '../styles/theme';
import { useToast } from '../components/Toast';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Badge from '../components/Badge';
import SystemDetailSheet from '../components/SystemDetailSheet';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { diagnosisSymptoms, analyzeDiagnosis, vehicleHealth } from '../constants/data';
import type { VehicleSystem } from '../types';

const METHODS: [string, string][] = [['describe', 'Descrever'], ['photo', 'Foto'], ['audio', 'Áudio']];

// Waveform de 14 barras com delay escalonado — igual ao `.audio-waveform`
// do site (14 <span> com animation-delay em `(i%7)*0.09s`).
function AudioWaveform({ color }: { color: string }) {
  const anims = useRef(Array.from({ length: 14 }, () => new Animated.Value(0.35))).current;
  useEffect(() => {
    const loops = anims.map((v, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay((i % 7) * 90),
          Animated.timing(v, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.35, duration: 260, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ]),
      );
      loop.start();
      return loop;
    });
    return () => loops.forEach((l) => l.stop());
  }, [anims]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, height: 36 }}>
      {anims.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width: 4, borderRadius: 2, backgroundColor: color,
            height: v.interpolate({ inputRange: [0.35, 1], outputRange: [8, 32] }),
          }}
        />
      ))}
    </View>
  );
}

export default function DiagnosisScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const { setSuggestedService } = useAppState();
  const s = styles(theme);

  const [method, setMethod] = useState('describe');
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof analyzeDiagnosis> | null>(null);
  const [detailSystem, setDetailSystem] = useState<VehicleSystem | null>(null);

  // Foto — igual ao diagPanelPhoto do site: seleciona/mostra prévia, depois
  // "Analisar foto" roda a análise simulada ("Analisando imagem...").
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [photoResult, setPhotoResult] = useState<{ text: string; confidence: string; factors: string } | null>(null);

  // Áudio — igual ao diagPanelAudio: "Gravar" mostra a waveform animada por
  // ~2.4s ("Gravando..."), depois "Analisando padrão sonoro..." por ~0.9s.
  const [audioStep, setAudioStep] = useState<'idle' | 'recording' | 'analyzing'>('idle');
  const [audioResult, setAudioResult] = useState<{ text: string; confidence: string; factors: string } | null>(null);
  const audioTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => audioTimers.current.forEach(clearTimeout), []);

  const switchMethod = (key: string) => {
    setMethod(key);
    setResult(null);
    setPhotoUri(null);
    setPhotoAnalyzing(false);
    setPhotoResult(null);
    audioTimers.current.forEach(clearTimeout);
    audioTimers.current = [];
    setAudioStep('idle');
    setAudioResult(null);
  };

  const toggleSymptom = (symptom: string) => {
    setResult(null);
    setSelected((prev) => (prev.includes(symptom) ? prev.filter((s2) => s2 !== symptom) : [...prev, symptom]));
  };

  const runAnalysis = (symptoms: string[]) => {
    if (symptoms.length === 0) {
      showToast('Selecione ao menos um sintoma');
      return;
    }
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setLoading(false);
      setResult(analyzeDiagnosis(symptoms));
    }, 1200);
  };

  // "Selecionar foto" — abre a galeria real do dispositivo (ou, na web, o
  // seletor de arquivo do navegador, que é exatamente o que o site faz com
  // <input type="file" accept="image/*">). A análise que roda depois
  // continua simulada, igual ao script.js — só a seleção da imagem é real.
  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permita o acesso às fotos para selecionar uma imagem');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled || !result.assets || !result.assets[0]) return;
      setPhotoResult(null);
      setPhotoUri(result.assets[0].uri);
    } catch {
      showToast('Não foi possível abrir a galeria de fotos');
    }
  };

  const analyzePhoto = () => {
    setPhotoAnalyzing(true);
    setTimeout(() => {
      const pneus = vehicleHealth.systems.find((sy) => sy.id === 'pneus')!;
      setPhotoAnalyzing(false);
      setPhotoResult({
        text: `Símbolo identificado: pressão dos pneus. Um ou mais pneus podem estar abaixo da pressão recomendada. Dados do veículo: ${pneus.note}`,
        confidence: '76%',
        factors: '3',
      });
    }, 900);
  };

  const startRecording = () => {
    setAudioResult(null);
    setAudioStep('recording');
    const t1 = setTimeout(() => {
      setAudioStep('analyzing');
      const t2 = setTimeout(() => {
        const freios = vehicleHealth.systems.find((sy) => sy.id === 'freios')!;
        setAudioStep('idle');
        setAudioResult({
          text: `Possível origem: sistema de freios. ${freios.note} Recomendamos inspeção.`,
          confidence: '76%',
          factors: '2',
        });
      }, 900);
      audioTimers.current.push(t2);
    }, 2400);
    audioTimers.current.push(t1);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Conte o que você percebeu no seu veículo para uma orientação inicial.</Text>
      <Card>
        <Text style={s.label}>Como deseja informar o problema?</Text>
        <View style={[s.tabRow, { backgroundColor: theme.colors.surfaceSunken }]}>
          {METHODS.map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => switchMethod(key)}
              style={[
                s.tabBtn,
                method === key && { backgroundColor: theme.colors.surface, ...boxShadow('#0F1932', 0.06, 3, 1) },
              ]}
            >
              <Text style={[s.tabText, { color: method === key ? theme.colors.textPrimary : theme.colors.textSecondary }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {method === 'describe' && (
          <>
            <Text style={[s.label, { marginTop: 6 }]}>O que você percebeu?</Text>
            <View style={s.chipWrap}>
              {diagnosisSymptoms.map((sym) => (
                <Chip key={sym} label={sym} selected={selected.includes(sym)} onPress={() => toggleSymptom(sym)} />
              ))}
            </View>
            <Text style={[s.label, { marginTop: 10 }]}>Descreva com mais detalhes (opcional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: o barulho aparece ao frear em baixa velocidade..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              style={[s.textarea, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
            />
            <Pressable style={[s.analyzeBtn, { backgroundColor: theme.colors.navy950 }]} onPress={() => runAnalysis(selected)}>
              <Text style={s.analyzeBtnText}>Analisar com Ford One Intelligence</Text>
            </Pressable>
          </>
        )}

        {method === 'photo' && (
          <View>
            <Text style={s.mediaIntro}>Fotografe a luz do painel ou a área do problema — a Ford One Intelligence analisa a imagem para te ajudar a entender o que pode ser.</Text>
            {!photoUri ? (
              <Pressable style={[s.secondaryBtn, { borderColor: theme.colors.border }]} onPress={pickPhoto}>
                <Text style={[s.secondaryBtnText, { color: theme.colors.textPrimary }]}>Selecionar foto</Text>
              </Pressable>
            ) : (
              <View>
                <Image source={{ uri: photoUri }} style={[s.photoPreview, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border }]} resizeMode="cover" />
                <Pressable
                  style={[s.analyzeBtn, { backgroundColor: theme.colors.navy950, marginTop: 12 }, photoAnalyzing && { opacity: 0.6 }]}
                  onPress={analyzePhoto}
                  disabled={photoAnalyzing}
                >
                  <Text style={s.analyzeBtnText}>Analisar foto</Text>
                </Pressable>
                {photoAnalyzing && <Text style={[s.mediaText, { marginTop: 10 }]}>Analisando imagem...</Text>}
              </View>
            )}
          </View>
        )}

        {method === 'audio' && (
          <View>
            <Text style={s.mediaIntro}>Grave aproximadamente 10 segundos do barulho — a Ford One Intelligence analisa o padrão sonoro.</Text>
            {audioStep === 'idle' ? (
              <Pressable style={[s.analyzeBtn, { backgroundColor: theme.colors.navy950 }]} onPress={startRecording}>
                <Text style={s.analyzeBtnText}>Gravar</Text>
              </Pressable>
            ) : (
              <View style={{ alignItems: 'center', marginTop: 4 }}>
                <AudioWaveform color={theme.colors.accent} />
                <Text style={[s.mediaText, { marginTop: 10 }]}>{audioStep === 'recording' ? 'Gravando...' : 'Analisando padrão sonoro...'}</Text>
              </View>
            )}
          </View>
        )}
      </Card>

      {loading && (
        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={[s.mediaText, { marginTop: 10 }]}>Analisando com Ford One Intelligence...</Text>
        </Card>
      )}

      {result && !loading && (
        <Card>
          <View style={s.resultHeader}>
            <View style={[s.resultIcon, { backgroundColor: theme.colors.accentSoft }]}>
              <Icon name="spark" size={18} color={theme.colors.accent} />
            </View>
            <Text style={s.resultTitle}>{result.title}</Text>
          </View>
          <Text style={s.resultText}>{result.text}</Text>
          <Badge label={`Confiança: ${result.confidence}`} tone={result.confidence === 'Alta' ? 'success' : result.confidence === 'Média' ? 'warning' : 'neutral'} style={{ marginTop: 10 }} />
          <Pressable
            style={[s.analyzeBtn, { backgroundColor: theme.colors.navy950, marginTop: 14 }]}
            onPress={() => { setSuggestedService(result.action); showToast(`Abrindo agendamento: ${result.action}`); router.push('/scheduling'); }}
          >
            <Text style={s.analyzeBtnText}>Agendar: {result.action}</Text>
          </Pressable>
        </Card>
      )}

      {/* Resultado da análise de foto — mesmo padrão visual "Ford One
          Intelligence" (intel-card) do site, com Confiança/Fatores considerados. */}
      {photoResult && (
        <View style={[s.intelCard, { backgroundColor: theme.colors.navy950 }]}>
          <View style={s.intelHead}>
            <View style={s.intelMark}><Icon name="spark" size={13} color="#A8B2FF" /></View>
            <Text style={s.intelLabel}>Ford One Intelligence</Text>
          </View>
          <Text style={s.intelTitle}>Análise da foto</Text>
          <Text style={s.intelText}>{photoResult.text}</Text>
          <View style={s.intelMetaRow}>
            <View>
              <Text style={s.intelMetaLabel}>Confiança</Text>
              <Text style={s.intelMetaValue}>{photoResult.confidence}</Text>
            </View>
            <View>
              <Text style={s.intelMetaLabel}>Fatores considerados</Text>
              <Text style={s.intelMetaValue}>{photoResult.factors}</Text>
            </View>
          </View>
          <View style={s.intelActionsRow}>
            <Pressable style={s.intelBtnOutline} onPress={() => setDetailSystem(vehicleHealth.systems.find((sy) => sy.id === 'pneus') || null)}>
              <Text style={s.intelBtnOutlineText}>Ver pneus</Text>
            </Pressable>
            <Pressable style={s.intelBtnFilled} onPress={() => showToast('Calibre os pneus na pressão indicada na coluna da porta do motorista')}>
              <Text style={s.intelBtnFilledText}>Como resolver</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Resultado da análise de áudio */}
      {audioResult && (
        <View style={[s.intelCard, { backgroundColor: theme.colors.navy950 }]}>
          <View style={s.intelHead}>
            <View style={s.intelMark}><Icon name="spark" size={13} color="#A8B2FF" /></View>
            <Text style={s.intelLabel}>Ford One Intelligence</Text>
          </View>
          <Text style={s.intelTitle}>Análise do áudio</Text>
          <Text style={s.intelText}>{audioResult.text}</Text>
          <View style={s.intelMetaRow}>
            <View>
              <Text style={s.intelMetaLabel}>Confiança</Text>
              <Text style={s.intelMetaValue}>{audioResult.confidence}</Text>
            </View>
            <View>
              <Text style={s.intelMetaLabel}>Fatores considerados</Text>
              <Text style={s.intelMetaValue}>{audioResult.factors}</Text>
            </View>
          </View>
          <View style={s.intelActionsRow}>
            <Pressable
              style={s.intelBtnFilled}
              onPress={() => { setSuggestedService('Verificação de freios'); router.push('/scheduling'); }}
            >
              <Text style={s.intelBtnFilledText}>Agendar verificação</Text>
            </Pressable>
          </View>
        </View>
      )}

      <SystemDetailSheet system={detailSystem} onClose={() => setDetailSystem(null)} />
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  label: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 10 },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 16, padding: 4, borderRadius: 999, alignSelf: 'flex-start' },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  textarea: {
    borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 13.5, minHeight: 80,
    textAlignVertical: 'top',
  },
  analyzeBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  analyzeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  mediaBox: { alignItems: 'center', paddingVertical: 16 },
  mediaText: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 19 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  resultTitle: { flex: 1, fontSize: 14.5, fontWeight: '800', color: theme.colors.textPrimary },
  resultText: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19 },
  mediaIntro: { fontSize: 12.5, color: theme.colors.textSecondary, lineHeight: 19, marginBottom: 14 },
  secondaryBtn: {
    flexDirection: 'row', borderWidth: 1, borderRadius: 999, paddingVertical: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 13.5, fontWeight: '700' },
  photoPreview: {
    height: 160, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  // Ford One Intelligence card — mesmo padrão visual usado em keepOrTrade.js/home.
  intelCard: { borderRadius: 22, padding: 18, marginBottom: 12 },
  intelHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 },
  intelMark: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(107,120,255,.4)', backgroundColor: 'rgba(107,120,255,.14)',
  },
  intelLabel: { fontSize: 12, fontWeight: '700', color: '#C4CAF2' },
  intelTitle: { fontSize: 14.5, fontWeight: '800', color: '#fff', marginBottom: 6 },
  intelText: { fontSize: 13.5, lineHeight: 20, color: '#ECEEFC' },
  intelMetaRow: {
    flexDirection: 'row', gap: 22, marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.12)',
  },
  intelMetaLabel: { fontSize: 11, color: '#9BA3E5' },
  intelMetaValue: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 2 },
  intelActionsRow: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  intelBtnOutline: { borderWidth: 1, borderColor: 'rgba(255,255,255,.28)', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  intelBtnOutlineText: { fontSize: 12.5, fontWeight: '700', color: '#ECEEFC' },
  intelBtnFilled: { backgroundColor: '#fff', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  intelBtnFilledText: { fontSize: 12.5, fontWeight: '700', color: '#00095B' },
});
