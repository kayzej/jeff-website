import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarkerRecord, Period, fetchMarkers, saveMarker } from '../../api/client';

const TODAY = new Date().toISOString().split('T')[0];
const PERIODS: Period[] = ['morning', 'afternoon', 'evening', 'night'];

function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function emptyMarker(period: Period): MarkerRecord {
  return {
    period,
    mood: 5,
    energyLevel: 5,
    anxiety: 5,
    depression: 5,
    moodSwings: 5,
    racingThoughts: 5,
    motivation: 5,
    productivity: 5,
    triggersOrMajorStressors: null,
    tremors: false,
    dizziness: false,
    headaches: false,
    heartPalpitations: false,
    nightSweats: false,
    wife: null,
    kids: null,
    family: null,
    friends: null,
    neighbors: null,
    coWorkers: null,
    thoughtsFeelingsReflections: null,
  };
}

export default function MarkersScreen() {
  const [date, setDate] = useState(TODAY);
  const [period, setPeriod] = useState<Period>('morning');
  const [records, setRecords] = useState<Partial<Record<Period, MarkerRecord>>>({});
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
      const fetched = await fetchMarkers(d);
      const map: Partial<Record<Period, MarkerRecord>> = {};
      for (const r of fetched) map[r.period] = r;
      setRecords(map);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
      setRecords({});
    } finally {
      setLoading(false);
    }
  }

  const marker = records[period] ?? emptyMarker(period);

  function update<K extends keyof MarkerRecord>(key: K, value: MarkerRecord[K]) {
    setRecords((prev) => ({
      ...prev,
      [period]: { ...(prev[period] ?? emptyMarker(period)), [key]: value },
    }));
    setStatus('idle');
  }

  async function save() {
    setSaving(true);
    setStatus('idle');
    try {
      await saveMarker(date, marker);
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
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
              style={[s.chevron, date >= TODAY && s.chevronDisabledView]}
              disabled={date >= TODAY}
            >
              <Text style={[s.chevronText, date >= TODAY && s.chevronDisabledText]}>›</Text>
            </Pressable>
          </View>

          {/* Period selector */}
          <View style={s.periodRow}>
            {PERIODS.map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[s.periodBtn, period === p && s.periodBtnActive]}
              >
                <Text style={[s.periodBtnText, period === p && s.periodBtnTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {loadError && (
            <Text style={s.statusErr}>Load error: {loadError}</Text>
          )}
          {loading ? (
            <ActivityIndicator color="#a78bfa" style={{ marginTop: 40 }} />
          ) : (
            <>
              <Section title="Mood & Mind">
                <SliderField label="Mood" value={marker.mood} onChange={(v) => update('mood', v)} />
                <SliderField label="Energy" value={marker.energyLevel} onChange={(v) => update('energyLevel', v)} />
                <SliderField label="Motivation" value={marker.motivation} onChange={(v) => update('motivation', v)} />
                <SliderField label="Productivity" value={marker.productivity} onChange={(v) => update('productivity', v)} />
                <SliderField label="Anxiety" value={marker.anxiety} onChange={(v) => update('anxiety', v)} />
                <SliderField label="Depression" value={marker.depression} onChange={(v) => update('depression', v)} />
                <SliderField label="Mood swings" value={marker.moodSwings} onChange={(v) => update('moodSwings', v)} />
                <SliderField label="Racing thoughts" value={marker.racingThoughts} onChange={(v) => update('racingThoughts', v)} />
              </Section>

              <Section title="Physical Symptoms">
                <ToggleField label="Tremors" value={marker.tremors} onChange={(v) => update('tremors', v)} />
                <ToggleField label="Dizziness" value={marker.dizziness} onChange={(v) => update('dizziness', v)} />
                <ToggleField label="Headaches" value={marker.headaches} onChange={(v) => update('headaches', v)} />
                <ToggleField label="Heart palpitations" value={marker.heartPalpitations} onChange={(v) => update('heartPalpitations', v)} />
                <ToggleField label="Night sweats" value={marker.nightSweats} onChange={(v) => update('nightSweats', v)} />
              </Section>

              <Section title="Social Quality">
                <SliderField label="Wife" value={marker.wife} onChange={(v) => update('wife', v)} allowNull />
                <SliderField label="Kids" value={marker.kids} onChange={(v) => update('kids', v)} allowNull />
                <SliderField label="Family" value={marker.family} onChange={(v) => update('family', v)} allowNull />
                <SliderField label="Friends" value={marker.friends} onChange={(v) => update('friends', v)} allowNull />
                <SliderField label="Neighbors" value={marker.neighbors} onChange={(v) => update('neighbors', v)} allowNull />
                <SliderField label="Co-workers" value={marker.coWorkers} onChange={(v) => update('coWorkers', v)} allowNull />
              </Section>

              <Section title="Notes">
                <TextInput
                  style={s.textArea}
                  value={marker.triggersOrMajorStressors ?? ''}
                  onChangeText={(t) => update('triggersOrMajorStressors', t || null)}
                  placeholder="Triggers / stressors…"
                  placeholderTextColor="#4b5563"
                  multiline
                  numberOfLines={3}
                />
                <TextInput
                  style={[s.textArea, { marginTop: 10 }]}
                  value={marker.thoughtsFeelingsReflections ?? ''}
                  onChangeText={(t) => update('thoughtsFeelingsReflections', t || null)}
                  placeholder="Thoughts & reflections…"
                  placeholderTextColor="#4b5563"
                  multiline
                  numberOfLines={4}
                />
              </Section>

              <Pressable style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={save} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.saveBtnText}>Save {period.charAt(0).toUpperCase() + period.slice(1)}</Text>
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

function SliderField({
  label,
  value,
  onChange,
  allowNull = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  allowNull?: boolean;
}) {
  const current = value ?? 5;

  return (
    <View style={s.sliderRow}>
      <View style={s.sliderHeader}>
        <Text style={s.fieldLabel}>{label}</Text>
        <Text style={s.sliderValue}>{value ?? (allowNull ? '—' : 5)}</Text>
      </View>
      <View style={s.dotRow}>
        {Array.from({ length: 11 }, (_, i) => (
          <Pressable key={i} onPress={() => onChange(i)} style={s.dotWrapper}>
            <View style={[s.dot, current === i && s.dotActive, i <= current && s.dotFilled]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#1f1f2e', true: '#7c3aed' }}
        thumbColor={value ? '#a78bfa' : '#6b7280'}
      />
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
    marginBottom: 16,
  },
  dateLabel: { color: '#f9fafb', fontSize: 17, fontWeight: '600' },
  chevron: { padding: 8 },
  chevronText: { color: '#a78bfa', fontSize: 28, lineHeight: 30 },
  chevronDisabledView: {},
  chevronDisabledText: { color: '#374151' },

  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1f1f2e',
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: '#7c3aed' },
  periodBtnText: { color: '#9ca3af', fontSize: 12, fontWeight: '500' },
  periodBtnTextActive: { color: '#fff' },

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

  sliderRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f2e',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderValue: { color: '#a78bfa', fontSize: 15, fontWeight: '600' },
  dotRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dotWrapper: { padding: 4 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1f1f2e',
    borderWidth: 1,
    borderColor: '#374151',
  },
  dotFilled: { backgroundColor: '#4c1d95', borderColor: '#7c3aed' },
  dotActive: { backgroundColor: '#a78bfa', borderColor: '#a78bfa' },

  textArea: {
    backgroundColor: '#1f1f2e',
    borderRadius: 10,
    padding: 12,
    color: '#f9fafb',
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 80,
  },

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
