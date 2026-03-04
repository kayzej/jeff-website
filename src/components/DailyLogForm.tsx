'use client';
import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'morning' | 'afternoon' | 'evening' | 'night';
type MedName = 'perphenazine' | 'lithium' | 'divalproex' | 'lamotrigine' | 'clonazepam';
type SectionStatus = 'idle' | 'loading' | 'success' | 'error';

interface DailyData {
  timeOfWakingUp: string;
  firstSocialInteraction: string;
  firstActivityOrWorkStart: string;
  timeOfGoingToBed: string;
  sleepHours: number;
  cardio: number;
  strength: number;
}

interface PeriodData {
  mood: number;
  energyLevel: number;
  anxiety: number;
  depression: number;
  moodSwings: number;
  racingThoughts: number;
  triggersOrMajorStressors: number;
  motivation: number;
  productivity: number;
  tremors: number;
  dizziness: number;
  headaches: number;
  heartPalpitations: number;
  nightSweats: number;
  wife: number;
  kids: number;
  family: number;
  friends: number;
  neighbors: number;
  coWorkers: number;
  thoughtsFeelingsReflections: string;
}

interface MedEntry {
  medication: MedName;
  dosage: number;
  uom: string;
  taken: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const defaultDaily = (date: string): DailyData => ({
  timeOfWakingUp: `${date}T07:30`,
  firstSocialInteraction: `${date}T07:30`,
  firstActivityOrWorkStart: `${date}T08:00`,
  timeOfGoingToBed: `${date}T22:30`,
  sleepHours: 8,
  cardio: 0,
  strength: 0,
});

const defaultPeriod = (): PeriodData => ({
  mood: 5,
  energyLevel: 5,
  motivation: 5,
  productivity: 5,
  anxiety: 0,
  depression: 0,
  moodSwings: 0,
  racingThoughts: 0,
  triggersOrMajorStressors: 0,
  tremors: 0,
  dizziness: 0,
  headaches: 0,
  heartPalpitations: 0,
  nightSweats: 0,
  wife: 5,
  kids: 5,
  family: 5,
  friends: 5,
  neighbors: 5,
  coWorkers: 5,
  thoughtsFeelingsReflections: '',
});

const defaultMeds = (): MedEntry[] => [
  { medication: 'perphenazine', dosage: 6, uom: 'mg', taken: true },
  { medication: 'lithium', dosage: 1050, uom: 'mg', taken: true },
  { medication: 'divalproex', dosage: 1000, uom: 'mg', taken: true },
  { medication: 'lamotrigine', dosage: 200, uom: 'mg', taken: true },
  { medication: 'clonazepam', dosage: 0, uom: 'mg', taken: false },
];

const blankPeriods = () => ({
  morning: defaultPeriod(),
  afternoon: defaultPeriod(),
  evening: defaultPeriod(),
  night: defaultPeriod(),
});

const blankLoaded = () => ({
  morning: false,
  afternoon: false,
  evening: false,
  night: false,
});

const PERIODS: Period[] = ['morning', 'afternoon', 'evening', 'night'];

const MED_LABELS: Record<MedName, string> = {
  perphenazine: 'Perphenazine',
  lithium: 'Lithium',
  divalproex: 'Divalproex',
  lamotrigine: 'Lamotrigine',
  clonazepam: 'Clonazepam',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Slider({
  label,
  min = 0,
  max = 10,
  value,
  onChange,
  accent = '#d4a853',
}: {
  label: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <div className="slider-row">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value" style={{ color: accent }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--accent': accent } as React.CSSProperties}
      />
    </div>
  );
}

function SubmitBar({
  status,
  label,
  onSubmit,
  errorMsg,
}: {
  status: SectionStatus;
  label: string;
  onSubmit: () => void;
  errorMsg: string;
}) {
  return (
    <div className="submit-bar">
      <button className="submit-btn" onClick={onSubmit} disabled={status === 'loading'}>
        {status === 'loading' ? 'Saving…' : label}
      </button>
      {status === 'success' && <p className="status-msg status-success">Saved.</p>}
      {status === 'error' && <p className="status-msg status-error">{errorMsg}</p>}
    </div>
  );
}

function SectionCard({ title, loaded, children }: { title: string; loaded: boolean; children: React.ReactNode }) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-title">{title}</h2>
        {loaded && <span className="loaded-badge">● loaded from db</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyLogForm() {
  const [date, setDate] = useState(todayStr());
  const [fetching, setFetching] = useState(false);

  // Section 1 – Daily
  const [daily, setDaily] = useState<DailyData>(defaultDaily(todayStr()));
  const [dailyLoaded, setDailyLoaded] = useState(false);
  const [dailyStatus, setDailyStatus] = useState<SectionStatus>('idle');
  const [dailyErr, setDailyErr] = useState('');

  // Section 2 – Period Log
  const [period, setPeriod] = useState<Period>('morning');
  const [periodData, setPeriodData] = useState<Record<Period, PeriodData>>(blankPeriods());
  const [periodLoaded, setPeriodLoaded] = useState<Record<Period, boolean>>(blankLoaded());
  const [periodStatus, setPeriodStatus] = useState<SectionStatus>('idle');
  const [periodErr, setPeriodErr] = useState('');

  // Section 3 – Medications (daily, not per-period)
  const [meds, setMeds] = useState<MedEntry[]>(defaultMeds());
  const [medsLoaded, setMedsLoaded] = useState(false);
  const [medsStatus, setMedsStatus] = useState<SectionStatus>('idle');
  const [medsErr, setMedsErr] = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchDate = useCallback(async (d: string) => {
    setFetching(true);
    setDailyLoaded(false);
    setPeriodLoaded(blankLoaded());
    setMedsLoaded(false);

    try {
      // Daily
      const dr = await fetch(`/api/daily?date=${d}`);
      if (dr.ok) {
        const { record } = await dr.json();
        if (record) {
          const toLocalDT = (v: string | null) => (v ? v.slice(0, 16) : '');
          setDaily({
            timeOfWakingUp: toLocalDT(record.timeOfWakingUp) || `${d}T07:30`,
            firstSocialInteraction: toLocalDT(record.firstSocialInteraction) || `${d}T07:30`,
            firstActivityOrWorkStart: toLocalDT(record.firstActivityOrWorkStart) || `${d}T08:00`,
            timeOfGoingToBed: toLocalDT(record.timeOfGoingToBed) || `${d}T22:30`,
            sleepHours: Number(record.sleepHours ?? 8),
            cardio: Number(record.cardio ?? 0),
            strength: Number(record.strength ?? 0),
          });
          setDailyLoaded(true);
        } else {
          setDaily(defaultDaily(d));
          setDailyLoaded(false);
        }
      }

      // Period log
      const pr = await fetch(`/api/period?date=${d}`);
      if (pr.ok) {
        const { records } = await pr.json();
        const updated = blankPeriods();
        const loaded = blankLoaded();
        for (const r of records ?? []) {
          updated[r.period as Period] = { ...r, thoughtsFeelingsReflections: r.thoughtsFeelingsReflections ?? '' };
          loaded[r.period as Period] = true;
        }
        setPeriodData(updated);
        setPeriodLoaded(loaded);
      }

      // Medications
      const mr = await fetch(`/api/medications?date=${d}`);
      if (mr.ok) {
        const { records } = await mr.json();
        if (records?.length > 0) {
          const updated = defaultMeds();
          for (const r of records) {
            const idx = updated.findIndex((m) => m.medication === r.medication);
            if (idx >= 0) updated[idx] = { medication: r.medication, dosage: r.dosage, uom: r.uom, taken: r.taken };
          }
          setMeds(updated);
          setMedsLoaded(true);
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchDate(date);
  }, [date, fetchDate]);

  // ── Submit handlers ────────────────────────────────────────────────────────

  const submitDaily = async () => {
    setDailyStatus('loading');
    setDailyErr('');
    try {
      const res = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...daily }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setDailyStatus('success');
      setDailyLoaded(true);
      setTimeout(() => setDailyStatus('idle'), 3000);
    } catch (e) {
      setDailyStatus('error');
      setDailyErr(e instanceof Error ? e.message : 'Error');
    }
  };

  const submitPeriod = async () => {
    setPeriodStatus('loading');
    setPeriodErr('');
    try {
      const res = await fetch('/api/period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, period, ...periodData[period] }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setPeriodStatus('success');
      setPeriodLoaded((p) => ({ ...p, [period]: true }));
      setTimeout(() => setPeriodStatus('idle'), 3000);
    } catch (e) {
      setPeriodStatus('error');
      setPeriodErr(e instanceof Error ? e.message : 'Error');
    }
  };

  const submitMeds = async () => {
    setMedsStatus('loading');
    setMedsErr('');
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, medications: meds }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setMedsStatus('success');
      setMedsLoaded(true);
      setTimeout(() => setMedsStatus('idle'), 3000);
    } catch (e) {
      setMedsStatus('error');
      setMedsErr(e instanceof Error ? e.message : 'Error');
    }
  };

  // ── Field helpers ──────────────────────────────────────────────────────────

  const setDailyField = <K extends keyof DailyData>(k: K, v: DailyData[K]) => setDaily((d) => ({ ...d, [k]: v }));

  const setPeriodField = <K extends keyof PeriodData>(k: K, v: PeriodData[K]) =>
    setPeriodData((d) => ({ ...d, [period]: { ...d[period], [k]: v } }));

  const updateMed = (idx: number, field: keyof MedEntry, value: number | boolean | string) =>
    setMeds((m) => m.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));

  const niceName = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  const cur = periodData[period];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400&display=swap');

        .form-wrap {
          font-family: 'DM Mono', monospace;
          color: #e8e4df;
          max-width: 660px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
        }
        .form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem; font-weight: 400;
          letter-spacing: -0.02em; margin-bottom: 0.25rem; color: #fff;
        }
        .form-subtitle {
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.35); margin-bottom: 2.5rem;
        }

        /* Date row */
        .date-row {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 3rem; padding-bottom: 2rem;
          border-bottom: 1px solid rgba(232,228,223,0.08);
        }
        .date-label {
          font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.4); white-space: nowrap;
        }
        .date-input {
          background: rgba(232,228,223,0.04);
          border: 1px solid rgba(232,228,223,0.12); border-radius: 4px;
          color: #e8e4df; font-family: 'DM Mono', monospace;
          font-size: 0.85rem; padding: 0.5rem 0.75rem;
          outline: none; color-scheme: dark; transition: border-color 0.2s;
        }
        .date-input:focus { border-color: rgba(212,168,83,0.5); }
        .fetching-indicator {
          font-size: 0.65rem; letter-spacing: 0.15em;
          color: rgba(212,168,83,0.5); text-transform: uppercase;
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

        /* Section card */
        .section-card {
          margin-bottom: 2.5rem;
          background: rgba(232,228,223,0.02);
          border: 1px solid rgba(232,228,223,0.07);
          border-radius: 8px; padding: 1.75rem;
        }
        .section-card-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 1.5rem;
        }
        .section-title {
          font-family: 'DM Serif Display', serif; font-size: 1rem;
          font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(232,228,223,0.55); margin: 0;
        }
        .loaded-badge {
          font-size: 0.6rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: #6dbf8a; opacity: 0.7;
        }

        /* Period tabs */
        .period-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .period-tab {
          font-family: 'DM Mono', monospace; font-size: 0.65rem;
          letter-spacing: 0.15em; text-transform: uppercase;
          padding: 0.35rem 0.75rem; border-radius: 3px;
          border: 1px solid rgba(232,228,223,0.12);
          background: transparent; color: rgba(232,228,223,0.4);
          cursor: pointer; transition: all 0.15s; position: relative;
        }
        .period-tab:hover { border-color: rgba(232,228,223,0.25); color: rgba(232,228,223,0.7); }
        .period-tab.active {
          border-color: rgba(212,168,83,0.5); color: #d4a853;
          background: rgba(212,168,83,0.06);
        }
        .period-tab .dot {
          position: absolute; top: 3px; right: 3px;
          width: 4px; height: 4px; border-radius: 50%; background: #6dbf8a;
        }

        /* Sub-label + divider */
        .sub-label {
          font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.25); margin: 1.25rem 0 0.75rem;
        }
        .divider { border: none; border-top: 1px solid rgba(232,228,223,0.06); margin: 1.25rem 0; }

        /* Time fields */
        .time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .time-field label {
          display: block; font-size: 0.62rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: rgba(232,228,223,0.35); margin-bottom: 0.4rem;
        }
        .time-field input[type="datetime-local"] {
          width: 100%; background: rgba(232,228,223,0.04);
          border: 1px solid rgba(232,228,223,0.1); border-radius: 4px;
          color: #e8e4df; font-family: 'DM Mono', monospace; font-size: 0.72rem;
          padding: 0.45rem 0.65rem; outline: none; transition: border-color 0.2s; color-scheme: dark;
        }
        .time-field input[type="datetime-local"]:focus { border-color: rgba(212,168,83,0.5); }

        /* Sliders */
        .slider-row { margin-bottom: 1.1rem; }
        .slider-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.35rem; }
        .slider-label { font-size: 0.68rem; letter-spacing: 0.07em; color: rgba(232,228,223,0.55); }
        .slider-value { font-size: 0.82rem; min-width: 1.5rem; text-align: right; }
        input[type="range"] {
          -webkit-appearance: none; width: 100%; height: 2px;
          background: rgba(232,228,223,0.1); border-radius: 2px; outline: none; cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%;
          background: var(--accent, #d4a853); cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.3); box-shadow: 0 0 8px var(--accent, #d4a853);
        }

        /* Symptom toggles */
        .symptom-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.5rem; }
        .symptom-toggle {
          display: flex; align-items: center; gap: 0.45rem;
          padding: 0.45rem 0.65rem; border-radius: 4px;
          border: 1px solid rgba(232,228,223,0.08);
          background: rgba(232,228,223,0.02);
          cursor: pointer; user-select: none; transition: all 0.15s;
        }
        .symptom-toggle:hover { border-color: rgba(196,85,42,0.25); }
        .symptom-toggle.active { border-color: rgba(196,85,42,0.55); background: rgba(196,85,42,0.1); }
        .symptom-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(232,228,223,0.18); flex-shrink: 0; transition: background 0.15s; }
        .symptom-toggle.active .symptom-dot { background: #c4552a; }
        .symptom-name { font-size: 0.62rem; letter-spacing: 0.06em; color: rgba(232,228,223,0.45); transition: color 0.15s; }
        .symptom-toggle.active .symptom-name { color: rgba(232,228,223,0.8); }

        /* Medication rows */
        .med-row {
          display: grid; grid-template-columns: 1fr auto auto;
          align-items: center; gap: 0.75rem;
          padding: 0.65rem 0; border-bottom: 1px solid rgba(232,228,223,0.05);
        }
        .med-row:last-child { border-bottom: none; }
        .med-name { font-size: 0.72rem; letter-spacing: 0.08em; color: rgba(232,228,223,0.6); }
        .med-dose-wrap { display: flex; align-items: center; gap: 0.35rem; }
        .med-dose-input {
          width: 72px; background: rgba(232,228,223,0.04);
          border: 1px solid rgba(232,228,223,0.1); border-radius: 4px;
          color: #e8e4df; font-family: 'DM Mono', monospace;
          font-size: 0.75rem; padding: 0.35rem 0.5rem;
          outline: none; text-align: right; transition: border-color 0.2s;
        }
        .med-dose-input:focus { border-color: rgba(212,168,83,0.5); }
        .med-unit { font-size: 0.6rem; color: rgba(232,228,223,0.3); letter-spacing: 0.05em; }
        .med-taken {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(232,228,223,0.3); cursor: pointer; user-select: none;
          padding: 0.35rem 0.55rem; border-radius: 3px;
          border: 1px solid rgba(232,228,223,0.08); transition: all 0.15s;
        }
        .med-taken.taken { color: #6dbf8a; border-color: rgba(109,191,138,0.35); background: rgba(109,191,138,0.06); }

        /* Textarea */
        .reflections-area {
          width: 100%; min-height: 110px; background: rgba(232,228,223,0.03);
          border: 1px solid rgba(232,228,223,0.1); border-radius: 4px; color: #e8e4df;
          font-family: 'DM Mono', monospace; font-size: 0.78rem; line-height: 1.7;
          padding: 0.75rem; outline: none; resize: vertical; transition: border-color 0.2s;
        }
        .reflections-area:focus { border-color: rgba(212,168,83,0.4); }

        /* Submit bar */
        .submit-bar { margin-top: 1.5rem; }
        .submit-btn {
          width: 100%; padding: 0.85rem; background: transparent;
          border: 1px solid rgba(212,168,83,0.35); border-radius: 4px; color: #d4a853;
          font-family: 'DM Mono', monospace; font-size: 0.7rem;
          letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) { background: rgba(212,168,83,0.07); border-color: rgba(212,168,83,0.7); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .status-msg { margin-top: 0.6rem; font-size: 0.65rem; letter-spacing: 0.15em; text-align: center; text-transform: uppercase; }
        .status-success { color: #6dbf8a; }
        .status-error   { color: #e06c6c; }
      `}</style>

      <div className="form-wrap">
        <h1 className="form-title">Daily Log</h1>
        <p className="form-subtitle">Health · Mood · Activity</p>

        {/* ── Date picker ── */}
        <div className="date-row">
          <span className="date-label">Date</span>
          <input type="date" className="date-input" value={date} onChange={(e) => setDate(e.target.value)} />
          {fetching && <span className="fetching-indicator">Loading…</span>}
        </div>

        {/* ══ SECTION 1: Daily ══════════════════════════════════════════════ */}
        <SectionCard title="Daily" loaded={dailyLoaded}>
          <p className="sub-label">Timestamps</p>
          <div className="time-grid">
            {(
              [
                ['timeOfWakingUp', 'Waking Up'],
                ['firstSocialInteraction', 'First Social Interaction'],
                ['firstActivityOrWorkStart', 'Work / Activity Start'],
                ['timeOfGoingToBed', 'Going to Bed'],
              ] as [keyof DailyData, string][]
            ).map(([k, label]) => (
              <div className="time-field" key={k}>
                <label>{label}</label>
                <input
                  type="datetime-local"
                  value={daily[k] as string}
                  onChange={(e) => setDailyField(k, e.target.value)}
                />
              </div>
            ))}
          </div>

          <hr className="divider" />
          <p className="sub-label">Sleep &amp; Exercise</p>
          <Slider
            label="Sleep Hours"
            min={0}
            max={14}
            value={daily.sleepHours}
            onChange={(v) => setDailyField('sleepHours', v)}
            accent="#3d6a8a"
          />
          <Slider
            label="Cardio (min)"
            min={0}
            max={120}
            value={daily.cardio}
            onChange={(v) => setDailyField('cardio', v)}
            accent="#3d6a8a"
          />
          <Slider
            label="Strength (min)"
            min={0}
            max={120}
            value={daily.strength}
            onChange={(v) => setDailyField('strength', v)}
            accent="#3d6a8a"
          />

          <SubmitBar status={dailyStatus} label="Save Daily Entry" onSubmit={submitDaily} errorMsg={dailyErr} />
        </SectionCard>

        {/* ══ SECTION 2: Period Log ═════════════════════════════════════════ */}
        <SectionCard title="Period Log" loaded={periodLoaded[period]}>
          <div className="period-tabs">
            {PERIODS.map((p) => (
              <button key={p} className={`period-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p}
                {periodLoaded[p] && <span className="dot" />}
              </button>
            ))}
          </div>

          <p className="sub-label">Mood &amp; Mental State</p>
          {(
            [
              ['mood', '#d4a853'],
              ['energyLevel', '#d4a853'],
              ['motivation', '#d4a853'],
              ['productivity', '#d4a853'],
              ['anxiety', '#c4552a'],
              ['depression', '#c4552a'],
              ['moodSwings', '#c4552a'],
              ['racingThoughts', '#c4552a'],
              ['triggersOrMajorStressors', '#c4552a'],
            ] as [keyof PeriodData, string][]
          ).map(([k, accent]) => (
            <Slider
              key={k}
              label={niceName(k)}
              value={cur[k] as number}
              onChange={(v) => setPeriodField(k, v)}
              accent={accent}
            />
          ))}

          <hr className="divider" />
          <p className="sub-label">Physical Symptoms</p>
          <div className="symptom-grid">
            {(['tremors', 'dizziness', 'headaches', 'heartPalpitations', 'nightSweats'] as (keyof PeriodData)[]).map(
              (k) => (
                <div
                  key={k}
                  className={`symptom-toggle ${cur[k] ? 'active' : ''}`}
                  onClick={() => setPeriodField(k, cur[k] ? 0 : 1)}
                >
                  <div className="symptom-dot" />
                  <span className="symptom-name">{niceName(k)}</span>
                </div>
              )
            )}
          </div>

          <hr className="divider" />
          <p className="sub-label">Social Quality (0–10)</p>
          {(['wife', 'kids', 'family', 'friends', 'neighbors', 'coWorkers'] as (keyof PeriodData)[]).map((k) => (
            <Slider
              key={k}
              label={niceName(k)}
              value={cur[k] as number}
              onChange={(v) => setPeriodField(k, v)}
              accent="#d4a853"
            />
          ))}

          <hr className="divider" />
          <p className="sub-label">Reflections</p>
          <textarea
            className="reflections-area"
            value={cur.thoughtsFeelingsReflections}
            onChange={(e) => setPeriodField('thoughtsFeelingsReflections', e.target.value)}
            placeholder="Write freely…"
          />

          <SubmitBar
            status={periodStatus}
            label={`Save ${niceName(period)} Entry`}
            onSubmit={submitPeriod}
            errorMsg={periodErr}
          />
        </SectionCard>

        {/* ══ SECTION 3: Medications ════════════════════════════════════════ */}
        <SectionCard title="Medications" loaded={medsLoaded}>
          {meds.map((med, idx) => (
            <div key={med.medication} className="med-row">
              <span className="med-name">{MED_LABELS[med.medication]}</span>
              <div className="med-dose-wrap">
                <input
                  type="number"
                  className="med-dose-input"
                  min={0}
                  value={med.dosage}
                  onChange={(e) => updateMed(idx, 'dosage', Number(e.target.value))}
                />
                <span className="med-unit">{med.uom}</span>
              </div>
              <div
                className={`med-taken ${med.taken ? 'taken' : ''}`}
                onClick={() => updateMed(idx, 'taken', !med.taken)}
              >
                {med.taken ? '✓ taken' : 'not taken'}
              </div>
            </div>
          ))}

          <SubmitBar status={medsStatus} label="Save Medications" onSubmit={submitMeds} errorMsg={medsErr} />
        </SectionCard>
      </div>
    </>
  );
}
