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
      `SELECT medication, dosage, uom, taken
       FROM health.medication_log WHERE date = $1
       ORDER BY medication`,
      [date]
    );
    return NextResponse.json({ records: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}

// POST body: { date, medications: [{ medication, dosage, uom, taken }] }
export async function POST(req: NextRequest) {
  try {
    const { date, medications } = await req.json();

    if (!Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json({ message: 'medications array is required' }, { status: 400 });
    }

    const pgClient = await pool.connect();
    try {
      await pgClient.query('BEGIN');

      for (const { medication, dosage, uom = 'mg', taken = true } of medications) {
        await pgClient.query(
          `INSERT INTO health.medication_log (date, medication, dosage, uom, taken)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (date, medication) DO UPDATE SET
             dosage = EXCLUDED.dosage,
             uom    = EXCLUDED.uom,
             taken  = EXCLUDED.taken`,
          [date, medication, dosage, uom, taken]
        );
      }

      await pgClient.query('COMMIT');
    } catch (err) {
      await pgClient.query('ROLLBACK');
      throw err;
    } finally {
      pgClient.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[medication_log]', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}
