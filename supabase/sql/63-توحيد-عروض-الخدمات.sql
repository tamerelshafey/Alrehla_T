-- ============================================================
-- 63 — توحيد عروض الخدمات في `provider_services`
-- ============================================================
--
-- المشكلة:
--
--   جدولان بأعمدة متطابقة حرفيًا ما عدا العمود الأول، والاثنان مكتوب
--   فيهما ومقروء منهما في نفس الوقت:
--
--     • `instructor_services` (instructor_id) — لوحة المدرب، وقسم
--       الخدمات في صفحة المدرب بالإدارة، وعدّاد «مركز المهام العاجلة»
--     • `provider_services`   (provider_id)   — اختيار العميل لمقدّم
--       الخدمة، و`createServiceOrder`، أي **مسار البيع كله**
--
--   ومفيش ولا سطر في المشروع بينقل بين الاتنين. فعرض بيتعمل ويتعتمد من
--   مسار المدرب **لا يظهر للعميل ولا يمكن طلبه أبدًا**.
--
--   وده مش كلام نظري — تشخيص ملف 62 على قاعدتك طلّع الحالة دي بالظبط:
--
--     المدرب الأول / «فيديو قصة» — approved, 500, مفعّل
--     ومالوش أي صف في `provider_services`.
--
--   والخمسة التانيين متطابقين في الجدولين حرفيًا (الحالة والسعر
--   والتفعيل)، فمش محتاجين أي حاجة.
--
-- القرار: `provider_services` هو المعتمد. مش لأنه الأحدث، لكن لأنه
-- الوحيد اللي البيع بيمر منه، ولأن `service_providers.kind` بيسمح
-- بمقدّم خدمة مش مدرب — «المنصة» نفسها أو مستقل — وده مبني وشغّال
-- (عندك فعلًا صف `platform` واحد وعليه عروض). اعتماد
-- `instructor_services` كان معناه إما هدم ده كله، أو إضافة `provider_id`
-- ليه — يعني يبقى `provider_services` باسم تاني.
--
-- الملف ده بيعمل حاجة واحدة:
--
--   ينسخ لـ`provider_services` كل عرض في `instructor_services` مالوش
--   نظير هناك، بنفس الحالة والسعر والتفعيل، تحت صف مقدّم الخدمة بتاع
--   المدرب.
--
--   **مبيمسحش ولا يعدّل ولا صف قايم.** `instructor_services` بيفضل زي
--   ما هو بالكامل — الكود بس هو اللي بيبطّل يقرا منه.
--
-- الصفوف المنقولة بتتعلّم في `admin_notes` عشان التراجع يبقى دقيق.
--
-- ⚠️ لو الملف وقع برسالة فيها «duplicate key»، يبقى في قيد فريد على
--    (provider_id, service_id) وفي صف مكرر — بلّغني قبل أي حاجة تانية.
-- ============================================================

BEGIN;

INSERT INTO public.provider_services (
  provider_id,
  service_id,
  requested_price,
  approved_price,
  status,
  is_active,
  admin_notes
)
SELECT
  sp.id,
  i_s.service_id,
  i_s.requested_price,
  i_s.approved_price,
  i_s.status,
  i_s.is_active,
  -- علامة مصدر: منها بيتعرف التراجع، وبتفضل توثيق دايم للصف.
  COALESCE(i_s.admin_notes || ' · ', '') || '[منقول من instructor_services — ملف 63]'
FROM public.instructor_services i_s
JOIN public.service_providers sp
  ON sp.instructor_id = i_s.instructor_id
WHERE NOT EXISTS (
  SELECT 1
  FROM public.provider_services p
  WHERE p.provider_id = sp.id
    AND p.service_id  = i_s.service_id
);

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
--
-- المتوقع: كل الصفوف تبقى «✓ موجود في المعتمد».
-- عمود «المصدر» بيقول أنهي صف اتنقل دلوقتي وأنهي كان موجود من الأول.
-- ============================================================
SELECT
  COALESCE(i.display_name, i_s.instructor_id::text)       AS المدرب,
  COALESCE(ss.name, i_s.service_id::text)                 AS الخدمة,
  i_s.status                                              AS الحالة,
  i_s.approved_price                                      AS السعر_المعتمد,
  CASE WHEN p_s.id IS NULL
       THEN '✗ لسه ناقص — بلّغني'
       ELSE '✓ موجود في المعتمد' END                      AS النتيجة,
  CASE WHEN p_s.admin_notes LIKE '%[منقول من instructor_services — ملف 63]%'
       THEN 'اتنقل في الملف ده'
       ELSE 'كان موجود من قبل' END                        AS المصدر
FROM public.instructor_services i_s
LEFT JOIN public.instructors         i   ON i.id  = i_s.instructor_id
LEFT JOIN public.standalone_services ss  ON ss.id = i_s.service_id
LEFT JOIN public.service_providers   sp  ON sp.instructor_id = i_s.instructor_id
LEFT JOIN public.provider_services   p_s ON p_s.provider_id = sp.id
                                        AND p_s.service_id  = i_s.service_id
ORDER BY 1, 2;

-- ============================================================
-- التراجع — شيل علامات التعليق وشغّل لو عايز تلغي الملف ده
--
-- بيمسح الصفوف اللي الملف ده عملها وبس، بعلامة المصدر.
-- الصفوف اللي كانت موجودة قبله مبتتلمسش.
-- ============================================================
-- BEGIN;
-- DELETE FROM public.provider_services
-- WHERE admin_notes LIKE '%[منقول من instructor_services — ملف 63]%';
-- COMMIT;
