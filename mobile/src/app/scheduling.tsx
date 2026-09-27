import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Share } from 'react-native';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { useAppState } from '../context/AppStateContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Picker from '../components/Picker';
import BottomSheet from '../components/BottomSheet';
import ServiceRatingSheet from '../components/ServiceRatingSheet';
import {
  schedulingServices, dealerships, dealershipDetails, getSchedulingDays, pushNotification,
} from '../constants/data';
import type { Dealership } from '../types';

interface SchedulingProgress {
  step: number;
  budgetApproved: boolean | null;
  readyTime: string;
  stepTimes: string[];
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 12 }}>{children}</Text>;
}

const SERVICE_STAGES = ['Recebido', 'Diagnóstico', 'Serviço', 'Lavagem', 'Pronto'];
const PAYMENT_METHODS = ['Cartão', 'Pix', 'Ford Wallet', 'Pagar na concessionária'];

function computeReadyTime() {
  const d = new Date();
  d.setHours(d.getHours() + 2);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Real .ics text — same fields/format as the web's downloadAppointmentICS.
// There's no file-download API in this environment, so it's offered through
// the native share sheet (Share.share) instead of a browser download; on
// platforms/browsers with no share support that call rejects and we fall
// back to the same confirmation toast the web shows after its real download.
function buildAppointmentIcs(appt: { service: string; dateLabel: string; time: string; dealer: string }, dealer: Dealership | null) {
  const [d, m, y] = appt.dateLabel.split('/');
  const [hh, mm] = appt.time.split(':');
  const start = `${y}${m}${d}T${hh}${mm}00`;
  const endHour = String((Number(hh) + 1) % 24).padStart(2, '0');
  const end = `${y}${m}${d}T${endHour}${mm}00`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ford One//Agendamento//PT-BR', 'BEGIN:VEVENT',
    `SUMMARY:${appt.service} — Ford One`,
    `DTSTART:${start}`, `DTEND:${end}`,
    `LOCATION:${(dealer && dealer.name) || appt.dealer}${dealer && dealer.address ? ', ' + dealer.address : ''}`,
    'DESCRIPTION:Atendimento agendado via Ford One.',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export default function SchedulingScreen() {
  const { theme } = useTheme();
  const showToast = useToast();
  const { confirmedAppointment, setConfirmedAppointment, suggestedService, setSuggestedService, suggestedDealer, setSuggestedDealer } = useAppState();
  const s = styles(theme);
  const days = getSchedulingDays();

  const [service, setService] = useState(suggestedService || schedulingServices[0]);
  const [dealer, setDealer] = useState(suggestedDealer || dealerships[0]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [progress, setProgress] = useState<SchedulingProgress | null>(null);
  const [payment, setPayment] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  // A service/dealer suggested by another screen pre-selects the picker
  // once, then clears — it shouldn't keep overriding a manual choice made
  // later in this same session.
  useEffect(() => {
    if (suggestedService) {
      setService(suggestedService);
      setSuggestedService(null);
    }
    if (suggestedDealer) {
      setDealer(suggestedDealer);
      setSuggestedDealer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedService, suggestedDealer]);

  const bannerParts: string[] = [];
  if (suggestedService) bannerParts.push(`${suggestedService} pré-selecionado a partir de uma recomendação da Ford One Intelligence.`);

  const handleConfirm = () => {
    if (selectedDay === null || !selectedSlot) {
      showToast('Selecione um horário para continuar');
      return;
    }
    setConfirmedAppointment({ service, dealer, dateLabel: days[selectedDay].dateLabel, time: selectedSlot });
    pushNotification(`Agendamento confirmado: ${service} em ${days[selectedDay].dateLabel} às ${selectedSlot}.`, 'concessionaria');
    showToast(service === 'Test-drive' ? 'Test-drive agendado com sucesso.' : 'Agendamento confirmado com sucesso');
  };

  const handleCancel = () => {
    setConfirmedAppointment(null);
    setProgress(null);
    setPayment(null);
    showToast('Agendamento cancelado');
  };

  const handleCheckin = () => {
    setProgress({ step: 0, budgetApproved: null, readyTime: computeReadyTime(), stepTimes: [nowLabel()] });
    setDetailOpen(false);
    showToast('Seu Ford chegou na concessionária');
  };

  // Detail sheet — "Ver detalhes do agendamento" (openAppointmentModal no site).
  const apptDealerDetail = confirmedAppointment
    ? dealershipDetails[dealerships.indexOf(confirmedAppointment.dealer)]
    : null;

  const handleAddToCalendar = () => {
    if (!confirmedAppointment) return;
    const ics = buildAppointmentIcs(confirmedAppointment, apptDealerDetail);
    Share.share({ message: ics, title: 'agendamento-ford-one.ics' })
      .then(() => showToast('Evento .ics baixado'))
      .catch(() => showToast('Evento .ics baixado'));
  };

  const handleAlter = () => {
    if (!confirmedAppointment) return;
    setService(confirmedAppointment.service);
    setDealer(confirmedAppointment.dealer);
    setSelectedDay(null);
    setSelectedSlot(null);
    setDetailOpen(false);
  };

  const handleCancelFromDetail = () => {
    setDetailOpen(false);
    handleCancel();
  };

  const laborCost = 90;
  const partsCost = 320;
  const totalCost = partsCost + laborCost;
  const showBudget = progress && progress.step === 2 && progress.budgetApproved === null;
  const budgetRefused = progress && progress.step === 2 && progress.budgetApproved === false;
  const canAdvance = progress && progress.step < 4 && !showBudget && !budgetRefused;

  const advanceStep = () => {
    setProgress((prev) => {
      if (!prev) return prev;
      const nextStep = Math.min(4, prev.step + 1);
      const stepTimes = [...prev.stepTimes];
      stepTimes[nextStep] = nowLabel();
      return { ...prev, step: nextStep, stepTimes };
    });
  };

  const setBudget = (approved: boolean) => {
    setProgress((prev) => (prev ? { ...prev, budgetApproved: approved } : prev));
    showToast(approved ? 'Serviço aprovado' : 'Serviço recusado');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={s.scrollContent}>
      <Text style={s.pageSub}>Organize seu próximo atendimento em poucos passos.</Text>
      {bannerParts.length > 0 && (
        <View style={[s.banner, { backgroundColor: theme.colors.accentSoft }]}>
          <View style={[s.bannerIcon, { backgroundColor: theme.colors.surface }]}>
            <Icon name="spark" size={16} color={theme.colors.accent} />
          </View>
          <Text style={[s.bannerText, { color: theme.colors.textPrimary }]}>{bannerParts.join(' ')}</Text>
        </View>
      )}

      <Card>
        <Picker label="Serviço" value={service} options={schedulingServices} onSelect={setService} />
        <Picker label="Concessionária" value={dealer} options={dealerships} onSelect={setDealer} />

        <Text style={s.label}>Data e horário</Text>
        {days.map((day, i) => (
          <View key={day.label} style={{ marginBottom: 12 }}>
            <Text style={s.dayLabel}>{day.label}</Text>
            <View style={s.slotRow}>
              {day.slots.map((slot) => {
                const isSelected = selectedDay === i && selectedSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => { setSelectedDay(i); setSelectedSlot(slot); }}
                    style={[
                      s.slotChip,
                      {
                        borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                        backgroundColor: isSelected ? theme.colors.accentSoft : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[s.slotText, { color: isSelected ? theme.colors.accent : theme.colors.textSecondary }]}>{slot}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable style={[s.confirmBtn, { backgroundColor: theme.colors.navy950 }]} onPress={handleConfirm}>
          <Text style={s.confirmBtnText}>Confirmar agendamento</Text>
        </Pressable>
      </Card>

      <Card>
        <SectionTitle>Próximo agendamento</SectionTitle>
        {confirmedAppointment ? (
          <>
            <Pressable style={s.apptRow} onPress={() => setDetailOpen(true)}>
              <View style={[s.apptIcon, { backgroundColor: theme.colors.accentSoft }]}>
                <Icon name="calendar" size={18} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.apptTitle}>{confirmedAppointment.service}</Text>
                <Text style={s.apptSub}>{confirmedAppointment.dealer}</Text>
                <Text style={s.apptSub}>{confirmedAppointment.dateLabel} · {confirmedAppointment.time}</Text>
              </View>
              <Badge label="Confirmado" tone="success" />
              <Icon name="chevron" size={18} color={theme.colors.textTertiary} style={{ marginLeft: 6 }} />
            </Pressable>
            <Pressable style={s.cancelBtn} onPress={handleCancel}>
              <Text style={[s.cancelBtnText, { color: theme.colors.textSecondary }]}>Cancelar agendamento</Text>
            </Pressable>
          </>
        ) : (
          <Text style={s.emptyText}>Nenhum agendamento ativo. Assim que você confirmar um atendimento, ele aparecerá aqui.</Text>
        )}
      </Card>

      {progress && (
        <Card>
          <SectionTitle>Seu Ford está na concessionária</SectionTitle>
          <View style={s.tracker}>
            {SERVICE_STAGES.map((label, i) => {
              const done = i < progress.step;
              const current = i === progress.step;
              return (
                <View key={label} style={s.stage}>
                  <View style={[
                    s.stageDot,
                    { borderColor: theme.colors.border },
                    done && { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
                    current && { borderColor: theme.colors.accent, borderWidth: 2 },
                  ]}>
                    {done && <Icon name="check" size={11} color="#fff" />}
                  </View>
                  <Text style={s.stageLabel}>{label}</Text>
                  {progress.stepTimes[i] ? <Text style={s.stageTime}>{progress.stepTimes[i]}</Text> : null}
                </View>
              );
            })}
          </View>

          {progress.step < 4 ? (
            <Text style={s.readyText}>Previsão: pronto às <Text style={{ fontWeight: '800', color: theme.colors.textPrimary }}>{progress.readyTime}</Text>.</Text>
          ) : (
            <Text style={[s.readyText, { color: theme.colors.success, fontWeight: '700' }]}>Pronto às {progress.readyTime}!</Text>
          )}

          {showBudget && (
            <View style={[s.budgetBox, { backgroundColor: theme.colors.surfaceSunken }]}>
              <Text style={s.budgetTitle}>Orçamento digital</Text>
              <View style={s.rowList}>
                <View style={s.rowItem}><Text style={s.rowSub}>Pastilhas dianteiras</Text><Text style={s.rowMeta}>R$ {partsCost}</Text></View>
                <View style={s.rowItem}><Text style={s.rowSub}>Mão de obra</Text><Text style={s.rowMeta}>R$ {laborCost}</Text></View>
                <View style={[s.rowItem, { borderBottomWidth: 0 }]}><Text style={[s.rowSub, { fontWeight: '800', color: theme.colors.textPrimary }]}>Total</Text><Text style={[s.rowMeta, { fontWeight: '800' }]}>R$ {totalCost}</Text></View>
              </View>
              <View style={s.budgetActions}>
                <Pressable style={[s.actionBtnPrimary, { backgroundColor: theme.colors.navy950 }]} onPress={() => setBudget(true)}>
                  <Text style={s.actionBtnPrimaryText}>Aprovar serviço</Text>
                </Pressable>
                <Pressable style={[s.actionBtnSecondary, { borderColor: theme.colors.border }]} onPress={() => setBudget(false)}>
                  <Text style={[s.actionBtnSecondaryText, { color: theme.colors.textPrimary }]}>Recusar</Text>
                </Pressable>
                <Pressable style={s.consultBtn} onPress={() => showToast('Conectando com um consultor...')}>
                  <Text style={[s.consultBtnText, { color: theme.colors.textSecondary }]}>Falar com consultor</Text>
                </Pressable>
              </View>
            </View>
          )}
          {budgetRefused && (
            <Text style={[s.readyText, { color: theme.colors.danger, marginTop: 14 }]}>Serviço não aprovado. A concessionária vai entrar em contato para alinhar os próximos passos.</Text>
          )}

          {progress.step === 4 && (
            <View style={{ marginTop: 16 }}>
              <Text style={s.budgetTitle}>Pagamento</Text>
              <View style={s.chipRow}>
                {PAYMENT_METHODS.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPayment(p)}
                    style={[s.chip, { borderColor: payment === p ? theme.colors.accent : theme.colors.border, backgroundColor: payment === p ? theme.colors.accentSoft : 'transparent' }]}
                  >
                    <Text style={[s.chipText, { color: payment === p ? theme.colors.accent : theme.colors.textSecondary }]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {canAdvance && (
            <Pressable style={[s.advanceBtn, { borderColor: theme.colors.border }]} onPress={advanceStep}>
              <Text style={[s.advanceBtnText, { color: theme.colors.textPrimary }]}>Avançar etapa (simular)</Text>
            </Pressable>
          )}
          {progress.step === 4 && (
            <Pressable
              style={s.finishBtn}
              onPress={() => setRatingOpen(true)}
            >
              <Text style={[s.finishBtnText, { color: theme.colors.textPrimary }]}>Concluir atendimento</Text>
            </Pressable>
          )}
        </Card>
      )}

      {/* openServiceRatingModal() no site — mostrado ao concluir o atendimento */}
      <ServiceRatingSheet
        visible={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onSubmit={() => {
          setProgress(null);
          setPayment(null);
          setRatingOpen(false);
          pushNotification('Seu Ford terminou o serviço.', 'concessionaria');
          showToast('Avaliação enviada — obrigado!');
        }}
      />

      {/* Detalhe do agendamento confirmado — openAppointmentModal() no site */}
      <BottomSheet visible={detailOpen} onClose={() => setDetailOpen(false)}>
        {confirmedAppointment && (
          <View>
            <View style={[s.apptIcon, { backgroundColor: theme.colors.accentSoft, marginBottom: 14 }]}>
              <Icon name="calendar" size={18} color={theme.colors.accent} />
            </View>
            <Text style={s.sheetTitle}>{confirmedAppointment.service}</Text>
            <Badge label="Confirmado" tone="success" style={{ marginBottom: 14, alignSelf: 'flex-start' }} />
            <View style={s.rowList}>
              <View style={s.rowItem}><Text style={s.rowSub}>Data e horário</Text><Text style={s.rowMeta}>{confirmedAppointment.dateLabel} · {confirmedAppointment.time}</Text></View>
              <View style={s.rowItem}><Text style={s.rowSub}>Concessionária</Text><Text style={s.rowMeta}>{(apptDealerDetail && apptDealerDetail.name) || confirmedAppointment.dealer}</Text></View>
              {apptDealerDetail && apptDealerDetail.address ? (
                <View style={s.rowItem}><Text style={s.rowSub}>Endereço</Text><Text style={s.rowMeta}>{apptDealerDetail.address}</Text></View>
              ) : null}
              {apptDealerDetail && apptDealerDetail.hours ? (
                <View style={s.rowItem}><Text style={s.rowSub}>Funcionamento</Text><Text style={s.rowMeta}>{apptDealerDetail.hours}</Text></View>
              ) : null}
              {apptDealerDetail && apptDealerDetail.rating ? (
                <View style={[s.rowItem, { borderBottomWidth: 0 }]}><Text style={s.rowSub}>Avaliação</Text><Text style={s.rowMeta}>★ {apptDealerDetail.rating}</Text></View>
              ) : null}
            </View>

            <View style={s.detailBtnRow}>
              <Pressable style={[s.detailBtnSecondary, { borderColor: theme.colors.border }]} onPress={() => { setDetailOpen(false); router.push('/dealerships'); }}>
                <Text style={[s.detailBtnSecondaryText, { color: theme.colors.textPrimary }]}>Ver concessionária</Text>
              </Pressable>
              <Pressable style={[s.detailBtnSecondary, { borderColor: theme.colors.border }]} onPress={handleAddToCalendar}>
                <Text style={[s.detailBtnSecondaryText, { color: theme.colors.textPrimary }]}>Adicionar ao calendário</Text>
              </Pressable>
            </View>
            <View style={s.detailBtnRow}>
              <Pressable style={[s.detailBtnSecondary, { borderColor: theme.colors.border }]} onPress={handleAlter}>
                <Text style={[s.detailBtnSecondaryText, { color: theme.colors.textPrimary }]}>Alterar</Text>
              </Pressable>
              <Pressable style={[s.detailBtnDanger, { backgroundColor: theme.colors.dangerBg }]} onPress={handleCancelFromDetail}>
                <Text style={[s.detailBtnDangerText, { color: theme.colors.danger }]}>Cancelar</Text>
              </Pressable>
            </View>
            {!progress && (
              <Pressable style={[s.checkinBtn, { backgroundColor: theme.colors.navy950, marginTop: 10 }]} onPress={handleCheckin}>
                <Text style={s.checkinBtnText}>Simular chegada na concessionária</Text>
              </Pressable>
            )}
          </View>
        )}
      </BottomSheet>
    </ScrollView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 140 }, // extra bottom clearance so the last card/button never lands under the fixed Ford One Intelligence FAB (bottom:82 + 54px tall)
  pageSub: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, marginBottom: 14 },
  bannerIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  label: { fontSize: 12.5, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8 },
  dayLabel: { fontSize: 11.5, fontWeight: '700', color: theme.colors.textTertiary, marginBottom: 8 },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  slotText: { fontSize: 12.5, fontWeight: '700' },
  confirmBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  apptRow: { flexDirection: 'row', alignItems: 'center' },
  apptIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  apptTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  apptSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19 },
  cancelBtn: { marginTop: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 12.5, fontWeight: '700' },
  checkinBtn: { borderRadius: 999, paddingVertical: 13, alignItems: 'center', marginTop: 12 },
  checkinBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  tracker: { flexDirection: 'row', justifyContent: 'space-between' },
  stage: { alignItems: 'center', flex: 1 },
  stageDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stageLabel: { fontSize: 9.5, fontWeight: '700', color: theme.colors.textSecondary, textAlign: 'center' },
  stageTime: { fontSize: 9, color: theme.colors.textTertiary, marginTop: 2 },
  readyText: { fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 14 },
  budgetBox: { borderRadius: 12, padding: 14, marginTop: 16 },
  budgetTitle: { fontSize: 13.5, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 10 },
  budgetActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 10 },
  actionBtnPrimary: { borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  actionBtnPrimaryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionBtnSecondary: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  actionBtnSecondaryText: { fontSize: 12, fontWeight: '700' },
  consultBtn: { marginLeft: 'auto', paddingVertical: 9 },
  consultBtnText: { fontSize: 12, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  advanceBtn: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  advanceBtnText: { fontSize: 13, fontWeight: '700' },
  finishBtn: { alignItems: 'center', marginTop: 14 },
  finishBtnText: { fontSize: 12.5, fontWeight: '700' },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  rowList: { marginTop: 4 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: theme.colors.borderSoft },
  rowSub: { fontSize: 12.5, color: theme.colors.textSecondary, flexShrink: 1, paddingRight: 10 },
  rowMeta: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary, textAlign: 'right' },
  detailBtnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  detailBtnSecondary: { flex: 1, borderWidth: 1.5, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  detailBtnSecondaryText: { fontSize: 12.5, fontWeight: '700' },
  detailBtnDanger: { flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  detailBtnDangerText: { fontSize: 12.5, fontWeight: '700' },
});
