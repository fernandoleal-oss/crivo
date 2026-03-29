-- Migration 003: AI score on pieces + suppliers table

ALTER TABLE pieces
  ADD COLUMN IF NOT EXISTS ai_score INT,
  ADD COLUMN IF NOT EXISTS ai_issues TEXT[];

CREATE TABLE IF NOT EXISTS suppliers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  specialty    TEXT        NOT NULL,
  categories   TEXT[]      NOT NULL DEFAULT '{}',
  rating       NUMERIC(2,1) NOT NULL DEFAULT 0,
  verified     BOOLEAN     NOT NULL DEFAULT false,
  crivo_partner BOOLEAN    NOT NULL DEFAULT false,
  website      TEXT,
  email        TEXT,
  phone        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
