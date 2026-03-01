import { NextRequest, NextResponse } from 'next/server';
import pg from 'pg';
import { DB_URL } from '@/constants/constants';

const { Client } = pg;
const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  await client.connect();

  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ message: 'date required' }, { status: 400 });
  try {
    const { rows } = await client.query(
      `SELECT
        date,
        time_of_waking_up           AS "timeOfWakingUp",
        first_social_interaction     AS "firstSocialInteraction",
        first_activity_or_work_start AS "firstActivityOrWorkStart",
        time_of_going_to_bed         AS "timeOfGoingToBed",
        sleep_hours                  AS "sleepHours",
        cardio, strength,
        wife, kids, family, friends, neighbors,
        co_workers                   AS "coWorkers",
        thoughts_feelings_reflections AS "thoughtsFeelingsReflections"
      FROM health.daily_log WHERE date = $1`,
      [date]
    );
    return NextResponse.json({ record: rows[0] ?? null });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
  finally {
    await client.end();
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      date,
      timeOfWakingUp,
      firstSocialInteraction,
      firstActivityOrWorkStart,
      timeOfGoingToBed,
      sleepHours,
      cardio,
      strength,
      wife, kids, family, friends, neighbors, coWorkers,
      thoughtsFeelingsReflections,
    } = await req.json();

    await client.query(
      `INSERT INTO health.daily_log (
        date, time_of_waking_up, first_social_interaction,
        first_activity_or_work_start, time_of_going_to_bed,
        sleep_hours, cardio, strength,
        wife, kids, family, friends, neighbors, co_workers,
        thoughts_feelings_reflections, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
      ON CONFLICT (date) DO UPDATE SET
        time_of_waking_up             = EXCLUDED.time_of_waking_up,
        first_social_interaction      = EXCLUDED.first_social_interaction,
        first_activity_or_work_start  = EXCLUDED.first_activity_or_work_start,
        time_of_going_to_bed          = EXCLUDED.time_of_going_to_bed,
        sleep_hours                   = EXCLUDED.sleep_hours,
        cardio                        = EXCLUDED.cardio,
        strength                      = EXCLUDED.strength,
        wife                          = EXCLUDED.wife,
        kids                          = EXCLUDED.kids,
        family                        = EXCLUDED.family,
        friends                       = EXCLUDED.friends,
        neighbors                     = EXCLUDED.neighbors,
        co_workers                    = EXCLUDED.co_workers,
        thoughts_feelings_reflections = EXCLUDED.thoughts_feelings_reflections,
        updated_at                    = NOW()`,
      [
        date, timeOfWakingUp, firstSocialInteraction,
        firstActivityOrWorkStart, timeOfGoingToBed,
        sleepHours, cardio, strength,
        wife, kids, family, friends, neighbors, coWorkers,
        thoughtsFeelingsReflections,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[daily_log]', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  } finally {
    await client.end();
  }
}
