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
        date::text,
        time_of_waking_up::text            AS "timeOfWakingUp",
        first_social_interaction::text     AS "firstSocialInteraction",
        first_activity_or_work_start::text AS "firstActivityOrWorkStart",
        time_of_going_to_bed::text         AS "timeOfGoingToBed",
        sleep_hours                        AS "sleepHours",
        cardio,
        strength
      FROM health.daily_log WHERE date >= $1 AND date <= $2
      ORDER BY date`,
      [start, end]
    );
    return NextResponse.json({ records: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}
