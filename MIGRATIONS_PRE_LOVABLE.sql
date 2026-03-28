-- Rodar no Supabase SQL Editor ANTES de conectar o Lovable
-- Projeto: pvtozapmwecuqpzbdtfd

ALTER TABLE projects ADD COLUMN IF NOT EXISTS sector text DEFAULT 'geral';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false NOT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS first_opened_at timestamptz;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS deadline timestamptz;
