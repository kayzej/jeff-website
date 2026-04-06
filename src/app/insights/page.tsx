'use client';

import { useRef, useState } from 'react';

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

const today = toDateString(new Date());
const sevenDaysAgo = toDateString(new Date(Date.now() - 6 * 86400000));

export default function InsightsPage() {
  const [start, setStart] = useState(sevenDaysAgo);
  const [end, setEnd] = useState(today);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    if (loading) {
      abortRef.current?.abort();
      return;
    }

    setOutput('');
    setError('');
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
          margin-bottom: 32px;
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
        .field input[type="date"]:focus {
          border-color: #a78bfa;
        }
        .generate-btn {
          background: #a78bfa;
          border: none;
          border-radius: 10px;
          color: #fff;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 10px 28px;
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .generate-btn:hover { opacity: 0.85; }
        .generate-btn.loading { background: #374151; }
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
        .placeholder {
          color: #374151;
          font-style: italic;
        }
        .error { color: #f87171; }
        .cursor {
          display: inline-block;
          width: 8px;
          height: 1em;
          background: #a78bfa;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
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
          <button className={`generate-btn${loading ? ' loading' : ''}`} onClick={generate}>
            {loading ? 'Stop' : 'Generate Insights'}
          </button>
        </div>

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
      </div>
    </>
  );
}

// Renders markdown headings (##) and bold (**text**) without a dependency
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
