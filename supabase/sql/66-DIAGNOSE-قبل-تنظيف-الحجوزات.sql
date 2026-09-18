-- ============================================================
-- 66 — تشخيص: ما الذي سيُمسح لو نظّفنا الحجوزات (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيمسحش حاجة**. قراءة فقط. شغّله قبل أي تنظيف.
--
-- ليه الملف ده قبل ملف الحذف:
--
--   «نظّف الحجوزات السابقة» جملة واضحة في الكلام، مش واضحة في القاعدة.
--   الحجز مربوط بيه ستة جداول، وواحد منهم (`reviews`) فيه بيانات
--   **مش بتاعة الحجز** — تقييمات خدمات إبداعية مالهاش أي علاقة.
--
--   والحذف من القاعدة نهائي: مفيش سلة مهملات ومفيش تراجع. فالملف ده
--   بيوريك الأعداد الحقيقية قبل ما تقرر.
--
-- اللي بيتعرض:
--   1. أعداد كل جدول مرتبط بالحجوزات
--   2. الحجوزات نفسها واحدًا واحدًا: الحالة، الدفع، عدد الجلسات
--   3. تقييمات مربوطة بحجز — دي اللي محتاجة قرار مستقل
--   4. جداول **مش** في نطاق التنظيف (للتوضيح إنها آمنة)
-- ============================================================

-- ------------------------------------------------------------
-- 1) الأعداد
-- ------------------------------------------------------------
SELECT '1. الأعداد'::text AS القسم, البند, العدد::text AS القيمة
FROM (
  SELECT 'اشتراكات الباقات (الحجوزات نفسها)'::text AS البند,
         (SELECT count(*) FROM public.course_subscriptions) AS العدد
  UNION ALL SELECT 'الجلسات',
         (SELECT count(*) FROM public.sessions)
  UNION ALL SELECT 'تقارير الجلسات (حضور + تقرير المدرب)',
         (SELECT count(*) FROM public.session_reports)
  UNION ALL SELECT 'رسائل الجلسات',
         (SELECT count(*) FROM public.session_messages)
  UNION ALL SELECT 'مرفقات الجلسات',
         (SELECT count(*) FROM public.session_attachments)
  UNION ALL SELECT 'تقييمات مربوطة بحجز (booking_id مليان)',
         (SELECT count(*) FROM public.reviews WHERE booking_id IS NOT NULL)
) t

UNION ALL

-- ------------------------------------------------------------
-- 2) الحجوزات واحدًا واحدًا
-- ------------------------------------------------------------
SELECT '2. الحجوزات',
       COALESCE(p.name, 'باقة محذوفة')
         || ' · ' || cs.status
         || ' · ' || COALESCE(cs.payment_reference, 'بلا رقم مرجعي'),
       (SELECT count(*) FROM public.sessions s
        WHERE s.course_subscription_id = cs.id)::text || ' جلسة'
FROM public.course_subscriptions cs
LEFT JOIN public.creative_writing_packages p ON p.id = cs.package_id

UNION ALL

-- ------------------------------------------------------------
-- 3) تقييمات مربوطة بحجز — قرار مستقل
-- ------------------------------------------------------------
SELECT '3. تقييمات على حجوزات',
       'تقييم ' || r.rating::text || '/5 · '
         || COALESCE(left(r.comment, 40), 'بلا تعليق'),
       CASE WHEN r.is_hidden THEN 'مخفي' ELSE 'ظاهر' END
FROM public.reviews r
WHERE r.booking_id IS NOT NULL

UNION ALL

-- ------------------------------------------------------------
-- 4) خارج نطاق التنظيف — آمنة، للتوضيح فقط
-- ------------------------------------------------------------
SELECT '4. خارج النطاق (آمنة)'::text, البند, العدد::text
FROM (
  SELECT 'طلبات الخدمات الإبداعية (service_orders)'::text AS البند,
         (SELECT count(*) FROM public.service_orders) AS العدد
  UNION ALL SELECT 'نصوص معرض الطلاب (portfolio_documents)',
         (SELECT count(*) FROM public.portfolio_documents)
  UNION ALL SELECT 'عروض مقدّمي الخدمة (provider_services)',
         (SELECT count(*) FROM public.provider_services)
  UNION ALL SELECT 'الباقات (creative_writing_packages)',
         (SELECT count(*) FROM public.creative_writing_packages)
  UNION ALL SELECT 'المدربون (instructors)',
         (SELECT count(*) FROM public.instructors)
  UNION ALL SELECT 'حسابات المستخدمين (user_profiles)',
         (SELECT count(*) FROM public.user_profiles)
) t2

ORDER BY 1, 2;
