-- ==========================================
-- المرحلة 1: الحسابات، الإعدادات، والمدربون والناشرون
-- ==========================================

INSERT INTO profiles (id, full_name, email, role, is_guardian, created_at) VALUES
('usr-1', 'أحمد محمود', 'ahmed@example.com', 'student', false, '2023-01-10T00:00:00Z'),
('usr-2', 'سارة خالد', 'sara@example.com', 'instructor', false, '2023-02-15T00:00:00Z'),
('usr-3', 'علياء حسين', 'alia@example.com', 'publisher', false, '2023-03-20T00:00:00Z'),
('usr-4', 'محمد طارق', 'mohamed@example.com', 'super_admin', false, '2023-01-01T00:00:00Z'),
('usr-5', 'نور مصطفى', 'nour@example.com', 'general_supervisor', false, '2023-04-10T00:00:00Z'),
('usr-6', 'ياسر عادل', 'yasser@example.com', 'visitor', false, '2023-05-12T00:00:00Z'),
('usr-7', 'مريم أمين', 'mariam@example.com', 'student', true, '2023-06-18T00:00:00Z'),
('usr-8', 'خالد وليد', 'khaled@example.com', 'instructor', false, '2023-07-22T00:00:00Z'),
('usr-inst-pending', 'Pending Inst', 'pen@ex.com', 'instructor', false, now()),
('usr-inst-training', 'Training Inst', 'trn@ex.com', 'instructor', false, now()),
('usr-pub-1', 'Pub 2', 'p2@ex.com', 'publisher', false, now()),
('usr-pub-2', 'Pub 3', 'p3@ex.com', 'publisher', false, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO child_profiles (id, guardian_profile_id, full_name, birth_date) VALUES
('fm-1', 'usr-7', 'أحمد', '2018-01-01'),
('fm-2', 'usr-7', 'سارة', '2014-01-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO instructor_pricing_options (id, label, base_price_per_session, is_active) VALUES
('ipo-1', 'مبتدئ', 100, true),
('ipo-2', 'متوسط', 150, true),
('ipo-3', 'خبير', 200, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pricing_formula_settings (id, platform_multiplier, fixed_admin_fee) VALUES
('default', 1.2, 50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO instructors (id, profile_id, display_name, bio, specialties, avatar_url, years_experience, status, training_passed, work_model, requested_price, approved_price, selected_pricing_option_id, monthly_hours_committed) VALUES
('inst-1', 'usr-2', 'سارة أحمد', 'مدربة معتمدة بخبرة واسعة في تنمية مهارات الكتابة الإبداعية لدى الأطفال.', ARRAY['كتابة إبداعية','الخيال العلمي']::text[], NULL, 5, 'active', true, 'per_session', 150, 150, NULL, NULL),
('inst-2', 'usr-8', 'خالد عبد الله', 'كاتب متخصص في أدب الطفل وحائز على عدة جوائز محلية.', ARRAY['الكتابة للأطفال','بناء الشخصيات']::text[], NULL, 7, 'active', true, 'monthly', 120, 120, NULL, 60),
('inst-pending', 'usr-inst-pending', 'محمود طارق', 'مدرب شغوف بتعليم أساسيات السرد القصصي.', ARRAY['كتابة الخيال']::text[], NULL, 2, 'pending_approval', true, 'per_session', 200, NULL, NULL, NULL),
('inst-training', 'usr-inst-training', 'منى سعيد', 'كاتبة شابة تسعى للانضمام للمنصة.', ARRAY['الشعر']::text[], NULL, 1, 'pending_training', false, 'monthly', 100, NULL, NULL, 80)
ON CONFLICT (id) DO NOTHING;

INSERT INTO publisher_profiles (id, profile_id, slug, name, logo_url, bio, status) VALUES
('pub-1', 'usr-3', 'dar-alhekaya', 'دار الحكاية الصغيرة', 'https://picsum.photos/seed/pub1/200/200', 'دار متخصصة في نشر القصص التعليمية والتربوية للأطفال لبناء جيل واعٍ ومبدع.', 'active'),
('pub-2', 'usr-pub-1', 'khayal-akhdar', 'ناشر الخيال الأخضر', 'https://picsum.photos/seed/pub2/200/200', 'ناشر رائد في كتب المغامرات والموسوعات العلمية المبسطة لتشجيع الخيال والابتكار.', 'active'),
('pub-pending', 'usr-pub-2', 'dar-new', 'دار النشر الجديدة', NULL, 'دار نشر جديدة في انتظار الاعتماد', 'active')
ON CONFLICT (id) DO NOTHING;

