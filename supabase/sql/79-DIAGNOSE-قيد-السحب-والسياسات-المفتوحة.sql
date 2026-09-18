-- ============================================================
-- 79 — تشخيص: قيد مبلغ السحب + السياسات المفتوحة (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيغيّرش أي حاجة**. قراءة فقط. مفيش INSERT ولا UPDATE
--    ولا DROP. تقدر تشغّله في أي وقت.
--
-- ── المشكلة ─────────────────────────────────────────────────
--
-- `submitWithdrawalRequest` في `src/actions/finance.ts` بتاخد المبلغ من
-- المدرب وبتتحقق إنه رقم أكبر من صفر **وبس**، وبعدين بتدرجه في
-- `withdrawal_requests` على طول:
--
--     if (!Number.isFinite(amount) || amount <= 0) throw ...
--     await supabase.from('withdrawal_requests').insert({ amount, ... })
--
-- مفيش في الكود أي مقارنة بين المبلغ ده وبين مستحقات المدرب الفعلية.
-- يعني مدرب مستحقاته 500 ج.م يقدر يطلب سحب مليون.
--
-- ── ليه تشخيص قبل أي إصلاح ──────────────────────────────────
--
-- **مش عارف لسه هل ده عطل ولا لأ.** ممكن القاعدة نفسها بتمنعه بقيد
-- CHECK أو محفّز، وساعتها الإصلاح المطلوب مختلف تمامًا: رسالة عربية
-- مفهومة بدل خطأ Postgres الغامض، مش بناء حماية جديدة.
--
-- وده بالظبط الدرس اللي اتكرر في المشروع (قواعد العمل §4): مراجعة
-- مبنية على قراءة الكود وحده أنتجت ثغرات «حرجة» مش موجودة، وحمايات
-- اتفُرض إنها قايمة وما كانتش. القاعدة هي مصدر الحقيقة، فبنسألها.
--
-- ── وكمان: فحص السياسات المفتوحة ────────────────────────────
--
-- ملف 38-2 عمل نفس الفحص ده — بس من يومها اتضاف 40 ملف SQL. وقاعدة (أ)
-- بتقول إن سياسة واحدة فيها `USING (true)` بتلغي كل السياسات المضبوطة
-- اللي بعدها، لأن السياسات بتتجمع بـ«أو» مش بـ«و». فالفحص ده بيتعاد.
--
-- ── اللي هيظهر ──────────────────────────────────────────────
--
--   1. قيود CHECK على withdrawal_requests     ← فيه سقف ولا لأ؟
--   2. المحفّزات على withdrawal_requests      ← فيه محفّز بيتحقق؟
--   3. سياسات الكتابة على withdrawal_requests ← المدرب بيدرج بشروط إيه؟
--   4. المستحقات مقابل طلبات السحب لكل مدرب   ← فيه طلب أكبر من رصيده؟
--   5. كل سياسة مفتوحة في القاعدة             ← USING (true)
--   6. جداول من غير RLS أصلًا
--
-- استعلام تأكيد **واحد** (قاعدة «ز») — محرر Supabase بيعرض نتيجة
-- الاستعلام الأخير وحده، فالستة مجمّعين بـ UNION ALL.
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ── 1) قيود CHECK على جدول طلبات السحب ────────────────────
  SELECT
    '1. قيود withdrawal_requests'::text AS القسم,
    c.conname::text                      AS البند,
    pg_get_constraintdef(c.oid)::text    AS التفاصيل,
    '— موجود'::text                      AS الحالة
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
    AND t.relname = 'withdrawal_requests'
    AND c.contype = 'c'

  UNION ALL

  -- لو مفيش ولا قيد، السطر ده بيظهر لوحده
  SELECT
    '1. قيود withdrawal_requests',
    'لا يوجد أي قيد CHECK',
    'المبلغ بيتقبل زي ما جه من الدالة',
    '✗ مفيش سقف في القاعدة'
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'withdrawal_requests'
      AND c.contype = 'c'
  )

  UNION ALL

  -- ── 2) المحفّزات على الجدول ────────────────────────────────
  SELECT
    '2. محفّزات withdrawal_requests',
    tg.tgname::text,
    pg_get_triggerdef(tg.oid)::text,
    '— موجود'
  FROM pg_trigger tg
  JOIN pg_class t ON t.oid = tg.tgrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
    AND t.relname = 'withdrawal_requests'
    AND NOT tg.tgisinternal

  UNION ALL

  SELECT
    '2. محفّزات withdrawal_requests',
    'لا يوجد أي محفّز',
    'مفيش تحقق قبل الإدراج',
    '✗ مفيش حارس على الإدراج'
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_trigger tg
    JOIN pg_class t ON t.oid = tg.tgrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'withdrawal_requests'
      AND NOT tg.tgisinternal
  )

  UNION ALL

  -- ── 3) سياسات الكتابة على الجدول ──────────────────────────
  SELECT
    '3. سياسات withdrawal_requests',
    p.policyname::text || ' · ' || p.cmd::text,
    'USING: ' || COALESCE(p.qual, '—')
      || '  |  WITH CHECK: ' || COALESCE(p.with_check, '—'),
    CASE
      WHEN p.cmd IN ('INSERT', 'ALL') AND COALESCE(p.with_check, '') !~* 'amount'
        THEN '⚠️ بتتحقق من الملكية مش من المبلغ'
      ELSE '— للمراجعة'
    END
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename = 'withdrawal_requests'

  UNION ALL

  -- ── 4) المستحقات مقابل طلبات السحب لكل مدرب ───────────────
  --
  -- ⚠️ الأنواع متكاستة لـ text على الطرفين عن قصد. `instructors.id` و
  --    `withdrawal_requests.instructor_id` الاتنين `string` في
  --    `src/types/supabase.ts`، والملف ده **مبيفرّقش بين uuid و text**
  --    (قاعدة «ج») — وده اللي وقّع ملف 74 بـ
  --    `operator does not exist: uuid = text`. الكاست بيخلّي المقارنة
  --    شغّالة مهما كان النوع الحقيقي.
  SELECT
    '4. الرصيد مقابل السحب',
    i.display_name::text,
    'مستحقات مسجّلة: ' || COALESCE(pay.total, 0)::text || ' ج.م'
      || '  ·  منها مدفوع: ' || COALESCE(pay.paid, 0)::text || ' ج.م'
      || '  ·  طلبات سحب قائمة: ' || COALESCE(wd.total, 0)::text || ' ج.م'
      || '  (' || COALESCE(wd.cnt, 0)::text || ' طلب)',
    CASE
      WHEN COALESCE(wd.total, 0) = 0 THEN '— مفيش طلبات'
      WHEN COALESCE(wd.total, 0) > COALESCE(pay.total, 0)
        THEN '✗ طلب سحب أكبر من كل مستحقاته'
      ELSE '✓ ضمن المستحقات'
    END
  FROM public.instructors i
  LEFT JOIN (
    SELECT instructor_id::text AS iid,
           sum(amount)                                  AS total,
           sum(amount) FILTER (WHERE status = 'paid')   AS paid
    FROM public.instructor_payouts
    GROUP BY instructor_id::text
  ) pay ON pay.iid = i.id::text
  LEFT JOIN (
    SELECT instructor_id::text AS iid,
           sum(amount) AS total,
           count(*)    AS cnt
    FROM public.withdrawal_requests
    WHERE status <> 'rejected'
    GROUP BY instructor_id::text
  ) wd ON wd.iid = i.id::text
  WHERE COALESCE(pay.total, 0) > 0 OR COALESCE(wd.total, 0) > 0

  UNION ALL

  -- ── 5) السياسات المفتوحة في كل القاعدة ────────────────────
  --
  -- سياسة شرطها `true` معناها «أي حد». وقاعدة (أ): وجودها بيلغي أي
  -- سياسة مضبوطة على نفس الجدول ونفس العملية.
  SELECT
    '5. سياسات مفتوحة',
    p.tablename::text || ' · ' || p.policyname::text,
    p.cmd::text || '  ·  الأدوار: ' || array_to_string(p.roles, ', ')
      || '  ·  USING: ' || COALESCE(p.qual, '(بلا شرط)'),
    CASE
      WHEN 'anon' = ANY(p.roles) OR 'public' = ANY(p.roles)
        THEN '✗ مفتوحة للزوار'
      ELSE '⚠️ مفتوحة لكل مسجّل دخول'
    END
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND (
      p.qual IS NULL
      OR btrim(p.qual) = 'true'
      OR btrim(lower(p.qual)) = '(true)'
    )

  UNION ALL

  SELECT
    '5. سياسات مفتوحة',
    'لا يوجد',
    'مفيش ولا سياسة شرطها true',
    '✓ نظيف'
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND (p.qual IS NULL OR btrim(p.qual) = 'true'
           OR btrim(lower(p.qual)) = '(true)')
  )

  UNION ALL

  -- ── 6) جداول بلا RLS ──────────────────────────────────────
  SELECT
    '6. جداول بلا حماية',
    t.tablename::text,
    'RLS مش مفعّلة — أي حد معاه المفتاح العام يقرا ويكتب',
    '✗ مكشوف'
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND NOT t.rowsecurity

  UNION ALL

  SELECT
    '6. جداول بلا حماية',
    'لا يوجد',
    'كل جداول public عليها RLS',
    '✓ نظيف'
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_tables t
    WHERE t.schemaname = 'public' AND NOT t.rowsecurity
  )

) t ORDER BY القسم, الحالة, البند;

-- ============================================================
-- مفيش تراجع — الملف ده مبيغيّرش حاجة.
-- ============================================================
