-- ============================================================
-- 33 — دالة الإشعارات تعرف مقدّم الخدمة المستقل
-- ============================================================
--
-- المشكلة:
--   دالة `notify_user` بتسمح بإرسال إشعار لو المُرسِل إداري، أو طرف في
--   طلب خدمة يجمعه بالمستلِم. لكن تعريف «طرف» مكتوب كده:
--
--       LEFT JOIN instructors i ON i.id = o.instructor_id
--       WHERE (o.buyer_profile_id = auth.uid()::text OR i.user_id = auth.uid())
--
--   يعني الطرف التاني **لازم يكون مدرب**. مقدّم الخدمة المستقل مش مدرب،
--   فالدالة بترفض:
--     • لما يبعت رسالة لعميله.
--     • ولما العميل يبعتله — لأن المستلِم نفسه مش بيتطابق مع الشرط.
--
--   دي نفس ثغرة «المدرب فقط» اللي كانت في عمود الطلب، بس في مكان تاني.
--
-- الحل:
--   نفس الدالة بالظبط، مع توسيع تعريف «طرف في الطلب» ليشمل:
--     • مقدّم خدمة مستقل (service_providers.user_id)
--     • مدرب موصول من خلال صف المقدّم (service_providers.instructor_id)
--   والمسار القديم عن طريق instructor_id بيفضل شغّال زي ما هو.
--
-- اللي **ما اتغيّرش**، عن قصد:
--   الدالة لسه بترفض الاستدعاء اللي مالوش مستخدم مسجّل دخوله. فكّرت
--   أوسّعها عشان المهمة اليومية تقدر تبعت، وقررت لأ: ده كان هيفتح باب
--   إرسال إشعارات لأي حد من غير هوية. المهمة اليومية بتكتب في جدول
--   الإشعارات مباشرة بمفتاح الخدمة — وده مفتاح بيتخطى الحماية بحكم
--   طبيعته وبيتحمي بسرّ الجدولة.
--
-- الملف ده بيستبدل الدالة بس. مفيش جدول ولا عمود ولا صف بيتغيّر.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.notify_user(
  p_recipient text,
  p_title     text,
  p_message   text DEFAULT NULL::text,
  p_link      text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_recipient IS NULL OR length(trim(p_title)) = 0 THEN
    RAISE EXCEPTION 'notification needs a recipient and a title';
  END IF;

  -- المسموح لهم بإرسال إشعار: الإدارة، أو طرف في طلب خدمة يجمعه
  -- بالمستلِم. و«طرف» = المشتري، أو مقدّم الخدمة أيًّا كان نوعه.
  IF NOT (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM service_orders o
      LEFT JOIN instructors        i   ON i.id   = o.instructor_id
      LEFT JOIN service_providers  sp  ON sp.id  = o.provider_id
      LEFT JOIN instructors        spi ON spi.id = sp.instructor_id
      WHERE (
              o.buyer_profile_id = auth.uid()::text
              OR i.user_id   = auth.uid()
              OR sp.user_id  = auth.uid()
              OR spi.user_id = auth.uid()
            )
        AND (
              o.buyer_profile_id   = p_recipient
              OR i.user_id::text   = p_recipient
              OR sp.user_id::text  = p_recipient
              OR spi.user_id::text = p_recipient
            )
    )
  ) THEN
    RAISE EXCEPTION 'not allowed to notify this user';
  END IF;

  INSERT INTO notifications (recipient_profile_id, title, message, link)
  VALUES (p_recipient, trim(p_title), NULLIF(trim(coalesce(p_message, '')), ''), p_link);
END
$function$;

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  p.proname AS الدالة,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER ✗' END AS النوع,
  CASE WHEN pg_get_functiondef(p.oid) LIKE '%service_providers%'
       THEN 'تعرف مقدّم الخدمة ✓'
       ELSE 'لسه المدرب فقط ✗' END AS النتيجة,
  CASE WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%'
       THEN 'search_path مثبّت ✓' ELSE 'search_path غير مثبّت ✗' END AS الأمان
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'notify_user';
