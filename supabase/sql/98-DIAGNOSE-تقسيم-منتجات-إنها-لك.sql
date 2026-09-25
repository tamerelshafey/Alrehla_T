-- ============================================================
-- 98 — تشخيص: تقسيم منتجات «إنها لك»  (قراءة فقط)
-- ============================================================
--
-- ✅ **قراءة فقط.** مفيش تعديل ولا إنشاء ولا سياسة بتتغيّر.
--
-- ── اللي المراجعة طلّعته من الكود ───────────────────────────
--
-- «إنها لك» فيها تلات مسارات معروضة للعميل:
--
--     /enha-lak/custom         «أنت البطل هنا»  — قصة من الصفر
--     /enha-lak/library        «المكتبة العامة» — تخصيص الغلاف بس
--     /enha-lak/subscription   «الاشتراك»       — من جدول تاني خالص
--
-- ⚠️ **والمسار بيتحدّد بحقلين مستقلين، وكل شاشة بتسأل حقلًا مختلفًا:**
--
--     شاشة «أنت البطل»      →  بتفلتر بـ`category = 'custom'`
--     شاشة «المكتبة»        →  بتفلتر بـ`category = 'library'`
--     صفحة المنتج           →  بتقرّر بـ`owner_type` **الأول**
--     معالج القصة الكاملة   →  بيرفض أي حاجة `owner_type <> 'platform'`
--     معالج تخصيص الغلاف    →  بيرفض أي حاجة `category <> 'library'`
--
-- يعني الحقلين بيوصفوا نفس الحاجة من غير ما حد يضمن إنهم متفقين.
--
-- ── النتيجتان الملموستان ────────────────────────────────────
--
-- **① منتج للمنصة تصنيفه «مكتبة» ليه طريقان مختلفان.**
--
--    بيظهر في المكتبة. زرار الكارت بيوديه لـ«تخصيص الغلاف»، وزرار
--    صفحته بيقول «ابدأ التخصيص» ويوديه **لمعالج القصة الكاملة** —
--    لأن الصفحة بتسأل `owner_type` الأول وهو `platform`.
--
--    نفس المنتج، نفس السعر، وشغل مختلف تمامًا حسب الزرار اللي
--    العميل داس عليه.
--
-- **② منتج لناشر تصنيفه «مخصص» طريقه مسدود.**
--
--    بيظهر في «أنت البطل هنا»، والزرار بيوديه لمعالج القصة الكاملة،
--    والمعالج بيرفضه لأنه مش `platform` — **صفحة «غير موجود»**.
--
-- ── ومشكلة تالتة في النماذج ─────────────────────────────────
--
-- ⚠️ قوايم التصنيف في شاشات الإضافة بتعرض قيمًا **القاعدة ما
--    بتقبلهاش**: «كتاب» و«لعبة» و«ملحق». والنوع المعرَّف
--    `product_category` فيه تلات قيم بس (حسب ملفات المشروع).
--
--    وشاشة الناشر أسوأ: بتعرض أربع قيم، **تلاتة منهم غير صالحين**،
--    و«مخصص» مش معروض أصلًا.
--
--    القسم ١ بيقول قيم النوع الحقيقية من القاعدة — لأن القاعدة هي
--    مصدر الحقيقة لا ملفات المشروع.
--
-- ⚠️ **وملاحظة:** لو طلع إن القاعدة **بتقبل** «كتاب» و«لعبة»، يبقى
--    العطل أوسع: منتجات بتتحفظ بتصنيفات **مفيش ولا شاشة واحدة
--    بتعرضها** — القسم ٣ بيعدّها.
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ══ ١) قيم التصنيف اللي القاعدة بتقبلها ════════════════
  SELECT
    '1. التصنيفات المسموحة'::text AS القسم,
    e.enumlabel::text               AS البند,
    ('ترتيبها: ' || e.enumsortorder::text)::text AS التفاصيل,
    CASE WHEN e.enumlabel IN ('library','custom','subscription')
         THEN '✓ معروف للشاشات'
         ELSE '⚠️ مفيش شاشة بتعرضه' END AS الحالة
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  WHERE t.typname = 'product_category'

  UNION ALL

  -- ══ ٢) المنتجات الموجودة فعلًا ═════════════════════════
  --
  -- كل منتج بصنفه ومالكه وسعره — عشان نشوف التقسيم الحقيقي بدل
  -- ما نتكلم عن أرقام مجمّعة.
  SELECT
    '2. المنتجات',
    pp.name::text,
    ('تصنيف: ' || pp.category::text
      || '  ·  المالك: ' || pp.owner_type::text
      || '  ·  ناشر: ' || COALESCE(pp.publisher_id, '—')
      || '  ·  سعر العميل: ' || pp.price::text
      || '  ·  نصيب الناشر: ' || COALESCE(pp.publisher_cost::text, '—')
      || '  ·  إلكتروني: ' || COALESCE(pp.electronic_price::text, '—'))::text,
    CASE
      -- ① الحالة اللي ليها طريقان
      WHEN pp.owner_type = 'platform' AND pp.category::text = 'library'
        THEN '🔴 طريقان مختلفان لنفس المنتج'
      -- ② الحالة المسدودة
      WHEN pp.owner_type = 'publisher' AND pp.category::text = 'custom'
        THEN '🔴 طريق مسدود — المعالج بيرفضه'
      WHEN pp.category::text NOT IN ('library','custom','subscription')
        THEN '⚠️ تصنيف مفيش شاشة بتعرضه'
      WHEN pp.category::text = 'subscription'
        THEN '⚠️ شاشة الاشتراك بتقرا من جدول تاني'
      ELSE '✓ متّسق'
    END
  FROM public.personalized_products pp

  UNION ALL

  -- ══ ٣) عدّ كل تركيبة ═══════════════════════════════════
  SELECT
    '3. التركيبات',
    (pp.owner_type::text || ' + ' || pp.category::text),
    'عدد المنتجات: ' || count(*)::text
      || '  ·  المعروض منها في شاشة: '
      || CASE
           WHEN pp.category::text IN ('library','custom') THEN count(*)::text
           ELSE '0'
         END,
    CASE
      WHEN pp.category::text NOT IN ('library','custom')
        THEN '⚠️ مش ظاهر لأي عميل'
      WHEN pp.owner_type = 'platform' AND pp.category::text = 'library' THEN '🔴 ملتبس'
      WHEN pp.owner_type = 'publisher' AND pp.category::text = 'custom' THEN '🔴 مسدود'
      ELSE '✓'
    END
  FROM public.personalized_products pp
  GROUP BY pp.owner_type, pp.category

  UNION ALL

  -- ══ ٤) جدول الاشتراكات المنفصل ═════════════════════════
  --
  -- شاشة «الاشتراك» مبتقراش من المنتجات خالص — بتقرا من
  -- `box_subscription_plans`. يعني تصنيف `subscription` على منتج
  -- مالوش أي معنى في الموقع.
  --
  -- ⚠️ **النسخة الأولى من الملف ده كتبت `subscription_tiers`** —
  --    وده **اسم الدالة في الكود** (`getSubscriptionTiers`) لا اسم
  --    الجدول. الاستعلام وقع فورًا: الجدول مش موجود أصلًا.
  --    والاسم الحقيقي اتقري من `src/data/domains/products.ts`.
  SELECT
    '4. الاشتراكات',
    'box_subscription_plans',
    'عدد الباقات: ' || (SELECT count(*)::text FROM public.box_subscription_plans)
      || '  ·  منها مفعّلة: '
      || (SELECT count(*)::text FROM public.box_subscription_plans WHERE is_active)
      || '  ·  منتجات تصنيفها subscription: '
      || (SELECT count(*)::text FROM public.personalized_products
           WHERE category::text = 'subscription'),
    CASE WHEN (SELECT count(*) FROM public.personalized_products
                WHERE category::text = 'subscription') > 0
         THEN '⚠️ منتجات مالهاش شاشة'
         ELSE '✓ مفيش التباس' END

  UNION ALL

  -- ══ ٥) منتجات ناشر بلا ناشر، والعكس ════════════════════
  --
  -- الحقلين المفروض متفقين: `owner_type = 'publisher'` لازم معاه
  -- `publisher_id`، والعكس. مفيش قيد بيفرض ده.
  SELECT
    '5. اتساق المالك',
    x.label,
    'عدد الصفوف: ' || x.n::text,
    CASE WHEN x.n = 0 THEN '✓ سليم' ELSE '🔴 متناقض' END
  FROM (
    SELECT 'ناشر بلا رقم ناشر'::text AS label,
           count(*) AS n
      FROM public.personalized_products
     WHERE owner_type = 'publisher' AND publisher_id IS NULL
    UNION ALL
    SELECT 'للمنصة ومعاه رقم ناشر',
           count(*)
      FROM public.personalized_products
     WHERE owner_type = 'platform' AND publisher_id IS NOT NULL
  ) x

) t ORDER BY القسم, البند;

-- ============================================================
-- مفيش تراجع — الملف قراءة فقط.
-- ============================================================
