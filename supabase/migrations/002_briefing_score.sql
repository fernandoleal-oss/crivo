ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS briefing_data jsonb,
  ADD COLUMN IF NOT EXISTS briefing_score int NOT NULL DEFAULT 0;
