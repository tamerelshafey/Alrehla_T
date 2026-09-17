-- ============================================================
-- 55 — تقسيم الباقات لتلات مسارات
-- ============================================================
--
-- الوضع الحالي:
--   صفحة الباقات بتقسّم بالفئة العمرية بس — مسارين: «دون 12» و«12 فأكثر».
--   فالأربع باقات الكبار كلهم في كومة واحدة، رغم إن اتنين منهم تأسيس
--   واتنين تخصص.
--
-- اقتراحك:
--   تلات مسارات:
--     • مسار التأسيس — دون 12:      الكلمات الذهبية + السطور السحرية
--     • مسار اليافعين والكبار — 12+: الشرارة الأولى + صياغة الأثر
--     • مسار التخصص — 12+:          صانع الحكاية + رحلتي نحو الحكاية
--
-- ليه عمود جديد مش تقسيم بالسن:
--   المسارين التانيين **نفس الفئة العمرية**، فالسن ما بيفرّقش بينهم.
--   والتقسيم بالاسم في الكود معناه إن أي باقة جديدة تضيفها ما يكونش لها
--   مكان. العمود بيخلي المسار خاصية في الباقة نفسها، تتحدد من شاشة
--   التعديل زي أي بيانات تانية.
--
-- الفئة العمرية بتفضل زي ما هي: بتظهر كتوضيح على الكارت.
--
-- الباقات الست بتتوزّع بأسمائها الحالية. أي باقة جديدة بتفضل بلا مسار
-- لحد ما تحدده — وبتظهر في مجموعة «باقات أخرى» بدل ما تختفي.
-- ============================================================

BEGIN;

ALTER TABLE public.creative_writing_packages
  ADD COLUMN IF NOT EXISTS track text;

ALTER TABLE public.creative_writing_packages
  DROP CONSTRAINT IF EXISTS creative_writing_packages_track_check,
  ADD CONSTRAINT creative_writing_packages_track_check
  CHECK (track IS NULL OR track IN ('foundation', 'youth', 'specialization'));

COMMENT ON COLUMN public.creative_writing_packages.track IS
  'مسار الباقة: تأسيس / يافعين وكبار / تخصص. مستقل عن الفئة العمرية.';

-- التوزيع حسب الأسماء الحالية في القاعدة.
UPDATE public.creative_writing_packages
   SET track = 'foundation'
 WHERE name IN ('الكلمات الذهبية', 'السطور السحرية');

UPDATE public.creative_writing_packages
   SET track = 'youth'
 WHERE name IN ('الشرارة الأولى', 'صياغة الأثر');

UPDATE public.creative_writing_packages
   SET track = 'specialization'
 WHERE name IN ('صانع الحكاية', 'رحلتي نحو الحكاية');

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  CASE track
    WHEN 'foundation'     THEN 'مسار التأسيس'
    WHEN 'youth'          THEN 'مسار اليافعين والكبار'
    WHEN 'specialization' THEN 'مسار التخصص'
    ELSE 'بلا مسار ✗'
  END AS المسار,
  name       AS الباقة,
  age_group  AS الفئة_العمرية,
  price      AS السعر,
  coalesce(session_duration, '— ناقصة ✗') AS مدة_الجلسة
FROM public.creative_writing_packages
WHERE is_active
ORDER BY
  CASE track WHEN 'foundation' THEN 1 WHEN 'youth' THEN 2
             WHEN 'specialization' THEN 3 ELSE 4 END,
  price;
