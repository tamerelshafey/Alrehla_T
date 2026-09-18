-- ============================================================
-- 72 — المشارك في طلب الخدمة الإبداعية
-- ============================================================
--
-- المشكلة:
--
--   حجز الباقة بيعرف مين المشارك: `course_subscriptions` فيها
--   `participant_type` و`child_id`، والعميل بيختار في صفحة التأكيد
--   «أنا» ولا «أحد أفراد العائلة».
--
--   **طلب الخدمة الإبداعية مفيهوش ده إطلاقًا.** `service_orders` فيها
--   `buyer_profile_id` وبس — مين دفع. فولي أمر بيطلب «مراجعة نص» لابنه
--   بيتسجّل الطلب باسمه هو، ومقدّم الخدمة اللي هينفّذ **مايعرفش النص
--   ده لمين ولا سنه كام** — وده فرق كبير في خدمة تربوية للأطفال.
--
--   وصفحة الطلب نفسها ما كانش فيها أي اختيار أصلًا.
--
-- اللي الملف ده بيعمله:
--
--   عمودين على `service_orders` بنفس شكل `course_subscriptions`
--   بالظبط — عشان المفهوم يبقى واحد في المسارين، مش شكلين مختلفين
--   لنفس الحاجة.
--
--     participant_type : 'self' | 'child'  — الافتراضي 'self'
--     child_id         : معرّف فرد العائلة، فاضي لما الطلب للمشتري نفسه
--
--   الطلبات القديمة كلها بتبقى `'self'` — وده صحيح، لأنها اتعملت
--   والاختيار مكانش موجود أصلًا.
--
-- ⚠️ التحقق إن فرد العائلة ده **فعلًا تابع للمشتري** بيتم في الكود
--    (`createServiceOrder`) وفي القيد اللي تحت. من غيره أي حد يقدر
--    يبعت رقم طفل مش بتاعه.
--
-- **مفيش صف بيتغيّر.** العمودين إضافة، والقديم بياخد الافتراضي.
-- ============================================================

BEGIN;

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS participant_type text NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS child_id text;

-- القيم المسموحة، بنفس قاعدة الاشتراكات.
ALTER TABLE public.service_orders
  DROP CONSTRAINT IF EXISTS service_orders_participant_type_check;
ALTER TABLE public.service_orders
  ADD CONSTRAINT service_orders_participant_type_check
  CHECK (participant_type IN ('self', 'child'));

-- اتساق: 'child' لازم معاها رقم فرد، و'self' لازم من غيره.
-- ده بيمنع صف نصّه مظبوط ونصّه لأ — زي طلب مكتوب عليه «لابني» وبلا ابن.
ALTER TABLE public.service_orders
  DROP CONSTRAINT IF EXISTS service_orders_participant_consistency;
ALTER TABLE public.service_orders
  ADD CONSTRAINT service_orders_participant_consistency
  CHECK (
    (participant_type = 'self'  AND child_id IS NULL)
    OR
    (participant_type = 'child' AND child_id IS NOT NULL)
  );

COMMENT ON COLUMN public.service_orders.participant_type IS
  'لمين الخدمة: self = المشتري نفسه، child = فرد من عائلته.';
COMMENT ON COLUMN public.service_orders.child_id IS
  'فرد العائلة المستفيد من الخدمة. فاضي لما الطلب للمشتري نفسه.';

COMMIT;

-- ============================================================
-- تأكيد — استعلام واحد
-- ============================================================
SELECT
  t.العمود,
  CASE WHEN c.column_name IS NULL THEN 'ناقص ✗' ELSE 'موجود ✓' END AS الحالة,
  COALESCE(c.data_type, '—')                                       AS النوع,
  COALESCE(c.column_default, '—')                                  AS الافتراضي,
  (SELECT count(*)::text FROM pg_constraint pc
    JOIN pg_class pcl ON pcl.oid = pc.conrelid
   WHERE pcl.relname = 'service_orders'
     AND pc.conname LIKE 'service_orders_participant%')            AS عدد_القيود
FROM (VALUES ('participant_type'), ('child_id')) AS t(العمود)
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name   = 'service_orders'
 AND c.column_name  = t.العمود;

-- ============================================================
-- التراجع — شيل علامات التعليق وشغّل لو عايز تلغي الملف ده
-- ============================================================
-- BEGIN;
-- ALTER TABLE public.service_orders
--   DROP CONSTRAINT IF EXISTS service_orders_participant_consistency,
--   DROP CONSTRAINT IF EXISTS service_orders_participant_type_check;
-- ALTER TABLE public.service_orders
--   DROP COLUMN IF EXISTS participant_type,
--   DROP COLUMN IF EXISTS child_id;
-- COMMIT;
