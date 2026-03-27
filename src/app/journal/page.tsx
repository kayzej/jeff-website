'use client';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

type Period = 'morning' | 'afternoon' | 'evening' | 'night';

interface JournalEntry {
  date: string;
  period: Period;
  thoughtsFeelingsReflections: string;
}

interface GroupedEntries {
  date: string;
  entries: JournalEntry[];
}

const PERIOD_LABELS: Record<Period, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

const PERIOD_ICONS: Record<Period, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌆',
  night: '🌙',
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function JournalPage() {
  const [groups, setGroups] = useState<GroupedEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/journal')
      .then((r) => r.json())
      .then((data) => {
        const entries: JournalEntry[] = data.entries ?? [];
        // Group by date
        const map: Record<string, JournalEntry[]> = {};
        for (const entry of entries) {
          const key = entry.date.split('T')[0];
          if (!map[key]) map[key] = [];
          map[key].push(entry);
        }
        const sorted = Object.entries(map)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, entries]) => ({ date, entries }));
        setGroups(sorted);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', padding: '2rem 1rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');
        .journal-title {
          font-family: 'DM Serif Display', serif;
          color: #f5c842;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          letter-spacing: 0.02em;
        }
        .date-group {
          margin-bottom: 2.5rem;
        }
        .date-heading {
          font-family: 'DM Mono', monospace;
          color: #a0a0b0;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #2a2a3a;
        }
        .entry-card {
          background: #13131f;
          border: 1px solid #2a2a3a;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
        }
        .entry-period {
          font-family: 'DM Mono', monospace;
          color: #f5c842;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          margin-bottom: 0.6rem;
        }
        .entry-text {
          font-family: 'DM Mono', monospace;
          color: #d0d0e0;
          font-size: 0.95rem;
          line-height: 1.7;
          white-space: pre-wrap;
          margin: 0;
        }
        .empty-state {
          font-family: 'DM Mono', monospace;
          color: #606070;
          font-size: 1rem;
          text-align: center;
          margin-top: 4rem;
        }
      `}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 className="journal-title">Journal</h1>

        {loading && <p className="empty-state">Loading…</p>}
        {error && (
          <p className="empty-state" style={{ color: '#e05555' }}>
            Error: {error}
          </p>
        )}

        {!loading && !error && groups.length === 0 && <p className="empty-state">No journal entries yet.</p>}

        {groups.map(({ date, entries }) => (
          <div key={date} className="date-group">
            <div className="date-heading">{formatDate(date)}</div>
            {entries.map((entry) => (
              <div key={entry.period} className="entry-card">
                <div className="entry-period">
                  {PERIOD_ICONS[entry.period]} {PERIOD_LABELS[entry.period]}
                </div>
                <p className="entry-text">{entry.thoughtsFeelingsReflections}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
