-- ============================================================
-- 102 — المدرب وباقاته
-- ============================================================
--
-- ── اللي التشخيص (ملف 101) أثبته ────────────────────────────
--
--   • خمس مدربين، **اتنين بس نشطين** — وده كل سبب «بيظهر اتنين».
--   • **مفيش أي جدول بيربط المدرب بالباقة**، فكل مدرب نشط بيظهر في
--     الست باقات: من «السطور السحرية» لطفل تحت ١٢، لحد «رحلتي نحو
--     الحكاية» ٤٨ جلسة لمراهق.
--
-- ── القرار (تامر) ───────────────────────────────────────────
--
-- **المدرب يختار، والإدارة توافق** — نفس نمط «طلبات تعديل الملف»
-- الموجود (`profile_update_requests`)، مش آلية جديدة.
--
-- ── ⚠️ القرار الأخطر في الملف ───────────────────────────────
--
-- **المدرب اللي ما اختارش ولا باقة بيظهر في كل الباقات.**
--
-- لو خلّينا «فاضي = مايدرّبش حاجة»، أول ما الكود ينشر **كل المدربين
-- يختفوا من الموقع فورًا** لحد ما الإدارة تفتح كل واحد وتحدّدله.
-- يعني تعديل تحسيني بيقفل البيع.
--
-- فالافتراضي هو **الوضع الحالي بالظبط**، والتضييق اختيار واعٍ.
-- والشاشة بتقول ده بالنص: «مش محدَّد — بيظهر في كل الباقات».
--
-- ── ⚠️ والفخّ اللي ضربنا قبل كده (قاعدة «س») ────────────────
--
-- الدالتان `public_instructors()` و`public_instructor(text)`
-- محتاجين عمود جديد (`package_ids`). و**`CREATE OR REPLACE` مينفعش
-- هنا**: تغيير أعمدة `RETURNS TABLE` بيرمي
-- `cannot change return type of existing function`.
--
-- فبنعمل `DROP` ثم `CREATE` — **جوّه نفس المعاملة**، فالموقع
-- مايشوفش لحظة واحدة الدالة فيها مش موجودة.
--
-- ⚠️ ودي بالظبط الحتة اللي ملف 86 وقع فيها لما ساب نسخة قديمة جنب
--    الجديدة **وأوقع حجز الباقات على الإنتاج**. الفرق إن هنا بنشيل
--    بالتوقيع الكامل الأول.
-- ============================================================

BEGIN;

-- ── ١) جدول الربط ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.instructor_packages (
  instructor_id text NOT NULL
    REFERENCES public.instructors(id) ON DELETE CASCADE,
  package_id    text NOT NULL
    REFERENCES public.creative_writing_packages(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (instructor_id, package_id)
);

COMMENT ON TABLE public.instructor_packages IS
  'الباقات اللي المدرب بيدرّبها. **الصفوف الفاضية معناها كل الباقات** — مش ولا باقة (ملف 102).';

ALTER TABLE public.instructor_packages ENABLE ROW LEVEL SECURITY;

-- القراءة عامة: الجدول مفهوش غير رقمين، ومعالج الحجز محتاجه.
DROP POLICY IF EXISTS "Anyone can read instructor packages" ON public.instructor_packages;
CREATE POLICY "Anyone can read instructor packages"
  ON public.instructor_packages FOR SELECT USING (true);

-- ⚠️ **الكتابة للإدارة وحدها.** المدرب بيقترح عبر
--    `profile_update_requests`، والموافقة هي اللي بتكتب هنا — فمفيش
--    سياسة كتابة للمدرب عن قصد.
DROP POLICY IF EXISTS "Admins manage instructor packages" ON public.instructor_packages;
CREATE POLICY "Admins manage instructor packages"
  ON public.instructor_packages FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ── ٢) الدالتان العامتان — بعمود الباقات ───────────────────

DROP FUNCTION IF EXISTS public.public_instructors();
DROP FUNCTION IF EXISTS public.public_instructor(text);

CREATE FUNCTION public.public_instructors()
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
  avatar_url        text,
  package_ids       text[]
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
    up.avatar_url::text,
    -- مصفوفة فاضية معناها «كل الباقات» — الواجهة بتفهمها كده.
    COALESCE(
      (SELECT array_agg(ip.package_id::text)
         FROM public.instructor_packages ip
        WHERE ip.instructor_id::text = i.id::text),
      ARRAY[]::text[]
    )
  FROM public.instructors i
  LEFT JOIN public.user_profiles up
    ON up.id::text = i.user_id::text
  ORDER BY i.created_at DESC;
$function$;

CREATE FUNCTION public.public_instructor(p_id text)
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
  avatar_url        text,
  package_ids       text[]
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
    up.avatar_url::text,
    COALESCE(
      (SELECT array_agg(ip.package_id::text)
         FROM public.instructor_packages ip
        WHERE ip.instructor_id::text = i.id::text),
      ARRAY[]::text[]
    )
  FROM public.instructors i
  LEFT JOIN public.user_profiles up
    ON up.id::text = i.user_id::text
  WHERE i.id::text = p_id;
$function$;

-- ⚠️ الصلاحيات بتتصفّر وتترجع: Supabase بيمنح `anon` تنفيذ أي دالة
--    جديدة تلقائيًا، والـ`DROP` شال المنح القديم — فلازم نعيده صريح.
REVOKE ALL ON FUNCTION public.public_instructors() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.public_instructor(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_instructors() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_instructor(text) TO anon, authenticated;


-- ── ٣) تطبيق اختيار المدرب بعد الموافقة ────────────────────
--
-- ⚠️ **ليه دالة مش كتابة من الكود؟** الموافقة بتشيل كل الصفوف
--    القديمة وتحط الجديدة — وده لازم يتم **دفعة واحدة**. لو اتعمل
--    على خطوتين من الكود وفشلت التانية، المدرب يفضل **بلا ولا
--    باقة** — يعني (بقاعدتنا) بيظهر في كلها، وهو عكس اللي اتوافق
--    عليه بالظبط.
CREATE OR REPLACE FUNCTION public.set_instructor_packages(
  p_instructor_id text,
  p_package_ids   text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_valid text[];
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'الإجراء ده للإدارة';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM instructors WHERE id::text = p_instructor_id) THEN
    RAISE EXCEPTION 'المدرب مش موجود';
  END IF;

  -- الباقات الموجودة فعلًا وبس. رقم باقة اتمسحت بيتجاهل بدل ما
  -- يوقّع العملية كلها.
  SELECT COALESCE(array_agg(p.id::text), ARRAY[]::text[]) INTO v_valid
    FROM creative_writing_packages p
   WHERE p.id::text = ANY(COALESCE(p_package_ids, ARRAY[]::text[]));

  DELETE FROM instructor_packages WHERE instructor_id::text = p_instructor_id;

  IF array_length(v_valid, 1) > 0 THEN
    INSERT INTO instructor_packages (instructor_id, package_id)
    SELECT p_instructor_id, unnest(v_valid);
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'count', COALESCE(array_length(v_valid, 1), 0),
    'all_packages', COALESCE(array_length(v_valid, 1), 0) = 0
  );
END
$function$;

COMMENT ON FUNCTION public.set_instructor_packages(text, text[]) IS
  'بتستبدل باقات المدرب دفعة واحدة. مصفوفة فاضية = بيظهر في كل الباقات (ملف 102).';

REVOKE ALL ON FUNCTION public.set_instructor_packages(text, text[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_instructor_packages(text, text[]) TO authenticated;

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) الجدول
  SELECT
    '1. الجدول'::text AS القسم,
    'instructor_packages'::text AS البند,
    (CASE WHEN t.rowsecurity THEN 'RLS مفعّلة' ELSE 'RLS متوقفة' END
      || '  ·  صفوف: ' || (SELECT count(*)::text FROM public.instructor_packages))::text
      AS التفاصيل,
    CASE WHEN t.rowsecurity THEN '✓ اتعمل' ELSE '✗ راجع' END AS الحالة
  FROM pg_tables t
  WHERE t.schemaname = 'public' AND t.tablename = 'instructor_packages'

  UNION ALL

  -- ٢) سياساته
  SELECT
    '2. السياسات',
    p.policyname::text,
    (p.cmd || '  ·  ' || COALESCE(p.qual, p.with_check, '—'))::text,
    '✓'
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'instructor_packages'

  UNION ALL

  -- ٣) الدوال ونسخها — قاعدة «س»
  SELECT
    '3. الدوال',
    (pr.proname || '(' || pg_get_function_arguments(pr.oid) || ')')::text,
    ('نسخ بنفس الاسم: ' || count(*) OVER (PARTITION BY pr.proname)::text
      || '  ·  ' || CASE WHEN pr.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END)::text,
    CASE WHEN count(*) OVER (PARTITION BY pr.proname) = 1
         THEN '✓ نسخة واحدة' ELSE '🔴 تحميل زائد — النداء هيبقى ملتبس' END
  FROM pg_proc pr
  JOIN pg_namespace n ON n.oid = pr.pronamespace
  WHERE n.nspname = 'public'
    AND pr.proname IN ('public_instructors', 'public_instructor', 'set_instructor_packages')

  UNION ALL

  -- ٤) الزائر لسه بيقرا المدربين؟ (الصفحة العامة بتعتمد عليه)
  SELECT
    '4. صلاحيات الزائر',
    pr.proname::text,
    ('anon: ' || CASE WHEN has_function_privilege('anon', pr.oid, 'EXECUTE') THEN 'نعم' ELSE 'لأ' END)::text,
    CASE
      WHEN pr.proname = 'set_instructor_packages'
        THEN CASE WHEN has_function_privilege('anon', pr.oid, 'EXECUTE')
                  THEN '🔴 الزائر لازم يكون ممنوع' ELSE '✓ الزائر ممنوع' END
      ELSE CASE WHEN has_function_privilege('anon', pr.oid, 'EXECUTE')
                THEN '✓ الصفحة العامة شغّالة' ELSE '🔴 الصفحة العامة هتفضى' END
    END
  FROM pg_proc pr
  JOIN pg_namespace n ON n.oid = pr.pronamespace
  WHERE n.nspname = 'public'
    AND pr.proname IN ('public_instructors', 'public_instructor', 'set_instructor_packages')

  UNION ALL

  -- ٥) العمود الجديد بيرجع فعلًا
  SELECT
    '5. عمود الباقات',
    x.display_name,
    ('باقاته: ' || COALESCE(array_length(x.package_ids, 1), 0)::text
      || CASE WHEN COALESCE(array_length(x.package_ids, 1), 0) = 0
              THEN '  ·  (يعني كل الباقات)' ELSE '' END)::text,
    '✓ الدالة بترجّع العمود'
  FROM public.public_instructors() x

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ التراجع لازم يرجّع الدالتين لنسخة ملف 83 (بعشرة أعمدة)، وإلا
--    الصفحة العامة هتقع — الكود بيقرا `package_ids`.
--
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.set_instructor_packages(text, text[]);
-- DROP TABLE IF EXISTS public.instructor_packages;
-- -- وبعدين شغّل قسم الدوال من ملف 83 زي ما هو.
-- COMMIT;
-- ============================================================
