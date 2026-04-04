import { API_BASE_URL } from '../constants/api';

// ── Types ──────────────────────────────────────────────────────────────────

export type Period = 'morning' | 'afternoon' | 'evening' | 'night';

export interface DailyLog {
  date: string;
  timeOfWakingUp: string | null;
  firstSocialInteraction: string | null;
  firstActivityOrWorkStart: string | null;
  timeOfGoingToBed: string | null;
  sleepHours: number | null;
  cardio: number | null;
  strength: number | null;
}

export interface MarkerRecord {
  period: Period;
  mood: number | null;
  energyLevel: number | null;
  anxiety: number | null;
  depression: number | null;
  moodSwings: number | null;
  racingThoughts: number | null;
  triggersOrMajorStressors: string | null;
  motivation: number | null;
  productivity: number | null;
  tremors: boolean;
  dizziness: boolean;
  headaches: boolean;
  heartPalpitations: boolean;
  nightSweats: boolean;
  wife: number | null;
  kids: number | null;
  family: number | null;
  friends: number | null;
  neighbors: number | null;
  coWorkers: number | null;
  thoughtsFeelingsReflections: string | null;
}

export interface MedicationRecord {
  medication: string;
  dosage: number | null;
  uom: string;
  taken: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json as T;
}

// ── Daily Log ──────────────────────────────────────────────────────────────

export async function fetchDaily(date: string): Promise<DailyLog | null> {
  const data = await apiFetch<{ record: DailyLog | null }>(`/api/daily?date=${date}`);
  return data.record;
}

export async function saveDaily(log: DailyLog): Promise<void> {
  await apiFetch('/api/daily', { method: 'POST', body: JSON.stringify(log) });
}

// ── Markers ────────────────────────────────────────────────────────────────

export async function fetchMarkers(date: string): Promise<MarkerRecord[]> {
  const data = await apiFetch<{ records: MarkerRecord[] }>(`/api/markers?date=${date}`);
  return data.records;
}

export async function saveMarker(date: string, marker: MarkerRecord): Promise<void> {
  await apiFetch('/api/markers', { method: 'POST', body: JSON.stringify({ date, ...marker }) });
}

// ── Medications ────────────────────────────────────────────────────────────

export async function fetchMedications(date: string): Promise<MedicationRecord[]> {
  const data = await apiFetch<{ records: MedicationRecord[] }>(`/api/medications?date=${date}`);
  return data.records;
}

export async function saveMedications(date: string, medications: MedicationRecord[]): Promise<void> {
  await apiFetch('/api/medications', {
    method: 'POST',
    body: JSON.stringify({ date, medications }),
  });
}
