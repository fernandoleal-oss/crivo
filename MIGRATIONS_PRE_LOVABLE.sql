-- Rodar no Supabase SQL Editor ANTES de conectar o Lovable
-- Projeto: pvtozapmwecuqpzbdtfd

-- Colunas novas em tabelas existentes
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sector text DEFAULT 'geral';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false NOT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS first_opened_at timestamptz;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS deadline timestamptz;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS ai_score integer;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS ai_issues text[];

-- Novas tabelas
CREATE TABLE IF NOT EXISTS clapperboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  producao text not null,
  cliente text, produto text, titulo text,
  diretor text, dop text, producao_exec text,
  data text, local text,
  cena text default '01', take text default '01', obs text,
  version_number int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  categories text[],
  rating numeric(2,1) default 5.0,
  verified boolean default false,
  crivo_partner boolean default false,
  website text, email text, phone text,
  avatar_color text default 'bg-indigo-500',
  created_at timestamptz default now()
);

-- Demo data — fornecedores
INSERT INTO suppliers (name, specialty, categories, rating, verified, crivo_partner, website, email, avatar_color) VALUES
  ('Studio 81', 'Fotografia publicitária', ARRAY['Fotografia','Retoque'], 4.9, true, true, 'studio81.com.br', 'contato@studio81.com.br', 'bg-indigo-500'),
  ('Frame Motion', 'Motion Design e Vídeo', ARRAY['Motion Design','Vídeo'], 4.7, true, false, 'framemotion.com.br', 'oi@framemotion.com.br', 'bg-violet-500'),
  ('Voxa Audio', 'Áudio e Locução', ARRAY['Áudio','Locução'], 4.5, false, false, NULL, 'voxa@audio.com.br', 'bg-orange-500'),
  ('Pixel Makers', 'Fotografia e Retoque', ARRAY['Fotografia','Retoque'], 4.3, false, false, 'pixelmakers.com.br', NULL, 'bg-emerald-500'),
  ('TeleArte Produções', 'RTV e Produção de Vídeo', ARRAY['RTV','Vídeo','Produção'], 4.8, true, true, 'telearte.com.br', 'producao@telearte.com.br', 'bg-rose-500'),
  ('Gráfica Premium', 'Impressão e Acabamento', ARRAY['Impressão','Acabamento'], 4.2, false, false, NULL, 'orcamento@graficapremium.com.br', 'bg-cyan-500')
ON CONFLICT DO NOTHING;
