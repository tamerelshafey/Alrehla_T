-- ============================================================
-- 99 — تشخيص: سحب أرباح الناشر  (قراءة فقط)
-- ============================================================
--
-- ✅ **قراءة فقط.** مفيش تعديل ولا إنشاء ولا سياسة بتتغيّر.
--
-- ── فين إحنا ────────────────────────────────────────────────
--
-- بعد ملف 97 بقى مستحق الناشر **بيتحسب ويتسجّل** عند تسليم الطلب.
-- وشاشته بتعرض رصيده. واللي فاضل إنه **يقدر يطلب سحبه**.
--
-- ⚠️ ودلوقتي شاشة الناشر مكتوب فيها بالنص:
--
--        «لطلب السحب، تواصل مع الإدارة —
--         الطلب من داخل الموقع غير متاح بعد.»
--
--    وده صادق على الأقل. بس معناه إن كل ناشر محتاج مكالمة.
--
-- ── العايق ──────────────────────────────────────────────────
--
-- جدول `withdrawal_requests` عمود المالك فيه اسمه **`instructor_id`
-- ومطلوب** (ملف 98 أثبته). يعني الجدول متبني للمدرب وحده، ومفيش
-- مكان للناشر فيه أصلًا.
--
-- ── واللي لازم نعرفه قبل ما نلمس حاجة ───────────────────────
--
-- ⚠️ **السياسات.** الجدول ده فيه **أرقام حسابات بنكية** (عمود
--    `payout_details` من ملف 92). فأي توسيع فيه لازم يتعمل وعينك
--    على السياسات الموجودة — مش بإضافة سياسة جديدة فوقها.
--
--    والقاعدة المكتوبة عندنا: **أي ملف صلاحيات على جدول قائم يبدأ
--    باستعلام `pg_policies` قبل كتابة سطر.** ده الاستعلام ده.
--
-- ⚠️ **ومصيدة السياسات**: السياسات بتتجمع بـ«أو» لا بـ«و». يعني
--    سياسة واحدة واسعة بتفتح الباب مهما كانت اللي جنبها ضيّقة.
--    القسم ١ بيطبع الشرط كامل لكل واحدة.
--
-- ⚠️ **وحاجة تالتة**: هل `publisher_payouts` بيقرا منه الناشر
--    أصلًا؟ ملف 96 طبع سياسة اسمها «Publishers can view their own
--    payouts» — القسم ٤ بيطبع شرطها بالكامل عشان نعرف إزاي بتربط
--    الحساب بالناشر، ونمشي على نفس الطريقة في الجدول الجديد بدل ما
--    نخترع طريقة تانية.
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ══ ١) سياسات جدول طلبات السحب ═════════════════════════
  SELECT
    '1. سياسات طلبات السحب'::text AS القسم,
    p.policyname::text              AS البند,
    (p.cmd || '  ·  الأدوار: ' || array_to_string(p.roles, ', ')
      || '  ·  USING: ' || COALESCE(p.qual, '—')
      || '  ·  WITH CHECK: ' || COALESCE(p.with_check, '—'))::text AS التفاصيل,
    CASE
      WHEN p.cmd = 'SELECT' AND btrim(lower(coalesce(p.qual,''))) IN ('true','(true)')
        THEN '🔴 قراءة مفتوحة — الجدول فيه أرقام حسابات'
      ELSE 'للمراجعة'
    END AS الحالة
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'withdrawal_requests'

  UNION ALL

  -- ══ ٢) أعمدة الجدول ════════════════════════════════════
  SELECT
    '2. أعمدة طلبات السحب',
    c.column_name::text,
    (c.data_type
      || CASE WHEN c.is_nullable = 'NO' THEN '  ·  مطلوب' ELSE '  ·  يقبل الفراغ' END
      || '  ·  افتراضي: ' || COALESCE(c.column_default, '—'))::text,
    CASE WHEN c.column_name = 'instructor_id' AND c.is_nullable = 'NO'
         THEN '⚠️ لازم يقبل الفراغ عشان الناشر ياخد مكانه'
         ELSE '—' END
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' AND c.table_name = 'withdrawal_requests'

  UNION ALL

  -- ══ ٣) القيود الموجودة ═════════════════════════════════
  --
  -- لازم نعرفها قبل ما نضيف قيد «واحد منهم بس» — القيد الجديد
  -- ممكن يتعارض مع قيد قائم.
  SELECT
    '3. قيود طلبات السحب',
    con.conname::text,
    pg_get_constraintdef(con.oid)::text,
    'للمراجعة'
  FROM pg_constraint con
  WHERE con.conrelid = 'public.withdrawal_requests'::regclass

  UNION ALL

  -- ══ ٤) إزاي الناشر بيوصل لصفوفه في المستحقات ═══════════
  --
  -- الطريقة دي هي اللي هنمشي عليها في الجدول الجديد، بدل ما نخترع
  -- واحدة تانية ونسيب تلات طرق لنفس السؤال.
  SELECT
    '4. ربط الحساب بالناشر',
    p.policyname::text,
    (p.cmd || '  ·  ' || COALESCE(p.qual, p.with_check, '—'))::text,
    'للمراجعة'
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'publisher_payouts'

  UNION ALL

  -- ══ ٥) دوال مساعدة موجودة ══════════════════════════════
  --
  -- فيه دالة بتقول «الحساب ده ناشر» زي `is_admin()`؟ لو أيوه
  -- بنستعملها؛ لو لأ بنكتب الشرط بإيدنا مرة واحدة في مكان واحد.
  SELECT
    '5. دوال مساعدة',
    pr.proname::text,
    ((CASE WHEN pr.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END)
      || '  ·  المعاملات: ' || pg_get_function_arguments(pr.oid))::text,
    '✓ موجودة'
  FROM pg_proc pr
  JOIN pg_namespace n ON n.oid = pr.pronamespace
  WHERE n.nspname = 'public'
    AND (pr.proname ILIKE '%publisher%' OR pr.proname IN ('is_admin','is_super_admin'))

  UNION ALL

  -- ══ ٦) الوضع الحالي بالأرقام ═══════════════════════════
  SELECT
    '6. الأرقام',
    x.label,
    x.detail,
    'للمراجعة'
  FROM (
    SELECT 'ناشرون'::text AS label,
           ('إجمالي: ' || (SELECT count(*)::text FROM public.publishers)
             || '  ·  ليهم حساب دخول: '
             || (SELECT count(*)::text FROM public.publishers WHERE user_id IS NOT NULL))::text AS detail
    UNION ALL
    SELECT 'مستحقات الناشرين',
           ('صفوف: ' || (SELECT count(*)::text FROM public.publisher_payouts)
             || '  ·  معلّقة: '
             || (SELECT count(*)::text FROM public.publisher_payouts WHERE status = 'pending'))
    UNION ALL
    SELECT 'طلبات السحب',
           ('صفوف: ' || (SELECT count(*)::text FROM public.withdrawal_requests)
             || '  ·  معلّقة: '
             || (SELECT count(*)::text FROM public.withdrawal_requests WHERE status = 'pending'))
  ) x

) t ORDER BY القسم, البند;

-- ============================================================
-- مفيش تراجع — الملف قراءة فقط.
-- ============================================================
