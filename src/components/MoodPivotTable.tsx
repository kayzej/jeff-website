'use client';
import { useState, useEffect, useCallback } from 'react';

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

type Period = 'morning' | 'afternoon' | 'evening' | 'night';

interface MarkersRecord {
  period: Period;
  [key: string]: string | number | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PERIODS: Period[] = ['morning', 'afternoon', 'evening', 'night'];

const METRIC_GROUPS: { label: string; metrics: { key: MetricKey; label: string; positive: boolean }[] }[] = [
  {
    label: 'Mental (Positive)',
    metrics: [
      { key: 'mood', label: 'Mood', positive: true },
      { key: 'energyLevel', label: 'Energy Level', positive: true },
      { key: 'motivation', label: 'Motivation', positive: true },
      { key: 'productivity', label: 'Productivity', positive: true },
    ],
  },
  {
    label: 'Mental (Negative)',
    metrics: [
      { key: 'anxiety', label: 'Anxiety', positive: false },
      { key: 'depression', label: 'Depression', positive: false },
      { key: 'moodSwings', label: 'Mood Swings', positive: false },
      { key: 'racingThoughts', label: 'Racing Thoughts', positive: false },
      { key: 'triggersOrMajorStressors', label: 'Triggers', positive: false },
    ],
  },
  {
    label: 'Physical',
    metrics: [
      { key: 'tremors', label: 'Tremors', positive: false },
      { key: 'dizziness', label: 'Dizziness', positive: false },
      { key: 'headaches', label: 'Headaches', positive: false },
      { key: 'heartPalpitations', label: 'Heart Palp.', positive: false },
      { key: 'nightSweats', label: 'Night Sweats', positive: false },
    ],
  },
  {
    label: 'Social',
    metrics: [
      { key: 'wife', label: 'Wife', positive: true },
      { key: 'kids', label: 'Kids', positive: true },
      { key: 'family', label: 'Family', positive: true },
      { key: 'friends', label: 'Friends', positive: true },
      { key: 'neighbors', label: 'Neighbors', positive: true },
      { key: 'coWorkers', label: 'Co-Workers', positive: true },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getVal(records: MarkersRecord[], period: Period, key: MetricKey): number | null {
  const rec = records.find((r) => r.period === period);
  if (!rec) return null;
  const v = rec[key];
  if (v === null || v === undefined || v === '') return null;
  return Number(v);
}

function rowAvg(records: MarkersRecord[], key: MetricKey): number | null {
  const vals = PERIODS.map((p) => getVal(records, p, key)).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
}

function groupAvg(records: MarkersRecord[], metrics: { key: MetricKey }[]): number | null {
  const vals: number[] = [];
  for (const { key } of metrics) {
    const v = rowAvg(records, key);
    if (v !== null) vals.push(v);
  }
  if (!vals.length) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
}

// value 0–10 → color (green = good, red = bad, polarity-aware)
function cellColor(value: number, positive: boolean): string {
  const score = positive ? value / 10 : 1 - value / 10;
  if (score < 0.5) {
    const t = score * 2;
    return `rgb(${Math.round(196 + 16 * t)},${Math.round(85 + 83 * t)},${Math.round(42 + 41 * t)})`;
  } else {
    const t = (score - 0.5) * 2;
    return `rgb(${Math.round(212 - 103 * t)},${Math.round(168 + 23 * t)},${Math.round(83 + 55 * t)})`;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MoodPivotTable() {
  const [date, setDate] = useState(todayStr());
  const [records, setRecords] = useState<MarkersRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(METRIC_GROUPS.map((g) => g.label)));

  const fetchRecords = useCallback(async (d: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/markers?date=${d}`);
      if (!res.ok) throw new Error((await res.json()).message ?? 'Failed to fetch');
      const { records: rows } = await res.json();
      setRecords(rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(date);
  }, [date, fetchRecords]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const periodsPresent = PERIODS.filter((p) => records.some((r) => r.period === p));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400&display=swap');

        .pv-wrap {
          font-family: 'DM Mono', monospace;
          color: #e8e4df;
          max-width: 760px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
        }
        .pv-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem; font-weight: 400;
          letter-spacing: -0.02em; margin-bottom: 0.25rem; color: #fff;
        }
        .pv-subtitle {
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,228,223,0.35); margin-bottom: 2.5rem;
        }

        /* Date controls */
        .ctrl-row {
          display: flex; align-items: center; gap: 1rem;
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
        .nav-btn {
          background: rgba(232,228,223,0.04);
          border: 1px solid rgba(232,228,223,0.12); border-radius: 4px;
          color: rgba(232,228,223,0.45); font-family: 'DM Mono', monospace;
          font-size: 0.8rem; padding: 0.5rem 0.75rem;
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .nav-btn:hover { border-color: rgba(232,228,223,0.28); color: rgba(232,228,223,0.7); }
        .loading-indicator {
          font-size: 0.65rem; letter-spacing: 0.15em;
          color: rgba(212,168,83,0.5); text-transform: uppercase;
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .error-msg { font-size: 0.7rem; color: #e06c6c; margin-bottom: 1rem; }

        /* Table */
        .table-scroll {
          overflow-x: auto;
          border: 1px solid rgba(232,228,223,0.07);
          border-radius: 8px;
        }
        .pivot-table {
          border-collapse: collapse; width: 100%;
          font-size: 0.74rem;
        }
        .pivot-table th, .pivot-table td {
          padding: 0.45rem 0.85rem;
          border-bottom: 1px solid rgba(232,228,223,0.055);
          white-space: nowrap;
        }
        .pivot-table thead th {
          background: rgba(232,228,223,0.03);
          border-bottom: 1px solid rgba(232,228,223,0.1);
          font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(232,228,223,0.4); font-weight: 400;
          text-align: center;
        }
        .pivot-table thead th.metric-col { text-align: left; }

        /* Sticky metric column */
        .metric-col {
          min-width: 140px; text-align: left;
          position: sticky; left: 0; z-index: 2;
          background: #0d0d14;
        }
        .pivot-table thead .metric-col { z-index: 3; }

        /* Sticky avg column */
        .avg-col {
          min-width: 58px; text-align: center;
          border-left: 1px solid rgba(232,228,223,0.08);
          position: sticky; right: 0; z-index: 2;
          background: #0d0d14;
          color: rgba(232,228,223,0.5);
        }
        .pivot-table thead .avg-col { z-index: 3; }

        /* Group rows */
        .group-row { cursor: pointer; user-select: none; }
        .group-row:hover td { background: rgba(232,228,223,0.03); }
        .group-row td {
          background: rgba(232,228,223,0.02);
          padding: 0.55rem 0.85rem;
          border-bottom: 1px solid rgba(232,228,223,0.07);
        }
        .group-label {
          font-size: 0.58rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(232,228,223,0.35);
        }
        .group-avg {
          text-align: center; font-size: 0.7rem; font-weight: bold;
          border-left: 1px solid rgba(232,228,223,0.08);
          position: sticky; right: 0;
          background: rgba(20,20,30,1);
        }
        .group-row:hover .group-avg { background: rgba(24,24,36,1); }
        .group-toggle { margin-right: 0.45rem; opacity: 0.4; font-size: 0.5rem; }

        /* Metric rows */
        .metric-row:hover td { background: rgba(232,228,223,0.018); }
        .metric-label {
          color: rgba(232,228,223,0.5);
          position: sticky; left: 0;
          background: #0d0d14;
        }
        .metric-row:hover .metric-label,
        .metric-row:hover .avg-cell { background: rgba(20,20,28,1); }

        /* Cells */
        .cell { text-align: center; font-variant-numeric: tabular-nums; }
        .avg-cell {
          text-align: center; font-variant-numeric: tabular-nums;
          border-left: 1px solid rgba(232,228,223,0.08);
          position: sticky; right: 0;
          background: #0d0d14;
        }
        .null-val { color: rgba(232,228,223,0.13); }

        /* No data */
        .no-data {
          text-align: center; padding: 3rem 0;
          font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(232,228,223,0.2);
        }
      `}</style>

      <div className="pv-wrap">
        <h1 className="pv-title">Mood Pivot</h1>
        <p className="pv-subtitle">Daily breakdown · click groups to expand or collapse</p>

        {/* Date picker + prev/next */}
        <div className="ctrl-row">
          <button
            className="nav-btn"
            onClick={() => {
              const d = new Date(date + 'T00:00:00');
              d.setDate(d.getDate() - 1);
              setDate(d.toISOString().slice(0, 10));
            }}
          >
            ←
          </button>
          <input type="date" className="ctrl-input" value={date} onChange={(e) => setDate(e.target.value)} />
          <button
            className="nav-btn"
            onClick={() => {
              const d = new Date(date + 'T00:00:00');
              d.setDate(d.getDate() + 1);
              setDate(d.toISOString().slice(0, 10));
            }}
          >
            →
          </button>
          {loading && <span className="loading-indicator">Loading…</span>}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="table-scroll">
          <table className="pivot-table">
            <thead>
              <tr>
                <th className="metric-col">Metric</th>
                {PERIODS.map((p) => (
                  <th
                    key={p}
                    style={
                      periodsPresent.includes(p) ? { color: 'rgba(232,228,223,0.55)' } : undefined
                    }
                  >
                    {p}
                  </th>
                ))}
                <th className="avg-col">Avg</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    No data for this date
                  </td>
                </tr>
              ) : (
                METRIC_GROUPS.map((group) => {
                  const expanded = expandedGroups.has(group.label);
                  const gAvg = groupAvg(records, group.metrics);
                  // find a representative positive flag for the group avg color
                  const allPositive = group.metrics.every((m) => m.positive);
                  return (
                    <>
                      {/* Group header row */}
                      <tr
                        key={`grp-${group.label}`}
                        className="group-row"
                        onClick={() => toggleGroup(group.label)}
                      >
                        <td className="metric-col" style={{ paddingLeft: '0.85rem' }}>
                          <span className="group-label">
                            <span className="group-toggle">{expanded ? '▼' : '▶'}</span>
                            {group.label}
                          </span>
                        </td>
                        {PERIODS.map((p) => {
                          const periodGroupAvg = (() => {
                            const vals = group.metrics
                              .map((m) => getVal(records, p, m.key))
                              .filter((v): v is number => v !== null);
                            if (!vals.length) return null;
                            return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
                          })();
                          return (
                            <td
                              key={p}
                              className="cell"
                              style={
                                periodGroupAvg !== null
                                  ? {
                                      color: cellColor(periodGroupAvg, allPositive),
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                    }
                                  : undefined
                              }
                            >
                              {periodGroupAvg !== null ? periodGroupAvg : <span className="null-val">—</span>}
                            </td>
                          );
                        })}
                        <td
                          className="group-avg"
                          style={gAvg !== null ? { color: cellColor(gAvg, allPositive) } : undefined}
                        >
                          {gAvg !== null ? gAvg : <span className="null-val">—</span>}
                        </td>
                      </tr>

                      {/* Metric rows (shown when expanded) */}
                      {expanded &&
                        group.metrics.map(({ key, label, positive }) => {
                          const avg = rowAvg(records, key);
                          return (
                            <tr key={key} className="metric-row">
                              <td className="metric-col metric-label" style={{ paddingLeft: '1.75rem' }}>
                                {label}
                              </td>
                              {PERIODS.map((p) => {
                                const val = getVal(records, p, key);
                                return (
                                  <td
                                    key={p}
                                    className="cell"
                                    style={
                                      val !== null
                                        ? {
                                            color: cellColor(val, positive),
                                            background: `${cellColor(val, positive)}18`,
                                          }
                                        : undefined
                                    }
                                  >
                                    {val !== null ? val : <span className="null-val">—</span>}
                                  </td>
                                );
                              })}
                              <td
                                className="avg-cell"
                                style={avg !== null ? { color: cellColor(avg, positive), fontWeight: 'bold' } : undefined}
                              >
                                {avg !== null ? avg : <span className="null-val">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
