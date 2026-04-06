import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const client = new Anthropic();

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get('start');
  const end = req.nextUrl.searchParams.get('end');
  if (!start || !end) {
    return new Response(JSON.stringify({ message: 'start and end required' }), { status: 400 });
  }

  // ── Fetch all data for the range ──────────────────────────────────────────

  const [dailyRes, markersRes, medsRes] = await Promise.all([
    pool.query(
      `SELECT
        date::text,
        time_of_waking_up::text            AS "timeOfWakingUp",
        first_social_interaction::text     AS "firstSocialInteraction",
        first_activity_or_work_start::text AS "firstActivityOrWorkStart",
        time_of_going_to_bed::text         AS "timeOfGoingToBed",
        sleep_hours                        AS "sleepHours",
        cardio,
        strength
      FROM health.daily_log
      WHERE date >= $1 AND date <= $2
      ORDER BY date`,
      [start, end]
    ),
    pool.query(
      `SELECT
        date::text,
        period,
        mood,
        energy_level                  AS "energyLevel",
        anxiety,
        depression,
        mood_swings                   AS "moodSwings",
        racing_thoughts               AS "racingThoughts",
        motivation,
        productivity,
        tremors, dizziness, headaches,
        heart_palpitations            AS "heartPalpitations",
        night_sweats                  AS "nightSweats",
        triggers_or_major_stressors   AS "triggers",
        thoughts_feelings_reflections AS "reflections"
      FROM health.period_log
      WHERE date >= $1 AND date <= $2
      ORDER BY date, period`,
      [start, end]
    ),
    pool.query(
      `SELECT date::text, medication, dosage, uom, taken
       FROM health.medication_log
       WHERE date >= $1 AND date <= $2
       ORDER BY date, medication`,
      [start, end]
    ),
  ]);

  // ── Build prompt ──────────────────────────────────────────────────────────

  const prompt = buildPrompt(start, end, dailyRes.rows, markersRes.rows, medsRes.rows);

  // ── Stream Claude response ────────────────────────────────────────────────

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of await stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// ── Prompt builder ────────────────────────────────────────────────────────

function fmt(v: number | null | undefined): string {
  return v === null || v === undefined ? '—' : String(v);
}

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : iso.slice(0, 5);
}

function buildPrompt(
  start: string,
  end: string,
  daily: Record<string, unknown>[],
  markers: Record<string, unknown>[],
  meds: Record<string, unknown>[]
): string {
  const days = daily.length;

  let prompt = `You are a personal health analyst reviewing ${days} days of detailed self-tracking data (${start} to ${end}) for a single individual who tracks their mental and physical health daily.

Please provide a thorough analysis with the following sections:

## Summary
A narrative overview of the period — overall trends in mood, energy, sleep, and activity.

## Key Correlations
Specific relationships you notice between metrics (e.g. sleep quality and next-day mood, exercise and energy levels, medication adherence and symptoms). Reference actual dates and numbers.

## Anomalies & Outliers
Days that stand out as unusually good or bad, and what the data suggests may have contributed.

## Symptom Patterns
Patterns in physical symptoms (tremors, dizziness, headaches, heart palpitations, night sweats) and whether they correlate with other factors.

## Recommendations
2–3 concrete, data-driven observations the person could act on.

Be specific, empathetic, and analytical. Reference dates and actual numbers where relevant. Do not speculate beyond what the data shows.

---

## DATA

### Daily Log (${start} to ${end})
Date | Wake | First Social | Work Start | Bed | Sleep hrs | Cardio (min) | Strength (min)
`;

  for (const d of daily) {
    prompt += `${d.date} | ${fmtTime(d.timeOfWakingUp as string)} | ${fmtTime(d.firstSocialInteraction as string)} | ${fmtTime(d.firstActivityOrWorkStart as string)} | ${fmtTime(d.timeOfGoingToBed as string)} | ${fmt(d.sleepHours as number)} | ${fmt(d.cardio as number)} | ${fmt(d.strength as number)}\n`;
  }

  prompt += `\n### Period Markers\nDate | Period | Mood | Energy | Anxiety | Depression | Mood Swings | Racing Thoughts | Motivation | Productivity | Symptoms | Triggers | Reflections\n`;

  for (const m of markers) {
    const symptoms =
      [
        m.tremors && 'tremors',
        m.dizziness && 'dizziness',
        m.headaches && 'headaches',
        m.heartPalpitations && 'heart palpitations',
        m.nightSweats && 'night sweats',
      ]
        .filter(Boolean)
        .join(', ') || 'none';

    prompt += `${m.date} | ${m.period} | ${fmt(m.mood as number)} | ${fmt(m.energyLevel as number)} | ${fmt(m.anxiety as number)} | ${fmt(m.depression as number)} | ${fmt(m.moodSwings as number)} | ${fmt(m.racingThoughts as number)} | ${fmt(m.motivation as number)} | ${fmt(m.productivity as number)} | ${symptoms} | ${m.triggers || '—'} | ${m.reflections || '—'}\n`;
  }

  // Group meds by date
  const medsByDate: Record<string, string[]> = {};
  for (const med of meds) {
    const date = med.date as string;
    if (!medsByDate[date]) medsByDate[date] = [];
    if (med.taken) {
      medsByDate[date].push(`${med.medication}${med.dosage ? ` ${med.dosage}${med.uom}` : ''}`);
    }
  }

  prompt += `\n### Medications Taken\nDate | Medications\n`;
  for (const [date, taken] of Object.entries(medsByDate)) {
    prompt += `${date} | ${taken.length ? taken.join(', ') : 'none recorded'}\n`;
  }

  return prompt;
}
