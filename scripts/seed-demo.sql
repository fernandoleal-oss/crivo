-- ============================================================
-- CRIVO — Demo Seed Data
-- Rode no Supabase SQL Editor: pvtozapmwecuqpzbdtfd
-- Idempotente: usa ON CONFLICT DO NOTHING
-- ============================================================

-- Limpa dados antigos de demo (safe: só apaga os UUIDs fixos abaixo)
DELETE FROM approvals    WHERE piece_id IN (
  'aa000001-0000-0000-0000-000000000001','aa000001-0000-0000-0000-000000000002',
  'aa000001-0000-0000-0000-000000000003','aa000001-0000-0000-0000-000000000004',
  'aa000002-0000-0000-0000-000000000001','aa000002-0000-0000-0000-000000000002',
  'aa000002-0000-0000-0000-000000000003','aa000003-0000-0000-0000-000000000001',
  'aa000003-0000-0000-0000-000000000002','aa000003-0000-0000-0000-000000000003',
  'aa000004-0000-0000-0000-000000000001','aa000004-0000-0000-0000-000000000002'
);
DELETE FROM comments     WHERE piece_id IN (
  'aa000001-0000-0000-0000-000000000001','aa000001-0000-0000-0000-000000000002',
  'aa000001-0000-0000-0000-000000000003','aa000001-0000-0000-0000-000000000004',
  'aa000002-0000-0000-0000-000000000001','aa000002-0000-0000-0000-000000000002',
  'aa000002-0000-0000-0000-000000000003','aa000003-0000-0000-0000-000000000001',
  'aa000003-0000-0000-0000-000000000002','aa000003-0000-0000-0000-000000000003',
  'aa000004-0000-0000-0000-000000000001','aa000004-0000-0000-0000-000000000002'
);
DELETE FROM piece_versions WHERE piece_id IN (
  'aa000001-0000-0000-0000-000000000001','aa000001-0000-0000-0000-000000000002',
  'aa000001-0000-0000-0000-000000000003','aa000001-0000-0000-0000-000000000004',
  'aa000002-0000-0000-0000-000000000001','aa000002-0000-0000-0000-000000000002',
  'aa000002-0000-0000-0000-000000000003','aa000003-0000-0000-0000-000000000001',
  'aa000003-0000-0000-0000-000000000002','aa000003-0000-0000-0000-000000000003',
  'aa000004-0000-0000-0000-000000000001','aa000004-0000-0000-0000-000000000002'
);
DELETE FROM pieces   WHERE project_id IN (
  'bb000001-0000-0000-0000-000000000001','bb000002-0000-0000-0000-000000000001',
  'bb000003-0000-0000-0000-000000000001','bb000004-0000-0000-0000-000000000001'
);
DELETE FROM projects WHERE id IN (
  'bb000001-0000-0000-0000-000000000001','bb000002-0000-0000-0000-000000000001',
  'bb000003-0000-0000-0000-000000000001','bb000004-0000-0000-0000-000000000001'
);

-- ============================================================
-- PROJETOS
-- ============================================================
INSERT INTO projects (id, name, client_name, sector, created_at) VALUES
  ('bb000001-0000-0000-0000-000000000001', 'Campanha Verão 2026',     'Coca-Cola Brasil',  'criacao',    NOW() - INTERVAL '12 days'),
  ('bb000002-0000-0000-0000-000000000001', 'Rebranding Q1 2026',      'Nubank',            'atendimento', NOW() - INTERVAL '8 days'),
  ('bb000003-0000-0000-0000-000000000001', 'Black Friday 2026',       'Magazine Luiza',    'midia',      NOW() - INTERVAL '4 days'),
  ('bb000004-0000-0000-0000-000000000001', 'Lançamento Natura Plant', 'Natura',            'rtv',        NOW() - INTERVAL '1 day');

-- ============================================================
-- PEÇAS — Projeto 1: Campanha Verão 2026 (Coca-Cola)
-- ============================================================
INSERT INTO pieces (id, project_id, title, description, status, public_token, notified_at, deadline, created_at, updated_at) VALUES
  ('aa000001-0000-0000-0000-000000000001', 'bb000001-0000-0000-0000-000000000001',
   'Banner Hero — Site Verão',
   'Banner principal do hotsite de verão. Formato 1920x600px. Deve destacar o produto gelado com fundo de praia.',
   'approved',
   'demo-token-coca-banner-hero',
   NOW() - INTERVAL '10 days', NULL, NOW() - INTERVAL '11 days', NOW() - INTERVAL '9 days'),

  ('aa000001-0000-0000-0000-000000000002', 'bb000001-0000-0000-0000-000000000001',
   'Post Instagram — Grid Verão',
   'Post quadrado 1080x1080 para feed do Instagram. Série de 3 posts com identidade visual unificada.',
   'revision_requested',
   'demo-token-coca-post-insta',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '9 days', NOW() - INTERVAL '6 days'),

  ('aa000001-0000-0000-0000-000000000003', 'bb000001-0000-0000-0000-000000000001',
   'Story Reels — Promoção 2x1',
   'Animação para Stories e Reels anunciando promoção 2x1 nos supermercados parceiros. Formato 9:16.',
   'pending',
   'demo-token-coca-story',
   NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('aa000001-0000-0000-0000-000000000004', 'bb000001-0000-0000-0000-000000000001',
   'Email Marketing — Disparo Verão',
   'Template HTML para disparo de email marketing. Largura 600px, compatível com Gmail e Outlook.',
   'approved',
   'demo-token-coca-email',
   NOW() - INTERVAL '8 days', NULL, NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days');

-- ============================================================
-- PEÇAS — Projeto 2: Rebranding Q1 (Nubank)
-- ============================================================
INSERT INTO pieces (id, project_id, title, description, status, public_token, notified_at, created_at, updated_at) VALUES
  ('aa000002-0000-0000-0000-000000000001', 'bb000002-0000-0000-0000-000000000001',
   'Logo Novo — Variação Horizontal',
   'Nova versão horizontal da marca Nubank para uso em materiais impressos e digitais. Fundo roxo e fundo branco.',
   'approved',
   'demo-token-nubank-logo',
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),

  ('aa000002-0000-0000-0000-000000000002', 'bb000002-0000-0000-0000-000000000001',
   'Paleta de Cores 2026',
   'Atualização da paleta oficial com novas variações de roxo e tons de apoio para acessibilidade WCAG AA.',
   'revision_requested',
   'demo-token-nubank-paleta',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),

  ('aa000002-0000-0000-0000-000000000003', 'bb000002-0000-0000-0000-000000000001',
   'Manual de Marca — Capa e Índice',
   'PDF das primeiras 20 páginas do novo brand guide. Inclui princípios de marca, voz e tom.',
   'pending',
   'demo-token-nubank-manual',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- ============================================================
-- PEÇAS — Projeto 3: Black Friday 2026 (Magazine Luiza)
-- ============================================================
INSERT INTO pieces (id, project_id, title, description, status, public_token, notified_at, created_at, updated_at) VALUES
  ('aa000003-0000-0000-0000-000000000001', 'bb000003-0000-0000-0000-000000000001',
   'Banner Hero — Home Site',
   'Banner rotativo da home com oferta principal. Três versões testadas até aprovação. 1440x500px.',
   'approved',
   'demo-token-magalu-banner',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),

  ('aa000003-0000-0000-0000-000000000002', 'bb000003-0000-0000-0000-000000000001',
   'Push Notification — App',
   'Arte para push notification no app Magazine Luiza. Ícone 192x192 + imagem de destaque 1080x567.',
   'revision_requested',
   'demo-token-magalu-push',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),

  ('aa000003-0000-0000-0000-000000000003', 'bb000003-0000-0000-0000-000000000001',
   'Email Marketing — Header Black Friday',
   'Header e hero do email de Black Friday. GIF animado com contagem regressiva. 600px.',
   'pending',
   'demo-token-magalu-email',
   NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- ============================================================
-- PEÇAS — Projeto 4: Lançamento Natura Plant
-- ============================================================
INSERT INTO pieces (id, project_id, title, description, status, public_token, notified_at, created_at, updated_at) VALUES
  ('aa000004-0000-0000-0000-000000000001', 'bb000004-0000-0000-0000-000000000001',
   'Key Visual — Campanha Plant',
   'Imagem principal da campanha para todos os formatos. Conceito: natureza urbana, tons verdes.',
   'approved',
   'demo-token-natura-kv',
   NOW() - INTERVAL '12 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '8 hours'),

  ('aa000004-0000-0000-0000-000000000002', 'bb000004-0000-0000-0000-000000000001',
   'Thumbnail Vídeo Teaser — YouTube',
   'Thumbnail customizada para o vídeo teaser no YouTube. 1280x720px. Deve usar foto da embaixadora.',
   'pending',
   'demo-token-natura-thumb',
   NULL, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

-- ============================================================
-- VERSÕES DAS PEÇAS (com imagens reais do Unsplash)
-- ============================================================

-- Banner Hero Coca-Cola (3 versões — v1 e v2 reprovadas, v3 aprovada)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000001-0001-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 1,
   'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=1200&q=80', 'image/jpeg',
   NOW() - INTERVAL '11 days'),
  ('vv000001-0001-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000001', 2,
   'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&q=80', 'image/jpeg',
   NOW() - INTERVAL '10 days'),
  ('vv000001-0001-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000001', 3,
   'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=1200&q=80', 'image/jpeg',
   NOW() - INTERVAL '9 days');

-- Post Instagram Coca-Cola (2 versões)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000001-0002-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000002', 1,
   'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '9 days'),
  ('vv000001-0002-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000002', 2,
   'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '7 days');

-- Story Coca-Cola (1 versão)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000001-0003-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000003', 1,
   'https://images.unsplash.com/photo-1596803244618-8dea4f67b8a3?w=600&q=80', 'image/jpeg',
   NOW() - INTERVAL '3 days');

-- Email Coca-Cola (1 versão)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000001-0004-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000004', 1,
   'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '10 days');

-- Logo Nubank (1 versão)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000002-0001-0000-0000-000000000001', 'aa000002-0000-0000-0000-000000000001', 1,
   'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '7 days');

-- Paleta Nubank (2 versões)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000002-0002-0000-0000-000000000001', 'aa000002-0000-0000-0000-000000000002', 1,
   'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '6 days'),
  ('vv000002-0002-0000-0000-000000000002', 'aa000002-0000-0000-0000-000000000002', 2,
   'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '5 days');

-- Manual Nubank (1 versão)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000002-0003-0000-0000-000000000001', 'aa000002-0000-0000-0000-000000000003', 1,
   'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '2 days');

-- Banner Magalu (3 versões)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000003-0001-0000-0000-000000000001', 'aa000003-0000-0000-0000-000000000001', 1,
   'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80', 'image/jpeg',
   NOW() - INTERVAL '4 days'),
  ('vv000003-0001-0000-0000-000000000002', 'aa000003-0000-0000-0000-000000000001', 2,
   'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&q=80', 'image/jpeg',
   NOW() - INTERVAL '3 days'),
  ('vv000003-0001-0000-0000-000000000003', 'aa000003-0000-0000-0000-000000000001', 3,
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80', 'image/jpeg',
   NOW() - INTERVAL '2 days');

-- Push Magalu (1 versão)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000003-0002-0000-0000-000000000001', 'aa000003-0000-0000-0000-000000000002', 1,
   'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '3 days');

-- Email Magalu (1 versão)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000003-0003-0000-0000-000000000001', 'aa000003-0000-0000-0000-000000000003', 1,
   'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80', 'image/jpeg',
   NOW() - INTERVAL '1 day');

-- Key Visual Natura (1 versão)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000004-0001-0000-0000-000000000001', 'aa000004-0000-0000-0000-000000000001', 1,
   'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80', 'image/jpeg',
   NOW() - INTERVAL '1 day');

-- Thumbnail Natura (1 versão)
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
  ('vv000004-0002-0000-0000-000000000001', 'aa000004-0000-0000-0000-000000000002', 1,
   'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80', 'image/jpeg',
   NOW() - INTERVAL '6 hours');

-- ============================================================
-- COMENTÁRIOS (com pins e gerais)
-- ============================================================

-- Banner Coca-Cola v3 (aprovado) — comentários da jornada
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, created_at) VALUES
  ('cc000001-0001-0001-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 'vv000001-0001-0000-0000-000000000001',
   'Marcos Ribeiro', 'Muito texto no centro — produto ficou pequeno. Precisamos inverter a hierarquia visual.', 'pin', 48.0, 35.0, false, NOW() - INTERVAL '11 days'),
  ('cc000001-0001-0002-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 'vv000001-0001-0000-0000-000000000002',
   'Marcos Ribeiro', 'Cores mais frias do que o esperado para verão. Pode saturar mais o amarelo?', 'pin', 72.0, 60.0, false, NOW() - INTERVAL '10 days'),
  ('cc000001-0001-0003-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 'vv000001-0001-0000-0000-000000000003',
   'Marcos Ribeiro', 'Perfeito! Exatamente o que precisávamos. Pode usar em todos os formatos.', 'general', NULL, NULL, false, NOW() - INTERVAL '9 days'),
  ('cc000001-0001-0003-0000-000000000002', 'aa000001-0000-0000-0000-000000000001', 'vv000001-0001-0000-0000-000000000003',
   'Ana Souza', 'Logo posicionado corretamente conforme brand guide ✓', 'pin', 15.0, 80.0, false, NOW() - INTERVAL '9 days');

-- Post Instagram Coca-Cola v2 (revisão)
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, created_at) VALUES
  ('cc000001-0002-0001-0000-000000000001', 'aa000001-0000-0000-0000-000000000002', 'vv000001-0002-0000-0000-000000000001',
   'Carla Mendes', 'A fonte está pequena demais no mobile. Precisa no mínimo 18px no corpo do texto.', 'pin', 55.0, 65.0, false, NOW() - INTERVAL '8 days'),
  ('cc000001-0002-0002-0000-000000000001', 'aa000001-0000-0000-0000-000000000002', 'vv000001-0002-0000-0000-000000000002',
   'Carla Mendes', 'Melhorou bastante! Mas o CTA ainda não tem contraste suficiente com o fundo.', 'pin', 50.0, 85.0, false, NOW() - INTERVAL '7 days'),
  ('cc000001-0002-0002-0000-000000000002', 'aa000001-0000-0000-0000-000000000002', 'vv000001-0002-0000-0000-000000000002',
   'Equipe Criação', 'Aguardando ajuste do botão para liberar aprovação final.', 'general', NULL, NULL, true, NOW() - INTERVAL '6 days');

-- Logo Nubank (aprovado)
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, created_at) VALUES
  ('cc000002-0001-0001-0000-000000000001', 'aa000002-0000-0000-0000-000000000001', 'vv000002-0001-0000-0000-000000000001',
   'Rodrigo Lima', 'Perfeito. Segue o brand guide atualizado. Aprovado para todos os formatos.', 'general', NULL, NULL, false, NOW() - INTERVAL '6 days'),
  ('cc000002-0001-0001-0000-000000000002', 'aa000002-0000-0000-0000-000000000001', 'vv000002-0001-0000-0000-000000000001',
   'Rodrigo Lima', 'Espaçamento entre ícone e texto correto ✓', 'pin', 45.0, 50.0, false, NOW() - INTERVAL '6 days');

-- Paleta Nubank v2 (revisão)
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, created_at) VALUES
  ('cc000002-0002-0001-0000-000000000001', 'aa000002-0000-0000-0000-000000000002', 'vv000002-0002-0000-0000-000000000001',
   'Rodrigo Lima', 'O roxo principal está saturado demais para impressão offset. Precisamos de uma versão CMYK validada.', 'pin', 30.0, 40.0, false, NOW() - INTERVAL '6 days'),
  ('cc000002-0002-0002-0000-000000000001', 'aa000002-0000-0000-0000-000000000002', 'vv000002-0002-0000-0000-000000000002',
   'Rodrigo Lima', 'Melhorou, mas ainda precisa validar os tons de apoio com a gráfica.', 'general', NULL, NULL, false, NOW() - INTERVAL '5 days');

-- Banner Magalu — jornada de 3 versões
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, created_at) VALUES
  ('cc000003-0001-0001-0000-000000000001', 'aa000003-0000-0000-0000-000000000001', 'vv000003-0001-0000-0000-000000000001',
   'Fernanda Castro', 'Muito texto. O usuário não vai ler tudo no banner. Simplifica a mensagem principal.', 'pin', 50.0, 30.0, false, NOW() - INTERVAL '4 days'),
  ('cc000003-0001-0002-0000-000000000001', 'aa000003-0000-0000-0000-000000000001', 'vv000003-0001-0000-0000-000000000002',
   'Fernanda Castro', 'As cores estão fracas para Black Friday. Precisa mais contraste e energia.', 'pin', 40.0, 50.0, false, NOW() - INTERVAL '3 days'),
  ('cc000003-0001-0003-0000-000000000001', 'aa000003-0000-0000-0000-000000000001', 'vv000003-0001-0000-0000-000000000003',
   'Fernanda Castro', 'Isso sim! Aprovado. Pode subir para produção.', 'general', NULL, NULL, false, NOW() - INTERVAL '2 days');

-- Push Magalu (revisão)
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, created_at) VALUES
  ('cc000003-0002-0001-0000-000000000001', 'aa000003-0000-0000-0000-000000000002', 'vv000003-0002-0000-0000-000000000001',
   'Fernanda Castro', 'O ícone está com a cor errada — precisa ser amarelo Magalu, não laranja.', 'pin', 20.0, 20.0, false, NOW() - INTERVAL '2 days');

-- Key Visual Natura (aprovado)
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, created_at) VALUES
  ('cc000004-0001-0001-0000-000000000001', 'aa000004-0000-0000-0000-000000000001', 'vv000004-0001-0000-0000-000000000001',
   'Isabela Nunes', 'Lindo! Exatamente o feeling que precisávamos — natureza + modernidade.', 'general', NULL, NULL, false, NOW() - INTERVAL '10 hours'),
  ('cc000004-0001-0001-0000-000000000002', 'aa000004-0000-0000-0000-000000000001', 'vv000004-0001-0000-0000-000000000001',
   'Isabela Nunes', 'Tonalidade verde perfeita para o conceito Plant ✓', 'pin', 60.0, 45.0, false, NOW() - INTERVAL '10 hours');

-- ============================================================
-- APROVAÇÕES
-- ============================================================

-- Banner Coca-Cola v3 aprovado
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES
  ('ap000001-0001-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 'vv000001-0001-0000-0000-000000000003',
   'approved', 'Ficou excelente na terceira versão! Pode publicar em todos os canais.', 'Marcos Ribeiro', NOW() - INTERVAL '9 days');

-- Post Instagram revisão
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES
  ('ap000001-0002-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000002', 'vv000001-0002-0000-0000-000000000002',
   'revision_requested', 'Quase lá! Só precisa melhorar o contraste do botão CTA. O resto está ótimo.', 'Carla Mendes', NOW() - INTERVAL '6 days');

-- Email Coca-Cola aprovado
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES
  ('ap000001-0004-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000004', 'vv000001-0004-0000-0000-000000000001',
   'approved', 'Template aprovado. Pode disparar para a base.', 'Marcos Ribeiro', NOW() - INTERVAL '7 days');

-- Logo Nubank aprovado
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES
  ('ap000002-0001-0000-0000-000000000001', 'aa000002-0000-0000-0000-000000000001', 'vv000002-0001-0000-0000-000000000001',
   'approved', 'Perfeito, segue o brand guide. Aprovado para todas as mídias.', 'Rodrigo Lima', NOW() - INTERVAL '5 days');

-- Paleta Nubank revisão
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES
  ('ap000002-0002-0000-0000-000000000001', 'aa000002-0000-0000-0000-000000000002', 'vv000002-0002-0000-0000-000000000002',
   'revision_requested', 'Precisa validar versão CMYK com a gráfica antes da aprovação final.', 'Rodrigo Lima', NOW() - INTERVAL '4 days');

-- Banner Magalu v3 aprovado
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES
  ('ap000003-0001-0000-0000-000000000001', 'aa000003-0000-0000-0000-000000000001', 'vv000003-0001-0000-0000-000000000003',
   'approved', 'Na terceira foi! Está com energia e clareza. Sobe para produção.', 'Fernanda Castro', NOW() - INTERVAL '2 days');

-- Push Magalu revisão
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES
  ('ap000003-0002-0000-0000-000000000001', 'aa000003-0000-0000-0000-000000000002', 'vv000003-0002-0000-0000-000000000001',
   'revision_requested', 'Cor do ícone errada. Conferir o hex do amarelo Magalu (#FFD300) antes de reenviar.', 'Fernanda Castro', NOW() - INTERVAL '1 day');

-- Key Visual Natura aprovado
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES
  ('ap000004-0001-0000-0000-000000000001', 'aa000004-0000-0000-0000-000000000001', 'vv000004-0001-0000-0000-000000000001',
   'approved', 'Aprovado! Exatamente o que precisávamos para o lançamento.', 'Isabela Nunes', NOW() - INTERVAL '8 hours');

-- ============================================================
-- FIM DO SEED
-- ============================================================
SELECT
  p.name as projeto,
  p.client_name as cliente,
  COUNT(pc.id) as pecas,
  SUM(CASE WHEN pc.status = 'approved' THEN 1 ELSE 0 END) as aprovadas,
  SUM(CASE WHEN pc.status = 'revision_requested' THEN 1 ELSE 0 END) as revisao,
  SUM(CASE WHEN pc.status = 'pending' THEN 1 ELSE 0 END) as pendentes
FROM projects p
LEFT JOIN pieces pc ON pc.project_id = p.id
WHERE p.id IN (
  'bb000001-0000-0000-0000-000000000001','bb000002-0000-0000-0000-000000000001',
  'bb000003-0000-0000-0000-000000000001','bb000004-0000-0000-0000-000000000001'
)
GROUP BY p.id, p.name, p.client_name
ORDER BY p.created_at;
