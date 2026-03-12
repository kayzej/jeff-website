import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.TIMESCALE_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get('start');
  const end = req.nextUrl.searchParams.get('end');
  if (!start || !end) return NextResponse.json({ message: 'start and end required' }, { status: 400 });
  try {
    const { rows } = await pool.query(
      `SELECT
        d.date::text,
        d.time_of_waking_up::text            AS "timeOfWakingUp",
        d.first_social_interaction::text     AS "firstSocialInteraction",
        d.first_activity_or_work_start::text AS "firstActivityOrWorkStart",
        d.time_of_going_to_bed::text         AS "timeOfGoingToBed",
        d.sleep_hours                        AS "sleepHours",
        d.cardio,
        d.strength,
        p.avg_mood                           AS "mood"
      FROM health.daily_log d
      LEFT JOIN (
        SELECT date, AVG(mood) AS avg_mood
        FROM health.period_log
        WHERE date >= $1 AND date <= $2
        GROUP BY date
      ) p ON p.date = d.date
      WHERE d.date >= $1 AND d.date <= $2
      ORDER BY d.date`,
      [start, end]
    );
    return NextResponse.json({ records: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}
