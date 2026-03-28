import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ message: 'date required' }, { status: 400 });
  try {
    const { rows } = await pool.query(
      `SELECT
        period,
        mood,
        energy_level                  AS "energyLevel",
        anxiety, depression,
        mood_swings                   AS "moodSwings",
        racing_thoughts               AS "racingThoughts",
        triggers_or_major_stressors   AS "triggersOrMajorStressors",
        motivation, productivity,
        tremors, dizziness, headaches,
        heart_palpitations            AS "heartPalpitations",
        night_sweats                  AS "nightSweats",
        wife, kids, family, friends, neighbors,
        co_workers                    AS "coWorkers",
        thoughts_feelings_reflections AS "thoughtsFeelingsReflections"
      FROM health.period_log WHERE date = $1`,
      [date]
    );
    return NextResponse.json({ records: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      date,
      period,
      mood,
      energyLevel,
      anxiety,
      depression,
      moodSwings,
      racingThoughts,
      triggersOrMajorStressors,
      motivation,
      productivity,
      tremors,
      dizziness,
      headaches,
      heartPalpitations,
      nightSweats,
      wife,
      kids,
      family,
      friends,
      neighbors,
      coWorkers,
      thoughtsFeelingsReflections,
    } = await req.json();

    await pool.query(
      `INSERT INTO health.period_log (
        date, period,
        mood, energy_level, anxiety, depression,
        mood_swings, racing_thoughts, triggers_or_major_stressors,
        motivation, productivity,
        tremors, dizziness, headaches, heart_palpitations, night_sweats,
        wife, kids, family, friends, neighbors, co_workers,
        thoughts_feelings_reflections
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      ON CONFLICT (date, period) DO UPDATE SET
        mood                          = EXCLUDED.mood,
        energy_level                  = EXCLUDED.energy_level,
        anxiety                       = EXCLUDED.anxiety,
        depression                    = EXCLUDED.depression,
        mood_swings                   = EXCLUDED.mood_swings,
        racing_thoughts               = EXCLUDED.racing_thoughts,
        triggers_or_major_stressors   = EXCLUDED.triggers_or_major_stressors,
        motivation                    = EXCLUDED.motivation,
        productivity                  = EXCLUDED.productivity,
        tremors                       = EXCLUDED.tremors,
        dizziness                     = EXCLUDED.dizziness,
        headaches                     = EXCLUDED.headaches,
        heart_palpitations            = EXCLUDED.heart_palpitations,
        night_sweats                  = EXCLUDED.night_sweats,
        wife                          = EXCLUDED.wife,
        kids                          = EXCLUDED.kids,
        family                        = EXCLUDED.family,
        friends                       = EXCLUDED.friends,
        neighbors                     = EXCLUDED.neighbors,
        co_workers                    = EXCLUDED.co_workers,
        thoughts_feelings_reflections = EXCLUDED.thoughts_feelings_reflections`,
      [
        date,
        period,
        mood,
        energyLevel,
        anxiety,
        depression,
        moodSwings,
        racingThoughts,
        triggersOrMajorStressors,
        motivation,
        productivity,
        tremors,
        dizziness,
        headaches,
        heartPalpitations,
        nightSweats,
        wife,
        kids,
        family,
        friends,
        neighbors,
        coWorkers,
        thoughtsFeelingsReflections,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[markers]', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}
