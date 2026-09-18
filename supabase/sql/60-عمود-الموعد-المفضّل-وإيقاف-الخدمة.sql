-- ============================================================
-- 60 — عمودان جديدان: الموعد المفضّل للحجز، وإيقاف الخدمة
-- ============================================================
--
-- ليه الملف ده:
--
-- (1) `course_subscriptions.preferred_slot`
--
--     معالج الحجز بيخلّي العميل يختار موعد أسبوعي ثابت في الخطوة التانية
--     — ويمنعه من إنه يكمّل من غير ما يختار. بس الاختيار ده **مبيخرجش
--     من المتصفح أصلًا**: الصفحة بتودّيه على صفحة التأكيد بالباقة
--     والمدرب وبس، ومفيش عمود في الجدول يستقبله.
--
--     ولما الإدارة بتأكد الدفع، الجلسات بتتولّد من **أول ميعاد فاضي**
--     في جدول المدرب الأسبوعي. يعني العميل يختار الثلاثاء ٦م ويتجدول
--     الأحد ٤م، وهو شايف في ملخص الحجز إن موعده الثلاثاء.
--
--     العمود ده بيخزّن اختياره، والتوليد بيبقى منه.
--
--     الشكل: {"day": "tuesday", "time": "18:00"} — نفس شكل الميعاد في
--     `instructors.weekly_schedule`. فاضي = العميل ما اختارش (حجز قديم،
--     أو مدرب بلا جدول)، والتوليد بيرجع للسلوك الحالي.
--
-- (2) `standalone_services.is_active`
--
--     قاعدة المشروع: لا حذف نهائي من واجهة الويب — الإيقاف بدل الحذف.
--     لكن `deleteStandaloneService` بتعمل DELETE حقيقي، ومفيش عمود
--     يسمح بالبديل. العمود ده بيخلّي الإيقاف ممكن.
--
--     الافتراضي `true` عشان كل الخدمات الموجودة تفضل ظاهرة زي ما هي.
--
-- **مفيش أي صف بيتغيّر أو يتمسح.** العمودين إضافة بحتة، والكود الحالي
-- مبيقراش منهم فمفيش سلوك بيتغيّر قبل ما الكود يتحدّث.
-- ============================================================

BEGIN;

ALTER TABLE public.course_subscriptions
  ADD COLUMN IF NOT EXISTS preferred_slot jsonb;

COMMENT ON COLUMN public.course_subscriptions.preferred_slot IS
  'الموعد الأسبوعي اللي العميل اختاره وقت الحجز: {"day":"tuesday","time":"18:00"}. فاضي = يتولّد من جدول المدرب.';

ALTER TABLE public.standalone_services
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.standalone_services.is_active IS
  'خدمة موقوفة تختفي من الموقع ومن قوائم الطلب، وطلباتها القديمة تفضل زي ما هي.';

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  t.الجدول,
  t.العمود,
  CASE WHEN c.column_name IS NULL THEN 'ناقص ✗' ELSE 'موجود ✓' END AS الحالة,
  COALESCE(c.data_type, '—')                                        AS النوع,
  COALESCE(c.column_default, '—')                                   AS الافتراضي
FROM (VALUES
  ('course_subscriptions', 'preferred_slot'),
  ('standalone_services',  'is_active')
) AS t(الجدول, العمود)
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name   = t.الجدول
 AND c.column_name  = t.العمود;

-- ============================================================
-- التراجع — شيل علامات التعليق وشغّل لو عايز تلغي الملف ده
-- ============================================================
-- BEGIN;
-- ALTER TABLE public.course_subscriptions DROP COLUMN IF EXISTS preferred_slot;
-- ALTER TABLE public.standalone_services  DROP COLUMN IF EXISTS is_active;
-- COMMIT;
