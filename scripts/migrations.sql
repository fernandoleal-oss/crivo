-- ============================================================
-- CRIVO — Migrations
-- Idempotente: usa IF NOT EXISTS / DROP CONSTRAINT IF EXISTS
-- ============================================================

-- Indexes de performance
CREATE INDEX IF NOT EXISTS idx_pieces_project_id ON pieces(project_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pieces_public_token ON pieces(public_token);
CREATE INDEX IF NOT EXISTS idx_piece_versions_piece_id ON piece_versions(piece_id);
CREATE INDEX IF NOT EXISTS idx_comments_piece_version ON comments(piece_id, version_id);
CREATE INDEX IF NOT EXISTS idx_approvals_piece_id ON approvals(piece_id);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);

-- Novos campos
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS first_opened_at timestamptz;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS deadline timestamptz;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false NOT NULL;

-- Idempotência de aprovações (1 por peça+versão)
ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_piece_version_unique;
ALTER TABLE approvals ADD CONSTRAINT approvals_piece_version_unique UNIQUE (piece_id, version_id);
