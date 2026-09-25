-- ============================================================
-- 96 — تشخيص: معادلة التسعير وأرباح الناشر  (قراءة فقط)
-- ============================================================
--
-- ✅ **قراءة فقط.** مفيش تعديل ولا إنشاء ولا سياسة بتتغيّر.
--
-- ── الخلفية ─────────────────────────────────────────────────
--
-- المعادلة اللي تامر بيوصفها **موجودة في القاعدة من قبل كده**:
--
--     جدول `pricing_formula_settings`
--       · `platform_multiplier`  ← النسبة
--       · `fixed_admin_fee`      ← المبلغ الثابت
--
-- والكود بيستعملها كده:
--
--     سعر العميل = التكلفة × المعامل + الرسم الثابت
--
-- و**فيه صفّين مقصودين** — واحد لكل نوع:
--
--     `default`            ← المدربون ومقدّمو الخدمة
--     `publisher-default`  ← الناشرون
--
-- يعني «معادلة لكل دور» متبنية أصلًا. اللي محتاجين نتأكد منه إن
-- الصفّين **موجودين فعلًا**، لأن الكود لو ما لقاهمش بيرجع لقيمة
-- افتراضية خطيرة: معامل 1 ورسم 0 — يعني **المنصة ما بتاخدش حاجة**.
--
-- ── الشك الأول: صفّ الناشر ممكن ما يكونش موجود ──────────────
--
-- شاشة إعدادات الناشر بتعمل كده:
--
--     .from('pricing_formula_settings')
--     .update({ ... })
--     .eq('id', 'publisher-default')        // ← بلا upsert وبلا select
--
-- ⚠️ ودي قاعدة «و» بالنص: `UPDATE` على صف **مش موجود** بينجح ويرجّع
--    صفر صفوف. فالإدارة بتكتب النسبة وتدوس «حفظ» وتشوف «تم»،
--    والقيمة **ما اتخزّنتش**، والموقع بيفضل على «المنصة ما بتاخدش
--    حاجة».
--
--    وشاشة المدربين بتعمل `upsert` — يعني صفّها مضمون. الفرق بين
--    الاتنين هو اللي بيخلّي ده احتمالًا واردًا لا نظريًّا.
--
-- القسم ١ بيقيس ده.
--
-- ── الشك التاني، وهو الأهم: مفيش حد بيسجّل ربح الناشر ───────
--
-- جدول `publisher_payouts` موجود، وشاشة الإدارة بتعلّم الدفعة
-- «اتحوّلت»، وشاشة الناشر بتعرض رصيده.
--
-- ⚠️ **ومفيش سطر واحد في المشروع كله بيعمل `INSERT` في الجدول ده.**
--
-- يعني الجدول بيتقري من تلات شاشات، وما اتكتبش فيه ولا مرة. ورصيد
-- الناشر بيطلع صفر مهما اتباع من كتبه — مش لأن فيه حساب غلط، لأن
-- **مفيش حساب أصلًا**.
--
-- ودي نفس فئة العطل اللي قفلناها للمدرب في ملف 91، بس دي ما اتقفلتش.
--
-- القسمان ٣ و٤ بيقيسوا: الجدول فاضي ولا لأ، وكام طلب مكتمل فيه منتج
-- لناشر وملهوش أي مستحق.
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ══ ١) صفوف المعادلة ═══════════════════════════════════
  SELECT
    '1. المعادلة'::text AS القسم,
    s.id::text           AS البند,
    ('المعامل: ' || s.platform_multiplier::text
      || '  ·  الرسم الثابت: ' || s.fixed_admin_fee::text
      || '  ·  آخر تعديل: ' || to_char(s.updated_at, 'YYYY-MM-DD HH24:MI'))::text
      AS التفاصيل,
    CASE
      WHEN s.platform_multiplier = 1 AND s.fixed_admin_fee = 0
        THEN '⚠️ المنصة ما بتاخدش حاجة'
      ELSE '✓ مضبوطة'
    END AS الحالة
  FROM public.pricing_formula_settings s

  UNION ALL

  -- ══ ٢) الصفّان المتوقَّعان موجودان؟ ══════════════════════
  --
  -- الكود بينادي `default` و`publisher-default` بالاسم. أي واحد
  -- ناقص معناه إن الجزء بتاعه ماشي على الافتراضي الخطير.
  SELECT
    '2. الصفوف المطلوبة',
    x.wanted,
    CASE WHEN EXISTS (SELECT 1 FROM public.pricing_formula_settings p
                       WHERE p.id = x.wanted)
         THEN 'موجود' ELSE '**مش موجود**' END,
    CASE WHEN EXISTS (SELECT 1 FROM public.pricing_formula_settings p
                       WHERE p.id = x.wanted)
         THEN '✓' ELSE '🔴 الحفظ من الشاشة بيضيع بصمت' END
  FROM (VALUES ('default'), ('publisher-default')) AS x(wanted)

  UNION ALL

  -- ══ ٣) جدول مستحقات الناشر ═════════════════════════════
  SELECT
    '3. مستحقات الناشر',
    'publisher_payouts',
    'عدد الصفوف: ' || (SELECT count(*)::text FROM public.publisher_payouts)
      || '  ·  إجمالي المبالغ: '
      || (SELECT COALESCE(sum(amount), 0)::text FROM public.publisher_payouts),
    CASE WHEN (SELECT count(*) FROM public.publisher_payouts) = 0
         THEN '🔴 فاضي — مفيش حد بيكتب فيه'
         ELSE '✓ فيه صفوف' END

  UNION ALL

  -- ══ ٤) القياس المباشر: مبيعات ناشرين بلا مستحق ═════════
  --
  -- طلبات وصلت لحالة نهائية وفيها منتج بتاع ناشر. الرقم ده هو
  -- حجم اللي ضاع لو الجدول فاضي.
  SELECT
    '4. مبيعات بلا مستحق',
    'طلبات فيها منتج ناشر',
    'طلبات مدفوعة أو مسلَّمة فيها منتج ناشر: '
      || (SELECT count(DISTINCT o.id)::text
            FROM public.orders o
            JOIN public.order_items oi ON oi.order_id = o.id
            JOIN public.personalized_products pp ON pp.id = oi.product_id
           WHERE o.status IN ('paid','preparing','shipped','delivered')
             AND pp.publisher_id IS NOT NULL)
      || '  ·  إجمالي قيمتها: '
      || (SELECT COALESCE(sum(oi.unit_price * oi.quantity), 0)::text
            FROM public.orders o
            JOIN public.order_items oi ON oi.order_id = o.id
            JOIN public.personalized_products pp ON pp.id = oi.product_id
           WHERE o.status IN ('paid','preparing','shipped','delivered')
             AND pp.publisher_id IS NOT NULL),
    'للمراجعة'

  UNION ALL

  -- ══ ٥) منتجات الناشرين ═════════════════════════════════
  SELECT
    '5. المنتجات',
    COALESCE(pp.owner_type::text, '(بلا نوع)'),
    'عدد المنتجات: ' || count(*)::text
      || '  ·  متوسط السعر: ' || COALESCE(round(avg(pp.price))::text, '—')
      || '  ·  منها بلا ناشر: '
      || count(*) FILTER (WHERE pp.publisher_id IS NULL)::text,
    'للمراجعة'
  FROM public.personalized_products pp
  GROUP BY pp.owner_type

  UNION ALL

  -- ══ ٦) مين يقدر يكتب في مستحقات الناشر؟ ════════════════
  --
  -- ⚠️ بنقرا `with_check` مش `qual` (قاعدة «ن»): سياسة `INSERT`
  --    بتخزّن شرطها في `with_check`.
  SELECT
    '6. صلاحيات الكتابة',
    p.policyname::text,
    (p.cmd || '  ·  الأدوار: ' || array_to_string(p.roles, ', ')
      || '  ·  WITH CHECK: ' || COALESCE(p.with_check, '—'))::text,
    'للمراجعة'
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename = 'publisher_payouts'

  UNION ALL

  -- ══ ٧) منع التكرار ═════════════════════════════════════
  --
  -- مستحق المدرب محميّ بفهرس فريد على (source_type, source_id).
  -- ومستحق الناشر **مفيهوش عمود مصدر أصلًا** — يعني مفيش حاجة
  -- تمنع إن نفس الطلب يتسجّل مرتين.
  SELECT
    '7. أعمدة المستحق',
    c.column_name::text,
    c.data_type::text
      || CASE WHEN c.is_nullable = 'NO' THEN '  ·  مطلوب' ELSE '' END,
    '✓ موجود'
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'publisher_payouts'

  UNION ALL

  -- ══ ٨) طلب السحب — الناشر مالوش مكان فيه ═══════════════
  --
  -- الجدول عمود المالك فيه اسمه `instructor_id` ومطلوب. يعني حتى
  -- لو حسبنا مستحق الناشر، مفيش طريق يطلب بيه سحبه.
  SELECT
    '8. طلب السحب',
    c.column_name::text,
    c.data_type::text
      || CASE WHEN c.is_nullable = 'NO' THEN '  ·  مطلوب' ELSE '  ·  يقبل الفراغ' END,
    CASE WHEN c.column_name = 'instructor_id' AND c.is_nullable = 'NO'
         THEN '⚠️ الجدول للمدرب وحده'
         ELSE '—' END
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'withdrawal_requests'
    AND c.column_name IN ('instructor_id', 'amount', 'method', 'status')

) t ORDER BY القسم, البند;

-- ============================================================
-- مفيش تراجع — الملف قراءة فقط.
-- ============================================================
