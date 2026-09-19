-- ============================================================
-- 84 — قفل قراءة جدول المدربين على الزائر
-- ============================================================
--
-- 🛑 **متشغّلهوش دلوقتي.** الملف ده **الخطوة التالتة** في تسلسل لازم
--    يتم بالترتيب:
--
--      ١. ملف 83 (الدالتان)        ← لازم يكون اتشغّل
--      ٢. **الكود اتدفع واتنشر**   ← الصفحات العامة بقت بتنادي الدوال
--      ٣. الملف ده                 ← دلوقتي بس
--
--    لو اتشغّل قبل الخطوة ٢، **صفحة المدربين العامة بتفقد مصدر
--    بياناتها وتطلع فاضية على الإنتاج** — بلا رسالة خطأ، لأن الاستعلام
--    اللي بترفضه الصلاحيات بيرجع **فاضي مش خاطئ** (قاعدة «ك»).
--
--    ✅ تتأكد إن الخطوة ٢ خلصت إزاي: افتح
--       `/creative-writing/instructors` على الموقع المنشور — لو
--       المدربين ظاهرين **بصورهم**، يبقى الكود الجديد شغّال.
--
-- ── إيه اللي بيتغيّر ────────────────────────────────────────
--
-- سياسة `Instructors are viewable by everyone` شرطها `USING (true)`،
-- يعني **كل أعمدة الجدول** مقروءة لأي زائر عبر REST بالمفتاح العام —
-- ومنها `approved_price` و`requested_price` و`monthly_hours_committed`
-- و`work_model` و`training_passed`.
--
-- بتتشال، وبتتحط مكانها سياسة قراءة **للمسجَّلين وبس**.
--
-- والزائر بيقرا من `public_instructors()` (ملف 83) — دالة
-- `SECURITY DEFINER` فبتتخطى RLS بحكم تعريفها، وبترجّع عشرة أعمدة
-- آمنة وبس.
--
-- ── اللي **مش** بيتقفل ──────────────────────────────────────
--
-- ⚠️ أي **مستخدم مسجَّل** هيفضل يقدر يقرا أسعار المدربين من الجدول.
--    قفله بيكسر عرض اسم المدرب في طلبات الخدمة
--    (`instructors(display_name)` المتداخلة اللي المشتري بيقراها)،
--    فمحتاج دورة منفصلة. المكسب هنا إن الانكشاف بقى محتاج **حسابًا**
--    بدل ما يبقى مفتوحًا لأي حد معاه رابط الموقع.
-- ============================================================

BEGIN;

DROP POLICY IF EXISTS "Instructors are viewable by everyone" ON public.instructors;

CREATE POLICY "Signed-in users read instructors"
  ON public.instructors
  FOR SELECT
  TO authenticated
  USING (true);

COMMIT;

-- ============================================================
-- استعلام التأكيد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) السياسة المفتوحة اتشالت
  SELECT
    '1. السياسة القديمة'::text AS القسم,
    'Instructors are viewable by everyone'::text AS البند,
    'سياسة SELECT USING (true) لكل الأدوار'::text AS التفاصيل,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'instructors'
        AND policyname = 'Instructors are viewable by everyone'
    ) THEN '✗ لسه موجودة' ELSE '✓ اتشالت' END AS الحالة

  UNION ALL

  -- ٢) سياسات القراءة الحالية على الجدول
  SELECT
    '2. سياسات القراءة',
    p.policyname::text,
    'الأدوار: ' || array_to_string(p.roles, ', ')
      || '  ·  USING: ' || COALESCE(p.qual, '(بلا شرط)'),
    CASE
      WHEN 'anon' = ANY(p.roles) OR 'public' = ANY(p.roles)
        THEN '⚠️ شاملة الزائر'
      ELSE '✓ للمسجَّلين'
    END
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename = 'instructors'
    AND p.cmd IN ('SELECT', 'ALL')

  UNION ALL

  -- ٣) الدالتان لسه بترجّعا بيانات (SECURITY DEFINER بتتخطى RLS)
  SELECT
    '3. المسار العام',
    'public_instructors()',
    'عدد المدربين: ' || (SELECT count(*) FROM public.public_instructors())::text
      || '  ·  منهم بصورة: '
      || (SELECT count(*) FROM public.public_instructors()
          WHERE avatar_url IS NOT NULL)::text,
    CASE WHEN (SELECT count(*) FROM public.public_instructors()) > 0
         THEN '✓ شغّالة' ELSE '✗ فاضية — راجع ملف 83' END

  UNION ALL

  -- ٤) الجدول لسه عليه RLS
  SELECT
    '4. حماية الجدول',
    'instructors',
    CASE WHEN t.rowsecurity THEN 'RLS مفعّلة' ELSE 'RLS متوقفة' END,
    CASE WHEN t.rowsecurity THEN '✓ سليم' ELSE '✗ خطر' END
  FROM pg_tables t
  WHERE t.schemaname = 'public' AND t.tablename = 'instructors'

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع — لو صفحة المدربين العامة وقعت
-- ============================================================
--
-- BEGIN;
-- DROP POLICY IF EXISTS "Signed-in users read instructors" ON public.instructors;
-- CREATE POLICY "Instructors are viewable by everyone"
--   ON public.instructors FOR SELECT USING (true);
-- COMMIT;
--
-- (ده بيرجّع الانكشاف — استخدمه كحل مؤقت لحد ما تتأكد إن الكود الجديد
--  منشور، وبعدين شغّل الملف ده تاني.)
-- ============================================================
