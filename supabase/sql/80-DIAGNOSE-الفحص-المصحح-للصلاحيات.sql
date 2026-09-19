-- ============================================================
-- 80 — تشخيص مصحَّح: الصلاحيات الفعلية (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيغيّرش أي حاجة**. قراءة فقط.
--
-- ── ليه الملف ده موجود: تصحيح خطأ في ملف 79 ─────────────────
--
-- القسم 5 في ملف 79 طلّع 21 سطرًا **غلط**، كلهم مكتوب فيهم
-- `INSERT · USING: (بلا شرط) · ✗ مفتوحة للزوار`.
--
-- السبب: في Postgres سياسة `INSERT` **مبتخزّنش شرطها في `qual` أصلًا** —
-- بتخزّنه في `with_check`، و`qual` بتبقى `NULL` دايمًا. وأنا كتبت الفلتر
-- `qual IS NULL`، فالتقط **كل سياسة إدراج في القاعدة** وسمّاها مفتوحة.
--
-- وخطأ تاني فوقه: عمود `roles` لما بيبقى `{public}` ده معناه مجموعة
-- الأدوار الافتراضية في Postgres — **مش معناه إن الزائر يقدر**. وصول
-- الزائر بيحدده `GRANT` لدور `anon`، مش العمود ده.
--
-- والدليل على الخطأ كان في نفس المخرجات: سياسة
-- `withdrawal_requests · Instructors file their own withdrawal requests`
-- ظهرت في القسم 5 كـ«مفتوحة»، بينما القسم 3 في نفس الملف بيعرض
-- `WITH CHECK` بتاعها وهي مضبوطة تمامًا (ملكية + status = 'pending').
--
-- الملف ده بيسأل الأسئلة الصح:
--
--   1. سياسات كتابة شرطها الحقيقي (WITH CHECK) فاضي أو true
--   2. نص WITH CHECK الكامل للجداول الحسّاسة — وأهمها `audit_logs`:
--      لو المستخدم يقدر يكتب سجل تدقيق زي ما هو عايز، السجل بيفقد قيمته
--   3. منح `anon` الفعلية على الجداول ← ده اللي بيقول مين زائر فعلًا
--   4. الدوال اللي `anon` يقدر ينفّذها (ملف 71 قفل جزءًا، نشوف الباقي)
--   5. الأعمدة المكشوفة على الجداول اللي عليها SELECT USING true —
--      قاعدة (ب): الصلاحيات بتحمي الصفوف لا الأعمدة
--
-- استعلام تأكيد **واحد** (قاعدة «ز»).
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ── 1) سياسات كتابة مفتوحة فعلًا ──────────────────────────
  SELECT
    '1. كتابة مفتوحة فعلًا'::text AS القسم,
    (p.tablename || ' · ' || p.policyname)::text AS البند,
    (p.cmd || '  ·  WITH CHECK: ' || COALESCE(p.with_check, '(بلا شرط)'))::text
      AS التفاصيل,
    '✗ أي حد يقدر يكتب'::text AS الحالة
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.cmd IN ('INSERT', 'UPDATE', 'ALL')
    AND (p.with_check IS NULL OR btrim(lower(p.with_check)) IN ('true', '(true)'))

  UNION ALL

  SELECT
    '1. كتابة مفتوحة فعلًا',
    'لا يوجد',
    'كل سياسات الكتابة عليها شرط حقيقي',
    '✓ نظيف'
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.cmd IN ('INSERT', 'UPDATE', 'ALL')
      AND (p.with_check IS NULL
           OR btrim(lower(p.with_check)) IN ('true', '(true)'))
  )

  UNION ALL

  -- ── 2) شرط الكتابة الكامل على الجداول الحسّاسة ─────────────
  --
  -- بنقرا النص بالكامل عشان نحكم بنفسنا. أهمهم `audit_logs`: سياسة
  -- إدراج متساهلة هناك معناها إن المستخدم يقدر يكتب سجلات تدقيق
  -- مزيّفة باسم حد تاني، والسجل كله يبقى بلا قيمة.
  SELECT
    '2. شرط الكتابة على الحسّاس',
    (p.tablename || ' · ' || p.cmd)::text,
    (p.policyname || '  →  ' || COALESCE(p.with_check, '(بلا شرط)'))::text,
    CASE
      WHEN p.tablename = 'audit_logs'
           AND COALESCE(p.with_check, '') !~* 'auth\.uid|is_admin|is_super'
        THEN '⚠️ سجل تدقيق بلا ربط بالمستخدم'
      WHEN COALESCE(p.with_check, '') ~* 'auth\.uid|is_admin|is_super|EXISTS'
        THEN '✓ فيه تحقق'
      ELSE '⚠️ راجع النص'
    END
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.cmd IN ('INSERT', 'UPDATE', 'ALL')
    AND p.tablename IN (
      'audit_logs', 'withdrawal_requests', 'instructor_payouts',
      'orders', 'order_items', 'service_orders', 'bookings', 'sessions',
      'course_subscriptions', 'reviews', 'dependent_requests',
      'user_profiles', 'child_profiles', 'instructors', 'site_settings'
    )

  UNION ALL

  -- ── 3) منح anon على الجداول ───────────────────────────────
  --
  -- ده الجواب الحقيقي على سؤال «الزائر يقدر يعمل إيه». السياسة بتقيّد
  -- الصفوف، لكن المنح هو اللي بيفتح الباب من أصله.
  SELECT
    '3. صلاحيات الزائر (anon)',
    g.table_name::text,
    string_agg(DISTINCT g.privilege_type, ' · ' ORDER BY g.privilege_type),
    CASE
      WHEN bool_or(g.privilege_type IN ('INSERT', 'UPDATE', 'DELETE'))
        THEN '⚠️ الزائر ممنوح كتابة'
      ELSE '— قراءة فقط (السياسة هي اللي بتقيّد)'
    END
  FROM information_schema.role_table_grants g
  WHERE g.table_schema = 'public'
    AND g.grantee = 'anon'
  GROUP BY g.table_name

  UNION ALL

  -- ── 4) الدوال اللي ينفّذها anon ───────────────────────────
  --
  -- ⚠️ Supabase بيمنح `anon` تنفيذ أي دالة جديدة **تلقائيًا** عن طريق
  --    ALTER DEFAULT PRIVILEGES، و`REVOKE FROM public` مبيشيلوش.
  --    وقعنا فيها في ملف 70 وأُصلحت في 71 — ده الفحص إن مفيش غيرها.
  SELECT
    '4. دوال ينفّذها الزائر',
    r.routine_name::text,
    'EXECUTE ممنوحة لـ anon',
    CASE
      WHEN r.routine_name ~* 'secure|_my_|instructor_|student_|dependent|admin|payout|withdraw|order'
        THEN '⚠️ دالة بيانات — تستاهل مراجعة'
      ELSE '— للمراجعة'
    END
  FROM information_schema.routine_privileges r
  WHERE r.routine_schema = 'public'
    AND r.grantee = 'anon'
    AND r.privilege_type = 'EXECUTE'

  UNION ALL

  SELECT
    '4. دوال ينفّذها الزائر',
    'لا يوجد',
    'مفيش دالة ممنوحة لـ anon',
    '✓ نظيف'
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.routine_privileges r
    WHERE r.routine_schema = 'public'
      AND r.grantee = 'anon'
      AND r.privilege_type = 'EXECUTE'
  )

  UNION ALL

  -- ── 5) الأعمدة المكشوفة للقراءة العامة ────────────────────
  --
  -- قاعدة (ب): RLS بتحمي الصفوف لا الأعمدة. سياسة `SELECT USING true`
  -- معناها **كل عمود في الجدول** مقروء، مش الأعمدة اللي الواجهة
  -- بتعرضها. الجدول ده بيطلّع الأعمدة الحقيقية عشان نقرر.
  SELECT
    '5. أعمدة مكشوفة للقراءة',
    p.tablename::text,
    string_agg(c.column_name::text, ' · ' ORDER BY c.ordinal_position),
    CASE
      WHEN string_agg(c.column_name::text, ',') ~* 'price|amount|salary|cost|earning|payout|receipt|phone|email|token|secret|password|hours_committed|schedule'
        THEN '⚠️ فيه أعمدة تجارية/شخصية'
      ELSE '— محتوى عام'
    END
  FROM pg_policies p
  JOIN information_schema.columns c
    ON c.table_schema = 'public'
   AND c.table_name = p.tablename
  WHERE p.schemaname = 'public'
    AND p.cmd = 'SELECT'
    AND btrim(lower(COALESCE(p.qual, ''))) IN ('true', '(true)')
  GROUP BY p.tablename

) t ORDER BY القسم, الحالة DESC, البند;

-- ============================================================
-- مفيش تراجع — الملف ده مبيغيّرش حاجة.
-- ============================================================
