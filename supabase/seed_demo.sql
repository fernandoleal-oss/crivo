-- ============================================================
-- CRIVO — Demo Seed
-- ============================================================

DELETE FROM approvals;
DELETE FROM comments;
DELETE FROM piece_versions;
DELETE FROM pieces;
DELETE FROM projects;

-- PROJETOS
INSERT INTO projects (id, name, client_name, sector, briefing_score, briefing_data, created_at) VALUES

('10000001-0000-0000-0000-000000000001',
 'Campanha Dia das Mães 2026', 'iFood', 'criacao', 94,
 '{"produto":"Entrega Grátis Dia das Mães","verba":"R$ 120.000","prazo":"05/05/2026","aprovador":"Camila Torres (Head de Marketing)","assets_necessarios":["logo iFood alta resolução","fotos de mães com entregadores","paleta Dia das Mães"],"observacoes":"Campanha emocional, foco em gratidão. Evitar humor.","informacoes_faltando":[],"resumo_executivo":"Campanha digital para o Dia das Mães com foco em entrega grátis. Verba aprovada, prazo definido, aprovador confirmado.","confianca_analise":94}',
 NOW() - INTERVAL '5 days'),

('20000002-0000-0000-0000-000000000002',
 'Lançamento NuPay', 'Nubank', 'atendimento', 61,
 '{"produto":"NuPay — pagamento por aproximação","verba":null,"prazo":"20/04/2026","aprovador":"Rodrigo Lopes (Gerente de Produto)","assets_necessarios":["ícone NuPay","mockup celular","paleta roxa Nubank"],"observacoes":null,"informacoes_faltando":["verba total da campanha","canais de veiculação confirmados"],"resumo_executivo":"Lançamento do NuPay com prazo definido mas verba e canais ainda não confirmados pelo cliente.","confianca_analise":61}',
 NOW() - INTERVAL '3 days'),

('30000003-0000-0000-0000-000000000003',
 'Black Friday 2026 — Digital', 'Magazine Luiza', 'midia', 0, null,
 NOW() - INTERVAL '1 day');


-- PEÇAS
INSERT INTO pieces (id, project_id, title, description, status, public_token, deadline, created_at, updated_at) VALUES

('a1000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001',
 'Banner Feed Instagram 1080x1080', 'Versão principal — mãe recebendo pedido', 'approved',
 'tok_ifood_feed01', '2026-04-28', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),

('a2000002-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001',
 'Story Instagram 1080x1920', 'Versão story com CTA "Peça agora"', 'approved',
 'tok_ifood_story01', '2026-04-28', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),

('a3000003-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001',
 'Banner Site Header 1920x600', 'Header da homepage no período da campanha', 'pending',
 'tok_ifood_header01', '2026-05-01', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('b1000001-0000-0000-0000-000000000002', '20000002-0000-0000-0000-000000000002',
 'Key Visual Principal', 'Imagem âncora da campanha NuPay', 'revision_requested',
 'tok_nubank_kv01', '2026-04-15', NOW() - INTERVAL '2 days', NOW() - INTERVAL '12 hours'),

('b2000002-0000-0000-0000-000000000002', '20000002-0000-0000-0000-000000000002',
 'Banner Google Display 300x250', 'Versão adaptada para rede de display', 'pending',
 'tok_nubank_display01', '2026-04-18', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('c1000001-0000-0000-0000-000000000003', '30000003-0000-0000-0000-000000000003',
 'Spot de Rádio 30s — Roteiro', 'Roteiro para aprovação antes da gravação', 'pending',
 'tok_magalu_radio01', '2026-04-10', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

('c2000002-0000-0000-0000-000000000003', '30000003-0000-0000-0000-000000000003',
 'Vídeo 15s — Instagram Reels', 'Corte para Reels da campanha Black Friday', 'pending',
 'tok_magalu_reels01', '2026-04-10', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');


-- VERSÕES
INSERT INTO piece_versions (id, piece_id, version_number, file_url, file_type, uploaded_at) VALUES

('f1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 1, 'https://images.unsplash.com/photo-1565299624946-b28f40a04680?w=1080&h=1080&fit=crop', 'image/jpeg', NOW() - INTERVAL '4 days'),

('f2000002-0000-0000-0000-000000000001', 'a2000002-0000-0000-0000-000000000001',
 1, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080&h=1080&fit=crop', 'image/jpeg', NOW() - INTERVAL '4 days'),

('f3000003-0000-0000-0000-000000000001', 'a3000003-0000-0000-0000-000000000001',
 1, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1080&h=1080&fit=crop', 'image/jpeg', NOW() - INTERVAL '1 day'),

('f4000004-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 1, 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1080&h=1080&fit=crop', 'image/jpeg', NOW() - INTERVAL '2 days'),

('f5000005-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002',
 2, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&h=1080&fit=crop', 'image/jpeg', NOW() - INTERVAL '12 hours'),

('f6000006-0000-0000-0000-000000000002', 'b2000002-0000-0000-0000-000000000002',
 1, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&h=1080&fit=crop', 'image/jpeg', NOW() - INTERVAL '1 day'),

('f7000007-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000003',
 1, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1080&h=1080&fit=crop', 'image/jpeg', NOW() - INTERVAL '6 hours'),

('f8000008-0000-0000-0000-000000000003', 'c2000002-0000-0000-0000-000000000003',
 1, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1080&h=1080&fit=crop', 'image/jpeg', NOW() - INTERVAL '6 hours');


-- APROVAÇÕES
INSERT INTO approvals (id, piece_id, version_id, decision, feedback, decided_by, decided_at) VALUES

('e1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'f1000001-0000-0000-0000-000000000001',
 'approved', 'Perfeito! Exatamente o que pedimos. Pode produzir.', 'Camila Torres', NOW() - INTERVAL '1 day'),

('e2000002-0000-0000-0000-000000000001', 'a2000002-0000-0000-0000-000000000001', 'f2000002-0000-0000-0000-000000000001',
 'approved', 'Aprovado. O CTA ficou muito bom.', 'Camila Torres', NOW() - INTERVAL '2 days'),

('e3000003-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002', 'f4000004-0000-0000-0000-000000000002',
 'revision_requested',
 'A tipografia está pequena demais no mobile. Precisamos aumentar o título pelo menos 20%. O roxo do fundo está escuro — o logo some. Pode testar com o roxo padrão da nossa paleta?',
 'Rodrigo Lopes', NOW() - INTERVAL '1 day');


-- COMENTÁRIOS
INSERT INTO comments (id, piece_id, version_id, author_name, content, comment_type, pin_x, pin_y, is_internal, resolved, created_at) VALUES

('d1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'f1000001-0000-0000-0000-000000000001',
 'Bruno (Criação)', 'Alinhei o CTA com a grade de 8px. Se o cliente pedir alteração de cor, temos a versão azul já pronta.',
 'general', null, null, true, false, NOW() - INTERVAL '3 days'),

('d2000002-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'f1000001-0000-0000-0000-000000000001',
 'Camila Torres', 'O logo aqui ficou um pouco pequeno — mas tá ótimo no geral, aprovado!',
 'pin', 12.5, 88.3, false, true, NOW() - INTERVAL '1 day'),

('d3000003-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002', 'f4000004-0000-0000-0000-000000000002',
 'Rodrigo Lopes', 'Esse título precisa ser maior. No mobile some completamente.',
 'pin', 48.0, 22.0, false, false, NOW() - INTERVAL '1 day'),

('d4000004-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002', 'f4000004-0000-0000-0000-000000000002',
 'Rodrigo Lopes', 'Fundo muito escuro — o logo branco do NuPay some aqui.',
 'pin', 75.0, 55.0, false, false, NOW() - INTERVAL '1 day'),

('d5000005-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002', 'f4000004-0000-0000-0000-000000000002',
 'Bruno (Criação)', 'Entendido. Subi a v2 com título +20% e fundo no roxo padrão #7C3AED. Aguardando nova avaliação.',
 'general', null, null, true, false, NOW() - INTERVAL '12 hours');
