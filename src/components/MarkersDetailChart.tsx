'use client';
import { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ReferenceArea } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type MetricKey =
  | 'mood'
  | 'energyLevel'
  | 'anxiety'
  | 'depression'
  | 'moodSwings'
  | 'racingThoughts'
  | 'triggersOrMajorStressors'
  | 'motivation'
  | 'productivity'
  | 'tremors'
  | 'dizziness'
  | 'headaches'
  | 'heartPalpitations'
  | 'nightSweats'
  | 'wife'
  | 'kids'
  | 'family'
  | 'friends'
  | 'neighbors'
  | 'coWorkers';

interface MarkersRecord {
  date: string;
  period: string;
  [key: string]: string | number | null;
}

interface DataPoint {
  x: string;
  date: string;
  period: string;
  [key: string]: string | number | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PERIOD_ORDER = ['morning', 'afternoon', 'evening', 'night'];
const PERIOD_BG: Record<string, string> = {
  morning: 'rgba(255,210,100,0.07)',
  afternoon: 'rgba(255,245,200,0.04)',
  evening: 'rgba(210,120,60,0.09)',
  night: 'rgba(70,90,180,0.12)',
};
const PERIOD_SHORT: Record<string, string> = {
  morning: 'AM',
  afternoon: 'PM',
  evening: 'Eve',
  night: 'Night',
};

const METRIC_COLORS: Record<MetricKey, string> = {
  mood: '#d4a853',
  energyLevel: '#f0c060',
  motivation: '#c9953c',
  productivity: '#a8832e',
  anxiety: '#e06c6c',
  depression: '#c45555',
  moodSwings: '#d47a6a',
  racingThoughts: '#e09090',
  triggersOrMajorStressors: '#b85050',
  tremors: '#d46b8a',
  dizziness: '#c46080',
  headaches: '#e07898',
  heartPalpitations: '#b84d70',
  nightSweats: '#d48ab0',
  wife: '#6dbf8a',
  kids: '#5aab77',
  family: '#82cfa0',
  friends: '#4d9e6b',
  neighbors: '#70b88d',
  coWorkers: '#3d8a5d',
};

const METRIC_GROUPS: { label: string; metrics: { key: MetricKey; label: string }[] }[] = [
  {
    label: 'Mental (Positive)',
    metrics: [
      { key: 'mood', label: 'Mood' },
      { key: 'energyLevel', label: 'Energy Level' },
      { key: 'motivation', label: 'Motivation' },
      { key: 'productivity', label: 'Productivity' },
    ],
  },
  {
    label: 'Mental (Negative)',
    metrics: [
      { key: 'anxiety', label: 'Anxiety' },
      { key: 'depression', label: 'Depression' },
      { key: 'moodSwings', label: 'Mood Swings' },
      { key: 'racingThoughts', label: 'Racing Thoughts' },
      { key: 'triggersOrMajorStressors', label: 'Triggers / Stressors' },
    ],
  },
  {
    label: 'Physical',
    metrics: [
      { key: 'tremors', label: 'Tremors' },
      { key: 'dizziness', label: 'Dizziness' },
      { key: 'headaches', label: 'Headaches' },
      { key: 'heartPalpitations', label: 'Heart Palpitations' },
      { key: 'nightSweats', label: 'Night Sweats' },
    ],
  },
  {
    label: 'Social',
    metrics: [
      { key: 'wife', label: 'Wife' },
      { key: 'kids', label: 'Kids' },
      { key: 'family', label: 'Family' },
      { key: 'friends', label: 'Friends' },
      { key: 'neighbors', label: 'Neighbors' },
      { key: 'coWorkers', label: 'Co-Workers' },
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

function buildRawData(records: MarkersRecord[], metrics: MetricKey[]): DataPoint[] {
  const sorted = [...records].sort((a, b) => {
    const dc = a.date.localeCompare(b.date);
    if (dc !== 0) return dc;
    return PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period);
  });

  return sorted.map((r) => {
    const point: DataPoint = {
      x: `${r.date} ${PERIOD_SHORT[r.period] ?? r.period}`,
      date: r.date,
      period: r.period,
    };
    for (const m of metrics) {
      const val = r[m];
      point[m] = val !== null && val !== undefined && val !== '' ? Number(val) : null;
    }
    return point;
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarkersDetailChart() {
  const [startDate, setStartDate] = useState(daysAgoStr(7));
  const [endDate, setEndDate] = useState(todayStr());
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(new Set(['mood']));
  const [records, setRecords] = useState<MarkersRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shiftRange = (direction: -1 | 1) => {
    const s = new Date(startDate + 'T00:00:00');
    const e = new Date(endDate + 'T00:00:00');
    const span = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
    s.setDate(s.getDate() + direction * span);
    e.setDate(e.getDate() + direction * span);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setStartDate(fmt(s));
    setEndDate(fmt(e));
  };

  const setPreset = (days: number) => {
    setEndDate(todayStr());
    setStartDate(daysAgoStr(days - 1));
  };

  const fetchRecords = useCallback(async (start: string, end: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/markers/range?start=${start}&end=${end}`);
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
  const chartData = buildRawData(records, activeMetrics);
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

        .detail-wrap {
          font-family: 'DM Mono', monospace;
          color: #e8e4df;
          max-width: 860px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
        }
        .detail-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem; font-weight: 400;
          letter-spacing: -0.02em; margin-bottom: 0.25rem; color: #fff;
        }
        .detail-subtitle {
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.35); margin-bottom: 2.5rem;
        }

        /* Date controls */
        .detail-date-row {
          display: flex; align-items: center; gap: 1.25rem;
          flex-wrap: wrap; margin-bottom: 2rem;
        }
        .detail-ctrl-label {
          font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.4); white-space: nowrap;
        }
        .detail-ctrl-input {
          background: rgba(232,228,223,0.04);
          border: 1px solid rgba(232,228,223,0.12); border-radius: 4px;
          color: #e8e4df; font-family: 'DM Mono', monospace;
          font-size: 0.85rem; padding: 0.5rem 0.75rem;
          outline: none; color-scheme: dark; transition: border-color 0.2s;
        }
        .detail-ctrl-input:focus { border-color: rgba(212,168,83,0.5); }
        .detail-nav-btn {
          background: rgba(232,228,223,0.04);
          border: 1px solid rgba(232,228,223,0.12); border-radius: 4px;
          color: rgba(232,228,223,0.45); font-family: 'DM Mono', monospace;
          font-size: 0.8rem; padding: 0.5rem 0.75rem;
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .detail-nav-btn:hover { border-color: rgba(232,228,223,0.28); color: rgba(232,228,223,0.7); }
        .detail-preset-btn {
          font-family: 'DM Mono', monospace; font-size: 0.6rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.6rem; border-radius: 3px;
          border: 1px solid rgba(232,228,223,0.1);
          background: transparent; color: rgba(232,228,223,0.3);
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .detail-preset-btn:hover { border-color: rgba(232,228,223,0.25); color: rgba(232,228,223,0.6); }
        .detail-loading {
          font-size: 0.65rem; letter-spacing: 0.15em;
          color: rgba(212,168,83,0.5); text-transform: uppercase;
          animation: detail-pulse 1s ease-in-out infinite;
        }
        @keyframes detail-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .detail-error {
          font-size: 0.7rem; color: #e06c6c; letter-spacing: 0.08em;
          margin-bottom: 1.5rem;
        }

        /* Metric selector */
        .detail-selector {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(232,228,223,0.08);
        }
        .detail-bulk-row {
          display: flex; align-items: center; gap: 0.5rem;
          margin-bottom: 1.25rem; flex-wrap: wrap;
        }
        .detail-bulk-label {
          font-size: 0.58rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(232,228,223,0.2); margin-right: 0.25rem;
        }
        .detail-bulk-btn {
          font-family: 'DM Mono', monospace; font-size: 0.6rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.22rem 0.6rem; border-radius: 3px;
          border: 1px solid rgba(232,228,223,0.12);
          background: transparent; color: rgba(232,228,223,0.3);
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .detail-bulk-btn:hover { border-color: rgba(232,228,223,0.28); color: rgba(232,228,223,0.6); }
        .detail-bulk-btn.active {
          border-color: rgba(232,228,223,0.4); color: rgba(232,228,223,0.8);
          background: rgba(232,228,223,0.06);
        }
        .detail-group { margin-bottom: 0.85rem; }
        .detail-group:last-child { margin-bottom: 0; }
        .detail-group-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.45rem; }
        .detail-group-toggle {
          font-family: 'DM Mono', monospace; font-size: 0.58rem;
          letter-spacing: 0.22em; text-transform: uppercase;
          background: transparent; border: none; padding: 0;
          color: rgba(232,228,223,0.22); cursor: pointer;
          transition: color 0.15s; user-select: none;
        }
        .detail-group-toggle:hover { color: rgba(232,228,223,0.5); }
        .detail-group-toggle.active { color: rgba(232,228,223,0.6); text-decoration: underline; text-underline-offset: 3px; }
        .detail-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .detail-chip {
          font-family: 'DM Mono', monospace; font-size: 0.62rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.28rem 0.65rem; border-radius: 3px;
          border: 1px solid rgba(232,228,223,0.1);
          background: transparent; color: rgba(232,228,223,0.35);
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .detail-chip:hover { border-color: rgba(232,228,223,0.25); color: rgba(232,228,223,0.6); }

        /* Chart card */
        .detail-card {
          background: rgba(232,228,223,0.02);
          border: 1px solid rgba(232,228,223,0.07);
          border-radius: 8px; padding: 1.75rem;
        }
        .detail-card-header {
          display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 1.5rem;
        }
        .detail-card-title {
          font-family: 'DM Serif Display', serif; font-size: 1rem;
          font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(232,228,223,0.55); margin: 0;
        }
        .detail-card-range {
          font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(232,228,223,0.25);
        }
        .detail-empty {
          text-align: center; padding: 3rem 0;
          font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(232,228,223,0.2);
        }

        /* Period band legend */
        .period-legend {
          display: flex; gap: 1.25rem; flex-wrap: wrap;
          margin-top: 1rem; padding-top: 0.85rem;
          border-top: 1px solid rgba(232,228,223,0.06);
        }
        .period-legend-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(232,228,223,0.35);
        }
        .period-swatch {
          width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0;
        }

        /* Legend */
        .detail-legend {
          display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem;
          margin-top: 1.25rem; padding-top: 1rem;
          border-top: 1px solid rgba(232,228,223,0.06);
        }
        .detail-legend-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(232,228,223,0.5);
        }
        .detail-legend-swatch {
          width: 18px; height: 2px; border-radius: 1px; flex-shrink: 0;
        }

        /* Recharts overrides */
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line { stroke: rgba(232,228,223,0.06); }
        .recharts-text { fill: rgba(232,228,223,0.35); font-family: 'DM Mono', monospace; font-size: 0.62rem; }
        .recharts-tooltip-wrapper { outline: none; }
      `}</style>

      <div className="detail-wrap">
        <h1 className="detail-title">Markers Detail</h1>
        <p className="detail-subtitle">Unaveraged · Per Entry</p>

        {/* Date range */}
        <div className="detail-date-row">
          <button className="detail-nav-btn" onClick={() => shiftRange(-1)}>←</button>
          <span className="detail-ctrl-label">From</span>
          <input
            type="date"
            className="detail-ctrl-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="detail-ctrl-label">To</span>
          <input
            type="date"
            className="detail-ctrl-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="detail-nav-btn" onClick={() => shiftRange(1)}>→</button>
          {[7, 14, 30].map((d) => (
            <button key={d} className="detail-preset-btn" onClick={() => setPreset(d)}>
              {d}d
            </button>
          ))}
          {loading && <span className="detail-loading">Loading…</span>}
        </div>

        {/* Metric selector */}
        <div className="detail-selector">
          <div className="detail-bulk-row">
            <span className="detail-bulk-label">Toggle</span>
            <button className={`detail-bulk-btn${allSelected ? ' active' : ''}`} onClick={toggleAll}>
              All
            </button>
            {METRIC_GROUPS.map((group) => {
              const keys = group.metrics.map((m) => m.key);
              const allInGroup = keys.every((k) => selectedMetrics.has(k));
              return (
                <button
                  key={group.label}
                  className={`detail-bulk-btn${allInGroup ? ' active' : ''}`}
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
              <div key={group.label} className="detail-group">
                <div className="detail-group-header">
                  <button
                    className={`detail-group-toggle${allInGroup ? ' active' : ''}`}
                    onClick={() => toggleCategory(group.label)}
                  >
                    {group.label}
                  </button>
                </div>
                <div className="detail-chips">
                  {group.metrics.map(({ key, label }) => {
                    const active = selectedMetrics.has(key);
                    const color = METRIC_COLORS[key];
                    return (
                      <button
                        key={key}
                        className="detail-chip"
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

        {error && <p className="detail-error">{error}</p>}

        <div className="detail-card">
          <div className="detail-card-header">
            <h2 className="detail-card-title">
              {activeMetrics.length === 1 ? labelOf(activeMetrics[0]) : `${activeMetrics.length} Metrics`}
            </h2>
            <span className="detail-card-range">
              {startDate} → {endDate}
            </span>
          </div>

          {!loading && activeMetrics.length === 0 ? (
            <p className="detail-empty">Select a metric above</p>
          ) : !loading && chartData.length === 0 ? (
            <p className="detail-empty">No data for this range</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    interval="preserveStartEnd"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(232,228,223,0.1)' }}
                  />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                  {chartData.map((point) => (
                    <ReferenceArea
                      key={point.x}
                      x1={point.x}
                      x2={point.x}
                      fill={PERIOD_BG[point.period] ?? 'transparent'}
                      strokeOpacity={0}
                      ifOverflow="visible"
                    />
                  ))}
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
                <div className="detail-legend">
                  {activeMetrics.map((key) => (
                    <div key={key} className="detail-legend-item">
                      <div className="detail-legend-swatch" style={{ background: METRIC_COLORS[key] }} />
                      {labelOf(key)}
                    </div>
                  ))}
                </div>
              )}
              {hasData && (
                <div className="period-legend">
                  {PERIOD_ORDER.map((p) => (
                    <div key={p} className="period-legend-item">
                      <div className="period-swatch" style={{ background: PERIOD_BG[p] ?? 'transparent', border: '1px solid rgba(232,228,223,0.1)' }} />
                      {p}
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
