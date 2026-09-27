import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../components/Toast';
import Card from '../../components/Card';
import Row from '../../components/Row';
import Badge from '../../components/Badge';
import Chip from '../../components/Chip';
import ProgressBar from '../../components/ProgressBar';
import GaugeRing from '../../components/GaugeRing';
import TopBar from '../../components/TopBar';
import VehicleHeroArt from '../../components/VehicleHeroArt';
import PageHead from '../../components/PageHead';
import GarageSwitcherSheet from '../../components/GarageSwitcherSheet';
import BottomSheet from '../../components/BottomSheet';
import {
  vehicle, getSpecFields, warrantyCoverage, getWarrantyRemaining,
  emergencyOptions, ecoScore, trips, documents, daysUntil, softwareInfo,
  newFordLineup,
} from '../../constants/data';
import type { Trip } from '../../constants/data/vehicleScreen';

const ORDER_STAGES = ['Pedido confirmado', 'Produção', 'Transporte', 'Concessionária', 'Pronto para retirada'];

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 12 }}>{children}</Text>;
}

export default function VehicleScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const { vehicleVersion, newVehicleOrder, setNewVehicleOrder } = useAppState();
  const [updating, setUpdating] = useState(false);
  const [garageOpen, setGarageOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [openTrip, setOpenTrip] = useState<Trip | null>(null);
  // "Software do veículo" — mesma simulação de instalação do site
  // (softwareState.installing + setTimeout de ~2.6s até concluir),
  // não apenas um toast direto de "agendado".
  const [swInstalling, setSwInstalling] = useState(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(softwareInfo.updateAvailable);
  const [swVersion, setSwVersion] = useState(softwareInfo.version);
  const installTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (installTimeoutRef.current) clearTimeout(installTimeoutRef.current); }, []);
  const s = styles(theme);
  const specFields = getSpecFields();
  // vehicleVersion isn't read directly below, but subscribing to it forces
  // this screen to re-render (and re-read the live `vehicle`/spec values)
  // whenever switchVehicle() reassigns them.
  void vehicleVersion;

  const handleRefreshLocation = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      showToast('Localização atualizada');
    }, 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar />
      <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <PageHead eyebrow="Garagem digital" title="Meu Veículo" sub="Todas as informações e características do seu Ford em um só lugar." />
      {/* Hero */}
      <View style={[s.hero, { backgroundColor: theme.colors.navy950 }]}>
        <View style={s.heroEyebrowRow}>
          <Text style={s.heroEyebrow}>{vehicle.year}</Text>
          <Pressable style={s.heroSwitchBtn} onPress={() => setGarageOpen(true)}>
            <Text style={s.heroSwitchText}>Trocar veículo</Text>
          </Pressable>
        </View>
        <Text style={s.heroName}>{vehicle.name}</Text>
        <Text style={s.heroTrim}>{vehicle.trim}</Text>
        <Text style={s.heroMeta}>{vehicle.plate}  •  {vehicle.color}</Text>
        {vehicle.connected && (
          <View style={s.connectedRow}>
            <View style={s.connectedDot} />
            <Text style={s.connectedText}>Veículo conectado</Text>
          </View>
        )}
        <View style={s.heroArtWrap}>
          <VehicleHeroArt photoKey={vehicle.photo as 'maverick' | 'ranger' | 'mache'} size={110} />
        </View>
      </View>

      <GarageSwitcherSheet visible={garageOpen} onClose={() => setGarageOpen(false)} />

      {/* Ficha técnica */}
      <Card>
        <SectionTitle>Ficha técnica</SectionTitle>
        {specFields.map(([label, value], i) => (
          <Row key={label} label={label} value={value} last={i === specFields.length - 1} />
        ))}
      </Card>

      {/* Quick stats */}
      <View style={s.statsRow}>
        <Card style={s.statTile}>
          <Text style={s.statLabel}>Quilometragem</Text>
          <Text style={s.statValue}>{vehicle.km.toLocaleString('pt-BR')} km</Text>
        </Card>
        <Card style={s.statTile}>
          <Text style={s.statLabel}>Última revisão</Text>
          <Text style={s.statValueSmall}>{vehicle.lastService}</Text>
        </Card>
        <Card style={s.statTile}>
          <Text style={s.statLabel}>Valor estimado</Text>
          <Text style={s.statValueSmall}>R$ {vehicle.estimatedValue.toLocaleString('pt-BR')}</Text>
        </Card>
      </View>

      {/* Software do veículo */}
      <Card>
        <View style={s.sectionTitleRow}>
          <SectionTitle>Software do veículo</SectionTitle>
          <Badge
            label={swInstalling ? 'Instalando' : swUpdateAvailable ? 'Atualização disponível' : 'Atualizado'}
            tone={swUpdateAvailable ? 'warning' : 'success'}
          />
        </View>
        <Row label="Versão atual" value={`Ford One Vehicle OS v${swVersion}`} />
        <Row label="Última atualização" value={softwareInfo.lastUpdate} last={!(swUpdateAvailable || swInstalling)} />
        {swUpdateAvailable && !swInstalling && (
          <>
            <Text style={[s.rowSub, { marginTop: 12 }]}>
              Nova versão disponível: <Text style={s.bold}>v{softwareInfo.newVersion}</Text>
            </Text>
            <View style={s.buttonRow}>
              <Pressable style={[s.secondaryBtn, { borderColor: theme.colors.border }]} onPress={() => setReleaseNotesOpen(true)}>
                <Text style={s.secondaryBtnText}>Ver novidades</Text>
              </Pressable>
              <Pressable
                style={[s.secondaryBtn, s.primaryBtn, { backgroundColor: theme.colors.accent }]}
                onPress={() => {
                  setSwInstalling(true);
                  showToast('Atualização agendada — instalação iniciada');
                  installTimeoutRef.current = setTimeout(() => {
                    setSwInstalling(false);
                    setSwUpdateAvailable(false);
                    setSwVersion(softwareInfo.newVersion);
                    showToast(`Ford One Vehicle OS v${softwareInfo.newVersion} instalado`);
                  }, 2600);
                }}
              >
                <Text style={[s.secondaryBtnText, { color: '#fff' }]}>Agendar atualização</Text>
              </Pressable>
            </View>
          </>
        )}
        {swInstalling && (
          <Text style={[s.rowSub, { marginTop: 12 }]}>
            Instalando v{softwareInfo.newVersion}... isso pode levar alguns minutos.
          </Text>
        )}
      </Card>

      <BottomSheet visible={releaseNotesOpen} onClose={() => setReleaseNotesOpen(false)}>
        <Text style={s.sheetTitle}>Novidades da v{softwareInfo.newVersion}</Text>
        {softwareInfo.releaseNotes.map((note) => (
          <View key={note} style={s.noteRow}>
            <Icon name="check" size={15} color={theme.colors.success} style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={s.noteText}>{note}</Text>
          </View>
        ))}
      </BottomSheet>

      {/* Garantia Ford */}
      <Card>
        <SectionTitle>Garantia Ford</SectionTitle>
        <Text style={s.rowSub}>
          Cobertura até <Text style={s.bold}>{vehicle.warrantyUntil}</Text> · {getWarrantyRemaining()} restantes.
        </Text>
        <View style={s.chipWrap}>
          {warrantyCoverage.map((item) => <Badge key={item} label={item} tone="neutral" style={{ marginRight: 8, marginBottom: 8 }} />)}
        </View>
        <Pressable style={s.footLinkRow} onPress={() => showToast('Consulte a cobertura completa com sua concessionária.')}>
          <Text style={s.footLinkText}>Consultar cobertura</Text>
          <Icon name="chevron" size={14} color={theme.colors.accent} />
        </Pressable>
      </Card>

      {/* Onde está meu Ford */}
      <Card>
        <SectionTitle>Onde está meu Ford?</SectionTitle>
        <View style={[s.mapBox, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.borderSoft }]}>
          <Icon name="pin" size={22} color={theme.colors.accent} />
          <Text style={s.mapLabel}>{vehicle.name}</Text>
        </View>
        <Row label="Local" value={vehicle.parkedAddress} />
        <Row label="Estacionado há" value={`${vehicle.parkedSince} · ${vehicle.parkedDistance} de você`} />
        <Row label="Última atualização" value={updating ? 'Atualizando...' : 'Agora'} last />
        <View style={s.buttonRow}>
          <Pressable
            style={[s.secondaryBtn, { borderColor: theme.colors.border }]}
            onPress={() => showToast(`Abrindo rota até ${vehicle.parkedAddress}...`)}
          >
            <Text style={s.secondaryBtnText}>Como chegar</Text>
          </Pressable>
          <Pressable style={[s.secondaryBtn, { borderColor: theme.colors.border }]} onPress={handleRefreshLocation}>
            <Text style={s.secondaryBtnText}>{updating ? 'Atualizando...' : 'Atualizar localização'}</Text>
          </Pressable>
        </View>
      </Card>

      {/* Assistência 24h */}
      <Card>
        <SectionTitle>Assistência Ford 24h</SectionTitle>
        <Text style={[s.rowSub, { marginBottom: 10 }]}>Precisa de ajuda agora? Escolha o que aconteceu.</Text>
        <View style={s.chipWrap}>
          {emergencyOptions.map((opt) => (
            <Chip key={opt} label={opt} onPress={() => showToast(`Solicitação enviada: ${opt}`)} />
          ))}
        </View>
      </Card>

      {/* Ford Eco Score */}
      <Card>
        <SectionTitle>Ford Eco Score</SectionTitle>
        <View style={s.ecoHeaderRow}>
          <GaugeRing value={ecoScore.score} size={88} strokeWidth={8} />
          <Text style={[s.rowSub, { flex: 1, minWidth: 180 }]}>
            Você melhorou {Math.round(((ecoScore.score - ecoScore.previousScore) / ecoScore.previousScore) * 100)}% em relação ao mês passado.
          </Text>
        </View>
        {ecoScore.indicators.map((ind) => (
          <View key={ind.label} style={{ marginBottom: 12 }}>
            <View style={s.ecoRow}>
              <Text style={s.ecoLabel}>{ind.label}</Text>
              <Text style={s.ecoValue}>{ind.value}%</Text>
            </View>
            <ProgressBar value={ind.value} />
          </View>
        ))}
      </Card>

      {/* Minhas viagens */}
      <Card style={{ padding: 0 }}>
        <Text style={[s.sectionTitle, { marginHorizontal: 20, marginTop: 20, marginBottom: 12 }]}>Minhas viagens</Text>
        {trips.map((t, i) => (
          <Pressable
            key={t.origin + t.date + i}
            onPress={() => setOpenTrip(t)}
            style={[s.tripRow, i < trips.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}
          >
            <View style={[s.rowIcon, { backgroundColor: theme.colors.accentSoft }]}>
              <Icon name="pin" size={16} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.tripTitle}>{t.origin} → {t.destination}</Text>
              <Text style={s.tripSub}>{t.date} · {t.distance} · {t.duration}</Text>
            </View>
            <Badge label={`Eco ${t.ecoScore}`} tone={t.ecoScore >= 85 ? 'success' : 'neutral'} style={{ marginRight: 8 }} />
            <Icon name="chevron" size={18} color={theme.colors.textTertiary} />
          </Pressable>
        ))}
      </Card>

      <BottomSheet visible={!!openTrip} onClose={() => setOpenTrip(null)}>
        {openTrip && (
          <>
            <View style={[s.rowIcon, { backgroundColor: theme.colors.accentSoft, marginBottom: 14 }]}>
              <Icon name="pin" size={18} color={theme.colors.accent} />
            </View>
            <Text style={s.sheetTitle}>{openTrip.origin} → {openTrip.destination}</Text>
            <Text style={[s.rowSub, { marginBottom: 16 }]}>{openTrip.date} · {openTrip.route}</Text>
            <Row label="Distância" value={openTrip.distance} />
            <Row label="Duração" value={openTrip.duration} />
            <Row label="Velocidade média" value={openTrip.avgSpeed} />
            <Row label="Consumo médio" value={openTrip.consumption} />
            <Row label="Eco Score da viagem" value={String(openTrip.ecoScore)} last />
          </>
        )}
      </BottomSheet>

      {/* Documentos */}
      <Card style={{ padding: 0 }}>
        <Text style={[s.sectionTitle, { marginHorizontal: 20, marginTop: 20, marginBottom: 12 }]}>Documentos</Text>
        {documents.map((doc, i) => {
          const days = doc.validUntil ? daysUntil(doc.validUntil) : null;
          const expiringSoon = days !== null && days <= 45 && days >= 0;
          return (
            <Pressable
              key={doc.name}
              onPress={() => showToast(`Abrindo ${doc.name}...`)}
              style={[s.tripRow, i < documents.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft }]}
            >
              <View style={[s.rowIcon, { backgroundColor: expiringSoon ? theme.colors.warningBg : theme.colors.accentSoft }]}>
                <Icon name="history" size={16} color={expiringSoon ? theme.colors.warning : theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.tripTitle}>{doc.name}</Text>
                {doc.validUntil && (
                  <Text style={s.tripSub}>Válido até {doc.validUntil}{expiringSoon ? ` · vence em ${days} dias` : ''}</Text>
                )}
              </View>
              <Badge
                label={expiringSoon ? 'Vence em breve' : doc.status}
                tone={expiringSoon ? 'warning' : (doc.status === 'Ativo' ? 'success' : 'neutral')}
                style={{ marginRight: 8 }}
              />
              <Icon name="chevron" size={18} color={theme.colors.textTertiary} />
            </Pressable>
          );
        })}
      </Card>

      {/* Meu novo Ford — newVehicleOrderState no site: aparece depois de
          "Solicitar proposta" em Trocar meu Ford. */}
      {newVehicleOrder && (() => {
        const orderVehicle = newFordLineup.find((v) => v.id === newVehicleOrder.vehicleId);
        const stage = newVehicleOrder.stage;
        return (
          <Card>
            <Text style={s.sectionTitle}>Meu novo Ford</Text>
            <Text style={[s.rowSub, { marginTop: 6, marginBottom: 14 }]}>{orderVehicle ? orderVehicle.name : 'Pedido em andamento'}</Text>
            <View style={s.orderTracker}>
              {ORDER_STAGES.map((label, i) => {
                const done = i < stage;
                const current = i === stage;
                return (
                  <View key={label} style={s.orderStage}>
                    <View style={[
                      s.orderDot,
                      { borderColor: theme.colors.border },
                      done && { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
                      current && { borderColor: theme.colors.accent, borderWidth: 2 },
                    ]}>
                      {done && <Icon name="check" size={11} color="#fff" />}
                    </View>
                    <Text style={s.orderStageLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
            {stage < 4 ? (
              <Pressable
                style={[s.secondaryBtn, { borderColor: theme.colors.border, marginTop: 16 }]}
                onPress={() => setNewVehicleOrder((prev) => (prev ? { ...prev, stage: Math.min(4, prev.stage + 1) } : prev))}
              >
                <Text style={s.secondaryBtnText}>Avançar etapa (simular)</Text>
              </Pressable>
            ) : (
              <Text style={[s.rowSub, { marginTop: 14, color: theme.colors.success, fontWeight: '700' }]}>Seu novo Ford está pronto para retirada!</Text>
            )}
            <Pressable
              style={{ marginTop: 10, alignItems: 'center' }}
              onPress={() => { setNewVehicleOrder(null); showToast('Pedido cancelado'); }}
            >
              <Text style={[s.cancelOrderText, { color: theme.colors.textSecondary }]}>Cancelar pedido</Text>
            </Pressable>
          </Card>
        );
      })()}
      </ScrollView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  hero: { borderRadius: 28, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 4, marginBottom: 12 },
  heroEyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  heroEyebrow: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.4, color: '#9BA3E5' },
  heroSwitchBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12,
  },
  heroSwitchText: { fontSize: 11.5, fontWeight: '600', color: '#C4CAF2' },
  heroName: { fontSize: 27, fontWeight: '600', color: '#fff' },
  heroTrim: { fontSize: 17, fontWeight: '500', color: '#C4CAF2', marginTop: 2 },
  heroMeta: { fontSize: 13, color: '#9FB0D9', marginTop: 12 },
  connectedRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 14, alignSelf: 'flex-start',
    backgroundColor: 'rgba(127,216,168,0.14)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10,
  },
  connectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5EDB93', marginRight: 6 },
  connectedText: { fontSize: 12, fontWeight: '600', color: '#8FE0B4' },
  heroArtWrap: { alignItems: 'center', paddingVertical: 14 },
  statsRow: { flexDirection: 'column', gap: 14, marginBottom: 12 },
  statTile: { marginBottom: 0, padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '600', color: theme.colors.textPrimary, letterSpacing: -0.2 },
  statValueSmall: { fontSize: 19, fontWeight: '600', color: theme.colors.textPrimary, letterSpacing: -0.2 },
  rowSub: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19 },
  bold: { color: theme.colors.textPrimary, fontWeight: '700' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  mapBox: {
    height: 100, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  mapLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 6 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 11, alignItems: 'center' },
  secondaryBtnText: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textPrimary },
  ecoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ecoLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary },
  ecoValue: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  ecoHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 12, marginBottom: 14, flexWrap: 'wrap' },
  footLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  footLinkText: { fontSize: 12.5, fontWeight: '700', color: theme.colors.accent },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  primaryBtn: { borderWidth: 0 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  noteText: { flex: 1, fontSize: 13.5, color: theme.colors.textPrimary, lineHeight: 20 },
  tripRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 20 },
  rowIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tripTitle: { fontSize: 13.5, fontWeight: '700', color: theme.colors.textPrimary },
  tripSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  orderTracker: { flexDirection: 'row', justifyContent: 'space-between' },
  orderStage: { alignItems: 'center', flex: 1 },
  orderDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  orderStageLabel: { fontSize: 9.5, fontWeight: '700', color: theme.colors.textSecondary, textAlign: 'center' },
  cancelOrderText: { fontSize: 12.5, fontWeight: '700' },
});
