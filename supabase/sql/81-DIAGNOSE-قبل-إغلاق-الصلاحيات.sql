-- ============================================================
-- 81 — تشخيص: الأسئلة الثلاثة الباقية قبل ملف الإصلاح (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيغيّرش أي حاجة**. قراءة فقط.
--
-- ── ليه ده ملف تشخيص تالت ───────────────────────────────────
--
-- لأني غلطت مرتين في الجلسة دي، والغلطتين من نفس النوع: حكمت على سلوك
-- Postgres من افتراض بدل ما أقرا التوثيق.
--
--   • ملف 79: فلترت على `qual` عشان ألاقي السياسات المفتوحة. سياسة
--     `INSERT` **مبتخزّنش شرطها في `qual` أصلًا** — بيتخزّن في
--     `with_check` و`qual` بتبقى NULL دايمًا. النتيجة: 21 إنذار كاذب.
--
--   • ملف 80: كتبت «أي حد يقدر يكتب» على سياسات `UPDATE` بلا
--     `WITH CHECK`. وسياسة `UPDATE` بلا `WITH CHECK` **بتستخدم شرط
--     `USING` نفسه** للصف بعد التعديل. يعني غيابه مش ثغرة بذاته.
--
-- فالملف ده بيسأل القاعدة بدل ما يفترض، وبعده بس يتكتب ملف الإصلاح.
--
-- ── الأسئلة الثلاثة ─────────────────────────────────────────
--
--   1. نص `USING` الكامل للسياسات اللي ظهرت بلا `WITH CHECK` —
--      هل هي ضيّقة فعلًا ولا واسعة؟
--
--   2. محفّزات حماية الأعمدة: أسماء الدوال `guard_*` ظهرت في ملف 80،
--      لكن **وجود اسم دالة مش معناه إن فيه محفّظ مربوط بالجدول**.
--      ملف 79 أثبت ده: `withdrawal_requests` مكانش عليها ولا محفّظ.
--      هنا بنشوف المربوط فعلًا — وتحديدًا هل `sessions` بلا حارس.
--
--   3. الدوال (غير المحفّزات) اللي الزائر `anon` ينفّذها: هل فيها
--      تحقق من `auth.uid()` جوّه ولا بتنفّذ لأي حد؟ ودي أخطر نقطة:
--      `notify_broadcast` من زائر مجهول = إشعار لكل مستخدمي المنصة.
--
-- استعلام تأكيد **واحد** (قاعدة «ز»).
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ── 1) شرط USING الكامل للسياسات المشكوك فيها ─────────────
  SELECT
    '1. شرط USING الحقيقي'::text AS القسم,
    (p.tablename || ' · ' || p.cmd)::text AS البند,
    (p.policyname || '  →  USING: ' || COALESCE(p.qual, '(بلا شرط — يعني الكل)'))::text
      AS التفاصيل,
    CASE
      WHEN p.qual IS NULL
        THEN '✗ بلا شرط على الصف أصلًا'
      WHEN p.qual ~* 'auth\.uid|is_admin|is_super_admin|EXISTS'
        THEN '✓ ضيّق — الغياب مش ثغرة'
      ELSE '⚠️ راجع النص'
    END AS الحالة
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.cmd IN ('INSERT', 'UPDATE', 'ALL')
    AND (p.with_check IS NULL
         OR btrim(lower(p.with_check)) IN ('true', '(true)'))

  UNION ALL

  -- ── 2) محفّزات حماية الأعمدة المربوطة فعلًا ────────────────
  --
  -- قاعدة (ب): الصلاحيات بتحمي الصفوف لا الأعمدة. سياسة «كل واحد
  -- يعدّل صفه» بتسمح له يعدّل **أي عمود في صفه** — بما فيها `role`
  -- و`amount` و`status`. اللي بيقفل ده محفّظ `BEFORE UPDATE`.
  SELECT
    '2. حارس الأعمدة',
    t.tbl::text,
    COALESCE(
      string_agg(tg.tgname || ' → ' || pr.proname, '  ·  '),
      'مفيش ولا محفّظ مربوط بالجدول'
    ),
    CASE
      WHEN count(tg.oid) = 0 THEN '✗ بلا حارس أعمدة'
      ELSE '✓ فيه محفّظ'
    END
  FROM (VALUES
      ('user_profiles'), ('instructors'), ('orders'), ('order_items'),
      ('sessions'), ('portfolio_documents'), ('course_subscriptions'),
      ('service_orders'), ('provider_services'), ('service_providers'),
      ('publishers'), ('withdrawal_requests'), ('instructor_payouts'),
      ('child_profiles'), ('reviews')
    ) AS t(tbl)
  LEFT JOIN pg_class c
    ON c.relname = t.tbl
   AND c.relnamespace = 'public'::regnamespace
  LEFT JOIN pg_trigger tg
    ON tg.tgrelid = c.oid
   AND NOT tg.tgisinternal
  LEFT JOIN pg_proc pr ON pr.oid = tg.tgfoid
  GROUP BY t.tbl

  UNION ALL

  -- ── 3) الدوال اللي ينفّذها الزائر — بلا المحفّزات ──────────
  --
  -- دوال المحفّزات مستبعَدة (`prorettype <> trigger`): مبتتناديش
  -- مباشرةً ومبتشتغلش من غير سياق محفّظ، فوجودها في قايمة anon ضجيج.
  -- اللي باقي هو اللي الزائر يقدر يناديه فعلًا من المفتاح العام.
  SELECT
    '3. دوال ينفّذها الزائر',
    (p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')')::text,
    (CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END
      || '  ·  فيها تحقق من المستخدم: '
      || CASE
           WHEN pg_get_functiondef(p.oid) ~* 'auth\.uid|is_admin\(|is_super_admin\('
             THEN 'نعم'
           ELSE 'لأ'
         END)::text,
    CASE
      WHEN pg_get_functiondef(p.oid) !~* 'auth\.uid|is_admin\(|is_super_admin\('
        THEN '✗ بلا تحقق والزائر ينفّذها'
      WHEN p.prosecdef
        THEN '⚠️ DEFINER — بتتخطى الحماية، تتراجع'
      ELSE '✓ فيها تحقق'
    END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND p.prorettype <> 'trigger'::regtype
    AND has_function_privilege('anon', p.oid, 'EXECUTE')

  UNION ALL

  -- ── 4) حجم الجدول المفتوح للإدراج المجهول ─────────────────
  SELECT
    '4. سياق القرار',
    'support_session_requests',
    'عدد الصفوف: ' || (SELECT count(*) FROM public.support_session_requests)::text,
    'سياستها INSERT WITH CHECK: true — أي زائر يدرج'

  UNION ALL

  -- ── 5) كم مدرب بياناته التجارية مكشوفة ────────────────────
  SELECT
    '5. سياق القرار',
    'instructors',
    'إجمالي: ' || (SELECT count(*) FROM public.instructors)::text
      || '  ·  له سعر معتمد: '
      || (SELECT count(*) FROM public.instructors
          WHERE approved_price IS NOT NULL)::text
      || '  ·  له سعر مطلوب: '
      || (SELECT count(*) FROM public.instructors
          WHERE requested_price IS NOT NULL)::text,
    'approved_price و requested_price مقروءان لأي زائر'

) t ORDER BY القسم, الحالة, البند;

-- ============================================================
-- مفيش تراجع — الملف ده مبيغيّرش حاجة.
-- ============================================================
