import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.TIMESCALE_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PERIOD_ORDER = ['morning', 'afternoon', 'evening', 'night'];

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT
        date,
        period,
        thoughts_feelings_reflections AS "thoughtsFeelingsReflections"
      FROM health.period_log
      WHERE thoughts_feelings_reflections IS NOT NULL
        AND thoughts_feelings_reflections <> ''
      ORDER BY date DESC, period ASC`
    );

    // Sort by period time-of-day order within each date
    rows.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period);
    });

    return NextResponse.json({ entries: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}
