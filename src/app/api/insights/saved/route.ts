import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT id, created_at AS "createdAt", start_date AS "startDate",
              end_date AS "endDate", model, text
       FROM health.insights
       ORDER BY created_at DESC
       LIMIT 20`
    );
    return NextResponse.json({ records: rows });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, model, text } = await req.json();
    const { rows } = await pool.query(
      `INSERT INTO health.insights (start_date, end_date, model, text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at AS "createdAt"`,
      [startDate, endDate, model, text]
    );
    return NextResponse.json({ record: rows[0] });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Database error' }, { status: 500 });
  }
}
