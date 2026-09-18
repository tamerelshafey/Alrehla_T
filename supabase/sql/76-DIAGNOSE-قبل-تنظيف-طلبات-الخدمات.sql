-- ============================================================
-- 76 — تشخيص: طلبات الخدمات قبل التنظيف (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيمسحش حاجة**. قراءة فقط. شغّله قبل ملف 77.
--
-- المطلوب: مسح الطلب `ALR-000013-EZ` (اللي حساب الطفل عمله والحارس
-- كان بيفشل مفتوحًا)، ومعاه الطلبات التجريبية المتراكمة في لوحة
-- التحكم من التعديلات السابقة.
--
-- ⚠️ ليه تشخيص قبل الحذف:
--
--   الحذف من Postgres نهائي — مفيش سلة مهملات ولا تراجع. وطلب الخدمة
--   مربوط بيه محادثة (`service_order_messages`) وممكن تقييم
--   (`reviews.service_order_id`). فلازم نشوف الأعداد الحقيقية قبل ما
--   نقرر، مش نمسح ونكتشف بعدين.
--
--   وكمان: لو فيه طلب **مدفوع فعلًا** بين التجريبية، مسحه بيضيّع سجلًا
--   ماليًا. العمود «مدفوع؟» تحت بيوضّح ده.
-- ============================================================

SELECT القسم, البند, التفاصيل, الحالة FROM (

  -- 1) الطلبات واحدًا واحدًا
  SELECT
    '1. الطلبات'::text AS القسم,
    COALESCE(so.payment_reference, left(so.id, 8)) AS البند,
    COALESCE(ss.name, 'خدمة محذوفة')
      || ' · ' || so.status
      || ' · ' || so.amount::text || ' ج.م'
      || ' · ' || COALESCE(up.full_name, left(so.buyer_profile_id, 8)) AS التفاصيل,
    CASE
      WHEN so.status IN ('paid', 'in_progress', 'delivered', 'completed')
        THEN '⚠️ مدفوع — سجل مالي'
      WHEN so.status = 'awaiting_verification'
        THEN 'إيصال مرفوع لسه ما اتأكدش'
      ELSE 'مش مدفوع — آمن للمسح'
    END AS الحالة
  FROM public.service_orders so
  LEFT JOIN public.standalone_services ss ON ss.id = so.standalone_service_id
  LEFT JOIN public.user_profiles up ON up.id::text = so.buyer_profile_id

  UNION ALL

  -- 2) اللي معلّق على الطلبات
  SELECT '2. المرتبط بيهم', البند, العدد::text, ملاحظة
  FROM (
    SELECT 'رسائل المحادثة (service_order_messages)'::text AS البند,
           (SELECT count(*) FROM public.service_order_messages) AS العدد,
           'هتتمسح مع الطلبات'::text AS ملاحظة
    UNION ALL
    SELECT 'تقييمات مربوطة بطلب خدمة',
           (SELECT count(*) FROM public.reviews WHERE service_order_id IS NOT NULL),
           'محتاجة قرار مستقل'
  ) x

  UNION ALL

  -- 3) طلبات حساب الطفل تحديدًا
  SELECT
    '3. طلبات حسابات الأبناء',
    COALESCE(so.payment_reference, left(so.id, 8)),
    COALESCE(c.full_name, '—') || ' (حساب تابع)',
    '⚠️ اتعمل والحارس بيفشل مفتوحًا'
  FROM public.service_orders so
  JOIN public.child_profiles c
    ON c.account_profile_id = so.buyer_profile_id

  UNION ALL

  -- 4) خارج النطاق — للتوضيح إنها مش هتتلمس
  SELECT '4. خارج النطاق (آمنة)', البند, العدد::text, 'ما بتتلمسش'
  FROM (
    SELECT 'الخدمات (standalone_services)'::text AS البند,
           (SELECT count(*) FROM public.standalone_services) AS العدد
    UNION ALL SELECT 'عروض مقدّمي الخدمة',
           (SELECT count(*) FROM public.provider_services)
    UNION ALL SELECT 'الحجوزات (course_subscriptions)',
           (SELECT count(*) FROM public.course_subscriptions)
    UNION ALL SELECT 'الجلسات',
           (SELECT count(*) FROM public.sessions)
    UNION ALL SELECT 'طلبات الأبناء (dependent_requests)',
           (SELECT count(*) FROM public.dependent_requests)
  ) y

) t ORDER BY القسم, البند;
