import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get('start');
  const end = req.nextUrl.searchParams.get('end');
  if (!start || !end) return NextResponse.json({ message: 'start and end required' }, { status: 400 });
  try {
    const { rows } = await pool.query(
      `SELECT
        date::text,
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
      FROM health.period_log WHERE date >= $1 AND date <= $2
      ORDER BY date, period`,
      [start, end]
    );
    return NextResponse.json({ records: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}
