-- ============================================================
-- Health schema setup
-- Run once in your Neon SQL editor
-- ============================================================

CREATE SCHEMA IF NOT EXISTS health;

-- ============================================================
-- Enums
-- ============================================================

CREATE TYPE health.period_enum AS ENUM ('morning', 'afternoon', 'evening', 'night');

CREATE TYPE health.medication_enum AS ENUM (
  'perphenazine',
  'lithium',
  'divalproex',
  'lamotrigine',
  'clonazepam',
  'wegovy'
);

-- ============================================================
-- Table 1: daily_log
-- One row per day. Stores daily-level timestamps, sleep, and exercise.
-- ============================================================

CREATE TABLE IF NOT EXISTS health.daily_log (
  date                          DATE        NOT NULL PRIMARY KEY,
  time_of_waking_up             TIMESTAMPTZ,
  first_social_interaction      TIMESTAMPTZ,
  first_activity_or_work_start  TIMESTAMPTZ,
  time_of_going_to_bed          TIMESTAMPTZ,
  sleep_hours                   NUMERIC(4,1),
  cardio                        SMALLINT,
  strength                      SMALLINT,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table 2: period_log
-- Up to 4 rows per day (morning/afternoon/evening/night).
-- Tracks mental state, physical symptoms, medication doses,
-- exercise, social quality, and reflections per period.
-- ============================================================

CREATE TABLE IF NOT EXISTS health.period_log (
  date                          DATE               NOT NULL,
  period                        health.period_enum NOT NULL,

  -- Mental state (0-10)
  mood                          SMALLINT,
  energy_level                  SMALLINT,
  anxiety                       SMALLINT,
  depression                    SMALLINT,
  mood_swings                   SMALLINT,
  racing_thoughts               SMALLINT,
  triggers_or_major_stressors   SMALLINT,
  motivation                    SMALLINT,
  productivity                  SMALLINT,

  -- Physical symptoms (0 = absent, 1 = present)
  tremors                       SMALLINT,
  dizziness                     SMALLINT,
  headaches                     SMALLINT,
  heart_palpitations            SMALLINT,
  night_sweats                  SMALLINT,

  -- Exercise (minutes)
  cardio                        SMALLINT,
  strength                      SMALLINT,

  -- Social interaction quality (0-10)
  wife                          SMALLINT,
  kids                          SMALLINT,
  family                        SMALLINT,
  friends                       SMALLINT,
  neighbors                     SMALLINT,
  co_workers                    SMALLINT,

  -- Free-text reflections
  thoughts_feelings_reflections TEXT,

  PRIMARY KEY (date, period)
);

CREATE INDEX IF NOT EXISTS idx_period_log_date
  ON health.period_log (date);

-- ============================================================
-- Table 3: medication_log
-- One row per medication per day (daily totals).
-- ============================================================

CREATE TABLE IF NOT EXISTS health.medication_log (
  date        DATE                   NOT NULL,
  medication  health.medication_enum NOT NULL,
  dosage      NUMERIC(6,2)           NOT NULL DEFAULT 0,
  uom         VARCHAR(10)            NOT NULL DEFAULT 'mg',
  taken       BOOLEAN                NOT NULL DEFAULT TRUE,
  PRIMARY KEY (date, medication)
);

CREATE INDEX IF NOT EXISTS idx_medication_log_medication_date
  ON health.medication_log (medication, date);
