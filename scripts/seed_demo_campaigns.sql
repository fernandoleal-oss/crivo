-- ============================================================
-- CRIVO — Seed: 6 campanhas demo extras
-- Cola no Supabase SQL Editor DEPOIS do full_setup.sql
-- Idempotente: usa ON CONFLICT DO NOTHING
-- ============================================================

-- ── 1. Natura — Dia dos Namorados ──
INSERT INTO projects (id, name, client_name, sector, briefing_score, briefing_data, created_at) VALUES
('dd000001-0000-0000-0000-000000000001',
 'Dia dos Namorados 2026 — Natura', 'Natura', 'criacao', 89,
 '{"produto":"Linha Essencial — presente para casal","verba":"R$ 95.000","prazo":"12/06/2026","aprovador":"Juliana Faria (Head de Branding)","assets_necessarios":["fotos de casal","embalagem mockup","paleta Natura"],"observacoes":"Tom sensorial, sofisticado. Evitar clichê de coração.","informacoes_faltando":[],"resumo_executivo":"Campanha sensorial para Dia dos Namorados com foco na linha Essencial.","confianca_analise":89,"transcription_summary":"Call 28/03 — Juliana Faria (Natura) com Desirre. Linha Essencial Dia dos Namorados, tom sofisticado. Verba R$95k. Prazo 12/06."}',
 NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pieces (id, project_id, title, description, status, public_token, deadline, ai_score, ai_issues, internal_status, created_at, updated_at) VALUES
('dd100001-0000-0000-0000-000000000001', 'dd000001-0000-0000-0000-000000000001',
 'Key Visual — Campanha Essencial', 'Imagem principal: casal em momento íntimo com produtos Natura.',
 'pending', 'tok_natura_kv01', NOW() + INTERVAL '14 days', 85, NULL, 'in_review',
 NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
('dd100002-0000-0000-0000-000000000001', 'dd000001-0000-0000-0000-000000000001',
 'Carrossel Instagram — 5 slides', 'Carrossel com 5 fotos dos produtos + dica de presente.',
 'pending', 'tok_natura_carrossel01', NOW() + INTERVAL '10 days', 72,
 ARRAY['Texto pequeno no slide 3','CTA pouco visível no último slide'], 'draft',
 NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
('dd200001-0000-0000-0000-000000000001', 'dd100001-0000-0000-0000-000000000001', 1,
 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80', 'image/jpeg', NOW() - INTERVAL '2 hours'),
('dd200002-0000-0000-0000-000000000001', 'dd100002-0000-0000-0000-000000000001', 1,
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1080&q=80', 'image/jpeg', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at, role, step_order) VALUES
('dd300001-0000-0000-0000-000000000001', 'dd100001-0000-0000-0000-000000000001', 'dd200001-0000-0000-0000-000000000001',
 'approved', 'Composição e iluminação excelentes. Seguir.', 'Bruno', NOW() - INTERVAL '1 hour', 'da', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, resolved, created_at) VALUES
('dd400001-0000-0000-0000-000000000001', 'dd100001-0000-0000-0000-000000000001', 'dd200001-0000-0000-0000-000000000001',
 'Bruno (Criação)', 'Foto linda. Sugiro crop mais fechado no rosto para story.', 'general', NULL, NULL, true, false, NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;


-- ── 2. Havaianas — Coleção Verão 2027 ──
INSERT INTO projects (id, name, client_name, sector, briefing_score, briefing_data, created_at) VALUES
('dd000002-0000-0000-0000-000000000002',
 'Coleção Verão 2027 — Havaianas', 'Havaianas', 'criacao', 76,
 '{"produto":"Havaianas Slim Tropical — lançamento coleção verão","verba":"R$ 200.000","prazo":"01/09/2026","aprovador":"Ricardo Mendes (Dir. Marketing)","assets_necessarios":["fotos produto","modelos na praia","paleta tropical"],"observacoes":"Mood: tropical, jovem, alegre. Pode usar humor leve.","informacoes_faltando":["modelos confirmadas","locação definida"],"resumo_executivo":"Lançamento coleção Slim Tropical, campanha 360 com foco em digital e OOH praias.","confianca_analise":76,"transcription_summary":"Call 27/03 — Ricardo Mendes (Havaianas) com Desirre e Fabiana. Coleção Slim Tropical, lançamento verão. Verba R$200k. Prazo set/26. Modelos e locação pendentes."}',
 NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pieces (id, project_id, title, description, status, public_token, deadline, ai_score, ai_issues, internal_status, created_at, updated_at) VALUES
('dd100001-0000-0000-0000-000000000002', 'dd000002-0000-0000-0000-000000000002',
 'Vídeo Manifesto 30s — Digital + TV', 'Filme principal: modelos na praia com sandálias Slim Tropical.',
 'pending', 'tok_havaianas_video01', NOW() + INTERVAL '21 days', NULL, NULL, 'draft',
 NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('dd100002-0000-0000-0000-000000000002', 'dd000002-0000-0000-0000-000000000002',
 'OOH Praia — Outdoor 3x9m', 'Outdoor para praias do litoral de SP e RJ.',
 'pending', 'tok_havaianas_ooh01', NOW() + INTERVAL '28 days', 88, NULL, 'in_review',
 NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
('dd100003-0000-0000-0000-000000000002', 'dd000002-0000-0000-0000-000000000002',
 'Feed Instagram — Grid 3x3', 'Nove peças formando mosaico no feed.',
 'pending', 'tok_havaianas_grid01', NOW() + INTERVAL '18 days', 64,
 ARRAY['Mosaico quebra no grid se post intermediário for compartilhado'], 'draft',
 NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
('dd200001-0000-0000-0000-000000000002', 'dd100001-0000-0000-0000-000000000002', 1,
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=80', 'image/jpeg', NOW() - INTERVAL '2 hours'),
('dd200002-0000-0000-0000-000000000002', 'dd100002-0000-0000-0000-000000000002', 1,
 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80', 'image/jpeg', NOW() - INTERVAL '2 hours'),
('dd200003-0000-0000-0000-000000000002', 'dd100003-0000-0000-0000-000000000002', 1,
 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1080&q=80', 'image/jpeg', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at, role, step_order) VALUES
('dd300001-0000-0000-0000-000000000002', 'dd100002-0000-0000-0000-000000000002', 'dd200002-0000-0000-0000-000000000002',
 'approved', 'Proporções OOH perfeitas. Seguir.', 'Bruno', NOW() - INTERVAL '1 hour', 'da', 1)
ON CONFLICT (id) DO NOTHING;


-- ── 3. Bradesco/Next — Conta Gen Z ──
INSERT INTO projects (id, name, client_name, sector, briefing_score, briefing_data, created_at) VALUES
('dd000003-0000-0000-0000-000000000003',
 'Conta Digital Next — Gen Z', 'Bradesco / Next', 'atendimento', 82,
 '{"produto":"Conta Next Gen Z — abertura 100% digital","verba":"R$ 150.000","prazo":"15/05/2026","aprovador":"Amanda Luz (Gerente de Produto Digital)","assets_necessarios":["mockup app Next","fotos jovens diversos","ícones do app"],"observacoes":"Linguagem jovem, sem ser forçada. Diversidade é obrigatória nos castings.","informacoes_faltando":[],"resumo_executivo":"Campanha digital para aquisição de correntistas Gen Z via conta Next.","confianca_analise":82,"transcription_summary":"Call 26/03 — Amanda Luz (Bradesco) com Desirre. Conta Next Gen Z, abertura digital. Verba R$150k. Prazo 15/05. Diversidade obrigatória."}',
 NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pieces (id, project_id, title, description, status, public_token, deadline, ai_score, ai_issues, internal_status, created_at, updated_at) VALUES
('dd100001-0000-0000-0000-000000000003', 'dd000003-0000-0000-0000-000000000003',
 'Vídeo TikTok 15s — "Sua vida, seu banco"', 'Vídeo vertical estilo UGC com creators.',
 'pending', 'tok_next_tiktok01', NOW() + INTERVAL '12 days', 91, NULL, 'in_review',
 NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes'),
('dd100002-0000-0000-0000-000000000003', 'dd000003-0000-0000-0000-000000000003',
 'Banner Google Display 300x250', 'Display para campanha de performance.',
 'pending', 'tok_next_display01', NOW() + INTERVAL '10 days', 68,
 ARRAY['CTA "Abra sua conta" pouco contrastado','Logo Next muito pequeno'], 'draft',
 NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
('dd200001-0000-0000-0000-000000000003', 'dd100001-0000-0000-0000-000000000003', 1,
 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1080&q=80', 'image/jpeg', NOW() - INTERVAL '1 hour'),
('dd200002-0000-0000-0000-000000000003', 'dd100002-0000-0000-0000-000000000003', 1,
 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=300&q=80', 'image/jpeg', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at, role, step_order) VALUES
('dd300001-0000-0000-0000-000000000003', 'dd100001-0000-0000-0000-000000000003', 'dd200001-0000-0000-0000-000000000003',
 'approved', 'Pegada UGC muito boa. Seguir.', 'Bruno', NOW() - INTERVAL '45 minutes', 'da', 1),
('dd300002-0000-0000-0000-000000000003', 'dd100001-0000-0000-0000-000000000003', 'dd200001-0000-0000-0000-000000000003',
 'approved', 'Copy jovem sem forçar. Ótimo.', 'Carla', NOW() - INTERVAL '20 minutes', 'redator', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, resolved, created_at) VALUES
('dd400001-0000-0000-0000-000000000003', 'dd100001-0000-0000-0000-000000000003', 'dd200001-0000-0000-0000-000000000003',
 'Desirre (Atendimento)', 'Amanda adorou o conceito no call. Disse pra seguir nessa linha.', 'general', NULL, NULL, true, false, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;


-- ── 4. 99 — Carnaval 2027 ──
INSERT INTO projects (id, name, client_name, sector, briefing_score, briefing_data, created_at) VALUES
('dd000004-0000-0000-0000-000000000004',
 'Carnaval 2027 — #VaiDe99', '99', 'midia', 0, NULL,
 NOW() - INTERVAL '40 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pieces (id, project_id, title, description, status, public_token, deadline, ai_score, ai_issues, internal_status, created_at, updated_at) VALUES
('dd100001-0000-0000-0000-000000000004', 'dd000004-0000-0000-0000-000000000004',
 'Stories Animados — Contagem Regressiva', 'Série de 5 stories com contagem regressiva pro Carnaval.',
 'pending', 'tok_99_stories01', NOW() + INTERVAL '30 days', NULL, NULL, 'draft',
 NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
('dd200001-0000-0000-0000-000000000004', 'dd100001-0000-0000-0000-000000000004', 1,
 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1080&q=80', 'image/jpeg', NOW() - INTERVAL '40 minutes')
ON CONFLICT (id) DO NOTHING;


-- ── 5. Nestlé — KitKat Gold ──
INSERT INTO projects (id, name, client_name, sector, briefing_score, briefing_data, created_at) VALUES
('dd000005-0000-0000-0000-000000000005',
 'Lançamento KitKat Gold', 'Nestlé', 'criacao', 95,
 '{"produto":"KitKat Gold — edição limitada sabor caramelo","verba":"R$ 180.000","prazo":"20/05/2026","aprovador":"Fernanda Rocha (Brand Manager Chocolates)","assets_necessarios":["foto produto Gold","embalagem 3D render","paleta dourada"],"observacoes":"Premium, indulgente. Destaque para o dourado. Campanha 360.","informacoes_faltando":[],"resumo_executivo":"Lançamento edição limitada KitKat Gold com campanha digital + PDV.","confianca_analise":95,"transcription_summary":"Call 27/03 — Fernanda Rocha (Nestlé) com Desirre. KitKat Gold edição limitada, sabor caramelo. Verba R$180k. Prazo 20/05. Premium e indulgente."}',
 NOW() - INTERVAL '20 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pieces (id, project_id, title, description, status, public_token, deadline, ai_score, ai_issues, internal_status, created_at, updated_at) VALUES
('dd100001-0000-0000-0000-000000000005', 'dd000005-0000-0000-0000-000000000005',
 'Key Visual — Embalagem Gold', 'Imagem hero com embalagem dourada em fundo premium.',
 'approved', 'tok_kitkat_kv01', NOW() + INTERVAL '7 days', 96, NULL, 'sent_to_client',
 NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '5 minutes'),
('dd100002-0000-0000-0000-000000000005', 'dd000005-0000-0000-0000-000000000005',
 'Reels 15s — Unboxing Gold', 'Vídeo vertical de unboxing sensorial.',
 'pending', 'tok_kitkat_reels01', NOW() + INTERVAL '10 days', 78,
 ARRAY['Marca d''água visível no canto'], 'in_review',
 NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),
('dd100003-0000-0000-0000-000000000005', 'dd000005-0000-0000-0000-000000000005',
 'Display PDV — Totem Dourado', 'Totem para ponto de venda em supermercados.',
 'pending', 'tok_kitkat_pdv01', NOW() + INTERVAL '14 days', 82, NULL, 'draft',
 NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
('dd200001-0000-0000-0000-000000000005', 'dd100001-0000-0000-0000-000000000005', 1,
 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=1200&q=80', 'image/jpeg', NOW() - INTERVAL '20 minutes'),
('dd200002-0000-0000-0000-000000000005', 'dd100002-0000-0000-0000-000000000005', 1,
 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1080&q=80', 'image/jpeg', NOW() - INTERVAL '20 minutes'),
('dd200003-0000-0000-0000-000000000005', 'dd100003-0000-0000-0000-000000000005', 1,
 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1080&q=80', 'image/jpeg', NOW() - INTERVAL '20 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at, role, step_order) VALUES
('dd300001-0000-0000-0000-000000000005', 'dd100001-0000-0000-0000-000000000005', 'dd200001-0000-0000-0000-000000000005',
 'approved', 'Dourado impecável.', 'Bruno', NOW() - INTERVAL '18 minutes', 'da', 1),
('dd300002-0000-0000-0000-000000000005', 'dd100001-0000-0000-0000-000000000005', 'dd200001-0000-0000-0000-000000000005',
 'approved', 'Copy premium e direto.', 'Carla', NOW() - INTERVAL '15 minutes', 'redator', 2),
('dd300003-0000-0000-0000-000000000005', 'dd100001-0000-0000-0000-000000000005', 'dd200001-0000-0000-0000-000000000005',
 'approved', 'Alinhado com brand Nestlé. Aprovado.', 'Rodrigo', NOW() - INTERVAL '10 minutes', 'dc', 3),
('dd300004-0000-0000-0000-000000000005', 'dd100001-0000-0000-0000-000000000005', 'dd200001-0000-0000-0000-000000000005',
 'approved', 'Perfeito! Pode produzir.', 'Patricia', NOW() - INTERVAL '5 minutes', 'ecd', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, resolved, created_at) VALUES
('dd400001-0000-0000-0000-000000000005', 'dd100001-0000-0000-0000-000000000005', 'dd200001-0000-0000-0000-000000000005',
 'Fernanda Rocha', 'O dourado ficou exatamente como imaginei. Aprovado!', 'general', NULL, NULL, false, true, NOW() - INTERVAL '3 minutes')
ON CONFLICT (id) DO NOTHING;


-- ── 6. Vivo — 5G para Todos ──
INSERT INTO projects (id, name, client_name, sector, briefing_score, briefing_data, created_at) VALUES
('dd000006-0000-0000-0000-000000000006',
 'Campanha 5G para Todos', 'Vivo', 'atendimento', 67,
 '{"produto":"Plano Vivo 5G — democratização do acesso","verba":"R$ 250.000","prazo":"10/06/2026","aprovador":"Lucas Diniz (Dir. de Comunicação)","assets_necessarios":["logo 5G","mockup celular 5G","ícones velocidade"],"observacoes":"Foco em acessibilidade e inclusão digital. Evitar linguagem técnica.","informacoes_faltando":["planos e preços finais","praças de lançamento"],"resumo_executivo":"Campanha de democratização do 5G com foco em inclusão. Verba aprovada mas praças indefinidas.","confianca_analise":67,"transcription_summary":"Call 25/03 — Lucas Diniz (Vivo) com Desirre. 5G para Todos, inclusão digital. Verba R$250k. Prazo 10/06. Praças e preços pendentes."}',
 NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pieces (id, project_id, title, description, status, public_token, deadline, ai_score, ai_issues, internal_status, created_at, updated_at) VALUES
('dd100001-0000-0000-0000-000000000006', 'dd000006-0000-0000-0000-000000000006',
 'Filme 30s — "Conecta Todo Mundo"', 'Filme emocional com famílias de diferentes regiões usando 5G.',
 'revision_requested', 'tok_vivo_filme01', NOW() + INTERVAL '16 days', 74,
 ARRAY['Legendas ausentes (acessibilidade)','Transição brusca no segundo 18'], 'in_review',
 NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes'),
('dd100002-0000-0000-0000-000000000006', 'dd000006-0000-0000-0000-000000000006',
 'Banner LinkedIn 1200x628', 'Campanha de awareness corporativa.',
 'pending', 'tok_vivo_linkedin01', NOW() + INTERVAL '12 days', 81, NULL, 'in_review',
 NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES
('dd200001-0000-0000-0000-000000000006', 'dd100001-0000-0000-0000-000000000006', 1,
 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1280&q=80', 'image/jpeg', NOW() - INTERVAL '10 minutes'),
('dd200002-0000-0000-0000-000000000006', 'dd100002-0000-0000-0000-000000000006', 1,
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80', 'image/jpeg', NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at, role, step_order) VALUES
('dd300001-0000-0000-0000-000000000006', 'dd100001-0000-0000-0000-000000000006', 'dd200001-0000-0000-0000-000000000006',
 'approved', 'Storyboard ok. Seguir.', 'Bruno', NOW() - INTERVAL '8 minutes', 'da', 1),
('dd300002-0000-0000-0000-000000000006', 'dd100001-0000-0000-0000-000000000006', 'dd200001-0000-0000-0000-000000000006',
 'revision_requested', 'Precisa legendas e ajustar transição no 18s. Fora isso, ótimo.', 'Carla', NOW() - INTERVAL '5 minutes', 'redator', 2),
('dd300003-0000-0000-0000-000000000006', 'dd100002-0000-0000-0000-000000000006', 'dd200002-0000-0000-0000-000000000006',
 'approved', 'Layout LinkedIn dentro do padrão corporativo.', 'Bruno', NOW() - INTERVAL '3 minutes', 'da', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, resolved, created_at) VALUES
('dd400001-0000-0000-0000-000000000006', 'dd100001-0000-0000-0000-000000000006', 'dd200001-0000-0000-0000-000000000006',
 'Lucas Diniz', 'Gostei do conceito mas precisa legenda em tudo. Nosso público é diverso.', 'general', NULL, NULL, false, false, NOW() - INTERVAL '3 minutes')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT
  'projects' as tabela, count(*) as total FROM projects
UNION ALL SELECT 'pieces', count(*) FROM pieces
UNION ALL SELECT 'piece_versions', count(*) FROM piece_versions
UNION ALL SELECT 'approvals', count(*) FROM approvals
UNION ALL SELECT 'comments', count(*) FROM comments
UNION ALL SELECT 'suppliers', count(*) FROM suppliers;
