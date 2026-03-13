'use client';
import { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ReferenceLine } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type MetricKey =
  | 'wakeTime'
  | 'socialTime'
  | 'workStart'
  | 'bedTime'
  | 'sleepHours'
  | 'cardio'
  | 'strength'
  | 'mood'
  | 'klonopinDose'
  | 'wegovyDose';

interface DailyRecord {
  date: string;
  timeOfWakingUp: string | null;
  firstSocialInteraction: string | null;
  firstActivityOrWorkStart: string | null;
  timeOfGoingToBed: string | null;
  sleepHours: string | number | null;
  cardio: string | number | null;
  strength: string | number | null;
  mood: string | number | null;
  klonopinDose: string | number | null;
  wegovyDose: string | number | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

// Defaults from DailyLogForm; spread = raw-unit change that equals ±4 points
// invert: true means higher raw value = worse (e.g. waking up later is negative)
const METRIC_CONFIGS: Record<MetricKey, { defaultVal: number; spread: number; invert?: boolean }> = {
  wakeTime: { defaultVal: 450, spread: 120, invert: true }, // 07:30 = 450 min, ±2 h — earlier is better
  socialTime: { defaultVal: 450, spread: 120 },
  workStart: { defaultVal: 480, spread: 120 }, // 08:00 = 480 min
  bedTime: { defaultVal: 1350, spread: 120 }, // 22:30 = 1350 min
  sleepHours: { defaultVal: 8, spread: 4 }, // 8 h, ±4 h
  cardio: { defaultVal: 0, spread: 60 }, // 0 min, 60 min = +4 pts
  strength: { defaultVal: 0, spread: 60 },
  mood: { defaultVal: 5, spread: 4 }, // already 1–10; maps linearly
  klonopinDose: { defaultVal: 0, spread: 2 }, // 0mg=5, 0.5mg=6, 1mg=7, etc.
  wegovyDose: { defaultVal: 0, spread: 2 }, // 0mg=5, 0.5mg=6, 1mg=7, etc.
};

const METRIC_COLORS: Record<MetricKey, string> = {
  wakeTime: '#5b9bd5',
  socialTime: '#4a89c4',
  workStart: '#3a78b3',
  bedTime: '#2a6799',
  sleepHours: '#d4a853',
  cardio: '#6dbf8a',
  strength: '#5aab77',
  mood: '#c47eb5',
  klonopinDose: '#e07a5f',
  wegovyDose: '#7ec8c8',
};

const METRIC_GROUPS: { label: string; metrics: { key: MetricKey; label: string }[] }[] = [
  {
    label: 'Schedule',
    metrics: [
      { key: 'wakeTime', label: 'Wake Time' },
      { key: 'socialTime', label: 'Social Interaction' },
      { key: 'workStart', label: 'Work Start' },
      { key: 'bedTime', label: 'Bed Time' },
    ],
  },
  {
    label: 'Health',
    metrics: [
      { key: 'mood', label: 'Mood' },
      { key: 'sleepHours', label: 'Sleep Hours' },
      { key: 'cardio', label: 'Cardio' },
      { key: 'strength', label: 'Strength' },
      { key: 'klonopinDose', label: 'Klonopin' },
      { key: 'wegovyDose', label: 'Wegovy' },
    ],
  },
];

const ALL_METRICS = METRIC_GROUPS.flatMap((g) => g.metrics);
const ALL_METRIC_KEYS = ALL_METRICS.map((m) => m.key);
const labelOf = (key: MetricKey) => ALL_METRICS.find((m) => m.key === key)?.label ?? key;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const daysAgoStr = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function tsToMinutes(ts: string | null): number | null {
  if (!ts) return null;
  const m = ts.match(/(\d{2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
}

function normalize(value: number, defaultVal: number, spread: number, invert = false): number {
  const direction = invert ? -1 : 1;
  const n = 5 + direction * ((value - defaultVal) / spread) * 4;
  return Math.round(Math.max(1, Math.min(10, n)) * 10) / 10;
}

function buildChartData(
  records: DailyRecord[],
  metrics: MetricKey[]
): { date: string; [key: string]: number | null | string }[] {
  return records.map((r) => {
    const point: { date: string; [key: string]: number | null | string } = { date: r.date };
    for (const m of metrics) {
      let raw: number | null = null;
      switch (m) {
        case 'wakeTime':
          raw = tsToMinutes(r.timeOfWakingUp);
          break;
        case 'socialTime':
          raw = tsToMinutes(r.firstSocialInteraction);
          break;
        case 'workStart':
          raw = tsToMinutes(r.firstActivityOrWorkStart);
          break;
        case 'bedTime':
          raw = tsToMinutes(r.timeOfGoingToBed);
          break;
        case 'sleepHours':
          raw = r.sleepHours !== null ? Number(r.sleepHours) : null;
          break;
        case 'cardio':
          raw = r.cardio !== null ? Number(r.cardio) : null;
          break;
        case 'strength':
          raw = r.strength !== null ? Number(r.strength) : null;
          break;
        case 'mood':
          raw = r.mood !== null ? Number(r.mood) : null;
          break;
        case 'klonopinDose':
          raw = r.klonopinDose !== null ? Number(r.klonopinDose) : null;
          break;
        case 'wegovyDose':
          raw = r.wegovyDose !== null ? Number(r.wegovyDose) : null;
          break;
      }
      const cfg = METRIC_CONFIGS[m];
      point[m] = raw !== null ? normalize(raw, cfg.defaultVal, cfg.spread, cfg.invert) : null;
    }
    return point;
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyStatsChart() {
  const [startDate, setStartDate] = useState(daysAgoStr(30));
  const [endDate, setEndDate] = useState(todayStr());
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(new Set(['sleepHours', 'wakeTime']));
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecords = useCallback(async (start: string, end: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/daily/range?start=${start}&end=${end}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? 'Failed to fetch');
      }
      const { records: rows } = await res.json();
      setRecords(rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(startDate, endDate);
  }, [startDate, endDate, fetchRecords]);

  const activeMetrics = Array.from(selectedMetrics);
  const chartData = buildChartData(records, activeMetrics);
  const hasData = !loading && chartData.length > 0;

  const allSelected = ALL_METRIC_KEYS.every((k) => selectedMetrics.has(k));

  const toggleAll = () => {
    setSelectedMetrics(allSelected ? new Set() : new Set(ALL_METRIC_KEYS));
  };

  const toggleCategory = (groupLabel: string) => {
    const group = METRIC_GROUPS.find((g) => g.label === groupLabel);
    if (!group) return;
    const keys = group.metrics.map((m) => m.key);
    const allInGroup = keys.every((k) => selectedMetrics.has(k));
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (allInGroup) {
        keys.forEach((k) => next.delete(k));
      } else {
        keys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400&display=swap');

        .daily-wrap {
          font-family: 'DM Mono', monospace;
          color: #e8e4df;
          max-width: 860px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
        }
        .daily-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem; font-weight: 400;
          letter-spacing: -0.02em; margin-bottom: 0.25rem; color: #fff;
        }
        .daily-subtitle {
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.35); margin-bottom: 2.5rem;
        }
        .daily-date-row {
          display: flex; align-items: center; gap: 1.25rem;
          flex-wrap: wrap; margin-bottom: 2rem;
        }
        .daily-ctrl-label {
          font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.4); white-space: nowrap;
        }
        .daily-ctrl-input {
          background: rgba(232,228,223,0.04);
          border: 1px solid rgba(232,228,223,0.12); border-radius: 4px;
          color: #e8e4df; font-family: 'DM Mono', monospace;
          font-size: 0.85rem; padding: 0.5rem 0.75rem;
          outline: none; color-scheme: dark; transition: border-color 0.2s;
        }
        .daily-ctrl-input:focus { border-color: rgba(212,168,83,0.5); }
        .daily-loading {
          font-size: 0.65rem; letter-spacing: 0.15em;
          color: rgba(212,168,83,0.5); text-transform: uppercase;
          animation: daily-pulse 1s ease-in-out infinite;
        }
        @keyframes daily-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .daily-error {
          font-size: 0.7rem; color: #e06c6c; letter-spacing: 0.08em;
          margin-bottom: 1.5rem;
        }
        .daily-selector {
          margin-bottom: 2rem; padding-bottom: 2rem;
          border-bottom: 1px solid rgba(232,228,223,0.08);
        }
        .daily-bulk-row {
          display: flex; align-items: center; gap: 0.5rem;
          margin-bottom: 1.25rem; flex-wrap: wrap;
        }
        .daily-bulk-label {
          font-size: 0.58rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(232,228,223,0.2); margin-right: 0.25rem;
        }
        .daily-bulk-btn {
          font-family: 'DM Mono', monospace; font-size: 0.6rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.22rem 0.6rem; border-radius: 3px;
          border: 1px solid rgba(232,228,223,0.12);
          background: transparent; color: rgba(232,228,223,0.3);
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .daily-bulk-btn:hover { border-color: rgba(232,228,223,0.28); color: rgba(232,228,223,0.6); }
        .daily-bulk-btn.active {
          border-color: rgba(232,228,223,0.4); color: rgba(232,228,223,0.8);
          background: rgba(232,228,223,0.06);
        }
        .daily-group { margin-bottom: 0.85rem; }
        .daily-group:last-child { margin-bottom: 0; }
        .daily-group-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.45rem; }
        .daily-group-toggle {
          font-family: 'DM Mono', monospace; font-size: 0.58rem;
          letter-spacing: 0.22em; text-transform: uppercase;
          background: transparent; border: none; padding: 0;
          color: rgba(232,228,223,0.22); cursor: pointer;
          transition: color 0.15s; user-select: none;
        }
        .daily-group-toggle:hover { color: rgba(232,228,223,0.5); }
        .daily-group-toggle.active { color: rgba(232,228,223,0.6); text-decoration: underline; text-underline-offset: 3px; }
        .daily-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .daily-chip {
          font-family: 'DM Mono', monospace; font-size: 0.62rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.28rem 0.65rem; border-radius: 3px;
          border: 1px solid rgba(232,228,223,0.1);
          background: transparent; color: rgba(232,228,223,0.35);
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .daily-chip:hover { border-color: rgba(232,228,223,0.25); color: rgba(232,228,223,0.6); }
        .daily-card {
          background: rgba(232,228,223,0.02);
          border: 1px solid rgba(232,228,223,0.07);
          border-radius: 8px; padding: 1.75rem;
        }
        .daily-card-header {
          display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 1.5rem;
        }
        .daily-card-title {
          font-family: 'DM Serif Display', serif; font-size: 1rem;
          font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(232,228,223,0.55); margin: 0;
        }
        .daily-card-range {
          font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(232,228,223,0.25);
        }
        .daily-empty {
          text-align: center; padding: 3rem 0;
          font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(232,228,223,0.2);
        }
        .daily-legend {
          display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem;
          margin-top: 1.25rem; padding-top: 1rem;
          border-top: 1px solid rgba(232,228,223,0.06);
        }
        .daily-legend-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(232,228,223,0.5);
        }
        .daily-legend-swatch { width: 18px; height: 2px; border-radius: 1px; flex-shrink: 0; }
        .recharts-reference-line line { stroke: rgba(232,228,223,0.2); }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line { stroke: rgba(232,228,223,0.06); }
        .recharts-text { fill: rgba(232,228,223,0.35); font-family: 'DM Mono', monospace; font-size: 0.62rem; }
        .recharts-tooltip-wrapper { outline: none; }
      `}</style>

      <div className="daily-wrap">
        <h1 className="daily-title">Daily Stats</h1>
        <p className="daily-subtitle">Normalized · 5 = Default · 1–10 Scale</p>

        <div className="daily-date-row">
          <span className="daily-ctrl-label">From</span>
          <input
            type="date"
            className="daily-ctrl-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="daily-ctrl-label">To</span>
          <input
            type="date"
            className="daily-ctrl-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {loading && <span className="daily-loading">Loading…</span>}
        </div>

        <div className="daily-selector">
          <div className="daily-bulk-row">
            <span className="daily-bulk-label">Toggle</span>
            <button className={`daily-bulk-btn${allSelected ? ' active' : ''}`} onClick={toggleAll}>
              All
            </button>
            {METRIC_GROUPS.map((group) => {
              const keys = group.metrics.map((m) => m.key);
              const allInGroup = keys.every((k) => selectedMetrics.has(k));
              return (
                <button
                  key={group.label}
                  className={`daily-bulk-btn${allInGroup ? ' active' : ''}`}
                  onClick={() => toggleCategory(group.label)}
                >
                  {group.label}
                </button>
              );
            })}
          </div>

          {METRIC_GROUPS.map((group) => {
            const keys = group.metrics.map((m) => m.key);
            const allInGroup = keys.every((k) => selectedMetrics.has(k));
            return (
              <div key={group.label} className="daily-group">
                <div className="daily-group-header">
                  <button
                    className={`daily-group-toggle${allInGroup ? ' active' : ''}`}
                    onClick={() => toggleCategory(group.label)}
                  >
                    {group.label}
                  </button>
                </div>
                <div className="daily-chips">
                  {group.metrics.map(({ key, label }) => {
                    const active = selectedMetrics.has(key);
                    const color = METRIC_COLORS[key];
                    return (
                      <button
                        key={key}
                        className="daily-chip"
                        onClick={() => toggleMetric(key)}
                        style={active ? { borderColor: color, color: color, background: `${color}18` } : undefined}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="daily-error">{error}</p>}

        <div className="daily-card">
          <div className="daily-card-header">
            <h2 className="daily-card-title">
              {activeMetrics.length === 1 ? labelOf(activeMetrics[0]) : `${activeMetrics.length} Metrics`}
            </h2>
            <span className="daily-card-range">
              {startDate} → {endDate}
            </span>
          </div>

          {!loading && activeMetrics.length === 0 ? (
            <p className="daily-empty">Select a metric above</p>
          ) : !loading && chartData.length === 0 ? (
            <p className="daily-empty">No data for this range</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    interval="preserveStartEnd"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(232,228,223,0.1)' }}
                  />
                  <YAxis
                    domain={[1, 10]}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <ReferenceLine y={5} stroke="rgba(232,228,223,0.2)" strokeDasharray="4 3" />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(232,228,223,0.12)',
                      borderRadius: 4,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.72rem',
                      color: '#e8e4df',
                    }}
                    labelStyle={{ color: 'rgba(232,228,223,0.5)', marginBottom: 4 }}
                    itemStyle={{ color: '#e8e4df', padding: '1px 0' }}
                  />
                  {activeMetrics.map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={labelOf(key)}
                      stroke={METRIC_COLORS[key]}
                      strokeWidth={2}
                      dot={{ fill: METRIC_COLORS[key], r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: METRIC_COLORS[key] }}
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

              {hasData && activeMetrics.length > 1 && (
                <div className="daily-legend">
                  {activeMetrics.map((key) => (
                    <div key={key} className="daily-legend-item">
                      <div className="daily-legend-swatch" style={{ background: METRIC_COLORS[key] }} />
                      {labelOf(key)}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
