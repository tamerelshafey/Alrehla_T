-- ============================================================
-- 83 — دالتان عامتان لبيانات المدربين (إضافة فقط)
-- ============================================================
--
-- ✅ **الملف ده بيضيف وبس. مبيشيلش ومبيغيّرش أي سياسة قايمة.**
--    تشغيله دلوقتي **مبيكسرش حاجة** — الموقع هيفضل شغّال زي ما هو
--    بالظبط، والدوال دي هتبقى موجودة ومستنية الكود يستخدمها.
--
-- ⚠️ **الترتيب مهم — تلات خطوات، وعكسها بيوقّع صفحة المدربين على
--    الإنتاج مباشرة:**
--
--      ١. شغّل الملف ده              ← دلوقتي (إضافة، بلا خطر)
--      ٢. ادفع الكود اللي بينادي الدوال دي
--      ٣. شغّل ملف 84                ← اللي بيقفل القراءة العامة
--
--    لو اتعمل 84 قبل 2، الصفحة العامة بتفقد مصدر بياناتها وتقع.
--
-- ── المشكلة ─────────────────────────────────────────────────
--
-- جدول `instructors` عليه سياسة `SELECT USING (true)`، يعني **كل
-- أعمدته مقروءة لأي زائر** عبر REST بالمفتاح العام الموجود في صفحة
-- الموقع. والأعمدة دي فيها:
--
--   requested_price · approved_price · monthly_hours_committed ·
--   work_model · training_passed · pending_schedule
--
-- يعني **السعر المتفاوَض عليه مع كل مدرب وشروط تعاقده** مكشوفة.
--
-- وقاعدة (ب): الصلاحيات بتحمي الصفوف لا الأعمدة — فمفيش سياسة تقدر
-- تخفي عمودًا. الحل الوحيد إن القراءة العامة تعدّي على **دالة بترجّع
-- الأعمدة الآمنة وحدها**. وده نفس النمط المعتمد في المشروع من ملف 70
-- (`instructor_sessions`, `student_sessions`, `my_dependent_link`).
--
-- ── وحاجة كمان بتتحل هنا ────────────────────────────────────
--
-- صورة المدرب **مش في جدول `instructors`** — هي في
-- `user_profiles.avatar_url`. الكود دلوقتي بيعمل استعلامين: واحد
-- للمدربين وواحد للصور. الدالة بتجيبهم في استعلام واحد.
--
-- ── الأعمدة اللي بترجع — ومفيش غيرها ────────────────────────
--
--   id · user_id · display_name · bio · specialties ·
--   years_experience · is_sample · status · weekly_schedule ·
--   avatar_url
--
-- ⚠️ `weekly_schedule` راجع عن قصد: العميل محتاج يشوف المواعيد
--    المتاحة عشان يحجز. مواعيد مش أسعارًا.
--
-- ⚠️ **متضيفش عمود هنا من غير ما تسأل: هل ينفع أي زائر يقراه؟**
-- ============================================================

BEGIN;

-- ── قائمة المدربين للصفحات العامة ──────────────────────────
--
-- ⚠️ كل الأعمدة بترجع `text` والمقارنات بـ`::text` على الطرفين عن قصد
--    (قاعدة «ج»): `src/types/supabase.ts` بيكتب `uuid` و`text`
--    الاتنين `string`، وجدول واحد ممكن يخلط النوعين. الكاست بيخلّي
--    الدالة شغّالة مهما كان النوع الحقيقي، وبيمنع تكرار عطل ملف 74
--    (`operator does not exist: uuid = text`).

CREATE OR REPLACE FUNCTION public.public_instructors()
RETURNS TABLE (
  id                text,
  user_id           text,
  display_name      text,
  bio               text,
  specialties       text[],
  years_experience  integer,
  is_sample         boolean,
  status            text,
  weekly_schedule   jsonb,
  avatar_url        text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    i.id::text,
    i.user_id::text,
    i.display_name::text,
    i.bio::text,
    i.specialties::text[],
    i.years_experience::integer,
    i.is_sample,
    i.status::text,
    i.weekly_schedule::jsonb,
    up.avatar_url::text
  FROM public.instructors i
  LEFT JOIN public.user_profiles up
    ON up.id::text = i.user_id::text
  ORDER BY i.created_at DESC;
$function$;

-- ── مدرب واحد ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.public_instructor(p_id text)
RETURNS TABLE (
  id                text,
  user_id           text,
  display_name      text,
  bio               text,
  specialties       text[],
  years_experience  integer,
  is_sample         boolean,
  status            text,
  weekly_schedule   jsonb,
  avatar_url        text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    i.id::text,
    i.user_id::text,
    i.display_name::text,
    i.bio::text,
    i.specialties::text[],
    i.years_experience::integer,
    i.is_sample,
    i.status::text,
    i.weekly_schedule::jsonb,
    up.avatar_url::text
  FROM public.instructors i
  LEFT JOIN public.user_profiles up
    ON up.id::text = i.user_id::text
  WHERE i.id::text = p_id;
$function$;

-- ── الصلاحيات ──────────────────────────────────────────────
--
-- ⚠️ الدالتين دول **لازم** يكونوا متاحين لـ`anon`: دي المسار العام
--    اللي الزائر بيقرا منه. الفرق عن قبل إنه بيقرا **عشرة أعمدة
--    محدَّدة** بدل الجدول كله.
--
-- والـREVOKE قبل الـGRANT عن قصد (قاعدة §3): Supabase بيمنح `anon`
-- تنفيذ أي دالة جديدة تلقائيًا، و`REVOKE FROM public` **مبيشيلوش** —
-- فبنصفّر الصلاحيات الأول وبعدين نمنح اللي إحنا عايزينه بالظبط.

REVOKE ALL ON FUNCTION public.public_instructors() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.public_instructor(text) FROM public, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.public_instructors() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_instructor(text) TO anon, authenticated;

COMMIT;

-- ============================================================
-- استعلام التأكيد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) الدالتان موجودتان وبالإعدادات الصح
  SELECT
    '1. الدالتان'::text AS القسم,
    p.proname::text      AS البند,
    (CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END
      || '  ·  search_path: '
      || COALESCE(array_to_string(p.proconfig, ', '), '(غير مضبوط)'))::text AS التفاصيل,
    CASE
      WHEN p.prosecdef AND p.proconfig IS NOT NULL THEN '✓ سليمة'
      ELSE '✗ راجع الإعدادات'
    END AS الحالة
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('public_instructors', 'public_instructor')

  UNION ALL

  -- ٢) الصلاحيات: الزائر والمسجَّل ينفّذان
  SELECT
    '2. الصلاحيات',
    p.proname::text,
    'anon: ' || CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE')
                     THEN 'نعم' ELSE 'لأ' END
    || '  ·  authenticated: ' || CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE')
                     THEN 'نعم' ELSE 'لأ' END,
    CASE
      WHEN has_function_privilege('anon', p.oid, 'EXECUTE')
       AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
        THEN '✓ الاتنين'
      ELSE '✗ ناقصة'
    END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('public_instructors', 'public_instructor')

  UNION ALL

  -- ٣) مفيش عمود حسّاس في التوقيع
  SELECT
    '3. الأعمدة الراجعة',
    p.proname::text,
    pg_get_function_result(p.oid)::text,
    CASE
      WHEN pg_get_function_result(p.oid) ~* 'price|hours_committed|pending_schedule|work_model|training_passed'
        THEN '✗ فيه عمود حسّاس'
      ELSE '✓ آمنة'
    END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('public_instructors', 'public_instructor')

  UNION ALL

  -- ٤) بترجّع بيانات فعلًا (ومعاها الصور)
  SELECT
    '4. تجربة',
    'public_instructors()',
    'عدد المدربين: ' || (SELECT count(*) FROM public.public_instructors())::text
      || '  ·  منهم بصورة: '
      || (SELECT count(*) FROM public.public_instructors() WHERE avatar_url IS NOT NULL)::text,
    CASE WHEN (SELECT count(*) FROM public.public_instructors()) > 0
         THEN '✓ بترجّع' ELSE '⚠️ فاضية — الجدول فاضي؟' END

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ متشغّلهوش لو ملف 84 اتشغّل — هتفضل صفحة المدربين العامة بلا
--    مصدر بيانات. رجّع 84 الأول.
--
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.public_instructors();
-- DROP FUNCTION IF EXISTS public.public_instructor(text);
-- COMMIT;
-- ============================================================
