'use client';

import { useEffect, useRef, useState } from 'react';

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

const today = toDateString(new Date());
const sevenDaysAgo = toDateString(new Date(Date.now() - 6 * 86400000));

interface SavedInsight {
  id: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  model: string;
  text: string;
}

export default function InsightsPage() {
  const [start, setStart] = useState(sevenDaysAgo);
  const [end, setEnd] = useState(today);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [history, setHistory] = useState<SavedInsight[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const currentModel = 'claude-opus-4-6';

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const res = await fetch('/api/insights/saved');
      const json = await res.json();
      setHistory(json.records ?? []);
    } catch {
      // non-critical
    }
  }

  async function generate() {
    if (loading) {
      abortRef.current?.abort();
      return;
    }

    setOutput('');
    setError('');
    setSaveStatus('idle');
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/insights?start=${start}&end=${end}`, {
        signal: controller.signal,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Request failed');
      setOutput(json.text ?? '');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/insights/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: start, endDate: end, model: currentModel, text: output }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
      await loadHistory();
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  function formatDateRange(s: string, e: string): string {
    const fmt = (d: string) =>
      new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(s)} – ${fmt(e)}`;
  }

  function formatSavedDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <>
      <style>{`
        .insights-page {
          min-height: 100vh;
          background: #0a0a0f;
          color: #f9fafb;
          font-family: 'DM Mono', monospace;
          padding: 40px 24px 80px;
          max-width: 860px;
          margin: 0 auto;
        }
        h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          font-weight: 400;
          margin: 0 0 8px;
          color: #f9fafb;
        }
        .subtitle {
          color: #6b7280;
          font-size: 0.85rem;
          margin-bottom: 36px;
        }
        .controls {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a78bfa;
          font-weight: 600;
        }
        .field input[type="date"] {
          background: #111118;
          border: 1px solid #1f1f2e;
          border-radius: 8px;
          color: #f9fafb;
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
          padding: 10px 14px;
          outline: none;
          cursor: pointer;
          color-scheme: dark;
        }
        .field input[type="date"]:focus { border-color: #a78bfa; }
        .btn {
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 10px 28px;
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .btn:hover { opacity: 0.85; }
        .btn:disabled { opacity: 0.5; cursor: default; }
        .btn-primary { background: #a78bfa; color: #fff; }
        .btn-primary.loading { background: #374151; }
        .btn-secondary { background: #1f1f2e; color: #d1d5db; border: 1px solid #374151; }
        .output-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          min-height: 36px;
        }
        .save-status-ok { color: #34d399; font-size: 0.82rem; }
        .save-status-err { color: #f87171; font-size: 0.82rem; }
        .output-card {
          background: #111118;
          border: 1px solid #1f1f2e;
          border-radius: 14px;
          padding: 32px;
          line-height: 1.75;
          font-size: 0.88rem;
          color: #e5e7eb;
          white-space: pre-wrap;
          min-height: 120px;
        }
        .output-card h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.25rem;
          font-weight: 400;
          color: #f9fafb;
          margin: 24px 0 8px;
        }
        .output-card h2:first-child { margin-top: 0; }
        .output-card strong { color: #f9fafb; }
        .placeholder { color: #374151; font-style: italic; }
        .error { color: #f87171; }
        .history-section { margin-top: 48px; }
        .history-title {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a78bfa;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .history-item {
          border: 1px solid #1f1f2e;
          border-radius: 10px;
          margin-bottom: 10px;
          overflow: hidden;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          cursor: pointer;
          background: #111118;
          gap: 12px;
        }
        .history-header:hover { background: #16161f; }
        .history-meta { display: flex; flex-direction: column; gap: 3px; }
        .history-range { color: #f9fafb; font-size: 0.88rem; font-weight: 500; }
        .history-date { color: #6b7280; font-size: 0.78rem; }
        .history-chevron { color: #6b7280; font-size: 1.1rem; transition: transform 0.2s; }
        .history-chevron.open { transform: rotate(180deg); }
        .history-body {
          padding: 24px;
          background: #0d0d14;
          border-top: 1px solid #1f1f2e;
          font-size: 0.85rem;
          line-height: 1.75;
          color: #e5e7eb;
          white-space: pre-wrap;
        }
        .history-body h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem;
          font-weight: 400;
          color: #f9fafb;
          margin: 20px 0 6px;
        }
        .history-body h2:first-child { margin-top: 0; }
        .history-body strong { color: #f9fafb; }
        .no-history { color: #374151; font-style: italic; font-size: 0.85rem; }
      `}</style>

      <div className="insights-page">
        <h1>AI Insights</h1>
        <p className="subtitle">Claude analyzes your health data and surfaces patterns, correlations, and anomalies.</p>

        <div className="controls">
          <div className="field">
            <label>From</label>
            <input
              type="date"
              value={start}
              max={end}
              onChange={(e) => setStart(e.target.value)}
              suppressHydrationWarning
            />
          </div>
          <div className="field">
            <label>To</label>
            <input
              type="date"
              value={end}
              min={start}
              max={today}
              onChange={(e) => setEnd(e.target.value)}
              suppressHydrationWarning
            />
          </div>
          <button className={`btn btn-primary${loading ? ' loading' : ''}`} onClick={generate}>
            {loading ? 'Stop' : 'Generate Insights'}
          </button>
        </div>

        {output && (
          <div className="output-actions">
            <button className="btn btn-secondary" onClick={save} disabled={saving || saveStatus === 'saved'}>
              {saving ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : 'Save Insights'}
            </button>
            {saveStatus === 'error' && <span className="save-status-err">Save failed</span>}
          </div>
        )}

        <div className="output-card">
          {error ? (
            <span className="error">{error}</span>
          ) : output ? (
            <FormattedOutput text={output} />
          ) : loading ? (
            <span className="placeholder">Analyzing your data…</span>
          ) : (
            <span className="placeholder">Select a date range and click Generate Insights.</span>
          )}
        </div>

        {/* History */}
        <div className="history-section">
          <div className="history-title">Saved Insights</div>
          {history.length === 0 ? (
            <p className="no-history">No saved insights yet.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-header" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div className="history-meta">
                    <span className="history-range">{formatDateRange(item.startDate, item.endDate)}</span>
                    <span className="history-date">Saved {formatSavedDate(item.createdAt)}</span>
                  </div>
                  <span className={`history-chevron${expandedId === item.id ? ' open' : ''}`}>▾</span>
                </div>
                {expandedId === item.id && (
                  <div className="history-body">
                    <FormattedOutput text={item.text} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function FormattedOutput({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i}>{line.slice(3)}</h2>;
        }
        return (
          <p key={i} style={{ margin: '0 0 4px' }}>
            {renderInline(line)}
          </p>
        );
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
