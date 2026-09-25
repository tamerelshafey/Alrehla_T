-- ============================================================
-- 89 — حساب الطفل هو صاحب معرضه
-- ============================================================
--
-- ── ما أثبته التشخيص (ملف 88) على القاعدة الحقيقية ──────────
--
--   • 3 أطفال عندهم حسابات دخول
--   • 4 اشتراكات باسم طفل، منها 3 للطفل حساب
--   • **وفي صفر منها المشتري = حساب الطفل**
--   • 3 مستندات: اتنين صاحبهم حساب طفل
--   • `instructor_students()` لسه زي ملف 70
--
-- يعني العطل **واقع دلوقتي على الإنتاج**، مش احتمالًا.
--
-- ── السبب الجذري ────────────────────────────────────────────
--
-- `child_profiles.account_profile_id` (حساب دخول الطفل) اتضاف في
-- ملفَي 73 و75. و`instructor_teaches` اتكتبت في ملف **45** — قبله
-- بكتير — فهي بتعرف رقمين بس:
--
--     cs.user_id            → المشتري
--     c.user_profile_id     → ولي الأمر
--
-- ومعرفش الرقم التالت خالص. لكن `portfolio_documents.student_id`
-- بيتكتب بالرقم التالت بالظبط: لوحة الطالب بتحفظ باسم حساب الطالب.
--
-- **فالعطل في طبقتين مستقلتين، والاتنين على نفس المعرّف:**
--
--   ١. الصلاحيات: سياسة `Instructors read their own students
--      documents` شرطها `instructor_teaches(student_id)` — وبترجع
--      false لمستند الطفل، فالمدرب **ممنوع** منه.
--   ٢. الكود: `instructor_students()` بترجّع `user_ref` = المشتري،
--      والصفحة بتسأل بيه — **فبتسأل بالرقم الغلط أصلًا.**
--
-- ولأن الاتنين بيرجّعوا **فاضي مش خطأ**، الصفحة بتقول «لا توجد
-- مستندات» ومحدش واخد باله (قاعدة «ك»).
--
-- ── اللي بيتغيّر هنا — أربع خطوات ───────────────────────────
--
--   ١. `instructor_teaches` تعرف حساب دخول الطفل (سطر واحد)
--   ٢. دالة `guardian_of_student` جديدة
--   ٣. سياسة قراءة لولي الأمر على معرض أعمال ابنه
--   ٤. `instructor_students()` ترجّع رقم **صاحب المستندات**
--
-- ── نطاق التأثير — بصراحة ───────────────────────────────────
--
-- ⚠️ `instructor_teaches` مستعملة في **تلات أماكن** مش واحد، وتوسيعها
--    بيوسّعهم كلهم:
--
--      • سياسة قراءة معرض الأعمال    ← ده المقصود
--      • سياسة تصحيح معرض الأعمال    ← ده المقصود (المدرب يعلّق)
--      • `can_see_profile`            ← **أثر جانبي مقصود**
--
--    التالت معناه إن المدرب هيقدر يشوف **اسم** حساب الطفل اللي
--    بيدرّسه. وده صح: المدرب لازم يعرف اسم طالبه. بس بقوله صراحةً
--    عشان مايبقاش مفاجأة.
--
--    والتوسيع **مضبوط**: الشرط بيمر على جلسات المدرب نفسه، فمفيش
--    مدرب هيشوف طفلًا مالوش جلسة معاه.
--
-- ⚠️ **الترتيب مفيهوش خطر:** الملف ده بيضيف عمودًا للدالة ومبيشيلش
--    حاجة، والكود المنشور دلوقتي بيقرا `user_ref` وهيفضل يلاقيه.
--    يعني شغّله دلوقتي، وادفع الكود بعده وقت ما تحب — مفيش لحظة كسر.
-- ============================================================

BEGIN;

-- ── ١) المدرب يعرف حساب دخول الطفل ─────────────────────────
--
-- ⚠️ التوقيع ما اتغيّرش، فدي **استبدال حقيقي** مش نسخة تانية —
--    والصلاحيات القايمة بتفضل زي ما هي (قاعدة «س»).
--
-- السطر الجديد هو `c.account_profile_id::text = p_student` وحده.
-- الباقي منسوخ حرفيًا من ملف 45.

CREATE OR REPLACE FUNCTION public.instructor_teaches(p_student text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM sessions s
    JOIN instructors i           ON i.id  = s.instructor_id
    JOIN course_subscriptions cs ON cs.id = s.course_subscription_id
    LEFT JOIN child_profiles c   ON c.id  = cs.child_id
    WHERE i.user_id = auth.uid()
      AND (
        cs.user_id::text           = p_student
        OR c.user_profile_id::text = p_student
        -- الجديد: حساب دخول الطفل — وهو صاحب مستندات المعرض.
        OR NULLIF(btrim(coalesce(c.account_profile_id, '')), '') = p_student
      )
  )
  OR EXISTS (
    SELECT 1
    FROM bookings b
    JOIN instructors i ON i.id = b.instructor_id
    WHERE i.user_id = auth.uid()
      AND b.independent_participant_id = p_student
  );
$function$;

COMMENT ON FUNCTION public.instructor_teaches(text) IS
  'هل المدرب الداخل دلوقتي بيدرّس صاحب الرقم ده؟ بيقبل تلات أرقام: المشتري، ولي الأمر، وحساب دخول الطفل (ملف 89).';


-- ── ٢) ولي الأمر وابنه ─────────────────────────────────────
--
-- ⚠️ `SECURITY DEFINER` ضرورية: الشرط بيقرا `child_profiles`،
--    والدالة بتتنادى **جوّه سياسة** على جدول تاني. لو بقت
--    `INVOKER` هتخضع لصلاحيات القارئ وترجّع false في حالات
--    مشروعة — وقاعدة «ك» بتقول إن ده بيعدّي صامتًا.
--
-- ولاحظ إنها بترجّع **boolean** لا صفوفًا: مفيش أي عمود من
-- `child_profiles` بيطلع منها، فمفيش انكشاف (قاعدة «ب»).

CREATE OR REPLACE FUNCTION public.guardian_of_student(p_student text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM child_profiles c
    WHERE c.user_profile_id = auth.uid()
      AND NULLIF(btrim(coalesce(c.account_profile_id, '')), '') = p_student
  );
$function$;

COMMENT ON FUNCTION public.guardian_of_student(text) IS
  'هل الداخل دلوقتي ولي أمر صاحب حساب الطالب ده؟ للقراءة بس — ولي الأمر مش بيكتب في معرض ابنه.';

-- الزائر ملوش أي علاقة بالدالة دي.
REVOKE ALL ON FUNCTION public.guardian_of_student(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.guardian_of_student(text) TO authenticated;


-- ── ٣) ولي الأمر يقرا معرض ابنه ────────────────────────────
--
-- ⚠️ قراءة **بس**. مفيش `INSERT` ولا `UPDATE`: المعرض مساحة الطفل،
--    وولي الأمر بيتابع مايكتبش فيها. ولو احتاج يعلّق يومًا، ده
--    عمود جديد وحقل ظاهر، مش توسيع السياسة دي.
--
-- ⚠️ وقاعدة «أ»: السياسات بتتجمع بـ«أو». السياسة دي **بتزوّد**
--    حالة واحدة مضبوطة، ومبتلغيش حاجة — والشرط بيمر على دالة
--    واحدة يسهل مراجعتها.

DROP POLICY IF EXISTS "Guardians read their dependents documents"
  ON public.portfolio_documents;

CREATE POLICY "Guardians read their dependents documents"
  ON public.portfolio_documents
  FOR SELECT
  TO authenticated
  USING (public.guardian_of_student(student_id::text));


-- ── ٤) الدالة ترجّع رقم صاحب المستندات ─────────────────────
--
-- ⚠️ **لازم `DROP` قبل `CREATE`** (قاعدة «س»): إضافة عمود بتغيّر
--    نوع الإرجاع، و`CREATE OR REPLACE` بترفض تغيير نوع الإرجاع
--    برسالة `cannot change return type of existing function`.
--
--    والـ`DROP` بيخلّيها **دالة جديدة** في نظر Supabase، فبيمنح
--    `anon` تنفيذها تلقائيًا — عشان كده الـ`REVOKE` تحت مش زيادة.

DROP FUNCTION IF EXISTS public.instructor_students();

CREATE FUNCTION public.instructor_students()
RETURNS TABLE (
  subscription_id     text,
  user_ref            text,
  child_ref           text,
  -- الجديد: الرقم اللي `portfolio_documents.student_id` بيساويه.
  -- حساب دخول الطفل لو موجود، وإلا المشتري نفسه (اشتراك لشخص بالغ).
  documents_ref       text,
  participant_name    text,
  package_name        text,
  sessions_total      integer,
  sessions_completed  integer,
  subscription_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    cs.id::text,
    cs.user_id::text,
    ch.id::text,
    COALESCE(
      NULLIF(btrim(coalesce(ch.account_profile_id, '')), ''),
      cs.user_id::text
    ),
    COALESCE(ch.full_name, up.full_name, 'مشارك غير معروف'),
    COALESCE(p.name, 'باقة محذوفة'),
    -- عدد جلسات الباقة هو المرجع. لو لسه ما اتولّدتش، التقدم بيبقى
    -- «0 / 12» بدل ما الطالب يختفي من القايمة.
    COALESCE(p.sessions_count, count(s.id))::integer,
    count(s.id) FILTER (WHERE s.status = 'completed')::integer,
    cs.status::text
  FROM course_subscriptions cs
  JOIN instructors i
    ON i.user_id = auth.uid()
   AND (
        i.id = cs.preferred_instructor_id
        OR EXISTS (
          SELECT 1 FROM sessions s2
          WHERE s2.course_subscription_id = cs.id
            AND s2.instructor_id = i.id
        )
       )
  LEFT JOIN sessions s
    ON s.course_subscription_id = cs.id
   AND s.instructor_id = i.id
  LEFT JOIN child_profiles ch           ON ch.id = cs.child_id
  LEFT JOIN user_profiles up            ON up.id = cs.user_id
  LEFT JOIN creative_writing_packages p ON p.id = cs.package_id
  GROUP BY cs.id, cs.user_id, cs.status, ch.id, ch.full_name,
           ch.account_profile_id, up.full_name, p.name, p.sessions_count;
$function$;

COMMENT ON FUNCTION public.instructor_students() IS
  'طلاب المدرب الداخل. documents_ref = صاحب مستندات المعرض: حساب دخول الطفل لو موجود، وإلا المشتري (ملف 89).';

REVOKE ALL ON FUNCTION public.instructor_students() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.instructor_students() TO authenticated;

COMMIT;

-- ============================================================
-- استعلام التأكيد — واحد
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- ١) الدوال التلاتة موجودة وبإعدادات صح
  SELECT
    '1. الدوال'::text AS القسم,
    p.proname::text    AS البند,
    ((CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END)
      || '  ·  search_path: '
      || COALESCE(array_to_string(p.proconfig, ', '), '(غير مضبوط)'))::text AS التفاصيل,
    CASE WHEN p.prosecdef AND p.proconfig IS NOT NULL
         THEN '✓ سليمة' ELSE '✗ راجع' END AS الحالة
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('instructor_teaches', 'guardian_of_student', 'instructor_students')

  UNION ALL

  -- ٢) نسخة واحدة من كل دالة — قاعدة «س»
  SELECT
    '2. عدد النسخ',
    p.proname::text,
    'نسخ: ' || count(*)::text
      || '  ·  أعداد الباراميترات: '
      || string_agg(p.pronargs::text, ' / ' ORDER BY p.pronargs),
    CASE WHEN count(*) = 1 THEN '✓ واحدة'
         ELSE '✗ تحميل زائد — التباس' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('instructor_teaches', 'guardian_of_student', 'instructor_students')
  GROUP BY p.proname

  UNION ALL

  -- ٣) المدرب بقى يعرف حساب دخول الطفل
  SELECT
    '3. المعرّف التالت',
    'instructor_teaches',
    'بتذكر account_profile_id: '
      || CASE WHEN pg_get_functiondef(p.oid) LIKE '%account_profile_id%'
              THEN 'نعم' ELSE 'لأ' END,
    CASE WHEN pg_get_functiondef(p.oid) LIKE '%account_profile_id%'
         THEN '✓ اتوسّعت' ELSE '✗ لسه القديمة' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'instructor_teaches'

  UNION ALL

  -- ٤) عمود صاحب المستندات رجع فعلًا
  SELECT
    '4. عمود المستندات',
    'instructor_students',
    'documents_ref في التوقيع: '
      || CASE WHEN pg_get_function_result(p.oid) LIKE '%documents_ref%'
              THEN 'نعم' ELSE 'لأ' END,
    CASE WHEN pg_get_function_result(p.oid) LIKE '%documents_ref%'
         THEN '✓ اتضاف' ELSE '✗ ناقص' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'instructor_students'

  UNION ALL

  -- ٥) الصلاحيات: الزائر ممنوع من الدالتين الجديدتين
  SELECT
    '5. الصلاحيات',
    p.proname::text,
    'anon: ' || CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE')
                     THEN 'نعم' ELSE 'لأ' END
    || '  ·  authenticated: ' || CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE')
                     THEN 'نعم' ELSE 'لأ' END,
    CASE
      WHEN NOT has_function_privilege('anon', p.oid, 'EXECUTE')
       AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
        THEN '✓ الزائر ممنوع'
      ELSE '✗ راجع'
    END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('guardian_of_student', 'instructor_students')

  UNION ALL

  -- ٦) سياسات المعرض بعد الإضافة
  SELECT
    '6. سياسات المعرض',
    p.policyname::text,
    (p.cmd || '  ·  ' || COALESCE(p.qual, p.with_check, '—'))::text,
    CASE
      WHEN p.cmd = 'SELECT' AND btrim(lower(coalesce(p.qual,''))) IN ('true','(true)')
        THEN '⚠️ قراءة مفتوحة'
      ELSE '✓'
    END
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'portfolio_documents'

  UNION ALL

  -- ٧) الأثر العملي: كام مستند بقى ليه صاحب معروف
  SELECT
    '7. الأثر',
    'ربط المستندات',
    'مستندات صاحبها حساب طفل: '
      || (SELECT count(*)::text FROM portfolio_documents d
           WHERE EXISTS (SELECT 1 FROM child_profiles c
                          WHERE c.account_profile_id::text = d.student_id::text))
      || '  ·  منها لأطفال عندهم ولي أمر: '
      || (SELECT count(*)::text FROM portfolio_documents d
           WHERE EXISTS (SELECT 1 FROM child_profiles c
                          WHERE c.account_profile_id::text = d.student_id::text
                            AND c.user_profile_id IS NOT NULL)),
    'للمراجعة'

) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع
-- ============================================================
--
-- ⚠️ التراجع بيرجّع العطل: المدرب يفقد شغل طلابه التابعين تاني.
--    متعملوش إلا لو ظهرت مشكلة أكبر.
--
-- BEGIN;
--
-- DROP POLICY IF EXISTS "Guardians read their dependents documents"
--   ON public.portfolio_documents;
-- DROP FUNCTION IF EXISTS public.guardian_of_student(text);
--
-- -- و`instructor_teaches` ترجع لنسخة ملف 45 (بلا السطر الجديد)،
-- -- و`instructor_students()` لنسخة ملف 70 (بلا documents_ref) —
-- -- بـDROP ثم CREATE، مش CREATE OR REPLACE.
--
-- COMMIT;
-- ============================================================
