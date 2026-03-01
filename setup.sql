-- ============================================================
-- Health schema setup
-- Run once in your Tiger Cloud SQL editor
-- ============================================================

CREATE SCHEMA IF NOT EXISTS health;

-- ============================================================
-- Enums
-- ============================================================

-- To add a new period: ALTER TYPE health.period_enum ADD VALUE 'new_value';
CREATE TYPE health.period_enum AS ENUM ('morning', 'afternoon', 'evening', 'night');

-- To add a new medication: ALTER TYPE health.medication_enum ADD VALUE 'new_med';
CREATE TYPE health.medication_enum AS ENUM (
  'perphenazine',
  'lithium',
  'divalproex',
  'lamotrigine',
  'clonazepam'
);

-- ============================================================
-- Table 1: daily_log
-- One row per day. Stores daily-level data.
-- NOT a hypertable — uses DATE as primary key.
-- ============================================================

CREATE TABLE IF NOT EXISTS health.daily_log (
  date                          DATE           NOT NULL PRIMARY KEY,
  time_of_waking_up             TIMESTAMPTZ,
  first_social_interaction      TIMESTAMPTZ,
  first_activity_or_work_start  TIMESTAMPTZ,
  time_of_going_to_bed          TIMESTAMPTZ,
  sleep_hours                   NUMERIC(4,1),
  cardio                        SMALLINT,
  strength                      SMALLINT,
  thoughts_feelings_reflections TEXT,
  created_at                    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table 2: period_log
-- Up to 4 rows per day (morning/afternoon/evening/night).
-- TimescaleDB hypertable for time-series queries.
-- ============================================================

CREATE TABLE IF NOT EXISTS health.period_log (
  timestamp                   TIMESTAMPTZ         NOT NULL,
  date                        DATE                NOT NULL,
  period                      health.period_enum  NOT NULL,
  mood                        SMALLINT,
  energy_level                SMALLINT,
  anxiety                     SMALLINT,
  depression                  SMALLINT,
  mood_swings                 SMALLINT,
  racing_thoughts             SMALLINT,
  triggers_or_major_stressors SMALLINT,
  motivation                  SMALLINT,
  productivity                SMALLINT,
  tremors                     SMALLINT,
  dizziness                   SMALLINT,
  headaches                   SMALLINT,
  heart_palpitations          SMALLINT,
  night_sweats                SMALLINT,
  wife                        SMALLINT,
  kids                        SMALLINT,
  family                      SMALLINT,
  friends                     SMALLINT,
  neighbors                   SMALLINT,
  co_workers                  SMALLINT,
  CONSTRAINT period_log_pkey PRIMARY KEY (timestamp, period)
);

SELECT create_hypertable('health.period_log', 'timestamp', if_not_exists => TRUE);

-- Useful index for querying by date + period
CREATE INDEX IF NOT EXISTS idx_period_log_date_period
  ON health.period_log (date, period);

-- ============================================================
-- Table 3: medication_log
-- One row per medication per period per day.
-- ============================================================

CREATE TABLE IF NOT EXISTS health.medication_log (
  id             BIGSERIAL               NOT NULL,
  date           DATE                    NOT NULL,
  period         health.period_enum      NOT NULL,
  medication     health.medication_enum  NOT NULL,
  dose_mg        NUMERIC(6,2)            NOT NULL DEFAULT 0,
  taken          BOOLEAN                 NOT NULL DEFAULT TRUE,
  notes          TEXT,
  created_at     TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  PRIMARY KEY (date, period, medication)
);

-- Index for querying a single medication over time
CREATE INDEX IF NOT EXISTS idx_medication_log_medication_date
  ON health.medication_log (medication, date);
