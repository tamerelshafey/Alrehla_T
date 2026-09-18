-- ============================================================
-- 73 — حساب دخول منفصل للطالب التابع
-- ============================================================
--
-- المطلوب: ولي الأمر يقدر يفتح لابنه (دون 12 سنة) حساب دخول منفصل
-- باسم وكلمة سر، والطفل يدخل بيه يشوف جلساته ومواده ويكتب في معرض
-- أعماله — **ومايشوفش أي فلوس ولا يشتري حاجة**. وولي الأمر يتابع كل ده
-- من حسابه هو.
--
-- ── المخطط الحالي ───────────────────────────────────────────
--
--   `child_profiles.user_profile_id` هو **معرّف ولي الأمر** لا الطفل
--   (سياسة الجدول: `auth.uid() = user_profile_id`). يعني مفيش مكان
--   أصلًا لحساب الطفل، فمحتاجين عمود مستقل.
--
-- ── العمود ──────────────────────────────────────────────────
--
--   `account_profile_id` — حساب الطفل نفسه، فاضي لما يكون مالوش حساب
--   (وده الوضع الطبيعي: الحساب اختياري). فريد عشان حساب واحد ما ينفعش
--   يبقى لطفلين.
--
-- ── ليه دالة للجلسات كمان ───────────────────────────────────
--
--   جلسات الطفل مربوطة باشتراك **صاحبه ولي الأمر**
--   (`course_subscriptions.user_id` = ولي الأمر، و`child_id` = الطفل).
--   فحساب الطفل مش هيشوف الاشتراك ولا الجلسات بالسياسات الحالية.
--
--   والحل مش سياسة قراءة على `course_subscriptions`: الصلاحيات بتحمي
--   الصفوف لا الأعمدة (قاعدة «ب»)، والسياسة كانت هتخلي **الطفل يشوف
--   إيصال تحويل أبوه والمبلغ**. نفس المصيدة اللي قابلتنا مع المدرب في
--   ملف 70، ونفس الحل: دالة بترجّع اللي يخصّه وبس.
--
--   والدالة بتخدم الحالتين: الطالب البالغ اللي حاجز لنفسه، والطفل
--   اللي حاجزله ولي أمره — من غير ما الكود يفرّق بينهم.
--
-- ⚠️ إنشاء الحساب نفسه بيتم من الخادم بمفتاح الخدمة
--    (`SUPABASE_SERVICE_ROLE_KEY`)، مش من الملف ده. الملف ده بيجهّز
--    المكان بس.
--
-- **مفيش صف بيتغيّر.** عمود جديد فاضي، ودالة جديدة.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) حساب الطفل على صف العائلة
-- ------------------------------------------------------------
ALTER TABLE public.child_profiles
  ADD COLUMN IF NOT EXISTS account_profile_id text;

COMMENT ON COLUMN public.child_profiles.account_profile_id IS
  'حساب الدخول الخاص بالطفل نفسه (user_profiles.id). فاضي = مالوش حساب. لاحظ أن user_profile_id هو ولي الأمر لا الطفل.';

-- حساب واحد لطفل واحد. الصفوف الفاضية مش داخلة في القيد.
CREATE UNIQUE INDEX IF NOT EXISTS child_profiles_account_unique
  ON public.child_profiles (account_profile_id)
  WHERE account_profile_id IS NOT NULL;

-- ------------------------------------------------------------
-- 2) جلسات المتعلّم — للبالغ وللطفل بنفس الدالة
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_sessions()
RETURNS TABLE (
  session_id      text,
  session_number  integer,
  scheduled_at    timestamptz,
  status          text,
  meeting_url     text,
  package_name    text,
  instructor_name text
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
    COALESCE(p.name, 'باقة محذوفة'),
    i.display_name
  FROM sessions s
  JOIN course_subscriptions cs ON cs.id = s.course_subscription_id
  LEFT JOIN child_profiles ch  ON ch.id = cs.child_id
  LEFT JOIN instructors i      ON i.id = s.instructor_id
  LEFT JOIN creative_writing_packages p ON p.id = cs.package_id
  WHERE
    -- حاجز لنفسه
    cs.user_id = auth.uid()
    -- أو الحجز لطفل، والداخل دلوقتي هو حساب الطفل ده
    OR ch.account_profile_id = (auth.uid())::text
  ORDER BY s.scheduled_at;
$function$;

REVOKE ALL ON FUNCTION public.student_sessions() FROM public;
REVOKE EXECUTE ON FUNCTION public.student_sessions() FROM anon;
GRANT EXECUTE ON FUNCTION public.student_sessions() TO authenticated;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT القسم, البند, النتيجة FROM (
  SELECT '1. العمود'::text AS القسم,
         'child_profiles.account_profile_id'::text AS البند,
         CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='child_profiles'
             AND column_name='account_profile_id'
         ) THEN 'موجود ✓' ELSE 'ناقص ✗' END AS النتيجة
  UNION ALL
  SELECT '2. الفهرس', 'child_profiles_account_unique',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes
           WHERE schemaname='public' AND tablename='child_profiles'
             AND indexname='child_profiles_account_unique'
         ) THEN 'موجود ✓' ELSE 'ناقص ✗' END
  UNION ALL
  SELECT '3. الدالة', 'student_sessions',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.proname='student_sessions'
         ) THEN 'موجودة ✓' ELSE 'ناقصة ✗' END
  UNION ALL
  SELECT '4. الزوار', 'student_sessions',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.proname='student_sessions'
             AND has_function_privilege('anon', p.oid, 'EXECUTE')
         ) THEN '⚠️ مفتوحة للزوار' ELSE 'الزوار ممنوعين ✓' END
  UNION ALL
  SELECT '5. بيانات الدفع', 'student_sessions',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.proname='student_sessions'
             AND (pg_get_functiondef(p.oid) ILIKE '%payment_%'
                  OR pg_get_functiondef(p.oid) ILIKE '%amount%')
         ) THEN '✗ بتلمس بيانات دفع — بلّغني' ELSE 'مفيش بيانات دفع ✓' END
) t ORDER BY القسم;

-- ============================================================
-- التراجع — شيل علامات التعليق وشغّل لو عايز تلغي الملف ده
--
-- ⚠️ حذف العمود بيفكّ ربط الحسابات بالأطفال. حسابات الدخول نفسها
--    بتفضل موجودة في Supabase Auth ولازم تتشال من هناك.
-- ============================================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.student_sessions();
-- DROP INDEX IF EXISTS public.child_profiles_account_unique;
-- ALTER TABLE public.child_profiles DROP COLUMN IF EXISTS account_profile_id;
-- COMMIT;
