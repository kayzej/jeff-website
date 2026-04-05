import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyLog, fetchDaily, saveDaily } from '../../api/client';

const TODAY = new Date().toISOString().split('T')[0];

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

function formatLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const emptyLog = (date: string): DailyLog => ({
  date,
  timeOfWakingUp: null,
  firstSocialInteraction: null,
  firstActivityOrWorkStart: null,
  timeOfGoingToBed: null,
  sleepHours: null,
  cardio: null,
  strength: null,
});

export default function DailyScreen() {
  const [date, setDate] = useState(TODAY);
  const [log, setLog] = useState<DailyLog>(emptyLog(TODAY));
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    load(date);
  }, [date]);

  async function load(d: string) {
    setLoading(true);
    setLoadError(null);
    setStatus('idle');
    try {
      const record = await fetchDaily(d);
      setLog(record ?? emptyLog(d));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
      setLog(emptyLog(d));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setStatus('idle');
    try {
      await saveDaily({ ...log, date });
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  function setField<K extends keyof DailyLog>(key: K, value: DailyLog[K]) {
    setLog((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Date navigator */}
          <View style={s.dateRow}>
            <Pressable onPress={() => setDate(offsetDate(date, -1))} style={s.chevron}>
              <Text style={s.chevronText}>‹</Text>
            </Pressable>
            <Text style={s.dateLabel}>{formatLabel(date)}</Text>
            <Pressable
              onPress={() => setDate(offsetDate(date, 1))}
              style={s.chevron}
              disabled={date >= TODAY}
            >
              <Text style={[s.chevronText, date >= TODAY && s.chevronDisabledText]}>›</Text>
            </Pressable>
          </View>

          {loadError && (
            <Text style={s.statusErr}>Load error: {loadError}</Text>
          )}
          {loading ? (
            <ActivityIndicator color="#a78bfa" style={{ marginTop: 40 }} />
          ) : (
            <>
              <Section title="Schedule">
                <TimeField
                  label="Wake up"
                  value={log.timeOfWakingUp}
                  onChange={(v) => setField('timeOfWakingUp', v)}
                />
                <TimeField
                  label="First social"
                  value={log.firstSocialInteraction}
                  onChange={(v) => setField('firstSocialInteraction', v)}
                />
                <TimeField
                  label="Work start"
                  value={log.firstActivityOrWorkStart}
                  onChange={(v) => setField('firstActivityOrWorkStart', v)}
                />
                <TimeField
                  label="Bed time"
                  value={log.timeOfGoingToBed}
                  onChange={(v) => setField('timeOfGoingToBed', v)}
                />
              </Section>

              <Section title="Health">
                <NumericField
                  label="Sleep hours"
                  value={log.sleepHours}
                  min={0}
                  max={14}
                  step={0.5}
                  onChange={(v) => setField('sleepHours', v)}
                />
                <NumericField
                  label="Cardio (min)"
                  value={log.cardio}
                  min={0}
                  max={180}
                  step={5}
                  onChange={(v) => setField('cardio', v)}
                />
                <NumericField
                  label="Strength (min)"
                  value={log.strength}
                  min={0}
                  max={180}
                  step={5}
                  onChange={(v) => setField('strength', v)}
                />
              </Section>

              <Pressable style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={save} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.saveBtnText}>Save</Text>
                )}
              </Pressable>

              {status === 'saved' && <Text style={s.statusOk}>Saved</Text>}
              {status === 'error' && <Text style={s.statusErr}>Save failed — check connection</Text>}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  // Extract HH:MM from ISO timestamp or pass through plain "HH:MM"
  const displayValue = value ? value.slice(11, 16) || value.slice(0, 5) : '';

  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={s.input}
        value={displayValue}
        onChangeText={(t) => {
          if (t === '') {
            onChange(null);
          } else {
            // Store as an ISO-compatible datetime using today's date
            const [h, m] = t.split(':');
            if (h !== undefined && m !== undefined) {
              onChange(`${new Date().toISOString().split('T')[0]}T${h.padStart(2, '0')}:${m.padEnd(2, '0')}:00`);
            } else {
              onChange(t);
            }
          }
        }}
        placeholder="HH:MM"
        placeholderTextColor="#4b5563"
        keyboardType="numbers-and-punctuation"
        maxLength={5}
      />
    </View>
  );
}

function NumericField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number | null;
  min: number;
  max: number;
  step: number;
  onChange: (v: number | null) => void;
}) {
  function adjust(delta: number) {
    const current = value ?? 0;
    const next = Math.min(max, Math.max(min, current + delta));
    onChange(next);
  }

  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.stepper}>
        <Pressable onPress={() => adjust(-step)} style={s.stepBtn}>
          <Text style={s.stepBtnText}>−</Text>
        </Pressable>
        <Text style={s.stepValue}>{value ?? '—'}</Text>
        <Pressable onPress={() => adjust(step)} style={s.stepBtn}>
          <Text style={s.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0f' },
  scroll: { padding: 20, paddingBottom: 40 },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateLabel: { color: '#f9fafb', fontSize: 17, fontWeight: '600' },
  chevron: { padding: 8 },
  chevronText: { color: '#a78bfa', fontSize: 28, lineHeight: 30 },
  chevronDisabledText: { color: '#374151' },

  section: { marginBottom: 24 },
  sectionTitle: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f2e',
  },
  fieldLabel: { color: '#d1d5db', fontSize: 15 },

  input: {
    color: '#f9fafb',
    fontSize: 15,
    textAlign: 'right',
    minWidth: 70,
    paddingVertical: 2,
  },

  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f1f2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: '#a78bfa', fontSize: 18, lineHeight: 20 },
  stepValue: { color: '#f9fafb', fontSize: 15, minWidth: 36, textAlign: 'center' },

  saveBtn: {
    backgroundColor: '#a78bfa',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  statusOk: { color: '#34d399', textAlign: 'center', marginTop: 10, fontSize: 14 },
  statusErr: { color: '#f87171', textAlign: 'center', marginTop: 10, fontSize: 14 },
});
