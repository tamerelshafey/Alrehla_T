-- ============================================================
-- 54 — تضييق قراءة جدول المستخدمين (المرحلة الأولى: التحضير)
-- ============================================================
--
-- المشكلة:
--   على `user_profiles` سياستين قراءة:
--       "Users can view their own profile"  USING (auth.uid() = id)
--       "Profiles are viewable by everyone" USING (true)   ← بتلغي اللي فوقها
--
--   والسياسات بتتجمع بـ«أو»، فالنتيجة إن أي زائر — من غير تسجيل دخول —
--   يقدر يسحب **قايمة بكل مستخدمين المنصة** بأسمائهم وأدوارهم، ويعرف
--   مين الإداريين. ودي أول خطوة في أي محاولة اختراق جادة.
--
-- ليه مش ممكن نشيلها وخلاص:
--   فيه قراءات مشروعة لأسماء ناس تانية:
--     • اسم كاتب المراجعة الظاهرة على صفحات المدربين والخدمات — بيتقرا
--       حتى من زائر مش مسجّل.
--     • أسماء أطراف المحادثة في طلبات الخدمات (المشتري ↔ المقدّم).
--     • أسماء الطلاب عند مدربهم، واسم المدرب عند طالبه.
--   لو شلنا السياسة العامة من غير بديل، التلاتة دول بيفضوا.
--
-- الحل:
--   دالة بتحدد «مين اسمه يبان لمين»، وسياسة مبنية عليها. الاسم بيبان لو:
--     1. صاحب الحساب نفسه.
--     2. الإدارة.
--     3. صاحبه مدرب أو مقدّم خدمة — أسماؤهم معروضة على الموقع أصلًا.
--     4. صاحبه كاتب مراجعة **ظاهرة** (مش مخفية).
--     5. بينكم طلب خدمة يجمعكم (مشتري ومقدّم).
--     6. إنت مدربه (نفس تعريف «طلابي» اللي في ملف 45).
--
-- ⚠️ الملف ده **ما بيغيّرش أي سلوك**: بيضيف السياسة الجديدة جنب القديمة،
--    والقديمة لسه بتسمح بكل حاجة. ده مقصود عشان تجرّب من غير مخاطرة.
--    ملف 55 هو اللي بيشيل القديمة — بعد ما تتأكد.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.can_see_profile(p_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    -- 1) نفسه
    p_id = auth.uid()
    -- 2) الإدارة
    OR public.is_admin()
    -- 3) مدرب أو مقدّم خدمة: اسمه معروض على الموقع أصلًا
    OR EXISTS (SELECT 1 FROM instructors i WHERE i.user_id = p_id)
    OR EXISTS (SELECT 1 FROM service_providers sp WHERE sp.user_id = p_id)
    -- 4) كاتب مراجعة ظاهرة
    OR EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.reviewer_profile_id = p_id::text AND r.is_hidden = false
    )
    -- 5) طرف معاك في طلب خدمة
    OR EXISTS (
      SELECT 1
      FROM service_orders o
      LEFT JOIN service_providers sp2 ON sp2.id = o.provider_id
      LEFT JOIN instructors i2        ON i2.id = o.instructor_id
      WHERE (
              -- إنت المشتري وهو المقدّم
              (o.buyer_profile_id = (auth.uid())::text
               AND (sp2.user_id = p_id OR i2.user_id = p_id))
              -- أو هو المشتري وإنت المقدّم
              OR (o.buyer_profile_id = p_id::text
                  AND (sp2.user_id = auth.uid() OR i2.user_id = auth.uid()))
            )
    )
    -- 6) إنت مدربه
    OR public.instructor_teaches(p_id::text);
$function$;

REVOKE ALL ON FUNCTION public.can_see_profile(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.can_see_profile(uuid) TO authenticated, anon;

DROP POLICY IF EXISTS "Profiles visible to those who need them" ON public.user_profiles;

CREATE POLICY "Profiles visible to those who need them"
  ON public.user_profiles
  FOR SELECT
  USING (public.can_see_profile(id));

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  p.polname AS السياسة,
  coalesce(pg_get_expr(p.polqual, p.polrelid), '—') AS الشرط,
  CASE WHEN pg_get_expr(p.polqual, p.polrelid) = 'true'
       THEN 'مفتوحة — هتتشال في ملف 55' ELSE 'مضبوطة ✓' END AS الحالة
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'user_profiles' AND p.polcmd = 'r'
ORDER BY p.polname;
