-- ============================================================
-- 97 — نصيب الناشر ومستحقاته
-- ============================================================
--
-- ── اللي التشخيص (ملف 96) أثبته ─────────────────────────────
--
--   ✓ المعادلة موجودة ومضبوطة فعلًا:
--         `default`            → معامل 1.5  ·  رسم 50
--         `publisher-default`  → معامل 1.2  ·  رسم 30
--     يعني شكّي إن صفّ الناشر ناقص **كان في المكان الغلط**. الصفّان
--     موجودان وقيمهم حقيقية.
--
--   🔴 `publisher_payouts` **فاضي**، ومفيش سطر واحد في المشروع
--      بيكتب فيه. رصيد الناشر بيطلع صفر مهما اتباع — لأن مفيش حساب.
--
--   ✓ **صفر منتجات لأي ناشر** (خمس منتجات كلها للمنصة). يعني
--     التعديل ده **مالوش أي أثر رجعي على سعر معروض** — مفيش كتاب
--     ناشر واحد اتسعّر غلط عشان نصلّحه.
--
--   🔴 `publisher_payouts` **مفيهوش أعمدة مصدر**: الأعمدة هي
--      id · publisher_id · period · amount · status · التواريخ.
--      يعني مفيش حاجة تمنع إن نفس الطلب يتسجّل مرتين — ومستحق
--      المدرب محميّ بفهرس فريد من ملف 90. الفرق ده بيتقفل هنا.
--
-- ── القرارات (تامر، 25 سبتمبر) ──────────────────────────────
--
--   ① الناشر بيكتب **نصيبه**، والموقع بيحسب سعر العميل — نفس منطق
--     المدرب بالظبط.
--   ② المستحق بيتسجّل **عند التسليم** (`delivered`) لا عند الدفع،
--     عشان المرتجع والإلغاء بعد الدفع ما يخلقوش مستحقًّا يتشال بإيد.
--
-- ── اللي بيتعمل هنا ─────────────────────────────────────────
--
--   ١. `personalized_products.publisher_cost` — نصيب الناشر
--   ٢. أعمدة المصدر على `publisher_payouts` + فهرس فريد
--   ٣. دالة `record_order_publisher_earnings(order_id)`
--
-- ⚠️ **ليه عمود جديد بدل ما نغيّر معنى `price`؟**
--
--    `price` هو اللي **كل شاشة في الموقع بتعرضه للعميل**. لو غيّرنا
--    معناه، كل رقم معروض يبقى محتاج حساب في وقت العرض — في المتصفح،
--    وفي خريطة الموقع، وفي البيانات المنظّمة اللي جوجل بيقراها. ومع
--    أول شاشة تنسى تحسب، العميل يشوف سعرًا غير اللي هيدفعه.
--
--    فـ`price` بيفضل **سعر العميل النهائي زي ما هو**، والعمود الجديد
--    بيشيل نصيب الناشر، والكود بيحسب `price` وقت الحفظ مرة واحدة.
--    مفيش شاشة واحدة محتاجة تتغيّر.
--
-- ⚠️ **وليه مفيش قيد `CHECK` بيلزم كل منتج ناشر بنصيب؟**
--
--    لأن القيد هيمنع الإدارة من تعديل أي منتج ناشر قديم لو يومًا
--    اتعمل صف بلا نصيب — والقاعدة هي مصدر الحقيقة لا نيّتنا. الدالة
--    في القسم ٣ بترفض الحساب لما النصيب فاضي **وبترجّع السبب مكتوبًا**
--    بدل ما تعدّي بصفر في صمت. ده حاجز بيتكلم، والقيد حاجز بيقفل باب
--    غلط.
-- ============================================================

BEGIN;

-- ── ١) نصيب الناشر على المنتج ──────────────────────────────

ALTER TABLE public.personalized_products
  ADD COLUMN IF NOT EXISTS publisher_cost integer;

COMMENT ON COLUMN public.personalized_products.publisher_cost IS
  'نصيب الناشر من الكتاب الواحد. سعر العميل في `price` بيتحسب منه: النصيب × المعامل + الرسم (ملف 97).';


-- ── ٢) مصدر المستحق ومنع التكرار ───────────────────────────

ALTER TABLE public.publisher_payouts
  ADD COLUMN IF NOT EXISTS source_type  text,
  ADD COLUMN IF NOT EXISTS source_id    text,
  ADD COLUMN IF NOT EXISTS description  text;

COMMENT ON COLUMN public.publisher_payouts.source_id IS
  'رقم الطلب اللي المستحق جاي منه. مع `source_type` و`publisher_id` بيمنعوا تسجيل نفس الطلب مرتين (ملف 97).';

-- ⚠️ **الفهرس ده هو الحاجز الحقيقي ضد الدفع مرتين.**
--
--    والمفتاح فيه **تلاتة** لا اتنين — عكس فهرس المدرب. السبب إن
--    الطلب الواحد ممكن يكون فيه كتب من ناشرين مختلفين، فكل ناشر
--    ليه صفّه على نفس الطلب. لو المفتاح كان (النوع، الطلب) بس، كان
--    أول ناشر يتسجّل والتاني يترفض في صمت.
CREATE UNIQUE INDEX IF NOT EXISTS publisher_payouts_source_unique
  ON public.publisher_payouts (source_type, source_id, publisher_id)
  WHERE source_type IS NOT NULL AND source_id IS NOT NULL;


-- ── ٣) تسجيل مستحقات طلب مسلَّم ────────────────────────────

CREATE OR REPLACE FUNCTION public.record_order_publisher_earnings(p_order_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user      uuid := auth.uid();
  v_order     record;
  v_row       record;
  v_inserted  integer := 0;
  v_recorded  integer := 0;
  v_total     integer := 0;
  v_missing   integer := 0;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'لازم تسجّل الدخول';
  END IF;

  -- الإدارة وحدها: هي اللي بتعلّم الطلب «مسلَّم» أصلًا.
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'الإجراء ده للإدارة';
  END IF;

  SELECT o.id, o.status INTO v_order
    FROM orders o
   WHERE o.id::text = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب مش موجود';
  END IF;

  -- ⚠️ الدالة **مبتغيّرش حالة الطلب** — بتقرا بس. الإقفال شغل الكود
  --    اللي بيناديها، وخلط الاتنين بيخلّي إعادة النداء خطرة.
  IF v_order.status <> 'delivered' THEN
    RETURN jsonb_build_object(
      'recorded', false, 'reason', 'not_delivered', 'status', v_order.status
    );
  END IF;

  -- صفّ لكل ناشر في الطلب. المبلغ **من صف المنتج لا من المتصفح**
  -- (قاعدة «ف»).
  FOR v_row IN
    SELECT pp.publisher_id                                   AS publisher_id,
           sum(pp.publisher_cost * oi.quantity)::integer     AS amount,
           count(*)                                          AS lines,
           count(*) FILTER (WHERE pp.publisher_cost IS NULL) AS no_cost,
           string_agg(DISTINCT pp.name, '، ')                AS titles
      FROM order_items oi
      JOIN personalized_products pp ON pp.id = oi.product_id
     WHERE oi.order_id::text = p_order_id
       AND pp.publisher_id IS NOT NULL
     GROUP BY pp.publisher_id
  LOOP
    -- منتج بلا نصيب مسجَّل: **مش بنسجّل صفرًا**. الصفر بيبان مستحقًّا
    -- تمّ حسابه، والحقيقة إن الرقم ناقص. بنعدّه ونرجّعه في النتيجة
    -- عشان الشاشة تقول للإدارة تظبطه.
    IF v_row.no_cost > 0 OR v_row.amount IS NULL OR v_row.amount <= 0 THEN
      v_missing := v_missing + 1;
      CONTINUE;
    END IF;

    INSERT INTO publisher_payouts (
      publisher_id, period, amount, status, source_type, source_id, description
    )
    VALUES (
      v_row.publisher_id,
      to_char(now(), 'YYYY-MM'),
      v_row.amount,
      'pending',
      'order',
      v_order.id::text,
      COALESCE(v_row.titles, 'منتجات')
    )
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    IF v_inserted > 0 THEN
      v_recorded := v_recorded + 1;
      v_total := v_total + v_row.amount;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'recorded',  v_recorded > 0,
    'publishers', v_recorded,
    'amount',    v_total,
    'missing_cost', v_missing,
    'reason',    CASE
                   WHEN v_recorded > 0 THEN 'inserted'
                   WHEN v_missing > 0  THEN 'missing_cost'
                   ELSE 'nothing_to_record'
                 END
  );
END
$function$;

COMMENT ON FUNCTION public.record_order_publisher_earnings(text) IS
  'بتسجّل مستحق كل ناشر في طلب مسلَّم. المبلغ = نصيب الناشر × الكمية من صف المنتج. التكرار بيمنعه الفهرس الفريد (ملف 97).';

REVOKE ALL ON FUNCTION public.record_order_publisher_earnings(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.record_order_publisher_earnings(text) TO authenticated;

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) العمود الجديد على المنتجات
  SELECT
    '1. نصيب الناشر'::text AS القسم,
    'publisher_cost'::text  AS البند,
    COALESCE((SELECT data_type FROM information_schema.columns
               WHERE table_schema='public' AND table_name='personalized_products'
                 AND column_name='publisher_cost'), '(مش موجود)')::text AS التفاصيل,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema='public' AND table_name='personalized_products'
                         AND column_name='publisher_cost')
         THEN '✓ اتضاف' ELSE '✗ ناقص' END AS الحالة

  UNION ALL

  -- ٢) أعمدة المصدر
  SELECT
    '2. أعمدة المصدر',
    c.column_name::text,
    c.data_type::text,
    '✓ اتضاف'
  FROM information_schema.columns c
  WHERE c.table_schema='public' AND c.table_name='publisher_payouts'
    AND c.column_name IN ('source_type','source_id','description')

  UNION ALL

  -- ٣) الفهرس الفريد — عليه يعتمد ON CONFLICT
  SELECT
    '3. منع التكرار',
    COALESCE(i.indexname, '(مفقود)')::text,
    COALESCE(i.indexdef, 'الفهرس مش موجود — ON CONFLICT مش هيشتغل')::text,
    CASE WHEN i.indexdef ILIKE '%unique%' THEN '✓ فريد' ELSE '✗ راجع' END
  FROM (SELECT 1) one
  LEFT JOIN pg_indexes i
    ON i.schemaname='public' AND i.tablename='publisher_payouts'
   AND i.indexname='publisher_payouts_source_unique'

  UNION ALL

  -- ٤) الدالة ونسخها (قاعدة «س»)
  SELECT
    '4. الدالة',
    p.proname::text,
    ((CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END)
      || '  ·  search_path: '
      || COALESCE(array_to_string(p.proconfig, ', '), '(غير مضبوط)')
      || '  ·  نسخ: ' || count(*) OVER (PARTITION BY p.proname)::text)::text,
    CASE WHEN p.prosecdef AND p.proconfig IS NOT NULL
         THEN '✓ سليمة' ELSE '✗ راجع' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname='public' AND p.proname='record_order_publisher_earnings'

  UNION ALL

  -- ٥) الصلاحيات
  SELECT
    '5. الصلاحيات',
    'record_order_publisher_earnings',
    'anon: ' || CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN 'نعم' ELSE 'لأ' END
      || '  ·  authenticated: ' || CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE') THEN 'نعم' ELSE 'لأ' END,
    CASE WHEN NOT has_function_privilege('anon', p.oid, 'EXECUTE')
          AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
         THEN '✓ الزائر ممنوع' ELSE '✗ راجع' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname='public' AND p.proname='record_order_publisher_earnings'

  UNION ALL

  -- ٦) المنتجات ما اتلمستش
  SELECT
    '6. المنتجات',
    'personalized_products',
    'إجمالي: ' || (SELECT count(*)::text FROM personalized_products)
      || '  ·  لناشر: ' || (SELECT count(*)::text FROM personalized_products WHERE publisher_id IS NOT NULL)
      || '  ·  منها بلا نصيب: '
      || (SELECT count(*)::text FROM personalized_products
           WHERE publisher_id IS NOT NULL AND publisher_cost IS NULL),
    CASE WHEN (SELECT count(*) FROM personalized_products
                WHERE publisher_id IS NOT NULL AND publisher_cost IS NULL) = 0
         THEN '✓ مفيش منتج ناشر بلا نصيب'
         ELSE '⚠️ فيه منتجات محتاجة ضبط' END

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ شيل الفهرس معناه إن نفس الطلب ينفع يتسجّل مرتين. ومتشغّلش ده
--    بعد ما الكود الجديد ينشر — الكود بينادي الدالة دي.
--
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.record_order_publisher_earnings(text);
-- DROP INDEX IF EXISTS public.publisher_payouts_source_unique;
-- -- الأعمدة بتفضل: شيلها بيمسح بيانات مستحقات اتسجّلت.
-- -- ALTER TABLE public.personalized_products DROP COLUMN publisher_cost;
-- COMMIT;
-- ============================================================
