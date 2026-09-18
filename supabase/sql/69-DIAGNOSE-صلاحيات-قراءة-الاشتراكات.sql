-- ============================================================
-- 69 — تشخيص: مين يقدر يقرا الاشتراكات وبيانات المشارك (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيغيّرش حاجة**. قراءة فقط.
--
-- الأعراض:
--   • لوحة المدرب: «جلسة 1 مع **مشارك غير معروف**»
--   • تفاصيل الجلسة: «مع **الطالب #**»
--   • تبويب «طلابي»: **فاضي تمامًا**
--   • «الطلاب الحاليين: 1» — مع إن الجلسات كلها لطالب واحد
--
-- التشخيص المرجّح:
--
--   الرقم «1» في عدّاد الطلاب هو الدليل. العدّاد بيحسب القيم المختلفة
--   لـ`userId`، والكود بيحط `'unknown'` لما الاشتراك المرتبط بالجلسة
--   يرجع فاضي. فـ«1» معناها قيمة `'unknown'` واحدة متكررة — مش طالب.
--
--   يعني `sessions → course_subscriptions` بيرجع **فاضي للمدرب**.
--   والجلسة نفسها بيشوفها (12 جلسة ظاهرة)، فالمنع على
--   `course_subscriptions` مش على `sessions`.
--
--   ومن غير الاشتراك مفيش `user_id` ولا `child_id`، فمفيش اسم أصلًا —
--   ودي كل الأعراض الأربعة مرة واحدة.
--
-- ⚠️ ملاحظة على النسخة الأولى من الملف ده: كانت فيها تلات استعلامات
--    منفصلة، ومحرر Supabase بيعرض نتيجة الأخير بس (قاعدة «ز» في
--    `قواعد-العمل.md`). اتجمّعوا في استعلام واحد.
-- ============================================================

WITH

-- 1) سياسات القراءة على الجداول المعنية.
--    فاكر إن السياسات بتتجمع بـ«أو»: وجود سياسة مضبوطة لا يعني إن
--    الجدول محمي، وغيابها معناه إن محدش يقرا غير اللي سياسة تانية
--    بتسمح له.
policies AS (
  SELECT
    '1. السياسات'::text AS القسم,
    c.relname || ' · ' || p.polname AS البند,
    left(COALESCE(pg_get_expr(p.polqual, p.polrelid), '—'), 110) AS التفاصيل,
    CASE
      WHEN pg_get_expr(p.polqual, p.polrelid) = 'true' THEN '⚠️ مفتوحة للكل'
      WHEN pg_get_expr(p.polqual, p.polrelid) ILIKE '%instructor%' THEN '✓ بتذكر المدرب'
      ELSE 'مضبوطة — مش للمدرب'
    END AS النتيجة
  FROM pg_policy p
  JOIN pg_class c ON c.oid = p.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname IN ('course_subscriptions', 'sessions', 'child_profiles', 'user_profiles')
    AND p.polcmd IN ('r', '*')
),

-- 2) الخلاصة: هل للمدرب طريق أصلًا؟ ده السطر اللي بيحسم التشخيص.
verdict AS (
  SELECT
    '2. الخلاصة'::text,
    t.relname,
    COALESCE(x.عدد, 0)::text || ' سياسة قراءة',
    CASE
      WHEN COALESCE(x.عدد, 0) = 0 THEN '✗ **مفيش أي سياسة قراءة** — الجدول مقفول'
      WHEN x.فيها_مدرب            THEN '✓ فيه طريق للمدرب'
      ELSE '✗ **مفيش سياسة تسمح للمدرب** — ده سبب العطل'
    END
  FROM (VALUES ('course_subscriptions'), ('child_profiles')) AS t(relname)
  LEFT JOIN (
    SELECT
      c.relname,
      count(*) AS عدد,
      bool_or(pg_get_expr(p.polqual, p.polrelid) ILIKE '%instructor%'
              OR pg_get_expr(p.polqual, p.polrelid) = 'true') AS فيها_مدرب
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('course_subscriptions', 'child_profiles')
      AND p.polcmd IN ('r', '*')
    GROUP BY c.relname
  ) x ON x.relname = t.relname
),

-- 3) هل الحماية مفعّلة على الجدول أصلًا؟ جدول بلا RLS مفتوح للكل،
--    وجدول بـRLS وبلا سياسات مقفول على الكل.
rls AS (
  SELECT
    '3. حالة الحماية'::text,
    c.relname,
    CASE WHEN c.relrowsecurity THEN 'RLS مفعّلة' ELSE 'RLS مطفية' END,
    CASE WHEN c.relrowsecurity THEN 'محمي — السياسات هي اللي بتحدد'
         ELSE '⚠️ مفتوح للكل' END
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname IN ('course_subscriptions', 'sessions', 'child_profiles', 'user_profiles')
),

-- 4) الدوال اللي السياسات بتعتمد عليها.
fns AS (
  SELECT
    '4. الدوال'::text,
    p.proname::text,
    pg_get_function_identity_arguments(p.oid),
    CASE WHEN p.prosecdef THEN 'SECURITY DEFINER ✓' ELSE '⚠️ INVOKER' END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('instructor_teaches', 'can_see_profile', 'is_admin', 'is_instructor')
)

SELECT القسم, البند, التفاصيل, النتيجة FROM policies
UNION ALL SELECT * FROM verdict
UNION ALL SELECT * FROM rls
UNION ALL SELECT * FROM fns
ORDER BY 1, 2;
