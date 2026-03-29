-- ============================================================
-- CRIVO — Demo Seed v3 (sequential approvals + AI transcription)
-- Run after migration 004_approval_chain.sql
-- ============================================================

-- Clean up in FK order
DELETE FROM approvals;
DELETE FROM comments;
DELETE FROM piece_versions;
DELETE FROM pieces;
DELETE FROM projects;
DELETE FROM suppliers;

-- ============================================================
-- PROJETOS (5)
-- ============================================================
INSERT INTO projects (id, name, client_name, sector, briefing_score, briefing_data, created_at) VALUES

-- iFood: Dia das Mães (criação, score alto)
('10000001-0000-0000-0000-000000000001',
 'Campanha Dia das Mães 2026', 'iFood', 'criacao', 94,
 '{"produto":"Entrega Grátis Dia das Mães","verba":"R$ 120.000","prazo":"05/05/2026","aprovador":"Camila Torres (Head de Marketing)","assets_necessarios":["logo iFood alta resolução","fotos de mães com entregadores","paleta Dia das Mães"],"observacoes":"Campanha emocional, foco em gratidão. Evitar humor.","informacoes_faltando":[],"resumo_executivo":"Campanha digital para o Dia das Mães com foco em entrega grátis. Verba aprovada, prazo definido, aprovador confirmado.","confianca_analise":94,"transcription_summary":"Call 26/03 14h — Camila Torres (iFood) com Desirre. Campanha emocional Dia das Mães, foco entrega grátis. Verba R$120k aprovada. Prazo 05/05."}',
 NOW() - INTERVAL '7 days'),

-- Nubank: NuPay (atendimento, score médio — faltam infos)
('20000002-0000-0000-0000-000000000002',
 'Lançamento NuPay', 'Nubank', 'atendimento', 61,
 '{"produto":"NuPay — pagamento por aproximação","verba":null,"prazo":"20/04/2026","aprovador":"Rodrigo Lopes (Gerente de Produto)","assets_necessarios":["ícone NuPay","mockup celular","paleta roxa Nubank"],"observacoes":null,"informacoes_faltando":["verba total da campanha","canais de veiculação confirmados"],"resumo_executivo":"Lançamento do NuPay com prazo definido mas verba e canais ainda não confirmados pelo cliente.","confianca_analise":61,"transcription_summary":"Call 24/03 10h — Rodrigo Lopes (Nubank) com Desirre. Lançamento NuPay, pagamento por aproximação. Verba pendente aprovação diretoria. Prazo 20/04. Canais ainda indefinidos."}',
 NOW() - INTERVAL '5 days'),

-- Magalu: Black Friday (mídia, briefing vazio — score 0)
('30000003-0000-0000-0000-000000000003',
 'Black Friday 2026 — Digital', 'Magazine Luiza', 'midia', 0, null,
 NOW() - INTERVAL '2 days'),

-- Itaú: Renegociação (criação, score alto)
('40000004-0000-0000-0000-000000000004',
 'Campanha Renegocia Fácil', 'Itaú Unibanco', 'criacao', 88,
 '{"produto":"Renegocia Fácil — renegociação digital de dívidas","verba":"R$ 85.000","prazo":"30/04/2026","aprovador":"Patricia Alves (Diretora de Comunicação)","assets_necessarios":["manual de marca Itaú","ícones da plataforma","mockups mobile"],"observacoes":"Tom acolhedor, não alarmista. Evitar menção a dívidas de forma negativa.","informacoes_faltando":[],"resumo_executivo":"Campanha educativa sobre renegociação digital. Verba e aprovador definidos.","confianca_analise":88,"transcription_summary":"Call 25/03 16h — Patricia Alves (Itaú) com Fabi e Bruno. Campanha Renegocia Fácil, tom acolhedor. Verba R$85k confirmada. Prazo 30/04. Evitar linguagem negativa sobre dívidas."}',
 NOW() - INTERVAL '4 days'),

-- Ambev: Copa do Mundo (atendimento, score médio)
('50000005-0000-0000-0000-000000000005',
 'Ativação Copa do Mundo 2026', 'Ambev / Brahma', 'atendimento', 72,
 '{"produto":"Brahma Copa do Mundo 2026 — ativação digital + OOH","verba":"R$ 320.000","prazo":"01/06/2026","aprovador":"Renato Coelho (Gerente Nacional)","assets_necessarios":["logo Brahma Copa","mascote oficial","paleta Copa 2026"],"observacoes":"Material precisa seguir guidelines FIFA. Validação jurídica obrigatória.","informacoes_faltando":["aprovação jurídica FIFA pending","canais OOH confirmados"],"resumo_executivo":"Grande ativação Copa do Mundo com verba robusta mas com pendências jurídicas.","confianca_analise":72,"transcription_summary":"Call 23/03 11h — Renato Coelho (Ambev) com Desirre e Fabi. Ativação Copa do Mundo Brahma, digital + OOH 8 capitais. Verba R$320k. Prazo 01/06. Pendência jurídica FIFA."}',
 NOW() - INTERVAL '6 days');


-- ============================================================
-- PEÇAS (12) — now with internal_status
-- ============================================================
INSERT INTO pieces (id, project_id, title, description, status, public_token, deadline,
                    ai_score, ai_issues, notified_at, first_opened_at, created_at, updated_at, internal_status) VALUES

-- iFood Dia das Mães
('a1000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001',
 'Banner Feed Instagram 1080×1080', 'Versão principal — mãe recebendo pedido', 'approved',
 'tok_ifood_feed01', '2026-04-28',
 91, NULL,
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days',
 NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day', 'sent_to_client'),

('a2000002-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001',
 'Story Instagram 1080×1920', 'Versão story com CTA "Peça agora"', 'approved',
 'tok_ifood_story01', '2026-04-28',
 87, NULL,
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
 NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days', 'internally_approved'),

('a3000003-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001',
 'Banner Site Header 1920×600', 'Header da homepage no período da campanha', 'pending',
 'tok_ifood_header01', '2026-05-01',
 43, ARRAY['Contraste de texto insuficiente (WCAG AA)','CTA não identificado claramente','Hierarquia tipográfica fraca no mobile'],
 NULL, NULL,
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'draft'),

-- Nubank NuPay
('b1000001-0000-0000-0000-000000000002', '20000002-0000-0000-0000-000000000002',
 'Key Visual Principal', 'Imagem âncora da campanha NuPay', 'revision_requested',
 'tok_nubank_kv01', '2026-04-15',
 58, ARRAY['Tipografia muito pequena (≤10px)','Fundo escuro reduz legibilidade do logo'],
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
 NOW() - INTERVAL '4 days', NOW() - INTERVAL '12 hours', 'in_review'),

('b2000002-0000-0000-0000-000000000002', '20000002-0000-0000-0000-000000000002',
 'Banner Google Display 300×250', 'Versão adaptada para rede de display', 'pending',
 'tok_nubank_display01', '2026-04-18',
 76, ARRAY['Área segura insuficiente nas bordas'],
 NULL, NULL,
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'in_review'),

-- Magalu Black Friday
('c1000001-0000-0000-0000-000000000003', '30000003-0000-0000-0000-000000000003',
 'Spot de Rádio 30s — Roteiro', 'Roteiro para aprovação antes da gravação', 'pending',
 'tok_magalu_radio01', '2026-04-10',
 NULL, NULL,
 NULL, NULL,
 NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', 'draft'),

('c2000002-0000-0000-0000-000000000003', '30000003-0000-0000-0000-000000000003',
 'Vídeo 15s — Instagram Reels', 'Corte para Reels da campanha Black Friday', 'pending',
 'tok_magalu_reels01', '2026-04-10',
 38, ARRAY['Sem legendas (acessibilidade)','Corte abrupto no 12s','Logo aparece apenas no frame final'],
 NULL, NULL,
 NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', 'draft'),

-- Itaú Renegocia Fácil
('d1000001-0000-0000-0000-000000000004', '40000004-0000-0000-0000-000000000004',
 'Vídeo Explicativo 60s — YouTube', 'Vídeo principal explicando o fluxo de renegociação', 'approved',
 'tok_itau_video01', '2026-04-22',
 82, NULL,
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 'sent_to_client'),

('d2000002-0000-0000-0000-000000000004', '40000004-0000-0000-0000-000000000004',
 'Banner LinkedIn 1200×628', 'Versão para campanha de awareness no LinkedIn', 'revision_requested',
 'tok_itau_linkedin01', '2026-04-25',
 55, ARRAY['Hierarquia de informação invertida','CTA "Saiba mais" genérico demais'],
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '4 days', NOW() - INTERVAL '6 hours', 'in_review'),

('d3000003-0000-0000-0000-000000000004', '40000004-0000-0000-0000-000000000004',
 'E-mail Marketing HTML', 'E-mail disparado para base de clientes com dívida', 'pending',
 'tok_itau_email01', '2026-04-20',
 79, ARRAY['Subject line com 68 chars (ideal < 50)'],
 NULL, NULL,
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'draft'),

-- Ambev Copa
('e1000001-0000-0000-0000-000000000005', '50000005-0000-0000-0000-000000000005',
 'Manifesto 30s — TV e Digital', 'Filme manifesto principal da campanha Copa', 'pending',
 'tok_brahma_manifesto01', '2026-05-15',
 NULL, NULL,
 NULL, NULL,
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'draft'),

('e2000002-0000-0000-0000-000000000005', '50000005-0000-0000-0000-000000000005',
 'Pacote OOH — 12 formatos', 'Outdoors, metrô, busdoor para 8 capitais', 'approved',
 'tok_brahma_ooh01', '2026-05-10',
 93, NULL,
 NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days',
 NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days', 'internally_approved');


-- ============================================================
-- VERSÕES
-- ============================================================
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES

-- iFood feed (1 versão aprovada)
('f1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 1, 'https://images.unsplash.com/photo-1565299624946-b28f40a04680?w=1080&h=1080&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '6 days'),

-- iFood story (1 versão aprovada)
('f2000002-0000-0000-0000-000000000001', 'a2000002-0000-0000-0000-000000000001',
 1, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080&h=1080&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '6 days'),

-- iFood header (1 versão com problemas)
('f3000003-0000-0000-0000-000000000001', 'a3000003-0000-0000-0000-000000000001',
 1, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1920&h=600&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '1 day'),

-- Nubank KV: 2 versões (v1 reprovada, v2 aguardando)
('f4000004-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 1, 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1080&h=1080&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '4 days'),

('f5000005-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 2, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&h=1080&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '12 hours'),

-- Nubank display
('f6000006-0000-0000-0000-000000000002', 'b2000002-0000-0000-0000-000000000002',
 1, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=250&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '2 days'),

-- Magalu rádio
('f7000007-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000003',
 1, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1080&h=1080&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '6 hours'),

-- Magalu reels
('f8000008-0000-0000-0000-000000000003', 'c2000002-0000-0000-0000-000000000003',
 1, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1080&h=1920&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '6 hours'),

-- Itaú vídeo
('f9000009-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000004',
 1, 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1280&h=720&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '5 days'),

-- Itaú LinkedIn: 2 versões
('fa000001-0000-0000-0000-000000000004', 'd2000002-0000-0000-0000-000000000004',
 1, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&h=628&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '4 days'),

('fa000002-0000-0000-0000-000000000004', 'd2000002-0000-0000-0000-000000000004',
 2, 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=628&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '6 hours'),

-- Itaú e-mail
('fb000001-0000-0000-0000-000000000004', 'd3000003-0000-0000-0000-000000000004',
 1, 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=600&h=800&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '1 day'),

-- Ambev manifesto
('fc000001-0000-0000-0000-000000000005', 'e1000001-0000-0000-0000-000000000005',
 1, 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1280&h=720&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '5 days'),

-- Ambev OOH: 2 versões
('fd000001-0000-0000-0000-000000000005', 'e2000002-0000-0000-0000-000000000005',
 1, 'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=1200&h=628&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '6 days'),

('fd000002-0000-0000-0000-000000000005', 'e2000002-0000-0000-0000-000000000005',
 2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=628&fit=crop', 'image/jpeg',
 NOW() - INTERVAL '3 days');


-- ============================================================
-- APROVAÇÕES (sequential chain with role + step_order)
-- ============================================================
-- Roles: DA (step 1, Bruno), Redator (step 2, Carla), DC (step 3, Rodrigo), ECD (step 4, Patricia)
-- ============================================================
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at, role, step_order) VALUES

-- iFood Feed — full chain approved → sent_to_client
('e1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 'f1000001-0000-0000-0000-000000000001',
 'approved', 'Layout e grid ok, pode seguir.', 'Bruno',
 NOW() - INTERVAL '5 days', 'da', 1),

('e1000002-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 'f1000001-0000-0000-0000-000000000001',
 'approved', 'Copy revisado, sem ajustes.', 'Carla',
 NOW() - INTERVAL '4 days', 'redator', 2),

('e1000003-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 'f1000001-0000-0000-0000-000000000001',
 'approved', 'Conceito criativo alinhado com briefing. Aprovado.', 'Rodrigo',
 NOW() - INTERVAL '3 days', 'dc', 3),

('e1000004-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 'f1000001-0000-0000-0000-000000000001',
 'approved', 'Perfeito! Exatamente o que pedimos. Pode produzir.', 'Patricia',
 NOW() - INTERVAL '2 days', 'ecd', 4),

-- iFood Story — full chain approved → internally_approved
('e2000001-0000-0000-0000-000000000001', 'a2000002-0000-0000-0000-000000000001',
 'f2000002-0000-0000-0000-000000000001',
 'approved', 'Formato story ok, CTA bem posicionado.', 'Bruno',
 NOW() - INTERVAL '5 days', 'da', 1),

('e2000002-0000-0000-0000-000000000001', 'a2000002-0000-0000-0000-000000000001',
 'f2000002-0000-0000-0000-000000000001',
 'approved', 'Texto enxuto e direto. Aprovado.', 'Carla',
 NOW() - INTERVAL '4 days', 'redator', 2),

('e2000003-0000-0000-0000-000000000001', 'a2000002-0000-0000-0000-000000000001',
 'f2000002-0000-0000-0000-000000000001',
 'approved', 'Boa execução, linguagem emocional adequada.', 'Rodrigo',
 NOW() - INTERVAL '3 days', 'dc', 3),

('e2000004-0000-0000-0000-000000000001', 'a2000002-0000-0000-0000-000000000001',
 'f2000002-0000-0000-0000-000000000001',
 'approved', 'Aprovado. O CTA ficou muito bom.', 'Patricia',
 NOW() - INTERVAL '2 days', 'ecd', 4),

-- iFood Header (draft, score 43) — no approvals

-- Nubank KV — DA✅ Redator✅ DC❌ → in_review
('e3000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 'f4000004-0000-0000-0000-000000000002',
 'approved', 'Composição visual ok, seguir para copy.', 'Bruno',
 NOW() - INTERVAL '3 days', 'da', 1),

('e3000002-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 'f4000004-0000-0000-0000-000000000002',
 'approved', 'Copy aprovado com ressalva de tamanho mobile.', 'Carla',
 NOW() - INTERVAL '2 days', 'redator', 2),

('e3000003-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 'f4000004-0000-0000-0000-000000000002',
 'revision_requested',
 'A tipografia está pequena demais no mobile. Precisamos aumentar o título pelo menos 20%. O roxo do fundo está escuro — o logo some. Pode testar com o roxo padrão da nossa paleta?',
 'Rodrigo',
 NOW() - INTERVAL '1 day', 'dc', 3),

-- Nubank Display — DA✅ → in_review
('e4000001-0000-0000-0000-000000000002', 'b2000002-0000-0000-0000-000000000002',
 'f6000006-0000-0000-0000-000000000002',
 'approved', 'Layout 300x250 dentro da área segura. Ok.', 'Bruno',
 NOW() - INTERVAL '1 day', 'da', 1),

-- Magalu Radio (draft) — no approvals
-- Magalu Reels (draft) — no approvals

-- Itaú Video — full chain approved → sent_to_client
('e5000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000004',
 'f9000009-0000-0000-0000-000000000004',
 'approved', 'Storyboard e cortes ok.', 'Bruno',
 NOW() - INTERVAL '4 days', 'da', 1),

('e5000002-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000004',
 'f9000009-0000-0000-0000-000000000004',
 'approved', 'Roteiro e locução revisados. Tom acolhedor mantido.', 'Carla',
 NOW() - INTERVAL '3 days', 'redator', 2),

('e5000003-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000004',
 'f9000009-0000-0000-0000-000000000004',
 'approved', 'Direção criativa alinhada. Aprovado.', 'Rodrigo',
 NOW() - INTERVAL '2 days', 'dc', 3),

('e5000004-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000004',
 'f9000009-0000-0000-0000-000000000004',
 'approved',
 'Excelente execução! O tom acolhedor ficou muito bem representado. Aprovado para veiculação.',
 'Patricia',
 NOW() - INTERVAL '1 day', 'ecd', 4),

-- Itaú LinkedIn — DA✅ Redator❌ → in_review
('e6000001-0000-0000-0000-000000000004', 'd2000002-0000-0000-0000-000000000004',
 'fa000001-0000-0000-0000-000000000004',
 'approved', 'Formato LinkedIn dentro do padrão.', 'Bruno',
 NOW() - INTERVAL '2 days', 'da', 1),

('e6000002-0000-0000-0000-000000000004', 'd2000002-0000-0000-0000-000000000004',
 'fa000001-0000-0000-0000-000000000004',
 'revision_requested',
 'A hierarquia ficou confusa — o benefício principal não aparece de imediato. Precisa revisão no copy e no CTA.',
 'Carla',
 NOW() - INTERVAL '1 day', 'redator', 2),

-- Itaú Email (draft) — no approvals

-- Ambev Manifesto (draft) — no approvals

-- Ambev OOH — full chain approved → internally_approved
('e7000001-0000-0000-0000-000000000005', 'e2000002-0000-0000-0000-000000000005',
 'fd000002-0000-0000-0000-000000000005',
 'approved', 'Formatos OOH conferidos, proporções ok.', 'Bruno',
 NOW() - INTERVAL '5 days', 'da', 1),

('e7000002-0000-0000-0000-000000000005', 'e2000002-0000-0000-0000-000000000005',
 'fd000002-0000-0000-0000-000000000005',
 'approved', 'Textos curtos e impactantes. Adequado para OOH.', 'Carla',
 NOW() - INTERVAL '4 days', 'redator', 2),

('e7000003-0000-0000-0000-000000000005', 'e2000002-0000-0000-0000-000000000005',
 'fd000002-0000-0000-0000-000000000005',
 'approved', 'Paleta Copa vibrante, logo Brahma bem posicionado. Guidelines FIFA ok.', 'Rodrigo',
 NOW() - INTERVAL '3 days', 'dc', 3),

('e7000004-0000-0000-0000-000000000005', 'e2000002-0000-0000-0000-000000000005',
 'fd000002-0000-0000-0000-000000000005',
 'approved',
 'Incrível! A paleta Copa ficou vibrante e o logo Brahma está bem posicionado. Aprovado para todos os formatos.',
 'Patricia',
 NOW() - INTERVAL '2 days', 'ecd', 4);


-- ============================================================
-- COMENTÁRIOS (internos + pins)
-- ============================================================
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type,
                      pin_x, pin_y, is_internal, resolved, created_at) VALUES

-- iFood feed: interno de briefing + pin de cliente
('d1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 'f1000001-0000-0000-0000-000000000001',
 'Bruno (Criação)',
 'Alinhei o CTA com a grade de 8px. Se o cliente pedir alteração de cor, temos a versão azul já pronta.',
 'general', null, null, true, false, NOW() - INTERVAL '5 days'),

('d2000002-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 'f1000001-0000-0000-0000-000000000001',
 'Camila Torres', 'O logo aqui ficou um pouco pequeno — mas tá ótimo no geral, aprovado!',
 'pin', 12.5, 88.3, false, true, NOW() - INTERVAL '1 day'),

-- iFood header: score baixo — comentário interno de alerta
('d3000003-0000-0000-0000-000000000001', 'a3000003-0000-0000-0000-000000000001',
 'f3000003-0000-0000-0000-000000000001',
 'Desirre (Atendimento)',
 'Score IA muito baixo (43). Não enviar ao cliente antes de Bruno revisar contraste e hierarquia.',
 'general', null, null, true, false, NOW() - INTERVAL '23 hours'),

('d4000004-0000-0000-0000-000000000001', 'a3000003-0000-0000-0000-000000000001',
 'f3000003-0000-0000-0000-000000000001',
 'Bruno (Criação)',
 'Entendido. Trabalhando na v2 com contraste corrigido e novo CTA.',
 'general', null, null, true, false, NOW() - INTERVAL '20 hours'),

-- Nubank KV: pins de cliente + interno de fechamento
('d5000005-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 'f4000004-0000-0000-0000-000000000002',
 'Rodrigo Lopes', 'Esse título precisa ser maior. No mobile some completamente.',
 'pin', 48.0, 22.0, false, false, NOW() - INTERVAL '1 day'),

('d6000006-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 'f4000004-0000-0000-0000-000000000002',
 'Rodrigo Lopes', 'Fundo muito escuro — o logo branco do NuPay some aqui.',
 'pin', 75.0, 55.0, false, false, NOW() - INTERVAL '1 day'),

('d7000007-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 'f4000004-0000-0000-0000-000000000002',
 'Bruno (Criação)',
 'Entendido. Subi a v2 com título +20% e fundo no roxo padrão #7C3AED. Aguardando nova avaliação.',
 'general', null, null, true, false, NOW() - INTERVAL '12 hours'),

-- Itaú vídeo: interno positivo
('d8000008-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000004',
 'f9000009-0000-0000-0000-000000000004',
 'Fabi (Mídia)',
 'Pré-aprovado internamente. Já passei para a Patricia — ela pediu pequena alteração no off.',
 'general', null, null, true, false, NOW() - INTERVAL '3 days'),

('d9000009-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000004',
 'f9000009-0000-0000-0000-000000000004',
 'Patricia Alves', 'A voz off ficou muito boa. Aprovado!',
 'general', null, null, false, true, NOW() - INTERVAL '1 day'),

-- Itaú LinkedIn: pin de cliente
('da000001-0000-0000-0000-000000000004', 'd2000002-0000-0000-0000-000000000004',
 'fa000001-0000-0000-0000-000000000004',
 'Patricia Alves', 'O benefício "sem juros" deveria ser o headline, não o rodapé.',
 'pin', 15.0, 85.0, false, false, NOW() - INTERVAL '18 hours'),

-- Ambev OOH: interno de processo
('db000001-0000-0000-0000-000000000005', 'e2000002-0000-0000-0000-000000000005',
 'fd000001-0000-0000-0000-000000000005',
 'Desirre (Atendimento)',
 'v1 reprovou internamente por conflito com guidelines FIFA. Bruno ajustou selo de licença na v2.',
 'general', null, null, true, false, NOW() - INTERVAL '5 days'),

('dc000001-0000-0000-0000-000000000005', 'e2000002-0000-0000-0000-000000000005',
 'fd000002-0000-0000-0000-000000000005',
 'Renato Coelho', 'Sensacional! A energia ficou exatamente como queríamos para a Copa.',
 'general', null, null, false, true, NOW() - INTERVAL '2 days');


-- ============================================================
-- FORNECEDORES (10)
-- ============================================================
INSERT INTO suppliers (name, specialty, categories, rating, verified, crivo_partner, website, email, phone) VALUES

('Studio 81',      'Fotografia',             ARRAY['Fotografia'],            4.9, true,  true,  'https://studio81.com.br',      'contato@studio81.com.br',      '(11) 99234-5678'),
('Frame Motion',   'Motion Design / Vídeo',  ARRAY['Motion','Vídeo'],        4.7, true,  false, 'https://framemotion.com.br',   'hi@framemotion.com.br',        NULL),
('Voxa Audio',     'Áudio / Locução',        ARRAY['Áudio'],                 4.5, false, false, NULL,                           'voxa@voxa.audio',              '(11) 93412-0099'),
('Pixel Makers',   'Fotografia / Retoque',   ARRAY['Fotografia'],            4.3, false, false, NULL,                           NULL,                           '(21) 98765-4321'),
('TeleArte',       'RTV / Produção',         ARRAY['Vídeo'],                 4.8, true,  true,  'https://telearte.com.br',      'producao@telearte.com.br',     '(11) 3301-7890'),
('Gráfica Premium','Impressão / Acabamento', ARRAY['Impressão'],             4.2, false, false, NULL,                           'pedidos@graficapremium.com.br', NULL),
('Neon3D',         'Animação 3D / CGI',      ARRAY['Motion','Vídeo'],        4.6, true,  true,  'https://neon3d.studio',        'hello@neon3d.studio',          NULL),
('Typeroom',       'Tipografia / Identidade',ARRAY['Design'],                4.4, false, false, 'https://typeroom.com.br',      NULL,                           '(11) 97654-3210'),
('AudioLab SP',    'Produção Musical / Jingle', ARRAY['Áudio'],             4.7, true,  false, 'https://audiolabsp.com.br',    'jingles@audiolabsp.com.br',    '(11) 3045-6677'),
('Print & Go',     'Impressão Rápida',       ARRAY['Impressão'],             4.0, false, false, NULL,                           'orcamentos@printego.com.br',   '(11) 95512-8800');
