-- ============================================================
-- 62 — تشخيص: الستة صفوف واحدًا واحدًا (قراءة فقط)
-- ============================================================
--
-- ⚠️ الملف ده **مبيغيّرش حاجة**. قراءة فقط.
--
-- ملف 61 طلّع الصورة الكبيرة: 6 صفوف في `instructor_services`، و11 في
-- `provider_services`، ومفيش مدرب بلا صف مقدّم خدمة، ومفيش تعارض في
-- السعر المعتمد، ومفيش طلبات معلّقة.
--
-- بس فيه سؤال 61 **ما جاوبش عليه**: القسم ٣ فيه كان بيقارن الصفوف
-- الموجودة في الجدولين **مع بعض** بس. فاضل نعرف كل صف من الستة:
--
--   • له نظير في `provider_services`؟
--   • لو له — الحالة والسعر والتفعيل متطابقين ولا لأ؟
--     (61 قارن السعر المعتمد وحده، ما قارنش `status` ولا `is_active`)
--   • لو مالوش — ده اللي ملف النقل هيعمله.
--
-- النتيجة بتحدد ملف 63: هل ينقل صفوف فعلًا، ولا البيانات متطابقة خلاص
-- والشغل كله بيبقى في الكود.
-- ============================================================

SELECT
  COALESCE(i.display_name, 'مدرب ' || i_s.instructor_id::text)  AS المدرب,
  COALESCE(ss.name, i_s.service_id::text)                       AS الخدمة,

  i_s.status                                                    AS حالة_عند_المدرب,
  i_s.approved_price                                            AS سعر_عند_المدرب,
  i_s.is_active                                                 AS مفعّل_عند_المدرب,

  COALESCE(p_s.status, '—')                                     AS حالة_عند_المقدّم,
  p_s.approved_price                                            AS سعر_عند_المقدّم,
  p_s.is_active                                                 AS مفعّل_عند_المقدّم,

  CASE
    WHEN sp.id IS NULL THEN '✗ المدرب مالوش صف مقدّم خدمة'
    WHEN p_s.id IS NULL THEN '⬅ ناقص — ملف 63 هينقله'
    WHEN i_s.status          IS DISTINCT FROM p_s.status
      OR i_s.approved_price  IS DISTINCT FROM p_s.approved_price
      OR i_s.is_active       IS DISTINCT FROM p_s.is_active
      THEN '⚠️ موجود بس مختلف — محتاج قرار'
    ELSE '✓ متطابق — مفيش نقل'
  END                                                           AS الخلاصة

FROM public.instructor_services i_s
LEFT JOIN public.instructors         i  ON i.id  = i_s.instructor_id
LEFT JOIN public.standalone_services ss ON ss.id = i_s.service_id
LEFT JOIN public.service_providers   sp ON sp.instructor_id = i_s.instructor_id
LEFT JOIN public.provider_services   p_s
       ON p_s.provider_id = sp.id
      AND p_s.service_id  = i_s.service_id
ORDER BY 1, 2;
