import { NextRequest, NextResponse } from 'next/server';
import pg from 'pg';
import { DB_URL } from '@/constants/constants';

const { Client } = pg;
const client = new Client({ connectionString: DB_URL });

export async function GET(req: NextRequest) {
  await client.connect();
  
  const date = req.nextUrl.searchParams.get('date');
  
  if (!date) return NextResponse.json({ message: 'date required' }, { status: 400 });
  
  try {
    const { rows } = await client.query(
      `SELECT period, medication, dose_mg, taken, notes
       FROM health.medication_log WHERE date = $1
       ORDER BY period, medication`,
      [date]
    );
    return NextResponse.json({ records: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
  finally {
    await client.end();
  }
}

// POST accepts an array of medication entries for a given date + period
// Body: { date, period, medications: [{ medication, doseMg, taken, notes }] }
export async function POST(req: NextRequest) {
  await client.connect();
  try {
    const { date, period, medications } = await req.json();

    if (!Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json({ message: 'medications array is required' }, { status: 400 });
    }

    try {
      await client.query('BEGIN');

      for (const { medication, doseMg, taken = true, notes = null } of medications) {
        await client.query(
          `INSERT INTO health.medication_log (date, period, medication, dose_mg, taken, notes)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (date, period, medication) DO UPDATE SET
             dose_mg    = EXCLUDED.dose_mg,
             taken      = EXCLUDED.taken,
             notes      = EXCLUDED.notes`,
          [date, period, medication, doseMg, taken, notes]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      await client.end();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[medication_log]', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  } finally {
    await client.end();
  }
}
