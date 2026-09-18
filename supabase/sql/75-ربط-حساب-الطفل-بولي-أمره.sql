-- ============================================================
-- 75 — ربط حساب الطفل بولي أمره (إصلاح حارس بيفشل مفتوحًا)
-- ============================================================
--
-- ⚠️ **العطل ده أخطر من غياب الحماية أصلًا**، لأن الحارس كان شكله
--    شغّال وهو ما اشتغلش ولا مرة.
--
-- ── إيه اللي حصل ────────────────────────────────────────────
--
--   قفلنا الشراء على حسابات الأبناء بـ`requireNotDependent` في
--   `lib/auth-guard.ts`. الدالة دي بتعرف إن الحساب تابع عن طريق:
--
--       SELECT ... FROM child_profiles WHERE account_profile_id = <الحساب>
--
--   لكن صلاحيات `child_profiles` سياستها واحدة:
--
--       (auth.uid() = user_profile_id) OR is_admin()
--
--   يعني **ولي الأمر والإدارة وبس**. الطفل لما بيقرا الجدول بياخد صفر
--   صفوف — مش خطأ، صفر صفوف.
--
--   فالدالة بترجّع `null`، والحارس بيفهم إن «ده مش حساب تابع»
--   **ويعدّيه**. الطفل كمّل طلبًا متكاملًا (ALR-000013-EZ) والحارس
--   موجود في الكود.
--
--   ونفس السبب خلّى زرار «اطلب من ولي أمرك» ما يظهرش: `isDependent`
--   طلعت `false`، فشاف زرار الشراء العادي.
--
-- ── ليه دالة مش سياسة قراءة ─────────────────────────────────
--
--   ممكن نضيف سياسة تخلّي الطفل يقرا صفه في `child_profiles`. بس
--   الصف ده فيه `birth_date` و`gender` وبيانات إخوته لو وسّعنا
--   السياسة غلط — والصلاحيات بتحمي الصفوف لا الأعمدة (قاعدة «ب»).
--
--   الدالة بترجّع تلات حاجات بس: معرّف صف العائلة، ومعرّف ولي الأمر،
--   واسم الطفل. وده كل اللي الحارس محتاجه.
--
--   ونفس النمط المعتمد في المشروع من ملفات 70 و73 و74: لما دور يحتاج
--   بيانات من جدول فيه أعمدة حسّاسة، دالة `SECURITY DEFINER` بترجّع
--   المطلوب — مش سياسة على الصف كله.
--
-- **مفيش صف بيتغيّر ومفيش سياسة بتتضاف.** دالة واحدة.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.my_dependent_link()
RETURNS TABLE (
  child_profile_id     text,
  guardian_profile_id  uuid,
  full_name            text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    c.id::text,
    c.user_profile_id,
    c.full_name
  FROM child_profiles c
  WHERE c.account_profile_id = (auth.uid())::text
  LIMIT 1;
$function$;

COMMENT ON FUNCTION public.my_dependent_link() IS
  'الداخل دلوقتي حساب طفل تابع؟ بترجّع صف عائلته وولي أمره، أو صفر صفوف. بتتخطى صلاحيات child_profiles عن قصد — الطفل ممنوع من قراءة الجدول ده.';

REVOKE ALL ON FUNCTION public.my_dependent_link() FROM public;
REVOKE EXECUTE ON FUNCTION public.my_dependent_link() FROM anon;
GRANT EXECUTE ON FUNCTION public.my_dependent_link() TO authenticated;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
--
-- بيوري كل حساب طفل مربوط، وهل `my_dependent_link` هتلاقيه.
-- الدالة نفسها بترجّع صفر هنا لأن المحرر بيشتغل بلا `auth.uid()` —
-- التأكيد على وجودها وصلاحياتها، والتجربة الحقيقية من الموقع.
-- ============================================================
SELECT القسم, البند, النتيجة FROM (
  SELECT '1. الدالة'::text AS القسم, 'my_dependent_link'::text AS البند,
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname='public' AND p.proname='my_dependent_link' AND p.prosecdef
         ) THEN 'موجودة و SECURITY DEFINER ✓' ELSE 'ناقصة ✗' END AS النتيجة
  UNION ALL
  SELECT '2. الزوار', 'my_dependent_link',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname='public' AND p.proname='my_dependent_link'
             AND has_function_privilege('anon', p.oid, 'EXECUTE')
         ) THEN '⚠️ مفتوحة للزوار' ELSE 'الزوار ممنوعين ✓' END
  UNION ALL
  SELECT '3. الحسابات المربوطة',
         COALESCE(c.full_name, '—'),
         'حساب: ' || COALESCE(left(c.account_profile_id, 8), '—')
           || ' · ولي الأمر: ' || COALESCE(left(c.user_profile_id::text, 8), '—')
  FROM child_profiles c
  WHERE c.account_profile_id IS NOT NULL
) t ORDER BY القسم, البند;

-- ============================================================
-- التراجع — شيل علامات التعليق وشغّل لو عايز تلغي الملف ده
--
-- ⚠️ التراجع بيرجّع الحارس لحالة «بيفشل مفتوحًا»: الطفل هيقدر يشتري.
-- ============================================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.my_dependent_link();
-- COMMIT;
