import { DB_URL } from '@/constants/constants';
import { NextRequest, NextResponse } from 'next/server';
import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: DB_URL });

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ message: 'date required' }, { status: 400 });
  try {
    const { rows } = await client.query(
      `SELECT
        period,
        mood,
        energy_level                 AS "energyLevel",
        anxiety, depression,
        mood_swings                  AS "moodSwings",
        racing_thoughts              AS "racingThoughts",
        triggers_or_major_stressors  AS "triggersOrMajorStressors",
        motivation, productivity,
        tremors, dizziness, headaches,
        heart_palpitations           AS "heartPalpitations",
        night_sweats                 AS "nightSweats"
      FROM health.period_log WHERE date = $1`,
      [date]
    );
    return NextResponse.json({ records: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      timestamp, // TIMESTAMPTZ — e.g. "2026-02-27T09:00:00Z"
      date,      // DATE        — e.g. "2026-02-27"
      period,    // 'morning' | 'afternoon' | 'evening' | 'night'
      mood, energyLevel, anxiety, depression,
      moodSwings, racingThoughts, triggersOrMajorStressors,
      motivation, productivity,
      tremors, dizziness, headaches, heartPalpitations, nightSweats,
    } = await req.json();

    await client.query(
      `INSERT INTO health.period_log (
        timestamp, date, period,
        mood, energy_level, anxiety, depression,
        mood_swings, racing_thoughts, triggers_or_major_stressors,
        motivation, productivity,
        tremors, dizziness, headaches, heart_palpitations, night_sweats
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      ON CONFLICT (timestamp, period) DO UPDATE SET
        mood                        = EXCLUDED.mood,
        energy_level                = EXCLUDED.energy_level,
        anxiety                     = EXCLUDED.anxiety,
        depression                  = EXCLUDED.depression,
        mood_swings                 = EXCLUDED.mood_swings,
        racing_thoughts             = EXCLUDED.racing_thoughts,
        triggers_or_major_stressors = EXCLUDED.triggers_or_major_stressors,
        motivation                  = EXCLUDED.motivation,
        productivity                = EXCLUDED.productivity,
        tremors                     = EXCLUDED.tremors,
        dizziness                   = EXCLUDED.dizziness,
        headaches                   = EXCLUDED.headaches,
        heart_palpitations          = EXCLUDED.heart_palpitations,
        night_sweats                = EXCLUDED.night_sweats`,
      [
        timestamp, date, period,
        mood, energyLevel, anxiety, depression,
        moodSwings, racingThoughts, triggersOrMajorStressors,
        motivation, productivity,
        tremors, dizziness, headaches, heartPalpitations, nightSweats,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[period_log]', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  } finally {
    await client.end();
  }
}
