-- ============================================================
-- 70 — وصول المدرب لبيانات طلابه، بلا بيانات الدفع
-- ============================================================
--
-- المشكلة (تشخيص ملف 69 على القاعدة الحقيقية):
--
--   `sessions` عليها سياسة فيها فرع للمدرب — عشان كده الجلسات ظاهرة.
--   لكن `course_subscriptions` عليها سياستين قراءة بس: الإدارة، وصاحب
--   الحساب. و`child_profiles` سياسة واحدة: ولي الأمر والإدارة.
--   **مفيش المدرب في أي منهم.**
--
--   فالمدرب بيشوف الجلسة ومش بيشوف الاشتراك اللي وراها. ومن غير
--   الاشتراك مفيش `user_id` ولا `child_id`، يعني مفيش اسم — ومن هنا
--   الأربع أعراض مرة واحدة:
--     «مشارك غير معروف» · «الطالب #» · «طلابي» فاضية ·
--     «الطلاب الحاليين: 1» (وهي مش طالب، دي قيمة 'unknown' متكررة)
--
-- ── ليه دالة مش سياسة ───────────────────────────────────────
--
--   الحل السهل سياسة قراءة على `course_subscriptions` للمدرب. بس
--   **الصلاحيات بتحمي الصفوف لا الأعمدة** (قاعدة «ب» في قواعد العمل):
--   السياسة دي كانت هتدّي المدرب الصف كله، وفيه `payment_receipt_url`
--   — صورة إيصال التحويل البنكي لولي الأمر — و`amount` و`payment_method`
--   و`payment_reference`. ومفيش طريقة في السياسات تدّيه عمودين وتمنع
--   الباقي.
--
--   والمدرب محتاج أربع حاجات بس: مين المشارك، الباقة، الحالة، التقدم.
--
--   فالدالتين دول بيرجّعوا الأربعة دول **وبس**. بيانات الدفع مفيش
--   طريق ليها من هنا خالص، ولا سياسة اتفتحت على أي جدول.
--
-- ── ليه SECURITY DEFINER ────────────────────────────────────
--
--   عشان الدالة تقرا الجداول المقفولة. والحارس هو الشرط
--   `i.user_id = auth.uid()` جوّه الدالة: المدرب بيشوف طلابه هو بس،
--   وزائر غير مسجّل `auth.uid()` بتاعته فاضية فبياخد صفر صفوف.
--
--   وكمان بتتجنّب مصيدة تانية: سياسة `sessions` بتقرا من
--   `course_subscriptions`. لو حطينا على `course_subscriptions` سياسة
--   بتقرا من `sessions`، ده تكرار متبادل بين سياستين — Postgres بيقع
--   بـ«infinite recursion detected in policy». الدالة بتعدّي على ده
--   لأنها بتتخطّى السياسات أصلًا.
--
-- ── ملاحظة على الأنواع ──────────────────────────────────────
--
--   كل المعرّفات بتتحوّل `::text` عن قصد. `src/types/supabase.ts` بيكتب
--   `uuid` و`text` الاتنين `string`، فنوع العمود **ما بيتعرفش منه**
--   (قاعدة «ج»). التحويل لنص بيشتغل مع الاتنين.
--
-- **مفيش صف بيتغيّر، ومفيش سياسة بتتضاف أو تتشال.** إضافة دالتين بس.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) جلسات المدرب، ومعاها اسم المشارك واسم الباقة
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.instructor_sessions()
RETURNS TABLE (
  session_id        text,
  session_number    integer,
  scheduled_at      timestamptz,
  status            text,
  meeting_url       text,
  subscription_id   text,
  participant_name  text,
  package_name      text,
  package_id        text,
  user_ref          text,
  child_ref         text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    s.id::text,
    s.session_number::integer,
    s.scheduled_at,
    s.status::text,
    s.meeting_url,
    cs.id::text,
    -- الطفل أولًا: وجوده معناه إن الحجز ليه هو مش لصاحب الحساب.
    -- الكود كان بيبص على صاحب الحساب الأول، فحجز لابن كان بيرجع اسم
    -- ولي الأمر.
    COALESCE(ch.full_name, up.full_name, 'مشارك غير معروف'),
    COALESCE(p.name, 'باقة محذوفة'),
    cs.package_id::text,
    cs.user_id::text,
    ch.id::text
  FROM sessions s
  JOIN instructors i
    ON i.id = s.instructor_id
   AND i.user_id = auth.uid()
  JOIN course_subscriptions cs       ON cs.id = s.course_subscription_id
  LEFT JOIN child_profiles ch        ON ch.id = cs.child_id
  LEFT JOIN user_profiles up         ON up.id = cs.user_id
  LEFT JOIN creative_writing_packages p ON p.id = cs.package_id
  ORDER BY s.scheduled_at;
$function$;

-- ------------------------------------------------------------
-- 2) طلاب المدرب، ومعاهم التقدم
--
--    «طالب المدرب» = اشتراك مربوط بيه: إما هو المدرب المفضّل عليه،
--    أو عنده جلسات مسنَدة له فيه. الاتنين لأن الإدارة ممكن تعيّنه على
--    الجلسات من غير ما يكون المفضّل.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.instructor_students()
RETURNS TABLE (
  subscription_id     text,
  user_ref            text,
  child_ref           text,
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
           up.full_name, p.name, p.sessions_count;
$function$;

-- ------------------------------------------------------------
-- الصلاحيات: المسجّلين بس، ومحدش غيرهم
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION public.instructor_sessions() FROM public;
REVOKE ALL ON FUNCTION public.instructor_students() FROM public;
GRANT EXECUTE ON FUNCTION public.instructor_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.instructor_students() TO authenticated;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
--
-- ملاحظة: الدالتين بيرجّعوا صفر صفوف هنا لأن محرر SQL بيشتغل بلا
-- `auth.uid()`. التأكيد ده على **وجودها وصلاحياتها**، والتجربة
-- الحقيقية من لوحة المدرب في الموقع.
-- ============================================================
SELECT
  p.proname                                        AS الدالة,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER ✓'
       ELSE '✗ INVOKER — غلط' END                  AS الوضع,
  CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE')
       THEN 'authenticated ✓' ELSE '✗ ناقصة' END   AS صلاحية_التنفيذ,
  CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE')
       THEN '⚠️ مفتوحة للزوار' ELSE 'الزوار ممنوعين ✓' END AS الزوار,
  CASE WHEN pg_get_functiondef(p.oid) ILIKE '%payment_%'
         OR pg_get_functiondef(p.oid) ILIKE '%amount%'
       THEN '✗ بتلمس بيانات دفع — بلّغني'
       ELSE 'مفيش بيانات دفع ✓' END                AS بيانات_الدفع
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('instructor_sessions', 'instructor_students')
ORDER BY p.proname;

-- ============================================================
-- التراجع — شيل علامات التعليق وشغّل لو عايز تلغي الملف ده
-- ============================================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.instructor_sessions();
-- DROP FUNCTION IF EXISTS public.instructor_students();
-- COMMIT;
