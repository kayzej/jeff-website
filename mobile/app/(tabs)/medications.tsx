import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedicationRecord, fetchMedications, saveMedications } from '../../api/client';

const TODAY = new Date().toISOString().split('T')[0];

// Default medication list with standard dosages
const DEFAULT_MEDICATIONS: MedicationRecord[] = [
  { medication: 'perphenazine', dosage: null, uom: 'mg', taken: false },
  { medication: 'lithium', dosage: null, uom: 'mg', taken: false },
  { medication: 'divalproex', dosage: null, uom: 'mg', taken: false },
  { medication: 'lamotrigine', dosage: null, uom: 'mg', taken: false },
  { medication: 'clonazepam', dosage: null, uom: 'mg', taken: false },
  { medication: 'wegovy', dosage: null, uom: 'mg', taken: false },
];

function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mergeWithDefaults(fetched: MedicationRecord[]): MedicationRecord[] {
  return DEFAULT_MEDICATIONS.map((def) => {
    const found = fetched.find((f) => f.medication === def.medication);
    return found ?? { ...def };
  });
}

export default function MedicationsScreen() {
  const [date, setDate] = useState(TODAY);
  const [meds, setMeds] = useState<MedicationRecord[]>(DEFAULT_MEDICATIONS.map((m) => ({ ...m })));
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
      const fetched = await fetchMedications(d);
      setMeds(mergeWithDefaults(fetched));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
      setMeds(DEFAULT_MEDICATIONS.map((m) => ({ ...m })));
    } finally {
      setLoading(false);
    }
  }

  function toggleTaken(index: number, value: boolean) {
    setMeds((prev) => prev.map((m, i) => (i === index ? { ...m, taken: value } : m)));
    setStatus('idle');
  }

  function markAll(taken: boolean) {
    setMeds((prev) => prev.map((m) => ({ ...m, taken })));
    setStatus('idle');
  }

  async function save() {
    setSaving(true);
    setStatus('idle');
    try {
      await saveMedications(date, meds);
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  const allTaken = meds.every((m) => m.taken);
  const takenCount = meds.filter((m) => m.taken).length;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
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

        {/* Quick actions */}
        <View style={s.quickRow}>
          <Pressable style={s.quickBtn} onPress={() => markAll(true)}>
            <Text style={s.quickBtnText}>Mark all taken</Text>
          </Pressable>
          <Pressable style={[s.quickBtn, s.quickBtnOutline]} onPress={() => markAll(false)}>
            <Text style={s.quickBtnTextOutline}>Clear all</Text>
          </Pressable>
        </View>

        {/* Progress */}
        <View style={s.progressRow}>
          <Text style={s.progressText}>
            {takenCount} / {meds.length} taken
          </Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${(takenCount / meds.length) * 100}%` as any }]} />
          </View>
        </View>

        {loadError && (
          <Text style={s.statusErr}>Load error: {loadError}</Text>
        )}
        {loading ? (
          <ActivityIndicator color="#a78bfa" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={s.medList}>
              {meds.map((med, i) => (
                <View key={med.medication} style={s.medRow}>
                  <View style={s.medInfo}>
                    <Text style={[s.medName, med.taken && s.medNameTaken]}>{capitalize(med.medication)}</Text>
                    {med.dosage != null && (
                      <Text style={s.medDose}>
                        {med.dosage} {med.uom}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={med.taken}
                    onValueChange={(v) => toggleTaken(i, v)}
                    trackColor={{ false: '#1f1f2e', true: '#7c3aed' }}
                    thumbColor={med.taken ? '#a78bfa' : '#6b7280'}
                  />
                </View>
              ))}
            </View>

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
    </SafeAreaView>
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

  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#374151' },
  quickBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  quickBtnTextOutline: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },

  progressRow: { marginBottom: 24 },
  progressText: { color: '#9ca3af', fontSize: 13, marginBottom: 6 },
  progressBar: {
    height: 4,
    backgroundColor: '#1f1f2e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#a78bfa', borderRadius: 2 },

  medList: {
    backgroundColor: '#111118',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f2e',
  },
  medInfo: { flex: 1 },
  medName: { color: '#f9fafb', fontSize: 16, fontWeight: '500' },
  medNameTaken: { color: '#6b7280', textDecorationLine: 'line-through' },
  medDose: { color: '#6b7280', fontSize: 13, marginTop: 2 },

  saveBtn: {
    backgroundColor: '#a78bfa',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  statusOk: { color: '#34d399', textAlign: 'center', marginTop: 10, fontSize: 14 },
  statusErr: { color: '#f87171', textAlign: 'center', marginTop: 10, fontSize: 14 },
});
