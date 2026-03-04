'use client';
import { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

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

interface PeriodRecord {
  date: string;
  period: string;
  [key: string]: string | number | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

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
    label: 'Mental State',
    metrics: [
      { key: 'mood', label: 'Mood' },
      { key: 'energyLevel', label: 'Energy Level' },
      { key: 'motivation', label: 'Motivation' },
      { key: 'productivity', label: 'Productivity' },
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

function buildChartData(
  records: PeriodRecord[],
  metrics: MetricKey[]
): { date: string; [key: string]: number | null | string }[] {
  const byDate: Record<string, Partial<Record<MetricKey, number[]>>> = {};
  for (const r of records) {
    if (!byDate[r.date]) byDate[r.date] = {};
    for (const m of metrics) {
      const val = r[m];
      if (val !== null && val !== undefined && val !== '') {
        if (!byDate[r.date][m]) byDate[r.date][m] = [];
        byDate[r.date][m]!.push(Number(val));
      }
    }
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, metricVals]) => {
      const point: { date: string; [key: string]: number | null | string } = { date };
      for (const m of metrics) {
        const vals = metricVals[m];
        point[m] =
          vals && vals.length > 0 ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : null;
      }
      return point;
    });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PeriodChart() {
  const [startDate, setStartDate] = useState(daysAgoStr(7));
  const [endDate, setEndDate] = useState(todayStr());
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(new Set(['mood']));
  const [records, setRecords] = useState<PeriodRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecords = useCallback(async (start: string, end: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/period/range?start=${start}&end=${end}`);
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

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key); // keep at least one
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

        .chart-wrap {
          font-family: 'DM Mono', monospace;
          color: #e8e4df;
          max-width: 860px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
        }
        .chart-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem; font-weight: 400;
          letter-spacing: -0.02em; margin-bottom: 0.25rem; color: #fff;
        }
        .chart-subtitle {
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.35); margin-bottom: 2.5rem;
        }

        /* Date controls */
        .date-row {
          display: flex; align-items: center; gap: 1.25rem;
          flex-wrap: wrap; margin-bottom: 2rem;
        }
        .ctrl-label {
          font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.4); white-space: nowrap;
        }
        .ctrl-input {
          background: rgba(232,228,223,0.04);
          border: 1px solid rgba(232,228,223,0.12); border-radius: 4px;
          color: #e8e4df; font-family: 'DM Mono', monospace;
          font-size: 0.85rem; padding: 0.5rem 0.75rem;
          outline: none; color-scheme: dark; transition: border-color 0.2s;
        }
        .ctrl-input:focus { border-color: rgba(212,168,83,0.5); }
        .loading-indicator {
          font-size: 0.65rem; letter-spacing: 0.15em;
          color: rgba(212,168,83,0.5); text-transform: uppercase;
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .error-msg {
          font-size: 0.7rem; color: #e06c6c; letter-spacing: 0.08em;
          margin-bottom: 1.5rem;
        }

        /* Metric selector */
        .metric-selector {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(232,228,223,0.08);
        }
        .metric-group { margin-bottom: 0.85rem; }
        .metric-group:last-child { margin-bottom: 0; }
        .metric-group-label {
          font-size: 0.58rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(232,228,223,0.22); margin-bottom: 0.45rem;
        }
        .metric-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .metric-chip {
          font-family: 'DM Mono', monospace; font-size: 0.62rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.28rem 0.65rem; border-radius: 3px;
          border: 1px solid rgba(232,228,223,0.1);
          background: transparent; color: rgba(232,228,223,0.35);
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .metric-chip:hover { border-color: rgba(232,228,223,0.25); color: rgba(232,228,223,0.6); }

        /* Chart card */
        .chart-card {
          background: rgba(232,228,223,0.02);
          border: 1px solid rgba(232,228,223,0.07);
          border-radius: 8px; padding: 1.75rem;
        }
        .chart-card-header {
          display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 1.5rem;
        }
        .chart-card-title {
          font-family: 'DM Serif Display', serif; font-size: 1rem;
          font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(232,228,223,0.55); margin: 0;
        }
        .chart-card-range {
          font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(232,228,223,0.25);
        }
        .empty-state {
          text-align: center; padding: 3rem 0;
          font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(232,228,223,0.2);
        }

        /* Legend */
        .chart-legend {
          display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem;
          margin-top: 1.25rem; padding-top: 1rem;
          border-top: 1px solid rgba(232,228,223,0.06);
        }
        .legend-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(232,228,223,0.5);
        }
        .legend-swatch {
          width: 18px; height: 2px; border-radius: 1px; flex-shrink: 0;
        }

        /* Recharts overrides */
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: rgba(232,228,223,0.06);
        }
        .recharts-text { fill: rgba(232,228,223,0.35); font-family: 'DM Mono', monospace; font-size: 0.62rem; }
        .recharts-tooltip-wrapper { outline: none; }
      `}</style>

      <div className="chart-wrap">
        <h1 className="chart-title">Period Chart</h1>
        <p className="chart-subtitle">Trends · Averaged Daily</p>

        {/* Date range */}
        <div className="date-row">
          <span className="ctrl-label">From</span>
          <input type="date" className="ctrl-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="ctrl-label">To</span>
          <input type="date" className="ctrl-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          {loading && <span className="loading-indicator">Loading…</span>}
        </div>

        {/* Metric selector */}
        <div className="metric-selector">
          {METRIC_GROUPS.map((group) => (
            <div key={group.label} className="metric-group">
              <p className="metric-group-label">{group.label}</p>
              <div className="metric-chips">
                {group.metrics.map(({ key, label }) => {
                  const active = selectedMetrics.has(key);
                  const color = METRIC_COLORS[key];
                  return (
                    <button
                      key={key}
                      className="metric-chip"
                      onClick={() => toggleMetric(key)}
                      style={
                        active
                          ? {
                              borderColor: color,
                              color: color,
                              background: `${color}18`,
                            }
                          : undefined
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="chart-card">
          <div className="chart-card-header">
            <h2 className="chart-card-title">
              {activeMetrics.length === 1 ? labelOf(activeMetrics[0]) : `${activeMetrics.length} Metrics`}
            </h2>
            <span className="chart-card-range">
              {startDate} → {endDate}
            </span>
          </div>

          {!loading && chartData.length === 0 ? (
            <p className="empty-state">No data for this range</p>
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
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
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
                <div className="chart-legend">
                  {activeMetrics.map((key) => (
                    <div key={key} className="legend-item">
                      <div className="legend-swatch" style={{ background: METRIC_COLORS[key] }} />
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
