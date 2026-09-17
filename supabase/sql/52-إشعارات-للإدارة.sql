-- ============================================================
-- 52 — إشعارات توصل للإدارة
-- ============================================================
--
-- المشكلة:
--   دالة `notify_user` بتسمح بإرسال إشعار في حالتين بس: المُرسِل إداري،
--   أو طرف في طلب يجمعه بالمستلِم. والعميل اللي بيرفع إثبات دفع أو
--   بيطلب مراجعة **مش أي واحد فيهم بالنسبة للإدارة** — فالإشعار
--   بيترفض، والإدارة ما بيوصلهاش حاجة.
--
--   يعني كل الإشعارات اللي «من وإلى الأدمن» ساقطة، وإنت بتكتشف الطلبات
--   بالدخول على الشاشات ومراجعتها بنفسك.
--
-- الحل:
--   دالة تانية `notify_admins` بتاخد **العنوان والرسالة بس** — من غير
--   مستلِم. هي اللي بتحدد المستلمين: كل حساب دوره مدير نظام أو مشرف عام.
--
--   ليه ده مش باب سبام: المُرسِل ما بيقدرش يختار مين يستقبل. أقصى حاجة
--   يعملها إنه يبعت للإدارة — واللي هي أصلًا الجهة اللي المفروض تعرف.
--   وبنشيل المسافات ونرفض العنوان الفاضي زي الدالة الأصلية.
--
-- مفيش جدول ولا عمود ولا صف بيتغيّر. دالة جديدة بس.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.notify_admins(
  p_title   text,
  p_message text DEFAULT NULL,
  p_link    text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'must be signed in';
  END IF;

  IF length(trim(coalesce(p_title, ''))) = 0 THEN
    RAISE EXCEPTION 'notification needs a title';
  END IF;

  INSERT INTO notifications (recipient_profile_id, title, message, link)
  SELECT
    u.id::text,
    trim(p_title),
    NULLIF(trim(coalesce(p_message, '')), ''),
    p_link
  FROM user_profiles u
  WHERE u.role IN ('super_admin', 'general_supervisor');

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END
$function$;

REVOKE ALL ON FUNCTION public.notify_admins(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.notify_admins(text, text, text) TO authenticated;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  p.proname AS الدالة,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER ✓' ELSE 'غير آمنة ✗' END AS النوع,
  CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE')
       THEN 'متاحة للمستخدم المسجّل ✓' ELSE 'مش متاحة ✗' END AS الصلاحية,
  (SELECT count(*)::text FROM user_profiles
    WHERE role IN ('super_admin','general_supervisor')) AS عدد_المستقبِلين
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'notify_admins';
