-- ============================================================
-- Health data load
-- Inserts example data from examples/
-- Safe to re-run (ON CONFLICT DO NOTHING)
-- ============================================================

-- ============================================================
-- daily_log
-- ============================================================

INSERT INTO health.daily_log (date, time_of_waking_up, first_social_interaction, first_activity_or_work_start, time_of_going_to_bed, sleep_hours, cardio, strength)
VALUES
  ('2026-02-27', '2026-02-27 07:30:00', '2026-02-27 07:30:00', '2026-02-27 08:10:00', '2026-02-27 00:00:00', 9, 0, 0),
  ('2026-02-28', '2026-02-28 07:30:00', '2026-02-28 07:30:00', '2026-02-28 08:10:00', '2026-02-28 03:30:00', 4, 0, 0),
  ('2026-03-01', '2026-03-01 08:45:00', '2026-03-01 08:45:00', '2026-03-01 09:00:00', '2026-03-01 11:30:00', 8, 0, 0),
  ('2026-03-02', '2026-03-02 08:45:00', '2026-03-02 08:45:00', '2026-03-02 09:00:00', '2026-03-02 11:30:00', 8, 0, 0)
ON CONFLICT (date) DO NOTHING;

-- ============================================================
-- period_log
-- ============================================================

INSERT INTO health.period_log (
  date, period,
  mood, energy_level, anxiety, depression, mood_swings, racing_thoughts, triggers_or_major_stressors, motivation, productivity,
  tremors, dizziness, headaches, heart_palpitations, night_sweats,
  cardio, strength,
  wife, kids, family, friends, neighbors, co_workers,
  thoughts_feelings_reflections
)
VALUES
  -- 2026-02-27
  ('2026-02-27', 'morning',   5,  5, 0, 0, 0, 0, 0,  5,  5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, NULL),
  ('2026-02-27', 'afternoon', 7,  5, 0, 0, 0, 0, 0,  5,  5, 0, 0, 0, 0, 0, 0, 0, 7, 5, 5, 5, 5, 5, 'Post therapy'),
  ('2026-02-27', 'evening',   5,  5, 0, 0, 0, 0, 0,  5,  5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, NULL),
  ('2026-02-27', 'night',     5,  5, 0, 0, 0, 0, 0,  5,  5, 0, 0, 0, 0, 0, 0, 0, 8, 5, 5, 5, 5, 5, NULL),

  -- 2026-02-28
  ('2026-02-28', 'morning',   5,  5, 1, 0, 0, 0, 5,  8, 10, 1, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 'A bit focused on this side project and on AI course and taxes'),
  ('2026-02-28', 'afternoon', 3,  4, 2, 0, 3, 2, 5,  5,  4, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 'Angry about family plans being a mess'),
  ('2026-02-28', 'evening',   7,  4, 0, 0, 0, 0, 2,  8,  7, 0, 0, 0, 0, 0, 0, 0, 8, 5, 5, 5, 5, 5, 'Good interaction at the tile store'),
  ('2026-02-28', 'night',    10, 10, 0, 0, 0, 0, 0, 10,  6, 0, 0, 0, 0, 0, 0, 0,10, 5, 5, 5, 5, 5, 'Nice date night'),

  -- 2026-03-01
  ('2026-03-01', 'morning',   8,  7, 0, 0, 0, 0, 0,  6,  6, 0, 0, 0, 0, 0, 0, 0,10, 5, 5, 5, 5, 5, 'AI course'),
  ('2026-03-01', 'afternoon', 5,  5, 1, 0, 0, 0, 0,  6,  6, 0, 0, 0, 0, 0, 0, 0,10, 5, 5, 5, 5, 5, 'AI course'),
  ('2026-03-01', 'evening',   2,  2, 1, 0, 0, 0, 0,  2,  2, 0, 0, 0, 0, 0, 0, 0,10, 5, 5, 5, 5, 5, 'AI course'),
  ('2026-03-01', 'night',     2,  2, 1, 1, 1, 0, 0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 'relax'),

  -- 2026-03-02
  ('2026-03-02', 'morning',   5,  5, 5, 0, 0, 0, 0,  5,  5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 'Stressful Morning'),
  ('2026-03-02', 'afternoon', 5,  5, 1, 0, 0, 0, 0,  5,  5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 'Work'),
  ('2026-03-02', 'evening',   2,  2, 1, 0, 0, 0, 0,  2,  4, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 'Work'),
  ('2026-03-02', 'night',     1,  2, 7, 7, 5, 0, 9,  0,  1, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 'Worries about war, grocery shopping, cleaning dishes, lunch boxes')

ON CONFLICT (date, period) DO NOTHING;

-- ============================================================
-- medication_log
-- ============================================================

INSERT INTO health.medication_log (date, medication, dosage, uom, taken)
VALUES
  -- 2026-02-27
  ('2026-02-27', 'perphenazine',    6, 'mg', TRUE),
  ('2026-02-27', 'lithium',      1050, 'mg', TRUE),
  ('2026-02-27', 'divalproex',   1000, 'mg', TRUE),
  ('2026-02-27', 'lamotrigine',   200, 'mg', TRUE),
  ('2026-02-27', 'clonazepam',     0, 'mg', FALSE),

  -- 2026-02-28
  ('2026-02-28', 'perphenazine',    6, 'mg', TRUE),
  ('2026-02-28', 'lithium',      1050, 'mg', TRUE),
  ('2026-02-28', 'divalproex',   1000, 'mg', TRUE),
  ('2026-02-28', 'lamotrigine',   200, 'mg', TRUE),
  ('2026-02-28', 'clonazepam',     0, 'mg', FALSE),

  -- 2026-03-01
  ('2026-03-01', 'perphenazine',    6, 'mg', TRUE),
  ('2026-03-01', 'lithium',      1050, 'mg', TRUE),
  ('2026-03-01', 'divalproex',   1000, 'mg', TRUE),
  ('2026-03-01', 'lamotrigine',   200, 'mg', TRUE),
  ('2026-03-01', 'clonazepam',     3, 'mg', TRUE),

  -- 2026-03-02
  ('2026-03-02', 'perphenazine',    6, 'mg', TRUE),
  ('2026-03-02', 'lithium',      1050, 'mg', TRUE),
  ('2026-03-02', 'divalproex',   1000, 'mg', TRUE),
  ('2026-03-02', 'lamotrigine',   200, 'mg', TRUE),
  ('2026-03-02', 'clonazepam',     0, 'mg', FALSE)

ON CONFLICT (date, medication) DO NOTHING;
